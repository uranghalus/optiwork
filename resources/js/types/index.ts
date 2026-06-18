import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavPermission {
    resource: string;
    actions: string[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    permission?: NavPermission;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface Team {
    name: string;
    logo: LucideIcon;
    plan: string;
}

export interface SidebarData {
    teams: Team[];
    navGroups: NavGroup[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    department?: string;
    position?: string;
    last_login_at?: string | null;
    last_login_ip?: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}
