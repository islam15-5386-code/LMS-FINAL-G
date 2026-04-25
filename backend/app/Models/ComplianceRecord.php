<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class ComplianceRecord extends Model
{
    protected $fillable = [
        'tenant_id',
        'user_id',
        'course_id',
        'employee_name',
        'department',
        'role_title',
        'course_title',
        'completion_percent',
        'certified',
    ];

    protected function casts(): array
    {
        return [
            'certified' => 'boolean',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
