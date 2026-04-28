<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantBrandingController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin'])->loadMissing('tenant');

        abort_if($user->tenant === null, 404, 'Tenant not found.');

        return response()->json([
            'data' => LmsSupport::serializeBranding($user->tenant),
        ]);
    }

    // Public lookup endpoint by subdomain (used by frontend to fetch branding before auth)
    public function lookup(Request $request): JsonResponse
    {
        $host = $request->getHost();
        $subdomain = null;

        if (str_contains($host, 'localhost') || str_contains($host, '127.0.0.1')) {
            $parts = explode('.', $host);
            $subdomain = $parts[0] ?? null;
        } else {
            $parts = explode('.', $host);
            if (count($parts) >= 3) $subdomain = $parts[0];
        }

        if ($request->headers->has('X-Tenant') && (str_contains($host, 'localhost') || str_contains($host, '127.0.0.1'))) {
            $subdomain = $request->header('X-Tenant');
        }

        if ($subdomain === null) {
            return response()->json(['message' => 'Institute not found.'], 404);
        }

        $tenant = Tenant::query()->where('subdomain', $subdomain)->first();

        if ($tenant === null) {
            return response()->json(['message' => 'Institute not found.'], 404);
        }

        return response()->json(['data' => LmsSupport::serializeBranding($tenant)]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin'])->loadMissing('tenant');

        abort_if($user->tenant === null, 404, 'Tenant not found.');

        $validated = $request->validate([
            'tenantName' => ['nullable', 'string', 'max:255'],
            'subdomain' => ['nullable', 'string', 'max:255'],
            'logoText' => ['required', 'string', 'max:12'],
            'primaryColor' => ['required', 'string', 'max:20'],
            'accentColor' => ['required', 'string', 'max:20'],
            'supportEmail' => ['required', 'email', 'max:255'],
            'customDomain' => ['nullable', 'string', 'max:255'],
        ]);

        /** @var Tenant $tenant */
        $tenant = $user->tenant;
        $tenantName = $validated['tenantName'] ?? $tenant->name;
        $subdomain = $validated['subdomain'] ?? $tenant->subdomain;

        $tenant->update([
            'name' => $tenantName,
            'subdomain' => $subdomain,
            'logo_text' => $validated['logoText'],
            'primary_color' => $validated['primaryColor'],
            'accent_color' => $validated['accentColor'],
            'support_email' => $validated['supportEmail'],
            'custom_domain' => $validated['customDomain'] ?? null,
        ]);

        LmsSupport::audit($user, 'Updated tenant branding', $tenant->name, $request->ip());
        LmsSupport::notify($tenant, 'Admin', 'system', 'Tenant branding settings were updated.');

        return response()->json([
            'message' => 'Branding updated successfully.',
            'data' => LmsSupport::serializeBranding($tenant->fresh()),
        ]);
    }
}
