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
import { type BreadcrumbItem, type PaginatedData, type SharedData, type Tenant, type WorkOrder } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Plus, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getWorkOrderColumns } from './columns';
import { DataTable } from './data-table';
import { WorkOrderForm } from './work-order-form';
import { DeleteDialog } from './delete-dialog';

// --- TAMBAHAN IMPORT AXIOS ---
import axios from 'axios';
// -----------------------------

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Daftar Work Order', href: '/work-orders' },
];

export default function WorkOrdersIndex({
    workOrders,
    tenants,
    filters,
}: {
    workOrders: PaginatedData<WorkOrder>;
    tenants: Pick<Tenant, 'id' | 'name' | 'company_name'>[];
    filters: { search?: string; status?: string; priority?: string };
}) {
    const { flash } = usePage<SharedData>().props;
    const [formOpen, setFormOpen] = useState(false);
    const [editWorkOrder, setEditWorkOrder] = useState<WorkOrder | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteWorkOrder, setDeleteWorkOrder] = useState<WorkOrder | null>(null);
    const [searchValue, setSearchValue] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority ?? 'all');

    // --- TAMBAHAN STATE UNTUK DEPARTEMEN ---
    const [departments, setDepartments] = useState<{ id: string | number; name: string }[]>([]);
    // ---------------------------------------

    // Show toast notifications from flash messages
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    // --- TAMBAHAN EFFECT UNTUK FETCH DEPARTEMEN ---
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                // Memanggil route API lokal yang sudah kita buat sebelumnya
                const response = await axios.get('/api/local-departments');

                // Pastikan struktur data sesuai. Jika API Duta Mall mengembalikan array di dalam properti 'data',
                // maka gunakan response.data.data. Jika langsung array, gunakan response.data
                // Sesuaikan jika perlu berdasarkan output console.log(response.data) Anda.
                setDepartments(response.data);
            } catch (error) {
                console.error("Gagal mengambil data departemen:", error);
                toast.error("Gagal memuat daftar departemen.");
            }
        };

        fetchDepartments();
    }, []);
    // ----------------------------------------------

    const buildFilterParams = useCallback(
        (overrides: { search?: string; status?: string; priority?: string } = {}) => ({
            search: (overrides.search ?? searchValue) || undefined,
            status: (overrides.status ?? statusFilter) !== 'all' ? (overrides.status ?? statusFilter) : undefined,
            priority: (overrides.priority ?? priorityFilter) !== 'all' ? (overrides.priority ?? priorityFilter) : undefined,
        }),
        [searchValue, statusFilter, priorityFilter],
    );

    const handleSearch = useCallback(
        (value: string) => {
            setSearchValue(value);
            router.get(
                route('work-orders.index'),
                buildFilterParams({ search: value }),
                { preserveState: true, replace: true },
            );
        },
        [buildFilterParams],
    );

    const handleStatusFilter = useCallback(
        (value: string) => {
            setStatusFilter(value);
            router.get(
                route('work-orders.index'),
                buildFilterParams({ status: value }),
                { preserveState: true, replace: true },
            );
        },
        [buildFilterParams],
    );

    const handlePriorityFilter = useCallback(
        (value: string) => {
            setPriorityFilter(value);
            router.get(
                route('work-orders.index'),
                buildFilterParams({ priority: value }),
                { preserveState: true, replace: true },
            );
        },
        [buildFilterParams],
    );

    const handlePageChange = (url: string | null) => {
        if (url) router.get(url, {}, { preserveState: true });
    };

    const openCreate = () => {
        setEditWorkOrder(null);
        setFormOpen(true);
    };

    const openEdit = (workOrder: WorkOrder) => {
        setEditWorkOrder(workOrder);
        setFormOpen(true);
    };

    const openDelete = (workOrder: WorkOrder) => {
        setDeleteWorkOrder(workOrder);
        setDeleteOpen(true);
    };

    const handleBulkDelete = (ids: number[]) => {
        if (ids.length === 0) return;
        router.post(route('work-orders.bulk-destroy'), { ids }, {
            preserveScroll: true,
        });
    };

    const columns = useMemo(
        () => getWorkOrderColumns({ onEdit: openEdit, onDelete: openDelete }),
        [],
    );

    const hasActiveFilters = !!(filters.search || filters.status || filters.priority);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Work Order" />

            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Daftar Work Order</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelola tiket pekerjaan dan permintaan maintenance.
                        </p>
                    </div>
                    <Button onClick={openCreate} className="gap-2 shadow-sm">
                        <Plus className="h-4 w-4" />
                        Tambah Work Order
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari judul atau nomor work order..."
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
                            <SelectItem value="open">Terbuka</SelectItem>
                            <SelectItem value="in_progress">Dalam Proses</SelectItem>
                            <SelectItem value="pending">Menunggu</SelectItem>
                            <SelectItem value="resolved">Selesai</SelectItem>
                            <SelectItem value="closed">Ditutup</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={handlePriorityFilter}>
                        <SelectTrigger className="h-10 w-full sm:w-[180px]">
                            <SelectValue placeholder="Semua Prioritas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Prioritas</SelectItem>
                            <SelectItem value="low">Rendah</SelectItem>
                            <SelectItem value="medium">Sedang</SelectItem>
                            <SelectItem value="high">Tinggi</SelectItem>
                            <SelectItem value="urgent">Mendesak</SelectItem>
                        </SelectContent>
                    </Select>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchValue('');
                                setStatusFilter('all');
                                setPriorityFilter('all');
                                router.get(route('work-orders.index'), {}, { preserveState: true, replace: true });
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
                    pagination={workOrders}
                    onPageChange={handlePageChange}
                    onAdd={openCreate}
                    onBulkDelete={handleBulkDelete}
                />
            </div>

            {/* Create/Edit Dialog with React Hook Form + Zod */}
            {/* --- TAMBAHAN PROPERTY departments --- */}
            <WorkOrderForm
                open={formOpen}
                onOpenChange={setFormOpen}
                workOrder={editWorkOrder}
                tenants={tenants}
                departments={departments}
            />
            {/* ----------------------------------- */}

            {/* Delete Confirmation Dialog */}
            <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} workOrder={deleteWorkOrder} />
        </AppLayout>
    );
}