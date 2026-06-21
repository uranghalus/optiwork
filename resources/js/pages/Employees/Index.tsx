import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { type BreadcrumbItem, type Employee, type Department, type PaginatedData, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Pencil, Plus, Save, Search, Trash2, Users, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Karyawan', href: '/employees' },
];

const employeeFormSchema = z.object({
    employee_number: z.string().min(1, 'Nomor induk wajib diisi'),
    name: z.string().min(1, 'Nama wajib diisi'),
    position: z.string().optional(),
    department_id: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

const defaultFormValues: EmployeeFormValues = {
    employee_number: '',
    name: '',
    position: '',
    department_id: '',
    phone: '',
    email: '',
};

interface DeleteState {
    open: boolean;
    employee: Employee | null;
    loading: boolean;
}

interface FormState {
    open: boolean;
    employee: Employee | null;
    loading: boolean;
}

export default function EmployeesIndex({
    employees,
    departments,
    filters,
}: {
    employees: PaginatedData<Employee>;
    departments: Pick<Department, 'id' | 'name'>[];
    filters: { search?: string; department_id?: string };
}) {
    const { flash } = usePage<SharedData>().props;

    const [form, setForm] = useState<FormState>({ open: false, employee: null, loading: false });
    const [deleteState, setDeleteState] = useState<DeleteState>({ open: false, employee: null, loading: false });
    const [searchValue, setSearchValue] = useState(filters.search ?? '');
    const [departmentFilter, setDepartmentFilter] = useState(filters.department_id ?? 'all');

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeFormSchema),
        defaultValues: defaultFormValues,
    });

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    const buildFilterParams = useCallback(
        (overrides: { search?: string; department_id?: string } = {}) => ({
            search: (overrides.search ?? searchValue) || undefined,
            department_id:
                (overrides.department_id ?? departmentFilter) !== 'all'
                    ? (overrides.department_id ?? departmentFilter)
                    : undefined,
        }),
        [searchValue, departmentFilter],
    );

    const handleSearch = useCallback(
        (value: string) => {
            setSearchValue(value);
            router.get(
                route('employees.index'),
                buildFilterParams({ search: value }),
                { preserveState: true, replace: true },
            );
        },
        [buildFilterParams],
    );

    const handleDepartmentFilter = useCallback(
        (value: string) => {
            setDepartmentFilter(value);
            router.get(
                route('employees.index'),
                buildFilterParams({ department_id: value }),
                { preserveState: true, replace: true },
            );
        },
        [buildFilterParams],
    );

    const handlePageChange = (url: string | null) => {
        if (url) router.get(url, {}, { preserveState: true });
    };

    const openCreate = () => {
        reset(defaultFormValues);
        setForm({ open: true, employee: null, loading: false });
    };

    const openEdit = (employee: Employee) => {
        reset({
            employee_number: employee.employee_number,
            name: employee.name,
            position: employee.position ?? '',
            department_id: employee.department_id?.toString() ?? '',
            phone: employee.phone ?? '',
            email: employee.email ?? '',
        });
        setForm({ open: true, employee, loading: false });
    };

    const openDelete = (employee: Employee) => {
        setDeleteState({ open: true, employee, loading: false });
    };

    const onSubmit = handleSubmit(async (data) => {
        setForm((prev) => ({ ...prev, loading: true }));

        const payload = {
            ...data,
            department_id: data.department_id ? Number(data.department_id) : null,
        };

        try {
            if (form.employee) {
                await router.put(route('employees.update', form.employee.id), payload, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setForm({ open: false, employee: null, loading: false });
                        toast.success('Karyawan berhasil diperbarui');
                    },
                    onError: (errors) => {
                        setForm((prev) => ({ ...prev, loading: false }));
                        const messages = Object.values(errors).flat();
                        messages.forEach((msg) => toast.error(msg));
                    },
                });
            } else {
                await router.post(route('employees.store'), payload, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setForm({ open: false, employee: null, loading: false });
                        toast.success('Karyawan berhasil ditambahkan');
                    },
                    onError: (errors) => {
                        setForm((prev) => ({ ...prev, loading: false }));
                        const messages = Object.values(errors).flat();
                        messages.forEach((msg) => toast.error(msg));
                    },
                });
            }
        } catch {
            setForm((prev) => ({ ...prev, loading: false }));
            toast.error('Terjadi kesalahan. Silakan coba lagi.');
        }
    });

    const confirmDelete = () => {
        if (!deleteState.employee) return;
        setDeleteState((prev) => ({ ...prev, loading: true }));

        router.delete(route('employees.destroy', deleteState.employee.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteState({ open: false, employee: null, loading: false });
                toast.success('Karyawan berhasil dihapus');
            },
            onError: () => {
                setDeleteState((prev) => ({ ...prev, loading: false }));
                toast.error('Gagal menghapus karyawan');
            },
        });
    };

    const hasActiveFilters = !!(filters.search || filters.department_id);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Karyawan" />

            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                            <Users className="h-6 w-6" />
                            Karyawan
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelola data karyawan perusahaan.
                        </p>
                    </div>
                    <Button onClick={openCreate} className="gap-2 shadow-sm">
                        <Plus className="h-4 w-4" />
                        Tambah Karyawan
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama atau nomor induk..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSearch(searchValue);
                                }
                            }}
                            className="h-10 pl-9"
                        />
                        {searchValue && (
                            <button
                                onClick={() => handleSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                    <Select value={departmentFilter} onValueChange={handleDepartmentFilter}>
                        <SelectTrigger className="h-10 w-full sm:w-[200px]">
                            <SelectValue placeholder="Semua Departemen" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Departemen</SelectItem>
                            {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                    {dept.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchValue('');
                                setDepartmentFilter('all');
                                router.get(route('employees.index'), {}, { preserveState: true, replace: true });
                            }}
                            className="gap-1 text-muted-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                            Reset Filter
                        </Button>
                    )}
                </div>

                {/* Data Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[130px]">NIP</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Jabatan</TableHead>
                                <TableHead>Departemen</TableHead>
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead className="w-[120px] text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        {hasActiveFilters
                                            ? 'Tidak ada karyawan yang sesuai dengan filter.'
                                            : 'Belum ada data karyawan.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employees.data.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell className="font-medium">{employee.employee_number}</TableCell>
                                        <TableCell>{employee.name}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {employee.position || '-'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {employee.department?.name || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                                                {employee.is_active ? 'Aktif' : 'Tidak Aktif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEdit(employee)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDelete(employee)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                    <span className="sr-only">Hapus</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {employees.last_page > 1 && (
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {employees.from ?? 0}–{employees.to ?? 0} dari {employees.total} karyawan
                        </p>
                        <div className="flex items-center gap-1">
                            {employees.links.map((link, i) => {
                                if (link.label === '...') {
                                    return (
                                        <span key={i} className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">
                                            ...
                                        </span>
                                    );
                                }
                                const label = link.label
                                    .replace('&laquo; Previous', '‹')
                                    .replace('&lsaquo;', '‹')
                                    .replace('&raquo; Next', '›')
                                    .replace('&rsaquo;', '›');
                                return (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => handlePageChange(link.url)}
                                        className="min-w-[36px]"
                                    >
                                        {label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog
                open={form.open}
                onOpenChange={(open) => {
                    if (!open && !form.loading) {
                        setForm({ open: false, employee: null, loading: false });
                        reset(defaultFormValues);
                    }
                }}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={onSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {form.employee ? 'Edit Karyawan' : 'Tambah Karyawan'}
                            </DialogTitle>
                            <DialogDescription>
                                {form.employee
                                    ? 'Perbarui data karyawan pada form di bawah.'
                                    : 'Isi form di bawah untuk menambahkan karyawan baru.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            {/* Employee Number */}
                            <div className="grid gap-2">
                                <Label htmlFor="employee_number">
                                    Nomor Induk <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="employee_number"
                                    placeholder="Ex: EMP-001"
                                    {...register('employee_number')}
                                />
                                {errors.employee_number && (
                                    <p className="text-xs text-destructive">{errors.employee_number.message}</p>
                                )}
                            </div>

                            {/* Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    Nama <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Nama lengkap"
                                    {...register('name')}
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Position */}
                            <div className="grid gap-2">
                                <Label htmlFor="position">Jabatan</Label>
                                <Input
                                    id="position"
                                    placeholder="Ex: Staff Teknisi"
                                    {...register('position')}
                                />
                                {errors.position && (
                                    <p className="text-xs text-destructive">{errors.position.message}</p>
                                )}
                            </div>

                            {/* Department */}
                            <div className="grid gap-2">
                                <Label htmlFor="department_id">Departemen</Label>
                                <Controller
                                    name="department_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value || ''}
                                            onValueChange={(val) => field.onChange(val || '')}
                                        >
                                            <SelectTrigger id="department_id">
                                                <SelectValue placeholder="Pilih departemen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Tanpa Departemen</SelectItem>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.department_id && (
                                    <p className="text-xs text-destructive">{errors.department_id.message}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telepon</Label>
                                <Input
                                    id="phone"
                                    placeholder="Ex: 0812-3456-7890"
                                    {...register('phone')}
                                />
                                {errors.phone && (
                                    <p className="text-xs text-destructive">{errors.phone.message}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Ex: user@example.com"
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">{errors.email.message}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={form.loading}
                                onClick={() => {
                                    setForm({ open: false, employee: null, loading: false });
                                    reset(defaultFormValues);
                                }}
                            >
                                <X className="h-4 w-4" />
                                Batal
                            </Button>
                            <Button type="submit" disabled={form.loading}>
                                {form.loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {form.employee ? 'Perbarui' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteState.open}
                onOpenChange={(open) => {
                    if (!open && !deleteState.loading) {
                        setDeleteState({ open: false, employee: null, loading: false });
                    }
                }}
            >
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Hapus Karyawan</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus karyawan{' '}
                            <strong>{deleteState.employee?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={deleteState.loading}
                            onClick={() => setDeleteState({ open: false, employee: null, loading: false })}
                        >
                            <X className="h-4 w-4" />
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={deleteState.loading}
                            onClick={confirmDelete}
                        >
                            {deleteState.loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
