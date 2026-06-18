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
        <Sidebar collapsible="icon" variant="sidebar" className="bg-sidebar">
            <SidebarHeader className="px-3 pt-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="rounded-2xl bg-sidebar-accent/5 p-3 transition duration-150 ease-out hover:bg-sidebar-accent/10"
                        >
                            <Link href="/dashboard" prefetch className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
                                    <TeamLogo className="size-5" />
                                </div>
                                <div className="min-w-0 transition-all duration-150">
                                    <p className="truncate text-sm font-semibold text-sidebar-foreground group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
                                        {sidebarData.teams[0].name}
                                    </p>
                                    <p className="mt-1 text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
                                        {sidebarData.teams[0].plan}
                                    </p>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarSeparator className="mx-3" />

            <SidebarContent className="gap-0 px-2 py-3">
                <NavMain groups={sidebarData.navGroups} />
            </SidebarContent>

            <SidebarFooter className="mt-auto px-3 pb-4 pt-4">
                <div className="transition-all duration-150 group-data-[collapsible=icon]:justify-center">
                    <NavUser />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
