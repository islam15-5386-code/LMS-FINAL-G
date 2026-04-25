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
        $user = $this->authorizeRoles($request, ['super_admin', 'admin', 'hr_manager'])->loadMissing('tenant');

        abort_if($user->tenant === null, 404, 'Tenant not found.');

        return response()->json([
            'data' => LmsSupport::serializeBranding($user->tenant),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['super_admin', 'admin', 'hr_manager'])->loadMissing('tenant');

        abort_if($user->tenant === null, 404, 'Tenant not found.');

        $validated = $request->validate([
            'tenantName' => ['nullable', 'string', 'max:255'],
            'vendorName' => ['nullable', 'string', 'max:255'],
            'subdomain' => ['nullable', 'string', 'max:255'],
            'vendorSubdomain' => ['nullable', 'string', 'max:255'],
            'logoText' => ['required', 'string', 'max:12'],
            'primaryColor' => ['required', 'string', 'max:20'],
            'accentColor' => ['required', 'string', 'max:20'],
            'supportEmail' => ['required', 'email', 'max:255'],
            'customDomain' => ['nullable', 'string', 'max:255'],
        ]);

        /** @var Tenant $tenant */
        $tenant = $user->tenant;
        $tenantName = $validated['tenantName'] ?? $validated['vendorName'] ?? $tenant->name;
        $subdomain = $validated['subdomain'] ?? $validated['vendorSubdomain'] ?? $tenant->subdomain;

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
