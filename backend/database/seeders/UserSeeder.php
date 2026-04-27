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
        $demoTenant = Tenant::query()->orderBy('id')->first();

        $demoLogins = [
            ['name' => 'Test Student', 'email' => 'student@example.com', 'phone' => '01700000001', 'role' => 'student', 'department' => 'CSE'],
            ['name' => 'Test Admin', 'email' => 'admin@example.com', 'phone' => '01700000002', 'role' => 'admin', 'department' => 'Administration'],
            ['name' => 'Test Teacher', 'email' => 'teacher@example.com', 'phone' => '01700000003', 'role' => 'teacher', 'department' => 'Faculty'],
            ['name' => 'BSMS Student', 'email' => 'student@bsms.com', 'phone' => '01700000101', 'role' => 'student', 'department' => 'CSE'],
            ['name' => 'BSMS Admin', 'email' => 'admin@bsms.com', 'phone' => '01700000102', 'role' => 'admin', 'department' => 'Administration'],
            ['name' => 'BSMS Teacher', 'email' => 'teacher@bsms.com', 'phone' => '01700000103', 'role' => 'teacher', 'department' => 'Faculty'],
        ];

        foreach ($demoLogins as $demoLogin) {
            $user = User::query()->updateOrCreate(
                ['email' => $demoLogin['email']],
                [
                    'tenant_id' => $demoTenant?->id,
                    'name' => $demoLogin['name'],
                    'phone' => $demoLogin['phone'],
                    'password' => 'password123',
                    'role' => $demoLogin['role'],
                    'department' => $demoLogin['department'],
                    'city' => $demoTenant?->city ?? 'Dhaka',
                    'address' => $demoTenant?->address ?? 'Test Address',
                    'is_active' => true,
                ]
            );

            if (isset($roleIds[$demoLogin['role']])) {
                $user->roles()->syncWithoutDetaching([$roleIds[$demoLogin['role']]]);
            }
        }

        $nameIndex = 0;

        Tenant::query()->orderBy('id')->each(function (Tenant $tenant) use ($roleIds, &$nameIndex): void {
            $this->createUserForTenant($tenant, 'admin', 'admin', 'Administration', $nameIndex++);

            for ($teacherIndex = 0; $teacherIndex < 10; $teacherIndex++) {
                $this->createUserForTenant($tenant, 'teacher', 'teacher', 'Faculty', $nameIndex++);
            }

            for ($studentIndex = 0; $studentIndex < 10; $studentIndex++) {
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

        User::query()->whereNotIn('role', ['admin', 'teacher', 'student'])->delete();
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
