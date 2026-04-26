<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('live_classes', function (Blueprint $table): void {
            if (! Schema::hasColumn('live_classes', 'batch_name')) {
                $table->string('batch_name')->nullable()->after('course_id');
            }

            if (! Schema::hasColumn('live_classes', 'description')) {
                $table->text('description')->nullable()->after('title');
            }

            if (! Schema::hasColumn('live_classes', 'meeting_type')) {
                $table->string('meeting_type')->default('jitsi')->after('provider');
            }

            if (! Schema::hasColumn('live_classes', 'meeting_link')) {
                $table->string('meeting_link')->nullable()->after('meeting_type');
            }

            if (! Schema::hasColumn('live_classes', 'ends_at')) {
                $table->timestamp('ends_at')->nullable()->after('start_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('live_classes', function (Blueprint $table): void {
            $dropColumns = [];

            foreach (['batch_name', 'description', 'meeting_type', 'meeting_link', 'ends_at'] as $column) {
                if (Schema::hasColumn('live_classes', $column)) {
                    $dropColumns[] = $column;
                }
            }

            if ($dropColumns !== []) {
                $table->dropColumn($dropColumns);
            }
        });
    }
};