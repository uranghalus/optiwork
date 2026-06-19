import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { type BreadcrumbItem, type PaginatedData, type SharedData, type Tenant } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Plus, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getTenantColumns } from './columns';
import { DataTable } from './data-table';
import { TenantForm } from './tenant-form';
import { DeleteDialog } from './delete-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Daftar Tenant', href: '/tenants' },
];

export default function TenantsIndex({
    tenants,
    filters,
}: {
    tenants: PaginatedData<Tenant>;
    filters: { search?: string; status?: string };
}) {
    const { flash } = usePage<SharedData>().props;
    const [formOpen, setFormOpen] = useState(false);
    const [editTenant, setEditTenant] = useState<Tenant | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTenant, setDeleteTenant] = useState<Tenant | null>(null);
    const [searchValue, setSearchValue] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');

    // Show toast notifications from flash messages
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    const handleSearch = useCallback(
        (value: string) => {
            setSearchValue(value);
            router.get(
                route('tenants.index'),
                { search: value || undefined, status: statusFilter !== 'all' ? statusFilter : undefined },
                { preserveState: true, replace: true },
            );
        },
        [statusFilter],
    );
    console.log("ISI DATA TENANT DARI LARAVEL:", tenants.data);

    const handleStatusFilter = useCallback(
        (value: string) => {
            setStatusFilter(value);
            router.get(
                route('tenants.index'),
                { search: searchValue || undefined, status: value !== 'all' ? value : undefined },
                { preserveState: true, replace: true },
            );
        },
        [searchValue],
    );

    const handlePageChange = (url: string | null) => {
        if (url) router.get(url, {}, { preserveState: true });
    };

    const openCreate = () => {
        setEditTenant(null);
        setFormOpen(true);
    };

    const openEdit = (tenant: Tenant) => {
        setEditTenant(tenant);
        setFormOpen(true);
    };

    const openDelete = (tenant: Tenant) => {
        setDeleteTenant(tenant);
        setDeleteOpen(true);
    };

    const handleBulkDelete = (ids: number[]) => {
        if (ids.length === 0) return;
        router.post(route('tenants.bulk-destroy'), { ids }, {
            preserveScroll: true,
        });
    };

    const columns = useMemo(
        () => getTenantColumns({ onEdit: openEdit, onDelete: openDelete }),
        [],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Tenant" />

            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Daftar Tenant</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelola data mitra dan tenant perusahaan Anda.
                        </p>
                    </div>
                    <Button onClick={openCreate} className="gap-2 shadow-sm">
                        <Plus className="h-4 w-4" />
                        Tambah Tenant
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama tenant atau perusahaan..."
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
                    <Select value={statusFilter} onValueChange={handleStatusFilter}>
                        <SelectTrigger className="h-10 w-full sm:w-[180px]">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Tidak Aktif</SelectItem>
                            <SelectItem value="suspended">Ditangguhkan</SelectItem>
                        </SelectContent>
                    </Select>
                    {(filters.search || filters.status) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchValue('');
                                setStatusFilter('all');
                                router.get(route('tenants.index'), {}, { preserveState: true, replace: true });
                            }}
                            className="gap-1 text-muted-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                            Reset Filter
                        </Button>
                    )}
                </div>

                {/* Data Table with TanStack Table */}
                <DataTable
                    columns={columns}
                    pagination={tenants}
                    onPageChange={handlePageChange}
                    onAdd={openCreate}
                    onBulkDelete={handleBulkDelete}
                />
            </div>

            {/* Create/Edit Dialog with React Hook Form + Zod */}
            <TenantForm open={formOpen} onOpenChange={setFormOpen} tenant={editTenant} />

            {/* Delete Confirmation Dialog */}
            <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} tenant={deleteTenant} />
        </AppLayout>
    );
}
