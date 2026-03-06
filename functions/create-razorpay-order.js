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
        const { cart_items, receipt } = payload;

        if (!cart_items || !receipt || !Array.isArray(cart_items) || cart_items.length === 0) {
            return new Response(JSON.stringify({ error: 'Missing cart_items or receipt' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const keyId = Deno.env.get('RAZORPAY_KEY_ID');
        const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

        if (!keyId || !keySecret) {
            console.error('Razorpay keys are missing from environment variables.');
            return new Response(JSON.stringify({ error: 'Server configuration error' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Initialize Insforge client to fetch true product prices
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('INSFORGE_URL');
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('INSFORGE_ANON_KEY');
        const insforge = createClient({ baseUrl: supabaseUrl, anonKey: supabaseAnonKey });

        // Calculate secure total
        let calculatedSubtotal = 0;

        for (const item of cart_items) {
            if (!item.id || !item.quantity || item.quantity <= 0) {
                throw new Error("Invalid cart item format");
            }

            // Fetch true price from database
            const { data: product, error } = await insforge.database
                .from('products')
                .select('price')
                .eq('id', item.id)
                .single();

            if (error || !product) {
                console.error(`Product not found: ${item.id}`);
                throw new Error(`Invalid product in cart: ${item.id}`);
            }

            calculatedSubtotal += (parseFloat(product.price) * Math.floor(item.quantity));
        }

        // Free shipping if subtotal >= 500, else 50 Rs
        const shippingFee = calculatedSubtotal >= 500 ? 0 : 50;
        const totalAmount = calculatedSubtotal + shippingFee;

        // Razorpay API expects amount in paise (multiply by 100)
        const amountInPaise = Math.round(totalAmount * 100);

        console.log(`Calculated True Price: ₹${totalAmount} (Subtotal: ₹${calculatedSubtotal}, Shipping: ₹${shippingFee})`);
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
