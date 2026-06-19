import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { sidebarData } from '@/lib/sidebar-data';
import { Link } from '@inertiajs/react';

export function AppSidebar() {
    const TeamLogo = sidebarData.teams[0].logo;

    return (
        <Sidebar collapsible="icon" variant="sidebar" className="border-sidebar-border bg-sidebar border-r shadow-sm">
            {/* ── Brand Header ───────────────────────────────────── */}
            <SidebarHeader className="px-3 pt-4 pb-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="bg-sidebar-accent/50 hover:bg-sidebar-accent rounded-xl px-3 py-2.5 transition-all duration-200"
                        >
                            <Link href="/dashboard" prefetch className="flex items-center gap-3">
                                <div className="from-primary shadow-primary/25 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br to-violet-600 text-white shadow-md">
                                    <TeamLogo className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 transition-all duration-200">
                                    <p className="text-sidebar-foreground truncate text-sm font-bold group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
                                        {sidebarData.teams[0].name}
                                    </p>
                                    <p className="text-sidebar-foreground/50 mt-0.5 text-[11px] font-medium group-data-[collapsible=icon]:hidden">
                                        {sidebarData.teams[0].plan}
                                    </p>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarSeparator className="mx-4" />

            {/* ── Navigation ─────────────────────────────────────── */}
            <SidebarContent className="gap-0 px-2 py-2">
                <NavMain groups={sidebarData.navGroups} />
            </SidebarContent>

            {/* ── User Footer ────────────────────────────────────── */}
            <SidebarFooter className="border-sidebar-border/50 mt-auto border-t px-3 pt-3 pb-4">
                <div className="transition-all duration-200 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                    <NavUser />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
