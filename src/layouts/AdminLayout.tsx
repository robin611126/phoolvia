import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard, Package, FolderOpen, ShoppingCart,
    Users, Home, Image, Tag, Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react';

const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/products', icon: Package, label: 'Products' },
    { to: '/admin/categories', icon: FolderOpen, label: 'Categories' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/admin/customers', icon: Users, label: 'Customers' },
    { to: '/admin/homepage', icon: Home, label: 'Homepage Editor' },
    { to: '/admin/media', icon: Image, label: 'Media Library' },
    { to: '/admin/discounts', icon: Tag, label: 'Discounts' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/admin');
    };

    return (
        <div className="min-h-screen bg-admin-bg font-body">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-wider">PHOOLVIAA</h1>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Admin Portal</p>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-admin-primary/10 text-admin-primary'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            <item.icon size={18} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-admin-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-admin-primary text-sm font-semibold">
                                {user?.email?.[0]?.toUpperCase() || 'A'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.profile?.name || 'Admin'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Top Header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
                    <div className="flex items-center justify-between px-4 lg:px-6 py-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-600 hover:text-gray-900"
                        >
                            <Menu size={22} />
                        </button>
                        <div className="hidden lg:flex items-center gap-1 text-sm text-gray-500">
                            <span>Admin</span>
                            <ChevronRight size={14} />
                            <span className="text-gray-900 font-medium">Dashboard</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <a href="/" target="_blank" className="text-sm text-admin-primary hover:underline">
                                View Store →
                            </a>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
