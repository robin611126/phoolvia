import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { insforge } from '../../lib/insforge';
import { ShoppingCart, Search } from 'lucide-react';

interface Order {
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    total: number;
    payment_method: string;
    order_status: string;
    created_at: string;
    items: any[];
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => { loadOrders(); }, []);

    async function loadOrders() {
        const { data } = await insforge.database.from('orders').select('*').order('created_at', { ascending: false });
        setOrders(data || []);
        setLoading(false);
    }

    const filtered = orders.filter((o) => {
        const matchesSearch = o.customer_name?.toLowerCase().includes(search.toLowerCase()) || o.order_number?.toLowerCase().includes(search.toLowerCase());
        if (filter === 'all') return matchesSearch;
        return matchesSearch && o.order_status === filter;
    });

    const statusBadge = (status: string) => {
        const map: Record<string, string> = { pending: 'badge-pending', processing: 'badge-processing', shipped: 'badge-shipped', delivered: 'badge-delivered', cancelled: 'badge-cancelled' };
        return `badge ${map[status] || 'bg-gray-100 text-gray-600'}`;
    };

    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary" /></div>;

    return (
        <div className="animate-fade-in space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Orders</h2>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                    <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === s ? 'bg-admin-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <ShoppingCart className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No orders found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((order) => (
                        <Link key={order.id} to={`/admin/orders/${order.id}`} className="block bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-sm font-semibold text-gray-900">{order.order_number}</span>
                                <span className={statusBadge(order.order_status)}>{order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">{order.customer_name}</p>
                                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">₹{parseFloat(order.total as any).toLocaleString('en-IN')}</p>
                                    <p className="text-xs text-gray-400">{order.payment_method || 'N/A'}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
