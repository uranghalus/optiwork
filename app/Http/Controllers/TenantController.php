<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTenantRequest;
use App\Http\Requests\UpdateTenantRequest;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TenantController extends Controller
{

    /** LINK
     * Menampilkan halaman daftar tenant.
     */
    public function index(Request $request)
    {
        $query = Tenant::query();

        // Fitur Pencarian
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('company_name', 'like', "%{$request->search}%");
        }

        // Fitur Filter Status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // OPTIMASI: Paginasi Server-Side (Ambil 10 data per halaman)
        $tenants = $query->latest()
            ->paginate(10)
            ->withQueryString(); // Menjaga query string URL tetap ada saat pindah halaman

        return Inertia::render('Tenants/Index', [
            'tenants' => $tenants,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    /** LINK
     * Menyimpan data tenant baru dari form.
     */
    public function store(StoreTenantRequest $request)
    {
        $validatedData = $request->validated();

        if ($request->hasFile('logo')) {
            // Simpan ke S3
            $validatedData['logo_path'] = $request->file('logo')->store('tenants/logos', 's3');
        }

        // Hapus key 'logo' dari validated data karena bukan kolom database
        unset($validatedData['logo']);

        Tenant::create($validatedData);

        // Setelah sukses simpan, kembalikan user ke halaman index beserta flash message
        return redirect()->route('tenants.index')->with('success', 'Mitra/Tenant berhasil ditambahkan.');
    }

    /**LINK
     * Mengubah data tenant.
     */
    public function update(UpdateTenantRequest $request, Tenant $tenant)
    {
        $validatedData = $request->validated();

        if ($request->hasFile('logo')) {
            // Hapus file lama dari S3 terlebih dahulu
            if ($tenant->logo_path) {
                Storage::disk('s3')->delete($tenant->logo_path);
            }
            // Upload file baru ke S3
            $validatedData['logo_path'] = $request->file('logo')->store('tenants/logos', 's3');
        }

        // Hapus key 'logo' dari validated data karena bukan kolom database
        unset($validatedData['logo']);

        $tenant->update($validatedData);

        return redirect()->back()->with('success', 'Data Mitra/Tenant berhasil diperbarui.');
    }

    /**
     * Menghapus data tenant (Soft Delete).
     */
    public function destroy(Tenant $tenant)
    {
        $tenant->delete();

        return redirect()->back()->with('success', 'Mitra/Tenant berhasil dihapus.');
    }

    /**
     * Menghapus banyak data tenant sekaligus (Bulk Delete).
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids'   => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:tenants,id'],
        ]);

        Tenant::whereIn('id', $request->ids)->delete();

        return redirect()->back()->with('success', count($request->ids) . ' Mitra/Tenant berhasil dihapus.');
    }
}
