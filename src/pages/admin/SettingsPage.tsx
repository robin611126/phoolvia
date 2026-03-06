import { useEffect, useState } from 'react';
import { insforge } from '../../lib/insforge';
import { Save, Store } from 'lucide-react';

interface Settings {
    id?: string;
    store_name: string;
    logo_url: string;
    contact_email: string;
    whatsapp_number: string;
    flat_shipping_rate: string;
    free_shipping_threshold: string;
    upi_enabled: boolean;
    cod_enabled: boolean;
    online_payment_enabled: boolean;
}

const defaults: Settings = {
    store_name: 'PHOOLVIAA', logo_url: '', contact_email: '', whatsapp_number: '',
    flat_shipping_rate: '50', free_shipping_threshold: '500',
    upi_enabled: true, cod_enabled: true, online_payment_enabled: false,
};

export default function SettingsPage() {
    const [form, setForm] = useState<Settings>(defaults);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settingsId, setSettingsId] = useState<string | null>(null);

    useEffect(() => { loadSettings(); }, []);

    async function loadSettings() {
        const { data } = await insforge.database.from('store_settings').select('*').limit(1);
        if (data && data.length > 0) {
            const s = data[0];
            setSettingsId(s.id);
            setForm({
                store_name: s.store_name || '', logo_url: s.logo_url || '',
                contact_email: s.contact_email || '', whatsapp_number: s.whatsapp_number || '',
                flat_shipping_rate: String(s.flat_shipping_rate || 0),
                free_shipping_threshold: String(s.free_shipping_threshold || 0),
                upi_enabled: s.upi_enabled ?? true, cod_enabled: s.cod_enabled ?? true,
                online_payment_enabled: s.online_payment_enabled ?? false,
            });
        }
        setLoading(false);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const payload = {
            store_name: form.store_name, logo_url: form.logo_url || null,
            contact_email: form.contact_email, whatsapp_number: form.whatsapp_number,
            flat_shipping_rate: parseFloat(form.flat_shipping_rate) || 0,
            free_shipping_threshold: parseFloat(form.free_shipping_threshold) || 0,
            upi_enabled: form.upi_enabled, cod_enabled: form.cod_enabled,
            online_payment_enabled: form.online_payment_enabled, updated_at: new Date().toISOString(),
        };
        if (settingsId) {
            await insforge.database.from('store_settings').update(payload).eq('id', settingsId);
        } else {
            await insforge.database.from('store_settings').insert(payload);
        }
        setSaving(false);
        alert('Settings saved!');
    }

    async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setSaving(true);
        const { data } = await insforge.storage.from('media-library').uploadAuto(file);
        if (data) {
            setForm({ ...form, logo_url: data.url });
            if (settingsId) {
                await insforge.database.from('store_settings').update({ logo_url: data.url }).eq('id', settingsId);
            }
        }
        setSaving(false);
    }

    async function handleLogoRemove() {
        setSaving(true);
        setForm({ ...form, logo_url: '' });
        if (settingsId) {
            await insforge.database.from('store_settings').update({ logo_url: null }).eq('id', settingsId);
        }
        setSaving(false);
    }

    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary" /></div>;

    return (
        <div className="animate-fade-in max-w-2xl space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Store Settings</h2>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Basic Info */}
                <section className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
                    <h3 className="font-semibold text-gray-900">Basic Information</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                        <input type="text" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                        <div className="flex items-center gap-4">
                            {form.logo_url ? (
                                <img src={form.logo_url} alt="Logo" className="w-14 h-14 rounded-lg object-contain border border-gray-200" />
                            ) : (
                                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center"><Store size={20} className="text-gray-300" /></div>
                            )}
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-admin-primary font-medium cursor-pointer hover:underline">
                                    Upload Logo
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                </label>
                                {form.logo_url && (
                                    <button
                                        type="button"
                                        onClick={handleLogoRemove}
                                        className="text-sm text-red-500 hover:underline text-left cursor-pointer"
                                    >
                                        Remove Logo
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
                    <h3 className="font-semibold text-gray-900">Contact Information</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                        <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                        <input type="text" value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} placeholder="+91 98765 43210" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30" />
                    </div>
                </section>

                {/* Shipping */}
                <section className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
                    <h3 className="font-semibold text-gray-900">Shipping</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Flat Shipping Rate (₹)</label>
                            <input type="number" value={form.flat_shipping_rate} onChange={(e) => setForm({ ...form, flat_shipping_rate: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Above (₹)</label>
                            <input type="number" value={form.free_shipping_threshold} onChange={(e) => setForm({ ...form, free_shipping_threshold: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30" />
                        </div>
                    </div>
                </section>

                {/* Payment Methods */}
                <section className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
                    <h3 className="font-semibold text-gray-900">Payment Methods</h3>
                    <div className="space-y-3">
                        {[
                            { key: 'upi_enabled', label: 'UPI Payment', desc: 'Accept UPI payments (GPay, PhonePe, Paytm)' },
                            { key: 'cod_enabled', label: 'Cash on Delivery', desc: 'Allow COD for orders' },
                            { key: 'online_payment_enabled', label: 'Online Payment', desc: 'Accept card and net banking payments' },
                        ].map(item => (
                            <label key={item.key} className="flex items-center justify-between py-2 cursor-pointer">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                                    <p className="text-xs text-gray-400">{item.desc}</p>
                                </div>
                                <div className={`relative w-11 h-6 rounded-full transition-colors ${(form as any)[item.key] ? 'bg-admin-primary' : 'bg-gray-300'}`}>
                                    <input type="checkbox" checked={(form as any)[item.key]} onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })} className="sr-only" />
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(form as any)[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </div>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Save */}
                <button type="submit" disabled={saving} className="w-full py-3.5 bg-admin-primary text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                    Save Settings
                </button>
            </form>
        </div>
    );
}
