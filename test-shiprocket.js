const fetch = require('node-fetch');

async function test() {
    try {
        const res = await fetch('https://62psi7hb.ap-southeast.insforge.app/functions/v1/shiprocket-checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cart_data: {
                    items: [{ variant_id: "123", quantity: 1 }]
                },
                redirect_url: "http://localhost:5173"
            })
        });

        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Response:', text);
    } catch (e) {
        console.error(e);
    }
}

test();
