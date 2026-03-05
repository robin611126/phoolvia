module.exports = async function (req) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders, status: 204 });
    }

    try {
        const body = await req.json();
        const { type, email, orderDetails } = body;

        const RESEND_API_KEY = 're_ae95zbsV_Ld6woNJnkez1vXvKN9bvceun';
        let subject = "New Update from PHOOLVIAA";
        let htmlContent = "";
        let to = email;

        if (type === 'order_confirmed') {
            subject = `Order Confirmed: ${orderDetails.order_number}`;
            htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333 border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #B5616E; padding: 20px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 24px;">PHOOLVIAA</h1>
                </div>
                <div style="padding: 30px;">
                    <h2 style="color: #1A1A2E; margin-top: 0;">Thank you for your order!</h2>
                    <p>Hi ${orderDetails.customer_name},</p>
                    <p>Your order <strong>${orderDetails.order_number}</strong> has been successfully placed and is now confirmed.</p>
                    
                    <div style="background-color: #FDF8F6; border: 1px solid #F5E6E0; border-radius: 8px; padding: 15px; margin: 20px 0;">
                        <h3 style="margin-top: 0; font-size: 16px; color: #1A1A2E;">Order Summary</h3>
                        <p style="margin-bottom: 5px;"><strong>Total Amount:</strong> ₹${orderDetails.total}</p>
                        <p style="margin-top: 0;"><strong>Payment Method:</strong> ${orderDetails.payment_method.toUpperCase()}</p>
                    </div>
                    
                    <p>We will notify you once your order is shipped and on its way to you.</p>
                    <br/>
                    <p>Warm Regards,<br/><strong>The PHOOLVIAA Team</strong></p>
                </div>
            </div>
        `;
        } else if (type === 'admin_alert') {
            to = 'phoolviaa@gmail.com'; // Using the registered admin email
            subject = `🚨 New Order Alert: ${orderDetails.order_number}`;
            htmlContent = `
            <h2>New Order Received!</h2>
            <p><strong>Customer:</strong> ${orderDetails.customer_name} (${orderDetails.customer_email})</p>
            <p><strong>Order Number:</strong> ${orderDetails.order_number}</p>
            <p><strong>Amount:</strong> ₹${orderDetails.total}</p>
            <p><strong>Payment Method:</strong> ${orderDetails.payment_method}</p>
            <p>Please login to the Admin Dashboard to process this order.</p>
        `;
        } else if (type === 'order_shipped') {
            subject = `Your Order ${orderDetails.order_number} has been shipped!`;
            htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #B5616E; padding: 20px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 24px;">PHOOLVIAA</h1>
                </div>
                <div style="padding: 30px;">
                    <h2 style="color: #1A1A2E; margin-top: 0;">Great News!</h2>
                    <p>Hi ${orderDetails.customer_name},</p>
                    <p>Your order <strong>${orderDetails.order_number}</strong> has been picked up by our delivery partner and is on its way to you.</p>
                    
                    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 15px; margin: 20px 0;">
                        <h3 style="margin-top: 0; font-size: 16px; color: #1A1A2E;">Tracking Details</h3>
                        <p style="margin-bottom: 5px;"><strong>Courier:</strong> ${orderDetails.courier_name}</p>
                        <p style="margin-top: 0;"><strong>AWB / Tracking Number:</strong> ${orderDetails.awb_number}</p>
                    </div>
                    
                    <p>You can use the tracking number above to track your shipment on the courier partner's website.</p>
                    <br/>
                    <p>Warm Regards,<br/><strong>The PHOOLVIAA Team</strong></p>
                </div>
            </div>
        `;
        } else {
            return new Response(JSON.stringify({ error: "Invalid email type" }), { headers: corsHeaders, status: 400 });
        }

        const payload = {
            from: 'PHOOLVIAA <orders@phoolvia.com>',
            to: [to],
            subject: subject,
            html: htmlContent
        };

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(JSON.stringify(errData));
        }

        const responseData = await res.json();

        return new Response(JSON.stringify({ success: true, data: responseData }), {
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
