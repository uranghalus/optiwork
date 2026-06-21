import AppLayout from '@/layouts/app-layout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
    type BreadcrumbItem,
    type Department,
    type Employee,
    type SharedData,
    type WorkOrder,
    type WorkOrderAssignment,
} from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock,
    Eye,
    FileText,
    Loader2,
    MapPin,
    Paperclip,
    Plus,
    Send,
    Sparkles,
    Trash2,
    Upload,
    User,
    UserCheck,
    Users,
    Wrench,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// ── Breadcrumbs ─────────────────────────────────────────────────────────────
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Work Order', href: '/work-orders' },
    { title: 'Detail', href: '#' },
];

// ── Priority config ─────────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<string, { label: string; badge: string; icon: string }> = {
    normal: { label: 'Normal', badge: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-500/20', icon: '🟦' },
    urgent_request_by_owner: { label: 'Urgent (Request)', badge: 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-sm shadow-orange-500/20', icon: '🟠' },
    urgent_by_accident: { label: 'Darurat', badge: 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-sm shadow-red-600/20', icon: '🔴' },
};

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
    pending_review: { label: 'Menunggu Review', badge: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm shadow-amber-400/20' },
    planning: { label: 'Perencanaan', badge: 'bg-gradient-to-r from-violet-400 to-purple-600 text-white shadow-sm shadow-violet-400/20' },
    assigned: { label: 'Ditugaskan', badge: 'bg-gradient-to-r from-blue-400 to-indigo-600 text-white shadow-sm shadow-blue-400/20' },
    in_progress: { label: 'Dalam Pengerjaan', badge: 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-sm shadow-cyan-400/20' },
    submitted: { label: 'Menunggu Verifikasi', badge: 'bg-gradient-to-r from-teal-400 to-emerald-600 text-white shadow-sm shadow-teal-400/20' },
    verified: { label: 'Selesai', badge: 'bg-gradient-to-r from-emerald-400 to-green-600 text-white shadow-sm shadow-emerald-400/20' },
    rejected: { label: 'Ditolak', badge: 'bg-gradient-to-r from-red-400 to-rose-600 text-white shadow-sm shadow-red-400/20' },
    revision: { label: 'Revisi', badge: 'bg-gradient-to-r from-yellow-400 to-amber-600 text-white shadow-sm shadow-yellow-400/20' },
    cancelled: { label: 'Dibatalkan', badge: 'bg-gradient-to-r from-gray-400 to-slate-600 text-white shadow-sm shadow-gray-400/20' },
};

// ── Stepper steps ───────────────────────────────────────────────────────────
const STEPS = [
    { key: 'created', label: 'Dibuat', icon: FileText },
    { key: 'review', label: 'Direview HOD', icon: Eye },
    { key: 'planning', label: 'Perencanaan & Assign', icon: Users },
    { key: 'in_progress', label: 'Dikerjakan', icon: Wrench },
    { key: 'submitted', label: 'Menunggu Verifikasi', icon: Send },
    { key: 'verified', label: 'Selesai', icon: CheckCircle2 },
] as const;

function getStepState(status: string, stepIndex: number): 'complete' | 'active' | 'upcoming' {
    const statusOrder = ['pending_review', 'planning', 'assigned', 'in_progress', 'submitted', 'verified'];
    const idx = statusOrder.indexOf(status);
    if (idx === -1) return 'upcoming';

    const stepCompleteThresholds = [
        -1,  // step 0 (Dibuat) - always complete after creation
        0,   // step 1 (Review) - complete when past pending_review
        1,   // step 2 (Planning) - complete when past planning
        2,   // step 3 (Assigned) - complete when past assigned
        3,   // step 4 (In Progress) - active at in_progress
        3,   // step 5 (Submitted) - active at submitted/submitted
        5,   // step 6 (Verified) - active/submitted... no, this is "Menunggu Verifikasi", complete after verified
    ];

    if (stepIndex === 0) return 'complete';
    if (stepIndex === 1) return idx >= 0 ? 'complete' : 'upcoming';
    if (stepIndex === 2) return idx >= 1 ? 'complete' : 'upcoming';
    if (stepIndex === 3) return idx >= 3 ? 'complete' : idx === 2 ? 'active' : 'upcoming';
    if (stepIndex === 4) return idx >= 4 ? 'complete' : idx === 3 ? 'active' : 'upcoming';
    if (stepIndex === 5) return idx >= 5 ? 'complete' : idx === 4 ? 'active' : 'upcoming';
    return 'upcoming';
}

// ── Format helpers ──────────────────────────────────────────────────────────
function formatDate(date: string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function getAvatarColor(name: string): string {
    const colors = [
        'bg-gradient-to-br from-violet-500 to-purple-700',
        'bg-gradient-to-br from-blue-500 to-indigo-700',
        'bg-gradient-to-br from-emerald-500 to-teal-700',
        'bg-gradient-to-br from-amber-500 to-orange-700',
        'bg-gradient-to-br from-rose-500 to-pink-700',
        'bg-gradient-to-br from-cyan-500 to-blue-700',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// ── Sub-components ─────────────────────────────────────────────────────────

function WorkflowTimeline({ status }: { status: string }) {
    const statusOrder = ['pending_review', 'planning', 'assigned', 'in_progress', 'submitted', 'verified'];
    const currentIdx = statusOrder.indexOf(status);

    const getStepState_ = (stepIndex: number): 'complete' | 'active' | 'upcoming' => {
        if (stepIndex === 0) return 'complete';
        if (stepIndex === 1) return currentIdx >= 0 ? 'complete' : 'upcoming';
        if (stepIndex === 2) return currentIdx >= 1 ? 'complete' : 'upcoming';
        if (stepIndex === 3) return currentIdx >= 3 ? 'complete' : currentIdx === 2 ? 'active' : 'upcoming';
        if (stepIndex === 4) return currentIdx >= 4 ? 'complete' : currentIdx === 3 ? 'active' : 'upcoming';
        if (stepIndex === 5) return currentIdx >= 5 ? 'complete' : currentIdx === 4 ? 'active' : 'upcoming';
        return 'upcoming';
    };

    return (
        <Card className="overflow-hidden border-none bg-gradient-to-br from-card to-card/80 shadow-lg shadow-black/5">
            <CardContent className="p-0">
                <div className="flex items-center justify-between gap-0 px-4 py-5 md:px-8">
                    {STEPS.map((step, i) => {
                        const state = getStepState_(i);
                        const Icon = step.icon;
                        const isLast = i === STEPS.length - 1;

                        return (
                            <div key={step.key} className={cn('flex items-center', isLast ? '' : 'flex-1')}>
                                <div className="flex flex-col items-center gap-1.5">
                                    <div
                                        className={cn(
                                            'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                                            state === 'complete' &&
                                            'border-emerald-500 bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30',
                                            state === 'active' &&
                                            'border-primary bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 ring-2 ring-primary/20',
                                            state === 'upcoming' &&
                                            'border-muted-foreground/20 bg-muted/50',
                                        )}
                                    >
                                        {state === 'complete' ? (
                                            <Check className="h-5 w-5 text-white" />
                                        ) : (
                                            <Icon
                                                className={cn(
                                                    'h-4 w-4 transition-colors',
                                                    state === 'active' && 'text-primary-foreground',
                                                    state === 'upcoming' && 'text-muted-foreground/40',
                                                )}
                                            />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            'hidden text-center text-[10px] font-medium leading-tight transition-colors md:block md:text-xs',
                                            state === 'complete' && 'text-emerald-600 dark:text-emerald-400',
                                            state === 'active' && 'text-primary font-semibold',
                                            state === 'upcoming' && 'text-muted-foreground/50',
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                                {!isLast && (
                                    <div
                                        className={cn(
                                            'mx-2 h-[2px] flex-1 rounded-full transition-all duration-500 md:mx-4',
                                            i < currentIdx
                                                ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                                : i === currentIdx
                                                    ? 'bg-gradient-to-r from-primary/60 to-muted-foreground/10'
                                                    : 'bg-muted-foreground/10',
                                        )}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
    return (
        <div className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/30">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary transition-colors group-hover:bg-primary/10">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
            </div>
        </div>
    );
}

function AssignmentRow({
    assignment,
    index,
    employees,
    onRemove,
    onChange,
}: {
    assignment: { employee_id: string; role: string; notes: string };
    index: number;
    employees: Employee[];
    onRemove: () => void;
    onChange: (field: string, value: string) => void;
}) {
    return (
        <div className="group relative rounded-xl border border-border/60 bg-muted/20 p-4 transition-all hover:border-border/90 hover:bg-muted/40">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Anggota #{index + 1}
                </span>
                <button
                    type="button"
                    onClick={onRemove}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <Field>
                    <FieldLabel>Karyawan</FieldLabel>
                    <Select value={assignment.employee_id || undefined} onValueChange={(v) => onChange('employee_id', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih karyawan" />
                        </SelectTrigger>
                        <SelectContent>
                            {employees.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id.toString()}>
                                    <span className="flex items-center gap-2">
                                        {emp.name}
                                        {emp.position && (
                                            <span className="text-xs text-muted-foreground">({emp.position})</span>
                                        )}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <Field>
                    <FieldLabel>Role</FieldLabel>
                    <Select value={assignment.role} onValueChange={(v) => onChange('role', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="leader">
                                <span className="flex items-center gap-2">
                                    <UserCheck className="h-3.5 w-3.5 text-amber-500" />
                                    Leader
                                </span>
                            </SelectItem>
                            <SelectItem value="member">
                                <span className="flex items-center gap-2">
                                    <User className="h-3.5 w-3.5 text-blue-500" />
                                    Member
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field className="sm:col-span-2">
                    <FieldLabel>Catatan (Opsional)</FieldLabel>
                    <Textarea
                        value={assignment.notes}
                        onChange={(e) => onChange('notes', e.target.value)}
                        placeholder="Catatan khusus untuk anggota ini..."
                        rows={2}
                    />
                </Field>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────

interface ShowPageProps {
    workOrder: WorkOrder;
    departments: Department[];
    employees: Employee[];
    statuses: Record<string, string>;
    priorities: Record<string, string>;
}

export default function WorkOrderShow({ workOrder, departments, employees }: ShowPageProps) {
    const { auth } = usePage<SharedData>().props;
    const currentUser = auth.user;
    const isHod = workOrder.hod_id === currentUser.id;

    // ── Review state ────────────────────────────────────────────────────
    const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
    const [executionType, setExecutionType] = useState<'immediate' | 'scheduled'>('immediate');
    const [scheduledAt, setScheduledAt] = useState('');
    const [reviewNotes, setReviewNotes] = useState('');
    const [reviewProcessing, setReviewProcessing] = useState(false);

    // ── Assign state ────────────────────────────────────────────────────
    const [totalPersonnel, setTotalPersonnel] = useState(workOrder.total_personnel?.toString() ?? '1');
    const [assignments, setAssignments] = useState<{ employee_id: string; role: string; notes: string }[]>([
        { employee_id: '', role: 'member', notes: '' },
    ]);
    const [assignProcessing, setAssignProcessing] = useState(false);

    // ── Start work state ────────────────────────────────────────────────
    const [startProcessing, setStartProcessing] = useState(false);

    // ── Submit execution state ──────────────────────────────────────────
    const [resultDescription, setResultDescription] = useState('');
    const [executionNotes, setExecutionNotes] = useState('');
    const [execFiles, setExecFiles] = useState<File[]>([]);
    const [submitProcessing, setSubmitProcessing] = useState(false);
    const execFileInputRef = useRef<HTMLInputElement>(null);

    // ── Verify state ────────────────────────────────────────────────────
    const [verifyAction, setVerifyAction] = useState<'approved' | 'rejected' | 'revision' | null>(null);
    const [verifyNotes, setVerifyNotes] = useState('');
    const [verifyProcessing, setVerifyProcessing] = useState(false);

    const priority = PRIORITY_CONFIG[workOrder.priority] ?? PRIORITY_CONFIG.normal;
    const statusCfg = STATUS_CONFIG[workOrder.status] ?? { label: workOrder.status, badge: 'bg-gradient-to-r from-gray-400 to-slate-600 text-white' };

    // ── Auto toast for flash messages ───────────────────────────────────
    const flash = usePage<SharedData>().props.flash;
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // ── Review submit ───────────────────────────────────────────────────
    const handleReviewSubmit = useCallback(() => {
        if (!reviewAction) return;
        setReviewProcessing(true);
        router.post(
            route('work-orders.review', workOrder.id),
            {
                action: reviewAction,
                execution_type: reviewAction === 'approve' ? executionType : undefined,
                scheduled_at: executionType === 'scheduled' ? scheduledAt : undefined,
                notes: reviewNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(reviewAction === 'approve' ? 'Work order telah disetujui' : 'Work order ditolak');
                },
                onError: (err) => {
                    Object.values(err).forEach((m) => toast.error(m));
                },
                onFinish: () => setReviewProcessing(false),
            },
        );
    }, [reviewAction, executionType, scheduledAt, reviewNotes, workOrder.id]);

    // ── Assign submit ────────────────────────────────────────────────────
    const handleAssignSubmit = useCallback(() => {
        setAssignProcessing(true);
        const validAssignments = assignments.filter((a) => a.employee_id);
        router.post(
            route('work-orders.assign', workOrder.id),
            {
                total_personnel: parseInt(totalPersonnel) || 1,
                assignments: validAssignments,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Karyawan berhasil ditugaskan');
                },
                onError: (err) => {
                    Object.values(err).forEach((m) => toast.error(m));
                },
                onFinish: () => setAssignProcessing(false),
            },
        );
    }, [totalPersonnel, assignments, workOrder.id]);

    // ── Start work submit ───────────────────────────────────────────────
    const handleStartWork = useCallback(() => {
        setStartProcessing(true);
        router.post(
            route('work-orders.start', workOrder.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Pekerjaan dimulai');
                },
                onError: (err) => {
                    Object.values(err).forEach((m) => toast.error(m));
                },
                onFinish: () => setStartProcessing(false),
            },
        );
    }, [workOrder.id]);

    // ── Submit execution ────────────────────────────────────────────────
    const handleSubmitExecution = useCallback(() => {
        if (!resultDescription.trim()) {
            toast.error('Deskripsi hasil pekerjaan wajib diisi');
            return;
        }
        setSubmitProcessing(true);
        const formData = new FormData();
        formData.append('result_description', resultDescription);
        if (executionNotes) formData.append('execution_notes', executionNotes);
        execFiles.forEach((f) => formData.append('attachments[]', f));

        router.post(route('work-orders.submit', workOrder.id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Hasil pekerjaan berhasil dikirim');
                setResultDescription('');
                setExecutionNotes('');
                setExecFiles([]);
            },
            onError: (err) => {
                Object.values(err).forEach((m) => toast.error(m));
            },
            onFinish: () => setSubmitProcessing(false),
        });
    }, [resultDescription, executionNotes, execFiles, workOrder.id]);

    // ── Verify submit ───────────────────────────────────────────────────
    const handleVerifySubmit = useCallback(() => {
        if (!verifyAction) return;
        setVerifyProcessing(true);
        router.post(
            route('work-orders.verify', workOrder.id),
            {
                action: verifyAction,
                notes: verifyNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    const msgs: Record<string, string> = {
                        approved: 'Pekerjaan telah disetujui',
                        rejected: 'Pekerjaan ditolak',
                        revision: 'Revisi diminta',
                    };
                    toast.success(msgs[verifyAction] ?? 'Berhasil');
                },
                onError: (err) => {
                    Object.values(err).forEach((m) => toast.error(m));
                },
                onFinish: () => setVerifyProcessing(false),
            },
        );
    }, [verifyAction, verifyNotes, workOrder.id]);

    // ── File handlers ───────────────────────────────────────────────────
    const handleExecFilesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        setExecFiles((prev) => [...prev, ...files]);
        if (e.target) e.target.value = '';
    }, []);

    const removeExecFile = useCallback((index: number) => {
        setExecFiles((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const addAssignmentRow = useCallback(() => {
        setAssignments((prev) => [...prev, { employee_id: '', role: 'member', notes: '' }]);
    }, []);

    const updateAssignment = useCallback((index: number, field: string, value: string) => {
        setAssignments((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
    }, []);

    const removeAssignment = useCallback((index: number) => {
        setAssignments((prev) => prev.filter((_, i) => i !== index));
    }, []);

    // ── Derived data ────────────────────────────────────────────────────
    const leaders = useMemo(() => workOrder.assignments?.filter((a) => a.role === 'leader') ?? [], [workOrder.assignments]);
    const members = useMemo(() => workOrder.assignments?.filter((a) => a.role === 'member') ?? [], [workOrder.assignments]);

    const isUrgentByAccident = workOrder.priority === 'urgent_by_accident';

    useEffect(() => {
        if (isUrgentByAccident) {
            setExecutionType('immediate');
            setScheduledAt('');
        }
    }, [isUrgentByAccident]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={workOrder.work_order_number + ' - ' + workOrder.title} />

            <div className="flex flex-col gap-6 p-0">
                {/* ── Workflow Timeline ──────────────────────────────── */}
                <WorkflowTimeline status={workOrder.status} />

                {/* ── Header ────────────────────────────────────────── */}
                <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-card to-card/50 p-6 shadow-lg shadow-black/5 md:flex-row md:items-start md:justify-between md:p-8">
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                            >
                                <a href={route('work-orders.index')}>
                                    <ArrowLeft className="h-4 w-4" />
                                </a>
                            </Button>
                            <span className="text-xs font-mono font-medium tracking-wider text-muted-foreground">
                                {workOrder.work_order_number}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                            {workOrder.title}
                        </h1>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', priority.badge)}>
                                {priority.label}
                            </span>
                            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', statusCfg.badge)}>
                                {statusCfg.label}
                            </span>
                            {workOrder.execution_type && (
                                <Badge variant="outline" className="gap-1 text-xs">
                                    <Clock className="h-3 w-3" />
                                    {workOrder.execution_type === 'immediate' ? 'Langsung' : 'Terjadwal'}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Button variant="outline" size="sm" asChild className="gap-1.5">
                            <a href={route('work-orders.index')}>
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Kembali
                            </a>
                        </Button>
                    </div>
                </div>

                {/* ── Detail Cards ──────────────────────────────────── */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Left Column */}
                    <div className="flex flex-col gap-6">
                        <Card className="overflow-hidden border-none shadow-lg shadow-black/5">
                            <CardHeader className="border-b border-border/40 bg-muted/20 pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                                        <FileText className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    Deskripsi Pekerjaan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5">
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                                    {workOrder.job_description}
                                </p>
                            </CardContent>
                        </Card>

                        {workOrder.ai_summary && (
                            <Card className="overflow-hidden border-none bg-gradient-to-br from-violet-500/5 to-primary/5 shadow-lg shadow-black/5">
                                <CardHeader className="border-b border-border/40 pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
                                            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                                        </div>
                                        Ringkasan AI
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-5">
                                    <p className="text-sm leading-relaxed text-foreground/80">
                                        {workOrder.ai_summary}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {workOrder.ai_estimated_completion && (
                            <Card className="overflow-hidden border-none shadow-lg shadow-black/5">
                                <CardHeader className="border-b border-border/40 bg-muted/20 pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                                        </div>
                                        Estimasi Penyelesaian
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-5">
                                    <p className="text-sm font-medium text-foreground">
                                        {workOrder.ai_estimated_completion}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Info Cards */}
                    <div className="flex flex-col gap-6">
                        <Card className="overflow-hidden border-none shadow-lg shadow-black/5">
                            <CardHeader className="border-b border-border/40 bg-muted/20 pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                                        <MapPin className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    Informasi Penugasan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-0.5 pt-5">
                                <InfoRow
                                    icon={Users}
                                    label="Departemen"
                                    value={workOrder.department?.name ?? '-'}
                                />
                                <InfoRow
                                    icon={MapPin}
                                    label="Tenant / Lokasi"
                                    value={workOrder.tenant?.name ?? '-'}
                                />
                                <InfoRow
                                    icon={User}
                                    label="Pelapor"
                                    value={
                                        <div className="flex items-center gap-2">
                                            <div className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white', getAvatarColor(workOrder.reporter?.name ?? ''))}>
                                                {getInitials(workOrder.reporter?.name ?? '?')}
                                            </div>
                                            <span>{workOrder.reporter?.name ?? '-'}</span>
                                        </div>
                                    }
                                />
                                <InfoRow
                                    icon={UserCheck}
                                    label="HOD / Penanggung Jawab"
                                    value={
                                        <div className="flex items-center gap-2">
                                            <div className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white', getAvatarColor(workOrder.hod?.name ?? ''))}>
                                                {getInitials(workOrder.hod?.name ?? '?')}
                                            </div>
                                            <span>{workOrder.hod?.name ?? '-'}</span>
                                        </div>
                                    }
                                />
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden border-none shadow-lg shadow-black/5">
                            <CardHeader className="border-b border-border/40 bg-muted/20 pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                                        <Calendar className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-0.5 pt-5">
                                <InfoRow icon={Calendar} label="Tanggal Order" value={formatDate(workOrder.order_date)} />
                                <InfoRow icon={Calendar} label="Dibuat Pada" value={formatDate(workOrder.created_at)} />
                                <InfoRow icon={Calendar} label="Keputusan HOD" value={formatDate(workOrder.hod_decision_at)} />
                                <InfoRow icon={Calendar} label="Ditugaskan" value={formatDate(workOrder.assigned_at)} />
                                <InfoRow icon={Calendar} label="Dikerjakan" value={formatDate(workOrder.executed_at)} />
                                <InfoRow icon={Calendar} label="Diverifikasi" value={formatDate(workOrder.verified_at)} />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* ── Conditional Action Panels ──────────────────────── */}

                {/* a. Review Work Order (HOD) */}
                {workOrder.status === 'pending_review' && isHod && (
                    <Card className="overflow-hidden border-2 border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-background shadow-lg shadow-amber-500/5 dark:border-amber-500/20 dark:from-amber-500/5">
                        <CardHeader className="border-b border-amber-200/30 pb-4 dark:border-amber-500/10">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                    <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                Review Work Order
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-5">
                            {/* Action buttons */}
                            <div className="grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setReviewAction('approve')}
                                    className={cn(
                                        'flex items-center justify-center gap-2 rounded-xl border-2 p-4 text-sm font-semibold transition-all',
                                        reviewAction === 'approve'
                                            ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 shadow-lg shadow-emerald-500/20 dark:from-emerald-500/10 dark:to-emerald-500/5 dark:text-emerald-400'
                                            : 'border-border/50 bg-muted/20 text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/5',
                                    )}
                                >
                                    <CheckCircle2 className={cn('h-5 w-5', reviewAction === 'approve' ? 'text-emerald-500' : '')} />
                                    Setujui & Lanjutkan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReviewAction('reject')}
                                    className={cn(
                                        'flex items-center justify-center gap-2 rounded-xl border-2 p-4 text-sm font-semibold transition-all',
                                        reviewAction === 'reject'
                                            ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 text-red-700 shadow-lg shadow-red-500/20 dark:from-red-500/10 dark:to-red-500/5 dark:text-red-400'
                                            : 'border-border/50 bg-muted/20 text-muted-foreground hover:border-red-300 hover:bg-red-50/50 dark:hover:border-red-500/30 dark:hover:bg-red-500/5',
                                    )}
                                >
                                    <X className={cn('h-5 w-5', reviewAction === 'reject' ? 'text-red-500' : '')} />
                                    Tolak
                                </button>
                            </div>

                            {reviewAction === 'approve' && !isUrgentByAccident && (
                                <div className="space-y-3 rounded-xl border border-border/60 bg-background p-4">
                                    <Label className="text-sm font-semibold">Tipe Eksekusi</Label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setExecutionType('immediate')}
                                            className={cn(
                                                'flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all',
                                                executionType === 'immediate'
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-border/50 text-muted-foreground hover:border-border',
                                            )}
                                        >
                                            <Wrench className="h-4 w-4" />
                                            Langsung
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setExecutionType('scheduled')}
                                            className={cn(
                                                'flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all',
                                                executionType === 'scheduled'
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-border/50 text-muted-foreground hover:border-border',
                                            )}
                                        >
                                            <Calendar className="h-4 w-4" />
                                            Terjadwal
                                        </button>
                                    </div>
                                    {executionType === 'scheduled' && (
                                        <Field>
                                            <FieldLabel htmlFor="scheduled_at">Jadwal Pelaksanaan</FieldLabel>
                                            <Input
                                                id="scheduled_at"
                                                type="datetime-local"
                                                value={scheduledAt}
                                                onChange={(e) => setScheduledAt(e.target.value)}
                                            />
                                        </Field>
                                    )}
                                </div>
                            )}

                            {isUrgentByAccident && reviewAction === 'approve' && (
                                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/5 dark:text-red-400">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    Work order darurat akan langsung dieksekusi tanpa penjadwalan.
                                </div>
                            )}

                            <Field>
                                <FieldLabel htmlFor="review_notes">Catatan (Opsional)</FieldLabel>
                                <Textarea
                                    id="review_notes"
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    placeholder="Tambahkan catatan untuk work order ini..."
                                    rows={3}
                                />
                            </Field>

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setReviewAction(null);
                                        setReviewNotes('');
                                        setExecutionType('immediate');
                                        setScheduledAt('');
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleReviewSubmit}
                                    disabled={!reviewAction || reviewProcessing}
                                    className="gap-2"
                                >
                                    {reviewProcessing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            {reviewAction === 'approve' ? 'Setujui & Lanjutkan' : 'Tolak'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* b. Assign Karyawan */}
                {workOrder.status === 'planning' && (
                    <Card className="overflow-hidden border-none shadow-lg shadow-black/5">
                        <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                                    <Users className="h-4 w-4 text-violet-500" />
                                </div>
                                Assign Karyawan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-5">
                            <Field>
                                <FieldLabel htmlFor="total_personnel">Total Personel</FieldLabel>
                                <Input
                                    id="total_personnel"
                                    type="number"
                                    min="1"
                                    value={totalPersonnel}
                                    onChange={(e) => setTotalPersonnel(e.target.value)}
                                    className="max-w-[200px]"
                                />
                            </Field>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-foreground">
                                    Daftar Anggota ({assignments.length})
                                </h4>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addAssignmentRow}
                                    className="gap-1.5"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Tambah Anggota
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {assignments.map((assignment, idx) => (
                                    <AssignmentRow
                                        key={idx}
                                        index={idx}
                                        assignment={assignment}
                                        employees={employees}
                                        onRemove={() => removeAssignment(idx)}
                                        onChange={(field, value) => updateAssignment(idx, field, value)}
                                    />
                                ))}
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setAssignments([{ employee_id: '', role: 'member', notes: '' }]);
                                        setTotalPersonnel('1');
                                    }}
                                >
                                    Reset
                                </Button>
                                <Button
                                    onClick={handleAssignSubmit}
                                    disabled={assignProcessing || assignments.every((a) => !a.employee_id)}
                                    className="gap-2"
                                >
                                    {assignProcessing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Users className="h-4 w-4" />
                                            Simpan Penugasan
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* c. Assigned - Start Work */}
                {workOrder.status === 'assigned' && (
                    <Card className="overflow-hidden border-2 border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-background shadow-lg shadow-blue-500/5 dark:border-blue-500/20 dark:from-blue-500/5">
                        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg shadow-blue-500/30">
                                <Wrench className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Pekerjaan Siap Dilaksanakan</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Karyawan telah ditugaskan. Klik tombol di bawah untuk mulai mengerjakan.
                                </p>
                            </div>
                            <Button
                                size="lg"
                                onClick={handleStartWork}
                                disabled={startProcessing}
                                className="gap-2 shadow-lg"
                            >
                                {startProcessing ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <PlayCircle className="h-5 w-5" />
                                )}
                                Mulai Pekerjaan
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* d. In Progress - Submit Result */}
                {workOrder.status === 'in_progress' && (
                    <Card className="overflow-hidden border-none shadow-lg shadow-black/5">
                        <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
                                    <Send className="h-4 w-4 text-cyan-500" />
                                </div>
                                Submit Hasil Pekerjaan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-5">
                            <Field>
                                <FieldLabel htmlFor="result_description" className="after:ml-0.5 after:text-destructive after:content-['*']">
                                    Deskripsi Hasil
                                </FieldLabel>
                                <Textarea
                                    id="result_description"
                                    value={resultDescription}
                                    onChange={(e) => setResultDescription(e.target.value)}
                                    placeholder="Jelaskan hasil pekerjaan yang telah dilakukan..."
                                    rows={4}
                                />
                                {!resultDescription.trim() && (
                                    <FieldError>Deskripsi hasil wajib diisi</FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="execution_notes">Catatan Pelaksanaan</FieldLabel>
                                <Textarea
                                    id="execution_notes"
                                    value={executionNotes}
                                    onChange={(e) => setExecutionNotes(e.target.value)}
                                    placeholder="Catatan tambahan mengenai pelaksanaan pekerjaan..."
                                    rows={3}
                                />
                            </Field>

                            <Field>
                                <FieldLabel>Lampiran File</FieldLabel>
                                <div className="space-y-3">
                                    {execFiles.length > 0 && (
                                        <div className="space-y-2">
                                            {execFiles.map((file, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 transition-all hover:bg-muted/40"
                                                >
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                                                        <Paperclip className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium">{file.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExecFile(idx)}
                                                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border/70 bg-muted/10 p-5 transition-all hover:border-primary/50 hover:bg-primary/5">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                            <Upload className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-foreground">
                                                Klik untuk upload file
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                JPG, PNG, PDF (maks. 10MB per file)
                                            </p>
                                        </div>
                                        <input
                                            ref={execFileInputRef}
                                            type="file"
                                            multiple
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={handleExecFilesChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </Field>

                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSubmitExecution}
                                    disabled={submitProcessing || !resultDescription.trim()}
                                    className="gap-2"
                                >
                                    {submitProcessing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Mengirim...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Submit Hasil
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* e. Submitted - Verification (HOD) */}
                {workOrder.status === 'submitted' && isHod && (
                    <Card className="overflow-hidden border-2 border-teal-200/50 bg-gradient-to-br from-teal-50/50 to-background shadow-lg shadow-teal-500/5 dark:border-teal-500/20 dark:from-teal-500/5">
                        <CardHeader className="border-b border-teal-200/30 pb-4 dark:border-teal-500/10">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10">
                                    <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                </div>
                                Verifikasi Pekerjaan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-5">
                            {/* Read-only execution result */}
                            {workOrder.execution && (
                                <div className="rounded-xl border border-border/60 bg-background p-4">
                                    <h4 className="mb-1 text-sm font-semibold text-foreground">Hasil Pekerjaan</h4>
                                    <p className="whitespace-pre-wrap text-sm text-foreground/80">
                                        {workOrder.execution.result_description}
                                    </p>
                                    {workOrder.execution.execution_notes && (
                                        <>
                                            <Separator className="my-3" />
                                            <p className="text-xs font-medium text-muted-foreground">Catatan Pelaksanaan:</p>
                                            <p className="mt-1 text-sm text-foreground/70">{workOrder.execution.execution_notes}</p>
                                        </>
                                    )}
                                    {workOrder.execution.submittedBy && (
                                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>Diserahkan oleh:</span>
                                            <div className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white', getAvatarColor(workOrder.execution.submittedBy.name))}>
                                                {getInitials(workOrder.execution.submittedBy.name)}
                                            </div>
                                            <span className="font-medium">{workOrder.execution.submittedBy.name}</span>
                                            <span>• {formatDate(workOrder.execution.executed_at)}</span>
                                        </div>
                                    )}
                                    {workOrder.execution.attachments && workOrder.execution.attachments.length > 0 && (
                                        <div className="mt-3 space-y-1.5">
                                            <p className="text-xs font-medium text-muted-foreground">Lampiran:</p>
                                            {workOrder.execution.attachments.map((url, idx) => (
                                                <a
                                                    key={idx}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-xs text-primary hover:underline"
                                                >
                                                    <Paperclip className="h-3 w-3" />
                                                    Lampiran {idx + 1}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Verification action buttons */}
                            <div className="grid gap-3 sm:grid-cols-3">
                                <button
                                    type="button"
                                    onClick={() => setVerifyAction('approved')}
                                    className={cn(
                                        'flex items-center justify-center gap-2 rounded-xl border-2 p-3.5 text-sm font-semibold transition-all',
                                        verifyAction === 'approved'
                                            ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 shadow-lg shadow-emerald-500/20 dark:from-emerald-500/10 dark:to-emerald-500/5 dark:text-emerald-400'
                                            : 'border-border/50 bg-muted/20 text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/5',
                                    )}
                                >
                                    <CheckCircle2 className={cn('h-5 w-5', verifyAction === 'approved' ? 'text-emerald-500' : '')} />
                                    Setujui
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setVerifyAction('revision')}
                                    className={cn(
                                        'flex items-center justify-center gap-2 rounded-xl border-2 p-3.5 text-sm font-semibold transition-all',
                                        verifyAction === 'revision'
                                            ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 shadow-lg shadow-amber-500/20 dark:from-amber-500/10 dark:to-amber-500/5 dark:text-amber-400'
                                            : 'border-border/50 bg-muted/20 text-muted-foreground hover:border-amber-300 hover:bg-amber-50/50 dark:hover:border-amber-500/30 dark:hover:bg-amber-500/5',
                                    )}
                                >
                                    <AlertCircle className={cn('h-5 w-5', verifyAction === 'revision' ? 'text-amber-500' : '')} />
                                    Revisi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setVerifyAction('rejected')}
                                    className={cn(
                                        'flex items-center justify-center gap-2 rounded-xl border-2 p-3.5 text-sm font-semibold transition-all',
                                        verifyAction === 'rejected'
                                            ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 text-red-700 shadow-lg shadow-red-500/20 dark:from-red-500/10 dark:to-red-500/5 dark:text-red-400'
                                            : 'border-border/50 bg-muted/20 text-muted-foreground hover:border-red-300 hover:bg-red-50/50 dark:hover:border-red-500/30 dark:hover:bg-red-500/5',
                                    )}
                                >
                                    <X className={cn('h-5 w-5', verifyAction === 'rejected' ? 'text-red-500' : '')} />
                                    Tolak
                                </button>
                            </div>

                            <Field>
                                <FieldLabel htmlFor="verify_notes">Catatan / Feedback</FieldLabel>
                                <Textarea
                                    id="verify_notes"
                                    value={verifyNotes}
                                    onChange={(e) => setVerifyNotes(e.target.value)}
                                    placeholder="Tambahkan catatan verifikasi..."
                                    rows={3}
                                />
                            </Field>

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setVerifyAction(null);
                                        setVerifyNotes('');
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleVerifySubmit}
                                    disabled={!verifyAction || verifyProcessing}
                                    className="gap-2"
                                >
                                    {verifyProcessing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            {verifyAction === 'approved'
                                                ? 'Setujui'
                                                : verifyAction === 'revision'
                                                    ? 'Minta Revisi'
                                                    : 'Tolak'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* f. Verified - Completion */}
                {workOrder.status === 'verified' && (
                    <Card className="overflow-hidden border-2 border-emerald-200/50 bg-gradient-to-br from-emerald-50/50 to-background shadow-lg shadow-emerald-500/10 dark:border-emerald-500/20 dark:from-emerald-500/5">
                        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 shadow-xl shadow-emerald-500/30">
                                <CheckCircle2 className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-foreground">Pekerjaan Selesai</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Work order telah diverifikasi dan selesai pada{' '}
                                    {formatDate(workOrder.verified_at)}.
                                </p>
                            </div>
                            {workOrder.verification && (
                                <div className="w-full max-w-md rounded-xl border border-emerald-200/60 bg-background/80 p-4 text-left dark:border-emerald-500/10">
                                    <div className="flex items-center gap-2">
                                        <div className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white', getAvatarColor(workOrder.verification.verifiedBy?.name ?? ''))}>
                                            {getInitials(workOrder.verification.verifiedBy?.name ?? '')}
                                        </div>
                                        <span className="text-sm font-medium text-foreground">
                                            {workOrder.verification.verifiedBy?.name ?? '-'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            • {formatDate(workOrder.verification.verified_at)}
                                        </span>
                                    </div>
                                    {workOrder.verification.notes && (
                                        <p className="mt-2 text-sm text-foreground/75">
                                            {workOrder.verification.notes}
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ── Assigned Team Section ──────────────────────────── */}
                {workOrder.assignments && workOrder.assignments.length > 0 && (
                    <Card className="overflow-hidden border-none shadow-lg shadow-black/5">
                        <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                    <Users className="h-4 w-4 text-blue-500" />
                                </div>
                                Tim Pelaksana
                                <span className="ml-1 rounded-full bg-muted-foreground/10 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                    {workOrder.assignments.length}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {workOrder.assignments.map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        className="group flex items-center gap-3 rounded-xl border border-border/50 bg-muted/10 p-3 transition-all hover:border-border/80 hover:bg-muted/30"
                                    >
                                        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white', getAvatarColor(assignment.employee.name))}>
                                            {getInitials(assignment.employee.name)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-foreground">
                                                {assignment.employee.name}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                {assignment.employee.position && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {assignment.employee.position}
                                                    </span>
                                                )}
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                                                        assignment.role === 'leader'
                                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
                                                    )}
                                                >
                                                    {assignment.role === 'leader' ? 'Leader' : 'Member'}
                                                </span>
                                            </div>
                                        </div>
                                        {assignment.notes && (
                                            <div className="relative">
                                                <div className="absolute bottom-full right-0 mb-1 hidden w-48 rounded-lg border border-border/60 bg-popover p-2 text-xs text-popover-foreground shadow-lg group-hover:block">
                                                    {assignment.notes}
                                                </div>
                                                <AlertCircle className="h-4 w-4 text-muted-foreground/50" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── Execution Result Section ───────────────────────── */}
                {workOrder.execution && workOrder.status !== 'in_progress' && (
                    <Card className="overflow-hidden border-none shadow-lg shadow-black/5">
                        <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                    <FileText className="h-4 w-4 text-emerald-500" />
                                </div>
                                Hasil Pekerjaan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-5">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                                {workOrder.execution.result_description}
                            </p>
                            {workOrder.execution.execution_notes && (
                                <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                                    <p className="text-xs font-medium text-muted-foreground">Catatan Pelaksanaan:</p>
                                    <p className="mt-1 text-sm text-foreground/75">{workOrder.execution.execution_notes}</p>
                                </div>
                            )}
                            {workOrder.execution.submittedBy && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>Diserahkan oleh:</span>
                                    <div className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white', getAvatarColor(workOrder.execution.submittedBy.name))}>
                                        {getInitials(workOrder.execution.submittedBy.name)}
                                    </div>
                                    <span className="font-medium">{workOrder.execution.submittedBy.name}</span>
                                    <span>• {formatDate(workOrder.execution.executed_at)}</span>
                                </div>
                            )}
                            {workOrder.execution.attachments && workOrder.execution.attachments.length > 0 && (
                                <div>
                                    <p className="mb-2 text-xs font-medium text-muted-foreground">Lampiran:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {workOrder.execution.attachments.map((url, idx) => (
                                            <a
                                                key={idx}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/5 hover:text-primary/80"
                                            >
                                                <Paperclip className="h-3 w-3" />
                                                Lampiran {idx + 1}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ── Verification Result Section ───────────────────── */}
                {workOrder.verification && (
                    <Card className="overflow-hidden border-none shadow-lg shadow-black/5">
                        <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10">
                                    <CheckCircle2 className="h-4 w-4 text-teal-500" />
                                </div>
                                Hasil Verifikasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-5">
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
                                        workOrder.verification.status === 'approved' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
                                        workOrder.verification.status === 'rejected' && 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
                                        workOrder.verification.status === 'revision' && 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
                                    )}
                                >
                                    {workOrder.verification.status === 'approved' && <CheckCircle2 className="h-3.5 w-3.5" />}
                                    {workOrder.verification.status === 'rejected' && <X className="h-3.5 w-3.5" />}
                                    {workOrder.verification.status === 'revision' && <AlertCircle className="h-3.5 w-3.5" />}
                                    {workOrder.verification.status === 'approved' ? 'Disetujui' : workOrder.verification.status === 'rejected' ? 'Ditolak' : 'Revisi'}
                                </div>
                            </div>
                            {workOrder.verification.notes && (
                                <p className="text-sm leading-relaxed text-foreground/80">
                                    {workOrder.verification.notes}
                                </p>
                            )}
                            {workOrder.verification.verifiedBy && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>Diverifikasi oleh:</span>
                                    <div className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white', getAvatarColor(workOrder.verification.verifiedBy.name))}>
                                        {getInitials(workOrder.verification.verifiedBy.name)}
                                    </div>
                                    <span className="font-medium">{workOrder.verification.verifiedBy.name}</span>
                                    <span>• {formatDate(workOrder.verification.verified_at)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ── Rejected / Revision / Cancelled State ─────────── */}
                {['rejected', 'revision', 'cancelled'].includes(workOrder.status) && (
                    <Card className="overflow-hidden border-2 border-red-200/50 bg-gradient-to-br from-red-50/50 to-background shadow-lg shadow-red-500/5 dark:border-red-500/20 dark:from-red-500/5">
                        <CardContent className="flex items-center gap-4 py-6">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                                <AlertCircle className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">
                                    {workOrder.status === 'rejected' && 'Work Order Ditolak'}
                                    {workOrder.status === 'revision' && 'Work Order Memerlukan Revisi'}
                                    {workOrder.status === 'cancelled' && 'Work Order Dibatalkan'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {workOrder.status_label}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

// ── Extra icon used ────────────────────────────────────────────────────────
function PlayCircle(props: React.ComponentProps<typeof FileText>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
        </svg>
    );
}
