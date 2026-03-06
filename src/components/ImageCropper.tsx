import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../lib/cropImage';
import { X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageCropperProps {
    imageSrc: string;
    onCropDone: (croppedFile: File) => void;
    onCancel: () => void;
    aspectRatio?: number;
}

export default function ImageCropper({ imageSrc, onCropDone, onCancel, aspectRatio = 1 }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (!croppedImageBlob) throw new Error('Failed to crop image');

            // Convert Blob to File so it works with the existing upload logic
            const croppedFile = new File([croppedImageBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
            onCropDone(croppedFile);
        } catch (e: any) {
            console.error(e);
            toast.error('Error cropping image. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in text-white">
            <div className="w-full max-w-2xl bg-[#1a1a24] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh] sm:h-auto sm:aspect-[4/5] max-h-[800px]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                    <h3 className="font-display font-bold text-lg">Crop Image</h3>
                    <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Cropper UI */}
                <div className="relative flex-1 w-full bg-black/50">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspectRatio}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        classes={{
                            containerClassName: 'absolute inset-0',
                            mediaClassName: 'max-h-full max-w-full'
                        }}
                    />
                </div>

                {/* Controls & Save */}
                <div className="p-6 shrink-0 bg-[#1a1a24] border-t border-white/10 space-y-6">
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-2 font-medium">
                            <span>Zoom</span>
                            <span>{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-blush-400 focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            disabled={isSaving}
                            className="flex-1 py-3 px-4 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 py-3 px-4 rounded-xl font-bold bg-blush-500 hover:bg-blush-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blush-500/20 disabled:opacity-50"
                        >
                            {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={18} /> Apply Crop</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
