/**
 * Shiprocket API Service
 * Handles authentication, order creation, shipment tracking
 * Docs: https://apidocs.shiprocket.in/
 */

import { insforge } from './insforge';

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/** Get auth token (caches for 9 days, token lasts 10 days) */
export async function getShiprocketToken(): Promise<string> {
    if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

    const { data, error } = await insforge.functions.invoke('shiprocket-api', {
        body: {
            endpoint: '/auth/login',
            method: 'POST',
            body: {
                email: import.meta.env.VITE_SHIPROCKET_EMAIL,
                password: import.meta.env.VITE_SHIPROCKET_PASSWORD,
            }
        }
    });

    if (error || !data || !data.token) {
        throw new Error(error?.message || data?.message || 'Shiprocket auth failed');
    }

    cachedToken = data.token;
    tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000; // 9 days
    return data.token;
}

/** Authenticated fetch wrapper */
async function shiprocketFetch(endpoint: string, options: RequestInit = {}) {
    const token = await getShiprocketToken();

    let parsedBody = undefined;
    if (options.body) {
        try { parsedBody = typeof options.body === 'string' ? JSON.parse(options.body) : options.body; } catch { }
    }

    const { data, error } = await insforge.functions.invoke('shiprocket-api', {
        body: {
            endpoint,
            method: options.method || 'GET',
            headers: { Authorization: `Bearer ${token}` },
            body: parsedBody
        }
    });

    if (error) throw new Error(error.message);
    return data;
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
    shipping_fee?: number;
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
        shipping_charges: order.shipping_fee || 0,
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
