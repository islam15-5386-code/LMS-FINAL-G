<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class BillingProfile extends Model
{
    protected $fillable = [
        'tenant_id',
        'plan',
        'active_students',
        'used_seats',
        'monthly_price',
        'seat_limit',
        'overage_per_seat',
        'billing_status',
        'next_billing_at',
    ];

    protected function casts(): array
    {
        return [
            'next_billing_at' => 'datetime',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}
