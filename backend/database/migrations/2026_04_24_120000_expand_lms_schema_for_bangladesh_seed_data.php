<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('city')->nullable()->after('name');
            $table->text('address')->nullable()->after('custom_domain');
            $table->string('phone', 20)->nullable()->after('address');
            $table->string('logo_url')->nullable()->after('phone');
            $table->string('plan_type')->default('Growth')->after('logo_url');
            $table->string('status')->default('active')->after('plan_type');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 20)->nullable()->after('email');
            $table->string('city')->nullable()->after('department');
            $table->text('address')->nullable()->after('city');
            $table->boolean('is_active')->default(true)->after('address');
        });

        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('label');
            $table->string('guard_name')->default('web');
            $table->timestamps();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('label');
            $table->string('guard_name')->default('web');
            $table->timestamps();
        });

        Schema::create('permission_role', function (Blueprint $table) {
            $table->id();
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['permission_id', 'role_id']);
        });

        Schema::create('role_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['role_id', 'user_id']);
        });

        Schema::table('billing_profiles', function (Blueprint $table) {
            $table->unsignedInteger('used_seats')->default(0)->after('active_students');
            $table->string('billing_status')->default('paid')->after('overage_per_seat');
            $table->timestamp('next_billing_at')->nullable()->after('billing_status');
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->foreignId('teacher_id')->nullable()->after('tenant_id')->constrained('users')->nullOnDelete();
            $table->string('slug')->nullable()->after('title')->unique();
            $table->unsignedInteger('price_bdt')->default(0)->after('description');
            $table->string('level')->default('Beginner')->after('price_bdt');
            $table->timestamp('published_at')->nullable()->after('status');
            $table->string('thumbnail_url')->nullable()->after('published_at');
        });

        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->unsignedInteger('progress_percentage')->default(0);
            $table->timestamp('enrolled_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique(['course_id', 'student_id']);
        });

        Schema::table('assessments', function (Blueprint $table) {
            $table->boolean('ai_generated')->default(false)->after('generated_from');
            $table->unsignedInteger('passing_mark')->default(50)->after('question_count');
            $table->unsignedInteger('total_marks')->default(100)->after('passing_mark');
        });

        Schema::table('assessment_questions', function (Blueprint $table) {
            $table->string('question_type')->default('MCQ')->after('prompt');
            $table->text('rubric')->nullable()->after('answer');
            $table->text('sample_answer')->nullable()->after('rubric');
        });

        Schema::table('submissions', function (Blueprint $table) {
            $table->string('status')->default('submitted')->after('answer_text');
            $table->text('ai_feedback')->nullable()->after('feedback');
            $table->text('teacher_feedback')->nullable()->after('ai_feedback');
        });

        Schema::table('live_classes', function (Blueprint $table) {
            $table->foreignId('teacher_id')->nullable()->after('course_id')->constrained('users')->nullOnDelete();
            $table->string('meeting_url')->nullable()->after('title');
            $table->string('recording_url')->nullable()->after('meeting_url');
        });

        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('live_class_id')->constrained('live_classes')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('absent');
            $table->timestamp('joined_at')->nullable();
            $table->timestamps();
            $table->unique(['live_class_id', 'student_id']);
        });

        Schema::table('certificates', function (Blueprint $table) {
            $table->string('certificate_number')->nullable()->after('course_title')->unique();
            $table->string('status')->default('active')->after('verification_code');
        });

        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('billing_profile_id')->nullable()->constrained('billing_profiles')->nullOnDelete();
            $table->string('invoice_number')->unique();
            $table->unsignedInteger('amount_bdt');
            $table->string('billing_period');
            $table->timestamp('issued_at');
            $table->timestamp('due_at');
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_status')->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');

        Schema::table('certificates', function (Blueprint $table) {
            $table->dropColumn(['certificate_number', 'status']);
        });

        Schema::dropIfExists('attendances');

        Schema::table('live_classes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('teacher_id');
            $table->dropColumn(['meeting_url', 'recording_url']);
        });

        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn(['status', 'ai_feedback', 'teacher_feedback']);
        });

        Schema::table('assessment_questions', function (Blueprint $table) {
            $table->dropColumn(['question_type', 'rubric', 'sample_answer']);
        });

        Schema::table('assessments', function (Blueprint $table) {
            $table->dropColumn(['ai_generated', 'passing_mark', 'total_marks']);
        });

        Schema::dropIfExists('enrollments');

        Schema::table('courses', function (Blueprint $table) {
            $table->dropConstrainedForeignId('teacher_id');
            $table->dropColumn(['slug', 'price_bdt', 'level', 'published_at', 'thumbnail_url']);
        });

        Schema::table('billing_profiles', function (Blueprint $table) {
            $table->dropColumn(['used_seats', 'billing_status', 'next_billing_at']);
        });

        Schema::dropIfExists('role_user');
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'city', 'address', 'is_active']);
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['city', 'address', 'phone', 'logo_url', 'plan_type', 'status']);
        });
    }
};
