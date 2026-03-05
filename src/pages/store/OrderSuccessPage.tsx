import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
    const location = useLocation();
    const { orderNumber, total, name } = (location.state as any) || {};

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
                <Link to="/" className="block w-full btn-primary text-center flex items-center justify-center gap-2">
                    Continue Shopping <ArrowRight size={18} />
                </Link>
                <Link to="/contact" className="block w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium text-center hover:bg-gray-50 transition-colors">
                    Need Help?
                </Link>
            </div>

            <p className="text-xs text-gray-400 mt-6">Order confirmation sent to your email.</p>
        </div>
    );
}
