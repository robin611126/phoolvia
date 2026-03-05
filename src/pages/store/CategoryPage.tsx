import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { insforge } from '../../lib/insforge';
import { Heart, Star } from 'lucide-react';

interface Product { id: string; name: string; slug: string; price: number; compare_price: number | null; images: any[]; inventory_qty: number; category_id: string; }

export default function CategoryPage() {
    const { slug } = useParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => { loadData(); }, [slug]);

    async function loadData() {
        setLoading(true);
        const [catRes, allCats] = await Promise.all([
            slug ? insforge.database.from('categories').select('*').eq('slug', slug).single() : Promise.resolve({ data: null }),
            insforge.database.from('categories').select('*').order('sort_order', { ascending: true }),
        ]);
        setCategory(catRes.data);
        setCategories(allCats.data || []);

        let query = insforge.database.from('products').select('*').eq('status', 'active');
        if (catRes.data?.id) query = query.eq('category_id', catRes.data.id);

        if (sortBy === 'price_low') query = query.order('price', { ascending: true });
        else if (sortBy === 'price_high') query = query.order('price', { ascending: false });
        else query = query.order('created_at', { ascending: false });

        const { data } = await query;
        setProducts(data || []);
        setLoading(false);
    }

    useEffect(() => { if (!loading) loadData(); }, [sortBy]);

    const getImg = (p: Product) => p.images?.[0]?.url || p.images?.[0] || null;

    return (
        <div className="animate-fade-in">
            {/* Hero */}
            <div className="bg-gradient-to-r from-blush-100 to-blush-50 px-4 py-6">
                <h1 className="font-display text-2xl font-bold text-charcoal">{category?.name || 'All Products'}</h1>
                {category?.description && <p className="text-sm text-gray-600 mt-1">{category.description}</p>}
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto px-4 py-3 -mx-0 scrollbar-hide">
                <Link to="/shop" className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${!slug ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                    All
                </Link>
                {categories.map(c => (
                    <Link key={c.id} to={`/category/${c.slug}`} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${slug === c.slug ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                        {c.name}
                    </Link>
                ))}
            </div>

            {/* Sort */}
            <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm text-gray-500">{products.length} products</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm text-gray-700 bg-transparent font-medium">
                    <option value="newest">Newest</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                </select>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blush-400" /></div>
            ) : products.length === 0 ? (
                <div className="text-center py-16 px-4"><span className="text-4xl mb-3 block">🌸</span><p className="text-gray-500">No products in this category yet.</p></div>
            ) : (
                <div className="grid grid-cols-2 gap-3 px-4 pb-8">
                    {products.map((product) => (
                        <Link key={product.id} to={`/product/${product.slug}`} className="product-card">
                            <div className="relative aspect-square bg-blush-50">
                                {getImg(product) ? <img src={getImg(product)} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🌸</div>}
                                <button className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center" onClick={(e) => e.preventDefault()}><Heart size={16} className="text-gray-500" /></button>
                                {product.compare_price && product.compare_price > product.price && <span className="absolute top-2 left-2 badge badge-sale text-[10px]">SALE</span>}
                                {product.inventory_qty <= 0 && <span className="absolute bottom-2 left-2 badge bg-gray-800 text-white text-[10px]">OUT OF STOCK</span>}
                            </div>
                            <div className="p-3">
                                <p className="text-[10px] text-blush-500 font-semibold tracking-wider mb-0.5">HANDMADE</p>
                                <h4 className="text-sm font-semibold text-charcoal line-clamp-1">{product.name}</h4>
                                <div className="flex items-center gap-1 mt-0.5">{[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} className="text-amber-400" fill="currentColor" />)}</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="font-bold text-charcoal">₹{Number(product.price).toLocaleString('en-IN')}</span>
                                    {product.compare_price && product.compare_price > product.price && <span className="text-xs text-gray-400 line-through">₹{Number(product.compare_price).toLocaleString('en-IN')}</span>}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
