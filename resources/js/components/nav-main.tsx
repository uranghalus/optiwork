import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ groups = [] }: { groups: NavGroup[] }) {
    const page = usePage();

    return (
        <>
            {groups.map((group) => (
                <SidebarGroup key={group.title} className="py-1.5">
                    <SidebarGroupLabel className="text-sidebar-foreground/40 mb-1 px-3 text-[11px] font-bold tracking-widest uppercase">
                        {group.title}
                    </SidebarGroupLabel>
                    <SidebarMenu className="gap-0.5">
                        {group.items.map((item) => {
                            const isActive = page.url === item.url || page.url.startsWith(item.url + '/');
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive}
                                        tooltip={item.title}
                                        className={`group relative rounded-lg px-3 py-2 text-sm transition-all duration-150 ${isActive
                                                ? 'bg-primary/10 text-primary hover:bg-primary/15 font-semibold'
                                                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                                            }`}
                                    >
                                        <Link href={item.url} prefetch className="flex items-center gap-3">
                                            {/* Active indicator bar */}
                                            {isActive && (
                                                <span className="bg-primary absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full" />
                                            )}
                                            {item.icon && (
                                                <span
                                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${isActive
                                                            ? 'bg-primary/15 text-primary'
                                                            : 'bg-sidebar-accent text-sidebar-foreground/60 group-hover:bg-sidebar-accent group-hover:text-sidebar-foreground'
                                                        }`}
                                                >
                                                    <item.icon className="h-4 w-4" />
                                                </span>
                                            )}
                                            <span className="truncate">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
