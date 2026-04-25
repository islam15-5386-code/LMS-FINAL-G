<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Database\Seeders\Support\BangladeshLmsDataset;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        foreach (BangladeshLmsDataset::tenantBlueprints() as $index => $tenantData) {
            Tenant::query()->updateOrCreate(
                ['subdomain' => $tenantData['subdomain']],
                [
                    'name' => $tenantData['name'],
                    'city' => $tenantData['city'],
                    'logo_text' => $tenantData['logo_text'],
                    'primary_color' => ['#0f766e', '#0b5d8f', '#155e75', '#0f3d56'][$index % 4],
                    'accent_color' => ['#f97316', '#fb923c', '#ea580c', '#f59e0b'][$index % 4],
                    'support_email' => 'support@' . $tenantData['subdomain'] . '.example.com',
                    'custom_domain' => 'learn.' . $tenantData['subdomain'] . '.example.com',
                    'address' => BangladeshLmsDataset::address($tenantData['city'], $tenantData['area'], $index + 10),
                    'phone' => BangladeshLmsDataset::phone($index + 50),
                    'logo_url' => 'https://cdn.example.com/logos/' . $tenantData['subdomain'] . '.png',
                    'plan_type' => $tenantData['plan_type'],
                    'status' => $tenantData['status'],
                    'is_active' => $tenantData['status'] !== 'suspended',
                ]
            );
        }
    }
}
