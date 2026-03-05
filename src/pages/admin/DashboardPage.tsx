import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { insforge } from '../../lib/insforge';
import { DollarSign, ShoppingBag, Clock, Package, Plus, Edit, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
    { day: 'Mon', sales: 2400 },
    { day: 'Tue', sales: 1800 },
    { day: 'Wed', sales: 4200 },
    { day: 'Thu', sales: 5800 },
    { day: 'Fri', sales: 7200 },
    { day: 'Sat', sales: 8500 },
    { day: 'Sun', sales: 6100 },
];

interface Order {
    id: string;
    order_number: string;
    customer_name: string;
    order_status: string;
    total: number;
    created_at: string;
}

interface Stats {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    totalProducts: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({ totalRevenue: 0, totalOrders: 0, pendingOrders: 0, totalProducts: 0 });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [ordersRes, productsRes, pendingRes] = await Promise.all([
                insforge.database.from('orders').select('*', { count: 'exact' }),
                insforge.database.from('products').select('id', { count: 'exact' }),
                insforge.database.from('orders').select('id', { count: 'exact' }).eq('order_status', 'pending'),
            ]);

            const orders = ordersRes.data || [];
            const totalRevenue = orders.reduce((sum: number, o: any) => sum + parseFloat(o.total || 0), 0);

            setStats({
                totalRevenue,
                totalOrders: ordersRes.count || 0,
                pendingOrders: pendingRes.count || 0,
                totalProducts: productsRes.count || 0,
            });

            // Get recent orders
            const { data: recent } = await insforge.database
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
            setRecentOrders(recent || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const statCards = [
        { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50', trend: '+15%', up: true },
        { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingBag, color: 'text-blue-600 bg-blue-50', trend: '+5%', up: true },
        { label: 'Pending Orders', value: stats.pendingOrders.toLocaleString(), icon: Clock, color: 'text-amber-600 bg-amber-50', trend: '-2%', up: false },
        { label: 'Total Products', value: stats.totalProducts.toLocaleString(), icon: Package, color: 'text-violet-600 bg-violet-50', trend: '+10%', up: true },
    ];

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            pending: 'badge badge-pending',
            processing: 'badge badge-processing',
            shipped: 'badge badge-shipped',
            delivered: 'badge badge-delivered',
            cancelled: 'badge badge-cancelled',
        };
        return badges[status] || 'badge bg-gray-100 text-gray-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
                <Link to="/admin/products/new" className="btn-admin flex items-center gap-2">
                    <Plus size={16} />
                    Add Product
                </Link>
                <Link to="/admin/homepage" className="btn-secondary flex items-center gap-2 !py-2 !px-4 !rounded-lg text-sm">
                    <Edit size={16} />
                    Update Home
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <div key={card.label} className="stat-card">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-gray-500">{card.label}</span>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                                <card.icon size={16} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        <div className="flex items-center gap-1 mt-1">
                            {card.up ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-red-500" />}
                            <span className={`text-xs font-medium ${card.up ? 'text-emerald-600' : 'text-red-600'}`}>{card.trend} vs last month</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sales Performance Chart */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={mockChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                            formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
                        />
                        <Bar dataKey="sales" fill="#F5A4B0" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                    <Link to="/admin/orders" className="text-sm text-admin-primary hover:underline font-medium">View All</Link>
                </div>

                {recentOrders.length === 0 ? (
                    <p className="text-gray-500 text-sm py-8 text-center">No orders yet. They'll show up here.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100">
                                    <th className="pb-3 pr-4">Order ID</th>
                                    <th className="pb-3 pr-4">Customer</th>
                                    <th className="pb-3 pr-4">Status</th>
                                    <th className="pb-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50">
                                        <td className="py-3 pr-4 font-mono text-xs">{order.order_number}</td>
                                        <td className="py-3 pr-4">{order.customer_name}</td>
                                        <td className="py-3 pr-4">
                                            <span className={getStatusBadge(order.order_status)}>
                                                {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right font-medium">₹{parseFloat(order.total as any).toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
