import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { insforge } from '../../lib/insforge';
import { ArrowLeft, Upload, X, MoreVertical } from 'lucide-react';

interface ProductForm {
    name: string;
    description: string;
    price: string;
    compare_price: string;
    category_id: string;
    sku: string;
    inventory_qty: string;
    tags: string;
    colors: string;
    sizes: string;
    is_featured: boolean;
    is_best_seller: boolean;
    images: { url: string; key: string; isMain?: boolean }[];
}

const emptyForm: ProductForm = {
    name: '', description: '', price: '', compare_price: '', category_id: '',
    sku: '', inventory_qty: '0', tags: '', colors: '', sizes: '',
    is_featured: false, is_best_seller: false, images: [],
};

export default function ProductEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id || id === 'new';
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadCategories();
        if (!isNew) loadProduct();
    }, [id]);

    async function loadCategories() {
        const { data } = await insforge.database.from('categories').select('*').order('sort_order', { ascending: true });
        setCategories(data || []);
    }

    async function loadProduct() {
        const { data } = await insforge.database.from('products').select('*').eq('id', id).single();
        if (data) {
            setForm({
                name: data.name || '',
                description: data.description || '',
                price: String(data.price || ''),
                compare_price: String(data.compare_price || ''),
                category_id: data.category_id || '',
                sku: data.sku || '',
                inventory_qty: String(data.inventory_qty || 0),
                tags: (data.tags || []).join(', '),
                colors: (data.colors || []).join(', '),
                sizes: (data.sizes || []).join(', '),
                is_featured: data.is_featured || false,
                is_best_seller: data.is_best_seller || false,
                images: data.images || [],
            });
        }
        setLoading(false);
    }

    function slugify(text: string) {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files) return;
        setUploading(true);
        const newImages = [...form.images];
        for (const file of Array.from(files)) {
            const { data, error } = await insforge.storage.from('product-images').uploadAuto(file);
            if (data && !error) {
                newImages.push({ url: data.url, key: data.key, isMain: newImages.length === 0 });
            }
        }
        setForm({ ...form, images: newImages });
        setUploading(false);
    }

    function removeImage(index: number) {
        const newImages = form.images.filter((_, i) => i !== index);
        if (newImages.length > 0 && !newImages.some(img => img.isMain)) {
            newImages[0].isMain = true;
        }
        setForm({ ...form, images: newImages });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const payload = {
            name: form.name,
            slug: slugify(form.name),
            description: form.description,
            price: parseFloat(form.price) || 0,
            compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
            category_id: form.category_id || null,
            sku: form.sku,
            inventory_qty: parseInt(form.inventory_qty) || 0,
            tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            colors: form.colors ? form.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
            sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
            is_featured: form.is_featured,
            is_best_seller: form.is_best_seller,
            images: form.images,
        };

        if (isNew) {
            await insforge.database.from('products').insert(payload);
        } else {
            await insforge.database.from('products').update(payload).eq('id', id);
        }

        setSaving(false);
        navigate('/admin/products');
    }

    if (loading) {
        return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary" /></div>;
    }

    return (
        <div className="animate-fade-in max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/admin/products')} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">{isNew ? 'Add Product' : 'Edit Product'}</h2>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <section>
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Basic Info</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30"
                                required
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <span className="text-xs text-gray-400">Rich Text</span>
                            </div>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30 resize-none"
                            />
                        </div>
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* Media */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-gray-900">Media</h3>
                        <span className="text-sm text-admin-primary">{form.images.length} of 8 max</span>
                    </div>

                    <label className="block border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-admin-primary/50 transition-colors">
                        <Upload className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-sm text-gray-600 font-medium">Tap to upload photos</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to 5MB</p>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>

                    {uploading && (
                        <div className="flex items-center gap-2 mt-3 text-sm text-admin-primary">
                            <div className="w-4 h-4 border-2 border-admin-primary/30 border-t-admin-primary rounded-full animate-spin" />
                            Uploading...
                        </div>
                    )}

                    {form.images.length > 0 && (
                        <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                            {form.images.map((img, i) => (
                                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    {img.isMain && (
                                        <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-charcoal text-white text-[10px] font-bold rounded">MAIN</span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeImage(i)}
                                        className="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center hover:bg-white"
                                    >
                                        <X size={12} className="text-gray-600" />
                                    </button>
                                </div>
                            ))}
                            {form.images.length < 8 && (
                                <label className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-admin-primary/50 flex-shrink-0">
                                    <Upload size={20} className="text-gray-300" />
                                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                            )}
                        </div>
                    )}
                </section>

                <hr className="border-gray-100" />

                {/* Pricing */}
                <section>
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Pricing</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                <input
                                    type="number" step="0.01" value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    className="w-full pl-7 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Compare-at Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                <input
                                    type="number" step="0.01" value={form.compare_price}
                                    onChange={(e) => setForm({ ...form, compare_price: e.target.value })}
                                    className="w-full pl-7 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* SKU & Inventory */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                        <input
                            type="text" value={form.sku}
                            onChange={(e) => setForm({ ...form, sku: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                            type="number" value={form.inventory_qty}
                            onChange={(e) => setForm({ ...form, inventory_qty: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30"
                        />
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                        value={form.category_id}
                        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30 appearance-none"
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Variants */}
                <section>
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Variants</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Colors (comma-separated)</label>
                            <input
                                type="text" value={form.colors} placeholder="Blush, Ivory, Rose"
                                onChange={(e) => setForm({ ...form, colors: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sizes (comma-separated)</label>
                            <input
                                type="text" value={form.sizes} placeholder="Small, Medium, Large"
                                onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30"
                            />
                        </div>
                    </div>
                </section>

                {/* Flags */}
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 rounded" />
                        <span className="text-sm text-gray-700">Featured Product</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.is_best_seller} onChange={(e) => setForm({ ...form, is_best_seller: e.target.checked })} className="w-4 h-4 rounded" />
                        <span className="text-sm text-gray-700">Best Seller</span>
                    </label>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3.5 bg-admin-primary text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                    {isNew ? 'Create Product' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}
