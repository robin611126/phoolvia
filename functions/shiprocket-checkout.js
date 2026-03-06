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
        const bodyText = await req.text();
        const requestBody = JSON.parse(bodyText);

        // requestBody should look like:
        // { cart_data: { items: [ { variant_id: "...", quantity: 1 } ] }, redirect_url: "..." }

        // Add timestamp as required by shiprocket
        requestBody.timestamp = new Date().toISOString();

        const shiprocketBodyStr = JSON.stringify(requestBody);

        const apiKey = Deno.env.get('SHIPROCKET_API_KEY');
        const secretKey = Deno.env.get('SHIPROCKET_SECRET_KEY');

        console.log("Environment keys loaded:", {
            hasApiKey: !!apiKey,
            hasSecretKey: !!secretKey,
            apiKeyLength: apiKey ? apiKey.length : 0
        });

        if (!apiKey || !secretKey) {
            throw new Error("Missing Shiprocket API credentials in Edge Function environment variables. Please ensure SHIPROCKET_API_KEY and SHIPROCKET_SECRET_KEY are set in the Insforge dashboard.");
        }

        // Calculate HMAC SHA256 using Web Crypto API
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secretKey);
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const bodyData = encoder.encode(shiprocketBodyStr);
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, bodyData);
        // Convert to Base64
        const uint8Array = new Uint8Array(signature);
        let binaryString = '';
        for (let i = 0; i < uint8Array.byteLength; i++) {
            binaryString += String.fromCharCode(uint8Array[i]);
        }
        const hmacBase64 = btoa(binaryString);

        console.log("Sending checkout request to Shiprocket:", shiprocketBodyStr);

        // Make the API call to Shiprocket
        const res = await fetch('https://checkout-api.shiprocket.com/api/v1/access-token/checkout', {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
                'X-Api-HMAC-SHA256': hmacBase64,
                'Content-Type': 'application/json'
            },
            body: shiprocketBodyStr
        });

        const data = await res.json();
        console.log("Shiprocket response status:", res.status);
        console.log("Shiprocket response data:", JSON.stringify(data));

        if (!res.ok) {
            throw new Error(`Shiprocket API error (API Key Length: ${apiKey ? apiKey.length : 0}, Secret Key Length: ${secretKey ? secretKey.length : 0}): ${JSON.stringify(data)}`);
        }

        return new Response(JSON.stringify({ success: true, token: data.token, raw: data }), {
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
