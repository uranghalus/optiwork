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
        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();

            // Nomor tiket unik otomatis (misal: WO-20260620-001)
            $table->string('work_order_number')->unique();

            // Relasi ke Tenant (Lokasi masalah terjadi)
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->onDelete('set null');

            // Relasi ke User pembuat tiket (dari SSO/lokal)
            $table->foreignId('reporter_id')->nullable()->constrained('users')->onDelete('set null');

            // Detail Pekerjaan
            $table->date('order_date');
            $table->string('title')->comment('Judul singkat pekerjaan/masalah');
            $table->text('job_description')->comment('Deskripsi lengkap masalah');

            // Prioritas dan Status
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['open', 'in_progress', 'pending', 'resolved', 'closed'])->default('open');

            // Foto/Attachment pendukung saat melapor (Disimpan di S3/MinIO)
            $table->string('attachment_path')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_orders');
    }
};
