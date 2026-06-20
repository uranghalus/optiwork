import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { type WorkOrder } from '@/types';
import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workOrder: WorkOrder | null;
}

export function DeleteDialog({ open, onOpenChange, workOrder }: DeleteDialogProps) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (!workOrder) return;
        setProcessing(true);
        router.delete(route('work-orders.destroy', workOrder.id), {
            onFinish: () => {
                setProcessing(false);
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md sm:rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg text-destructive">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </div>
                        Hapus Work Order
                    </DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus work order{' '}
                        <span className="font-semibold text-foreground">"{workOrder?.work_order_number}"</span>? Tindakan ini
                        tidak dapat dibatalkan.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                        Batal
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={processing}>
                        {processing ? 'Menghapus...' : 'Ya, Hapus'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
