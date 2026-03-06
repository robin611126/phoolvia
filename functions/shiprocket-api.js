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
        const payload = await req.json();
        const { endpoint, method, body, headers } = payload;

        if (!endpoint) {
            throw new Error('Missing endpoint parameter');
        }

        const SHIPROCKET_API = 'https://apiv2.shiprocket.in/v1/external';
        const url = `${SHIPROCKET_API}${endpoint}`;

        const fetchOptions = {
            method: method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(headers || {})
            }
        };

        if (body && ['POST', 'PUT', 'PATCH'].includes(fetchOptions.method)) {
            Object.assign(fetchOptions, { body: JSON.stringify(body) });
        }

        console.log(`Proxying ${fetchOptions.method} request to Shiprocket: ${url}`);

        const res = await fetch(url, fetchOptions);
        const data = await res.json();

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: res.status
        });
    } catch (error) {
        console.error("Shiprocket proxy error:", error);
        const errObj = error instanceof Error ? error : new Error(String(error));
        return new Response(JSON.stringify({ message: errObj.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        });
    }
};
