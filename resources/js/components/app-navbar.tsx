import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { sidebarData } from '@/lib/sidebar-data';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type NavGroup, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Menu } from 'lucide-react';
import { useRef, useState } from 'react';
import AppLogoIcon from './app-logo-icon';

interface AppNavbarProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppNavbar({ breadcrumbs = [] }: AppNavbarProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const TeamLogo = sidebarData.teams[0].logo;

    // Separate groups: single-item groups become direct links, multi-item groups become dropdowns
    const directLinks = sidebarData.navGroups.filter((g) => g.items.length === 1);
    const dropdownGroups = sidebarData.navGroups.filter((g) => g.items.length > 1);

    const isNavActive = (url: string) => page.url === url || page.url.startsWith(url + '/');

    return (
        <>
            <nav className="border-border/60 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center px-4 md:px-6">
                    {/* ── Mobile Menu ─────────────────────────────── */}
                    <div className="mr-3 lg:hidden">
                        <MobileNav />
                    </div>

                    {/* ── Brand ───────────────────────────────────── */}
                    <Link href="/dashboard" prefetch className="flex shrink-0 items-center gap-2.5">
                        <div className="from-primary shadow-primary/20 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br to-violet-600 text-white shadow-md">
                            <TeamLogo className="h-5 w-5" />
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-foreground text-lg font-bold tracking-tight">OptiWork</span>
                        </div>
                    </Link>

                    {/* ── Desktop Navigation ──────────────────────── */}
                    <div className="ml-6 hidden h-full items-center gap-1 lg:flex">
                        {/* Direct links (single-item groups) */}
                        {directLinks.map((group) =>
                            group.items.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.url}
                                    prefetch
                                    className={cn(
                                        'relative inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors',
                                        isNavActive(item.url)
                                            ? 'bg-primary/10 text-primary hover:bg-primary/15 font-semibold'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                    )}
                                >
                                    {item.icon && <item.icon className="mr-1.5 h-4 w-4" />}
                                    {item.title}
                                    {isNavActive(item.url) && (
                                        <div className="bg-primary absolute right-2 bottom-0 left-2 h-0.5 translate-y-px rounded-full" />
                                    )}
                                </Link>
                            )),
                        )}

                        {/* Dropdown groups (multi-item groups) */}
                        {dropdownGroups.map((group) => (
                            <NavItemDropdown key={group.title} group={group} isNavActive={isNavActive} />
                        ))}
                    </div>

                    {/* ── Right Side ──────────────────────────────── */}
                    <div className="ml-auto flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="size-10 rounded-full p-1">
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="border-border/60 w-56 rounded-xl border shadow-xl" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* ── Breadcrumbs bar ─────────────────────────────── */}
                {breadcrumbs.length > 1 && (
                    <div className="border-border/40 bg-background/50 border-t">
                        <div className="mx-auto flex h-11 max-w-7xl items-center px-4 md:px-6">
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}

// ── Nav Item Dropdown (hover + click) ─────────────────────────────────────────
function NavItemDropdown({ group, isNavActive }: { group: NavGroup; isNavActive: (url: string) => boolean }) {
    const [open, setOpen] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const handleMouseEnter = () => {
        clearTimeout(closeTimer.current);
        setOpen(true);
    };

    const handleMouseLeave = () => {
        closeTimer.current = setTimeout(() => setOpen(false), 150);
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className={cn(
                        'inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg px-3 text-sm font-medium transition-colors',
                        group.items.some((i) => isNavActive(i.url))
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                >
                    {group.title}
                    <ChevronDown className={cn('h-3.5 w-3.5 opacity-60 transition-transform duration-200', open && 'rotate-180')} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="border-border/60 min-w-72 border p-2 shadow-xl"
                align="start"
                sideOffset={8}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {group.items.map((item) => {
                    const active = isNavActive(item.url);
                    return (
                        <Link
                            key={item.title}
                            href={item.url}
                            prefetch
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                                active ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            {item.icon && (
                                <span
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-lg',
                                        active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                </span>
                            )}
                            <span className="whitespace-nowrap">{item.title}</span>
                        </Link>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ── Mobile Navigation Sheet ────────────────────────────────────────────────────
function MobileNav() {
    const page = usePage<SharedData>();

    const isNavActive = (url: string) => page.url === url || page.url.startsWith(url + '/');

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background flex h-full w-72 flex-col gap-0 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                {/* Brand */}
                <div className="border-border/60 flex items-center gap-2.5 border-b px-5 py-4">
                    <div className="from-primary shadow-primary/20 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br to-violet-600 text-white shadow-md">
                        <AppLogoIcon className="h-5 w-5 fill-current text-white" />
                    </div>
                    <div>
                        <p className="text-foreground text-base font-bold">OptiWork</p>
                        <p className="text-muted-foreground text-[11px]">v1.0.0</p>
                    </div>
                </div>

                {/* Nav groups */}
                <div className="flex-1 overflow-y-auto px-3 py-3">
                    {sidebarData.navGroups.map((group) => (
                        <div key={group.title} className="mb-4">
                            <p className="text-muted-foreground/50 mb-1.5 px-3 text-[11px] font-bold tracking-widest uppercase">{group.title}</p>
                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const active = isNavActive(item.url);
                                    return (
                                        <Link
                                            key={item.title}
                                            href={item.url}
                                            prefetch
                                            className={cn(
                                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                                                active
                                                    ? 'bg-primary/10 text-primary font-semibold'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                            )}
                                        >
                                            {item.icon && (
                                                <span
                                                    className={cn(
                                                        'flex h-8 w-8 items-center justify-center rounded-lg',
                                                        active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                                                    )}
                                                >
                                                    <item.icon className="h-4 w-4" />
                                                </span>
                                            )}
                                            <span>{item.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}
