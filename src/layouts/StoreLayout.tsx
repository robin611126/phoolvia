import { Outlet, useLocation, Link, NavLink } from 'react-router-dom';
import { Home, Grid3X3, Heart, ShoppingBag, User } from 'lucide-react';

const tabs = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/shop', icon: Grid3X3, label: 'Shop' },
    { to: '/wishlist', icon: Heart, label: 'Wishlist' },
    { to: '/cart', icon: ShoppingBag, label: 'Cart' },
    { to: '/profile', icon: User, label: 'Profile' },
];

export default function StoreLayout() {
    const location = useLocation();
    const hideBottomNav = ['/checkout', '/order-success'].includes(location.pathname);

    return (
        <div className="min-h-screen bg-ivory font-body">
            {/* Top Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="flex items-center justify-between px-4 py-3.5">
                    <div className="w-8" />
                    <h1 className="font-display text-xl tracking-[0.25em] text-charcoal">PHOOLVIAA</h1>
                    <NavLink to="/cart" className="relative text-charcoal">
                        <ShoppingBag size={22} />
                    </NavLink>
                </div>
            </header>

            {/* Page Content */}
            <main className={hideBottomNav ? '' : 'pb-20'}>
                <Outlet />
            </main>

            {/* Footer with Legal Links */}
            <footer className={`bg-gray-50 border-t border-gray-100 ${hideBottomNav ? '' : 'mb-16'} pt-12 pb-8 px-6 mt-12`}>
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-display font-semibold mb-3 text-charcoal">Phoolvia</h4>
                        <p className="text-sm text-gray-500 mb-4">Handmade crochet gifts crafted with love.</p>
                        <h4 className="font-display font-semibold mb-2 text-charcoal">Contact</h4>
                        <ul className="space-y-1 text-sm text-gray-500">
                            <li>Email: phoolviaa@gmail.com</li>
                            <li>WhatsApp: +91 9065046908</li>
                            <li>Address: Amlabad Colliery, Bokaro, Jharkhand - 828303, India</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-display font-semibold mb-3 text-charcoal">Legal Policies</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link to="/terms" className="hover:text-blush-600 transition-colors">Terms & Conditions</Link></li>
                            <li><Link to="/privacy" className="hover:text-blush-600 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/shipping-policy" className="hover:text-blush-600 transition-colors">Shipping Policy</Link></li>
                            <li><Link to="/refund-policy" className="hover:text-blush-600 transition-colors">Refund & Cancellation Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-4xl mx-auto mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} Phoolvia. All rights reserved.
                </div>
            </footer>

            {/* Bottom Tab Bar */}
            {!hideBottomNav && (
                <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 safe-area-bottom">
                    <div className="flex items-center justify-around py-2">
                        {tabs.map((tab) => {
                            const isActive = tab.to === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.to);
                            return (
                                <NavLink
                                    key={tab.to}
                                    to={tab.to}
                                    className={`flex flex-col items-center gap-0.5 px-3 py-1 ${isActive ? 'text-charcoal' : 'text-gray-400'
                                        }`}
                                >
                                    <tab.icon size={20} fill={isActive ? 'currentColor' : 'none'} />
                                    <span className="text-[10px] font-medium">{tab.label}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                </nav>
            )}
        </div>
    );
}
