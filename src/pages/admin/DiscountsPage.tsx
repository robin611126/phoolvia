import { useEffect, useState } from 'react';
import { insforge } from '../../lib/insforge';
import { Plus, Tag, Edit2, Trash2, X, Calendar, Hash } from 'lucide-react';

interface Discount { id: string; code: string; percentage: number; max_uses: number; used_count: number; expiry_date: string | null; is_active: boolean; created_at: string; }

export default function DiscountsPage() {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Discount | null>(null);
    const [form, setForm] = useState({ code: '', percentage: '', max_uses: '', expiry_date: '' });

    useEffect(() => { loadDiscounts(); }, []);

    async function loadDiscounts() {
        const { data } = await insforge.database.from('discounts').select('*').order('created_at', { ascending: false });
        setDiscounts(data || []);
        setLoading(false);
    }

    function openModal(d?: Discount) {
        if (d) {
            setEditing(d);
            setForm({ code: d.code, percentage: String(d.percentage), max_uses: String(d.max_uses), expiry_date: d.expiry_date ? d.expiry_date.split('T')[0] : '' });
        } else {
            setEditing(null);
            setForm({ code: '', percentage: '', max_uses: '', expiry_date: '' });
        }
        setShowModal(true);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        const payload = { code: form.code.toUpperCase(), percentage: parseFloat(form.percentage), max_uses: parseInt(form.max_uses) || 0, expiry_date: form.expiry_date || null, is_active: true };
        if (editing) {
            await insforge.database.from('discounts').update(payload).eq('id', editing.id);
        } else {
            await insforge.database.from('discounts').insert(payload);
        }
        setShowModal(false);
        loadDiscounts();
    }

    async function toggleActive(d: Discount) {
        await insforge.database.from('discounts').update({ is_active: !d.is_active }).eq('id', d.id);
        setDiscounts(discounts.map(disc => disc.id === d.id ? { ...disc, is_active: !disc.is_active } : disc));
    }

    async function deleteDiscount(id: string) {
        if (!confirm('Delete this discount?')) return;
        await insforge.database.from('discounts').delete().eq('id', id);
        setDiscounts(discounts.filter(d => d.id !== id));
    }

    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary" /></div>;

    return (
        <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Discounts</h2>
                <button onClick={() => openModal()} className="btn-admin flex items-center gap-2"><Plus size={16} />Create</button>
            </div>

            {discounts.length === 0 ? (
                <div className="text-center py-16"><Tag className="mx-auto text-gray-300 mb-3" size={48} /><p className="text-gray-500">No discounts created yet.</p></div>
            ) : (
                <div className="space-y-3">
                    {discounts.map((d) => {
                        const expired = d.expiry_date && new Date(d.expiry_date) < new Date();
                        return (
                            <div key={d.id} className={`bg-white rounded-xl border p-4 shadow-sm ${!d.is_active || expired ? 'opacity-60' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0"><Tag size={18} className="text-violet-600" /></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-gray-900">{d.code}</span>
                                            <span className="badge bg-violet-100 text-violet-700">{d.percentage}% OFF</span>
                                            {expired && <span className="badge bg-red-100 text-red-600 text-[10px]">EXPIRED</span>}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span><Hash size={10} className="inline" /> {d.used_count}/{d.max_uses || '∞'} uses</span>
                                            {d.expiry_date && <span><Calendar size={10} className="inline" /> {new Date(d.expiry_date).toLocaleDateString('en-IN')}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => toggleActive(d)} className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${d.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {d.is_active ? 'ACTIVE' : 'PAUSED'}
                                        </button>
                                        <button onClick={() => openModal(d)} className="p-2 text-gray-400 hover:text-admin-primary"><Edit2 size={14} /></button>
                                        <button onClick={() => deleteDiscount(d.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">{editing ? 'Edit Discount' : 'New Discount'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Code</label>
                                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="EID2024" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm uppercase" required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label><input type="number" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: e.target.value })} placeholder="10" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" required /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label><input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="100" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" /></div>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label><input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" /></div>
                            <button type="submit" className="w-full btn-admin py-3">{editing ? 'Update' : 'Create Discount'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
