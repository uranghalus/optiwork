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
    flash: { success?: string; error?: string };
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

export interface Tenant {
    id: number;
    name: string;
    company_name: string | null;
    status: 'active' | 'inactive' | 'suspended';
    type: string | null;
    email: string | null;
    phone: string | null;
    area: string | null;
    location: string | null;
    logo_path: string | null;
    logo_url: string | null;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
}
