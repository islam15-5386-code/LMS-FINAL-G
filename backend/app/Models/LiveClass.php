<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class LiveClass extends Model
{
    protected $fillable = [
        'course_id',
        'teacher_id',
        'title',
        'meeting_url',
        'recording_url',
        'start_at',
        'duration_minutes',
        'participant_limit',
        'provider',
        'reminder_24h',
        'reminder_1h',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'start_at' => 'datetime',
            'reminder_24h' => 'boolean',
            'reminder_1h' => 'boolean',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }
}
