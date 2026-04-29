<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    protected $fillable = [
        'assessment_id',
        'user_id',
        'answer_text',
        'file_url',
        'file_name',
        'file_mime',
        'file_size',
        'status',
        'score',
        'feedback',
        'ai_feedback',
        'teacher_feedback',
        'passed',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'passed' => 'boolean',
            'submitted_at' => 'datetime',
        ];
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
