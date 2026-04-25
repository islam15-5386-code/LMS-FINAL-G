<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Database\Seeders\Support\BangladeshLmsDataset;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'super_admin' => 'Platform Super Admin',
            'tenant_admin' => 'Institute Admin',
            'teacher' => 'Teacher',
            'student' => 'Student',
            'hr_manager' => 'HR Manager',
        ];

        foreach ($roles as $name => $label) {
            Role::query()->updateOrCreate(
                ['name' => $name],
                ['label' => $label, 'guard_name' => 'web']
            );
        }

        foreach (BangladeshLmsDataset::permissions() as $name => $label) {
            Permission::query()->updateOrCreate(
                ['name' => $name],
                ['label' => $label, 'guard_name' => 'web']
            );
        }

        $permissionIdsByName = Permission::query()->pluck('id', 'name');

        foreach (BangladeshLmsDataset::rolePermissions() as $roleName => $permissions) {
            $role = Role::query()->where('name', $roleName)->firstOrFail();
            $role->permissions()->sync(
                collect($permissions)
                    ->map(fn (string $permissionName): ?int => $permissionIdsByName[$permissionName] ?? null)
                    ->filter()
                    ->values()
                    ->all()
            );
        }
    }
}
