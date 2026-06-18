import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BarChart3, Box, Shield, Zap } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome to Optiasset">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800&display=swap" rel="stylesheet" />
            </Head>
            <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white dark:bg-slate-950 dark:text-slate-50">
                {/* Navbar */}
                <header className="fixed top-0 w-full bg-white/70 backdrop-blur-md border-b border-slate-200 z-50 dark:bg-slate-950/70 dark:border-slate-800 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                                <Box className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Optiasset</span>
                        </div>
                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <a
                                        href={route('sso.login')}
                                        className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                                    >
                                        Log in
                                    </a>
                                    <Link
                                        href={route('register')}
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 overflow-hidden relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none dark:opacity-20 blur-[100px] bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full z-0"></div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-8 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <SparklesIcon className="w-4 h-4" />
                            <span>The Next Generation Asset Management</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                            Manage Your Assets <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                With Precision
                            </span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 leading-relaxed">
                            Optiasset provides a secure, reliable, and intelligent platform to track, manage, and optimize your company's physical and digital assets in real-time.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="w-full sm:w-auto px-8 py-4 text-base font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                                >
                                    Go to Dashboard <ArrowRight className="w-5 h-5" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('register')}
                                        className="w-full sm:w-auto px-8 py-4 text-base font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                                    >
                                        Start for Free <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="w-full sm:w-auto px-8 py-4 text-base font-medium text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-all dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                                    >
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32">
                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                                title="Real-time Tracking"
                                description="Monitor your assets location and status in real-time across multiple facilities."
                                delay="delay-300"
                            />
                            <FeatureCard
                                icon={<Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                                title="Secure Data Storage"
                                description="Enterprise-grade security ensures your sensitive asset data is always protected."
                                delay="delay-500"
                            />
                            <FeatureCard
                                icon={<BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                                title="Smart Analytics"
                                description="Generate comprehensive reports and depreciation schedules with one click."
                                delay="delay-700"
                            />
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Box className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-lg font-semibold text-slate-900 dark:text-white">Optiasset</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            &copy; {new Date().getFullYear()} Optimaverse. All rights reserved.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy</a>
                            <a href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: string }) {
    return (
        <div className={`p-6 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/20 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none hover:shadow-2xl hover:-translate-y-1 transition-all animate-in fade-in slide-in-from-bottom-4 duration-700 ${delay}`}>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {description}
            </p>
        </div>
    );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        </svg>
    );
}
