<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_uploads', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('label')->nullable();
            $table->string('file_name');
            $table->string('file_mime')->nullable();
            $table->unsignedBigInteger('file_size')->default(0);
            $table->string('file_url');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_uploads');
    }
};

