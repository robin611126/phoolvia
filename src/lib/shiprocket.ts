/**
 * Shiprocket API Service
 * Handles authentication, order creation, shipment tracking
 * Docs: https://apidocs.shiprocket.in/
 */

const SHIPROCKET_API = 'https://apiv2.shiprocket.in/v1/external';

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/** Get auth token (caches for 9 days, token lasts 10 days) */
export async function getShiprocketToken(): Promise<string> {
    if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

    const res = await fetch(`${SHIPROCKET_API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: import.meta.env.VITE_SHIPROCKET_EMAIL,
            password: import.meta.env.VITE_SHIPROCKET_PASSWORD,
        }),
    });

    const data = await res.json();
    if (!res.ok || !data.token) throw new Error(data.message || 'Shiprocket auth failed');

    cachedToken = data.token;
    tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000; // 9 days
    return data.token;
}

/** Authenticated fetch wrapper */
async function shiprocketFetch(endpoint: string, options: RequestInit = {}) {
    const token = await getShiprocketToken();
    const res = await fetch(`${SHIPROCKET_API}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options.headers || {}),
        },
    });
    return res.json();
}

/** Create a Shiprocket order from our order data */
export async function createShiprocketOrder(order: {
    order_number: string;
    order_date: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: { street: string; city: string; state: string; pin: string };
    items: { name: string; sku?: string; quantity: number; price: number }[];
    subtotal: number;
    total: number;
    payment_method: string;
}) {
    const payload = {
        order_id: order.order_number,
        order_date: order.order_date,
        pickup_location: 'Primary',
        billing_customer_name: order.customer_name.split(' ')[0],
        billing_last_name: order.customer_name.split(' ').slice(1).join(' ') || '',
        billing_address: order.shipping_address.street,
        billing_city: order.shipping_address.city,
        billing_pincode: order.shipping_address.pin,
        billing_state: order.shipping_address.state,
        billing_country: 'India',
        billing_email: order.customer_email,
        billing_phone: order.customer_phone.replace(/[^0-9]/g, '').slice(-10),
        shipping_is_billing: true,
        order_items: order.items.map((item, i) => ({
            name: item.name,
            sku: item.sku || `SKU-${i + 1}`,
            units: item.quantity,
            selling_price: item.price,
        })),
        payment_method: order.payment_method === 'cod' ? 'COD' : 'Prepaid',
        sub_total: order.subtotal,
        length: 20,
        breadth: 15,
        height: 10,
        weight: 0.5,
    };

    return shiprocketFetch('/orders/create/adhoc', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

/** Get available courier partners for a shipment */
export async function getCourierServices(shipmentId: number) {
    return shiprocketFetch(`/courier/serviceability/?shipment_id=${shipmentId}`);
}

/** Assign a courier to a shipment */
export async function assignCourier(shipmentId: number, courierId: number) {
    return shiprocketFetch('/courier/assign/awb', {
        method: 'POST',
        body: JSON.stringify({ shipment_id: shipmentId, courier_id: courierId }),
    });
}

/** Generate pickup request */
export async function requestPickup(shipmentId: number) {
    return shiprocketFetch('/courier/generate/pickup', {
        method: 'POST',
        body: JSON.stringify({ shipment_id: [shipmentId] }),
    });
}

/** Track shipment by order ID or AWB */
export async function trackOrder(orderId: string) {
    return shiprocketFetch(`/courier/track?order_id=${orderId}`);
}

/** Track by AWB number */
export async function trackByAWB(awb: string) {
    return shiprocketFetch(`/courier/track/awb/${awb}`);
}

/** Cancel a Shiprocket order */
export async function cancelShiprocketOrder(orderIds: number[]) {
    return shiprocketFetch('/orders/cancel', {
        method: 'POST',
        body: JSON.stringify({ ids: orderIds }),
    });
}

/** Get all pickup locations */
export async function getPickupLocations() {
    return shiprocketFetch('/settings/company/pickup');
}
