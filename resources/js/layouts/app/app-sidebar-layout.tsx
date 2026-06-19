import { AppNavbar } from '@/components/app-navbar';
import { type BreadcrumbItem } from '@/types';

export default function AppNavbarLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    return (
        <div className="bg-background flex min-h-screen w-full flex-col">
            <AppNavbar breadcrumbs={breadcrumbs} />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6">{children}</main>
        </div>
    );
}
