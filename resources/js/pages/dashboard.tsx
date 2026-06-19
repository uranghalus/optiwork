import AppLayout from '@/layouts/app-layout';
import { sidebarData } from '@/lib/sidebar-data';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    ArrowUpRight,
    CalendarClock,
    ChevronRight,
    Clock,
    FileCheck,
    History,
    LayoutDashboard,
    ListTodo,
    MapPin,
    MoreHorizontal,
    Plus,
    TrendingUp,
    Users,
    Wrench,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

// ── Stat Card ──────────────────────────────────────────────────────────────────
interface StatCardProps {
    label: string;
    value: string;
    change: string;
    positive: boolean;
    icon: React.ElementType;
    gradient: string;
    progress: number;
}

function StatCard({ label, value, change, positive, icon: Icon, gradient, progress }: StatCardProps) {
    return (
        <div
            className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg shadow-black/10 transition-all hover:-translate-y-1 hover:shadow-xl ${gradient}`}
        >
            {/* Decorative elements */}
            <div className="pointer-events-none absolute -top-6 -right-6 h-28 w-28 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute top-1/2 -left-8 h-16 w-16 rounded-full bg-white/5" />

            <div className="relative">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-medium tracking-wide text-white/70 uppercase">{label}</p>
                        <p className="mt-1.5 text-3xl font-bold tracking-tight">{value}</p>
                    </div>
                    <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
                        <Icon className="h-5 w-5" />
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                    <div className="h-full rounded-full bg-white/60 transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>

                {/* Change indicator */}
                <div className="mt-2 flex items-center gap-1.5">
                    <span
                        className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            positive ? 'bg-emerald-400/25 text-emerald-100' : 'bg-white/20 text-white/90'
                        }`}
                    >
                        <TrendingUp className={`h-3 w-3 ${positive ? '' : 'rotate-180'}`} />
                        {change}
                    </span>
                    <span className="text-[11px] text-white/50">vs bulan lalu</span>
                </div>
            </div>
        </div>
    );
}

// ── Quick Action Card ───────────────────────────────────────────────────────────
interface QuickActionProps {
    title: string;
    description: string;
    href: string;
    icon: React.ElementType;
    accent: string;
    iconBg: string;
    iconColor: string;
}

