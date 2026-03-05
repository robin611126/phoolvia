import { useEffect, useState } from 'react';
import { insforge } from '../../lib/insforge';
import { Users, Search, Mail, Phone } from 'lucide-react';

interface Customer { id: string; name: string; email: string; phone: string; total_orders: number; total_spent: number; is_vip: boolean; created_at: string; }

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { loadCustomers(); }, []);

    async function loadCustomers() {
        const { data } = await insforge.database.from('customers').select('*').order('created_at', { ascending: false });
        setCustomers(data || []);
        setLoading(false);
    }

    const filtered = customers.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary" /></div>;

    return (
        <div className="animate-fade-in space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Customers</h2>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30" />
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-16"><Users className="mx-auto text-gray-300 mb-3" size={48} /><p className="text-gray-500">No customers yet.</p></div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((c) => (
                        <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-violet-50 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-violet-600 font-semibold text-sm">{c.name?.[0]?.toUpperCase()}</span></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900 truncate">{c.name}</h3>
                                        {c.is_vip && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">VIP</span>}
                                    </div>
                                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                                        {c.email && <span className="flex items-center gap-1"><Mail size={12} />{c.email}</span>}
                                        {c.phone && <span className="flex items-center gap-1"><Phone size={12} />{c.phone}</span>}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-semibold text-gray-900">₹{parseFloat(c.total_spent as any || 0).toLocaleString('en-IN')}</p>
                                    <p className="text-xs text-gray-400">{c.total_orders} orders</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
