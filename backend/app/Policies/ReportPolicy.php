<?php

namespace App\Policies;

use App\Models\User;

class ReportPolicy
{
    public function manage(User $user): bool
    {
        return $user->role === 'admin';
    }
}

