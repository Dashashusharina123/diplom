<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document_GY extends Model
{
    protected $fillable = [
        'result_id',
        'trainee_id',
        'task_id',
        'data',
        'train',
        'vagon',
        'station_from',
        'station_to',
        'station_code',
        'section',
        'participants',
        'carrier',
        'shipment',
        'cargo_receive',
        'cargo',
        'description'
    ];

    protected $casts = [
        'data' => 'date',
        'cargo_receive' => 'date'
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
