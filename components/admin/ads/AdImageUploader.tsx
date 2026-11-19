'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaUpload, FaXmark } from 'react-icons/fa6';
import api from '@/lib/axios';
import type { AdImage } from '@/types/ads';

interface AdImageUploaderProps {
  value?: AdImage;
  onChange: (image?: AdImage) => void;
}

export function AdImageUploader({ value, onChange }: AdImageUploaderProps) {
  const [preview, setPreview] = useState(value?.url ?? '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setPreview(value?.url ?? ''), [value?.url]);

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    const payload = new FormData();
    payload.append('image', file);
    try {
      setUploading(true);
      const response = await api.post('/uploads/ads', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploaded = response.data?.data as AdImage | undefined;
      if (!uploaded?.url || !uploaded.publicId) throw new Error('Upload response was incomplete.');
      setPreview(uploaded.url);
      onChange(uploaded);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Image upload failed.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  function removeImage() {
    setPreview('');
    setError('');
    onChange(undefined);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium">Creative image</span>
        {preview && (
          <button type="button" onClick={removeImage} className="inline-flex h-6 items-center gap-1 px-1.5 text-[10px] text-muted-foreground hover:text-destructive">
            <FaXmark className="size-3" /> Remove
          </button>
        )}
      </div>
      {preview ? (
        <div className="relative h-32 overflow-hidden rounded-sm border bg-muted/20">
          <Image src={preview} alt="Advertisement creative preview" fill sizes="(max-width: 768px) 100vw, 600px" className="object-contain" />
        </div>
      ) : (
        <label className={`flex h-20 cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed px-3 text-[11px] text-muted-foreground hover:bg-muted/30 ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
          <FaUpload className="size-3.5" />
          <span>{uploading ? 'Uploading…' : 'Upload image'} <span className="text-[10px]">· PNG, JPG, WEBP</span></span>
          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={uploading} onChange={uploadImage} />
        </label>
      )}
      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </div>
  );
}
