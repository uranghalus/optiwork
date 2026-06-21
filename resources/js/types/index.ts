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
    phone?: string;
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

export interface Department {
    id: number;
    code: string;
    name: string;
    description?: string;
    hod_id?: number | null;
    hod?: Pick<User, 'id' | 'name'> | null;
    phone?: string;
    email?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Employee {
    id: number;
    employee_number: string;
    user_id?: number | null;
    department_id?: number | null;
    name: string;
    position?: string;
    phone?: string;
    email?: string;
    photo_path?: string;
    is_active: boolean;
    department?: Pick<Department, 'id' | 'name'> | null;
    created_at: string;
    updated_at: string;
}

export interface WorkOrder {
    id: number;
    work_order_number: string;
    tenant_id: number | null;
    department_id: number | null;
    reporter_id: number | null;
    hod_id: number | null;
    order_date: string;
    title: string;
    job_description: string;
    priority: 'normal' | 'urgent_request_by_owner' | 'urgent_by_accident';
    priority_label: string;
    execution_type: 'immediate' | 'scheduled' | null;
    scheduled_at: string | null;
    total_personnel: number | null;
    status: WorkOrderStatus;
    status_label: string;
    attachment_path: string | null;
    attachment_url: string | null;
    ai_summary?: string | null;
    ai_estimated_completion?: string | null;
    hod_decision_at: string | null;
    assigned_at: string | null;
    executed_at: string | null;
    verified_at: string | null;
    tenant?: Pick<Tenant, 'id' | 'name' | 'company_name' | 'location'> | null;
    department?: Pick<Department, 'id' | 'name' | 'code'> | null;
    reporter?: Pick<User, 'id' | 'name' | 'email'> | null;
    hod?: Pick<User, 'id' | 'name' | 'email'> | null;
    assignments?: WorkOrderAssignment[];
    execution?: WorkOrderExecution | null;
    verification?: WorkOrderVerification | null;
    created_at: string;
    updated_at: string;
}

export type WorkOrderStatus = 
    | 'pending_review'
    | 'planning'
    | 'assigned'
    | 'in_progress'
    | 'submitted'
    | 'verified'
    | 'rejected'
    | 'revision'
    | 'cancelled';

export interface WorkOrderAssignment {
    id: number;
    work_order_id: number;
    employee_id: number;
    role: 'leader' | 'member';
    notes?: string;
    employee: Pick<Employee, 'id' | 'name' | 'position' | 'photo_path'>;
    created_at: string;
}

export interface WorkOrderExecution {
    id: number;
    work_order_id: number;
    submitted_by: number;
    execution_notes?: string;
    result_description: string;
    attachments?: string[] | null;
    executed_at: string;
    submittedBy?: Pick<User, 'id' | 'name'>;
    created_at: string;
}

export interface WorkOrderVerification {
    id: number;
    work_order_id: number;
    verified_by: number;
    status: 'approved' | 'rejected' | 'revision';
    notes?: string;
    verified_at: string;
    verifiedBy?: Pick<User, 'id' | 'name'>;
    created_at: string;
}

export interface AppNotification {
    id: number;
    work_order_id?: number | null;
    sender_id?: number | null;
    receiver_id?: number | null;
    type: string;
    channel: string;
    title: string;
    message: string;
    data?: Record<string, unknown> | null;
    is_read: boolean;
    sent_at?: string | null;
    read_at?: string | null;
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
