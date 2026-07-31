'use client';
import * as React from 'react';
import { Trash2, ImagePlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!fileArr.length) return;

    setUploading(true);
    try {
      const formData = new FormData();
      fileArr.forEach((f) => formData.append('images', f));

      const token = typeof window !== 'undefined' ? localStorage.getItem('re_token') : null;
      const res = await fetch(`${API}/api/upload/images`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const { urls } = await res.json();
      onChange([...images, ...urls]);
    } catch {
      toast({ title: 'Upload failed', description: 'Could not upload images. Try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    uploadFiles(e.dataTransfer.files);
  };

  const removeImage = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'}
          ${uploading ? 'pointer-events-none opacity-70' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImagePlus className="w-8 h-8" />
            <p className="text-sm font-medium">Click to upload or drag & drop</p>
            <p className="text-xs">PNG, JPG, WEBP · Max 5MB each · Multiple files supported</p>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border aspect-video bg-muted">
              <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="bg-destructive text-destructive-foreground rounded-md p-1.5 hover:bg-destructive/90"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {idx === 0 && (
                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
