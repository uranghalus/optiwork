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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem, type Department, type PaginatedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, CheckCircle2, Loader2, Mail, Network, Pencil, Phone, Plus, Save, Search, Trash2, X, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Departemen', href: '/departments' },
];

const departmentFormSchema = z.object({
    code: z.string().min(1, 'Kode departemen wajib diisi'),
    name: z.string().min(1, 'Nama departemen wajib diisi'),
    description: z.string().optional(),
    hod_id: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

const defaultFormValues: DepartmentFormValues = {
    code: '',
    name: '',
    description: '',
    hod_id: '',
    phone: '',
    email: '',
};

interface DeleteState {
    open: boolean;
    department: Department | null;
    loading: boolean;
}

interface FormState {
    open: boolean;
    department: Department | null;
    loading: boolean;
}

export default function DepartmentsIndex({
    departments,
    filters,
}: {
    departments: PaginatedData<Department>;
    filters: { search?: string };
}) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    const [form, setForm] = useState<FormState>({ open: false, department: null, loading: false });
    const [deleteState, setDeleteState] = useState<DeleteState>({ open: false, department: null, loading: false });
    const [searchValue, setSearchValue] = useState(filters.search ?? '');

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<DepartmentFormValues>({
        resolver: zodResolver(departmentFormSchema),
        defaultValues: defaultFormValues,
    });

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    const handleSearch = useCallback(
        (value: string) => {
            setSearchValue(value);
            router.get(
                route('departments.index'),
                { search: value || undefined },
                { preserveState: true, replace: true },
            );
        },
        [],
    );

    const handlePageChange = (url: string | null) => {
        if (url) router.get(url, {}, { preserveState: true });
    };

    const openCreate = () => {
        reset(defaultFormValues);
        setForm({ open: true, department: null, loading: false });
    };

    const openEdit = (department: Department) => {
        reset({
            code: department.code,
            name: department.name,
            description: department.description ?? '',
            hod_id: department.hod_id?.toString() ?? '',
            phone: department.phone ?? '',
            email: department.email ?? '',
        });
        setForm({ open: true, department, loading: false });
    };

    const openDelete = (department: Department) => {
        setDeleteState({ open: true, department, loading: false });
    };

    const onSubmit = handleSubmit(async (data) => {
        setForm((prev) => ({ ...prev, loading: true }));

        const payload = {
            ...data,
            hod_id: data.hod_id ? Number(data.hod_id) : null,
            description: data.description || null,
            phone: data.phone || null,
            email: data.email || null,
        };

        try {
            if (form.department) {
                await router.put(route('departments.update', form.department.id), payload, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setForm({ open: false, department: null, loading: false });
                        toast.success('Departemen berhasil diperbarui');
                    },
                    onError: (errors) => {
                        setForm((prev) => ({ ...prev, loading: false }));
                        const messages = Object.values(errors).flat();
                        messages.forEach((msg) => toast.error(msg));
                    },
                });
            } else {
                await router.post(route('departments.store'), payload, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setForm({ open: false, department: null, loading: false });
                        toast.success('Departemen berhasil ditambahkan');
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
        if (!deleteState.department) return;
        setDeleteState((prev) => ({ ...prev, loading: true }));

        router.delete(route('departments.destroy', deleteState.department.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteState({ open: false, department: null, loading: false });
                toast.success('Departemen berhasil dihapus');
            },
            onError: () => {
                setDeleteState((prev) => ({ ...prev, loading: false }));
                toast.error('Gagal menghapus departemen');
            },
        });
    };

    const hasActiveFilters = !!filters.search;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Departemen" />

            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                            <Network className="h-6 w-6" />
                            Departemen
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelola data departemen perusahaan.
                        </p>
                    </div>
                    <Button onClick={openCreate} className="gap-2 shadow-sm">
                        <Plus className="h-4 w-4" />
                        Tambah Departemen
                    </Button>
                </div>

                {/* Search */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari kode atau nama departemen..."
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
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchValue('');
                                router.get(
                                    route('departments.index'),
                                    {},
                                    { preserveState: true, replace: true },
                                );
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
                                <TableHead className="w-[120px]">Kode</TableHead>
                                <TableHead>Nama Departemen</TableHead>
                                <TableHead>Kepala Departemen</TableHead>
                                <TableHead className="w-[130px]">Telepon</TableHead>
                                <TableHead className="w-[180px]">Email</TableHead>
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead className="w-[120px] text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {departments.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                        {hasActiveFilters
                                            ? 'Tidak ada departemen yang sesuai dengan filter.'
                                            : 'Belum ada data departemen.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                departments.data.map((department) => (
                                    <TableRow key={department.id}>
                                        <TableCell className="font-mono text-xs font-medium">{department.code}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                <span>{department.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {department.hod?.name || '-'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {department.phone ? (
                                                <span className="flex items-center gap-1.5">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    {department.phone}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {department.email ? (
                                                <span className="flex items-center gap-1.5">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    {department.email}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={department.is_active ? 'default' : 'secondary'}>
                                                {department.is_active ? (
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <XCircle className="h-3 w-3" />
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEdit(department)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDelete(department)}
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
                {departments.last_page > 1 && (
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {departments.from ?? 0}–{departments.to ?? 0} dari {departments.total} departemen
                        </p>
                        <div className="flex items-center gap-1">
                            {departments.links.map((link, i) => {
                                if (link.label === '...') {
                                    return (
                                        <span
                                            key={i}
                                            className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
                                        >
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
                        setForm({ open: false, department: null, loading: false });
                        reset(defaultFormValues);
                    }
                }}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={onSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {form.department ? 'Edit Departemen' : 'Tambah Departemen'}
                            </DialogTitle>
                            <DialogDescription>
                                {form.department
                                    ? 'Perbarui data departemen pada form di bawah.'
                                    : 'Isi form di bawah untuk menambahkan departemen baru.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            {/* Code */}
                            <div className="grid gap-2">
                                <Label htmlFor="code">
                                    Kode Departemen <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="code"
                                    placeholder="Ex: IT"
                                    {...register('code')}
                                />
                                {errors.code && (
                                    <p className="text-xs text-destructive">{errors.code.message}</p>
                                )}
                            </div>

                            {/* Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    Nama Departemen <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Teknologi Informasi"
                                    {...register('name')}
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="grid gap-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Deskripsi departemen (opsional)"
                                    rows={3}
                                    {...register('description')}
                                />
                                {errors.description && (
                                    <p className="text-xs text-destructive">{errors.description.message}</p>
                                )}
                            </div>

                            {/* HOD */}
                            <div className="grid gap-2">
                                <Label htmlFor="hod_id">Kepala Departemen</Label>
                                <Input
                                    id="hod_id"
                                    type="text"
                                    placeholder="Masukkan ID user (opsional)"
                                    {...register('hod_id')}
                                />
                                {errors.hod_id && (
                                    <p className="text-xs text-destructive">{errors.hod_id.message}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telepon</Label>
                                <Input
                                    id="phone"
                                    placeholder="Ex: 021-1234-5678"
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
                                    placeholder="Ex: dept@company.com"
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
                                    setForm({ open: false, department: null, loading: false });
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
                                {form.department ? 'Perbarui' : 'Simpan'}
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
                        setDeleteState({ open: false, department: null, loading: false });
                    }
                }}
            >
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Hapus Departemen</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus departemen{' '}
                            <strong>{deleteState.department?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={deleteState.loading}
                            onClick={() => setDeleteState({ open: false, department: null, loading: false })}
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
