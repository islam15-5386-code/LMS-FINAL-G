<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

abstract class Controller
{
    use AuthorizesRequests;

    protected function authorizeRoles(Request $request, array $roles): User
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($user === null || ! in_array($user->role, $roles, true)) {
            throw new HttpException(403, 'You are not authorized to perform this action.');
        }

        return $user;
    }

    protected function perPage(Request $request, int $default = 15): int
    {
        return max(1, min(100, $request->integer('per_page', $default)));
    }
}
