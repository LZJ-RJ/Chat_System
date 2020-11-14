<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateChatBoxesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('chat_boxes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->text('sender_id')->comment('寄送者ID')->nullable();
            $table->text('receiver_id')->comment('接收者ID')->nullable();
            $table->mediumText('content')->comment('訊息內容')->nullable();
            $table->text('read_at')->comment('已讀時間')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('chat_boxes');
    }
}
