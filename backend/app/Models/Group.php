<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    protected $fillable = ['name'];

    public function users()
    {
        return $this->hasMany(User::class);
    }
    public function tasks()
    {
        return $this->belongsToMany(Task::class, 'group_tasks');
    }
}
