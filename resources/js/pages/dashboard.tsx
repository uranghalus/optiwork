import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArchiveX,
    ArrowRight,
    ArrowUpRight,
    Boxes,
    CheckSquare,
    ClipboardList,
    Clock,
    Handshake,
    History,
    MapPin,
    Move,
    Package,
    TrendingUp,
    Warehouse,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

// ── Stat Card ──────────────────────────────────────────────────────────────────
interface StatCardProps {
    label: string;
    value: string;
    change: string;
    positive: boolean;
    icon: React.ElementType;
    gradient: string;
    iconBg: string;
}

function StatCard({ label, value, change, positive, icon: Icon, gradient, iconBg }: StatCardProps) {
    return (
        <div className={`relative overflow-hidden rounded-2xl p-6 ${gradient} shadow-lg`}>
            {/* Decorative circle */}
            <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />

            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-white/70">{label}</p>
                    <p className="mt-2 text-4xl font-bold text-white">{value}</p>
                    <div className="mt-3 flex items-center gap-1.5">
                        <span
                            className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                positive ? 'bg-white/20 text-white' : 'bg-white/20 text-white'
                            }`}
                        >
                            <TrendingUp className="h-3 w-3" />
                            {change}
                        </span>
                        <span className="text-xs text-white/60">vs bulan lalu</span>
                    </div>
                </div>
                <div className={`rounded-xl p-3 ${iconBg}`}>
                    <Icon className="h-6 w-6 text-white" />
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
    color: string;
    bg: string;
}

function QuickAction({ title, description, href, icon: Icon, color, bg }: QuickActionProps) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-transparent hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-transparent"
        >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg} transition-transform duration-200 group-hover:scale-110`}>
                <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{description}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-slate-500 dark:text-slate-600" />
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
        <div className="flex items-start gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <Clock className="h-3 w-3" />
                {time}
            </div>
        </div>
    );
}

// ── Module Card ────────────────────────────────────────────────────────────────
interface ModuleCardProps {
    title: string;
    count: number;
    total: number;
    color: string;
    bg: string;
}

