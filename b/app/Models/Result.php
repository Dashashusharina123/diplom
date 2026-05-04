<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Result extends Model
{
    protected $fillable = ['user_id', 'task_id', 'score', 'time', 'trainee_id'];

    // Явно указываем имя таблицы
    protected $table = 'results';

    public function trainee()
    {
        return $this->belongsTo(Trainee::class, 'trainee_id');
    }

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
