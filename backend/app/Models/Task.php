<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = ['title', 'description', 'document_l_y_id', 'document_g_y_id'];

    protected $table = 'tasks';

    public function results()
    {
        return $this->hasMany(Result::class, 'task_id');
    }
}
