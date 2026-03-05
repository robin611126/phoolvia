import { useEffect, useState } from 'react';
import { insforge } from '../../lib/insforge';
import { Upload, Search, Image, Trash2, Copy, X } from 'lucide-react';

interface Media {
    id: string;
    filename: string;
    url: string;
    key: string;
    mime_type: string;
    size_bytes: number;
    category: string;
    created_at: string;
}

export default function MediaLibraryPage() {
    const [media, setMedia] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState<Media | null>(null);

    useEffect(() => { loadMedia(); }, []);

    async function loadMedia() {
        const { data } = await insforge.database.from('media').select('*').order('created_at', { ascending: false });
        setMedia(data || []);
        setLoading(false);
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files) return;
        setUploading(true);
        for (const file of Array.from(files)) {
            const { data, error } = await insforge.storage.from('media-library').uploadAuto(file);
            if (data && !error) {
                const mediaRecord = {
                    filename: file.name,
                    url: data.url,
                    key: data.key,
                    bucket: 'media-library',
                    mime_type: data.mimeType,
                    size_bytes: data.size,
                    category: file.type.startsWith('image/') ? 'images' : 'other',
                };
                await insforge.database.from('media').insert(mediaRecord);
            }
        }
        setUploading(false);
        loadMedia();
    }

    async function deleteMedia(item: Media) {
        if (!confirm('Delete this file?')) return;
        await insforge.storage.from('media-library').remove(item.key);
        await insforge.database.from('media').delete().eq('id', item.id);
        setMedia(media.filter(m => m.id !== item.id));
        if (selected?.id === item.id) setSelected(null);
    }

    function copyUrl(url: string) {
        navigator.clipboard.writeText(url);
        alert('URL copied!');
    }

    const filtered = media.filter(m => {
        const matchesSearch = m.filename.toLowerCase().includes(search.toLowerCase());
        if (filter === 'all') return matchesSearch;
        return matchesSearch && m.category === filter;
    });

    const formatSize = (bytes: number) => bytes < 1024 ? `${bytes}B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)}KB` : `${(bytes / 1048576).toFixed(1)}MB`;

    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary" /></div>;

    return (
        <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Media Library</h2>
                <label className="btn-admin flex items-center gap-2 cursor-pointer">
                    <Upload size={16} />
                    Upload
                    <input type="file" multiple accept="image/*,video/*,.pdf" onChange={handleUpload} className="hidden" />
                </label>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/30" />
            </div>

            <div className="flex gap-2">
                {['all', 'images', 'banners', 'other'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-admin-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {uploading && (
                <div className="flex items-center gap-2 text-sm text-admin-primary"><div className="w-4 h-4 border-2 border-admin-primary/30 border-t-admin-primary rounded-full animate-spin" />Uploading files...</div>
            )}

            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <Image className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No media files uploaded yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                    {filtered.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelected(item)}
                            className={`relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer group border-2 transition-all ${selected?.id === item.id ? 'border-admin-primary' : 'border-transparent hover:border-gray-200'}`}
                        >
                            {item.mime_type?.startsWith('image/') ? (
                                <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-2">
                                    <Image size={24} className="text-gray-400" />
                                    <span className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">{item.filename}</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Panel */}
            {selected && (
                <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 shadow-lg z-20">
                    <div className="flex items-center gap-4 max-w-4xl mx-auto">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {selected.mime_type?.startsWith('image/') ? <img src={selected.url} alt="" className="w-full h-full object-cover" /> : <Image className="w-full h-full p-2 text-gray-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{selected.filename}</p>
                            <p className="text-xs text-gray-500">{formatSize(selected.size_bytes)} • {new Date(selected.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                        <button onClick={() => copyUrl(selected.url)} className="p-2 text-gray-500 hover:text-admin-primary hover:bg-blue-50 rounded-lg" title="Copy URL"><Copy size={18} /></button>
                        <button onClick={() => deleteMedia(selected)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 size={18} /></button>
                        <button onClick={() => setSelected(null)} className="p-2 text-gray-500 hover:text-gray-700"><X size={18} /></button>
                    </div>
                </div>
            )}
        </div>
    );
}
