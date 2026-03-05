import { createClient } from 'npm:@insforge/sdk';

export default async function (req) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
        const { amount, currency = 'INR', receipt = 'receipt_1' } = await req.json();

        const key_id = Deno.env.get('RAZORPAY_KEY_ID');
        const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET');

        if (!key_id || !key_secret) {
            throw new Error('Razorpay keys not configured');
        }

        // Call Razorpay API to create an order
        const authHeader = `Basic ${btoa(`${key_id}:${key_secret}`)}`;

        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100), // Razorpay expects amount in paise
                currency: currency,
                receipt: receipt
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Razorpay Error:', errorText);
            throw new Error(`Razorpay Error: ${response.status} ${response.statusText}`);
        }

        const order = await response.json();

        return new Response(JSON.stringify({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: key_id
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