function QuickAction({ title, description, href, icon: Icon, accent, iconBg, iconColor }: QuickActionProps) {
    return (
        <Link
            href={href}
            className="group border-border/60 bg-card relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
            {/* Accent left bar */}
            <div className={`absolute inset-y-0 left-0 w-1 ${accent} transition-all group-hover:w-1.5`} />

            <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg} transition-transform duration-200 group-hover:scale-110`}
            >
                <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div className="min-w-0 flex-1 pl-1">
                <p className="text-card-foreground truncate text-sm font-semibold">{title}</p>
                <p className="text-muted-foreground truncate text-xs">{description}</p>
            </div>
            <ChevronRight className="text-muted-foreground/40 group-hover:text-primary h-4 w-4 shrink-0 transition-all group-hover:translate-x-0.5" />
        </Link>
    );
}

// ── Activity Item ──────────────────────────────────────────────────────────────
interface ActivityItemProps {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
    time: string;
}

function ActivityItem({ icon: Icon, iconBg, iconColor, title, subtitle, time }: ActivityItemProps) {
    return (
        <div className="group hover:bg-muted/50 flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-card-foreground text-sm font-medium">{title}</p>
                <p className="text-muted-foreground text-xs">{subtitle}</p>
            </div>
            <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {time}
            </div>
        </div>
    );
}

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: 'completed' | 'in-progress' | 'pending' | 'overdue' }) {
    const styles = {
        completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
        'in-progress': 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
        pending: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
        overdue: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    };
    const labels = { completed: 'Selesai', 'in-progress': 'Berjalan', pending: 'Menunggu', overdue: 'Terlambat' };
    return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
}

// ── Team Member Row ────────────────────────────────────────────────────────────
function TeamRow({ name, role, completion, barColor }: { name: string; role: string; completion: number; barColor: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                {name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                    <p className="text-card-foreground truncate text-sm font-medium">{name}</p>
                    <span className="text-card-foreground text-xs font-semibold">{completion}%</span>
                </div>
                <p className="text-muted-foreground text-[11px]">{role}</p>
                <div className="bg-muted mt-1 h-1.5 w-full overflow-hidden rounded-full">
                    <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${completion}%` }} />
                </div>
            </div>
        </div>
    );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const firstName = user.name?.split(' ')[0] ?? 'User';

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Sore';

    const todayStr = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    // ── Stats ────────────────────────────────────────────────────────
    const stats: StatCardProps[] = [
        {
            label: 'Total Work Orders',
            value: '1,248',
            change: '+8.4%',
            positive: true,
            icon: LayoutDashboard,
            gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
            progress: 82,
        },
        {
            label: 'Work Orders Aktif',
            value: '134',
            change: '+3.1%',
            positive: true,
            icon: Wrench,
            gradient: 'bg-gradient-to-br from-violet-500 to-purple-700',
            progress: 45,
        },
        {
            label: 'Jadwal Hari Ini',
            value: '28',
            change: '+5.6%',
            positive: true,
            icon: CalendarClock,
            gradient: 'bg-gradient-to-br from-amber-400 to-orange-600',
            progress: 68,
        },
        {
            label: 'Menunggu Approval',
            value: '12',
            change: '-2',
            positive: false,
            icon: FileCheck,
            gradient: 'bg-gradient-to-br from-rose-500 to-red-700',
            progress: 24,
        },
    ];

    // ── Quick Actions ────────────────────────────────────────────────
    const workGroup = sidebarData.navGroups.find((g) => g.title.toLowerCase().includes('manajemen') || g.title.toLowerCase().includes('work'));
    const accents = ['bg-indigo-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
    const iconBgs = [
        'bg-indigo-50 dark:bg-indigo-500/10',
        'bg-violet-50 dark:bg-violet-500/10',
        'bg-emerald-50 dark:bg-emerald-500/10',
        'bg-amber-50 dark:bg-amber-500/10',
        'bg-rose-50 dark:bg-rose-500/10',
    ];
    const iconColors = [
        'text-indigo-600 dark:text-indigo-400',
        'text-violet-600 dark:text-violet-400',
        'text-emerald-600 dark:text-emerald-400',
        'text-amber-600 dark:text-amber-400',
        'text-rose-600 dark:text-rose-400',
    ];
    const quickActions: QuickActionProps[] = (workGroup?.items ?? []).map((item, i) => ({
        title: item.title,
        description: workGroup?.title ?? 'Work',
        href: item.url,
        icon: (item.icon as React.ElementType) ?? Wrench,
        accent: accents[i % accents.length],
        iconBg: iconBgs[i % iconBgs.length],
        iconColor: iconColors[i % iconColors.length],
    }));

    // ── Activities ───────────────────────────────────────────────────
    const recentActivities: ActivityItemProps[] = [
        {
            icon: LayoutDashboard,
            iconBg: 'bg-indigo-100 dark:bg-indigo-500/20',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
            title: 'Work order #1245 dibuat',
            subtitle: 'oleh Siti — Gedung A',
            time: '5 mnt',
        },
        {
            icon: Wrench,
            iconBg: 'bg-violet-100 dark:bg-violet-500/20',
            iconColor: 'text-violet-600 dark:text-violet-400',
            title: 'Work order #1239 ditugaskan',
            subtitle: 'ke Tim Maintenance — oleh Ahmad',
            time: '28 mnt',
        },
        {
            icon: ListTodo,
            iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            title: 'Task rutin selesai',
            subtitle: 'Inspeksi pendingin — Ruang Server',
            time: '1 jam',
        },
        {
            icon: FileCheck,
            iconBg: 'bg-amber-100 dark:bg-amber-500/20',
            iconColor: 'text-amber-600 dark:text-amber-400',
            title: 'Persetujuan #442 menunggu',
            subtitle: 'Pembelian suku cadang — 2 item',
            time: '2 jam',
        },
        {
            icon: History,
            iconBg: 'bg-slate-100 dark:bg-slate-700',
            iconColor: 'text-slate-600 dark:text-slate-400',
            title: 'Laporan harian terkirim',
            subtitle: 'Tim A — 18 laporan',
            time: '3 jam',
        },
    ];

    // ── Today's Schedule ─────────────────────────────────────────────
    const todaySchedule = [
        { time: '08:00', title: 'Inspeksi AC Gedung A', location: 'Lantai 3', status: 'completed' as const },
        { time: '10:30', title: 'Perbaikan lift service', location: 'Tower B', status: 'in-progress' as const },
        { time: '13:00', title: 'Ganti lampu koridor', location: 'Gedung C', status: 'pending' as const },
        { time: '15:00', title: 'Cek kebocoran pipa', location: 'Gudang Utama', status: 'pending' as const },
        { time: '16:30', title: 'Maintenance genset', location: 'Basement', status: 'overdue' as const },
    ];

    const dotColors = {
        completed: 'bg-emerald-500 ring-emerald-500/30',
        'in-progress': 'bg-blue-500 ring-blue-500/30',
        pending: 'bg-amber-400 ring-amber-400/30',
        overdue: 'bg-rose-500 ring-rose-500/30',
    };

    // ── Work Order Status ────────────────────────────────────────────
    const workOrderStatus = [
        { label: 'Selesai', value: 2587, pct: 91, color: 'bg-emerald-500', text: 'text-emerald-500' },
        { label: 'Berjalan', value: 134, pct: 5, color: 'bg-blue-500', text: 'text-blue-500' },
        { label: 'Menunggu', value: 89, pct: 3, color: 'bg-amber-400', text: 'text-amber-400' },
        { label: 'Terlambat', value: 37, pct: 1, color: 'bg-rose-500', text: 'text-rose-500' },
    ];
    const totalWorkOrders = workOrderStatus.reduce((sum, item) => sum + item.value, 0);

    // ── Team Performance ─────────────────────────────────────────────
    const teamPerformance = [
        { name: 'Ahmad Fauzi', role: 'Teknisi Senior', completion: 96, barColor: 'bg-emerald-500' },
        { name: 'Siti Nurhaliza', role: 'Supervisor', completion: 92, barColor: 'bg-emerald-500' },
        { name: 'Budi Santoso', role: 'Teknisi', completion: 85, barColor: 'bg-blue-500' },
        { name: 'Dewi Lestari', role: 'Admin', completion: 78, barColor: 'bg-amber-400' },
        { name: 'Rizki Pratama', role: 'Teknisi Junior', completion: 65, barColor: 'bg-amber-400' },
    ];

    // ── Priority Tasks ───────────────────────────────────────────────
    const priorityTasks = [
        {
            title: 'Perbaikan AC Ruang Server',
            priority: 'Tinggi',
            deadline: 'Hari ini, 15:00',
            icon: AlertCircle,
            color: 'text-rose-500',
            bg: 'bg-rose-50 dark:bg-rose-500/10',
        },
        {
            title: 'Inspeksi fire alarm Tower A',
            priority: 'Tinggi',
            deadline: 'Hari ini, 16:00',
            icon: AlertCircle,
            color: 'text-rose-500',
            bg: 'bg-rose-50 dark:bg-rose-500/10',
        },
        {
            title: 'Maintenance lift Gedung B',
            priority: 'Sedang',
            deadline: 'Besok, 09:00',
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* ── Welcome Banner ─────────────────────────────────── */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-6 py-7 text-white shadow-xl shadow-indigo-500/20 sm:px-8">
                    {/* Decorative orbs */}
                    <div className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                    <div className="pointer-events-none absolute right-1/3 -bottom-10 h-40 w-40 rounded-full bg-violet-400/15 blur-3xl" />
                    <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-48 rounded-tr-full bg-white/5" />

                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-lg">
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-indigo-200">{greeting},</p>
                                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">{firstName}</span>
                            </div>
                            <h1 className="mt-2 text-2xl leading-tight font-bold sm:text-3xl">Ringkasan Harian Anda</h1>
                            {(user.position || user.department) && (
                                <p className="mt-1 text-sm text-indigo-200/80">{[user.position, user.department].filter(Boolean).join(' · ')}</p>
                            )}
                            <p className="mt-2 text-sm leading-relaxed text-indigo-100/80">
                                Berikut ringkasan aktivitas pekerjaan, jadwal, dan approval yang memerlukan perhatian Anda.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                            <p className="flex items-center gap-1.5 text-xs text-indigo-200">
                                <CalendarClock className="h-3.5 w-3.5" />
                                {todayStr}
                            </p>
                            <Link
                                href="/work-orders"
                                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-white/25"
                            >
                                <Plus className="h-4 w-4" /> Buat Work Order
                            </Link>
                        </div>
                    </div>

                    {/* Mini stats */}
                    <div className="relative mt-6 grid grid-cols-3 divide-x divide-white/10 rounded-xl bg-white/10 backdrop-blur-sm">
                        <div className="px-4 py-3 text-center">
                            <p className="text-lg font-bold">134</p>
                            <p className="text-[11px] text-indigo-200">WO Aktif</p>
                        </div>
                        <div className="px-4 py-3 text-center">
                            <p className="text-lg font-bold">28</p>
                            <p className="text-[11px] text-indigo-200">Jadwal Hari Ini</p>
                        </div>
                        <div className="px-4 py-3 text-center">
                            <p className="text-lg font-bold">12</p>
                            <p className="text-[11px] text-indigo-200">Menunggu Approval</p>
                        </div>
                    </div>
                </div>

                {/* ── Stats Grid ─────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((s) => (
                        <StatCard key={s.label} {...s} />
                    ))}
                </div>

                {/* ── Row 1: Quick Actions + Schedule ────────────────── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Quick Actions */}
                    <div className="lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-card-foreground text-base font-semibold">Aksi Cepat</h2>
                                <p className="text-muted-foreground text-xs">Akses modul manajemen kerja</p>
                            </div>
                            <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-medium">
                                {quickActions.length} modul
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {quickActions.map((qa) => (
                                <QuickAction key={qa.title} {...qa} />
                            ))}
                        </div>
                    </div>

                    {/* Today's Schedule */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-card-foreground text-base font-semibold">Jadwal Hari Ini</h2>
                                <p className="text-muted-foreground text-xs">
                                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                            <Link href="/work-schedules" className="text-primary hover:text-primary/80 text-xs font-medium">
                                Semua
                            </Link>
                        </div>
                        <div className="border-border/60 bg-card rounded-2xl border p-5 shadow-sm">
                            <div className="relative space-y-0">
                                {todaySchedule.map((item, index) => (
                                    <div key={index} className="relative flex items-start gap-3 pb-4 last:pb-0">
                                        {/* Timeline */}
                                        <div className="flex w-14 shrink-0 flex-col items-center">
                                            <span className="text-card-foreground text-xs font-semibold">{item.time}</span>
                                        </div>
                                        {/* Dot + line */}
                                        <div className="relative flex flex-col items-center">
                                            <div className={`h-3 w-3 rounded-full ${dotColors[item.status]} ring-4`} />
                                            {index < todaySchedule.length - 1 && <div className="bg-border mt-1 h-full min-h-[32px] w-px" />}
                                        </div>
                                        {/* Content */}
                                        <div className="min-w-0 flex-1 pb-2">
                                            <p className="text-card-foreground text-sm font-medium">{item.title}</p>
                                            <p className="text-muted-foreground flex items-center gap-1 text-xs">
                                                <MapPin className="h-3 w-3" /> {item.location}
                                            </p>
                                            <div className="mt-1.5">
                                                <StatusBadge status={item.status} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Row 2: WO Status + Activity ────────────────────── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Work Order Status */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-card-foreground text-base font-semibold">Status Work Orders</h2>
                                <p className="text-muted-foreground text-xs">Distribusi keseluruhan</p>
                            </div>
                            <button className="text-muted-foreground hover:bg-muted rounded-md p-1">
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="border-border/60 bg-card rounded-2xl border p-6 shadow-sm">
                            {/* Donut chart */}
                            <div className="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center">
                                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
                                    {
                                        workOrderStatus.reduce(
                                            (acc, item) => {
                                                const circumference = 2 * Math.PI * 38;
                                                const segment = (item.value / totalWorkOrders) * circumference;
                                                const circle = (
                                                    <circle
                                                        key={item.label}
                                                        cx="50"
                                                        cy="50"
                                                        r="38"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="10"
                                                        strokeDasharray={`${segment} ${circumference}`}
                                                        strokeDashoffset={-acc.offset}
                                                        className={item.text}
                                                        strokeLinecap="round"
                                                    />
                                                );
                                                acc.circles.push(circle);
                                                acc.offset += segment;
                                                return acc;
                                            },
                                            { circles: [] as React.ReactNode[], offset: 0 },
                                        ).circles
                                    }
                                </svg>
                                <div className="absolute text-center">
                                    <p className="text-card-foreground text-2xl font-bold">{totalWorkOrders.toLocaleString()}</p>
                                    <p className="text-muted-foreground text-[11px]">Total WO</p>
                                </div>
                            </div>

                            {/* Legend with progress bars */}
                            <div className="space-y-3">
                                {workOrderStatus.map((item) => (
                                    <div key={item.label}>
                                        <div className="mb-1 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                                                <span className="text-card-foreground text-sm">{item.label}</span>
                                            </div>
                                            <span className="text-card-foreground text-sm font-semibold">{item.value.toLocaleString()}</span>
                                        </div>
                                        <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
                                            <div
                                                className={`h-full rounded-full ${item.color} transition-all duration-700`}
                                                style={{ width: `${item.pct}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-card-foreground text-base font-semibold">Aktivitas Terkini</h2>
                                <p className="text-muted-foreground text-xs">Pembaruan real-time sistem</p>
                            </div>
                            <Link
                                href="/audit-logs"
                                className="text-primary hover:bg-primary/10 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                            >
                                Lihat Semua <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                        <div className="border-border/60 bg-card rounded-2xl border shadow-sm">
                            <div className="divide-border/40 divide-y px-4">
                                {recentActivities.map((a, i) => (
                                    <ActivityItem key={i} {...a} />
                                ))}
                            </div>
                            <div className="border-border/40 border-t px-5 py-3">
                                <Link
                                    href="/audit-logs"
                                    className="text-muted-foreground hover:text-primary flex items-center justify-center gap-1 text-xs font-medium transition-colors"
                                >
                                    Muat lebih banyak <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Row 3: Team Performance + Priority Tasks ──────── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Team Performance */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-card-foreground text-base font-semibold">Performa Tim</h2>
                                <p className="text-muted-foreground text-xs">Tingkat penyelesaian bulan ini</p>
                            </div>
                            <Link href="/employees" className="text-primary hover:text-primary/80 text-xs font-medium">
                                Lihat semua
                            </Link>
                        </div>
                        <div className="border-border/60 bg-card rounded-2xl border p-5 shadow-sm">
                            <div className="bg-muted/50 mb-4 flex items-center gap-3 rounded-lg p-3">
                                <Users className="text-primary h-5 w-5" />
                                <div>
                                    <p className="text-card-foreground text-sm font-semibold">24 Anggota Aktif</p>
                                    <p className="text-muted-foreground text-xs">Rata-rata penyelesaian: 83%</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {teamPerformance.map((member) => (
                                    <TeamRow key={member.name} {...member} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Priority Tasks */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-card-foreground text-base font-semibold">Tugas Prioritas</h2>
                                <p className="text-muted-foreground text-xs">Butuh perhatian segera</p>
                            </div>
                            <Link href="/work-orders" className="text-primary hover:text-primary/80 text-xs font-medium">
                                Semua tugas
                            </Link>
                        </div>
                        <div className="border-border/60 bg-card rounded-2xl border p-5 shadow-sm">
                            <div className="space-y-3">
                                {priorityTasks.map((task, index) => (
                                    <div
                                        key={index}
                                        className="group border-border/40 hover:border-primary/20 flex items-start gap-3 rounded-xl border p-4 transition-all hover:shadow-sm"
                                    >
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${task.bg}`}>
                                            <task.icon className={`h-5 w-5 ${task.color}`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-card-foreground text-sm font-semibold">{task.title}</p>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                                        task.priority === 'Tinggi'
                                                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
                                                            : 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'
                                                    }`}
                                                >
                                                    {task.priority}
                                                </span>
                                                <span className="text-muted-foreground text-[11px]">{task.deadline}</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="text-muted-foreground/40 group-hover:text-primary h-4 w-4 shrink-0 transition-all" />
                                    </div>
                                ))}
                            </div>
                            <Link
                                href="/work-orders"
                                className="bg-primary/5 text-primary hover:bg-primary/10 mt-4 flex items-center justify-center gap-1 rounded-lg py-2.5 text-xs font-medium transition-colors"
                            >
                                Lihat Semua Tugas <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── Footer ─────────────────────────────────────────── */}
                <p className="text-muted-foreground/60 text-center text-xs">
                    OptiWork WMS v1.0.0 · {new Date().getFullYear()} Optimaverse · Data contoh
                </p>
            </div>
        </AppLayout>
    );
}
