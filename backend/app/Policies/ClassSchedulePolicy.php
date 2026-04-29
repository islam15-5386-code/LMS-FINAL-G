<?php

namespace App\Policies;

use App\Models\LiveClass;
use App\Models\User;

class ClassSchedulePolicy
{
    public function manage(User $user, LiveClass $liveClass): bool
    {
        return $user->role === 'admin' && (int) $user->tenant_id === (int) $liveClass->tenant_id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }
}

