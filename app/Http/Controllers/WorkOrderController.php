<?php

namespace App\Http\Controllers;

use App\Models\WorkOrder;
use App\Models\Tenant;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Notification;
use App\Services\AIService;
use App\Services\WhatsAppNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WorkOrderController extends Controller
{
    protected AIService $aiService;
    protected WhatsAppNotificationService $whatsappService;

    public function __construct()
    {
        $this->aiService = new AIService();
        $this->whatsappService = new WhatsAppNotificationService();
    }

    public function index(Request $request)
    {
        $query = WorkOrder::query()
            ->with(['tenant:id,name,company_name', 'department:id,name', 'reporter:id,name', 'hod:id,name']);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('work_order_number', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        $workOrders = $query->latest()
            ->paginate(10)
            ->withQueryString();

        $tenants = Tenant::select('id', 'name', 'company_name')->orderBy('name')->get();
        $departments = Department::select('id', 'name', 'code')->where('is_active', true)->orderBy('name')->get();

        return Inertia::render('WorkOrders/Index', [
            'workOrders' => $workOrders,
            'tenants' => $tenants,
            'departments' => $departments,
            'filters' => $request->only(['search', 'status', 'priority', 'department_id']),
            'statuses' => WorkOrder::STATUSES,
            'priorities' => WorkOrder::PRIORITIES,
        ]);
    }

    public function show(WorkOrder $workOrder)
    {
        $workOrder->load([
            'tenant:id,name,company_name,location',
            'department:id,name,code',
            'reporter:id,name,email',
            'hod:id,name,email',
            'assignments.employee:id,name,position,photo_path',
            'execution.submittedBy:id,name',
            'verification.verifiedBy:id,name',
        ]);

        $departments = Department::select('id', 'name', 'code')->where('is_active', true)->get();
        $employees = Employee::where('department_id', $workOrder->department_id)
            ->where('is_active', true)
            ->select('id', 'name', 'position')
            ->get();

        return Inertia::render('WorkOrders/Show', [
            'workOrder' => $workOrder,
            'departments' => $departments,
            'employees' => $employees,
            'statuses' => WorkOrder::STATUSES,
            'priorities' => WorkOrder::PRIORITIES,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'job_description' => 'required|string',
            'priority' => 'required|in:normal,urgent_request_by_owner,urgent_by_accident',
            'department_id' => 'required|integer|exists:departments,id',
            'tenant_id' => 'nullable|integer|exists:tenants,id',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:10240',
        ]);

        $data = [
            'title' => $validated['title'],
            'job_description' => $validated['job_description'],
            'priority' => $validated['priority'],
            'department_id' => $validated['department_id'],
            'tenant_id' => $validated['tenant_id'] ?? null,
            'order_date' => now()->toDateString(),
            'reporter_id' => auth()->id(),
            'status' => 'pending_review',
        ];

        if ($validated['priority'] === 'urgent_by_accident') {
            $data['execution_type'] = 'immediate';
        }

        if ($request->hasFile('attachment')) {
            $data['attachment_path'] = $request->file('attachment')->store('work-orders', 's3');
        }

        $workOrder = DB::transaction(function () use ($data) {
            return WorkOrder::create($data);
        });

        try {
            $summary = $this->aiService->summarizeWorkOrder($workOrder);
            $estimate = $this->aiService->estimateCompletionTime($workOrder);
            $category = $this->aiService->autoCategorize($workOrder);

            $workOrder->updateQuietly([
                'ai_summary' => $summary,
                'ai_estimated_completion' => $estimate,
            ]);

            $workOrder->job_description = $workOrder->job_description . "\n\n[Kategori AI: {$category}]";
            $workOrder->saveQuietly();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('AI processing failed: ' . $e->getMessage());
        }

        $department = Department::with('hod')->find($validated['department_id']);
        if ($department?->hod) {
            Notification::create([
                'work_order_id' => $workOrder->id,
                'sender_id' => auth()->id(),
                'receiver_id' => $department->hod->id,
                'type' => 'in_app',
                'channel' => 'in_app',
                'title' => 'Work Order Baru',
                'message' => "WO {$workOrder->work_order_number}: {$workOrder->title} memerlukan review Anda.",
                'data' => ['work_order_id' => $workOrder->id],
            ]);
        }

        try {
            $this->whatsappService->sendNewWorkOrderNotification($workOrder);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('WhatsApp notification failed: ' . $e->getMessage());
        }

        return redirect()->route('work-orders.index')->with('success', 'Work Order berhasil dibuat.');
    }

    public function update(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'job_description' => 'sometimes|required|string',
            'priority' => 'sometimes|required|in:normal,urgent_request_by_owner,urgent_by_accident',
            'department_id' => 'sometimes|required|integer|exists:departments,id',
            'tenant_id' => 'nullable|integer|exists:tenants,id',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:10240',
        ]);

        if ($request->hasFile('attachment')) {
            if ($workOrder->attachment_path) {
                Storage::disk('s3')->delete($workOrder->attachment_path);
            }
            $validated['attachment_path'] = $request->file('attachment')->store('work-orders', 's3');
        }

        $workOrder->update($validated);

        return redirect()->back()->with('success', 'Work Order berhasil diperbarui.');
    }

    public function destroy(WorkOrder $workOrder)
    {
        $workOrder->delete();
        return redirect()->back()->with('success', 'Work Order berhasil dihapus.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:work_orders,id'],
        ]);

        WorkOrder::whereIn('id', $request->ids)->delete();
        return redirect()->back()->with('success', count($request->ids) . ' Work Order berhasil dihapus.');
    }

    // ─── WORKFLOW ACTIONS ─────────────────────────────────────────────

    public function review(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'notes' => 'nullable|string',
            'execution_type' => 'required_if:action,approve|in:immediate,scheduled',
            'scheduled_at' => 'required_if:execution_type,scheduled|nullable|date|after:now',
        ]);

        if ($workOrder->status !== 'pending_review') {
            return redirect()->back()->with('error', 'Work Order tidak dalam status review.');
        }

        if ($validated['action'] === 'reject') {
            $workOrder->update([
                'status' => 'rejected',
                'hod_id' => auth()->id(),
                'hod_decision_at' => now(),
            ]);

            Notification::create([
                'work_order_id' => $workOrder->id,
                'sender_id' => auth()->id(),
                'receiver_id' => $workOrder->reporter_id,
                'type' => 'in_app',
                'channel' => 'in_app',
                'title' => 'WO Ditolak',
                'message' => "WO {$workOrder->work_order_number} ditolak. Alasan: " . ($validated['notes'] ?? 'Tidak ada alasan'),
                'data' => ['work_order_id' => $workOrder->id],
            ]);

            return redirect()->back()->with('success', 'Work Order ditolak.');
        }

        // Business rule: urgent_by_accident must always be executed immediately.
        // Scheduling UI may still send values; we bypass/ignore them server-side.
        $executionType = $validated['execution_type'];
        $scheduledAt = $validated['scheduled_at'] ?? null;

        if ($workOrder->priority === 'urgent_by_accident') {
            $executionType = 'immediate';
            $scheduledAt = null;
        }

        $updateData = [
            'status' => 'planning',
            'hod_id' => auth()->id(),
            'execution_type' => $executionType,
            'hod_decision_at' => now(),
        ];

        if ($executionType === 'scheduled' && $scheduledAt) {
            $updateData['scheduled_at'] = $scheduledAt;
        }


        $workOrder->update($updateData);

        return redirect()->route('work-orders.show', $workOrder->id)
            ->with('success', 'Work Order disetujui. Silakan assign karyawan.');
    }

    public function assign(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'assignments' => 'required|array|min:1',
            'assignments.*.employee_id' => 'required|integer|exists:employees,id',
            'assignments.*.role' => 'required|in:leader,member',
            'assignments.*.notes' => 'nullable|string',
            'total_personnel' => 'required|integer|min:1',
        ]);

        if (!in_array($workOrder->status, ['planning', 'assigned'])) {
            return redirect()->back()->with('error', 'Work Order tidak dalam status penugasan.');
        }

        DB::transaction(function () use ($workOrder, $validated) {
            $workOrder->assignments()->delete();

            foreach ($validated['assignments'] as $assignment) {
                $workOrder->assignments()->create([
                    'employee_id' => $assignment['employee_id'],
                    'role' => $assignment['role'],
                    'notes' => $assignment['notes'] ?? null,
                ]);
            }

            $workOrder->update([
                'status' => 'assigned',
                'total_personnel' => $validated['total_personnel'],
                'assigned_at' => now(),
            ]);
        });

        try {
            $this->whatsappService->sendWorkOrderAssignedNotification($workOrder);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('WhatsApp notification failed: ' . $e->getMessage());
        }

        if ($workOrder->execution_type === 'immediate') {
            $workOrder->update(['status' => 'in_progress']);
        }

        return redirect()->route('work-orders.show', $workOrder->id)
            ->with('success', 'Karyawan berhasil ditugaskan.');
    }

    public function submitExecution(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'result_description' => 'required|string',
            'execution_notes' => 'nullable|string',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,pdf,doc,docx|max:10240',
        ]);

        if ($workOrder->status !== 'in_progress') {
            return redirect()->back()->with('error', 'Work Order tidak dalam status pengerjaan.');
        }

        $attachmentPaths = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $attachmentPaths[] = $file->store('work-order-executions', 's3');
            }
        }

        DB::transaction(function () use ($workOrder, $validated, $attachmentPaths) {
            $workOrder->execution()?->delete();

            $workOrder->execution()->create([
                'submitted_by' => auth()->id(),
                'execution_notes' => $validated['execution_notes'] ?? null,
                'result_description' => $validated['result_description'],
                'attachments' => !empty($attachmentPaths) ? $attachmentPaths : null,
                'executed_at' => now(),
            ]);

            $workOrder->update([
                'status' => 'submitted',
                'executed_at' => now(),
            ]);
        });

        try {
            $this->whatsappService->sendWorkOrderSubmittedNotification($workOrder);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('WhatsApp notification failed: ' . $e->getMessage());
        }

        return redirect()->route('work-orders.show', $workOrder->id)
            ->with('success', 'Hasil pekerjaan berhasil dikirim.');
    }

    public function verify(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'verification_status' => 'required|in:approved,rejected,revision',
            'notes' => 'nullable|string',
        ]);

        if ($workOrder->status !== 'submitted') {
            return redirect()->back()->with('error', 'Work Order tidak menunggu verifikasi.');
        }

        DB::transaction(function () use ($workOrder, $validated) {
            $workOrder->verification()?->delete();

            $workOrder->verification()->create([
                'verified_by' => auth()->id(),
                'status' => $validated['verification_status'],
                'notes' => $validated['notes'] ?? null,
                'verified_at' => now(),
            ]);

            $newStatus = match ($validated['verification_status']) {
                'approved' => 'verified',
                'rejected' => 'rejected',
                'revision' => 'revision',
            };

            $workOrder->update([
                'status' => $newStatus,
                'verified_at' => now(),
            ]);
        });

        if ($validated['verification_status'] === 'approved') {
            try {
                $this->whatsappService->sendWorkOrderVerifiedNotification($workOrder);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('WhatsApp notification failed: ' . $e->getMessage());
            }
        }

        return redirect()->route('work-orders.show', $workOrder->id)
            ->with('success', 'Work Order berhasil diverifikasi.');
    }

    public function startWork(WorkOrder $workOrder)
    {
        if ($workOrder->status !== 'assigned') {
            return redirect()->back()->with('error', 'Work Order tidak dalam status ditugaskan.');
        }

        $workOrder->update(['status' => 'in_progress']);

        return redirect()->route('work-orders.show', $workOrder->id)
            ->with('success', 'Pekerjaan dimulai.');
    }

    public function notifications(Request $request)
    {
        $notifications = Notification::where('receiver_id', auth()->id())
            ->orWhereNull('receiver_id')
            ->latest()
            ->paginate(20);

        $unreadCount = Notification::where('receiver_id', auth()->id())
            ->where('is_read', false)
            ->count();

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function markNotificationRead(Notification $notification)
    {
        if ($notification->receiver_id === auth()->id()) {
            $notification->update(['is_read' => true, 'read_at' => now()]);
        }

        return redirect()->back();
    }

    public function markAllNotificationsRead()
    {
        Notification::where('receiver_id', auth()->id())
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return redirect()->back()->with('success', 'Semua notifikasi ditandai sudah dibaca.');
    }
}
