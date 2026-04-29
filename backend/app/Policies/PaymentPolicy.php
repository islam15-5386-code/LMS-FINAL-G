<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function manage(User $user, Payment $payment): bool
    {
        return $user->role === 'admin' && (int) $user->tenant_id === (int) $payment->tenant_id;
    }
}

