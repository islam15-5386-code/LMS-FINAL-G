<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    protected $fillable = [
        'tenant_id',
        'billing_profile_id',
        'invoice_number',
        'amount_bdt',
        'billing_period',
        'issued_at',
        'due_at',
        'paid_at',
        'payment_status',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
            'due_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function billingProfile(): BelongsTo
    {
        return $this->belongsTo(BillingProfile::class);
    }
}
