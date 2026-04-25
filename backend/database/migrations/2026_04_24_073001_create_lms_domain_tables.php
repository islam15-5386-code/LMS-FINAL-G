<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('subdomain')->unique();
            $table->string('logo_text', 12)->default('BA');
            $table->string('primary_color', 20)->default('#0f766e');
            $table->string('accent_color', 20)->default('#f97316');
            $table->string('support_email');
            $table->string('custom_domain')->nullable()->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();
        });

        Schema::create('billing_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('plan');
            $table->unsignedInteger('active_students')->default(0);
            $table->unsignedInteger('monthly_price');
            $table->unsignedInteger('seat_limit');
            $table->unsignedInteger('overage_per_seat');
            $table->timestamps();
        });

        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('category');
            $table->text('description');
            $table->string('status')->default('draft');
            $table->decimal('price', 10, 2)->default(0);
            $table->unsignedInteger('enrollment_count')->default(0);
            $table->timestamps();
        });

        Schema::create('course_modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->unsignedInteger('drip_days')->default(0);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_module_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('type');
            $table->unsignedInteger('duration_minutes')->default(0);
            $table->timestamp('release_at')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('lesson_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique(['lesson_id', 'user_id']);
        });

        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('type');
            $table->string('status')->default('draft');
            $table->text('generated_from')->nullable();
            $table->unsignedInteger('question_count')->default(0);
            $table->json('rubric_keywords')->nullable();
            $table->boolean('teacher_reviewed')->default(false);
            $table->timestamps();
        });

        Schema::create('assessment_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained()->cascadeOnDelete();
            $table->text('prompt');
            $table->json('options')->nullable();
            $table->text('answer')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->longText('answer_text');
            $table->unsignedInteger('score')->default(0);
            $table->text('feedback')->nullable();
            $table->boolean('passed')->default(false);
            $table->timestamp('submitted_at');
            $table->timestamps();
        });

        Schema::create('live_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->timestamp('start_at');
            $table->unsignedInteger('duration_minutes');
            $table->unsignedInteger('participant_limit')->default(100);
            $table->string('provider')->default('Jitsi');
            $table->boolean('reminder_24h')->default(true);
            $table->boolean('reminder_1h')->default(true);
            $table->string('status')->default('scheduled');
            $table->timestamps();
        });

        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('course_title');
            $table->timestamp('issued_at');
            $table->string('verification_code')->unique();
            $table->boolean('revoked')->default(false);
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->nullOnDelete();
            $table->string('audience');
            $table->string('type');
            $table->text('message');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();
        });

        Schema::create('audit_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->nullOnDelete();
            $table->string('actor');
            $table->string('action');
            $table->string('target');
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();
        });

        Schema::create('compliance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('employee_name');
            $table->string('department');
            $table->string('role_title');
            $table->string('course_title');
            $table->unsignedInteger('completion_percent')->default(0);
            $table->boolean('certified')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compliance_records');
        Schema::dropIfExists('audit_events');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('live_classes');
        Schema::dropIfExists('submissions');
        Schema::dropIfExists('assessment_questions');
        Schema::dropIfExists('assessments');
        Schema::dropIfExists('lesson_user');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('course_modules');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('billing_profiles');
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
        });
        Schema::dropIfExists('tenants');
    }
};
