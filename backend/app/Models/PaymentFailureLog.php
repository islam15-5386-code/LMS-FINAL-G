<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentFailureLog extends Model
{
    protected $fillable = [
        'tenant_id',
        'invoice_id',
        'provider',
        'reason',
        'context',
    ];

    protected function casts(): array
    {
        return [
            'context' => 'array',
        ];
    }
}
