<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $courses = DB::table('courses')->whereNotNull('teacher_id')->get();
        
        foreach ($courses as $course) {
            // Check if teacher still exists to avoid foreign key issues
            if (DB::table('users')->where('id', $course->teacher_id)->exists()) {
                DB::table('course_teacher')->insertOrIgnore([
                    'tenant_id' => $course->tenant_id,
                    'course_id' => $course->id,
                    'teacher_id' => $course->teacher_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pivot', function (Blueprint $table) {
            //
        });
    }
};
