<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    protected $fillable = [
        'course_module_id',
        'title',
        'content_url',
        'content_mime',
        'content_original_name',
        'type',
        'duration_minutes',
        'release_at',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'release_at' => 'datetime',
        ];
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(CourseModule::class, 'course_module_id');
    }

    public function completedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot(['completed_at'])
            ->withTimestamps();
    }
}
