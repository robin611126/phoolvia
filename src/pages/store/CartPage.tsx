import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';

interface CartItem { id: string; name: string; slug: string; price: number; image: string | null; color: string; size: string; quantity: number; variant: string; }

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [note, setNote] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    useEffect(() => { loadCart(); window.addEventListener('cart-updated', loadCart); return () => window.removeEventListener('cart-updated', loadCart); }, []);

    function loadCart() { setItems(JSON.parse(localStorage.getItem('phoolviaa_cart') || '[]')); }
    function saveCart(cart: CartItem[]) { localStorage.setItem('phoolviaa_cart', JSON.stringify(cart)); setItems(cart); window.dispatchEvent(new Event('cart-updated')); }
    function updateQty(idx: number, qty: number) { const c = [...items]; c[idx].quantity = Math.max(1, qty); saveCart(c); }
    function removeItem(idx: number) { saveCart(items.filter((_, i) => i !== idx)); }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingThreshold = 500;
    const shippingFee = subtotal >= shippingThreshold ? 0 : 50;
    const total = subtotal + shippingFee;
    const freeShippingProgress = Math.min(100, (subtotal / shippingThreshold) * 100);
    const freeShippingRemaining = Math.max(0, shippingThreshold - subtotal);

    if (items.length === 0) {
        return (
            <div className="animate-fade-in flex flex-col items-center justify-center py-20 px-4">
                <ShoppingBag size={56} className="text-gray-200 mb-4" />
                <h2 className="font-display text-xl font-semibold text-charcoal mb-2">Your cart is empty</h2>
                <p className="text-sm text-gray-500 mb-6 text-center">Looks like you haven't added anything yet. Explore our beautiful handmade collection!</p>
                <Link to="/shop" className="btn-primary">Start Shopping</Link>
            </div>
        );
    }

    const handleCheckout = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsCheckingOut(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_INSFORGE_BASE_URL}/functions/v1/shiprocket-checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cart_data: {
                        items: items.map(item => ({
                            variant_id: item.id.toString(),
                            quantity: item.quantity
                        }))
                    },
                    redirect_url: window.location.origin + '/profile'
                })
            });
            const data = await res.json();
            if (res.ok && data.success && data.token) {
                // Trigger shiprocket headless checkout UI
                (window as any).HeadlessCheckout.addToCart(
                    e.nativeEvent,
                    data.token,
                    { fallbackUrl: window.location.origin + '/checkout' }
                );
            } else {
                console.error('Shiprocket token error:', data);
                alert('Checkout initialization failed.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('An error occurred during checkout setup.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="animate-fade-in px-4 py-4 space-y-4">
            <h1 className="font-display text-xl font-bold text-charcoal">Shopping Cart</h1>
            <p className="text-sm text-gray-500">{items.length} item{items.length > 1 ? 's' : ''}</p>

            {/* Free Shipping Progress */}
            <div className="bg-blush-50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Truck size={16} className="text-blush-500" />
                    {subtotal >= shippingThreshold ? (
                        <span className="text-sm font-medium text-emerald-600">🎉 You've unlocked FREE shipping!</span>
                    ) : (
                        <span className="text-sm text-gray-700">Add <span className="font-bold text-blush-500">₹{freeShippingRemaining.toLocaleString('en-IN')}</span> more for free shipping</span>
                    )}
                </div>
                <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blush-300 to-blush-400 h-full rounded-full transition-all duration-500" style={{ width: `${freeShippingProgress}%` }} />
                </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-3">
                {items.map((item, i) => (
                    <div key={`${item.id}-${item.variant}`} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex gap-3">
                            <div className="w-20 h-20 bg-blush-50 rounded-xl overflow-hidden flex-shrink-0">
                                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🌸</div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-charcoal line-clamp-1">{item.name}</h3>
                                {item.variant && <p className="text-xs text-gray-500 mt-0.5">{item.variant}</p>}
                                <p className="font-bold text-charcoal mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                            </div>
                            <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-500 self-start"><Trash2 size={16} /></button>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-1 py-1">
                                <button onClick={() => updateQty(i, item.quantity - 1)} className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white"><Minus size={14} /></button>
                                <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateQty(i, item.quantity + 1)} className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white"><Plus size={14} /></button>
                            </div>
                            <span className="font-bold text-charcoal">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Note */}
            <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Order Note</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Special instructions for your order..." rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none" />
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-2">
                <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>Shipping</span><span>{shippingFee === 0 ? <span className="text-emerald-600 font-medium">FREE</span> : `₹${shippingFee}`}</span></div>
                <hr className="border-gray-100" />
                <div className="flex justify-between items-center"><span className="font-semibold text-gray-900">Total</span><span className="text-xl font-bold text-charcoal">₹{total.toLocaleString('en-IN')}</span></div>
            </div>

            {/* Checkout */}
            <button
                id="buyNow"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className={`w-full btn-primary text-center flex items-center justify-center gap-2 ${isCheckingOut ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
                {isCheckingOut ? 'Securing Checkout...' : 'Proceed to Checkout'} <ArrowRight size={18} />
            </button>
        </div>
    );
}
