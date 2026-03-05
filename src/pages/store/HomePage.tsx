import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { insforge } from '../../lib/insforge';
import { ChevronRight, Heart, Star } from 'lucide-react';

interface Category { id: string; name: string; slug: string; image_url: string | null; }
interface Product { id: string; name: string; slug: string; price: number; compare_price: number | null; images: any[]; is_best_seller: boolean; }
interface Section { id: string; section_type: string; title: string; subtitle: string; content: any; image_url: string | null; is_visible: boolean; }

export default function HomePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [bestSellers, setBestSellers] = useState<Product[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        const [catRes, prodRes, secRes] = await Promise.all([
            insforge.database.from('categories').select('*').order('sort_order', { ascending: true }),
            insforge.database.from('products').select('*').eq('is_best_seller', true).limit(4),
            insforge.database.from('homepage_sections').select('*').eq('is_visible', true).order('sort_order', { ascending: true }),
        ]);
        setCategories(catRes.data || []);
        setBestSellers(prodRes.data || []);
        setSections(secRes.data || []);
        setLoading(false);
    }

    const getImg = (p: Product) => p.images?.[0]?.url || p.images?.[0] || null;
    const heroSection = sections.find(s => s.section_type === 'hero_banner');
    const eidSection = sections.find(s => s.section_type === 'eid_special');

    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blush-400" /></div>;

    return (
        <div className="animate-fade-in">
            {/* Hero Banner */}
            {heroSection && (
                <section className="relative bg-gradient-to-br from-blush-100 via-blush-50 to-ivory mx-4 mt-4 rounded-3xl overflow-hidden">
                    <div className="p-8 pb-12">
                        <span className="inline-block px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-semibold text-blush-500 tracking-wider mb-3">
                            {heroSection.subtitle}
                        </span>
                        <h2 className="text-3xl font-display font-bold text-charcoal leading-tight mb-2">
                            {heroSection.title}
                        </h2>
                        <p className="text-sm text-gray-600 mb-6 max-w-xs">
                            Beautiful handcrafted crochet gifts made with love and premium yarn
                        </p>
                        <Link to="/shop" className="inline-flex items-center gap-2 bg-charcoal text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                            Shop Now <ChevronRight size={16} />
                        </Link>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blush-200/50 rounded-full" />
                    <div className="absolute -top-5 -right-5 w-20 h-20 bg-blush-200/30 rounded-full" />
                </section>
            )}

            {/* Featured Categories */}
            {categories.length > 0 && (
                <section className="mt-8 px-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg font-semibold text-charcoal">Shop by Category</h3>
                        <Link to="/shop" className="text-sm text-blush-500 font-medium">See All</Link>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                        {categories.map((cat) => (
                            <Link key={cat.id} to={`/category/${cat.slug}`} className="flex-shrink-0 text-center group">
                                <div className="w-20 h-20 bg-blush-50 rounded-2xl overflow-hidden mb-2 border-2 border-transparent group-hover:border-blush-300 transition-colors">
                                    {cat.image_url ? (
                                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">🌸</div>
                                    )}
                                </div>
                                <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Eid Special */}
            {eidSection && (
                <section className="mt-8 mx-4">
                    <div className="bg-gradient-to-r from-amber-50 to-blush-50 rounded-3xl p-6 relative overflow-hidden">
                        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold tracking-wider mb-3">
                            {eidSection.subtitle}
                        </span>
                        <h3 className="text-xl font-display font-bold text-charcoal mb-1">{eidSection.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{eidSection.content?.description}</p>
                        {eidSection.content?.price && (
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl font-bold text-charcoal">₹{Number(eidSection.content.price).toLocaleString('en-IN')}</span>
                                {eidSection.content.compare_price && (
                                    <span className="text-sm text-gray-400 line-through">₹{Number(eidSection.content.compare_price).toLocaleString('en-IN')}</span>
                                )}
                            </div>
                        )}
                        <Link to="/shop" className="inline-flex items-center gap-2 bg-charcoal text-white px-5 py-2.5 rounded-full text-sm font-medium">
                            {eidSection.content?.cta_text || 'Shop Now'} <ChevronRight size={14} />
                        </Link>
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-100/40 rounded-full" />
                    </div>
                </section>
            )}

            {/* Best Sellers */}
            {bestSellers.length > 0 && (
                <section className="mt-8 px-4 pb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg font-semibold text-charcoal">Best Sellers</h3>
                        <Link to="/shop" className="text-sm text-blush-500 font-medium">View All</Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {bestSellers.map((product) => (
                            <Link key={product.id} to={`/product/${product.slug}`} className="product-card">
                                <div className="relative aspect-square bg-blush-50">
                                    {getImg(product) ? (
                                        <img src={getImg(product)} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">🌸</div>
                                    )}
                                    <button className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors" onClick={(e) => e.preventDefault()}>
                                        <Heart size={16} className="text-gray-500" />
                                    </button>
                                    {product.compare_price && product.compare_price > product.price && (
                                        <span className="absolute top-2 left-2 badge badge-sale text-[10px]">SALE</span>
                                    )}
                                </div>
                                <div className="p-3">
                                    <p className="text-[10px] text-blush-500 font-semibold tracking-wider mb-0.5">HANDMADE</p>
                                    <h4 className="text-sm font-semibold text-charcoal line-clamp-1">{product.name}</h4>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} className="text-amber-400" fill="currentColor" />)}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-bold text-charcoal">₹{Number(product.price).toLocaleString('en-IN')}</span>
                                        {product.compare_price && product.compare_price > product.price && (
                                            <span className="text-xs text-gray-400 line-through">₹{Number(product.compare_price).toLocaleString('en-IN')}</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Empty state for no products */}
            {bestSellers.length === 0 && categories.length === 0 && (
                <section className="mt-8 px-4 text-center py-16">
                    <span className="text-4xl mb-3 block">🌸</span>
                    <h3 className="font-display text-lg font-semibold text-charcoal mb-2">Welcome to PHOOLVIAA</h3>
                    <p className="text-sm text-gray-500">Products coming soon! Check back later.</p>
                </section>
            )}
        </div>
    );
}
