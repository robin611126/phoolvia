import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { insforge } from '../../lib/insforge';

export default function OrderSuccessPage() {
    const location = useLocation();
    const { orderNumber, total, name } = (location.state as any) || {};
    const [storePhone, setStorePhone] = useState('919876543210'); // Default fallback

    useEffect(() => {
        async function fetchSettings() {
            const { data, error } = await insforge.database.from('store_settings').select('whatsapp_number').single();
            console.log("Settings fetch result:", data, error);
            if (data?.whatsapp_number) {
                // Ensure the number has country code for wa.me, default to 91 if none
                let cleanPhone = data.whatsapp_number.replace(/\D/g, '');
                if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
                setStorePhone(cleanPhone);
            }
        }
        fetchSettings();
    }, []);

    return (
        <div className="animate-fade-in flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
            {/* Animated Checkmark */}
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 animate-scale-in">
                <CheckCircle size={48} className="text-emerald-500" />
            </div>

            <h1 className="font-display text-2xl font-bold text-charcoal mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-6 max-w-xs">
                Thank you{name ? `, ${name}` : ''}! Your order has been placed successfully.
            </p>

            {/* Order Details */}
            <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3 mb-6">
                {orderNumber && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Order Number</span>
                        <span className="font-mono font-bold text-charcoal">{orderNumber}</span>
                    </div>
                )}
                {total && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Amount</span>
                        <span className="font-bold text-charcoal">₹{Number(total).toLocaleString('en-IN')}</span>
                    </div>
                )}
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Estimated Delivery</span>
                    <span className="font-medium text-emerald-600">3-5 Business Days</span>
                </div>
            </div>

            {/* Actions */}
            <div className="w-full max-w-sm space-y-3">
                <a
                    href={`https://wa.me/${storePhone}?text=${encodeURIComponent(`Hi PHOOLVIAA! 🌸\n\nI just placed an order on your website.\nOrder ID: ${orderNumber || 'New Order'}\nAmount: ₹${total || '0'}\n\nPlease let me know when it ships. Thank you!`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="block w-full py-3.5 bg-[#25D366] text-white rounded-xl font-medium text-center hover:bg-[#1DA851] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
                    Notify us on WhatsApp
                </a>

                <div className="grid grid-cols-2 gap-3">
                    <Link to="/" className="block w-full py-3 border-2 border-blush-200 text-blush-600 rounded-xl font-medium text-center hover:bg-blush-50 transition-colors">
                        Shop More
                    </Link>
                    <Link to="/contact" className="block w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium text-center hover:bg-gray-50 transition-colors">
                        Support
                    </Link>
                </div>
            </div>

            <p className="text-xs text-gray-400 mt-6">Order confirmation sent to your email.</p>
        </div>
    );
}
