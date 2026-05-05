<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document_LY extends Model
{
    protected $fillable = [
        'data',
        'train',
        'vagon',
        'station_from',
        'station_to',
        'chief',
        'conductor',
        'seat',
        'linen_issued',
        'passenger'
    ];

    protected $casts = [
        'data' => 'date'
    ];

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function trainee()
    {
        return $this->belongsTo(Trainee::class, 'trainee_id');
    }

    public function result()
    {
        return $this->belongsTo(Result::class, 'result_id');
    }
}
