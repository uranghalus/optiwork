<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppNotificationService
{
    protected string $apiUrl;
    protected string $apiToken;
    protected string $sender;

    public function __construct()
    {
        $this->apiUrl = config('services.whatsapp.api_url', env('WHATSAPP_API_URL', ''));
        $this->apiToken = config('services.whatsapp.api_token', env('WHATSAPP_API_TOKEN', ''));
        $this->sender = config('services.whatsapp.sender', env('WHATSAPP_SENDER', ''));
    }

    public function sendNewWorkOrderNotification(WorkOrder $workOrder): void
    {
        $hod = $this->getDepartmentHOD($workOrder->department_id);
        if (!$hod || !$hod->phone) {
            Log::info("HOD or phone not found for department {$workOrder->department_id}");
            return;
        }

        $message = "🔔 *WORK ORDER BARU* 🔔\n\n"
            . "Nomor: {$workOrder->work_order_number}\n"
            . "Judul: {$workOrder->title}\n"
            . "Prioritas: {$workOrder->priority_label}\n"
            . "Dibuat oleh: {$workOrder->reporter?->name}\n"
            . "Deskripsi: {$workOrder->job_description}\n\n"
            . "Silakan login ke sistem OptiWork untuk mereview work order ini.\n\n"
            . "Terima kasih.";

        $this->sendMessage($hod->phone, $message, $workOrder, $hod);
    }

    public function sendWorkOrderAssignedNotification(WorkOrder $workOrder): void
    {
        $assignments = $workOrder->assignments()->with('employee')->get();

        foreach ($assignments as $assignment) {
            $employee = $assignment->employee;
            if (!$employee || !$employee->phone) continue;

            $roleLabel = $assignment->role === 'leader' ? 'Ketua Tim' : 'Anggota Tim';
            $scheduleInfo = '';
            if ($workOrder->scheduled_at) {
                $scheduleInfo = "\nJadwal: {$workOrder->scheduled_at->format('d/m/Y H:i')}";
            }

            $message = "📋 *PENUGASAN WORK ORDER* 📋\n\n"
                . "Nomor: {$workOrder->work_order_number}\n"
                . "Judul: {$workOrder->title}\n"
                . "Peran: {$roleLabel}\n"
                . "Prioritas: {$workOrder->priority_label}"
                . $scheduleInfo
                . "\n\nSilakan login ke sistem OptiWork untuk melihat detail tugas.\n\n"
                . "Terima kasih.";

            $this->sendMessage($employee->phone, $message, $workOrder);
        }
    }

    public function sendWorkOrderSubmittedNotification(WorkOrder $workOrder): void
    {
        $hod = $this->getDepartmentHOD($workOrder->department_id);
        if (!$hod || !$hod->phone) return;

        $message = "✅ *WORK ORDER SELESAI DIKERJAKAN* ✅\n\n"
            . "Nomor: {$workOrder->work_order_number}\n"
            . "Judul: {$workOrder->title}\n"
            . "Tim telah menyelesaikan pekerjaan dan mengirimkan hasil.\n\n"
            . "Silakan login ke sistem OptiWork untuk melakukan verifikasi.\n\n"
            . "Terima kasih.";

        $this->sendMessage($hod->phone, $message, $workOrder, $hod);
    }

    public function sendWorkOrderVerifiedNotification(WorkOrder $workOrder): void
    {
        $assignments = $workOrder->assignments()->with('employee')->get();

        foreach ($assignments as $assignment) {
            $employee = $assignment->employee;
            if (!$employee || !$employee->phone) continue;

            $message = "🎉 *WORK ORDER TERVERIFIKASI* 🎉\n\n"
                . "Nomor: {$workOrder->work_order_number}\n"
                . "Judul: {$workOrder->title}\n"
                . "Status: Terverifikasi ✅\n\n"
                . "Pekerjaan telah diverifikasi oleh HOD. Terima kasih atas pekerjaan baiknya!\n\n"
                . "Terima kasih.";

            $this->sendMessage($employee->phone, $message, $workOrder);
        }
    }

    protected function sendMessage(string $phone, string $message, ?WorkOrder $workOrder = null, ?User $receiver = null): bool
    {
        if (empty($this->apiUrl) || empty($this->apiToken)) {
            Log::info("WhatsApp API not configured. Would send to {$phone}: {$message}");
            $this->saveNotification($workOrder, $receiver, $message, 'whatsapp');
            return false;
        }

        try {
            $response = Http::withToken($this->apiToken)
                ->timeout(15)
                ->post($this->apiUrl . '/send', [
                    'phone' => $phone,
                    'message' => $message,
                    'sender' => $this->sender,
                ]);

            if ($response->successful()) {
                $this->saveNotification($workOrder, $receiver, $message, 'whatsapp', true);
                return true;
            }

            Log::warning('WhatsApp API error: ' . $response->body());
            $this->saveNotification($workOrder, $receiver, $message, 'whatsapp');
            return false;
        } catch (\Exception $e) {
            Log::error('WhatsApp Service error: ' . $e->getMessage());
            $this->saveNotification($workOrder, $receiver, $message, 'whatsapp');
            return false;
        }
    }

    protected function saveNotification(?WorkOrder $workOrder, ?User $receiver, string $message, string $channel, bool $sent = false): void
    {
        try {
            Notification::create([
                'work_order_id' => $workOrder?->id,
                'receiver_id' => $receiver?->id,
                'type' => 'wa_notification',
                'channel' => $channel,
                'title' => 'Notifikasi WhatsApp',
                'message' => $message,
                'is_read' => false,
                'sent_at' => $sent ? now() : null,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to save notification: ' . $e->getMessage());
        }
    }

    protected function getDepartmentHOD(?int $departmentId): ?User
    {
        if (!$departmentId) return null;

        $department = \App\Models\Department::with('hod')->find($departmentId);
        return $department?->hod;
    }
}
