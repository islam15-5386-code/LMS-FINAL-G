<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Assessment extends Model
{
    protected $fillable = [
        'course_id',
        'title',
        'type',
        'status',
        'generated_from',
        'ai_generated',
        'question_count',
        'passing_mark',
        'total_marks',
        'rubric_keywords',
        'teacher_reviewed',
    ];

    protected function casts(): array
    {
        return [
            'rubric_keywords' => 'array',
            'ai_generated' => 'boolean',
            'teacher_reviewed' => 'boolean',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(AssessmentQuestion::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }
}
