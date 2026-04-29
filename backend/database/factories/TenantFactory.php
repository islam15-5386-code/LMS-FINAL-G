<?php

namespace Database\Factories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Tenant>
 */
class TenantFactory extends Factory
{
    protected $model = Tenant::class;

    public function definition(): array
    {
        $name = $this->faker->company();
        $slug = Str::slug($name).'-'.Str::lower(Str::random(4));

        return [
            'name' => $name,
            'slug' => $slug,
            'subdomain' => $slug,
            'city' => 'Dhaka',
            'logo_text' => Str::upper(Str::substr(Str::slug($name, ''), 0, 4)) ?: 'LMS',
            'primary_color' => '#1d4ed8',
            'accent_color' => '#06b6d4',
            'support_email' => 'support@'.$slug.'.test',
            'custom_domain' => null,
            'status' => 'active',
            'is_active' => true,
            'plan_type' => 'Starter',
        ];
    }
}
