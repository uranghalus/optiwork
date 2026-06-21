<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Storage;

class WorkOrder extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'work_order_number',
        'tenant_id',
        'department_id',
        'reporter_id',
        'hod_id',
        'order_date',
        'title',
        'job_description',
        'priority',
        'execution_type',
        'scheduled_at',
        'total_personnel',
        'status',
        'attachment_path',
        'ai_summary',
        'ai_estimated_completion',
        'hod_decision_at',
        'assigned_at',
        'executed_at',
        'verified_at',
        'ai_summary',
        'ai_estimated_completion',
    ];

    protected $appends = ['attachment_url', 'priority_label', 'status_label'];

    protected $casts = [
        'order_date' => 'date',
        'scheduled_at' => 'datetime',
        'hod_decision_at' => 'datetime',
        'assigned_at' => 'datetime',
        'executed_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    public const PRIORITIES = [
        'normal' => 'Normal',
        'urgent_request_by_owner' => 'Urgent Request By Owner',
        'urgent_by_accident' => 'Urgent By Accident',
    ];

    public const STATUSES = [
        'pending_review' => 'Menunggu Review HOD',
        'planning' => 'Perencanaan',
        'assigned' => 'Ditugaskan',
        'in_progress' => 'Dalam Pengerjaan',
        'submitted' => 'Menunggu Verifikasi',
        'verified' => 'Terverifikasi',
        'rejected' => 'Ditolak',
        'revision' => 'Revisi',
        'cancelled' => 'Dibatalkan',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->work_order_number)) {
                $datePrefix = date('Ymd');
                $lastOrder = static::where('work_order_number', 'like', "WO-{$datePrefix}-%")->latest('id')->first();
                $sequence = $lastOrder ? (int) substr($lastOrder->work_order_number, -4) + 1 : 1;
                $model->work_order_number = "WO-{$datePrefix}-" . str_pad($sequence, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function getAttachmentUrlAttribute()
    {
        if ($this->attachment_path) {
            return Storage::url($this->attachment_path);
        }
        return null;
    }

    public function getPriorityLabelAttribute()
    {
        return self::PRIORITIES[$this->priority] ?? $this->priority;
    }

    public function getStatusLabelAttribute()
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function hod(): BelongsTo
    {
        return $this->belongsTo(User::class, 'hod_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(WorkOrderAssignment::class);
    }

    public function assignedEmployees(): HasMany
    {
        return $this->hasMany(WorkOrderAssignment::class)->with('employee');
    }

    public function execution(): HasOne
    {
        return $this->hasOne(WorkOrderExecution::class);
    }

    public function verification(): HasOne
    {
        return $this->hasOne(WorkOrderVerification::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }
}
