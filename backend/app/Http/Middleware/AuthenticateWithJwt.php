<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\JwtToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateWithJwt
{
    public function handle(Request $request, Closure $next): Response
    {
        // Keep test compatibility when actingAs(...) has already resolved a user.
        if ($request->user() instanceof User) {
            return $next($request);
        }

        $header = $request->header('Authorization', '');
        if (! str_starts_with($header, 'Bearer ')) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $rawToken = trim(substr($header, 7));
        if ($rawToken === '') {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        try {
            $claims = JwtToken::decode($rawToken);
        } catch (\Throwable) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $jti = (string) ($claims['jti'] ?? '');
        if ($jti !== '' && JwtToken::isRevoked($jti)) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $userId = (int) ($claims['sub'] ?? 0);
        if ($userId <= 0) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user = User::withoutGlobalScopes()->find($userId);
        if (! $user || ! $user->is_active) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $tokenTenantId = isset($claims['tenant_id']) ? (int) $claims['tenant_id'] : null;
        if ($tokenTenantId !== null && (int) $user->tenant_id !== $tokenTenantId) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $resolvedTenant = $request->attributes->get('tenant');
        if ($resolvedTenant !== null && (int) $resolvedTenant->id !== (int) $user->tenant_id) {
            return response()->json([
                'message' => 'Forbidden.',
                'code' => 'TENANT_MISMATCH',
            ], 403);
        }

        $request->attributes->set('jwt_claims', $claims);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
