$(document).ready(function () {

    window.onload = function () {
        //透過網址判斷站內通知有無訊息，如果有就自動打開。
        if (location.search.split('?')[1] && location.search.includes('openChat')) {
            $('.mini-btn, .chat-btn').click();
        }
    }

    $(document).on('click', '.contact-vendor', function (e) {
        var contact_customer_id = $(this).attr('data-customer-id');
        var contact_vendor_id = $(this).attr('data-vendor-id');
        if($(this).attr('data-customer-id') != $(this).attr('data-vendor-id')){
            $.ajax({
                url : location.origin + '/chat_box/build_connection',
                method: 'post',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                data: {
                    'customer_id' : contact_customer_id,
                    'vendor_id' : contact_vendor_id
                }, success(msg) {
                    if(msg == 'build'){
                        alert('已成功建立聯繫');
                        if(!location.href.includes('openChat')){
                            if(location.search == undefined || location.search == ''){
                                window.location = location.href + '?action=openChat';
                            }else{
                                window.location = location.href + 'action=openChat';
                            }
                        }else{
                            location.reload();
                        }
                    }else if(msg == 'exist'){
                        if(!$('.chat-container').hasClass('sideActive')){
                            $('.far.fa-envelope').click();
                        }
                        $('.chat-container .people .person[data-user-id="'+contact_vendor_id+'"]').click();
                    }else if(msg == 'fail'){
                        alert('您尚未登入，請先登入後才能聯繫店家。');
                    }else if(msg == 'not a customer'){
                        alert('必須是顧客身分，才能與店家聯絡。');
                    }
                }
            });
        }else{
            alert('無法跟自己聯絡哦。');
        }
    });

    //通訊系統-搜尋
    $(document).on('click', '#chatBox .search', function () {
        var this_element = '';
        $.ajax({
            url : location.origin + '/chat_box/search_user',
            method: 'post',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: {
                'search' : $('#chatBox input[name="search"]').val(),
                'user_id' : $('#chatBox .used-to-submit').data('sender-id')
            }, success(msg){
                let search_person_html = '';
                let is_online = '';
                let is_read = '';
                let photo = '';
                if($.isArray(msg) && msg.length>0){
                    $.each(msg, function (key ,value) {
                        this_element = $('#chatBox .chat .person[data-user-id="'+value['id']+'"]');
                        if(value['is_online'] == 'Y'){
                            $(this_element).find('.offline-round').addClass('bg-primary');
                            $(this_element).find('.offline-round').addClass('online-round');
                            $(this_element).find('.offline-round').removeClass('bg-secondary');
                            $(this_element).find('.offline-round').removeClass('offline-round');
                            is_online = '<span class="time text-primary">線上</span>\n<span class="online-round bg-primary"></span>';
                        }else{
                            $(this_element).find('.online-round').addClass('bg-secondary');
                            $(this_element).find('.online-round').addClass('offline-round');
                            $(this_element).find('.online-round').removeClass('bg-primary');
                            $(this_element).find('.online-round').removeClass('online-round');
                            is_online = '<span class="time text-secondary">離線</span>\n<span class="offline-round bg-secondary"></span>';
                        }

                        if(value['is_read'] == 'N'){
                            is_read = '<span><i class="fas fa-exclamation-circle text-yellow">'+value['count_unread_num']+'</i></span>\n';
                        }else{
                            is_read = '';
                        }

                        if(value['photo'] != ''){
                            photo = '<img class="text-align-center center-center" src="'+value['photo']+'" style="max-width: 60px;display: inline-flex;border-radius: 50%;height: 50px;">\n';
                        }else{
                            photo = '<i class="fas fa-user-circle"></i>\n';
                        }

                        search_person_html += '<li class="person" data-user-id="'+value['id']+'">\n' +
                            photo +
                            '                        <span class="name">'+value['name']+'</span>\n' +
                            is_read +
                            is_online +
                            '                    </li>';
                    });
                }
                $('#chatBox ul.people').html(search_person_html);

            }, fail(msg){
            }
        });
    });

    //通訊系統-更換站內訊息對象
    $(document).on('click', '#chatBox .people .person', function () {
        $('#chatBox .chat').html('');
        let this_element = $(this);
        $('#chatBox .used-to-submit').attr('data-receiver-id', $(this_element).attr('data-user-id'));
        $(this_element).attr('data-skip-message', 10);
        $(this_element).attr('data-count-message', 10);

        //取得使用者聊天內容
        $.ajax({
            url : location.origin + '/chat_box/get_user_data',
            method: 'post',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: {
                'user_id': $(this_element).data('user-id'),
                'count_message': $(this_element).data('count-message'),
            }, success(msg){
                let chat_boxes = msg['chat_boxes'];
                let count_unread = msg['count_unread_msg'];
                if(count_unread > 0){
                    $(this_element).find('.count_read').remove();
                    $('<span><i class="count_read fas fa-exclamation-circle text-yellow">'+count_unread+'</i></span>').insertAfter($(this_element).find('.name'));
                }
                let bubble_class = '';
                let unread_class = '';
                let read_text = '';

                $('#chatBox .right').data('current-target-status', msg['is_online']);
                $('#chatBox .chat-container .right .top .name').text(msg['name']);
                $('#chatBox .chat-container .right .conversation-start .role').text(msg['role']);

                if(msg['is_online'] == 'Y'){
                    $('#chatBox .chat-container .right .conversation-start .current-target-status').text('線上');
                    $('#chatBox .chat-container .right .conversation-start .current-target-status').removeClass('text-secondary');
                    $('#chatBox .chat-container .right .conversation-start .current-target-status').addClass('text-primary');

                    $(this_element).find('.time').text('線上');
                    $(this_element).find('.time').removeClass('text-secondary');
                    $(this_element).find('.time').addClass('text-primary');

                    $(this_element).find('.offline-round').addClass('bg-primary');
                    $(this_element).find('.offline-round').addClass('online-round');
                    $(this_element).find('.offline-round').removeClass('bg-secondary');
                    $(this_element).find('.offline-round').removeClass('offline-round');
                }else{
                    $('#chatBox .chat-container .right .conversation-start .current-target-status').text('離線');
                    $('#chatBox .chat-container .right .conversation-start .current-target-status').removeClass('text-primary');
                    $('#chatBox .chat-container .right .conversation-start .current-target-status').addClass('text-secondary');

                    $(this_element).find('.time').text('離線');
                    $(this_element).find('.time').removeClass('text-primary');
                    $(this_element).find('.time').addClass('text-secondary');

                    $(this_element).find('.online-round').addClass('bg-secondary');
                    $(this_element).find('.online-round').addClass('offline-round');
                    $(this_element).find('.online-round').removeClass('bg-primary');
                    $(this_element).find('.online-round').removeClass('online-round');
                }

                $.each(chat_boxes, function(index,val) {
                    if($('#chatBox .used-to-submit').data('sender-id') == val['sender_id']){
                        bubble_class = 'me';
                    }else{
                        bubble_class = 'you';
                    }

                    if( val['read_at'] == null &&
                        bubble_class == 'you'){
                        unread_class = 'unread';
                    }else{
                        unread_class = '';
                    }

                    if( bubble_class == 'me' &&
                        val['read_at'] != null){
                        read_text = '(已讀)';
                    }else{
                        read_text = '';
                    }


                    $('#chatBox .chat').append('<div class="'+unread_class+' bubble-wrapper">\n' +
                        '                    <div class="bubble '+bubble_class+'">\n' +
                        '                    '+val['content']+'\n' +
                        '                </div>\n'+
                        '<small>'+val['created_at']+read_text+'</small>\n' +
                        '                </div>');

                    if( index == (chat_boxes.length-1)){
                        $('#chatBox .right').data('read-message-last-time', val['created_at']);
                    }
                });

                //更多訊息顯示
                $('.more-text').remove();
                if(msg['is_more'] == 'Y'){
                    $('.chat').prepend('<span class="bubble"><a class="more-text text-primary" href="javascript:void(0);">閱讀更多</a></span>');
                }

                //未讀訊息顯示
                if($('.chat').length && $('.bubble-wrapper').length){
                    if($('.unread').length){
                        $('<span class="bubble underline-unread-msg">接著是未讀的訊息</span>').insertBefore($('.unread').first());
                        $(".chat").animate({ scrollTop: $('.underline-unread-msg').position().top });
                    }else{
                        $(".chat").animate({ scrollTop: $(".chat").prop('scrollHeight') }, 1000);
                    }
                }

                //已讀訊息
                if($(this_element).find('.fa-exclamation-circle').length){
                    let be_reduce_count = parseInt($(this_element).find('.fa-exclamation-circle').text());
                    $.ajax({
                        url : location.origin + '/chat_box/read_message',
                        method: 'post',
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        },
                        data: {
                            'user_id': $(this_element).data('user-id'),
                        }, success(){
                            let chat_btn_count = parseInt($('#content-header .chat-btn .badge.badge-danger').text());
                            let result_btn_count = chat_btn_count - be_reduce_count;
                            if(chat_btn_count != '' && chat_btn_count != 'NaN' && chat_btn_count != NaN && result_btn_count != 0){
                                $('#content-header .chat-btn .badge.badge-danger').text(result_btn_count);
                            }else if(chat_btn_count == NaN || chat_btn_count == 'NaN'){
                                let tmp_chat_btn_count = 0;
                                $.each($('.count_read.fas.fa-exclamation-circle.text-yellow'), function (key ,value) {
                                    tmp_chat_btn_count += parseInt($(value).text());
                                });
                                $('#content-header .chat-btn .badge.badge-danger').text(tmp_chat_btn_count);
                            }else{
                                //數量剩餘零時，會進入到此處。
                                $('#content-header .chat-btn .badge.badge-danger').text('');
                            }
                            $(this_element).find('.fa-exclamation-circle').remove();
                        }, fail(msg){}
                    });
                }

                //加入目前此店家的線上狀態
                $('#chatBox .right').attr('data-current-vendor-is-online', msg['is_online']);

            }, fail(msg){}
        });
    });

    //通訊系統-提交站內訊息
    $(document).on('click', '#chatBox .used-to-submit', function () {
        var this_value = $('#chatBox .write textarea[name="content"]').val();
        var this_element = $(this);
        if($('#chatBox .write textarea[name="content"]').val() != '') {
            //loading圖示
            $('.tmp-loading-img').remove();
            $('#chatBox .chat').append('<img class="tmp-loading-img" src="' + location.origin
                + '/storage/images/app/spinner-icon-gif-10.jpg" style="width: 36%;margin-left: 80%;">');

            $('#chatBox .write textarea[name="content"]').val(null);
            $(".chat").animate({ scrollTop: $(".chat").prop('scrollHeight') }, 1000);

            $.ajax({
                url : location.origin + '/chat_box/update',
                method: 'post',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                data: {
                    'sender_id': $(this_element).data('sender-id'),
                    'receiver_id': $(this_element).data('receiver-id'),
                    'content': this_value,
                }, success(msg){
                    $('.tmp-loading-img').remove();
                    $('#chatBox .write textarea[name="content"]').val(null);

                    if(msg != 'fail'){
                        $('#chatBox .write textarea[name="content"]').val(null);
                        $('#chatBox .chat').append('<div class="bubble-wrapper">\n' +
                            '                    <div class="bubble me">\n' +
                            '                    '+msg['content']+'\n' +
                            '                </div>\n'+
                            '<small>'+msg['created_at']+'</small>\n' +
                            '                </div>');
                    }

                }, fail(msg){
                }
            });
        }
    });
    
    function autoUpdateChatWindowData() {
        var this_element = '';
        var old_total_chat_count = $('#content-header .chat-btn .badge.badge-danger').text();
        var chat_is_changed = false;
        //****************更新header訊息數量*****************
        $.ajax({
            url :$('#chatBox .left').data('check-chat-btn-route'),
            method: 'post',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: {
                'search' : '',
                'user_id' : $('#chatBox .used-to-submit').data('sender-id')
            }, success(msg){
                var count_unread = 0;
                if($.isArray(msg) && msg.length>0){
                    $.each(msg, function (key ,value) {
                        if (value['is_read'] == 'N') {
                            count_unread += value['count_unread_num'];
                        }
                    });

                    if(count_unread==0){
                        $('#content-header .chat-btn .badge.badge-danger').text('');
                    }else{
                        $('#content-header .chat-btn .badge.badge-danger').text(count_unread);
                    }

                    if(old_total_chat_count != count_unread ){
                        chat_is_changed = true;
                    }

                }
                //******************更新聊天室窗******************
                //如果聊天室窗有人，然後有"新訊息"進來或是"線上狀態"或是有新的"已讀訊息"變更才要更新
                if(
                    $('#chatBox .used-to-submit').attr('data-receiver-id')!='' &&
                    (chat_is_changed)
                ){
                    update_chat_window();
                }

            }
        });



        //******************更新搜尋欄******************
        $.ajax({
            url :$('#chatBox .left').data('search-user-route'),
            method: 'post',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: {
                'search' : $('#chatBox input[name="search"]').val(),
                'user_id' : $('#chatBox .used-to-submit').data('sender-id')
            }, success(msg){
                let search_person_html = '';
                let is_online = '';
                let is_read = '';
                let photo = '';
                if($.isArray(msg) && msg.length>0){
                    $.each(msg, function (key ,value) {
                        this_element = $('#chatBox .chat .person[data-user-id="'+value['id']+'"]');
                        if(value['is_online'] == 'Y'){
                            $(this_element).find('.offline-round').addClass('bg-primary');
                            $(this_element).find('.offline-round').addClass('online-round');
                            $(this_element).find('.offline-round').removeClass('bg-secondary');
                            $(this_element).find('.offline-round').removeClass('offline-round');
                            is_online = '<span class="time text-primary">線上</span>\n<span class="online-round bg-primary"></span>';
                        }else{
                            $(this_element).find('.online-round').addClass('bg-secondary');
                            $(this_element).find('.online-round').addClass('offline-round');
                            $(this_element).find('.online-round').removeClass('bg-primary');
                            $(this_element).find('.online-round').removeClass('online-round');
                            is_online = '<span class="time text-secondary">離線</span>\n<span class="offline-round bg-secondary"></span>';
                        }

                        if(value['is_read'] == 'N'){
                            is_read = '<span><i class="count_read fas fa-exclamation-circle text-yellow">'+value['count_unread_num']+'</i></span>\n';
                        }else{
                            is_read = '';
                        }

                        if(value['photo'] != ''){
                            photo = '<img class="text-align-center center-center" src="'+value['photo']+'" style="max-width: 60px;display: inline-flex;border-radius: 50%;height: 50px;">\n';
                        }else{
                            photo = '<i class="fas fa-user-circle"></i>\n';
                        }

                        search_person_html += '<li class="person" data-user-id="'+value['id']+'">\n' +
                            photo +
                            '                        <span class="name">'+value['name']+'</span>\n' +
                            is_read +
                            is_online +
                            '                    </li>';
                    });
                }
                $('#chatBox ul.people').html(search_person_html);
            }, fail(msg){
            }
        });


        //******************更新聊天室窗-確認線上狀態是否變更******************
        var is_change_target_status = false;
        if($('#chatBox .used-to-submit').attr('data-receiver-id')!=''){
            $.ajax({
                url :$('#chatBox .right').data('check-user-online-route'),
                method: 'post',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                data: {
                    'user_id': $('#chatBox .used-to-submit').attr('data-receiver-id')
                }, success(msg) {
                    if(msg != 'fail'){
                        if(msg != $('#chatBox .right').data('current-target-status')){
                            is_change_target_status = true;
                        }
                        $('#chatBox .right').data('current-target-status', msg);

                        //如果聊天室窗有人，然後有"新訊息"進來或是"線上狀態"或是有新的"已讀訊息"變更才要更新
                        //******************更新聊天室窗******************
                        if(
                            $('#chatBox .used-to-submit').attr('data-receiver-id')!='' &&
                            (is_change_target_status)
                        ){
                            update_chat_window();
                        }
                    }
                }
            });

            //如果聊天室窗有人，然後有"新訊息"進來或是"線上狀態"或是有新的"已讀訊息"變更才要更新
            //******************更新聊天室窗******************
            let created_at = new Date($('.chat .bubble-wrapper').last().find('small').text());
            //-8hour
            created_at.setHours(created_at.getHours()-8);
            var date_option = {
                timeZone:"Asia/Taipei",
                hour12 : false,
                hour:  "2-digit",
                minute: "2-digit",
                second: "2-digit",
                month: "2-digit",
                year: "numeric",
                day: "2-digit",
            };
            var db_created_date = new Date(created_at).toLocaleDateString("zh-Hant-TW", date_option);
            $.ajax({
                url: $('#chatBox .right').data('check-last-read-message'),
                method: 'post',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                data: {
                    'sender_id': $('#chatBox .used-to-submit').data('sender-id'),
                    'created_at':db_created_date,
                }, success(msg) {
                    if(msg=='Y'){
                        update_chat_window();
                    }
                }
            });
        }

        setTimeout(autoUpdateChatWindowData, 5000);
    }

    //觸發-自動更新通訊系統
    if($('#chatBox .used-to-submit').data('sender-id')!=''){
        setTimeout(autoUpdateChatWindowData, 5000);
    }
    //如果聊天室窗有人，然後有"新訊息"進來或是"線上狀態"或是有新的"已讀訊息"變更才要更新
    //此針對右側聊天視窗
    function update_chat_window(){
        var chatWindowHTML = '';
        var is_unread = false;
        var this_element = $('#chatBox .people .person[data-user-id="'+$('#chatBox .used-to-submit').attr('data-receiver-id')+'"]');
        $('#chatBox .used-to-submit').attr('data-receiver-id', $(this_element).data('user-id'));
        $(this_element).attr('data-skip-message', 10);
        $(this_element).attr('data-count-message', 10);
        //取得使用者聊天內容
        $.ajax({
            url :$('#chatBox .right').data('get-user-data-route'),
            method: 'post',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: {
                'user_id': $(this_element).data('user-id'),
                'count_message': $(this_element).data('count-message'),
            }, success(msg){
                let chat_boxes = msg['chat_boxes'];
                let bubble_class = '';
                let unread_class = '';
                let read_text = '';
                let is_more = false;

                $('#chatBox .chat-container .right .top .name').text(msg['name']);
                $('#chatBox .chat-container .right .conversation-start .role').text(msg['role']);
                if(msg['is_online'] == 'Y'){
                    $('#chatBox .chat-container .right .conversation-start .current-target-status').text('線上');
                    $('#chatBox .chat-container .right .conversation-start .current-target-status').removeClass('text-secondary');
                    $('#chatBox .chat-container .right .conversation-start .current-target-status').addClass('text-primary');
                }else{
                    $('#chatBox .chat-container .right .conversation-start .current-target-status').text('離線');
                    $('#chatBox .chat-container .right .conversation-start .current-target-status').removeClass('text-primary');
                    $('#chatBox .chat-container .right .conversation-start .current-target-status').addClass('text-secondary');
                }

                $.each(chat_boxes, function(index,val) {
                    if($('#chatBox .used-to-submit').data('sender-id') == val['sender_id']){
                        bubble_class = 'me';
                    }else{
                        bubble_class = 'you';
                    }

                    if( val['read_at'] == null &&
                        bubble_class == 'you'){
                        is_unread = true;
                        unread_class = 'unread';
                    }else{
                        unread_class = '';
                    }

                    if( bubble_class == 'me' &&
                        val['read_at'] != null){
                        read_text = '(已讀)';
                    }else{
                        read_text = '';
                    }
                    if(msg['is_more'] == 'Y') {
                        is_more = true;
                    }

                    chatWindowHTML += '<div class="'+unread_class+' bubble-wrapper">\n' +
                        '                    <div class="bubble '+bubble_class+'">\n' +
                        '                    '+val['content']+'\n' +
                        '                </div>\n'+
                        '<small>'+val['created_at']+read_text+'</small>\n' +
                        '                </div>';

                });
                $('#chatBox .chat').html(chatWindowHTML);

                //更多訊息顯示
                $('.more-text').remove();
                if(is_more){
                    $('.chat').prepend('<span class="bubble"><a class="more-text text-primary" href="javascript:void(0);">--------點我查看更多--------</a></span>');
                }

                //未讀訊息顯示
                if($('.chat').length && $('.bubble-wrapper').length){
                    if($('.unread').length){
                        $('<span class="underline-unread-msg bubble">--------以下是未讀的訊息--------</span>').insertBefore($('.unread').first());
                        $(".chat").scrollTop($(".chat").prop('scrollHeight')-$('.underline-unread-msg').prop('scrollHeight'));
                    }else{
                        $(".chat").scrollTop($(".chat").prop('scrollHeight'));
                    }
                }

            }, fail(msg){
            }
        });
    }

    //即時通訊按下enter後，直接送出訊息。
    $('#chatBox .write').keyup(function (e) {
        let keycode = (event.keyCode ? event.keyCode : event.which);
        let clicked = false;
        if(keycode == '13' && !clicked && ($('textarea[name="content"]').val().trim('') != $('textarea[name="content"]').val() )){
            if($('textarea[name="content"]').val().trim('') != '') {
                $(this).find('.used-to-submit').trigger('click');
                clicked = true;
                if($('#chatBox .used-to-submit').attr('data-receiver-id')==''){
                    $('#chatBox .write textarea[name="content"]').val(null);
                }
            }else{
                alert('內容不可只有空白文字');
            }
        }
    });

    //一開始頁面載入，同時更新上方的所有未讀訊息的數量
    var count_chat_btn = 0;
    $.each($('.count_read.fas.fa-exclamation-circle'), function (key, item) {
        if(parseInt($(item).text())>0){
            count_chat_btn += parseInt($(item).text());
        }
    });
    if(count_chat_btn==0){
        $('#content-header .chat-btn .badge.badge-danger').text('');
    }else{
        $('#content-header .chat-btn .badge.badge-danger').text(count_chat_btn);
    }

    //「閱讀更多」的功能
    var that_element_more_text = '';
    $(document).on('click', '.chat .more-text', function() {
        if($('#chatBox .chat .bubble-wrapper').length){
            if($(that_element_more_text).length==0){
                that_element_more_text = $('#chatBox .people .person[data-user-id="'+$('#chatBox .used-to-submit').attr('data-receiver-id')+'"]');
            }

            if(isNaN($(that_element_more_text).attr('data-skip-message'))){
                $(that_element_more_text).attr('data-skip-message', 10);
            }

            if(isNaN($(that_element_more_text).attr('data-count-message'))){
                $(that_element_more_text).attr('data-count-message', 10);
            }

            var original_count_message = $(that_element_more_text).attr('data-count-message');
            $(that_element_more_text).attr('data-skip-message', parseInt($(that_element_more_text).attr('data-skip-message'))+10);


            //取得使用者聊天內容
            $.ajax({
                url :location.origin + '/chat_box/get_user_data',
                method: 'post',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                data: {
                    'user_id': $(that_element_more_text).attr('data-user-id'),
                    'skip': $(that_element_more_text).attr('data-skip-message'),
                    'count_message': original_count_message,
                }, success(msg){
                    let chat_boxes = msg['chat_boxes'];
                    let bubble_class = '';
                    let unread_class = '';
                    let read_text = '';
                    let result_html = '';

                    $.each(chat_boxes, function(index,val) {
                        if($('#chatBox .used-to-submit').data('sender-id') == val['sender_id']){
                            bubble_class = 'me';
                        }else{
                            bubble_class = 'you';
                        }

                        if( val['read_at'] == null &&
                            bubble_class == 'you'){
                            unread_class = 'unread';
                        }else{
                            unread_class = '';
                        }

                        if( bubble_class == 'me' &&
                            val['read_at'] != null){
                            read_text = '(已讀)';
                        }else{
                            read_text = '';
                        }

                        result_html += '<div class="'+unread_class+' bubble-wrapper">\n' +
                            '                    <div class="bubble '+bubble_class+'">\n' +
                            '                    '+val['content']+'\n' +
                            '                </div>\n'+
                            '<small>'+val['created_at']+read_text+'</small>\n' +
                            '                </div>';
                    });

                    $(result_html).insertBefore($('#chatBox .chat .bubble-wrapper').first());

                    //更多訊息顯示
                    $('.more-text').remove();
                    if(msg['is_more'] == 'Y'){
                        $('.chat').prepend('<span class="bubble"><a class="more-text text-primary" href="javascript:void(0);">--------點我查看更多--------</a></span>');
                    }

                }, fail(msg){
                }
            });
        }
    });

    $('#chatBox .left .top').keyup(function (e) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            $(this).find('.search').click();
        }
    });

    $('.mini-btn, .chat-btn').click(function () {
        $('.chat-container').toggleClass("sideActive");
    });

    $(document).on('click', '.person', function () {
        $(".left").animate({
            width: "0",
        }, );

        $(".right").animate({
            width: "100%",
        }, );
    });

    $('.back-btn').click(function () {
        $(".left").animate({
            width: "100%",
        }, );
        $(".right").animate({
            width: "0",
        }, );

    });
});
