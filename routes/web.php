<?php

use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\WorkOrderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');
// Rute untuk trigger SSO OIDC
Route::get('/auth/redirect', [AuthController::class, 'redirect'])->name('sso.login');
Route::get('/auth/oidc/callback', [AuthController::class, 'callback']);
Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Tenant CRUD routes
    Route::resource('tenants', TenantController::class)->except(['show', 'create', 'edit']);
    Route::post('tenants/bulk-destroy', [TenantController::class, 'bulkDestroy'])->name('tenants.bulk-destroy');

    // Work Order CRUD routes
    Route::resource('work-orders', WorkOrderController::class)->except(['show', 'create', 'edit']);
    Route::post('work-orders/bulk-destroy', [WorkOrderController::class, 'bulkDestroy'])->name('work-orders.bulk-destroy');

    Route::get('/api/local-departments', [DepartmentController::class, 'index'])->name('api.departments');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
