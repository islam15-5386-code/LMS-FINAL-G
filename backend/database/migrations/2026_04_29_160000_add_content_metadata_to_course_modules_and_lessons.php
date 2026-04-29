<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_modules', function (Blueprint $table): void {
            if (! Schema::hasColumn('course_modules', 'description')) {
                $table->text('description')->nullable()->after('title');
            }
        });

        Schema::table('lessons', function (Blueprint $table): void {
            if (! Schema::hasColumn('lessons', 'description')) {
                $table->text('description')->nullable()->after('title');
            }
            if (! Schema::hasColumn('lessons', 'youtube_url')) {
                $table->string('youtube_url')->nullable()->after('content_url');
            }
            if (! Schema::hasColumn('lessons', 'embed_url')) {
                $table->string('embed_url')->nullable()->after('youtube_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table): void {
            $columns = [];
            if (Schema::hasColumn('lessons', 'description')) {
                $columns[] = 'description';
            }
            if (Schema::hasColumn('lessons', 'youtube_url')) {
                $columns[] = 'youtube_url';
            }
            if (Schema::hasColumn('lessons', 'embed_url')) {
                $columns[] = 'embed_url';
            }
            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });

        Schema::table('course_modules', function (Blueprint $table): void {
            if (Schema::hasColumn('course_modules', 'description')) {
                $table->dropColumn('description');
            }
        });
    }
};
