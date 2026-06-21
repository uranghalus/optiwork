import {
    LayoutDashboard,
    Briefcase,
    Wrench,
    ListTodo,
    CalendarClock,
    FileCheck,
    Send,
    Building,
    Users,
    Network,
    UserCircle,
    Settings,
    Bell,
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

        {
            title: 'Manajemen Kerja',
            items: [
                {
                    title: 'Work Orders',
                    url: '/work-orders',
                    icon: Wrench,
                },
                {
                    title: 'Notifikasi',
                    url: '/notifications',
                    icon: Bell,
                },
            ],
        },

        {
            title: 'Organisasi',
            items: [
                {
                    title: 'Departemen',
                    url: '/departments',
                    icon: Network,
                },
                {
                    title: 'Karyawan',
                    url: '/employees',
                    icon: Users,
                },
                {
                    title: 'Pengguna Sistem',
                    url: '/users',
                    icon: UserCircle,
                },
            ],
        },

        {
            title: 'Mitra & Lokasi',
            items: [
                {
                    title: 'Daftar Tenant',
                    url: '/tenants',
                    icon: Building,
                },
            ],
        },

        {
            title: 'Pengaturan',
            items: [
                {
                    title: 'Sistem',
                    url: '/settings/system',
                    icon: Settings,
                },
            ],
        },
    ],
};
