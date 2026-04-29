<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function manage(User $admin, User $target): bool
    {
        return $admin->role === 'admin' && (int) $admin->tenant_id === (int) $target->tenant_id;
    }
}

