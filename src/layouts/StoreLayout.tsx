import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, NavLink } from 'react-router-dom';
import { Home, Grid3X3, Heart, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { insforge } from '../lib/insforge';

const tabs = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/shop', icon: Grid3X3, label: 'Shop' },
    { to: '/wishlist', icon: Heart, label: 'Wishlist' },
    { to: '/cart', icon: ShoppingBag, label: 'Cart' },
    { to: '/profile', icon: User, label: 'Profile' },
];

// Pages where bottom nav should be hidden
const HIDE_NAV_PATHS = ['/checkout', '/order-success'];

export default function StoreLayout() {
    const location = useLocation();
    const hideBottomNav = HIDE_NAV_PATHS.includes(location.pathname);
    const [cartCount, setCartCount] = useState(0);
    const [storeInfo, setStoreInfo] = useState({ name: 'PHOOLVIAA', logo: null as string | null });
    const { user } = useAuth();

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('phoolviaa_cart') || '[]');
        setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
    };

    useEffect(() => {
        updateCartCount();
        window.addEventListener('cart-updated', updateCartCount);
        return () => window.removeEventListener('cart-updated', updateCartCount);
    }, []);

    useEffect(() => {
        async function fetchStoreInfo() {
            const { data } = await insforge.database.from('store_settings').select('store_name, logo_url').limit(1);
            if (data && data[0]) {
                setStoreInfo({ name: data[0].store_name || 'PHOOLVIAA', logo: data[0].logo_url });
            }
        }
        fetchStoreInfo();
    }, []);

    const isTabActive = (to: string) => {
        if (to === '/') return location.pathname === '/';
        // Exact match for top-level tabs, prefix match for nested routes
        return location.pathname === to || location.pathname.startsWith(to + '/');
    };

    return (
        <div className="min-h-screen bg-ivory font-body">
            {/* Top Header */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3.5">
                    <div className="w-8" />
                    <Link to="/" className="flex flex-col items-center">
                        {storeInfo.logo ? (
                            <img src={storeInfo.logo} alt={storeInfo.name} className="h-7 w-auto object-contain" />
                        ) : (
                            <span className="font-display text-xl tracking-[0.25em] text-charcoal uppercase">{storeInfo.name}</span>
                        )}
                    </Link>
                    <NavLink to="/cart" className="relative text-charcoal p-1">
                        <ShoppingBag size={22} />
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blush-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                {cartCount}
                            </span>
                        )}
                    </NavLink>
                </div>
            </header>

            {/* Page Content — adds bottom padding only when nav is visible */}
            <main className={hideBottomNav ? '' : 'pb-24'}>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className={`bg-gray-50 border-t border-gray-100 ${hideBottomNav ? '' : 'mb-20'} pt-12 pb-8 px-6 mt-12`}>
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
                            <li><Link to="/terms" className="hover:text-blush-600 transition-colors">Terms &amp; Conditions</Link></li>
                            <li><Link to="/privacy" className="hover:text-blush-600 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/shipping-policy" className="hover:text-blush-600 transition-colors">Shipping Policy</Link></li>
                            <li><Link to="/refund-policy" className="hover:text-blush-600 transition-colors">Refund &amp; Cancellation Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-4xl mx-auto mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} Phoolvia. All rights reserved.
                </div>
            </footer>

            {/* Bottom Tab Bar — only shown on store pages (not checkout/order-success) */}
            {!hideBottomNav && (
                <nav
                    className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                >
                    <div className="flex items-center justify-around py-2">
                        {tabs.map((tab) => {
                            const targetTo = tab.to === '/profile' && !user ? '/login' : tab.to;
                            const active = isTabActive(tab.to);

                            return (
                                <NavLink
                                    key={tab.to}
                                    to={targetTo}
                                    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors
                                        ${active ? 'text-charcoal' : 'text-gray-400'}`}
                                >
                                    <div className="relative">
                                        <tab.icon
                                            size={22}
                                            fill={active ? 'currentColor' : 'none'}
                                            strokeWidth={active ? 2 : 1.8}
                                        />
                                        {tab.to === '/cart' && cartCount > 0 && (
                                            <span className="absolute -top-2 -right-2.5 min-w-[16px] h-4 px-0.5 bg-blush-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white">
                                                {cartCount > 9 ? '9+' : cartCount}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-medium leading-none ${active ? 'text-charcoal' : 'text-gray-400'}`}>
                                        {tab.label}
                                    </span>
                                    {/* Active indicator dot */}
                                    {active && <div className="w-1 h-1 bg-blush-400 rounded-full mt-0.5" />}
                                </NavLink>
                            );
                        })}
                    </div>
                </nav>
            )}
        </div>
    );
}
