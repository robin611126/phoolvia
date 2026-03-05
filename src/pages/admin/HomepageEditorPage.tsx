import { useEffect, useState } from 'react';
import { insforge } from '../../lib/insforge';
import { GripVertical, Eye, EyeOff, Edit2, Plus } from 'lucide-react';

interface Section {
    id: string;
    section_type: string;
    title: string;
    subtitle: string;
    content: any;
    image_url: string | null;
    sort_order: number;
    is_visible: boolean;
}

const sectionIcons: Record<string, string> = {
    hero_banner: '🎨',
    eid_special: '🌙',
    best_sellers: '⭐',
    newsletter: '📧',
    featured_categories: '📂',
    testimonials: '💬',
};

export default function HomepageEditorPage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [editSection, setEditSection] = useState<Section | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editSubtitle, setEditSubtitle] = useState('');
    const [editImageUrl, setEditImageUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => { loadSections(); }, []);

    async function loadSections() {
        const { data } = await insforge.database.from('homepage_sections').select('*').order('sort_order', { ascending: true });
        setSections(data || []);
        setLoading(false);
    }

    async function toggleVisibility(section: Section) {
        await insforge.database.from('homepage_sections').update({ is_visible: !section.is_visible }).eq('id', section.id);
        setSections(sections.map(s => s.id === section.id ? { ...s, is_visible: !s.is_visible } : s));
    }

    function startEdit(section: Section) {
        setEditSection(section);
        setEditTitle(section.title || '');
        setEditSubtitle(section.subtitle || '');
        setEditImageUrl(section.image_url || '');
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        try {
            const ext = file.name.substring(file.name.lastIndexOf('.'));
            const filename = `homepage/${Date.now()}${ext}`;
            const { data, error } = await insforge.storage.from('media-library').upload(filename, file);
            if (error) throw error;
            if (data) setEditImageUrl(data.url);
        } catch (err: any) {
            alert('Upload failed: ' + err.message);
        } finally {
            setUploadingImage(false);
        }
    }

    async function saveEdit() {
        if (!editSection) return;
        await insforge.database.from('homepage_sections').update({ title: editTitle, subtitle: editSubtitle, image_url: editImageUrl }).eq('id', editSection.id);
        setSections(sections.map(s => s.id === editSection.id ? { ...s, title: editTitle, subtitle: editSubtitle, image_url: editImageUrl } : s));
        setEditSection(null);
    }

    async function addSection() {
        const { data } = await insforge.database.from('homepage_sections').insert({
            section_type: 'custom', title: 'New Section', subtitle: '', content: {}, sort_order: sections.length + 1, is_visible: true
        }).select();
        if (data) setSections([...sections, data[0]]);
    }

    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary" /></div>;

    return (
        <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Homepage Editor</h2>
                <a href="/" target="_blank" className="text-sm text-admin-primary hover:underline">Preview →</a>
            </div>

            <p className="text-sm text-gray-500">Manage the sections displayed on your store's homepage. Toggle visibility and edit content.</p>

            {/* Section List */}
            <div className="space-y-3">
                {sections.map((section) => (
                    <div key={section.id} className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${section.is_visible ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-60'}`}>
                        <div className="flex items-center gap-3">
                            <div className="cursor-grab text-gray-300 hover:text-gray-500">
                                <GripVertical size={18} />
                            </div>
                            <span className="text-xl">{sectionIcons[section.section_type] || '📄'}</span>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{section.title}</h3>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">{section.section_type.replace(/_/g, ' ')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => startEdit(section)} className="p-2 text-gray-400 hover:text-admin-primary hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => toggleVisibility(section)} className={`p-2 rounded-lg transition-colors ${section.is_visible ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                                    {section.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Edit Form Inline */}
                        {editSection?.id === section.id && (
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Section Title" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                                <input type="text" value={editSubtitle} onChange={(e) => setEditSubtitle(e.target.value)} placeholder="Subtitle" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-700">Section Image (Hero Banner / Promo)</label>
                                    <div className="flex items-center gap-3">
                                        {editImageUrl && (
                                            <img src={editImageUrl} alt="Section" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                                        )}
                                        <label className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                                            {uploadingImage ? 'Uploading...' : 'Upload Image'}
                                            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                                        </label>
                                        {editImageUrl && (
                                            <button onClick={() => setEditImageUrl('')} className="text-xs text-red-500 hover:underline">Remove</button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button onClick={saveEdit} className="btn-admin text-xs py-1.5">Save</button>
                                    <button onClick={() => setEditSection(null)} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5">Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button onClick={addSection} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-admin-primary hover:border-admin-primary/50 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                <Plus size={18} />
                Add New Section
            </button>
        </div>
    );
}
