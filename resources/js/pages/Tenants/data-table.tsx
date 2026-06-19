import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { type PaginatedData, type Tenant } from '@/types';
import {
    type ColumnDef,
    type RowSelectionState,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Building, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTablePagination } from './data-table-pagination';
import { useState } from 'react';

interface DataTableProps {
    columns: ColumnDef<Tenant>[];
    pagination: PaginatedData<Tenant>;
    onPageChange: (url: string | null) => void;
    onAdd: () => void;
    onBulkDelete: (ids: number[]) => void;
}

export function DataTable({ columns, pagination, onPageChange, onAdd, onBulkDelete }: DataTableProps) {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const table = useReactTable({
        data: pagination.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: pagination.last_page,
        onRowSelectionChange: setRowSelection,
        state: {
            pagination: {
                pageIndex: pagination.current_page - 1,
                pageSize: pagination.per_page,
            },
            rowSelection,
        },
    });

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.id);
    const selectedCount = selectedIds.length;

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {/* Bulk Action Toolbar */}
            {selectedCount > 0 && (
                <div className="flex items-center gap-3 border-b bg-destructive/5 px-4 py-2.5">
                    <span className="text-sm font-medium text-foreground">
                        {selectedCount} data dipilih
                    </span>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 gap-1.5"
                        onClick={() => {
                            onBulkDelete(selectedIds);
                            setRowSelection({});
                        }}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus Terpilih
                    </Button>
                </div>
            )}

            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="group">
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-40 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                        <Building className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Tidak ada data tenant ditemukan.
                                    </p>
                                    <Button variant="outline" size="sm" onClick={onAdd} className="mt-1 gap-1">
                                        <Plus className="h-3.5 w-3.5" />
                                        Tambah Tenant Pertama
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <DataTablePagination pagination={pagination} onPageChange={onPageChange} />
        </div>
    );
}
