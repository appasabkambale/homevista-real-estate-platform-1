import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  X, 
  Star, 
  MoveLeft, 
  MoveRight, 
  Image as ImageIcon, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  GripVertical,
  Link as LinkIcon,
  Sparkles
} from 'lucide-react';
import { storage, storageRef, uploadBytesResumable, getDownloadURL } from '../lib/firebase';
import { PHOTO_PRESETS } from '../data/initialProperties';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
  userId?: string;
}

interface UploadingFile {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  errorMsg?: string;
  downloadUrl?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxFiles = 12,
  userId = 'anonymous'
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'presets'>('upload');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to convert file to compressed data URL as a seamless fallback
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Upload a single file to Firebase Storage with resilient fallback
  const uploadSingleFile = async (uploadItem: UploadingFile) => {
    const file = uploadItem.file;
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `properties/${userId}_${Date.now()}_${sanitizedName}`;

    try {
      // 1. Attempt upload to Firebase Storage
      const fileRef = storageRef(storage, filename);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadingFiles((prev) =>
            prev.map((item) =>
              item.id === uploadItem.id ? { ...item, progress } : item
            )
          );
        },
        async (error) => {
          console.warn('Firebase Storage upload failed, utilizing resilient offline image fallback:', error);
          // Fallback to compressed high-res data URL
          const fallbackDataUrl = await fileToDataUrl(file);
          
          setUploadingFiles((prev) =>
            prev.filter((item) => item.id !== uploadItem.id)
          );

          onChange([...images, fallbackDataUrl]);
        },
        async () => {
          // Success from Firebase Storage
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadingFiles((prev) =>
              prev.filter((item) => item.id !== uploadItem.id)
            );
            onChange([...images, downloadUrl]);
          } catch (e) {
            console.warn('Error getting download URL, using data URL fallback:', e);
            const fallbackDataUrl = await fileToDataUrl(file);
            setUploadingFiles((prev) =>
              prev.filter((item) => item.id !== uploadItem.id)
            );
            onChange([...images, fallbackDataUrl]);
          }
        }
      );
    } catch (err) {
      console.warn('Storage initialization fallback:', err);
      const fallbackDataUrl = await fileToDataUrl(file);
      setUploadingFiles((prev) =>
        prev.filter((item) => item.id !== uploadItem.id)
      );
      onChange([...images, fallbackDataUrl]);
    }
  };

  // Process selected or dropped files
  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const validFiles: File[] = [];
      const currentTotal = images.length + uploadingFiles.length;

      Array.from(files).forEach((file) => {
        if (!file.type.startsWith('image/')) return;
        if (currentTotal + validFiles.length >= maxFiles) return;
        validFiles.push(file);
      });

      if (validFiles.length === 0) return;

      const newUploads: UploadingFile[] = validFiles.map((file) => ({
        id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: 'uploading'
      }));

      setUploadingFiles((prev) => [...prev, ...newUploads]);

      newUploads.forEach((uploadItem) => {
        uploadSingleFile(uploadItem);
      });
    },
    [images, uploadingFiles, maxFiles, userId]
  );

  // Drag & Drop handlers for dropzone
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      // Reset input value so same files can be re-selected if removed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Reordering handlers
  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    onChange(newImages);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newImages = [...images];
    const [moved] = newImages.splice(index, 1);
    newImages.splice(targetIndex, 0, moved);
    onChange(newImages);
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  // Drag to reorder individual thumbnails
  const handleThumbDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // set drag image or data
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleThumbDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleThumbDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedItem);
    onChange(newImages);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleAddCustomUrl = () => {
    const url = customUrlInput.trim();
    if (!url) return;
    if (images.length >= maxFiles) return;

    onChange([...images, url]);
    setCustomUrlInput('');
  };

  const handleSelectPreset = (url: string) => {
    if (images.length >= maxFiles) return;
    onChange([...images, url]);
  };

  return (
    <div className="space-y-3.5">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-800">
            Property Photos & Gallery ({images.length}/{maxFiles})
          </label>
          <p className="text-[11px] text-slate-500">
            Drag to reorder. The first photo is the primary listing cover.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Presets & URL</span>
          </button>
        </div>
      </div>

      {activeTab === 'upload' && (
        <>
          {/* Dropzone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
              isDraggingOver
                ? 'border-emerald-500 bg-emerald-50/80 scale-[1.01]'
                : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/80 bg-slate-50/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png, image/jpeg, image/webp, image/heic, image/avif"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-xs">
              <Upload className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                Click or drag & drop photos here
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                PNG, JPG, WEBP up to 10MB • Upload multiple images simultaneously
              </p>
            </div>
          </div>
        </>
      )}

      {activeTab === 'presets' && (
        <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
          {/* Curated Presets */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
              Choose from High-Resolution Architecture Presets
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {PHOTO_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectPreset(preset.url)}
                  disabled={images.length >= maxFiles}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-600 transition-all cursor-pointer disabled:opacity-50"
                  title={`Add ${preset.label}`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Plus className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Direct URL Input */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-700 block mb-1">
              Or paste an Image URL
            </span>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomUrl();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomUrl}
                disabled={!customUrlInput.trim() || images.length >= maxFiles}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Add URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uploading Files Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((up) => (
            <div
              key={up.id}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3"
            >
              <img
                src={up.previewUrl}
                alt="Preview"
                className="w-10 h-10 rounded-lg object-cover bg-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800 truncate">
                    {up.file.name}
                  </span>
                  <span className="font-bold text-emerald-700 ml-2">
                    {up.progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-200"
                    style={{ width: `${up.progress}%` }}
                  />
                </div>
              </div>
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Gallery Thumbnails Grid with Drag-to-Reorder */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
          {images.map((imgUrl, index) => {
            const isCover = index === 0;
            const isBeingDragged = draggedIndex === index;
            const isDragTarget = dragOverIndex === index;

            return (
              <div
                key={`${imgUrl}_${index}`}
                draggable
                onDragStart={(e) => handleThumbDragStart(e, index)}
                onDragOver={(e) => handleThumbDragOver(e, index)}
                onDrop={(e) => handleThumbDrop(e, index)}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                className={`group relative rounded-2xl overflow-hidden border-2 bg-slate-100 transition-all select-none ${
                  isCover 
                    ? 'border-emerald-600 ring-2 ring-emerald-500/30' 
                    : 'border-slate-200 hover:border-slate-300'
                } ${isBeingDragged ? 'opacity-30 scale-95' : 'opacity-100'} ${
                  isDragTarget ? 'border-emerald-500 scale-102 shadow-lg ring-2 ring-emerald-400' : ''
                }`}
              >
                <div className="aspect-[4/3] w-full relative">
                  <img
                    src={imgUrl}
                    alt={`Property Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
                    {isCover && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-700/95 backdrop-blur-xs text-white text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-white" />
                        Cover
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-900/70 backdrop-blur-xs text-white text-[9px] font-bold">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Drag Handle Indicator */}
                  <div className="absolute top-2 right-2 p-1 rounded-md bg-slate-900/60 backdrop-blur-xs text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="absolute bottom-2 right-2 p-1.5 rounded-xl bg-red-600/90 text-white hover:bg-red-700 transition-colors shadow-md cursor-pointer opacity-0 group-hover:opacity-100 z-10"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Action Bar (Set Cover, Move Left, Move Right) */}
                  <div className="absolute inset-x-2 bottom-2 bg-slate-950/85 backdrop-blur-md rounded-xl p-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10 mr-8">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(index)}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-amber-300 hover:text-amber-200 hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-0.5"
                        title="Set as Primary Cover"
                      >
                        <Star className="w-2.5 h-2.5" />
                        <span>Cover</span>
                      </button>
                    )}

                    <div className="flex items-center gap-0.5 ml-auto">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'left')}
                        className="p-1 rounded-lg text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Left"
                      >
                        <MoveLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={index === images.length - 1}
                        onClick={() => handleMove(index, 'right')}
                        className="p-1 rounded-lg text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Right"
                      >
                        <MoveRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add more button in the grid if not at max */}
          {images.length < maxFiles && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-600 hover:bg-emerald-50/30 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-700 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[11px] font-bold">Add Photo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-800 font-medium">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>At least one photo is required to publish the listing.</span>
        </div>
      )}
    </div>
  );
};
