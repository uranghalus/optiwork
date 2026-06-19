<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TenantController;
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
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
