<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class AssessmentQuestion extends Model
{
    protected $fillable = [
        'assessment_id',
        'prompt',
        'question_type',
        'options',
        'answer',
        'rubric',
        'sample_answer',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
        ];
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }
}
