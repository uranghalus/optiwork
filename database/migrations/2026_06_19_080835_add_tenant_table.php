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
        //
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Menggantikan fd_nama_tenant
            $table->string('company_name')->nullable(); // fd_nama_perusahaan
            $table->string('status')->default('active'); // fd_status
            $table->string('location')->nullable(); // fd_lokasi
            $table->string('phone')->nullable(); // fd_phone
            $table->string('email')->nullable(); // fd_email
            $table->string('area')->nullable(); // fd_area
            $table->string('type')->nullable(); // fd_tipe_tenant
            $table->text('description')->nullable(); // fd_keterangan
            $table->string('logo_path')->nullable(); // fd_logo (menyimpan path file logo)
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('tenants');
    }
};
