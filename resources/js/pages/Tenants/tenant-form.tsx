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
import { type Tenant } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { Building, Upload } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useState } from 'react';

const tenantSchema = z.object({
    name: z.string().min(1, 'Nama tenant wajib diisi').max(255, 'Maksimal 255 karakter'),
    company_name: z.string().max(255, 'Maksimal 255 karakter').optional().or(z.literal('')),
    email: z.string().email('Format email tidak valid').max(255, 'Maksimal 255 karakter').optional().or(z.literal('')),
    phone: z.string().max(20, 'Maksimal 20 karakter').optional().or(z.literal('')),
    area: z.string().max(100, 'Maksimal 100 karakter').optional().or(z.literal('')),
    location: z.string().optional().or(z.literal('')),
    status: z.enum(['active', 'inactive', 'suspended'], { message: 'Status wajib dipilih' }),
    type: z.string().max(100, 'Maksimal 100 karakter').optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
    logo: z
        .instanceof(File)
        .refine((f) => f.size <= 2048 * 1024, 'Ukuran file maksimal 2MB')
        .refine(
            (f) => ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'].includes(f.type),
            'Format file harus jpeg, png, jpg, atau svg',
        )
        .optional()
        .or(z.null()),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

interface TenantFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenant?: Tenant | null;
}

export function TenantForm({ open, onOpenChange, tenant }: TenantFormProps) {
    const isEdit = !!tenant;

    const form = useForm<TenantFormValues>({
        resolver: zodResolver(tenantSchema),
        defaultValues: {
            name: '',
            company_name: '',
            email: '',
            phone: '',
            area: '',
            location: '',
            status: 'active',
            type: '',
            description: '',
            logo: null,
        },
    });

    const {
        register,
        handleSubmit: rhfHandleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = form;

    const [processing, setProcessing] = useState(false);
    const logoFile = watch('logo');

    // Reset form when tenant or open changes
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            if (tenant) {
                reset({
                    name: tenant.name ?? '',
                    company_name: tenant.company_name ?? '',
                    email: tenant.email ?? '',
                    phone: tenant.phone ?? '',
                    area: tenant.area ?? '',
                    location: tenant.location ?? '',
                    status: tenant.status ?? 'active',
                    type: tenant.type ?? '',
                    description: tenant.description ?? '',
                    logo: null,
                });
            } else {
                reset({
                    name: '',
                    company_name: '',
                    email: '',
                    phone: '',
                    area: '',
                    location: '',
                    status: 'active',
                    type: '',
                    description: '',
                    logo: null,
                });
            }
        }
        onOpenChange(isOpen);
    };

    const onSubmit = (data: TenantFormValues) => {
        const formData = new FormData();
        formData.append('name', data.name);
        if (data.company_name) formData.append('company_name', data.company_name);
        if (data.email) formData.append('email', data.email);
        if (data.phone) formData.append('phone', data.phone);
        if (data.area) formData.append('area', data.area);
        if (data.location) formData.append('location', data.location);
        formData.append('status', data.status);
        if (data.type) formData.append('type', data.type);
        if (data.description) formData.append('description', data.description);
        if (data.logo instanceof File) formData.append('logo', data.logo);

        setProcessing(true);

        const options = {
            forceFormData: true,
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
            formData.append('_method', 'put');
            router.post(route('tenants.update', tenant!.id), formData, options);
        } else {
            router.post(route('tenants.store'), formData, options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto sm:rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <Building className="h-4 w-4 text-primary" />
                        </div>
                        {isEdit ? 'Edit Tenant' : 'Tambah Tenant Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Perbarui informasi tenant di bawah ini.'
                            : 'Isi formulir di bawah untuk menambahkan tenant baru.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={rhfHandleSubmit(onSubmit)} className="space-y-5">
                    {/* Logo Upload */}
                    <Field>
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/50">
                                {logoFile instanceof File ? (
                                    <img
                                        src={URL.createObjectURL(logoFile)}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : tenant?.logo_url ? (
                                    <img
                                        src={tenant.logo_url}
                                        alt={tenant.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <Building className="h-6 w-6 text-muted-foreground/50" />
                                )}
                            </div>
                            <div className="flex-1">
                                <FieldLabel htmlFor="logo" className="text-xs text-muted-foreground">
                                    Logo Tenant (opsional)
                                </FieldLabel>
                                <Input
                                    id="logo"
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/svg+xml"
                                    onChange={(e) => setValue('logo', e.target.files?.[0] ?? null)}
                                    className="mt-1 h-9 text-xs file:text-xs"
                                />
                            </div>
                        </div>
                        {errors.logo && <FieldError>{errors.logo.message}</FieldError>}
                    </Field>

                    {/* Name & Company */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="name">Nama Tenant *</FieldLabel>
                            <Input
                                id="name"
                                placeholder="Contoh: Tenant A"
                                {...register('name')}
                            />
                            {errors.name && <FieldError>{errors.name.message}</FieldError>}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="company_name">Nama Perusahaan</FieldLabel>
                            <Input
                                id="company_name"
                                placeholder="Contoh: PT. ABC"
                                {...register('company_name')}
                            />
                            {errors.company_name && <FieldError>{errors.company_name.message}</FieldError>}
                        </Field>
                    </div>

                    {/* Type & Status */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="type">Tipe Tenant</FieldLabel>
                            <Input
                                id="type"
                                placeholder="Contoh: Retail, F&B"
                                {...register('type')}
                            />
                            {errors.type && <FieldError>{errors.type.message}</FieldError>}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="status">Status *</FieldLabel>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Aktif</SelectItem>
                                            <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                            <SelectItem value="suspended">Ditangguhkan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.status && <FieldError>{errors.status.message}</FieldError>}
                        </Field>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@contoh.com"
                                {...register('email')}
                            />
                            {errors.email && <FieldError>{errors.email.message}</FieldError>}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="phone">Telepon</FieldLabel>
                            <Input
                                id="phone"
                                placeholder="08xxxxxxxxxx"
                                {...register('phone')}
                            />
                            {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
                        </Field>
                    </div>

                    {/* Area & Location */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="area">Area</FieldLabel>
                            <Input
                                id="area"
                                placeholder="Contoh: Jakarta Selatan"
                                {...register('area')}
                            />
                            {errors.area && <FieldError>{errors.area.message}</FieldError>}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="location">Lokasi</FieldLabel>
                            <Input
                                id="location"
                                placeholder="Alamat lengkap"
                                {...register('location')}
                            />
                            {errors.location && <FieldError>{errors.location.message}</FieldError>}
                        </Field>
                    </div>

                    {/* Description */}
                    <Field>
                        <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
                        <Textarea
                            id="description"
                            placeholder="Deskripsi singkat tentang tenant..."
                            rows={3}
                            {...register('description')}
                        />
                        {errors.description && <FieldError>{errors.description.message}</FieldError>}
                    </Field>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Upload className="h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : isEdit ? (
                                'Perbarui'
                            ) : (
                                'Simpan'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
