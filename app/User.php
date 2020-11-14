<?php

namespace App;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Cache;
use Carbon\Carbon;

class User extends Authenticatable implements MustVerifyEmail
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password', 'photo', 'current_role',
    ];


    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token'
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [];


    public function isOnline(){
        return Cache::has('user-is-online-'.$this->id);
    }

}
