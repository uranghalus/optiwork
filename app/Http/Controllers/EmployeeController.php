<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with('department:id,name');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('employee_number', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        $employees = $query->orderBy('name')->paginate(10)->withQueryString();
        $departments = Department::select('id', 'name')->where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'departments' => $departments,
            'filters' => $request->only(['search', 'department_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_number' => 'required|string|max:50|unique:employees,employee_number',
            'name' => 'required|string|max:255',
            'position' => 'nullable|string|max:255',
            'department_id' => 'nullable|integer|exists:departments,id',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'user_id' => 'nullable|integer|exists:users,id',
        ]);

        Employee::create($validated);

        return redirect()->route('employees.index')->with('success', 'Karyawan berhasil ditambahkan.');
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'employee_number' => 'required|string|max:50|unique:employees,employee_number,' . $employee->id,
            'name' => 'required|string|max:255',
            'position' => 'nullable|string|max:255',
            'department_id' => 'nullable|integer|exists:departments,id',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'user_id' => 'nullable|integer|exists:users,id',
            'is_active' => 'boolean',
        ]);

        $employee->update($validated);

        return redirect()->back()->with('success', 'Karyawan berhasil diperbarui.');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return redirect()->back()->with('success', 'Karyawan berhasil dihapus.');
    }

    public function byDepartment(Department $department)
    {
        $employees = Employee::where('department_id', $department->id)
            ->where('is_active', true)
            ->select('id', 'name', 'position')
            ->orderBy('name')
            ->get();

        return response()->json($employees);
    }
}
