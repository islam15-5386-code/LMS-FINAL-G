<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('submissions', function (Blueprint $table): void {
            if (! Schema::hasColumn('submissions', 'file_url')) {
                $table->string('file_url')->nullable()->after('answer_text');
            }

            if (! Schema::hasColumn('submissions', 'file_name')) {
                $table->string('file_name')->nullable()->after('file_url');
            }

            if (! Schema::hasColumn('submissions', 'file_mime')) {
                $table->string('file_mime')->nullable()->after('file_name');
            }

            if (! Schema::hasColumn('submissions', 'file_size')) {
                $table->unsignedBigInteger('file_size')->nullable()->after('file_mime');
            }
        });
    }

    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table): void {
            $drop = [];
            foreach (['file_url', 'file_name', 'file_mime', 'file_size'] as $column) {
                if (Schema::hasColumn('submissions', $column)) {
                    $drop[] = $column;
                }
            }

            if ($drop !== []) {
                $table->dropColumn($drop);
            }
        });
    }
};

