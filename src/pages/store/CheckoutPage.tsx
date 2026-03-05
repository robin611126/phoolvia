import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { insforge } from '../../lib/insforge';
import { ShieldCheck, Package, Lock, ChevronDown, ChevronUp } from 'lucide-react';

interface CartItem { id: string; name: string; price: number; image: string | null; quantity: number; variant: string; }

export default function CheckoutPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState<CartItem[]>([]);
    const [showSummary, setShowSummary] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: '', phone: '', name: '', street: '', city: '', state: '', pin: '', payment: 'upi',
    });

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('phoolviaa_cart') || '[]');
        if (cart.length === 0) navigate('/cart');
        setItems(cart);
    }, []);

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingFee = subtotal >= 500 ? 0 : 50;
    const total = subtotal + shippingFee;

    // --- Razorpay Integration ---
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    async function handlePaymentAndOrder(orderNumber: string, orderData: any) {
        // If COD, just save the order directly
        if (form.payment === 'cod') {
            await saveOrder(orderData, 'pending');
            return;
        }

        // Call our secure Edge Function to generate Razorpay Order ID
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
            alert('Razorpay SDK failed to load. Are you offline?');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await insforge.functions.invoke('create-razorpay-order', {
                body: { amount: total, receipt: orderNumber }
            });

            if (error || !data || !data.orderId) {
                console.error('Razorpay Gen Error:', error || data);
                alert('Payment matching failed. Please try again.');
                setLoading(false);
                return;
            }

            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: "PHOOLVIAA",
                description: `Order ${orderNumber}`,
                image: "https://phoolviaa.com/logo.png", // Add logo if available
                order_id: data.orderId,
                handler: async function (response: any) {
                    // Payment Successful
                    const paymentId = response.razorpay_payment_id;
                    await saveOrder({ ...orderData, razorpay_payment_id: paymentId, razorpay_order_id: response.razorpay_order_id }, 'paid');
                },
                prefill: {
                    name: form.name,
                    email: form.email,
                    contact: form.phone,
                },
                theme: {
                    color: "#1A1A2E", // Charcoal to match Phoolvia brand
                },
                modal: {
                    ondismiss: function () {
                        // Customer closed the popup without paying
                        setLoading(false);
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert(`Payment Failed: ${response.error.description}`);
            });
            rzp.open();

        } catch (err: any) {
            alert('Error generating payment: ' + err.message);
            setLoading(false);
        }
    }

    async function saveOrder(orderData: any, paymentStatus: string = 'pending') {
        orderData.payment_status = paymentStatus;

        const { error } = await insforge.database.from('orders').insert(orderData);

        // Update/create customer
        if (!error) {
            const { data: existingCustomer } = await insforge.database.from('customers').select('*').eq('email', form.email).maybeSingle();
            if (existingCustomer) {
                await insforge.database.from('customers').update({ total_orders: (existingCustomer.total_orders || 0) + 1, total_spent: parseFloat(existingCustomer.total_spent || 0) + total, phone: form.phone, address: { street: form.street, city: form.city, state: form.state, pin: form.pin } }).eq('id', existingCustomer.id);
            } else {
                await insforge.database.from('customers').insert({ name: form.name, email: form.email, phone: form.phone, address: { street: form.street, city: form.city, state: form.state, pin: form.pin }, total_orders: 1, total_spent: total });
            }

            localStorage.removeItem('phoolviaa_cart');
            window.dispatchEvent(new Event('cart-updated'));
            navigate('/order-success', { state: { orderNumber: orderData.order_number, total, name: form.name } });
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        // Generate order number
        const orderNumber = 'PHV-' + Date.now().toString(36).toUpperCase();

        const orderData = {
            order_number: orderNumber,
            customer_name: form.name,
            customer_email: form.email,
            customer_phone: form.phone,
            shipping_address: { street: form.street, city: form.city, state: form.state, pin: form.pin },
            items: items.map(i => ({ product_id: i.id, name: i.name, price: i.price, quantity: i.quantity, variant: i.variant, image: i.image })),
            subtotal, shipping_fee: shippingFee, tax: 0, total,
            payment_method: form.payment, payment_status: 'pending', order_status: 'pending',
        };

        handlePaymentAndOrder(orderNumber, orderData);
    }

    const paymentMethods = [
        { key: 'upi', label: 'UPI', desc: 'GPay, PhonePe, Paytm', emoji: '📱' },
        { key: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', emoji: '💳' },
        { key: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', emoji: '💵' },
    ];

    return (
        <div className="animate-fade-in px-4 py-4 space-y-4">
            <h1 className="font-display text-xl font-bold text-charcoal">Checkout</h1>

            {/* Order Summary Toggle */}
            <button onClick={() => setShowSummary(!showSummary)} className="w-full bg-blush-50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2"><Package size={16} className="text-blush-500" /><span className="text-sm font-medium text-gray-700">Order Summary ({items.length} items)</span></div>
                <div className="flex items-center gap-2"><span className="font-bold text-charcoal">₹{total.toLocaleString('en-IN')}</span>{showSummary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
            </button>
            {showSummary && (
                <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                            <div className="w-10 h-10 bg-blush-50 rounded-lg overflow-hidden flex-shrink-0">{item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">🌸</div>}</div>
                            <span className="flex-1 truncate">{item.name} × {item.quantity}</span>
                            <span className="font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Contact */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
                    <div className="space-y-3">
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" required />
                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" required />
                    </div>
                </section>

                {/* Shipping */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Shipping Address</h3>
                    <div className="space-y-3">
                        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" required />
                        <input type="text" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} placeholder="Street Address" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" required />
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" required />
                            <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" required />
                        </div>
                        <input type="text" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} placeholder="PIN Code" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" required />
                    </div>
                </section>

                {/* Payment */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Method</h3>
                    <div className="space-y-2">
                        {paymentMethods.map(pm => (
                            <label key={pm.key} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${form.payment === pm.key ? 'border-charcoal bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                <input type="radio" name="payment" value={pm.key} checked={form.payment === pm.key} onChange={(e) => setForm({ ...form, payment: e.target.value })} className="sr-only" />
                                <span className="text-xl">{pm.emoji}</span>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{pm.label}</p>
                                    <p className="text-xs text-gray-500">{pm.desc}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.payment === pm.key ? 'border-charcoal' : 'border-gray-300'}`}>
                                    {form.payment === pm.key && <div className="w-2.5 h-2.5 bg-charcoal rounded-full" />}
                                </div>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Trust Badges */}
                <div className="flex justify-center gap-6 py-2">
                    {[
                        { icon: ShieldCheck, label: 'Secure' },
                        { icon: Package, label: 'Authentic' },
                        { icon: Lock, label: 'Encrypted' },
                    ].map(b => (
                        <div key={b.label} className="flex flex-col items-center gap-1">
                            <b.icon size={20} className="text-gray-400" />
                            <span className="text-[10px] text-gray-500 font-medium">{b.label}</span>
                        </div>
                    ))}
                </div>

                {/* Pay Button */}
                <button type="submit" disabled={loading} className="w-full py-4 bg-charcoal text-white rounded-2xl font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-gray-300/30">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Pay ₹{total.toLocaleString('en-IN')}</>}
                </button>
            </form>
        </div>
    );
}
