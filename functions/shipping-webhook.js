module.exports = async function (req) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, x-api-hmac-sha256',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders, status: 204 });
    }

    try {
        const bodyText = await req.text();
        let body = JSON.parse('{}');

        try {
            if (bodyText) body = JSON.parse(bodyText);
        } catch (e) {
            console.log("Webhook received non-JSON payload:", bodyText);
        }

        if (body.status === 'SUCCESS' || body.status === 'NEW') {
            const baseUrl = Deno.env.get('INSFORGE_BASE_URL') || '';
            const anonKey = Deno.env.get('ANON_KEY') || '';

            // Map shiprocket payload to our orders table
            const order_number = `SR-${body.order_id || Date.now()}`;

            const newOrder = {
                order_number: order_number,
                customer_name: body.customer_name || body.first_name || "Guest Checkout",
                customer_email: body.email || "",
                customer_phone: body.phone || "",
                items: body.cart_data?.items || [],
                total: body.total_amount_payable || 0,
                payment_method: body.payment_type || "ONLINE",
                payment_status: "paid",
                order_status: "processing",
                shiprocket_order_id: parseInt(body.order_id) || null,
                shipping_address: body.shipping_address || body,
                admin_notes: "Order created via Shiprocket Headless Checkout",
            };

            const res = await fetch(`${baseUrl}/rest/v1/orders`, {
                method: 'POST',
                headers: {
                    'apikey': anonKey,
                    'Authorization': `Bearer ${anonKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify([newOrder])
            });

            if (!res.ok) {
                const errResult = await res.text();
                throw new Error(`DB Insert Error: ${errResult}`);
            }
        } else if (body.current_status === 'CANCELED' || body.status === 'CANCELED' || body.status_code === 15) {
            // Handle Shiprocket Cancellations (Status code 15 is standard SR Cancelled)
            const baseUrl = Deno.env.get('INSFORGE_BASE_URL') || '';
            const anonKey = Deno.env.get('ANON_KEY') || '';
            const shiprocketOrderId = body.order_id || body.awb; // Depending on payload structure

            if (shiprocketOrderId) {
                const res = await fetch(`${baseUrl}/rest/v1/orders?shiprocket_order_id=eq.${shiprocketOrderId}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': anonKey,
                        'Authorization': `Bearer ${anonKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        order_status: 'cancelled',
                        admin_notes: `Order cancelled on Shiprocket at ${new Date().toLocaleString()}`,
                    })
                });

                if (!res.ok) {
                    throw new Error(`DB Update Error: ${await res.text()}`);
                }
            }
        }

        return new Response(JSON.stringify({ success: true, received: true, status: body.current_status || body.status }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        });
    }
}
