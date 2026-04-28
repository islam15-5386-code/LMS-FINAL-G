<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('tenants')) {
            Schema::create('tenants', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->string('subdomain')->unique();
                $table->string('domain')->nullable()->unique();
                $table->string('logo_url')->nullable();
                $table->string('primary_color')->nullable();
                $table->string('secondary_color')->nullable();
                $table->string('status')->default('active');
                $table->string('plan')->nullable();
                $table->json('settings_json')->nullable();
                $table->timestamps();
            });
        }

        // Ensure tenant_id exists on important tables - many already have tenant_id; add if missing
        $tables = [
            'users','courses','course_modules','lessons','enrollments','assessments','assessment_questions','submissions','live_classes','payments','certificates','reports'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && ! Schema::hasColumn($table, 'tenant_id')) {
                Schema::table($table, function (Blueprint $t) use ($table) {
                    $t->foreignId('tenant_id')->nullable()->index()->after('id');
                });
            }
        }

        // PostgreSQL Row Level Security policies
        if (DB::getDriverName() === 'pgsql') {
            foreach ($tables as $table) {
                try {
                    DB::statement("ALTER TABLE \"{$table}\" ENABLE ROW LEVEL SECURITY;");
                    DB::statement("CREATE POLICY tenant_isolation_policy ON \"{$table}\" USING (tenant_id::text = current_setting('app.tenant_id', true)) WITH CHECK (tenant_id::text = current_setting('app.tenant_id', true));");
                } catch (\Throwable $e) {
                    // ignore if table doesn't exist or policy exists
                }
            }
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            $tables = [
                'users','courses','course_modules','lessons','enrollments','assessments','assessment_questions','submissions','live_classes','payments','certificates','reports'
            ];
            foreach ($tables as $table) {
                try {
                    DB::statement("DROP POLICY IF EXISTS tenant_isolation_policy ON \"{$table}\";");
                } catch (\Throwable $e) {
                }
            }
        }

        Schema::dropIfExists('tenants');
        // Note: tenant_id columns are not removed automatically to avoid destructive operations
    }
};
