<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Add tenant resolver early so request has tenant context for all API routes
        $middleware->prependToGroup('api', App\Http\Middleware\TenantResolver::class);
        $middleware->appendToGroup('api', App\Http\Middleware\EnsureRoleRouteAccess::class);
        $middleware->alias([
            'role' => App\Http\Middleware\EnsureUserRole::class,
            'auth.jwt' => App\Http\Middleware\AuthenticateWithJwt::class,
            'plan.limit' => App\Http\Middleware\CheckPlanLimit::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }
        });
    })->create();
