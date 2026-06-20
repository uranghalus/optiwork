import { Field, FieldError, FieldLabel } from '@/components/ui/field';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type Tenant, type WorkOrder } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    Check,
    FileText,
    Loader2,
    Paperclip,
    Save,
    Sparkles,
    Upload,
    Wrench,
    X,
    Users
} from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useCallback, useRef, useState } from 'react';

// ── Priority config ────────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
    low: { label: 'Rendah', color: 'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-500/10 dark:text-slate-400' },
    medium: { label: 'Sedang', color: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
    high: { label: 'Tinggi', color: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
    urgent: { label: 'Mendesak', color: 'border-red-300 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-500/10 dark:text-red-400' },
} as const;

// ── Validation schema ──────────────────────────────────────────────────────────
// HAPUS status dari schema, TAMBAH department_id
const workOrderSchema = z.object({
    title: z.string().min(1, 'Judul wajib diisi').max(255, 'Maksimal 255 karakter'),
    job_description: z.string().min(1, 'Deskripsi pekerjaan wajib diisi'),
    priority: z.enum(['low', 'medium', 'high', 'urgent'], { message: 'Prioritas wajib dipilih' }),
    tenant_id: z.string().nullable().optional(),
    department_id: z.string().min(1, 'Departemen tujuan wajib dipilih'),
});

type WorkOrderFormValues = z.infer<typeof workOrderSchema>;

interface WorkOrderFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workOrder?: WorkOrder | null;
    tenants: Pick<Tenant, 'id' | 'name' | 'company_name'>[];
    // Menerima data departemen dari Controller
    departments: { id: string | number; name: string }[];
}

