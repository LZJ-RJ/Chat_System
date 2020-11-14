<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ChatBoxes extends Model
{
    protected $fillable = [
        'sender_id', 'receiver_id', 'content', 'read_at'
    ];
}
