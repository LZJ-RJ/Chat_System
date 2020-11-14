<?php
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

/**
 * 站內通訊
 */
Route::post('chat_box/build_connection', 'ChatBoxController@buildConnection')->name('chat_box.build_connection'); //同時為雙方建立聯繫
Route::post('chat_box/get_user_data', 'ChatBoxController@getUserData')->name('chat_box.get_user_data'); //取得與對象的聊天紀錄
Route::post('chat_box/update', 'ChatBoxController@update')->name('chat_box.update'); //提交訊息
Route::post('chat_box/read_message', 'ChatBoxController@readMessage')->name('chat_box.read_message'); //已讀訊息
Route::post('chat_box/search_user', 'ChatBoxController@searchUser')->name('chat_box.search_user'); //更新聊天室窗左側資料 (有在自動更新流程中)
Route::post('chat_box/check_user_online', 'ChatBoxController@checkUserOnline')->name('chat_box.check_user_online'); //確認線上狀態是否變更 (有在自動更新流程中)
Route::post('chat_box/check_last_read_message', 'ChatBoxController@checkLastReadMessage')->name('chat_box.check_last_read_message'); //確認最近是否有已讀訊息 (有在自動更新流程中)
Route::post('chat_box/check_chat_btn', 'ChatBoxController@checkChatBtn')->name('chat_box.check_chat_btn'); //更新該聊天視窗當下對象的已讀和未讀 (有在自動更新流程中)

