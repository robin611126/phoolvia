import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { insforge } from '../../lib/insforge';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    price: number;
    category_id: string;
    inventory_qty: number;
    is_best_seller: boolean;
    status: string;
    images: any[];
    categories?: { name: string };
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const [prodRes, catRes] = await Promise.all([
            insforge.database.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
            insforge.database.from('categories').select('*').order('sort_order', { ascending: true }),
        ]);
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
        setLoading(false);
    }

    async function deleteProduct(id: string) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        await insforge.database.from('products').delete().eq('id', id);
        setProducts(products.filter((p) => p.id !== id));
    }

    const filteredProducts = products.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        if (filter === 'out_of_stock') return matchesSearch && p.inventory_qty <= 0;
        if (filter === 'best_sellers') return matchesSearch && p.is_best_seller;
        return matchesSearch;
    });

    const getStockStatus = (qty: number) => {
        if (qty <= 0) return { text: `Out of Stock (${qty})`, color: 'text-red-600', dot: 'bg-red-500' };
        if (qty <= 15) return { text: `Low Stock (${qty})`, color: 'text-amber-600', dot: 'bg-amber-500' };
        return { text: `In Stock (${qty})`, color: 'text-emerald-600', dot: 'bg-emerald-500' };
    };

    const getImageUrl = (product: Product) => {
        if (product.images && product.images.length > 0) {
            const img = product.images[0];
            return typeof img === 'string' ? img : img.url;
        }
        return null;
    };

    if (loading) {
        return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary" /></div>;
    }

    return (
        <div className="animate-fade-in space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Products</h2>
                <Link to="/admin/products/new" className="btn-admin flex items-center gap-2">
                    <Plus size={16} />
                    Add
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30"
                />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {[
                    { key: 'all', label: 'All Products' },
                    { key: 'out_of_stock', label: 'Out of Stock' },
                    { key: 'best_sellers', label: 'Best Sellers' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.key ? 'bg-admin-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Product List */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                    <Package className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No products found.</p>
                    <Link to="/admin/products/new" className="text-admin-primary text-sm font-medium hover:underline mt-1 inline-block">
                        Add your first product →
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredProducts.map((product) => {
                        const stock = getStockStatus(product.inventory_qty);
                        const imgUrl = getImageUrl(product);
                        return (
                            <div key={product.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                                <div className="flex gap-4">
                                    {/* Image */}
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {imgUrl ? (
                                            <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Package size={24} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    ₹{parseFloat(product.price as any).toLocaleString('en-IN')} • {product.categories?.name || 'Uncategorized'}
                                                </p>
                                                {product.is_best_seller && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                                                        BEST SELLER
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className={`w-2 h-2 rounded-full ${stock.dot}`} />
                                            <span className={`text-xs font-medium ${stock.color}`}>{stock.text}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-50">
                                    <Link
                                        to={`/admin/products/${product.id}`}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100"
                                    >
                                        <Edit2 size={14} />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => deleteProduct(product.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
