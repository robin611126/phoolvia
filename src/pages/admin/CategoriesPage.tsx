import { useEffect, useState } from 'react';
import { insforge } from '../../lib/insforge';
import { Plus, Edit2, Trash2, FolderOpen, X } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    description: string | null;
    sort_order: number;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [form, setForm] = useState({ name: '', description: '', image_url: '' });

    useEffect(() => { loadCategories(); }, []);

    async function loadCategories() {
        const { data } = await insforge.database.from('categories').select('*').order('sort_order', { ascending: true });
        setCategories(data || []);
        setLoading(false);
    }

    function openModal(cat?: Category) {
        if (cat) {
            setEditing(cat);
            setForm({ name: cat.name, description: cat.description || '', image_url: cat.image_url || '' });
        } else {
            setEditing(null);
            setForm({ name: '', description: '', image_url: '' });
        }
        setShowModal(true);
    }

    function slugify(text: string) {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        const payload = { name: form.name, slug: slugify(form.name), description: form.description || null, image_url: form.image_url || null };
        if (editing) {
            await insforge.database.from('categories').update(payload).eq('id', editing.id);
        } else {
            await insforge.database.from('categories').insert({ ...payload, sort_order: categories.length + 1 });
        }
        setShowModal(false);
        loadCategories();
    }

    async function deleteCategory(id: string) {
        if (!confirm('Delete this category?')) return;
        await insforge.database.from('categories').delete().eq('id', id);
        setCategories(categories.filter(c => c.id !== id));
    }

    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary" /></div>;

    return (
        <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Categories</h2>
                <button onClick={() => openModal()} className="btn-admin flex items-center gap-2"><Plus size={16} />Add</button>
            </div>

            {categories.length === 0 ? (
                <div className="text-center py-16">
                    <FolderOpen className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No categories yet.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
                            <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {cat.image_url ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><FolderOpen size={20} /></div>}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                                {cat.description && <p className="text-sm text-gray-500 line-clamp-1">{cat.description}</p>}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openModal(cat)} className="p-2 text-gray-500 hover:text-admin-primary hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                <button onClick={() => deleteCategory(cat.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">{editing ? 'Edit Category' : 'New Category'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30 resize-none" />
                            </div>
                            <button type="submit" className="w-full btn-admin py-3">{editing ? 'Update' : 'Create'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