function ModuleCard({ title, count, total, color, bg }: ModuleCardProps) {
    const pct = Math.round((count / total) * 100);
    return (
        <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${bg}`} />
            <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{title}</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{count.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                        className={`h-full rounded-full ${color} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                    />
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
    const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';

    const stats: StatCardProps[] = [
        {
            label: 'Total Aset',
            value: '2,847',
            change: '+12.5%',
            positive: true,
            icon: Boxes,
            gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
            iconBg: 'bg-white/20',
        },
        {
            label: 'Peminjaman Aktif',
            value: '134',
            change: '+4.3%',
            positive: true,
            icon: Handshake,
            gradient: 'bg-gradient-to-br from-violet-500 to-purple-700',
            iconBg: 'bg-white/20',
        },
        {
            label: 'Stok Rendah',
            value: '23',
            change: '-8.1%',
            positive: false,
            icon: Warehouse,
            gradient: 'bg-gradient-to-br from-amber-400 to-orange-600',
            iconBg: 'bg-white/20',
        },
        {
            label: 'Menunggu Persetujuan',
            value: '9',
            change: '+2',
            positive: false,
            icon: CheckSquare,
            gradient: 'bg-gradient-to-br from-rose-500 to-red-700',
            iconBg: 'bg-white/20',
        },
    ];

    const quickActions: QuickActionProps[] = [
        {
            title: 'Daftar Aset',
            description: 'Kelola seluruh inventaris aset',
            href: '/assets',
            icon: Boxes,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-500/10',
        },
        {
            title: 'Mutasi Aset',
            description: 'Proses pemindahan aset antar lokasi',
            href: '/asset-transfers',
            icon: Move,
            color: 'text-violet-600 dark:text-violet-400',
            bg: 'bg-violet-50 dark:bg-violet-500/10',
        },
        {
            title: 'Peminjaman',
            description: 'Catat & lacak peminjaman aset',
            href: '/asset-loans',
            icon: Handshake,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        },
        {
            title: 'Transaksi Stok',
            description: 'Rekam transaksi masuk & keluar',
            href: '/stock-transactions',
            icon: ClipboardList,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
        },
        {
            title: 'Persetujuan',
            description: 'Tinjau permintaan yang masuk',
            href: '/approvals',
            icon: CheckSquare,
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50 dark:bg-rose-500/10',
        },
        {
            title: 'Penghapusan Aset',
            description: 'Proses disposal & penghapusan',
            href: '/asset-disposals',
            icon: ArchiveX,
            color: 'text-slate-600 dark:text-slate-400',
            bg: 'bg-slate-100 dark:bg-slate-700',
        },
    ];

    const recentActivities: ActivityItemProps[] = [
        {
            icon: Boxes,
            iconBg: 'bg-indigo-100 dark:bg-indigo-500/20',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
            title: 'Aset Laptop Dell XPS ditambahkan',
            subtitle: 'Departemen IT — Gedung A Lt. 2',
            time: '5 mnt lalu',
        },
        {
            icon: Move,
            iconBg: 'bg-violet-100 dark:bg-violet-500/20',
            iconColor: 'text-violet-600 dark:text-violet-400',
            title: 'Mutasi aset ke Gedung B disetujui',
            subtitle: '3 unit printer — oleh Budi Santoso',
            time: '28 mnt lalu',
        },
        {
            icon: Handshake,
            iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            title: 'Peminjaman proyektor dikembalikan',
            subtitle: 'Ruang Rapat 3 — tepat waktu',
            time: '1 jam lalu',
        },
        {
            icon: CheckSquare,
            iconBg: 'bg-amber-100 dark:bg-amber-500/20',
            iconColor: 'text-amber-600 dark:text-amber-400',
            title: 'Persetujuan pembelian aset baru',
            subtitle: '5 unit AC — menunggu tanda tangan',
            time: '2 jam lalu',
        },
        {
            icon: History,
            iconBg: 'bg-slate-100 dark:bg-slate-700',
            iconColor: 'text-slate-600 dark:text-slate-400',
            title: 'Audit aset Q2 2026 selesai',
            subtitle: '847 aset diverifikasi tanpa selisih',
            time: '3 jam lalu',
        },
        {
            icon: MapPin,
            iconBg: 'bg-rose-100 dark:bg-rose-500/20',
            iconColor: 'text-rose-600 dark:text-rose-400',
            title: 'Lokasi baru ditambahkan',
            subtitle: 'Gudang Cikarang — kapasitas 500 unit',
            time: 'Kemarin',
        },
    ];

    const moduleStats: ModuleCardProps[] = [
        { title: 'Aset Aktif', count: 2587, total: 2847, color: 'bg-indigo-500', bg: 'bg-indigo-500' },
        { title: 'Sedang Dipinjam', count: 134, total: 2847, color: 'bg-violet-500', bg: 'bg-violet-500' },
        { title: 'Dalam Perbaikan', count: 89, total: 2847, color: 'bg-amber-400', bg: 'bg-amber-400' },
        { title: 'Dihapus / Disposed', count: 37, total: 2847, color: 'bg-rose-500', bg: 'bg-rose-500' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-6">

                {/* ── Welcome Banner ─────────────────────────────────── */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 px-8 py-7 shadow-xl">
                    {/* Background decoration */}
                    <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-12 right-24 h-40 w-40 rounded-full bg-purple-400/20 blur-2xl" />
                    <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-64 rounded-tl-full bg-white/5" />

                    <div className="relative flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-indigo-200">{greeting}, 👋</p>
                            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{firstName}</h1>
                            {(user.position || user.department) && (
                                <p className="mt-1 text-sm text-indigo-200">
                                    {[user.position, user.department].filter(Boolean).join(' · ')}
                                </p>
                            )}
                            <p className="mt-3 max-w-md text-sm text-indigo-100 leading-relaxed">
                                Selamat datang di <strong>DutaAsset</strong>. Berikut ringkasan aktivitas sistem aset hari ini.
                            </p>
                        </div>
                        <Link
                            href="/assets"
                            className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25 sm:mt-0 sm:self-auto"
                        >
                            Lihat Semua Aset
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                {/* ── Stats Grid ─────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((s) => (
                        <StatCard key={s.label} {...s} />
                    ))}
                </div>

                {/* ── Main Content Row ───────────────────────────────── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* ── Quick Actions (2/3 width) ──────────────────── */}
                    <div className="lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Aksi Cepat</h2>
                            <span className="text-xs text-slate-400">6 modul</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {quickActions.map((qa) => (
                                <QuickAction key={qa.title} {...qa} />
                            ))}
                        </div>
                    </div>

                    {/* ── Asset Distribution (1/3 width) ─────────────── */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Status Aset</h2>
                            <Link href="/assets" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                                Detail →
                            </Link>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            {/* Donut chart simulation */}
                            <div className="relative mx-auto mb-6 flex h-36 w-36 items-center justify-center">
                                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                                    {/* Background */}
                                    <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="12" className="text-slate-100 dark:text-slate-800" />
                                    {/* Segments */}
                                    <circle cx="50" cy="50" r="38" fill="none" stroke="#6366f1" strokeWidth="12"
                                        strokeDasharray={`${(2587 / 2847) * 239} 239`}
                                        strokeDashoffset="0" />
                                    <circle cx="50" cy="50" r="38" fill="none" stroke="#8b5cf6" strokeWidth="12"
                                        strokeDasharray={`${(134 / 2847) * 239} 239`}
                                        strokeDashoffset={`-${(2587 / 2847) * 239}`} />
                                    <circle cx="50" cy="50" r="38" fill="none" stroke="#fbbf24" strokeWidth="12"
                                        strokeDasharray={`${(89 / 2847) * 239} 239`}
                                        strokeDashoffset={`-${((2587 + 134) / 2847) * 239}`} />
                                    <circle cx="50" cy="50" r="38" fill="none" stroke="#f43f5e" strokeWidth="12"
                                        strokeDasharray={`${(37 / 2847) * 239} 239`}
                                        strokeDashoffset={`-${((2587 + 134 + 89) / 2847) * 239}`} />
                                </svg>
                                <div className="absolute text-center">
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">2,847</p>
                                    <p className="text-xs text-slate-500">Total</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {moduleStats.map((m) => (
                                    <ModuleCard key={m.title} {...m} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Recent Activity ────────────────────────────────── */}
                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Aktivitas Terkini</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Pembaruan real-time sistem aset</p>
                        </div>
                        <Link
                            href="/audit-logs"
                            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                        >
                            Lihat Semua
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-50 px-6 dark:divide-slate-800">
                        {recentActivities.map((a, i) => (
                            <div key={i} className="py-4">
                                <ActivityItem {...a} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Footer ─────────────────────────────────────────── */}
                <p className="text-center text-xs text-slate-400 dark:text-slate-600">
                    DutaAsset v1.0.0 · {new Date().getFullYear()} Optimaverse · Semua data bersifat demonstrasi
                </p>
            </div>
        </AppLayout>
    );
}
