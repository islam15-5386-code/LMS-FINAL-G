<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $courses = DB::table('courses')
            ->select('id', 'tenant_id', 'teacher_id')
            ->whereNotNull('teacher_id')
            ->get();

        foreach ($courses as $course) {
            $teacherExists = DB::table('users')
                ->where('id', $course->teacher_id)
                ->where('tenant_id', $course->tenant_id)
                ->exists();

            if (! $teacherExists) {
                continue;
            }

            DB::table('course_teacher')->updateOrInsert(
                ['course_id' => $course->id, 'teacher_id' => $course->teacher_id],
                [
                    'tenant_id' => $course->tenant_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    public function down(): void
    {
        // No-op: backfill migration should not delete potentially valid assignments.
    }
};

