<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\Support\BangladeshLmsDataset;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $roleIds = Role::query()->pluck('id', 'name');

        $superAdmin = User::query()->updateOrCreate(
            ['email' => 'platform.admin@example.com'],
            [
                'tenant_id' => null,
                'name' => 'Tanvir Ahsan Rahman',
                'phone' => '01710000000',
                'password' => 'password',
                'role' => 'super_admin',
                'department' => 'Platform Operations',
                'city' => 'Dhaka',
                'address' => 'House 12, Road 7, Dhanmondi, Dhaka, Bangladesh',
                'is_active' => true,
            ]
        );

        $superAdmin->roles()->sync([$roleIds['super_admin']]);

        $nameIndex = 0;

        Tenant::query()->orderBy('id')->each(function (Tenant $tenant) use ($roleIds, &$nameIndex): void {
            $tenantAdmin = $this->createUserForTenant($tenant, 'admin', 'tenant_admin', 'Administration', $nameIndex++);
            $hrManager = $this->createUserForTenant($tenant, 'hr_manager', 'hr_manager', 'Human Resources', $nameIndex++);

            for ($teacherIndex = 0; $teacherIndex < 4; $teacherIndex++) {
                $this->createUserForTenant($tenant, 'teacher', 'teacher', 'Faculty', $nameIndex++);
            }

            for ($studentIndex = 0; $studentIndex < 28; $studentIndex++) {
                $departments = ['CSE', 'BBA', 'English', 'Textile', 'Marketing', 'Accounts', 'HR', 'Operations'];
                $this->createUserForTenant(
                    $tenant,
                    'student',
                    'student',
                    $departments[($studentIndex + $tenant->id) % count($departments)],
                    $nameIndex++
                );
            }
        });
    }

    private function createUserForTenant(Tenant $tenant, string $userRole, string $roleName, string $department, int $index): User
    {
        $name = BangladeshLmsDataset::fullName($index);

        $user = User::query()->updateOrCreate(
            ['email' => BangladeshLmsDataset::email($name, $tenant->subdomain, $index)],
            [
                'tenant_id' => $tenant->id,
                'name' => $name,
                'phone' => BangladeshLmsDataset::phone($index),
                'password' => 'password',
                'role' => $userRole,
                'department' => $department,
                'city' => $tenant->city,
                'address' => $tenant->address,
                'is_active' => true,
            ]
        );

        $role = Role::query()->where('name', $roleName)->firstOrFail();
        $user->roles()->syncWithoutDetaching([$role->id]);

        return $user;
    }
}