export function WorkOrderForm({ open, onOpenChange, workOrder, tenants, departments = [] }: WorkOrderFormProps) {
    const isEdit = !!workOrder;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    const form = useForm<WorkOrderFormValues>({
        resolver: zodResolver(workOrderSchema),
        defaultValues: {
            title: '',
            job_description: '',
            priority: 'medium',
            tenant_id: null,
            department_id: '',
        },
    });

    const {
        register,
        handleSubmit: rhfHandleSubmit,
        control,
        reset,
        watch,
        formState: { errors },
    } = form;

    const [processing, setProcessing] = useState(false);

    const watchPriority = watch('priority');

    // Reset form when workOrder or open changes
    const handleOpenChange = useCallback((isOpen: boolean) => {
        if (isOpen) {
            setFile(null);
            setFilePreview(null);
            if (workOrder) {
                reset({
                    title: workOrder.title ?? '',
                    job_description: workOrder.job_description ?? '',
                    priority: workOrder.priority ?? 'medium',
                    tenant_id: workOrder.tenant_id?.toString() ?? null,
                    department_id: workOrder.department_id?.toString() ?? '',
                });
                if (workOrder.attachment_url) {
                    setFilePreview(workOrder.attachment_url);
                }
            } else {
                reset({
                    title: '',
                    job_description: '',
                    priority: 'medium',
                    tenant_id: null,
                    department_id: '',
                });
            }
        }
        onOpenChange(isOpen);
    }, [workOrder, reset, onOpenChange]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Generate preview for images
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => setFilePreview(reader.result as string);
                reader.readAsDataURL(selectedFile);
            } else {
                setFilePreview(null);
            }
        }
    }, []);

    const removeFile = useCallback(() => {
        setFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const onSubmit = (data: WorkOrderFormValues) => {
        setProcessing(true);

        // Build FormData for file upload support
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('job_description', data.job_description);
        formData.append('priority', data.priority);
        formData.append('department_id', data.department_id); // Tambah payload departemen

        if (data.tenant_id) {
            formData.append('tenant_id', data.tenant_id);
        }
        if (file) {
            formData.append('attachment', file);
        }

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                handleOpenChange(false);
            },
            onError: (errors: Record<string, string>) => {
                Object.entries(errors).forEach(([, message]) => {
                    toast.error(message);
                });
            },
            onFinish: () => {
                setProcessing(false);
            },
        };

        if (isEdit) {
            formData.append('_method', 'PUT');
            router.post(route('work-orders.update', workOrder!.id), formData, options);
        } else {
            router.post(route('work-orders.store'), formData, options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto sm:rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <Wrench className="h-4 w-4 text-primary" />
                        </div>
                        {isEdit ? 'Edit Work Order' : 'Tambah Work Order Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Perbarui informasi work order di bawah ini.'
                            : 'Isi formulir di bawah untuk menambahkan work order baru. Status akan diatur otomatis oleh sistem.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={rhfHandleSubmit(onSubmit)} className="space-y-5">
                    {/* ── Section: Info Utama ──────────────────────────────────── */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <FileText className="h-3.5 w-3.5" />
                            <span>Informasi Utama</span>
                            <div className="flex-1 border-t border-border/60" />
                        </div>

                        <Field>
                            <FieldLabel htmlFor="title">Judul *</FieldLabel>
                            <Input
                                id="title"
                                placeholder="Contoh: AC tidak dingin di lantai 3"
                                {...register('title')}
                            />
                            {errors.title && <FieldError>{errors.title.message}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="job_description">Deskripsi Pekerjaan *</FieldLabel>
                            <Textarea
                                id="job_description"
                                placeholder="Jelaskan detail masalah atau pekerjaan yang perlu dilakukan..."
                                rows={4}
                                {...register('job_description')}
                            />
                            {errors.job_description && <FieldError>{errors.job_description.message}</FieldError>}
                        </Field>
                    </div>

                    {/* ── Section: Penugasan & Lokasi ──────────────────────────────────────── */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <Building2 className="h-3.5 w-3.5" />
                            <span>Tujuan Penugasan & Lokasi</span>
                            <div className="flex-1 border-t border-border/60" />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="department_id">Departemen Tujuan *</FieldLabel>
                                <Controller
                                    name="department_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih departemen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.length === 0 && (
                                                    <div className="px-3 py-2 text-sm text-muted-foreground">
                                                        Memuat departemen...
                                                    </div>
                                                )}
                                                {departments.map((d) => (
                                                    <SelectItem key={d.id} value={d.id.toString()}>
                                                        <span className="flex items-center gap-2">
                                                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {d.name}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.department_id && <FieldError>{errors.department_id.message}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="tenant_id">Tenant / Lokasi (Opsional)</FieldLabel>
                                <Controller
                                    name="tenant_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value ?? ''}
                                            onValueChange={(val) => field.onChange(val || null)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih tenant / lokasi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tenants.length === 0 && (
                                                    <div className="px-3 py-2 text-sm text-muted-foreground">
                                                        Belum ada tenant tersedia
                                                    </div>
                                                )}
                                                {tenants.map((t) => (
                                                    <SelectItem key={t.id} value={t.id.toString()}>
                                                        <span className="flex items-center gap-2">
                                                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {t.name}
                                                            {t.company_name && (
                                                                <span className="text-muted-foreground text-xs">({t.company_name})</span>
                                                            )}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.tenant_id && <FieldError>{errors.tenant_id.message}</FieldError>}
                            </Field>
                        </div>
                    </div>

                    {/* ── Section: Prioritas ──────────────────────────── */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Prioritas Pekerjaan</span>
                            <div className="flex-1 border-t border-border/60" />
                        </div>

                        <Field>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {(Object.keys(PRIORITY_CONFIG) as Array<keyof typeof PRIORITY_CONFIG>).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => form.setValue('priority', p, { shouldValidate: true })}
                                        className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${watchPriority === p
                                            ? `${PRIORITY_CONFIG[p].color} ring-2 ring-primary/20 shadow-sm`
                                            : 'border-border/60 bg-background text-muted-foreground hover:bg-muted/50'
                                            }`}
                                    >
                                        {watchPriority === p && <Check className="h-3.5 w-3.5" />}
                                        {PRIORITY_CONFIG[p].label}
                                    </button>
                                ))}
                            </div>
                            {errors.priority && <FieldError>{errors.priority.message}</FieldError>}
                        </Field>
                    </div>

                    {/* ── Section: Attachment ──────────────────────────────────── */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <Paperclip className="h-3.5 w-3.5" />
                            <span>Lampiran Foto/Dokumen (Opsional)</span>
                            <div className="flex-1 border-t border-border/60" />
                        </div>

                        <div className="space-y-3">
                            {/* Existing attachment preview (edit mode) */}
                            {isEdit && workOrder?.attachment_url && !file && (
                                <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                                    {filePreview ? (
                                        <img src={filePreview} alt="Preview" className="h-12 w-12 rounded-md object-cover" />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">Lampiran saat ini</p>
                                        <a
                                            href={workOrder.attachment_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline"
                                        >
                                            Lihat file
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* New file upload area */}
                            {file ? (
                                <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                                    {filePreview ? (
                                        <img src={filePreview} alt="Preview" className="h-12 w-12 rounded-md object-cover" />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="text-muted-foreground hover:text-destructive rounded-md p-1 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border/80 bg-muted/20 p-6 transition-all hover:border-primary/40 hover:bg-primary/5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                        <Upload className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-foreground">
                                            Klik untuk upload file
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            JPG, PNG, PDF, DOC (maks. 10MB)
                                        </p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* ── Info hint ────────────────────────────────────────────── */}
                    {watchPriority === 'urgent' && (
                        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/20 dark:bg-red-500/5">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                            <div>
                                <p className="text-sm font-medium text-red-700 dark:text-red-400">Prioritas Mendesak</p>
                                <p className="text-xs text-red-600/80 dark:text-red-400/70">
                                    Work order ini akan ditandai sebagai prioritas tinggi dan departemen tujuan akan mendapat notifikasi segera.
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="gap-2">
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : isEdit ? (
                                <>
                                    <Save className="h-4 w-4" />
                                    Perbarui
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Simpan
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}