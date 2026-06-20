import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Briefcase,
    CalendarClock,
    CheckCircle2,
    ChevronRight,
    FileCheck,
    LayoutDashboard,
    ListTodo,
    Shield,
    Sparkles,
    Users,
    Wrench,
    Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// ── Animated counter hook ──────────────────────────────────────────────────────
function useCounter(target: number, duration = 2000, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime: number;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, start]);
    return count;
}

// ── Intersection observer hook ─────────────────────────────────────────────────
function useInView(options?: IntersectionObserverInit) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                obs.unobserve(el);
            }
        }, options);
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return { ref, inView };
}

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    const heroRef = useInView({ threshold: 0.1 });
    const statsRef = useInView({ threshold: 0.3 });
    const featuresRef = useInView({ threshold: 0.1 });
    const stepsRef = useInView({ threshold: 0.1 });
    const testimonialsRef = useInView({ threshold: 0.1 });
    const ctaRef = useInView({ threshold: 0.2 });

    const companies = useCounter(500, 1800, statsRef.inView);
    const workOrders = useCounter(12, 1400, statsRef.inView);
    const uptime = useCounter(99, 1600, statsRef.inView);
    const rating = useCounter(49, 1500, statsRef.inView);

    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        });
    };

    return (
        <>
            <Head title="OptiWork — Work Management System">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800&display=swap" rel="stylesheet" />
            </Head>
            <div className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground min-h-screen font-sans antialiased">
                <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                    <div className="bg-primary/[0.08] absolute -top-[10%] -left-[20%] h-[600px] w-[600px] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                    <div className="absolute top-[15%] -right-[10%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.06] blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
                    <div className="absolute bottom-[5%] left-[10%] h-[400px] w-[400px] rounded-full bg-emerald-500/[0.05] blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
                </div>

                <header className="border-border/60 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="bg-primary text-primary-foreground shadow-primary/25 flex h-9 w-9 items-center justify-center rounded-xl shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3">
                                <Briefcase className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">OptiWork</span>
                        </Link>
                        <nav className="hidden items-center gap-8 md:flex">
                            <a href="#features" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors relative group">
                                Fitur<span className="bg-primary absolute -bottom-1 left-0 h-0.5 w-0 transition-all group-hover:w-full" />
                            </a>
                            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors relative group">
                                Cara Kerja<span className="bg-primary absolute -bottom-1 left-0 h-0.5 w-0 transition-all group-hover:w-full" />
                            </a>
                            <a href="#testimonials" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors relative group">
                                Testimoni<span className="bg-primary absolute -bottom-1 left-0 h-0.5 w-0 transition-all group-hover:w-full" />
                            </a>
                        </nav>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-md transition-all hover:shadow-lg hover:scale-105">
                                    Dashboard <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <a href={route('sso.login')} className="text-muted-foreground hover:text-foreground hidden text-sm font-medium transition-colors sm:inline">Masuk</a>
                                    <Link href={route('register')} className="bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-md transition-all hover:shadow-lg hover:scale-105">
                                        Mulai Gratis
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main>
                    <section ref={heroRef.ref} className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8" onMouseMove={handleMouseMove}>
                        <div className="pointer-events-none absolute inset-0 -z-5 transition-opacity duration-700" style={{ background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, hsl(var(--primary) / 0.06), transparent 40%)` }} />
                        <div className="mx-auto max-w-7xl">
                            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                                <div className={`max-w-2xl transition-all duration-1000 ${heroRef.inView ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                                    <div className="border-primary/20 bg-primary/5 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium animate-bounce" style={{ animationDuration: '3s', animationIterationCount: '3' }}>
                                        <Sparkles className="h-4 w-4" />
                                        <span>Work Management System Terintegrasi</span>
                                    </div>
                                    <h1 className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                                        Kelola Pekerjaan & Aset dengan{' '}
                                        <span className="from-primary bg-gradient-to-r to-violet-500 bg-clip-text text-transparent">Lebih Efisien</span>
                                    </h1>
                                    <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                                        OptiWork menyatukan work order, perencanaan, jadwal rutin, dan pelaporan dalam satu platform yang aman, terukur, dan mudah digunakan oleh seluruh tim Anda.
                                    </p>
                                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                        {auth.user ? (
                                            <Link href={route('dashboard')} className="bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary/90 group inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold shadow-xl transition-all hover:-translate-y-0.5 hover:scale-105">
                                                Buka Dashboard <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        ) : (
                                            <>
                                                <Link href={route('register')} className="bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary/90 group inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold shadow-xl transition-all hover:-translate-y-0.5 hover:scale-105">
                                                    Coba Gratis 14 Hari <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                                </Link>
                                                <Link href={route('login')} className="border-border bg-card text-card-foreground hover:bg-accent group inline-flex items-center justify-center gap-2 rounded-full border px-8 py-4 text-base font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:scale-105">
                                                    Masuk ke Akun <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                    <div className="text-muted-foreground mt-8 flex flex-wrap items-center gap-4 text-sm">
                                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Tanpa kartu kredit</span>
                                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Setup dalam hitungan menit</span>
                                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Dukungan 24/7</span>
                                    </div>
                                </div>
                                <div className={`relative transition-all duration-1000 delay-300 ${heroRef.inView ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                                    <div className="from-primary/20 absolute -inset-4 rounded-[2rem] bg-gradient-to-tr via-violet-500/10 to-transparent blur-2xl" />
                                    <div className="border-border/60 bg-card/80 relative overflow-hidden rounded-2xl border p-2 shadow-2xl backdrop-blur-sm hover:shadow-primary/10 transition-shadow duration-500">
                                        <div className="bg-muted/50 rounded-xl p-4">
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-3 w-3 rounded-full bg-rose-500 animate-pulse" style={{ animationDelay: '0s' }} />
                                                    <div className="h-3 w-3 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
                                                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '0.6s' }} />
                                                </div>
                                                <div className="bg-muted h-2 w-24 rounded-full" />
                                            </div>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="bg-card rounded-lg p-4 shadow-sm group hover:shadow-md transition-all hover:-translate-y-0.5">
                                                    <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium"><Wrench className="text-primary h-4 w-4" /> Work Orders Aktif</div>
                                                    <div className="text-2xl font-bold">134</div>
                                                    <div className="mt-1 text-xs text-emerald-500 font-medium">+12 minggu ini</div>
                                                </div>
                                                <div className="bg-card rounded-lg p-4 shadow-sm group hover:shadow-md transition-all hover:-translate-y-0.5">
                                                    <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium"><CalendarClock className="h-4 w-4 text-violet-500" /> Jadwal Hari Ini</div>
                                                    <div className="text-2xl font-bold">28</div>
                                                    <div className="text-muted-foreground mt-1 text-xs">5 lokasi</div>
                                                </div>
                                                <div className="bg-card rounded-lg p-4 shadow-sm sm:col-span-2 group hover:shadow-md transition-all">
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <span className="text-muted-foreground text-xs font-medium">Aktivitas Terkini</span>
                                                        <span className="text-primary text-xs font-medium">Lihat semua</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="bg-muted/60 flex items-center gap-3 rounded-md p-2.5 hover:bg-muted/80 transition-colors">
                                                            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full"><Wrench className="text-primary h-3.5 w-3.5" /></div>
                                                            <div className="flex-1"><div className="bg-muted h-2 w-3/4 rounded-full" /><div className="bg-muted/60 mt-1.5 h-1.5 w-1/2 rounded-full" /></div>
                                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                        </div>
                                                        <div className="bg-muted/60 flex items-center gap-3 rounded-md p-2.5 hover:bg-muted/80 transition-colors">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10"><CalendarClock className="h-3.5 w-3.5 text-violet-500" /></div>
                                                            <div className="flex-1"><div className="bg-muted h-2 w-2/3 rounded-full" /><div className="bg-muted/60 mt-1.5 h-1.5 w-1/3 rounded-full" /></div>
                                                            <div className="h-2 w-2 rounded-full bg-amber-400" />
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

                    <section ref={statsRef.ref} className="border-border/60 bg-muted/30 border-y px-4 py-12 sm:px-6 lg:px-8">
                        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4">
                            <TrustStat value={companies} suffix="+" label="Perusahaan" started={statsRef.inView} />
                            <TrustStat value={workOrders} suffix="K" label="Work Orders/bulan" started={statsRef.inView} />
                            <TrustStat value={uptime} suffix=".9%" label="Uptime" started={statsRef.inView} />
                            <TrustStat value={rating / 10} suffix="/5" label="Rating Pengguna" started={statsRef.inView} />
                        </div>
                    </section>

                    <section ref={featuresRef.ref} id="features" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <div className={`mb-14 text-center transition-all duration-700 ${featuresRef.inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                                <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Semua yang Anda butuhkan untuk <span className="from-primary bg-gradient-to-r to-violet-500 bg-clip-text text-transparent">manajemen kerja</span></h2>
                                <p className="text-muted-foreground mx-auto mt-4 max-w-2xl">Dari perencanaan hingga pelaporan, setiap fitur dirancang untuk mempercepat alur kerja tim lapangan dan kantor.</p>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {features.map((f, i) => (<FeatureCard key={f.title} {...f} index={i} inView={featuresRef.inView} />))}
                            </div>
                        </div>
                    </section>

                    <section ref={stepsRef.ref} id="how-it-works" className="bg-muted/30 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <div className={`mb-14 text-center transition-all duration-700 ${stepsRef.inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                                <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Cara Kerja OptiWork</h2>
                                <p className="text-muted-foreground mx-auto mt-4 max-w-2xl">Empat langkah sederhana untuk mengubah cara tim Anda mengelola pekerjaan.</p>
                            </div>
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                                {steps.map((s, i) => (<StepCard key={s.title} {...s} index={i} inView={stepsRef.inView} />))}
                            </div>
                        </div>
                    </section>

                    <section ref={testimonialsRef.ref} id="testimonials" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <div className={`mb-14 text-center transition-all duration-700 ${testimonialsRef.inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                                <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Dipercaya oleh Tim Operasional</h2>
                                <p className="text-muted-foreground mx-auto mt-4 max-w-2xl">Lihat bagaimana OptiWork membantu berbagai organisasi menjadi lebih produktif.</p>
                            </div>
                            <div className="grid gap-6 md:grid-cols-3">
                                {testimonials.map((t, i) => (<TestimonialCard key={t.author} {...t} index={i} inView={testimonialsRef.inView} />))}
                            </div>
                        </div>
                    </section>

                    <section ref={ctaRef.ref} className="px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
                        <div className="mx-auto max-w-5xl">
                            <div className={`transition-all duration-700 ${ctaRef.inView ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
                                <div className="from-primary via-primary text-primary-foreground shadow-primary/25 relative overflow-hidden rounded-3xl bg-gradient-to-br to-violet-600 px-6 py-16 text-center shadow-2xl sm:px-16">
                                    <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
                                    <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '3s' }} />
                                    <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                                    <div className="relative">
                                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"><Zap className="h-7 w-7" /></div>
                                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Siap meningkatkan produktivitas tim Anda?</h2>
                                        <p className="text-primary-foreground/90 mx-auto mt-4 max-w-xl">Bergabunglah dengan ratusan organisasi yang telah beralih ke manajemen kerja yang lebih modern.</p>
                                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                            {auth.user ? (
                                                <Link href={route('dashboard')} className="text-primary group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:scale-105">
                                                    Buka Dashboard <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                                </Link>
                                            ) : (
                                                <>
                                                    <Link href={route('register')} className="text-primary group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:scale-105">
                                                        Mulai Gratis <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                                    </Link>
                                                    <a href={route('sso.login')} className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105">Masuk</a>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-border/60 bg-muted/30 border-t px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl"><Briefcase className="h-5 w-5" /></div>
                                <span className="text-lg font-bold">OptiWork</span>
                            </div>
                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                <Shield className="h-3.5 w-3.5" />
                                <p>&copy; {new Date().getFullYear()} Optimaverse. Seluruh hak cipta dilindungi.</p>
                            </div>
                            <div className="text-muted-foreground flex gap-6 text-sm">
                                <a href="#" className="hover:text-foreground transition-colors">Privasi</a>
                                <a href="#" className="hover:text-foreground transition-colors">Syarat</a>
                                <a href="#" className="hover:text-foreground transition-colors">Kontak</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

const features = [
    { icon: <LayoutDashboard className="text-primary h-6 w-6" />, title: 'Dashboard Terpadu', description: 'Pantau work order, jadwal, dan aktivitas tim dalam satu tampilan yang jelas dan real-time.', accent: 'from-primary/10 to-primary/5' },
    { icon: <Wrench className="h-6 w-6 text-violet-500" />, title: 'Manajemen Work Order', description: 'Buat, tugaskan, dan lacak status pekerjaan dari awal hingga selesai dengan mudah.', accent: 'from-violet-500/10 to-violet-500/5' },
    { icon: <ListTodo className="h-6 w-6 text-emerald-500" />, title: 'Perencanaan & Tasking', description: 'Rencanakan pekerjaan harian, mingguan, dan rutin agar tidak ada yang terlewat.', accent: 'from-emerald-500/10 to-emerald-500/5' },
    { icon: <CalendarClock className="h-6 w-6 text-amber-500" />, title: 'Jadwal Rutin Otomatis', description: 'Atur pemeliharaan berkala dan inspeksi dengan pengingat otomatis untuk setiap tim.', accent: 'from-amber-500/10 to-amber-500/5' },
    { icon: <FileCheck className="h-6 w-6 text-rose-500" />, title: 'Pelaporan & Approval', description: 'Hasil pekerjaan tercatat rapi dan dapat diajukan persetujuan secara digital.', accent: 'from-rose-500/10 to-rose-500/5' },
    { icon: <BarChart3 className="h-6 w-6 text-sky-500" />, title: 'Analitik & Insight', description: 'Dapatkan laporan kinerja, tren pekerjaan, dan metrik penting lainnya secara visual.', accent: 'from-sky-500/10 to-sky-500/5' },
];

const steps = [
    { step: '01', icon: <Users className="h-5 w-5" />, title: 'Atur Tim & Lokasi', description: 'Tambahkan departemen, karyawan, dan lokasi kerja sesuai struktur organisasi Anda.' },
    { step: '02', icon: <ListTodo className="h-5 w-5" />, title: 'Rencanakan Pekerjaan', description: 'Buat work order dan jadwal rutin dengan detail tugas, PIC, dan tenggat waktu.' },
    { step: '03', icon: <Zap className="h-5 w-5" />, title: 'Jalankan & Pantau', description: 'Tim lapangan mengerjakan tugas sementara manajer memantau progres secara real-time.' },
    { step: '04', icon: <BarChart3 className="h-5 w-5" />, title: 'Lapor & Evaluasi', description: 'Hasil pekerjaan terekam otomatis dan siap dievaluasi kapan saja.' },
];

const testimonials = [
    { quote: 'OptiWork mengubah cara kami mengelola maintenance gedung. Semua jadwal rutin dan work order kini terpusat.', author: 'Ahmad Rizky', role: 'Facility Manager' },
    { quote: 'Dulu kami menggunakan spreadsheet. Sekarang pelacakan pekerjaan jauh lebih cepat dan transparan.', author: 'Siti Rahayu', role: 'Operations Supervisor' },
    { quote: 'Fitur approval digital sangat membantu. Tidak ada lagi kertas yang beredar antar departemen.', author: 'Budi Santoso', role: 'Head of Engineering' },
];

function FeatureCard({ icon, title, description, accent, index, inView }: { icon: React.ReactNode; title: string; description: string; accent: string; index: number; inView: boolean }) {
    return (
        <div className={`group border-border/60 bg-card hover:border-primary/30 hover:shadow-primary/10 relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl ${inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: `${index * 100}ms` }}>
            <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition-opacity group-hover:opacity-100`} />
            <div className="relative">
                <div className="bg-primary/10 group-hover:bg-primary/15 mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-all group-hover:scale-110 group-hover:rotate-3">{icon}</div>
                <h3 className="text-card-foreground mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

function StepCard({ step, icon, title, description, index, inView }: { step: string; icon: React.ReactNode; title: string; description: string; index: number; inView: boolean }) {
    return (
        <div className={`group border-border/60 bg-card hover:border-primary/20 relative overflow-hidden rounded-2xl border p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: `${index * 150}ms` }}>
            {index < 3 && <div className="bg-primary/10 absolute top-1/2 -right-4 hidden h-px w-8 lg:block" />}
            <div className="bg-primary text-primary-foreground shadow-primary/20 group-hover:shadow-primary/30 mb-4 flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all group-hover:scale-110">{icon}</div>
            <div className="text-muted/30 absolute top-5 right-5 text-4xl font-extrabold transition-colors group-hover:text-primary/10">{step}</div>
            <h3 className="text-card-foreground mb-2 text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
    );
}

function TestimonialCard({ quote, author, role, index, inView }: { quote: string; author: string; role: string; index: number; inView: boolean }) {
    return (
        <div className={`group border-border/60 bg-card hover:border-primary/20 hover:shadow-primary/5 rounded-2xl border p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: `${index * 150}ms` }}>
            <div className="mb-4 flex gap-1">{[...Array(5)].map((_, i) => (<Sparkles key={i} className="h-4 w-4 fill-amber-400 text-amber-400 transition-transform hover:scale-125" />))}</div>
            <p className="text-card-foreground mb-6 text-sm leading-relaxed">&ldquo;{quote}&rdquo;</p>
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary group-hover:bg-primary/15 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors">{author.charAt(0)}</div>
                <div><p className="text-card-foreground text-sm font-semibold">{author}</p><p className="text-muted-foreground text-xs">{role}</p></div>
            </div>
        </div>
    );
}

function TrustStat({ value, suffix, label, started }: { value: number; suffix: string; label: string; started: boolean }) {
    return (
        <div className={`text-center transition-all duration-700 ${started ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <p className="text-foreground text-3xl font-extrabold tabular-nums">{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</p>
            <p className="text-muted-foreground mt-1 text-sm">{label}</p>
        </div>
    );
}
