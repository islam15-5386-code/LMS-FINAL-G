<?php

namespace App\Policies;

use App\Models\Certificate;
use App\Models\User;

class CertificatePolicy
{
    public function manage(User $user, Certificate $certificate): bool
    {
        return $user->role === 'admin' && (int) $user->tenant_id === (int) optional($certificate->course)->tenant_id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }
}

