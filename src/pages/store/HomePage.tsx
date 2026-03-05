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
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

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

    // Group all hero banners together for the slider
    const heroBanners = sections.filter(s => s.section_type === 'hero_banner');

    // Auto-slide effect
    useEffect(() => {
        if (heroBanners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % heroBanners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [heroBanners.length]);

    const activeHero = heroBanners[currentHeroIndex];
    const eidSection = sections.find(s => s.section_type === 'eid_special');

    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blush-400" /></div>;

    return (
        <div className="animate-fade-in">
            {/* Hero Slider */}
            {heroBanners.length > 0 && (
                <section className="relative mx-4 mt-6 rounded-[2rem] overflow-hidden min-h-[500px] md:min-h-[600px] shadow-2xl">
                    {/* Background Images with premium Ken Burns effect */}
                    {heroBanners.map((banner, index) => (
                        <div
                            key={banner.id}
                            className={`absolute inset-0 transition-all duration-[2000ms] ease-out ${index === currentHeroIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 z-[-1]'}`}
                        >
                            {banner.image_url ? (
                                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover object-center" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blush-100 via-blush-50 to-ivory">
                                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blush-200/50 rounded-full" />
                                    <div className="absolute -top-5 -right-5 w-20 h-20 bg-blush-200/30 rounded-full" />
                                </div>
                            )}
                            {/* Layered Overlay Gradients for deep, cinematic readability - Black fade from bottom */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                        </div>
                    ))}

                    {/* Premium Text Content - Positioned Bottom Left */}
                    <div className="relative z-10 p-8 md:p-14 pb-20 h-full flex flex-col justify-end min-h-[500px] md:min-h-[600px]">
                        {activeHero && (
                            <div className="animate-fade-in w-full max-w-2xl" key={activeHero.id}>
                                <span className="inline-block px-5 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-[11px] font-bold text-ivory tracking-[0.2em] uppercase mb-6 shadow-xl hover:bg-white/20 transition-colors cursor-default">
                                    {activeHero.subtitle || 'NEW COLLECTION'}
                                </span>
                                <h2 className="text-5xl md:text-7xl font-display font-medium text-white leading-[1.1] mb-5 tracking-tight drop-shadow-xl">
                                    {activeHero.title}
                                </h2>
                                <p className="text-base md:text-lg text-white/80 mb-10 leading-relaxed font-light max-w-lg tracking-wide drop-shadow-md">
                                    Beautiful handcrafted crochet gifts made with love and premium yarn
                                </p>
                                <Link to="/shop" className="inline-flex items-center gap-3 bg-white text-charcoal px-8 py-4 rounded-full text-base font-bold hover:scale-105 hover:bg-ivory hover:shadow-2xl hover:shadow-white/20 transition-all duration-300">
                                    Discover Now <ChevronRight size={20} className="text-charcoal/70" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Elegant Slider Dots */}
                    {heroBanners.length > 1 && (
                        <div className="absolute bottom-8 left-8 md:left-14 flex justify-start gap-2.5 z-10">
                            {heroBanners.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentHeroIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-500 ease-out ${idx === currentHeroIndex ? 'bg-white w-10 shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/30 hover:bg-white/60 w-3 cursor-pointer'}`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
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
                    <div className="bg-[#FDFBF7] rounded-[1.5rem] relative flex flex-col items-center border border-[#F2E0D4] shadow-sm max-w-[420px] mx-auto overflow-hidden">

                        {/* Image Content - Moved to Top */}
                        {eidSection.image_url && (
                            <div className="w-full h-[280px] relative">
                                <img src={eidSection.image_url} alt={eidSection.title} className="absolute inset-0 w-full h-full object-cover object-top" />
                            </div>
                        )}

                        {/* Decorative elements if no image */}
                        {!eidSection.image_url && (
                            <div className="w-full h-[280px] relative bg-gradient-to-b from-amber-100/50 to-transparent flex items-center justify-center">
                                <span className="text-4xl opacity-20">🌸</span>
                            </div>
                        )}

                        {/* Text Content */}
                        <div className="p-6 w-full text-left z-10">
                            <span className="inline-block px-3 py-1 bg-white text-[#C45E2A] rounded-full text-[9px] font-bold tracking-widest uppercase mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#F2E0D4]">
                                {eidSection.subtitle || 'LIMITED EDITION'}
                            </span>
                            <h3 className="text-3xl font-display font-medium text-[#1a1a24] mb-3 leading-tight">{eidSection.title}</h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed line-clamp-2">{eidSection.content?.description}</p>

                            {eidSection.content?.price && (
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="text-2xl font-display font-bold text-[#1a1a24] tracking-tight">₹{Number(eidSection.content.price).toLocaleString('en-IN')}</span>
                                    {eidSection.content.compare_price && (
                                        <span className="text-sm font-medium text-gray-400 line-through">₹{Number(eidSection.content.compare_price).toLocaleString('en-IN')}</span>
                                    )}
                                </div>
                            )}

                            <Link to={eidSection.content?.cta_link || "/shop"} className="inline-flex items-center justify-center gap-2 bg-[#1a1a24] text-white px-6 py-3 rounded-full text-xs font-bold hover:bg-black transition-colors shadow-lg shadow-black/10 w-fit">
                                {eidSection.content?.cta_text || 'BUY NOW'} <ChevronRight size={14} className="stroke-[3]" />
                            </Link>
                        </div>
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
