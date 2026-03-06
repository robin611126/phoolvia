import { createClient } from '@insforge/sdk';

const insforge = createClient({
    baseUrl: 'https://62psi7hb.ap-southeast.insforge.app',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODI4ODl9.nOMNl4Oufs_buseDER6sGzSy9LNwUuh4m0RSMnCyWe8',
});

async function run() {
    console.log("Testing Shiprocket Checkout Function...");
    const { data, error } = await insforge.functions.invoke('shiprocket-checkout', {
        body: {
            cart_data: {
                items: [{ variant_id: "123", quantity: 1 }]
            },
            redirect_url: "http://localhost:5173"
        }
    });

    if (error) {
        console.error("Function Error:", error);
    } else {
        console.log("Function Data:", data);
    }
}

run();
