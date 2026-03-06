import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { insforge } from '../../lib/insforge';
import { Heart, Star, Minus, Plus, ShoppingBag, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
    id: string; name: string; slug: string; description: string; price: number; compare_price: number | null;
    images: any[]; colors: string[]; sizes: string[]; inventory_qty: number; category_id: string;
    categories?: { name: string };
}

export default function ProductDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [related, setRelated] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [activeImage, setActiveImage] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const scrollPosition = scrollRef.current.scrollLeft;
        const width = scrollRef.current.clientWidth;
        const currentIndex = Math.round(scrollPosition / width);
        setActiveImage(currentIndex);
    };

    const scrollToImage = (index: number) => {
        if (!scrollRef.current) return;
        const width = scrollRef.current.clientWidth;
        scrollRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
        setActiveImage(index);
    };
    const [expandedSection, setExpandedSection] = useState<string | null>('details');

    useEffect(() => { loadProduct(); }, [slug]);

    async function loadProduct() {
        setLoading(true);
        const { data } = await insforge.database.from('products').select('*, categories(name)').eq('slug', slug).single();
        if (data) {
            setProduct(data);
            setSelectedColor(data.colors?.[0] || '');
            setSelectedSize(data.sizes?.[0] || '');
            // Load related
            const { data: rel } = await insforge.database.from('products').select('*').eq('category_id', data.category_id).neq('id', data.id).limit(4);
            setRelated(rel || []);
        }
        setLoading(false);
    }

    function addToCart() {
        if (!product) return;
        const cart = JSON.parse(localStorage.getItem('phoolviaa_cart') || '[]');
        const img = product.images?.[0]?.url || product.images?.[0] || null;
        const existing = cart.findIndex((i: any) => i.id === product.id && i.color === selectedColor && i.size === selectedSize);
        if (existing >= 0) {
            cart[existing].quantity += quantity;
        } else {
            cart.push({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: img, color: selectedColor, size: selectedSize, quantity, variant: [selectedColor, selectedSize].filter(Boolean).join(' / ') });
        }
        localStorage.setItem('phoolviaa_cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cart-updated'));
        toast.success(`Added ${product.name} to cart`);
    }

    function buyNow() {
        if (!product) return;
        const img = product.images?.[0]?.url || product.images?.[0] || null;
        const buyNowItem = [{
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            image: img,
            color: selectedColor,
            size: selectedSize,
            quantity,
            variant: [selectedColor, selectedSize].filter(Boolean).join(' / '),
        }];
        // Save to a separate key – does NOT affect the cart
        localStorage.setItem('phoolviaa_buy_now', JSON.stringify(buyNowItem));
        navigate('/checkout');
    }

    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blush-400" /></div>;
    if (!product) return <div className="text-center py-16"><p className="text-gray-500">Product not found</p></div>;

    const images = product.images || [];
    const discount = product.compare_price && product.compare_price > product.price ? Math.round((1 - product.price / product.compare_price) * 100) : 0;
    const isOutOfStock = product.inventory_qty <= 0;
    const getImg = (p: any) => p.images?.[0]?.url || p.images?.[0] || null;

    const accordions = [
        { key: 'details', title: '🌸 Product Details', content: product.description || 'No description available.' },
        { key: 'care', title: '✨ Care Instructions', content: 'Gently dust with a soft brush. Avoid exposure to direct sunlight and moisture. Keep away from heat sources.' },
        { key: 'shipping', title: '📦 Shipping & Returns', content: 'Free shipping on orders above ₹500. Standard delivery in 3-5 business days. Returns accepted within 7 days.' },
    ];

    return (
        <div className="animate-fade-in">
            {/* Image Gallery */}
            <div className="relative">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="aspect-square bg-blush-50 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
                >
                    {images.length > 0 ? (
                        images.map((img: any, i: number) => (
                            <img
                                key={i}
                                src={img?.url || img}
                                alt={`${product.name} - ${i + 1}`}
                                className="w-full h-full object-cover flex-shrink-0 snap-center"
                            />
                        ))
                    ) : (
                        <div className="w-full h-full flex-shrink-0 flex items-center justify-center text-6xl">🌸</div>
                    )}
                </div>
                {/* Image dots */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {images.map((_: any, i: number) => (
                            <button
                                key={i}
                                onClick={() => scrollToImage(i)}
                                className={`w-2 h-2 rounded-full transition-colors ${i === activeImage ? 'bg-charcoal' : 'bg-white/70 shadow-sm'}`}
                                aria-label={`Go to image ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
                {/* Sale badge */}
                {discount > 0 && <span className="absolute top-4 left-4 px-3 py-1 bg-blush-400 text-white rounded-full text-xs font-bold">{discount}% OFF</span>}
                <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center"><Heart size={20} className="text-gray-600" /></button>
            </div>

            {/* Product Info */}
            <div className="px-4 py-5 space-y-4">
                <div>
                    <p className="text-xs text-blush-500 font-semibold tracking-wider mb-1">{product.categories?.name?.toUpperCase() || 'HANDMADE'}</p>
                    <h1 className="text-xl font-display font-bold text-charcoal">{product.name}</h1>
                    <div className="flex items-center gap-1 mt-1.5">{[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="text-amber-400" fill="currentColor" />)}<span className="text-xs text-gray-400 ml-1">(24 reviews)</span></div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-charcoal">₹{Number(product.price).toLocaleString('en-IN')}</span>
                    {product.compare_price && product.compare_price > product.price && <span className="text-lg text-gray-400 line-through">₹{Number(product.compare_price).toLocaleString('en-IN')}</span>}
                    {discount > 0 && <span className="badge badge-sale">SAVE ₹{(product.compare_price! - product.price).toLocaleString('en-IN')}</span>}
                </div>

                {/* Colors */}
                {product.colors.length > 0 && (
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Color: <span className="text-blush-500">{selectedColor}</span></label>
                        <div className="flex gap-2">
                            {product.colors.map(color => (
                                <button key={color} onClick={() => setSelectedColor(color)} className={`px-4 py-2 rounded-full text-sm border transition-colors ${selectedColor === color ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-gray-700 border-gray-200'}`}>{color}</button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sizes */}
                {product.sizes.length > 0 && (
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Size: <span className="text-blush-500">{selectedSize}</span></label>
                        <div className="flex gap-2">
                            {product.sizes.map(size => (
                                <button key={size} onClick={() => setSelectedSize(size)} className={`w-12 h-12 rounded-xl text-sm font-medium border transition-colors ${selectedSize === size ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-gray-700 border-gray-200'}`}>{size}</button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quantity */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Quantity</label>
                    <div className="flex items-center gap-4 bg-gray-50 rounded-xl w-fit px-1 py-1">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white transition-colors"><Minus size={16} /></button>
                        <span className="font-semibold text-charcoal w-6 text-center">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white transition-colors"><Plus size={16} /></button>
                    </div>
                </div>

                {/* Add to Cart / Buy Now */}
                <div className="flex flex-col gap-2.5 pt-2">
                    {/* Buy Now - Primary CTA */}
                    <button
                        onClick={buyNow}
                        disabled={isOutOfStock}
                        className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98] text-white"
                        style={{ background: 'linear-gradient(135deg, #f472b6, #ec4899, #db2777)' }}
                    >
                        <Zap size={18} fill="currentColor" />
                        {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
                    </button>
                    {/* Add to Cart - Secondary */}
                    <button
                        onClick={addToCart}
                        disabled={isOutOfStock}
                        className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 border-2 border-charcoal text-charcoal bg-white hover:bg-gray-50 transition-colors active:scale-[0.98]"
                    >
                        <ShoppingBag size={17} />
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>

                {/* Accordions */}
                <div className="border-t border-gray-100 pt-4 space-y-0">
                    {accordions.map(acc => (
                        <div key={acc.key} className="border-b border-gray-100">
                            <button onClick={() => setExpandedSection(expandedSection === acc.key ? null : acc.key)} className="w-full flex items-center justify-between py-4">
                                <span className="text-sm font-medium text-gray-900">{acc.title}</span>
                                {expandedSection === acc.key ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                            </button>
                            {expandedSection === acc.key && <p className="text-sm text-gray-600 pb-4 leading-relaxed whitespace-pre-line">{acc.content}</p>}
                        </div>
                    ))}
                </div>

                {/* Related Products */}
                {related.length > 0 && (
                    <section className="pt-4">
                        <h3 className="font-display text-lg font-semibold text-charcoal mb-3">You May Also Like</h3>
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                            {related.map(p => (
                                <Link key={p.id} to={`/product/${p.slug}`} className="flex-shrink-0 w-36">
                                    <div className="aspect-square bg-blush-50 rounded-2xl overflow-hidden mb-2">{getImg(p) ? <img src={getImg(p)} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🌸</div>}</div>
                                    <h4 className="text-xs font-semibold text-charcoal line-clamp-1">{p.name}</h4>
                                    <span className="text-xs font-bold text-charcoal">₹{Number(p.price).toLocaleString('en-IN')}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
