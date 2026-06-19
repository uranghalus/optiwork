import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="border-border/60 bg-background/80 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            <SidebarTrigger className="text-muted-foreground hover:bg-muted hover:text-foreground -ml-1 h-8 w-8 rounded-lg transition-colors" />
            <div className="bg-border/60 h-5 w-px" />
            <Breadcrumbs breadcrumbs={breadcrumbs} />
        </header>
    );
}
