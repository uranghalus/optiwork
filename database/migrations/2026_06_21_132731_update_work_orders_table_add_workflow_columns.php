<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->enum('execution_type', ['immediate', 'scheduled'])->nullable()->after('priority')->comment('immediate: eksekusi langsung, scheduled: dijadwalkan');
            $table->timestamp('scheduled_at')->nullable()->after('execution_type')->comment('Jadwal pengerjaan jika execution_type=scheduled');
            $table->integer('total_personnel')->nullable()->after('scheduled_at')->comment('Jumlah personel yang dibutuhkan');
            $table->foreignId('hod_id')->nullable()->after('reporter_id')->constrained('users')->nullOnDelete()->comment('HOD yang memproses');
            $table->timestamp('hod_decision_at')->nullable()->after('hod_id')->comment('Waktu HOD mengambil keputusan');
            $table->timestamp('assigned_at')->nullable()->after('hod_decision_at')->comment('Waktu assign karyawan');
            $table->timestamp('executed_at')->nullable()->after('assigned_at')->comment('Waktu eksekusi pekerjaan');
            $table->timestamp('verified_at')->nullable()->after('executed_at')->comment('Waktu verifikasi HOD');
        });

        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('work_orders', function (Blueprint $table) {
            $table->enum('status', [
                'pending_review',
                'planning',
                'assigned',
                'in_progress',
                'submitted',
                'verified',
                'rejected',
                'revision',
                'cancelled'
            ])->default('pending_review')->after('priority');
        });

        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn('department_id');
        });

        Schema::table('work_orders', function (Blueprint $table) {
            $table->foreignId('department_id')->nullable()->after('tenant_id')->constrained()->nullOnDelete()->comment('Departemen tujuan');
        });

        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn('priority');
        });

        Schema::table('work_orders', function (Blueprint $table) {
            $table->enum('priority', [
                'normal',
                'urgent_request_by_owner',
                'urgent_by_accident'
            ])->default('normal')->after('job_description');
        });
    }

    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn([
                'execution_type',
                'scheduled_at',
                'total_personnel',
                'hod_id',
                'hod_decision_at',
                'assigned_at',
                'executed_at',
                'verified_at',
            ]);
        });

        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('work_orders', function (Blueprint $table) {
            $table->enum('status', ['open', 'in_progress', 'pending', 'resolved', 'closed'])->default('open')->after('priority');
        });

        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn('priority');
        });

        Schema::table('work_orders', function (Blueprint $table) {
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium')->after('job_description');
        });
    }
};
