import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { insforge } from '../../lib/insforge';
import { ShieldCheck, Package, Lock, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface CartItem { id: string; name: string; price: number; image: string | null; quantity: number; variant: string; }

interface FormState {
    email: string; phone: string; name: string;
    house: string; street: string; landmark: string;
    city: string; state: string; pin: string;
    payment: string;
}

interface Errors { [key: string]: string; }
interface Touched { [key: string]: boolean; }

// --- Validators ---
const validators: Record<string, (val: string) => string> = {
    name: (v) => !v.trim() ? 'Full name is required' : !/^[a-zA-Z\s.'-]{2,}$/.test(v) ? 'Name must contain only letters' : '',
    email: (v) => !v.trim() ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Please enter a valid email address' : '',
    phone: (v) => !v ? 'Phone number is required' : v.length !== 10 ? 'Must be exactly 10 digits' : /^[0-5]/.test(v) ? 'Enter a valid Indian mobile number' : '',
    house: (v) => !v.trim() ? 'House/Flat No. is required' : v.trim().length < 1 ? 'Enter your flat or house number' : '',
    street: (v) => !v.trim() ? 'Street address is required' : v.trim().length < 5 ? 'Please enter your full street address' : '',
    landmark: () => '',
    city: (v) => !v.trim() ? 'City is required' : !/^[a-zA-Z\s-]{2,}$/.test(v) ? 'City must contain only letters' : '',
    state: (v) => !v.trim() ? 'State is required' : !/^[a-zA-Z\s-]{2,}$/.test(v) ? 'State must contain only letters' : '',
    pin: (v) => !v ? 'PIN code is required' : v.length !== 6 ? 'Must be exactly 6 digits' : parseInt(v) < 100000 ? 'Enter a valid Indian PIN code' : '',
};

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh',
    'Chandigarh', 'Puducherry', 'Dadra & Nagar Haveli', 'Lakshadweep', 'Andaman & Nicobar',
];

function FormField({
    label, id, value, type = 'text', onChange, onBlur,
    error, touched, maxLength, inputMode, autoCapitalize, required = true,
    children
}: {
    label: string; id: string; value: string; type?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    error: string; touched: boolean; maxLength?: number;
    inputMode?: 'text' | 'numeric' | 'tel' | 'email';
    autoCapitalize?: string; required?: boolean;
    children?: React.ReactNode;
}) {
    const isValid = touched && !error && value.trim().length > 0;
    const isError = touched && !!error;

    return (
        <div className="relative">
            <div className="relative">
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    maxLength={maxLength}
                    inputMode={inputMode}
                    autoCapitalize={autoCapitalize}
                    placeholder=" "
                    required={required}
                    className={`peer w-full px-4 pt-5 pb-2 text-sm rounded-xl border-2 bg-white outline-none transition-all duration-200
                        ${isError ? 'border-red-400 bg-red-50/30' : isValid ? 'border-emerald-400 bg-emerald-50/20' : 'border-gray-200 focus:border-blush-400'}
                        focus:shadow-sm`}
                />
                <label htmlFor={id}
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                        peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wider
                        ${value ? 'top-1.5 text-[10px] font-semibold uppercase tracking-wider' : ''}
                        ${isError ? 'text-red-500' : isValid ? 'text-emerald-600' : 'peer-focus:text-blush-500 text-gray-500'}`}
                >
                    {label}{required && <span className="text-red-400 ml-0.5">*</span>}
                </label>
                {isValid && <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />}
                {isError && <AlertCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" />}
                {children}
            </div>
            {isError && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1 pl-1">
                    {error}
                </p>
            )}
        </div>
    );
}

export default function CheckoutPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState<CartItem[]>([]);
    const [showSummary, setShowSummary] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<FormState>({
        email: '', phone: '', name: '',
        house: '', street: '', landmark: '',
        city: '', state: '', pin: '',
        payment: 'upi',
    });
    const [errors, setErrors] = useState<Errors>({});
    const [touched, setTouched] = useState<Touched>({});

    useEffect(() => {
        // Buy Now flow: use the single buy-now item if present, otherwise use regular cart
        const buyNowItem = localStorage.getItem('phoolviaa_buy_now');
        const cart = buyNowItem
            ? JSON.parse(buyNowItem)
            : JSON.parse(localStorage.getItem('phoolviaa_cart') || '[]');

        if (cart.length === 0) navigate('/cart');
        setItems(cart);
        if (typeof (window as any).fbq === 'function') {
            (window as any).fbq('track', 'InitiateCheckout');
        }
    }, []);

    const validate = useCallback((field: string, value: string) => {
        return validators[field] ? validators[field](value) : '';
    }, []);

    const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (field === 'phone' || field === 'pin') value = value.replace(/\D/g, '');
        if (field === 'name' || field === 'city' || field === 'state') {
            value = value.replace(/[^a-zA-Z\s.'-]/g, '');
        }
        setForm(prev => ({ ...prev, [field]: value }));
        if (touched[field]) {
            setErrors(prev => ({ ...prev, [field]: validate(field, value) }));
        }
    };

    const handleBlur = (field: keyof FormState) => (e: React.FocusEvent<HTMLInputElement>) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        setErrors(prev => ({ ...prev, [field]: validate(field, e.target.value) }));
    };

    // Calculate shipping based on settings
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const [storeSettings, setStoreSettings] = useState<any>(null);

    useEffect(() => {
        async function fetchSettings() {
            const { data } = await insforge.database.from('store_settings').select('*').limit(1).maybeSingle();
            if (data) setStoreSettings(data);
        }
        fetchSettings();
    }, []);

    // Use fetched settings or fallback to defaults
    const threshold = storeSettings?.free_shipping_threshold != null ? parseFloat(storeSettings.free_shipping_threshold) : 500;
    const rate = storeSettings?.flat_shipping_rate != null ? parseFloat(storeSettings.flat_shipping_rate) : 50;

    // Check if subtotal is eligible for free shipping
    const isEligibleForFreeShipping = subtotal >= threshold;
    const shippingFee = isEligibleForFreeShipping ? 0 : rate;
    const total = subtotal + shippingFee;

    const loadRazorpayScript = () => new Promise((resolve) => {
        if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) { resolve(true); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

    async function handlePaymentAndOrder(orderNumber: string, orderData: any) {
        if (form.payment === 'cod') { await saveOrder(orderData, 'pending'); return; }

        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) { toast.error('Razorpay failed to load. Are you offline?'); setLoading(false); return; }

        try {
            const { data, error } = await insforge.functions.invoke('create-razorpay-order', {
                body: { cart_items: items, receipt: orderNumber }
            });
            if (error || !data || !data.orderId) {
                console.error('Razorpay Error:', error || data);
                toast.error('Payment setup failed. Please try again.');
                setLoading(false); return;
            }
            const options = {
                key: data.keyId, amount: data.amount, currency: data.currency,
                name: 'PHOOLVIAA', description: `Order ${orderNumber}`,
                order_id: data.orderId,
                handler: async (response: any) => {
                    await saveOrder({ ...orderData, razorpay_payment_id: response.razorpay_payment_id, razorpay_order_id: response.razorpay_order_id }, 'paid');
                },
                prefill: { name: form.name, email: form.email, contact: form.phone },
                theme: { color: '#1A1A2E' },
                modal: { ondismiss: () => setLoading(false) }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', (response: any) => toast.error(`Payment Failed: ${response.error.description}`));
            rzp.open();
        } catch (err: any) {
            toast.error('Error initiating payment: ' + err.message);
            setLoading(false);
        }
    }

    async function saveOrder(orderData: any, paymentStatus: string = 'pending') {
        orderData.payment_status = paymentStatus;
        const { error } = await insforge.database.from('orders').insert(orderData);
        if (!error) {
            for (const item of orderData.items) {
                const { data: p } = await insforge.database.from('products').select('inventory_qty').eq('id', item.product_id).single();
                if (p?.inventory_qty !== undefined) {
                    await insforge.database.from('products').update({ inventory_qty: Math.max(0, p.inventory_qty - item.quantity) }).eq('id', item.product_id);
                }
            }
            const { data: existing } = await insforge.database.from('customers').select('*').eq('email', form.email).maybeSingle();
            const fullAddress = { house: form.house, street: form.street, landmark: form.landmark, city: form.city, state: form.state, pin: form.pin };
            if (existing) {
                await insforge.database.from('customers').update({ total_orders: (existing.total_orders || 0) + 1, total_spent: parseFloat(existing.total_spent || 0) + total, phone: form.phone, address: fullAddress }).eq('id', existing.id);
            } else {
                await insforge.database.from('customers').insert({ name: form.name, email: form.email, phone: form.phone, address: fullAddress, total_orders: 1, total_spent: total });
            }
            localStorage.removeItem('phoolviaa_cart');
            localStorage.removeItem('phoolviaa_buy_now'); // Clear buy-now session if used
            window.dispatchEvent(new Event('cart-updated'));
            try {
                insforge.functions.invoke('send-email', { body: { type: 'order_confirmed', email: form.email, orderDetails: orderData } });
                insforge.functions.invoke('send-email', { body: { type: 'admin_alert', email: 'admin@phoolviaa.com', orderDetails: orderData } });
            } catch (err) { console.error('Email error', err); }
            if (typeof (window as any).fbq === 'function') {
                (window as any).fbq('track', 'Purchase', { value: total, currency: 'INR' });
            }
            navigate('/order-success', { state: { orderNumber: orderData.order_number, total, name: form.name } });
        } else {
            toast.error('Failed to place order. Please try again.');
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Validate all fields on submit
        const allFields = ['name', 'email', 'phone', 'house', 'street', 'city', 'state', 'pin'];
        const newErrors: Errors = {};
        const newTouched: Touched = {};
        let hasError = false;
        for (const field of allFields) {
            newTouched[field] = true;
            const err = validate(field, (form as any)[field]);
            newErrors[field] = err;
            if (err) hasError = true;
        }
        setTouched(newTouched);
        setErrors(newErrors);
        if (hasError) {
            toast.error('Please fix the errors before proceeding.');
            return;
        }

        setLoading(true);
        if (typeof (window as any).fbq === 'function') (window as any).fbq('track', 'AddPaymentInfo');

        const orderNumber = 'PHV-' + Date.now().toString(36).toUpperCase();
        const fullAddress = `${form.house}, ${form.street}${form.landmark ? ', Near ' + form.landmark : ''}, ${form.city}, ${form.state} - ${form.pin}`;

        const orderData = {
            order_number: orderNumber,
            customer_name: form.name, customer_email: form.email, customer_phone: form.phone,
            shipping_address: {
                house: form.house, street: form.street, landmark: form.landmark,
                city: form.city, state: form.state, pin: form.pin,
                full: fullAddress,
            },
            items: items.map(i => ({ product_id: i.id, name: i.name, price: i.price, quantity: i.quantity, variant: i.variant, image: i.image })),
            subtotal, shipping_fee: shippingFee, tax: 0, total,
            payment_method: form.payment, payment_status: 'pending', order_status: 'pending',
        };
        handlePaymentAndOrder(orderNumber, orderData);
    }

    // Filter payment methods based on admin settings
    const allPaymentMethods = [
        { key: 'upi', label: 'UPI', desc: 'GPay, PhonePe, Paytm', emoji: '📱', enabled: storeSettings?.upi_enabled ?? true },
        { key: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', emoji: '💳', enabled: storeSettings?.online_payment_enabled ?? false },
        { key: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', emoji: '💵', enabled: storeSettings?.cod_enabled ?? true },
    ];

    const paymentMethods = allPaymentMethods.filter(m => m.enabled);

    // Automatically select first available method if current selection becomes disabled
    useEffect(() => {
        if (storeSettings && paymentMethods.length > 0) {
            const currentIsValid = paymentMethods.some(m => m.key === form.payment);
            if (!currentIsValid) {
                setForm(prev => ({ ...prev, payment: paymentMethods[0].key }));
            }
        }
    }, [storeSettings]);

    const completedFields = ['name', 'email', 'phone', 'house', 'street', 'city', 'state', 'pin']
        .filter(f => (form as any)[f] && !errors[f]).length;
    const progress = Math.round((completedFields / 8) * 100);

    return (
        <>
            <div className="animate-fade-in px-4 py-4 space-y-5 pb-28">
                {/* Header */}
                <div>
                    <h1 className="font-display text-xl font-bold text-charcoal">Secure Checkout</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Fill in your details to complete your order</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 font-medium">Form completion</span>
                        <span className="text-xs font-bold text-charcoal">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #f9a8d4, #ec4899)' }}
                        />
                    </div>
                </div>

                {/* Order Summary Toggle */}
                <button
                    type="button"
                    onClick={() => setShowSummary(!showSummary)}
                    className="w-full bg-gradient-to-r from-blush-50 to-rose-50 rounded-2xl p-4 flex items-center justify-between border border-blush-100 shadow-sm"
                >
                    <div className="flex items-center gap-2">
                        <Package size={16} className="text-blush-500" />
                        <span className="text-sm font-semibold text-gray-700">Order Summary ({items.length} item{items.length > 1 ? 's' : ''})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-charcoal text-base">₹{total.toLocaleString('en-IN')}</span>
                        {showSummary ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                </button>
                {showSummary && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 -mt-2 shadow-sm">
                        {items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm">
                                <div className="w-10 h-10 bg-blush-50 rounded-lg overflow-hidden flex-shrink-0 border border-blush-100">
                                    {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">🌸</div>}
                                </div>
                                <span className="flex-1 text-gray-700">{item.name} × {item.quantity}</span>
                                <span className="font-semibold text-charcoal">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                            </div>
                        ))}
                        <div className="pt-2 border-t border-gray-100 space-y-1">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Shipping</span>
                                <span className={shippingFee === 0 ? 'text-emerald-600 font-semibold' : ''}>
                                    {shippingFee === 0 ? '🎉 FREE' : `₹${shippingFee}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-charcoal">
                                <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                )}

                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6" noValidate>

                    {/* Section 1: Contact */}
                    <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Information</h3>
                        <FormField
                            label="Full Name" id="name" value={form.name} type="text"
                            onChange={handleChange('name')} onBlur={handleBlur('name')}
                            error={errors.name || ''} touched={touched.name || false}
                            autoCapitalize="words"
                        />
                        <FormField
                            label="Email Address" id="email" value={form.email} type="email"
                            onChange={handleChange('email')} onBlur={handleBlur('email')}
                            error={errors.email || ''} touched={touched.email || false}
                            inputMode="email"
                        />
                        <FormField
                            label="Mobile Number" id="phone" value={form.phone} type="tel"
                            onChange={handleChange('phone')} onBlur={handleBlur('phone')}
                            error={errors.phone || ''} touched={touched.phone || false}
                            maxLength={10} inputMode="numeric"
                        />
                    </section>

                    {/* Section 2: Shipping Address */}
                    <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Delivery Address</h3>

                        <FormField
                            label="House / Flat / Floor No." id="house" value={form.house}
                            onChange={handleChange('house')} onBlur={handleBlur('house')}
                            error={errors.house || ''} touched={touched.house || false}
                        />
                        <FormField
                            label="Street / Area / Colony" id="street" value={form.street}
                            onChange={handleChange('street')} onBlur={handleBlur('street')}
                            error={errors.street || ''} touched={touched.street || false}
                        />
                        <FormField
                            label="Landmark (Optional)" id="landmark" value={form.landmark}
                            onChange={handleChange('landmark')} onBlur={handleBlur('landmark')}
                            error={errors.landmark || ''} touched={touched.landmark || false}
                            required={false}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                label="City" id="city" value={form.city}
                                onChange={handleChange('city')} onBlur={handleBlur('city')}
                                error={errors.city || ''} touched={touched.city || false}
                                autoCapitalize="words"
                            />
                            {/* State Dropdown */}
                            <div className="relative">
                                <select
                                    id="state" value={form.state}
                                    onChange={(e) => {
                                        setForm(prev => ({ ...prev, state: e.target.value }));
                                        setTouched(prev => ({ ...prev, state: true }));
                                        setErrors(prev => ({ ...prev, state: validate('state', e.target.value) }));
                                    }}
                                    className={`w-full px-4 pt-5 pb-2 text-sm rounded-xl border-2 bg-white outline-none appearance-none transition-all duration-200
                                    ${touched.state && errors.state ? 'border-red-400 bg-red-50/30' :
                                            touched.state && form.state ? 'border-emerald-400 bg-emerald-50/20' :
                                                'border-gray-200 focus:border-blush-400'}`}
                                >
                                    <option value=""></option>
                                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <label htmlFor="state"
                                    className={`absolute left-4 pointer-events-none transition-all duration-200
                                    ${form.state ? 'top-1.5 text-[10px] font-semibold uppercase tracking-wider' : 'top-3.5 text-sm text-gray-400'}
                                    ${touched.state && errors.state ? 'text-red-500' : touched.state && form.state ? 'text-emerald-600' : 'text-gray-500'}`}
                                >
                                    State<span className="text-red-400 ml-0.5">*</span>
                                </label>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                {touched.state && form.state && !errors.state && <CheckCircle2 size={16} className="absolute right-7 top-1/2 -translate-y-1/2 text-emerald-500" />}
                            </div>
                        </div>
                        {touched.state && errors.state && <p className="text-xs text-red-500 pl-1 -mt-2">{errors.state}</p>}

                        <FormField
                            label="PIN Code" id="pin" value={form.pin}
                            onChange={handleChange('pin')} onBlur={handleBlur('pin')}
                            error={errors.pin || ''} touched={touched.pin || false}
                            maxLength={6} inputMode="numeric"
                        />
                    </section>

                    {/* Section 3: Payment */}
                    <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Payment Method</h3>
                        <div className="space-y-2">
                            {paymentMethods.map(pm => (
                                <label key={pm.key} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                ${form.payment === pm.key ? 'border-charcoal bg-gray-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                    <input type="radio" name="payment" value={pm.key} checked={form.payment === pm.key}
                                        onChange={(e) => setForm({ ...form, payment: e.target.value })} className="sr-only" />
                                    <span className="text-2xl">{pm.emoji}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900">{pm.label}</p>
                                        <p className="text-xs text-gray-400">{pm.desc}</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                                    ${form.payment === pm.key ? 'border-charcoal' : 'border-gray-300'}`}>
                                        {form.payment === pm.key && <div className="w-2.5 h-2.5 bg-charcoal rounded-full" />}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Trust Badges */}
                    <div className="flex justify-center gap-8 py-2">
                        {[
                            { icon: ShieldCheck, label: 'Secure Pay' },
                            { icon: Package, label: 'Genuine' },
                            { icon: Lock, label: 'Encrypted' },
                        ].map(b => (
                            <div key={b.label} className="flex flex-col items-center gap-1.5">
                                <b.icon size={22} className="text-blush-400" />
                                <span className="text-[10px] text-gray-400 font-semibold">{b.label}</span>
                            </div>
                        ))}
                    </div>

                </form>
            </div>

            {/* Sticky Place Order Button - Fixed bottom overlay on mobile */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 pt-3 pb-5 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
                <button
                    type="submit"
                    form="checkout-form"
                    disabled={loading}
                    className="w-full py-4 bg-charcoal text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 shadow-xl shadow-gray-900/20 active:scale-[0.98] transition-transform"
                >
                    {loading
                        ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                        : <>🔒 Place Order · ₹{total.toLocaleString('en-IN')}</>
                    }
                </button>
                <p className="text-center text-[10px] text-gray-400 mt-1.5">Secure &amp; encrypted · By ordering you agree to our Terms</p>
            </div>
        </>
    );
}
