import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { insforge } from '../../lib/insforge';
import { createShiprocketOrder, getCourierServices, assignCourier, requestPickup, trackOrder } from '../../lib/shiprocket';
import { ArrowLeft, Printer, MapPin, Package, Truck, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState('');

    // Shiprocket states
    const [shipping, setShipping] = useState(false);
    const [shipResult, setShipResult] = useState<any>(null);
    const [couriers, setCouriers] = useState<any[]>([]);
    const [selectedCourier, setSelectedCourier] = useState<number | null>(null);
    const [assigning, setAssigning] = useState(false);
    const [tracking, setTracking] = useState<any>(null);
    const [trackingLoading, setTrackingLoading] = useState(false);

    useEffect(() => { loadOrder(); }, [id]);

    async function loadOrder() {
        const { data } = await insforge.database.from('orders').select('*').eq('id', id).single();
        if (data) {
            setOrder(data);
            setStatus(data.order_status);
            setNotes(data.admin_notes || '');
            // If already shipped, try to load tracking
            if (data.shiprocket_order_id) {
                loadTracking(data.order_number);
            }
        }
        setLoading(false);
    }

    async function updateOrder() {
        setSaving(true);
        await insforge.database.from('orders').update({ order_status: status, admin_notes: notes, updated_at: new Date().toISOString() }).eq('id', id);
        setSaving(false);
        toast.success('Order updated successfully!');
    }

    // --- Shiprocket Functions ---

    async function pushToShiprocket() {
        if (!order) return;
        setShipping(true);
        try {
            const result = await createShiprocketOrder({
                order_number: order.order_number,
                order_date: new Date(order.created_at).toISOString().split('T')[0],
                customer_name: order.customer_name,
                customer_email: order.customer_email || '',
                customer_phone: order.customer_phone || '',
                shipping_address: order.shipping_address || {},
                items: (order.items || []).map((i: any) => ({ name: i.name, sku: i.sku || 'SKU-001', quantity: i.quantity, price: i.price })),
                subtotal: order.subtotal || order.total,
                total: order.total,
                payment_method: order.payment_method,
            });

            setShipResult(result);

            if (result.order_id && result.shipment_id) {
                // Save Shiprocket IDs to our DB
                await insforge.database.from('orders').update({
                    shiprocket_order_id: result.order_id,
                    shiprocket_shipment_id: result.shipment_id,
                    order_status: 'processing',
                    updated_at: new Date().toISOString(),
                }).eq('id', id);

                setOrder({ ...order, shiprocket_order_id: result.order_id, shiprocket_shipment_id: result.shipment_id });
                setStatus('processing');

                // Load available couriers
                const courierResult = await getCourierServices(result.shipment_id);
                if (courierResult.data?.available_courier_companies) {
                    setCouriers(courierResult.data.available_courier_companies);
                }
            }
        } catch (err: any) {
            toast.error('Shiprocket error: ' + (err.message || 'Unknown error'));
        }
        setShipping(false);
    }

    async function handleAssignCourier() {
        if (!selectedCourier || !order.shiprocket_shipment_id) return;
        setAssigning(true);
        try {
            const result = await assignCourier(order.shiprocket_shipment_id, selectedCourier);
            if (result.response?.data?.awb_code) {
                await insforge.database.from('orders').update({
                    awb_number: result.response.data.awb_code,
                    courier_name: result.response.data.courier_name,
                    order_status: 'shipped',
                    updated_at: new Date().toISOString(),
                }).eq('id', id);

                setOrder({ ...order, awb_number: result.response.data.awb_code, courier_name: result.response.data.courier_name });
                setStatus('shipped');

                // Request pickup
                await requestPickup(order.shiprocket_shipment_id);
                toast.success(`Courier assigned! AWB: ${result.response.data.awb_code}`);
                setCouriers([]);
            } else {
                toast.error('Could not assign courier. ' + JSON.stringify(result));
            }
        } catch (err: any) {
            toast.error('Error: ' + err.message);
        }
        setAssigning(false);
    }

    async function loadTracking(orderNumber?: string) {
        setTrackingLoading(true);
        try {
            const result = await trackOrder(orderNumber || order.order_number);
            setTracking(result);
        } catch (err) {
            console.error('Tracking error:', err);
        }
        setTrackingLoading(false);
    }

    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary" /></div>;
    if (!order) return <div className="text-center py-16 text-gray-500">Order not found</div>;

    const addr = order.shipping_address || {};
    const items = order.items || [];

    return (
        <div className="animate-fade-in max-w-2xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/admin/orders')} className="text-gray-500 hover:text-gray-700"><ArrowLeft size={20} /></button>
                    <h2 className="text-lg font-bold text-gray-900">Order {order.order_number}</h2>
                </div>
                <button className="text-admin-primary hover:text-blue-700"><Printer size={20} /></button>
            </div>

            {/* Order Status */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Order Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30">
                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Placed on {new Date(order.created_at).toLocaleString('en-IN')}</p>
            </div>

            {/* 🚀 Shiprocket Shipping Section */}
            <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-xl border border-violet-100 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                    <Truck size={20} className="text-violet-600" />
                    <h3 className="font-semibold text-gray-900">Shiprocket Shipping</h3>
                </div>

                {/* AWB & Tracking Info */}
                {order.awb_number && (
                    <div className="bg-white rounded-lg p-3 space-y-1">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-500" />
                            <span className="text-sm font-medium text-emerald-700">Shipment Created</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                            <div><span className="text-gray-500">AWB:</span> <span className="font-mono font-bold">{order.awb_number}</span></div>
                            {order.courier_name && <div><span className="text-gray-500">Courier:</span> <span className="font-medium">{order.courier_name}</span></div>}
                        </div>
                    </div>
                )}

                {/* Tracking Timeline */}
                {(tracking?.tracking_data?.shipment_track || tracking?.tracking?.length > 0) && (
                    <div className="bg-white rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tracking Updates</h4>
                        <div className="space-y-2 text-sm">
                            {(tracking.tracking_data?.shipment_track?.[0]?.tracking_data || tracking.tracking || []).slice(0, 5).map((t: any, i: number) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${i === 0 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                    <div>
                                        <p className="text-gray-900">{t.activity || t.status}</p>
                                        <p className="text-xs text-gray-400">{t.date} {t.location && `• ${t.location}`}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => loadTracking()} disabled={trackingLoading} className="mt-2 text-xs text-violet-600 font-medium hover:underline">
                            {trackingLoading ? 'Refreshing...' : 'Refresh Tracking'}
                        </button>
                    </div>
                )}

                {/* Push to Shiprocket */}
                {!order.shiprocket_order_id && (
                    <button onClick={pushToShiprocket} disabled={shipping} className="w-full py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {shipping ? <><Loader2 size={18} className="animate-spin" />Pushing to Shiprocket...</> : <><Truck size={18} />Ship via Shiprocket</>}
                    </button>
                )}

                {/* Shiprocket Order Created - Show result */}
                {shipResult && !shipResult.order_id && (
                    <div className="bg-red-50 rounded-lg p-3 flex items-start gap-2">
                        <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-700">
                            <p className="font-medium">Failed to create Shiprocket order</p>
                            <p className="text-xs mt-1">{JSON.stringify(shipResult.errors || shipResult.message || shipResult)}</p>
                        </div>
                    </div>
                )}

                {/* Courier Selection */}
                {couriers.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900">Select Courier Partner</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {couriers.slice(0, 8).map((c: any) => (
                                <label key={c.courier_company_id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${selectedCourier === c.courier_company_id ? 'border-violet-500 bg-violet-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="courier" checked={selectedCourier === c.courier_company_id} onChange={() => setSelectedCourier(c.courier_company_id)} className="accent-violet-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{c.courier_name}</p>
                                            <p className="text-xs text-gray-500">ETA: {c.estimated_delivery_days} days • Rating: {c.rating}/5</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">₹{Math.round(c.rate)}</span>
                                </label>
                            ))}
                        </div>
                        <button onClick={handleAssignCourier} disabled={!selectedCourier || assigning} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {assigning ? <><Loader2 size={18} className="animate-spin" />Assigning...</> : 'Assign Courier & Ship'}
                        </button>
                    </div>
                )}

                {/* Track button for already shipped orders */}
                {order.shiprocket_order_id && !tracking && !order.awb_number && (
                    <button onClick={() => loadTracking()} disabled={trackingLoading} className="w-full py-2 text-sm text-violet-600 border border-violet-200 rounded-xl font-medium hover:bg-violet-50 transition-colors">
                        {trackingLoading ? 'Loading...' : 'Load Tracking Info'}
                    </button>
                )}
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
                <h3 className="font-semibold text-gray-900">Customer Information</h3>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center"><span className="text-admin-primary font-semibold">{order.customer_name?.[0]}</span></div>
                    <div>
                        <p className="font-medium text-gray-900">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">{order.customer_phone}</p>
                    </div>
                </div>
                {addr.street && (
                    <div className="flex items-start gap-3 pt-2 border-t border-gray-50">
                        <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600">{addr.street}{addr.city ? `, ${addr.city}` : ''}{addr.pin ? ` - ${addr.pin}` : ''}</p>
                    </div>
                )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                    {items.map((item: any, i: number) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-gray-300" /></div>}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity}{item.variant ? ` • ${item.variant}` : ''}</p>
                                <p className="font-semibold text-gray-900 text-sm mt-0.5">₹{parseFloat(item.price).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500"><span>Subtotal ({items.length} items)</span><span>₹{parseFloat(order.subtotal).toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between text-gray-500"><span>Shipping</span><span>₹{parseFloat(order.shipping_fee || 0).toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between text-gray-500"><span>Tax</span><span>₹{parseFloat(order.tax || 0).toLocaleString('en-IN')}</span></div>
                    <hr className="border-gray-100" />
                    <div className="flex justify-between font-bold text-gray-900 text-base"><span>Total</span><span className="text-admin-primary">₹{parseFloat(order.total).toLocaleString('en-IN')}</span></div>
                    <div className="flex items-center gap-2 mt-2 text-xs"><span className="w-2 h-2 bg-emerald-500 rounded-full" /><span className="text-emerald-600">Paid via {order.payment_method || 'N/A'}</span></div>
                </div>
            </div>

            {/* Admin Notes */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">Admin Notes</h3>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Add internal notes about this order..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30 resize-none" />
            </div>

            {/* Update Button */}
            <button onClick={updateOrder} disabled={saving} className="w-full py-3.5 bg-admin-primary text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50">
                {saving ? 'Updating...' : 'Update Order'}
            </button>
        </div>
    );
}
