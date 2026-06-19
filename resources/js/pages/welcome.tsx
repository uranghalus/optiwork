import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Briefcase,
    CalendarClock,
    CheckCircle2,
    FileCheck,
    LayoutDashboard,
    ListTodo,
    Sparkles,
    Users,
    Wrench,
    Zap,
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="OptiWork — Work Management System">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800&display=swap" rel="stylesheet" />
            </Head>
            <div className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground min-h-screen font-sans antialiased">
                {/* Background ambient glow */}
                <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                    <div className="bg-primary/[0.08] absolute -top-[10%] -left-[20%] h-[600px] w-[600px] rounded-full blur-[120px]" />
                    <div className="absolute top-[15%] -right-[10%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.06] blur-[100px]" />
                    <div className="absolute bottom-[5%] left-[10%] h-[400px] w-[400px] rounded-full bg-emerald-500/[0.05] blur-[100px]" />
                </div>

                {/* Navbar */}
                <header className="border-border/60 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="bg-primary text-primary-foreground shadow-primary/25 flex h-9 w-9 items-center justify-center rounded-xl shadow-lg">
                                <Briefcase className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">OptiWork</span>
                        </Link>

                        <nav className="hidden items-center gap-8 md:flex">
                            <a href="#features" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                                Fitur
                            </a>
                            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                                Cara Kerja
                            </a>
                            <a href="#testimonials" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                                Testimoni
                            </a>
                        </nav>

                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/25 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-md transition-all hover:shadow-lg"
                                >
                                    Dashboard <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <a
                                        href={route('sso.login')}
                                        className="text-muted-foreground hover:text-foreground hidden text-sm font-medium transition-colors sm:inline"
                                    >
                                        Masuk
                                    </a>
                                    <Link
                                        href={route('register')}
                                        className="bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/25 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-md transition-all hover:shadow-lg"
                                    >
                                        Mulai Gratis
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main>
                    {/* Hero */}
                    <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                                <div className="max-w-2xl">
                                    <div className="border-primary/20 bg-primary/5 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
                                        <Sparkles className="h-4 w-4" />
                                        <span>Work Management System Terintegrasi</span>
                                    </div>

                                    <h1 className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                                        Kelola Pekerjaan & Aset dengan{' '}
                                        <span className="from-primary bg-gradient-to-r to-violet-500 bg-clip-text text-transparent">
                                            Lebih Efisien
                                        </span>
                                    </h1>

                                    <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                                        OptiWork menyatukan work order, perencanaan, jadwal rutin, dan pelaporan dalam satu platform yang aman,
                                        terukur, dan mudah digunakan oleh seluruh tim Anda.
                                    </p>

                                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                        {auth.user ? (
                                            <Link
                                                href={route('dashboard')}
                                                className="bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold shadow-xl transition-all hover:-translate-y-0.5"
                                            >
                                                Buka Dashboard <ArrowRight className="h-5 w-5" />
                                            </Link>
                                        ) : (
                                            <>
                                                <Link
                                                    href={route('register')}
                                                    className="bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold shadow-xl transition-all hover:-translate-y-0.5"
                                                >
                                                    Coba Gratis 14 Hari <ArrowRight className="h-5 w-5" />
                                                </Link>
                                                <Link
                                                    href={route('login')}
                                                    className="border-border bg-card text-card-foreground hover:bg-accent inline-flex items-center justify-center gap-2 rounded-full border px-8 py-4 text-base font-semibold shadow-sm transition-all hover:-translate-y-0.5"
                                                >
                                                    Masuk ke Akun
                                                </Link>
                                            </>
                                        )}
                                    </div>

                                    <div className="text-muted-foreground mt-8 flex flex-wrap items-center gap-4 text-sm">
                                        <span className="flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Tanpa kartu kredit
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Setup dalam hitungan menit
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Dukungan 24/7
                                        </span>
                                    </div>
                                </div>

                                {/* Dashboard preview illustration */}
                                <div className="relative">
                                    <div className="from-primary/20 absolute -inset-4 rounded-[2rem] bg-gradient-to-tr via-violet-500/10 to-transparent blur-2xl" />
                                    <div className="border-border/60 bg-card/80 relative overflow-hidden rounded-2xl border p-2 shadow-2xl backdrop-blur-sm">
                                        <div className="bg-muted/50 rounded-xl p-4">
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-3 w-3 rounded-full bg-rose-500" />
                                                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                                                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                                </div>
                                                <div className="bg-muted h-2 w-24 rounded-full" />
                                            </div>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="bg-card rounded-lg p-4 shadow-sm">
                                                    <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium">
                                                        <Wrench className="text-primary h-4 w-4" /> Work Orders Aktif
                                                    </div>
                                                    <div className="text-2xl font-bold">134</div>
                                                    <div className="mt-1 text-xs text-emerald-500">+12 minggu ini</div>
                                                </div>
                                                <div className="bg-card rounded-lg p-4 shadow-sm">
                                                    <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium">
                                                        <CalendarClock className="h-4 w-4 text-violet-500" /> Jadwal Hari Ini
                                                    </div>
                                                    <div className="text-2xl font-bold">28</div>
                                                    <div className="text-muted-foreground mt-1 text-xs">5 lokasi</div>
                                                </div>
                                                <div className="bg-card rounded-lg p-4 shadow-sm sm:col-span-2">
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <span className="text-muted-foreground text-xs font-medium">Aktivitas Terkini</span>
                                                        <span className="text-primary text-xs">Lihat semua</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="bg-muted/60 flex items-center gap-3 rounded-md p-2">
                                                            <div className="bg-primary/10 h-8 w-8 rounded-full" />
                                                            <div className="flex-1">
                                                                <div className="bg-muted h-2 w-3/4 rounded-full" />
                                                                <div className="bg-muted/60 mt-1.5 h-1.5 w-1/2 rounded-full" />
                                                            </div>
                                                        </div>
                                                        <div className="bg-muted/60 flex items-center gap-3 rounded-md p-2">
                                                            <div className="h-8 w-8 rounded-full bg-violet-500/10" />
                                                            <div className="flex-1">
                                                                <div className="bg-muted h-2 w-2/3 rounded-full" />
                                                                <div className="bg-muted/60 mt-1.5 h-1.5 w-1/3 rounded-full" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Trust stats */}
                    <section className="border-border/60 bg-muted/30 border-y px-4 py-10 sm:px-6 lg:px-8">
                        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4">
                            <TrustStat value="500+" label="Perusahaan" />
                            <TrustStat value="12K" label="Work Orders/bulan" />
                            <TrustStat value="99.9%" label="Uptime" />
                            <TrustStat value="4.9/5" label="Rating Pengguna" />
                        </div>
                    </section>

                    {/* Features */}
                    <section id="features" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <div className="mb-14 text-center">
                                <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                                    Semua yang Anda butuhkan untuk{' '}
                                    <span className="from-primary bg-gradient-to-r to-violet-500 bg-clip-text text-transparent">manajemen kerja</span>
                                </h2>
                                <p className="text-muted-foreground mx-auto mt-4 max-w-2xl">
                                    Dari perencanaan hingga pelaporan, setiap fitur dirancang untuk mempercepat alur kerja tim lapangan dan kantor.
                                </p>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <FeatureCard
                                    icon={<LayoutDashboard className="text-primary h-6 w-6" />}
                                    title="Dashboard Terpadu"
                                    description="Pantau work order, jadwal, dan aktivitas tim dalam satu tampilan yang jelas dan real-time."
                                />
                                <FeatureCard
                                    icon={<Wrench className="h-6 w-6 text-violet-500" />}
                                    title="Manajemen Work Order"
                                    description="Buat, tugaskan, dan lacak status pekerjaan dari awal hingga selesai dengan mudah."
                                />
                                <FeatureCard
                                    icon={<ListTodo className="h-6 w-6 text-emerald-500" />}
                                    title="Perencanaan & Tasking"
                                    description="Rencanakan pekerjaan harian, mingguan, dan rutin agar tidak ada yang terlewat."
                                />
                                <FeatureCard
                                    icon={<CalendarClock className="h-6 w-6 text-amber-500" />}
                                    title="Jadwal Rutin Otomatis"
                                    description="Atur pemeliharaan berkala dan inspeksi dengan pengingat otomatis untuk setiap tim."
                                />
                                <FeatureCard
                                    icon={<FileCheck className="h-6 w-6 text-rose-500" />}
                                    title="Pelaporan & Approval"
                                    description="Hasil pekerjaan tercatat rapi dan dapat diajukan persetujuan secara digital."
                                />
                                <FeatureCard
                                    icon={<BarChart3 className="h-6 w-6 text-sky-500" />}
                                    title="Analitik & Insight"
                                    description="Dapatkan laporan kinerja, tren pekerjaan, dan metrik penting lainnya secara visual."
                                />
                            </div>
                        </div>
                    </section>

                    {/* How it works */}
                    <section id="how-it-works" className="bg-muted/30 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <div className="mb-14 text-center">
                                <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Cara Kerja OptiWork</h2>
                                <p className="text-muted-foreground mx-auto mt-4 max-w-2xl">
                                    Empat langkah sederhana untuk mengubah cara tim Anda mengelola pekerjaan.
                                </p>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                                <StepCard
                                    step="01"
                                    icon={<Users className="h-5 w-5" />}
                                    title="Atur Tim & Lokasi"
                                    description="Tambahkan departemen, karyawan, dan lokasi kerja sesuai struktur organisasi Anda."
                                />
                                <StepCard
                                    step="02"
                                    icon={<ListTodo className="h-5 w-5" />}
                                    title="Rencanakan Pekerjaan"
                                    description="Buat work order dan jadwal rutin dengan detail tugas, PIC, dan tenggat waktu."
                                />
                                <StepCard
                                    step="03"
                                    icon={<Zap className="h-5 w-5" />}
                                    title="Jalankan & Pantau"
                                    description="Tim lapangan mengerjakan tugas sementara manajer memantau progres secara real-time."
                                />
                                <StepCard
                                    step="04"
                                    icon={<BarChart3 className="h-5 w-5" />}
                                    title="Lapor & Evaluasi"
                                    description="Hasil pekerjaan terekam otomatis dan siap dievaluasi kapan saja."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Testimonials */}
                    <section id="testimonials" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <div className="mb-14 text-center">
                                <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Dipercaya oleh Tim Operasional</h2>
                                <p className="text-muted-foreground mx-auto mt-4 max-w-2xl">
                                    Lihat bagaimana OptiWork membantu berbagai organisasi menjadi lebih produktif.
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                <TestimonialCard
                                    quote="OptiWork mengubah cara kami mengelola maintenance gedung. Semua jadwal rutin dan work order kini terpusat."
                                    author="Ahmad Rizky"
                                    role="Facility Manager"
                                />
                                <TestimonialCard
                                    quote="Dulu kami menggunakan spreadsheet. Sekarang pelacakan pekerjaan jauh lebih cepat dan transparan."
                                    author="Siti Rahayu"
                                    role="Operations Supervisor"
                                />
                                <TestimonialCard
                                    quote="Fitur approval digital sangat membantu. Tidak ada lagi kertas yang beredar antar departemen."
                                    author="Budi Santoso"
                                    role="Head of Engineering"
                                />
                            </div>
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
                        <div className="mx-auto max-w-5xl">
                            <div className="from-primary via-primary text-primary-foreground shadow-primary/25 relative overflow-hidden rounded-3xl bg-gradient-to-br to-violet-600 px-6 py-16 text-center shadow-2xl sm:px-16">
                                <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                                <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                                <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">Siap meningkatkan produktivitas tim Anda?</h2>
                                <p className="text-primary-foreground/90 relative mx-auto mt-4 max-w-xl">
                                    Bergabunglah dengan ratusan organisasi yang telah beralih ke manajemen kerja yang lebih modern.
                                </p>
                                <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="text-primary inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold shadow-lg transition-all hover:-translate-y-0.5"
                                        >
                                            Buka Dashboard <ArrowRight className="h-5 w-5" />
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('register')}
                                                className="text-primary inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold shadow-lg transition-all hover:-translate-y-0.5"
                                            >
                                                Mulai Gratis <ArrowRight className="h-5 w-5" />
                                            </Link>
                                            <a
                                                href={route('sso.login')}
                                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                                            >
                                                Masuk
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-border/60 bg-muted/30 border-t px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl">
                                    <Briefcase className="h-5 w-5" />
                                </div>
                                <span className="text-lg font-bold">OptiWork</span>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                &copy; {new Date().getFullYear()} Optimaverse. Seluruh hak cipta dilindungi.
                            </p>
                            <div className="text-muted-foreground flex gap-6 text-sm">
                                <a href="#" className="hover:text-foreground transition-colors">
                                    Privasi
                                </a>
                                <a href="#" className="hover:text-foreground transition-colors">
                                    Syarat
                                </a>
                                <a href="#" className="hover:text-foreground transition-colors">
                                    Kontak
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="group border-border/60 bg-card hover:border-primary/20 hover:shadow-primary/5 rounded-2xl border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="bg-primary/10 group-hover:bg-primary/15 mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
                {icon}
            </div>
            <h3 className="text-card-foreground mb-2 text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
    );
}

function StepCard({ step, icon, title, description }: { step: string; icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="border-border/60 bg-card relative rounded-2xl border p-6">
            <div className="bg-primary text-primary-foreground shadow-primary/20 mb-4 flex h-10 w-10 items-center justify-center rounded-full shadow-md">
                {icon}
            </div>
            <div className="text-muted/40 absolute top-5 right-5 text-4xl font-extrabold">{step}</div>
            <h3 className="text-card-foreground mb-2 text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
    );
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
    return (
        <div className="border-border/60 bg-card rounded-2xl border p-6 shadow-sm">
            <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
            </div>
            <p className="text-card-foreground mb-6 text-sm leading-relaxed">&ldquo;{quote}&rdquo;</p>
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold">
                    {author.charAt(0)}
                </div>
                <div>
                    <p className="text-card-foreground text-sm font-semibold">{author}</p>
                    <p className="text-muted-foreground text-xs">{role}</p>
                </div>
            </div>
        </div>
    );
}

function TrustStat({ value, label }: { value: string; label: string }) {
    return (
        <div className="text-center">
            <p className="text-foreground text-3xl font-extrabold">{value}</p>
            <p className="text-muted-foreground mt-1 text-sm">{label}</p>
        </div>
    );
}
