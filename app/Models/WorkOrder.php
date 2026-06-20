<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class WorkOrder extends Model
{
    //
    use SoftDeletes;

    protected $fillable = [
        'work_order_number',
        'tenant_id',
        'department_id',
        'reporter_id',
        'order_date',
        'title',
        'job_description',
        'priority',
        'status',
        'attachment_path'
    ];

    protected $appends = ['attachment_url'];

    protected $casts = [
        'order_date' => 'date',
    ];

    /**
     * Otomatisasi Pembuatan Nomor Work Order saat insert baru
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->work_order_number)) {
                // Format: WO-YYYYMMDD-XXXX
                $datePrefix = date('Ymd');
                $lastOrder = static::where('work_order_number', 'like', "WO-{$datePrefix}-%")->latest('id')->first();

                $sequence = $lastOrder ? (int) substr($lastOrder->work_order_number, -4) + 1 : 1;
                $model->work_order_number = "WO-{$datePrefix}-" . str_pad($sequence, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    /**
     * Accessor untuk URL lampiran dari MinIO
     */
    public function getAttachmentUrlAttribute()
    {
        if ($this->attachment_path) {
            // Karena ini file operasional, sebaiknya pakai temporaryUrl untuk keamanan
            return Storage::url($this->attachment_path);
        }
        return null;
    }

    /**
     * RELASI: Work Order dibuat untuk Tenant tertentu
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * RELASI: Work Order dilaporkan oleh User tertentu
     */
    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }
}
