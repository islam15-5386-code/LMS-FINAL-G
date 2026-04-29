<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRoleRouteAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null) {
            return $next($request);
        }

        $path = trim($request->path(), '/');

        if (str_starts_with($path, 'api/v1/admin/') && $user->role !== 'admin') {
            abort(403, 'Only admins can access admin routes.');
        }

        if (str_starts_with($path, 'api/v1/teacher/') && $user->role !== 'teacher') {
            abort(403, 'Only teachers can access teacher routes.');
        }

        if (str_starts_with($path, 'api/v1/student/') && $user->role !== 'student') {
            abort(403, 'Only students can access student routes.');
        }

        return $next($request);
    }
}
