<?php

use App\Http\Controllers\Api\DepartmentController as ApiDepartmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\WorkOrderController;
use App\Models\Notification;
use App\Models\WorkOrder;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/auth/redirect', [AuthController::class, 'redirect'])->name('sso.login');
Route::get('/auth/oidc/callback', [AuthController::class, 'callback']);

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        $totalWorkOrders = WorkOrder::count();
        $activeWorkOrders = WorkOrder::whereIn('status', ['pending_review', 'planning', 'assigned', 'in_progress', 'submitted'])->count();
        $pendingReview = WorkOrder::where('status', 'pending_review')->count();
        $verifiedToday = WorkOrder::where('status', 'verified')->whereDate('verified_at', today())->count();
        $urgentWorkOrders = WorkOrder::whereIn('priority', ['urgent_request_by_owner', 'urgent_by_accident'])->whereIn('status', ['pending_review', 'planning', 'assigned', 'in_progress'])->count();
        $recentWorkOrders = WorkOrder::with(['department:id,name', 'reporter:id,name'])->latest()->take(5)->get();
        $unreadNotifications = Notification::where('receiver_id', auth()->id())->where('is_read', false)->count();

        return Inertia::render('dashboard', [
            'stats' => [
                'total' => $totalWorkOrders,
                'active' => $activeWorkOrders,
                'pending_review' => $pendingReview,
                'verified_today' => $verifiedToday,
                'urgent' => $urgentWorkOrders,
            ],
            'recentWorkOrders' => $recentWorkOrders,
            'unreadNotifications' => $unreadNotifications,
            'statuses' => WorkOrder::STATUSES,
            'priorities' => WorkOrder::PRIORITIES,
        ]);
    })->name('dashboard');

    // Tenant CRUD routes
    Route::resource('tenants', TenantController::class)->except(['show', 'create', 'edit']);
    Route::post('tenants/bulk-destroy', [TenantController::class, 'bulkDestroy'])->name('tenants.bulk-destroy');

    // Department CRUD routes
    Route::resource('departments', DepartmentController::class)->except(['show', 'create', 'edit']);

    // Employee CRUD routes
    Route::resource('employees', EmployeeController::class)->except(['show', 'create', 'edit']);
    Route::get('api/employees/by-department/{department}', [EmployeeController::class, 'byDepartment'])->name('api.employees.by-department');

    // Work Order routes with show page for workflow
    Route::resource('work-orders', WorkOrderController::class)->except(['create', 'edit']);
    Route::post('work-orders/bulk-destroy', [WorkOrderController::class, 'bulkDestroy'])->name('work-orders.bulk-destroy');

    // Work Order Workflow Actions
    Route::post('work-orders/{workOrder}/review', [WorkOrderController::class, 'review'])->name('work-orders.review');
    Route::post('work-orders/{workOrder}/assign', [WorkOrderController::class, 'assign'])->name('work-orders.assign');
    Route::post('work-orders/{workOrder}/start-work', [WorkOrderController::class, 'startWork'])->name('work-orders.start-work');
    Route::post('work-orders/{workOrder}/submit-execution', [WorkOrderController::class, 'submitExecution'])->name('work-orders.submit-execution');
    Route::post('work-orders/{workOrder}/verify', [WorkOrderController::class, 'verify'])->name('work-orders.verify');

    // Notifications
    Route::get('notifications', [WorkOrderController::class, 'notifications'])->name('notifications.index');
    Route::post('notifications/{notification}/read', [WorkOrderController::class, 'markNotificationRead'])->name('notifications.read');
    Route::post('notifications/read-all', [WorkOrderController::class, 'markAllNotificationsRead'])->name('notifications.read-all');

    // API
    Route::get('/api/local-departments', [ApiDepartmentController::class, 'index'])->name('api.departments');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
