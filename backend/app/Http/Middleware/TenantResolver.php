<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class TenantResolver
{
    public function handle(Request $request, Closure $next): Response
    {
        $host = $request->getHost();

        // Extract subdomain. For local dev hosts like diu.localhost:3000, subdomain is first segment
        $subdomain = $this->extractSubdomain($host);

        // Allow explicit header for local development
        if ($request->headers->has('X-Tenant') && $this->isLocalHost($host)) {
            $subdomain = $request->header('X-Tenant');
        }

        $tenant = null;
        if ($subdomain !== null) {
            $tenant = Cache::remember("tenant_config:by_subdomain:{$subdomain}", 60 * 60, function () use ($subdomain) {
                return Tenant::query()->where('subdomain', $subdomain)->first();
            });
        }

        // If tenant not found, leave tenant as null and allow controllers to decide.

        // set tenant info in request for controllers
        $request->attributes->set('tenant', $tenant);

        // set Postgres session var for RLS enforcement when tenant present and active
        if ($tenant !== null && ($tenant->status ?? 'active') === 'active' && DB::getDriverName() === 'pgsql') {
            try {
                DB::statement('SELECT set_config(\'app.tenant_id\', ?, true);', [(string) $tenant->id]);
            } catch (\Throwable $e) {
                // ignore
            }
            // cache tenant config for later use
            Cache::put("tenant_config:{$tenant->id}", $tenant->toArray(), 60 * 60);
        }

        return $next($request);
    }

    private function extractSubdomain(string $host): ?string
    {
        // handle IP or localhost
        if (str_contains($host, 'localhost') || filter_var($host, FILTER_VALIDATE_IP)) {
            $parts = explode('.', $host);
            // for hosts like diu.localhost or diu.localhost:3000, take first segment
            return $parts[0] ?? null;
        }

        $parts = explode('.', $host);
        if (count($parts) < 3) {
            // no subdomain present
            return null;
        }

        return $parts[0];
    }

    private function isLocalHost(string $host): bool
    {
        return str_contains($host, 'localhost') || str_contains($host, '127.0.0.1');
    }
}
