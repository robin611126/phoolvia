// Removed

async function run() {
    console.log("Testing email function...");
    const url = process.env.VITE_INSFORGE_BASE_URL + '/api/functions/v1/send-email';
    const anonKey = process.env.VITE_INSFORGE_ANON_KEY;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${anonKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'order_confirmed',
                email: 'phoolviaa@gmail.com',
                orderDetails: {
                    order_number: 'TEST-123',
                    customer_name: 'Test',
                    total: 500,
                    payment_method: 'UPI'
                }
            })
        });

        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
