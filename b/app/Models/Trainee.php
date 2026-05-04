<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Trainee extends Model
{
    protected $fillable = ['title', 'fio'];

    protected $table = 'trainees';

    public function results()
    {
        return $this->hasMany(Result::class, 'trainee_id');
    }
}
