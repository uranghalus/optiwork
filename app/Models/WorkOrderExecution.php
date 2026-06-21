<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkOrderExecution extends Model
{
    protected $fillable = [
        'work_order_id',
        'submitted_by',
        'execution_notes',
        'result_description',
        'attachments',
        'executed_at',
    ];

    protected $casts = [
        'attachments' => 'array',
        'executed_at' => 'datetime',
    ];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}
