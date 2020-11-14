<?php

namespace App\Http\Controllers;

use App\ChatBoxes;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatBoxController extends Controller
{

    public function buildConnection(Request $request){
        $vendor_id = $request->get('vendor_id');
        $customer_id = $request->get('customer_id');
        if($vendor_id == '' || $vendor_id == null || $customer_id == '' || $customer_id == null){
            return 'fail';
        }
        if(User::find($request->get('customer_id'))->current_role != 'customer'){
            return 'not a customer';
        }

        $chat_boxes_receiver = ChatBoxes::where('sender_id', $customer_id)->where('receiver_id', $vendor_id)->get()->toArray();
        if( empty($chat_boxes_receiver) ){
            //顧客寄送的聊天室窗的預設內容
            $notice_deal_the_contact_data = array('sender_id' => $customer_id, 'receiver_id' => $vendor_id, 'read_at' => null, 'content' => '您好，我對您的課程有興趣，所以想跟您聯繫。');
            ChatBoxes::create($notice_deal_the_contact_data);

            //店家寄送的聊天室窗的預設內容
            $notice_deal_the_contact_data = array('sender_id' => $vendor_id, 'receiver_id' => $customer_id, 'read_at' => null, 'content' => '您好，謝謝您，若相關課程有問題，歡迎跟我聯繫。');
            ChatBoxes::create($notice_deal_the_contact_data);

            return 'build';
        }else{
            return 'exist';
        }

    }


    public function getUserData(Request $request){

        $user = User::find($request->get('user_id'));
        $role_to_chinese = array('vendor' => '店家', 'customer' => '顧客');
        if($user->current_role != '' || $user->current_role != null){
            $role = $role_to_chinese[$user->current_role];
        }else{
            $role = '顧客';
        }
        $current_user_id = Auth::user()->id;
        if(!$current_user_id){
            return 'fail';
        }
        $result_chat_boxes = array();
        $is_more = 'N';
        $chat_boxes = array();
        $skip = 0;
        if($request->get('skip')){
            $skip = $request->get('skip');
        }

        $count_message = 0;
        if($request->get('count_message')){
            $count_message = $request->get('count_message');
        }

        $chat_boxes_sender = ChatBoxes::whereIn('sender_id', [$user->id, $current_user_id])->whereIn('receiver_id', [$current_user_id, $user->id] )->orderBy('created_at', 'DESC')->skip($skip)->take($count_message)->get()->toArray();

        if( !empty(ChatBoxes::whereIn('sender_id', [$user->id, $current_user_id])->whereIn('receiver_id', [$current_user_id, $user->id] )->orderBy('created_at', 'DESC')->skip($skip+10)->take($count_message)->get()->toArray() ) ){
            $is_more = 'Y';
        }

        if(is_array($chat_boxes_sender)){
            foreach ($chat_boxes_sender as $single_box){
                array_push($chat_boxes, $single_box);
            }
        }

        //因為前台顯示需要從舊到新，而這邊批次取值是需要從新開始，所以這邊倒反順序一次
        $result_chat_boxes = $chat_boxes;

        $count_unread_msg = 0;

        if($is_more=='Y'){
            $chat_boxes_sender = ChatBoxes::whereIn('sender_id', [$user->id, $current_user_id])->whereIn('receiver_id',[$current_user_id, $user->id] )->orderBy('created_at', 'DESC')->get()->toArray();
            if(is_array($chat_boxes_sender)){
                $chat_boxes = array();
                foreach ($chat_boxes_sender as $single_box){
                    array_push($chat_boxes, $single_box);
                }
            }
        }
        $result_count_chat_boxes = $chat_boxes;

        foreach($chat_boxes as $key => $chat_box){
            $tmp_date = new \DateTime($chat_box['created_at']);
            $tmp_date->modify('+8 hours');
            $result_count_chat_boxes[$key]['created_at'] = $tmp_date->format('Y/m/d H:i:s');
            if( ($result_count_chat_boxes[$key]['receiver_id'] == $current_user_id) && ($result_count_chat_boxes[$key]['read_at'] == '' || $result_count_chat_boxes[$key]['read_at'] == null)){
                $count_unread_msg +=1;
            }
        }

        //訊息框依照時間排序
        for($i=0; $i<sizeof($result_chat_boxes)-1; $i++){
            for($j=$i; $j<sizeof($result_chat_boxes); $j++){
                if(strtotime($result_chat_boxes[$i]['created_at']) > strtotime($result_chat_boxes[$j]['created_at'])){
                    $tmp_chat_boxes = $result_chat_boxes[$i];
                    $result_chat_boxes[$i] = $result_chat_boxes[$j];
                    $result_chat_boxes[$j] = $tmp_chat_boxes;
                }
            }
        }

        //讓時間加八小時
        $tmp_result_chat_boxes_for_time = $result_chat_boxes;
        for($i=0;$i<sizeof($tmp_result_chat_boxes_for_time);$i++){
            $tmp_time = new \DateTime($tmp_result_chat_boxes_for_time[$i]['created_at']);
            $tmp_time->modify('+8 hours');
            $result_chat_boxes[$i]['created_at'] = $tmp_time->format('Y/m/d H:i:s');
        }

        if($user->isOnline()){
            $is_online = 'Y';
        }else{
            $is_online = 'N';
        }
        $data = [
            'name' => $user->name,
            'role' => $role,
            'is_online' => $is_online,
            'is_more' => $is_more,
            'count_unread_msg' => $count_unread_msg,
            'chat_boxes' => $result_chat_boxes,
        ];
        return $data;

    }


    public function update(Request $request){
        $data = [
            'sender_id' => $request->get('sender_id'),
            'receiver_id' => $request->get('receiver_id'),
            'content' =>  strip_tags(htmlspecialchars_decode( $request->get('content'))),
        ];

        if(
            $data['sender_id'] != '' &&
            $data['receiver_id'] != ''
        ){

            $chat_box = ChatBoxes::create($data);

            $tmp_date = new \DateTime($chat_box->created_at);
            $tmp_date->modify('+8 hours');
            $data += ['created_at' => $tmp_date->format('Y/m/d H:i:s')];


            //這裡是在回覆時，要已讀對方傳過來的訊息，所以跟上面的對象相反。
            $sender_check_chat_box = ChatBoxes::where('sender_id', $data['receiver_id'])->where('receiver_id', $data['sender_id']);
            $now_date = new \DateTime('now');
            $now_date->modify('+8 hours');
            if(sizeof($sender_check_chat_box->get()->toArray()) > 0){
                $sender_check_chat_box->update(['read_at' => $now_date->format('Y/m/d H:i:s')]);
            }

            return $data;
        }else{
            return 'fail';
        }
    }


    public function readMessage(Request $request){

        if(User::find($request->get('user_id'))){
            $current_user_id = Auth::user()->id;
            $now_date = new \DateTime('now');
            $now_date->modify('+8 hours');
            $chat_boxes = ChatBoxes::where('sender_id', $request->get('user_id'))->where('receiver_id', $current_user_id)->where('read_at', null)->get();
            foreach ($chat_boxes as $chat_box){
                $chat_box->update(['read_at' => $now_date->format('Y/m/d H:i:s')]);
            }
            return 'read';
        }else{
            return 'fail';
        }

    }


    public function searchUser(Request $request){
        $user_id = $request->get('user_id');
        if($user_id){
            $unread_user_id = array();
            $result_user_data = array();
            //抓目前跟登入的使用者在聊天的是誰
            //因為還要算未讀的關係，所以才會這樣取receiver_id和sender_id，不然原本其實兩種方向都可以，因為一開始建立聯繫時，雙方都有溝通過。
            $chat_boxes = ChatBoxes::where('receiver_id', $user_id)->orderBy('created_at', 'DESC')->get()->toArray();
            $result_receiver_id = array();
            $count_unread = array();
            foreach ($chat_boxes as $chat_box){
                array_push($result_receiver_id, $chat_box['sender_id']);
                if($chat_box['read_at'] == '' || $chat_box['read_at'] == null){
                    array_push($unread_user_id, $chat_box['sender_id']);
                    if(!isset($count_unread[$chat_box['sender_id']])){
                        $count_unread[$chat_box['sender_id']] = 1;
                    }else{
                        $count_unread[$chat_box['sender_id']] +=1;
                    }
                }
            }
            $result_receiver_id = array_unique($result_receiver_id);
            $unread_user_id = array_unique($unread_user_id);
            if($request->get('search')!=''){
                foreach($result_receiver_id as $receiver_id){
                    $single_user_array = array();
                    $user = User::find($receiver_id);
                    if(strpos(strtolower($user->name), strtolower($request->get('search')))!==false){
                        if($user->isOnline()){
                            $is_online = 'Y';
                        }else{
                            $is_online = 'N';
                        }

                        if(in_array($receiver_id, $unread_user_id)){
                            $is_read = 'N';
                        }else{
                            $is_read = 'Y';
                        }

                        if($user->photo != '' && $user->photo != null){
                            $photo = $user->photo;
                        }else{
                            $photo = '';
                        }

                        if(isset($count_unread[$receiver_id])){
                            $count_unread_num = $count_unread[$receiver_id];
                        }else{
                            $count_unread_num = 0;
                        }
                        $single_user_array = ['id' => $receiver_id, 'name' => $user->name, 'is_online' => $is_online, 'is_read' => $is_read, 'photo' => $photo, 'count_unread_num' => $count_unread_num];
                        array_push($result_user_data, $single_user_array);
                    }
                }
            }else{
                //如果是空白字元，就顯示所有
                foreach($result_receiver_id as $receiver_id){
                    $single_user_array = array();
                    $user = User::find($receiver_id);
                    if($user->isOnline()){
                        $is_online = 'Y';
                    }else{
                        $is_online = 'N';
                    }
                    if(in_array($receiver_id, $unread_user_id)){
                        $is_read = 'N';
                    }else{
                        $is_read = 'Y';
                    }

                    if($user->photo != '' && $user->photo != null){
                        $photo = $user->photo;
                    }else{
                        $photo = '';
                    }

                    if(isset($count_unread[$receiver_id])){
                        $count_unread_num = $count_unread[$receiver_id];
                    }else{
                        $count_unread_num = 0;
                    }
                    $single_user_array = ['id' => $receiver_id, 'name' => $user->name, 'is_online' => $is_online, 'is_read' => $is_read, 'photo' => $photo, 'count_unread_num' => $count_unread_num];
                    array_push($result_user_data, $single_user_array);
                }

            }

            return $result_user_data;

        }else{
            return 'fail';
        }

    }


    public function checkUserOnline(Request $request){
        if($request->get('user_id')){
            return (User::find($request->get('user_id'))->isOnline())?'Y':'N';
        }else{
            return 'fail';
        }
    }


    public function checkLastReadMessage(Request $request){
        $chat = ChatBoxes::where('sender_id', $request->get('sender_id'))->where('created_at', $request->get('created_at'))->where('read_at', '!=', null)->get();
        if(sizeof($chat)>0){
            return 'Y';
        }else{
            return 'N';
        }
    }


    //主要自動更新右側聊天室窗的function
    public function checkChatBtn(Request $request){
        $user_id = $request->get('user_id');
        if($user_id) {
            $unread_user_id = array();
            $result_user_data = array();
            //抓目前跟登入的使用者在聊天的是誰
            //因為還要算未讀的關係，所以才會這樣取receiver_id和sender_id，不然原本其實兩種方向都可以，因為一開始建立聯繫時，雙方都有溝通過。
            $chat_boxes = ChatBoxes::where('receiver_id', $user_id)->orderBy('created_at', 'DESC')->get()->toArray();
            $result_receiver_id = array();
            $count_unread = array();
            foreach ($chat_boxes as $chat_box) {
                array_push($result_receiver_id, $chat_box['sender_id']);
                if ($chat_box['read_at'] == '' || $chat_box['read_at'] == null) {
                    array_push($unread_user_id, $chat_box['sender_id']);
                    if (!isset($count_unread[$chat_box['sender_id']])) {
                        $count_unread[$chat_box['sender_id']] = 1;
                    } else {
                        $count_unread[$chat_box['sender_id']] += 1;
                    }
                }
            }
            $result_receiver_id = array_unique($result_receiver_id);

            foreach ($result_receiver_id as $receiver_id) {
                if (isset($count_unread[$receiver_id])) {
                    $count_unread_num = $count_unread[$receiver_id];
                } else {
                    $count_unread_num = 0;
                }
                if(in_array($receiver_id, $unread_user_id)){
                    $is_read = 'N';
                }else{
                    $is_read = 'Y';
                }
                $single_user_array = ['is_read' => $is_read, 'count_unread_num' => $count_unread_num];
                array_push($result_user_data, $single_user_array);
            }
            return $result_user_data;
        }else{
            return 'fail';
        }

    }


    public function index(){}


    public function create(Request $request){}


    public function store(Request $request){}


    public function show(Request $request){}


    public function edit(Request $request){}


    public function destroy(Request $request){}
}
