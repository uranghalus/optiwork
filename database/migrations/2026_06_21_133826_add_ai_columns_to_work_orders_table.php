<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->text('ai_summary')->nullable()->after('attachment_path');
            $table->string('ai_estimated_completion')->nullable()->after('ai_summary');
        });
    }

    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn(['ai_summary', 'ai_estimated_completion']);
        });
    }
};
