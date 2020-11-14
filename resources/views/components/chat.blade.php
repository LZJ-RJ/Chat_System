<?php
use App\ChatBoxes;
use App\User;
$current_user = Auth::user();
$chat_ids = array();
$unread_user_id = array();
$unread_user_id = array();
$count_unread = array();
if($current_user){
    $chat_boxes = ChatBoxes::where('receiver_id', $current_user->id)->orderBy('created_at', 'DESC')->get();
    foreach ($chat_boxes as $chat_box){
        array_push($chat_ids, $chat_box->sender_id);
        if($chat_box->read_at == '' || $chat_box->read_at == null){
            array_push($unread_user_id, $chat_box->sender_id);
            if(!isset($count_unread[$chat_box->sender_id])){
                $count_unread[$chat_box->sender_id] = 1;
            }else{
                $count_unread[$chat_box->sender_id] +=1;
            }
        }

    }
}
if(!empty($chat_ids)){
    $chat_ids = array_unique($chat_ids);
}

if(!empty($unread_user_id)){
    $unread_user_id = array_unique($unread_user_id);
}
?>
<div id="chatBox">
    <div class="chat-container">
        <div class="left" data-search-user-route="{{route('chat_box.search_user')}}" data-check-chat-btn-route="{{route('chat_box.check_chat_btn')}}">
            <div class="top">
                <input type="text" placeholder="{{trans('frontend.chat.search')}}" name="search">
                <a href="javascript:void(0);" class="search"><i class="fas fa-search text-primary"></i></a>
                <a href="javascript:void(0);" class="mini-btn"><i class="far fa-window-minimize"></i></a>
            </div>
            <ul class="people">
                @if(!empty($chat_ids))
                    @foreach($chat_ids as $chat_id)
                        <?php
                        $user = User::find($chat_id);
                        ?>
                        @if(!empty($user->toArray()))
                            <li class="person" data-user-id="{{$chat_id}}" data-count-message="10" data-skip-message="10">
                                <?php
                                if(isset($user->photo) && $user->photo!='' && $user->photo!=null){
                                    echo '<img class="text-align-center center-center" src="'.$user->photo.'"style="max-width: 60px;display: inline-flex; object-fit: cover;">';
                                }else{
                                    echo '<i class="fas fa-user-circle"></i>';
                                }
                                ?>
                                <span class="name">{{isset($user->name)?$user->name:''}}</span>
                                <?php
                                if(isset($unread_user_id ) && in_array($chat_id, $unread_user_id)){
                                    $tmp_count = '';
                                    if(isset($count_unread[$chat_id]) && $count_unread[$chat_id] > 0){
                                        $tmp_count = $count_unread[$chat_id];
                                    }
                                    echo '<span><i class="count_read fas fa-exclamation-circle text-yellow">'.$tmp_count.'</i></span>';
                                }

                                if($user->isOnline()){
                                    echo '<span class="time text-primary">'.trans('frontend.chat.onLine').'</span>';
                                    echo '<span class="online-round bg-primary"></span>';
                                }else{
                                    echo '<span class="time text-secondary">'.trans('frontend.chat.offLine').'</span>';
                                    echo '<span class="offline-round bg-secondary"></span>';
                                }
                                ?>
                            </li>
                        @endif
                    @endforeach
                @endif
            </ul>
        </div>
        <div class="right" data-get-user-data-route="{{route('chat_box.get_user_data')}}" data-read-message-route="{{route('chat_box.read_message')}}" data-current-target-status="" data-check-user-online-route="{{route('chat_box.check_user_online')}}"
             data-check-last-read-message="{{route('chat_box.check_last_read_message')}}">
            <div class="top">
                <a href="javascript:void(0);" class="back-btn d-md-none mr-4">
                    <i class="fas fa-arrow-left text-white"></i>
                </a><span>{{trans('frontend.chat.targetName')}}:<span class="name"></span></span>
                <a href="javascript:void(0);" class="mini-btn"><i class="far fa-window-minimize"></i></a>
            </div>
            <div class="conversation-start">
                <span>{{trans('frontend.chat.targetRole')}}:<span class="role"></span></span>
                <span class="current-target-status text-primary"></span>
            </div>
            <div class="chat">
{{--內容--}}
            </div>
            <div class="write">
                <textarea class="input-box" name="content" placeholder="{{trans('frontend.chat.inputMsg')}}" maxlength="100" rows="1"></textarea>
                <button class="btn btn-sm btn-secondary px-4 used-to-submit" data-sender-id="{{isset($current_user)?$current_user->id:''}}" data-receiver-id="">
                    {{trans('frontend.chat.submit')}}</button>
            </div>
        </div>
    </div>
</div>
