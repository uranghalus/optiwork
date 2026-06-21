import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { type AppNotification, type BreadcrumbItem, type PaginatedData } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Bell, CheckCheck, ChevronRight, Clock, Mail, MessageCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Notifikasi', href: '/notifications' },
];

function timeAgo(dateString: string): string {
    const now = Date.now();
    const date = new Date(dateString).getTime();
    const diffMs = now - date;
    const seconds = Math.floor(diffMs / 1000);

    if (seconds < 60) return 'Baru saja';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} mnt lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} hari lalu`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} bln lalu`;
    return `${Math.floor(months / 12)} thn lalu`;
}

const channelIcons: Record<string, typeof Bell> = {
    in_app: Bell,
    whatsapp: MessageCircle,
    email: Mail,
};

function getChannelIcon(channel: string) {
    return channelIcons[channel] ?? Bell;
}

function NotificationCard({
    notification,
    onMarkAsRead,
}: {
    notification: AppNotification;
    onMarkAsRead: (id: number) => void;
}) {
    const Icon = getChannelIcon(notification.channel);

    const handleClick = () => {
        if (!notification.is_read) {
            onMarkAsRead(notification.id);
        }
        if (notification.work_order_id) {
            router.visit(`/work-orders/${notification.work_order_id}`);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="group flex w-full items-start gap-4 rounded-lg border border-border bg-card p-4 text-left shadow-xs transition-all hover:border-muted-foreground/25 hover:shadow-sm"
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                        {notification.title}
                    </p>
                    {!notification.is_read && (
                        <span className="mt-1.5 block h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {notification.message}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{timeAgo(notification.created_at)}</span>
                </div>
            </div>

            <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
        </button>
    );
}

function Pagination({
    links,
    onPageChange,
}: {
    links: { url: string | null; label: string; active: boolean }[];
    onPageChange: (url: string) => void;
}) {
    return (
        <div className="flex items-center justify-center gap-1">
            {links.map((link, i) => {
                if (link.label.includes('Previous') || link.label.includes('Next')) {
                    return (
                        <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            disabled={!link.url}
                            onClick={() => link.url && onPageChange(link.url)}
                            className="px-3"
                        >
                            {link.label}
                        </Button>
                    );
                }
                return (
                    <Button
                        key={i}
                        variant={link.active ? 'default' : 'ghost'}
                        size="sm"
                        disabled={!link.url}
                        onClick={() => link.url && onPageChange(link.url)}
                        className="min-w-[36px]"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
}

export default function NotificationsIndex({
    notifications,
    unreadCount,
}: {
    notifications: PaginatedData<AppNotification>;
    unreadCount: number;
}) {
    const handleMarkAllRead = () => {
        router.post(route('notifications.mark-all-read'), {}, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['notifications', 'unreadCount'] }),
        });
    };

    const handleMarkAsRead = (id: number) => {
        router.post(route('notifications.mark-read', { id }), {}, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['notifications', 'unreadCount'] }),
        });
    };

    const handlePageChange = (url: string) => {
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifikasi" />

            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifikasi</h1>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
                                {unreadCount} belum dibaca
                            </Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-2">
                            <CheckCheck className="h-4 w-4" />
                            Tandai Semua Dibaca
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                {notifications.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Bell className="mb-4 h-16 w-16 text-muted-foreground/30" />
                        <p className="text-lg font-medium text-muted-foreground">Belum ada notifikasi</p>
                        <p className="mt-1 text-sm text-muted-foreground/60">
                            Notifikasi akan muncul di sini saat ada aktivitas baru.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {notifications.data.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={handleMarkAsRead}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <Pagination links={notifications.links} onPageChange={handlePageChange} />
                )}
            </div>
        </AppLayout>
    );
}
