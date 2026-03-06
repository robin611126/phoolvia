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
        console.log("Receiving request for Razorpay order");
        const payload = await req.json();
        console.log("Payload:", payload);
        const { amount, receipt } = payload;

        if (!amount || !receipt) {
            return new Response(JSON.stringify({ error: 'Missing amount or receipt' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const keyId = Deno.env.get('RAZORPAY_KEY_ID');
        const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

        console.log("Key ID exists:", !!keyId);
        console.log("Key Secret exists:", !!keySecret);

        if (!keyId || !keySecret) {
            console.error('Razorpay keys are missing from environment variables.');
            return new Response(JSON.stringify({ error: 'Server configuration error' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Razorpay API expects amount in paise (multiply by 100)
        const amountInPaise = Math.round(amount * 100);

        console.log(`Calling Razorpay API with amount: ${amountInPaise}, receipt: ${receipt}`);

        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${btoa(`${keyId}:${keySecret}`)}`
            },
            body: JSON.stringify({
                amount: amountInPaise,
                currency: 'INR',
                receipt: receipt,
                // Optional: You can pass other Razorpay order parameters here if needed
            })
        });

        console.log("Razorpay API status:", response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Razorpay API Error:', errorData);
            return new Response(JSON.stringify({ error: 'Failed to create Razorpay Order', details: errorData }), {
                status: response.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const orderData = await response.json();

        // Return the required details to the frontend
        return new Response(JSON.stringify({
            orderId: orderData.id,
            amount: orderData.amount,
            currency: orderData.currency,
            keyId: keyId // Send the public key to the frontend for the checkout modal
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Edge Function Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
