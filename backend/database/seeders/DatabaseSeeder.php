<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     * Run: php artisan migrate:fresh --seed
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            TenantSeeder::class,
            UserSeeder::class,
            CourseSeeder::class,
            EnrollmentSeeder::class,
            AssessmentSeeder::class,
            LiveClassSeeder::class,
            BillingSeeder::class,
            NotificationSeeder::class,
            AuditLogSeeder::class,
            DemoLmsSeeder::class,   // Adds Betopia Academy demo with Bangladeshi names
        ]);
    }
}
