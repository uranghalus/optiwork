import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { type Tenant } from '@/types';
import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenant: Tenant | null;
}

export function DeleteDialog({ open, onOpenChange, tenant }: DeleteDialogProps) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (!tenant) return;
        setProcessing(true);
        router.delete(route('tenants.destroy', tenant.id), {
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
                        Hapus Tenant
                    </DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus tenant{' '}
                        <span className="font-semibold text-foreground">"{tenant?.name}"</span>? Tindakan ini
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
