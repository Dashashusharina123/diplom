<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'title',
        'description',
        'trainee_id', // ← ВОТ ЭТО
        'document_l_y_id',
        'document_g_y_id',
        'is_visible'
    ];

    protected $table = 'tasks';

    public function results()
    {
        return $this->hasMany(Result::class, 'task_id');
    }
    public function documentGY()
    {
        return $this->belongsTo(Document_GY::class, 'document_g_y_id');
    }

    public function documentLY()
    {
        return $this->belongsTo(Document_LY::class, 'document_l_y_id');
    }
}
