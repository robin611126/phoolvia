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
        const url = new URL(req.url);
        const action = url.searchParams.get('action');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const offset = (page - 1) * limit;

        const baseUrl = Deno.env.get('INSFORGE_BASE_URL') || '';
        const anonKey = Deno.env.get('ANON_KEY') || '';

        const fetchDB = async (table, queryParams = "") => {
            const res = await fetch(`${baseUrl}/rest/v1/${table}?${queryParams}`, {
                headers: {
                    'apikey': anonKey,
                    'Authorization': `Bearer ${anonKey}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) {
                throw new Error(`DB Error: ${res.statusText}`);
            }
            return await res.json();
        };

        if (action === 'products') {
            const products = await fetchDB('products', `select=*,categories(name)&limit=${limit}&offset=${offset}`);

            const transformedProducts = products.map(p => ({
                id: p.id,
                title: p.name,
                body_html: p.description || "",
                vendor: "PHOOLVIAA",
                product_type: p.categories?.name || "General",
                updated_at: p.updated_at || new Date().toISOString(),
                status: p.status === 'active' ? 'active' : 'draft',
                variants: [
                    {
                        id: p.id,
                        title: p.name,
                        price: p.price.toString(),
                        quantity: p.inventory_qty || 0,
                        sku: p.sku || p.id.substring(0, 8),
                        updated_at: p.updated_at || new Date().toISOString(),
                        image: {
                            src: (p.images && p.images.length > 0) ? p.images[0] : ""
                        },
                        weight: 0.5
                    }
                ],
                image: {
                    src: (p.images && p.images.length > 0) ? p.images[0] : ""
                }
            }));

            return new Response(JSON.stringify({ data: transformedProducts }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            });

        } else if (action === 'collections') {
            const categories = await fetchDB('categories', `limit=${limit}&offset=${offset}`);

            const transformedCollections = categories.map(c => ({
                id: c.id,
                title: c.name,
                body_html: c.description || "",
                updated_at: c.updated_at || new Date().toISOString(),
                image: {
                    src: c.image || ""
                }
            }));

            return new Response(JSON.stringify({ data: transformedCollections }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            });

        } else if (action === 'collection_products') {
            const collectionId = url.searchParams.get('collection_id');
            if (!collectionId) {
                throw new Error('collection_id is required');
            }

            const products = await fetchDB('products', `category_id=eq.${collectionId}&select=*,categories(name)&limit=${limit}&offset=${offset}`);

            const transformedProducts = products.map(p => ({
                id: p.id,
                title: p.name,
                body_html: p.description || "",
                vendor: "PHOOLVIAA",
                product_type: p.categories?.name || "General",
                updated_at: p.updated_at || new Date().toISOString(),
                status: p.status === 'active' ? 'active' : 'draft',
                variants: [
                    {
                        id: p.id,
                        title: p.name,
                        price: p.price.toString(),
                        quantity: p.inventory_qty || 0,
                        sku: p.sku || p.id.substring(0, 8),
                        updated_at: p.updated_at || new Date().toISOString(),
                        image: {
                            src: (p.images && p.images.length > 0) ? p.images[0] : ""
                        },
                        weight: 0.5
                    }
                ],
                image: {
                    src: (p.images && p.images.length > 0) ? p.images[0] : ""
                }
            }));

            return new Response(JSON.stringify({ data: transformedProducts }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            });
        }

        return new Response(JSON.stringify({ error: "Invalid action parameter" }), {
            headers: corsHeaders,
            status: 400
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        });
    }
}
