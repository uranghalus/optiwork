<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWorkOrderRequest;
use App\Http\Requests\UpdateWorkOrderRequest;
use App\Models\WorkOrder;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class WorkOrderController extends Controller
{

    /** LINK
     * Menampilkan halaman daftar work order.
     */
    public function index(Request $request)
    {
        $query = WorkOrder::query()->with('tenant:id,name,company_name');

        // Fitur Pencarian
        if ($request->filled('search')) {
            $query->where('title', 'like', "%{$request->search}%")
                ->orWhere('work_order_number', 'like', "%{$request->search}%");
        }

        // Fitur Filter Status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Fitur Filter Prioritas
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        // OPTIMASI: Paginasi Server-Side (Ambil 10 data per halaman)
        $workOrders = $query->latest()
            ->paginate(10)
            ->withQueryString(); // Menjaga query string URL tetap ada saat pindah halaman

        // Ambil semua tenant untuk dropdown di form
        $tenants = Tenant::select('id', 'name', 'company_name')
            ->orderBy('name')
            ->get();

        return Inertia::render('WorkOrders/Index', [
            'workOrders' => $workOrders,
            'tenants'    => $tenants,
            'filters'    => $request->only(['search', 'status', 'priority'])
        ]);
    }

    /** LINK
     * Menyimpan data work order baru dari form.
     */
    public function store(StoreWorkOrderRequest $request)
    {
        $validatedData = $request->validated();

        // Handle file attachment upload
        if ($request->hasFile('attachment')) {
            $validatedData['attachment_path'] = $request->file('attachment')->store('work-orders', 's3');
        }
        unset($validatedData['attachment']);

        WorkOrder::create([
            ...$validatedData,
            'order_date' => now()->toDateString(),
            'reporter_id' => auth()->id(),
        ]);

        return redirect()->route('work-orders.index')->with('success', 'Work Order berhasil ditambahkan.');
    }

    /**LINK
     * Mengubah data work order.
     */
    public function update(UpdateWorkOrderRequest $request, WorkOrder $workOrder)
    {
        $validatedData = $request->validated();

        // Handle file attachment upload (replace old if exists)
        if ($request->hasFile('attachment')) {
            // Delete old attachment if exists
            if ($workOrder->attachment_path) {
                Storage::disk('s3')->delete($workOrder->attachment_path);
            }
            $validatedData['attachment_path'] = $request->file('attachment')->store('work-orders', 's3');
        }
        unset($validatedData['attachment']);

        $workOrder->update($validatedData);

        return redirect()->back()->with('success', 'Data Work Order berhasil diperbarui.');
    }

    /**
     * Menghapus data work order (Soft Delete).
     */
    public function destroy(WorkOrder $workOrder)
    {
        $workOrder->delete();

        return redirect()->back()->with('success', 'Work Order berhasil dihapus.');
    }

    /**
     * Menghapus banyak data work order sekaligus (Bulk Delete).
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids'   => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:work_orders,id'],
        ]);

        WorkOrder::whereIn('id', $request->ids)->delete();

        return redirect()->back()->with('success', count($request->ids) . ' Work Order berhasil dihapus.');
    }
}
