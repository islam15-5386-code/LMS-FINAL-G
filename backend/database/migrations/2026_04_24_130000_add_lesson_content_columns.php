<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->string('content_url')->nullable()->after('title');
            $table->string('content_mime', 120)->nullable()->after('content_url');
            $table->string('content_original_name')->nullable()->after('content_mime');
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['content_url', 'content_mime', 'content_original_name']);
        });
    }
};
