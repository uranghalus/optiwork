import { Button } from '@/components/ui/button';
import { type PaginatedData } from '@/types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface DataTablePaginationProps {
    pagination: PaginatedData<unknown>;
    onPageChange: (url: string | null) => void;
}

export function DataTablePagination({ pagination, onPageChange }: DataTablePaginationProps) {
    const { current_page, last_page, from, to, total, first_page_url, prev_page_url, next_page_url, last_page_url } = pagination;

    if (last_page <= 1) return null;

    // Build visible page numbers with ellipsis
    const pages: (number | 'ellipsis')[] = [];
    for (let i = 1; i <= last_page; i++) {
        if (i === 1 || i === last_page || Math.abs(i - current_page) <= 1) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== 'ellipsis') {
            pages.push('ellipsis');
        }
    }

    const handlePageClick = (page: number) => {
        const url = new URL(first_page_url);
        url.searchParams.set('page', String(page));
        onPageChange(url.toString());
    };

    return (
        <div className="flex flex-col items-center gap-3 border-t px-6 py-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Menampilkan <span className="font-medium text-foreground">{from ?? 0}</span> sampai{' '}
                <span className="font-medium text-foreground">{to ?? 0}</span> dari{' '}
                <span className="font-medium text-foreground">{total}</span> data
            </p>
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!prev_page_url}
                    onClick={() => onPageChange(first_page_url)}
                >
                    <span className="sr-only">Halaman pertama</span>
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!prev_page_url}
                    onClick={() => onPageChange(prev_page_url)}
                >
                    <span className="sr-only">Halaman sebelumnya</span>
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {pages.map((page, idx) =>
                    page === 'ellipsis' ? (
                        <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={page === current_page ? 'default' : 'outline'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handlePageClick(page)}
                        >
                            {page}
                        </Button>
                    ),
                )}

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!next_page_url}
                    onClick={() => onPageChange(next_page_url)}
                >
                    <span className="sr-only">Halaman berikutnya</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!next_page_url}
                    onClick={() => onPageChange(last_page_url)}
                >
                    <span className="sr-only">Halaman terakhir</span>
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
