import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Box, PieChart, ShieldCheck } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0 bg-slate-50 dark:bg-slate-950">
            <div className="relative hidden h-full flex-col p-10 text-white lg:flex overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900" />
                
                {/* Abstract Background Shapes */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/30 rounded-full blur-[100px]" />
                
                {/* Floating Elements */}
                <div className="absolute top-1/4 right-1/4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 animate-fade-in-up delay-[200ms]">
                    <PieChart className="w-8 h-8 text-indigo-300" />
                </div>
                <div className="absolute bottom-1/3 left-1/4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 animate-fade-in-up delay-[400ms]">
                    <ShieldCheck className="w-8 h-8 text-purple-300" />
                </div>

                <Link href={route('home')} className="relative z-20 flex items-center text-xl font-bold tracking-tight">
                    <div className="mr-3 w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                        <Box className="w-5 h-5 text-white" />
                    </div>
                    Optiasset
                </Link>
                
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-4">
                        <p className="text-2xl font-medium leading-relaxed text-indigo-50">
                            "Managing our enterprise assets has never been more intuitive. Optiasset gives us the real-time visibility we need."
                        </p>
                        <footer className="text-sm font-medium text-indigo-300 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-950/50 flex items-center justify-center border border-indigo-500/30">
                                <span className="text-indigo-200">JD</span>
                            </div>
                            <div>
                                <div className="text-white">Jane Doe</div>
                                <div>Operations Director, TechCorp</div>
                            </div>
                        </footer>
                    </blockquote>
                </div>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px]">
                    <Link href={route('home')} className="relative z-20 flex items-center justify-center lg:hidden gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                            <Box className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Optiasset</span>
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-balance">{description}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
