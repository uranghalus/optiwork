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
import { type Tenant } from '@/types';
import { type ColumnDef } from '@tanstack/react-table';
import { Building, Mail, MapPin, MoreHorizontal, Pencil, Phone, Trash2 } from 'lucide-react';

function StatusBadge({ status }: { status: Tenant['status'] }) {
    const config = {
        active: {
            label: 'Aktif',
            className:
                'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20',
        },
        inactive: {
            label: 'Tidak Aktif',
            className:
                'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/20',
        },
        suspended: {
            label: 'Ditangguhkan',
            className:
                'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20',
        },
    };
    const { label, className } = config[status];
    return (
        <Badge variant="outline" className={`${className} font-medium`}>
            {label}
        </Badge>
    );
}

export function getTenantColumns({
    onEdit,
    onDelete,
}: {
    onEdit: (tenant: Tenant) => void;
    onDelete: (tenant: Tenant) => void;
}): ColumnDef<Tenant>[] {

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
                const page = table.getState().pagination.pageIndex;
                const size = table.getState().pagination.pageSize;
                return <span className="text-muted-foreground">{page * size + row.index + 1}</span>;
            },
            size: 50,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'name',
            header: 'Tenant',
            cell: ({ row }) => {
                const tenant = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/50">
                            {tenant.logo_url ? (
                                <img src={tenant.logo_url} alt={tenant.name} className="h-full w-full object-cover" />
                            ) : (
                                <Building className="h-4 w-4 text-muted-foreground/60" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{tenant.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                                {tenant.company_name || '—'}
                                {tenant.type && ` · ${tenant.type}`}
                            </p>
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'contact',
            header: 'Kontak',
            cell: ({ row }) => {
                const tenant = row.original;
                return (
                    <div className="space-y-1">
                        {tenant.email && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{tenant.email}</span>
                            </div>
                        )}
                        {tenant.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{tenant.phone}</span>
                            </div>
                        )}
                        {!tenant.email && !tenant.phone && (
                            <span className="text-xs text-muted-foreground/60">—</span>
                        )}
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            id: 'area_location',
            header: 'Area / Lokasi',
            cell: ({ row }) => {
                const tenant = row.original;
                return (
                    <div className="space-y-1">
                        {tenant.area && <p className="truncate text-xs text-muted-foreground">{tenant.area}</p>}
                        {tenant.location && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{tenant.location}</span>
                            </div>
                        )}
                        {!tenant.area && !tenant.location && (
                            <span className="text-xs text-muted-foreground/60">—</span>
                        )}
                    </div>
                );
            },
            enableSorting: false,
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
                const tenant = row.original;
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
                                <DropdownMenuItem onClick={() => onEdit(tenant)}>
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onDelete(tenant)}
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
