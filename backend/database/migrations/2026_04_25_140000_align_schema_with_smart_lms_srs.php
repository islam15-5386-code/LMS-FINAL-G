<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            if (! Schema::hasColumn('tenants', 'slug')) {
                $table->string('slug')->nullable()->unique()->after('name');
            }

            if (! Schema::hasColumn('tenants', 'email')) {
                $table->string('email')->nullable()->after('slug');
            }
        });

        Schema::create('tenant_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('timezone')->default('Asia/Dhaka');
            $table->string('language', 12)->default('bn');
            $table->string('currency', 12)->default('BDT');
            $table->unsignedInteger('student_limit')->default(0);
            $table->boolean('ai_enabled')->default(true);
            $table->boolean('live_class_enabled')->default(true);
            $table->timestamps();
        });

        Schema::create('branding_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('logo')->nullable();
            $table->string('primary_color', 20)->nullable();
            $table->string('secondary_color', 20)->nullable();
            $table->string('favicon')->nullable();
            $table->string('login_banner')->nullable();
            $table->timestamps();
        });

        Schema::create('domains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('domain')->nullable()->unique();
            $table->string('subdomain')->nullable()->unique();
            $table->boolean('is_verified')->default(false);
            $table->timestamps();
        });

        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('content_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('file_name');
            $table->string('file_type', 120)->nullable();
            $table->string('file_url')->nullable();
            $table->unsignedBigInteger('file_size')->default(0);
            $table->timestamps();
        });

        Schema::table('assessments', function (Blueprint $table) {
            if (! Schema::hasColumn('assessments', 'tenant_id')) {
                $table->foreignId('tenant_id')->nullable()->after('id')->constrained()->nullOnDelete();
            }

            if (! Schema::hasColumn('assessments', 'lesson_id')) {
                $table->foreignId('lesson_id')->nullable()->after('course_id')->constrained()->nullOnDelete();
            }

            if (! Schema::hasColumn('assessments', 'teacher_id')) {
                $table->foreignId('teacher_id')->nullable()->after('lesson_id')->constrained('users')->nullOnDelete();
            }

            if (! Schema::hasColumn('assessments', 'duration_minutes')) {
                $table->unsignedInteger('duration_minutes')->default(0)->after('total_marks');
            }
        });

        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assessment_id')->constrained()->cascadeOnDelete();
            $table->text('question_text');
            $table->string('question_type')->default('mcq');
            $table->text('correct_answer')->nullable();
            $table->unsignedInteger('marks')->default(1);
            $table->text('explanation')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->text('option_text');
            $table->boolean('is_correct')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('student_assessment_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assessment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('score')->default(0);
            $table->string('status')->default('in_progress');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('student_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('attempt_id')->constrained('student_assessment_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->text('answer_text')->nullable();
            $table->foreignId('selected_option_id')->nullable()->constrained('question_options')->nullOnDelete();
            $table->boolean('is_correct')->nullable();
            $table->unsignedInteger('marks_obtained')->default(0);
            $table->text('ai_feedback')->nullable();
            $table->timestamps();
        });

        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamp('deadline')->nullable();
            $table->unsignedInteger('total_marks')->default(100);
            $table->string('status')->default('draft');
            $table->timestamps();
        });

        Schema::create('assignment_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->longText('submission_text')->nullable();
            $table->string('file_url')->nullable();
            $table->unsignedInteger('marks')->nullable();
            $table->text('feedback')->nullable();
            $table->string('status')->default('submitted');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });

        Schema::table('live_classes', function (Blueprint $table) {
            if (! Schema::hasColumn('live_classes', 'tenant_id')) {
                $table->foreignId('tenant_id')->nullable()->after('id')->constrained()->nullOnDelete();
            }

            if (! Schema::hasColumn('live_classes', 'description')) {
                $table->text('description')->nullable()->after('title');
            }

            if (! Schema::hasColumn('live_classes', 'scheduled_at')) {
                $table->timestamp('scheduled_at')->nullable()->after('meeting_url');
            }
        });

        Schema::create('live_class_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('live_class_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('left_at')->nullable();
            $table->timestamps();
            $table->unique(['live_class_id', 'student_id']);
        });

        Schema::create('live_class_recordings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('live_class_id')->constrained()->cascadeOnDelete();
            $table->string('recording_url');
            $table->unsignedInteger('duration')->default(0);
            $table->timestamps();
        });

        Schema::create('progress_tracking', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->unsignedInteger('time_spent_seconds')->default(0);
            $table->timestamps();
            $table->unique(['student_id', 'lesson_id']);
        });

        Schema::create('course_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->decimal('completion_percentage', 5, 2)->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique(['student_id', 'course_id']);
        });

        Schema::table('certificates', function (Blueprint $table) {
            if (! Schema::hasColumn('certificates', 'tenant_id')) {
                $table->foreignId('tenant_id')->nullable()->after('id')->constrained()->nullOnDelete();
            }

            if (! Schema::hasColumn('certificates', 'certificate_url')) {
                $table->string('certificate_url')->nullable()->after('certificate_number');
            }

            if (! Schema::hasColumn('certificates', 'qr_code')) {
                $table->string('qr_code')->nullable()->after('certificate_url');
            }

            if (! Schema::hasColumn('certificates', 'verification_token')) {
                $table->string('verification_token')->nullable()->unique()->after('qr_code');
            }
        });

        Schema::create('certificate_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('certificate_id')->constrained()->cascadeOnDelete();
            $table->timestamp('verified_at')->useCurrent();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });

        Schema::create('question_bank', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->nullable()->constrained()->nullOnDelete();
            $table->text('question_text');
            $table->string('question_type')->default('mcq');
            $table->text('correct_answer')->nullable();
            $table->string('difficulty')->default('medium');
            $table->timestamps();
        });

        Schema::create('ai_generated_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('source_file_id')->nullable()->constrained('content_files')->nullOnDelete();
            $table->foreignId('assessment_id')->nullable()->constrained()->nullOnDelete();
            $table->text('question_text');
            $table->string('question_type')->default('mcq');
            $table->text('ai_answer')->nullable();
            $table->string('status')->default('generated');
            $table->timestamps();
        });

        Schema::create('ai_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assessment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('answer_id')->nullable()->constrained('student_answers')->nullOnDelete();
            $table->unsignedInteger('score')->default(0);
            $table->text('feedback')->nullable();
            $table->json('rubric')->nullable();
            $table->timestamp('evaluated_at')->nullable();
            $table->timestamps();
        });

        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->decimal('price', 10, 2)->default(0);
            $table->unsignedInteger('student_limit')->default(0);
            $table->boolean('ai_access')->default(false);
            $table->unsignedInteger('live_class_limit')->default(0);
            $table->boolean('white_label_enabled')->default(false);
            $table->decimal('overage_fee', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('tenant_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('subscription_plans')->cascadeOnDelete();
            $table->string('stripe_subscription_id')->nullable()->unique();
            $table->string('status')->default('active');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();
        });


        Schema::create('seat_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('total_students')->default(0);
            $table->unsignedInteger('seat_limit')->default(0);
            $table->unsignedInteger('overage_count')->default(0);
            $table->decimal('overage_fee', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('subject');
            $table->string('email');
            $table->string('status')->default('queued');
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });

        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('report_type');
            $table->string('file_url')->nullable();
            $table->string('format', 20)->default('csv');
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->string('module')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });

        Schema::create('api_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('method', 12);
            $table->string('endpoint');
            $table->unsignedSmallInteger('status_code')->nullable();
            $table->unsignedInteger('response_time_ms')->default(0);
            $table->string('ip_address', 45)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('api_logs');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('reports');
        Schema::dropIfExists('email_logs');
        Schema::dropIfExists('seat_usages');
        Schema::dropIfExists('tenant_subscriptions');
        Schema::dropIfExists('subscription_plans');
        Schema::dropIfExists('ai_evaluations');
        Schema::dropIfExists('ai_generated_questions');
        Schema::dropIfExists('question_bank');
        Schema::dropIfExists('certificate_verifications');

        Schema::table('certificates', function (Blueprint $table) {
            if (Schema::hasColumn('certificates', 'verification_token')) {
                $table->dropUnique(['verification_token']);
            }

            $columns = array_filter([
                Schema::hasColumn('certificates', 'tenant_id') ? 'tenant_id' : null,
                Schema::hasColumn('certificates', 'certificate_url') ? 'certificate_url' : null,
                Schema::hasColumn('certificates', 'qr_code') ? 'qr_code' : null,
                Schema::hasColumn('certificates', 'verification_token') ? 'verification_token' : null,
            ]);

            if (in_array('tenant_id', $columns, true)) {
                $table->dropConstrainedForeignId('tenant_id');
                $columns = array_values(array_diff($columns, ['tenant_id']));
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });

        Schema::dropIfExists('course_completions');
        Schema::dropIfExists('progress_tracking');
        Schema::dropIfExists('live_class_recordings');
        Schema::dropIfExists('live_class_participants');

        Schema::table('live_classes', function (Blueprint $table) {
            $columns = array_filter([
                Schema::hasColumn('live_classes', 'description') ? 'description' : null,
                Schema::hasColumn('live_classes', 'scheduled_at') ? 'scheduled_at' : null,
            ]);

            if (Schema::hasColumn('live_classes', 'tenant_id')) {
                $table->dropConstrainedForeignId('tenant_id');
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });

        Schema::dropIfExists('assignment_submissions');
        Schema::dropIfExists('assignments');
        Schema::dropIfExists('student_answers');
        Schema::dropIfExists('student_assessment_attempts');
        Schema::dropIfExists('question_options');
        Schema::dropIfExists('questions');

        Schema::table('assessments', function (Blueprint $table) {
            if (Schema::hasColumn('assessments', 'tenant_id')) {
                $table->dropConstrainedForeignId('tenant_id');
            }

            if (Schema::hasColumn('assessments', 'lesson_id')) {
                $table->dropConstrainedForeignId('lesson_id');
            }

            if (Schema::hasColumn('assessments', 'teacher_id')) {
                $table->dropConstrainedForeignId('teacher_id');
            }

            $columns = array_filter([
                Schema::hasColumn('assessments', 'duration_minutes') ? 'duration_minutes' : null,
            ]);

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });

        Schema::dropIfExists('content_files');
        Schema::dropIfExists('modules');
        Schema::dropIfExists('domains');
        Schema::dropIfExists('branding_settings');
        Schema::dropIfExists('tenant_settings');

        Schema::table('tenants', function (Blueprint $table) {
            $columns = array_filter([
                Schema::hasColumn('tenants', 'slug') ? 'slug' : null,
                Schema::hasColumn('tenants', 'email') ? 'email' : null,
            ]);

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
