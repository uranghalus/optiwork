import {
    LayoutDashboard,
    Briefcase,
    Wrench,
    ListTodo,
    CalendarClock,
    CalendarRange,
    FileCheck,
    Inbox,
    Send,
    Building,
    Users,
    Network,
    UserCircle,
    Shield,
    Settings,
} from 'lucide-react';

import { SidebarData } from '@/types';

export const sidebarData: SidebarData = {
    teams: [
        {
            name: 'OptiWork',
            logo: Briefcase,
            plan: 'v1.0.0',
        },
    ],

    navGroups: [
        // ---------- UMUM ----------
        {
            title: 'Umum',
            items: [
                {
                    title: 'Dashboard',
                    url: '/dashboard',
                    icon: LayoutDashboard,
                },
            ],
        },

        // ---------- MANAJEMEN KERJA (WORKFLOW) ----------
        {
            title: 'Manajemen Kerja',
            items: [
                {
                    title: 'Work Orders',
                    url: '/work-orders',
                    icon: Wrench,
                    permission: { resource: 'work_order', actions: ['view'] },
                },
                {
                    title: 'Work Planning',
                    url: '/work-plannings',
                    icon: ListTodo,
                    permission: { resource: 'work_planning', actions: ['view'] },
                },
                {
                    title: 'Work Daily',
                    url: '/work-dailies',
                    icon: CalendarClock,
                    permission: { resource: 'work_daily', actions: ['view'] },
                },
                {
                    title: 'Jadwal Rutin',
                    url: '/work-schedules',
                    icon: CalendarRange,
                    permission: { resource: 'work_schedule', actions: ['view'] },
                },
                {
                    title: 'Hasil Pekerjaan',
                    url: '/work-data',
                    icon: FileCheck,
                    permission: { resource: 'work_data', actions: ['view'] },
                },
            ],
        },

        // ---------- PERSURATAN ----------
        {
            title: 'Persuratan',
            items: [
                {
                    title: 'Surat Masuk',
                    url: '/letters/incoming',
                    icon: Inbox,
                    permission: { resource: 'letter.incoming', actions: ['view'] },
                },
                {
                    title: 'Surat Keluar',
                    url: '/letters/outgoing',
                    icon: Send,
                    permission: { resource: 'letter.outgoing', actions: ['view'] },
                },
            ],
        },

        // ---------- MITRA & LOKASI ----------
        {
            title: 'Mitra & Lokasi',
            items: [
                {
                    title: 'Daftar Tenant',
                    url: '/tenants',
                    icon: Building,
                    permission: { resource: 'tenant', actions: ['view'] },
                },
            ],
        },

        // ---------- ORGANISASI ----------
        {
            title: 'Organisasi',
            items: [
                {
                    title: 'Departemen',
                    url: '/departments',
                    icon: Network,
                    permission: { resource: 'department', actions: ['view'] },
                },
                {
                    title: 'Karyawan (PIC)',
                    url: '/employees',
                    icon: Users,
                    permission: { resource: 'employee', actions: ['view'] },
                },
                {
                    title: 'Pengguna Sistem',
                    url: '/users',
                    icon: UserCircle,
                    permission: { resource: 'user', actions: ['view'] },
                },
                {
                    title: 'Hak Akses & Role',
                    url: '/roles',
                    icon: Shield,
                    permission: { resource: 'role', actions: ['view'] },
                },
            ],
        },

        // ---------- PENGATURAN ----------
        {
            title: 'Pengaturan',
            items: [
                {
                    title: 'Sistem',
                    url: '/settings/system',
                    icon: Settings,
                    permission: { resource: 'setting', actions: ['manage'] },
                },
            ],
        },
    ],
};