import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, User, Settings } from 'lucide-react';
import { insforge } from '../../lib/insforge';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, isLoading, logout } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                navigate('/login');
            } else {
                fetchUserOrders(user.email);
            }
        }
    }, [user, isLoading, navigate]);

    async function fetchUserOrders(email: string | undefined) {
        if (!email) return;
        try {
            const { data, error } = await insforge.database
                .from('orders')
                .select('*')
                .ilike('customer_email', email) // Case-insensitive match
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoadingOrders(false);
        }
    }

    async function handleLogout() {
        await logout();
        navigate('/');
    }

    if (isLoading || !user) return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blush-500" /></div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-500">Welcome back, {user?.profile?.name || user?.email}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors"
                >
                    <LogOut size={18} /> Logout
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center text-center shadow-sm">
                        <div className="w-20 h-20 bg-blush-50 rounded-full flex items-center justify-center mb-4">
                            <User size={32} className="text-blush-500" />
                        </div>
                        <h2 className="font-semibold text-gray-900">{user?.profile?.name || 'Customer'}</h2>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 bg-blush-50/50 border-l-4 border-blush-500 transition-colors">
                            <Package size={20} className="text-blush-600" />
                            <span className="font-medium text-gray-900">Order History</span>
                        </button>
                        <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 text-gray-600 transition-colors border-t border-gray-100">
                            <Settings size={20} />
                            <span className="font-medium">Account Settings</span>
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <Package size={20} className="text-blue-500" /> Recent Orders
                        </h3>
                        {loadingOrders ? (
                            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blush-500" /></div>
                        ) : orders.length > 0 ? (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order.id} className="border border-gray-100 rounded-xl p-5 hover:border-blush-200 transition-colors">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-semibold text-charcoal">Order #{order.order_number}</span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-charcoal">₹{order.total}</div>
                                                <p className="text-[10px] text-gray-400 uppercase">{order.payment_method}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm font-medium">
                                            <button className="text-blush-600 hover:text-blush-700">View Details →</button>
                                            {(order.order_status === 'shipped' || order.order_status === 'delivered') && order.tracking_link && (
                                                <a
                                                    href={order.tracking_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                >
                                                    📦 Track {order.courier_name ? `via ${order.courier_name}` : 'Order'}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Package size={24} className="text-gray-300" />
                                </div>
                                <p className="text-sm font-medium text-gray-900 mb-1">No orders yet</p>
                                <p className="text-xs text-gray-500">When you place an order, it will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
