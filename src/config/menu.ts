export interface MenuItem {
    title: string;
    path: string;
    requiredPermission?: string;
    requiredRole?: string;
    icon?: string;
}

export const menuConfig: MenuItem[] = [
    {
        title: 'Dashboard',
        path: '/dashboard',
    },
    {
        title: 'Bookings',
        path: '/dashboard/bookings',
        requiredPermission: 'Booking.View',
    },
    {
        title: 'Create Booking',
        path: '/dashboard/bookings/create',
        requiredPermission: 'Booking.Create',
    },
    {
        title: 'Admin',
        path: '/admin',
        requiredPermission: 'User.View',
    },
    {
        title: 'Users',
        path: '/admin/users',
        requiredPermission: 'User.View',
    },
    {
        title: 'Roles',
        path: '/admin/roles',
        requiredPermission: 'Role.Manage',
    },
    {
        title: 'Permissions',
        path: '/admin/permissions',
        requiredPermission: 'Permission.Manage',
    },
];
