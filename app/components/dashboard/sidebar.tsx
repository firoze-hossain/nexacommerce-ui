// components/dashboard/sidebar.tsx
'use client';

import { useAuth } from '@/app/hooks/useAuth';

const superAdminNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Users', href: '/dashboard/users', icon: '👥' },
  { name: 'Roles', href: '/dashboard/roles', icon: '👑' },
  { name: 'Permissions', href: '/dashboard/permissions', icon: '🔐' },
  { name: 'Products', href: '/dashboard/products', icon: '🛍️' },
  { name: 'Orders', href: '/dashboard/orders', icon: '📦' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
  { name: 'Customers', href: '/dashboard/customers', icon: '👥' },
];

const adminNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Products', href: '/dashboard/products', icon: '🛍️' },
  { name: 'Orders', href: '/dashboard/orders', icon: '📦' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
  { name: 'Customers', href: '/dashboard/customers', icon: '👥' },
];

const vendorNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Products', href: '/dashboard/products', icon: '🛍️' },
  { name: 'Orders', href: '/dashboard/orders', icon: '📦' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
];

export default function DashboardSidebar() {
  const { user } = useAuth();

  const getNavigation = () => {
    const role = user?.role?.name;
    if (role === 'SUPERADMIN') return superAdminNavigation;
    if (role === 'ADMIN') return adminNavigation;
    if (role === 'VENDOR') return vendorNavigation;
    return vendorNavigation; // default fallback
  };

  const navigation = getNavigation();

  return (
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-900">NexaCommerce</h1>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => (
                  <a
                      key={item.name}
                      href={item.href}
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </a>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs font-medium text-gray-500">{user?.email}</p>
                <p className="text-xs font-medium text-indigo-600">{user?.role?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}