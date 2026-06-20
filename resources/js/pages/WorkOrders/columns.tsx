import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type WorkOrder } from '@/types';
import { type ColumnDef } from '@tanstack/react-table';
import { Building2, MoreHorizontal, Paperclip, Pencil, Trash2, Wrench } from 'lucide-react';

function PriorityBadge({ priority }: { priority: WorkOrder['priority'] }) {
    const config = {
        low: {
            label: 'Rendah',
            className:
                'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/20',
        },
        medium: {
            label: 'Sedang',
            className:
                'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/20',
        },
        high: {
            label: 'Tinggi',
            className:
                'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20',
        },
        urgent: {
            label: 'Mendesak',
            className:
                'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/20',
        },
    };
    const { label, className } = config[priority];
    return (
        <Badge variant="outline" className={`${className} font-medium`}>
            {label}
        </Badge>
    );
}

function StatusBadge({ status }: { status: WorkOrder['status'] }) {
    const config = {
        open: {
            label: 'Terbuka',
            className:
                'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/20',
        },
        in_progress: {
            label: 'Dalam Proses',
            className:
                'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/20',
        },
        pending: {
            label: 'Menunggu',
            className:
                'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20',
        },
        resolved: {
            label: 'Selesai',
            className:
                'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20',
        },
        closed: {
            label: 'Ditutup',
            className:
                'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/20',
        },
    };
    const { label, className } = config[status];
    return (
        <Badge variant="outline" className={`${className} font-medium`}>
            {label}
        </Badge>
    );
}

export function getWorkOrderColumns({
    onEdit,
    onDelete,
}: {
    onEdit: (workOrder: WorkOrder) => void;
    onDelete: (workOrder: WorkOrder) => void;
}): ColumnDef<WorkOrder>[] {

    return [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Pilih semua"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Pilih baris"
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40,
        },
        {
            id: 'index',
            header: '#',
            cell: ({ table, row }) => {
                const from = table.options.meta?.from ?? 1;
                return <span className="text-muted-foreground">{from + row.index}</span>;
            },
            size: 50,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'work_order_number',
            header: 'No. WO',
            cell: ({ row }) => {
                const workOrder = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/50">
                            <Wrench className="h-4 w-4 text-muted-foreground/60" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate font-mono text-sm font-medium text-foreground">
                                {workOrder.work_order_number}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                {workOrder.order_date
                                    ? new Date(workOrder.order_date).toLocaleDateString('id-ID')
                                    : '—'}
                            </p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'title',
            header: 'Judul',
            cell: ({ row }) => {
                const workOrder = row.original;
                return (
                    <div className="min-w-0 max-w-xs">
                        <div className="flex items-center gap-1.5">
                            <p className="truncate font-medium text-foreground">{workOrder.title}</p>
                            {workOrder.attachment_path && (
                                <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                            )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                            {workOrder.job_description || '\u2014'}
                        </p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'tenant',
            header: 'Lokasi',
            cell: ({ row }) => {
                const tenant = row.original.tenant;
                if (!tenant) {
                    return <span className="text-xs text-muted-foreground">\u2014</span>;
                }
                return (
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-violet-50 dark:bg-violet-500/10">
                            <Building2 className="h-3.5 w-3.5 text-violet-500" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-foreground">{tenant.name}</p>
                            {tenant.company_name && (
                                <p className="truncate text-[11px] text-muted-foreground">{tenant.company_name}</p>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'priority',
            header: 'Prioritas',
            cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const workOrder = row.original;
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuItem onClick={() => onEdit(workOrder)}>
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onDelete(workOrder)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Hapus
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
            enableSorting: false,
            enableHiding: false,
        },
    ];
}
