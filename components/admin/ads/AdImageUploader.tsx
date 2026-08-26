'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Upload,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import api from '@/lib/axios';
import { AdImage } from '@/types/ad';

interface AdImageUploaderProps {
  value?: AdImage;
  onChange: (image?: AdImage) => void;
}

export function AdImageUploader({
  value,
  onChange,
}: AdImageUploaderProps) {
  const [preview, setPreview] = useState(
    value?.url ?? '',
  );

  const [uploading, setUploading] = useState(false);

  async function uploadImage(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();

    formData.append('image', file);

    try {
      setUploading(true);

      const response = await api.post(
        '/uploads/ads',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const image: AdImage = response.data.data;

      setPreview(image.url);
      onChange(image);
    } catch {
      // Keep the existing image state intact if upload fails.
    } finally {
      setUploading(false);

      // Allow selecting the same file again.
      event.target.value = '';
    }
  }

  function removeImage() {
    setPreview('');
    onChange(undefined);
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">
            Advertisement Image
          </Label>

          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Upload the image displayed in the advertisement.
          </p>
        </div>

        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeImage}
            className="
              h-7
              px-2
              text-xs
              text-muted-foreground
              hover:bg-destructive/10
              hover:text-destructive
            "
          >
            <X className="mr-1 size-3.5" />
            Remove
          </Button>
        )}
      </div>

      {preview ? (
        <div
          className="
            relative
            h-40
            overflow-hidden
            rounded-lg
            border
            bg-muted/30
          "
        >
          <Image
            src={preview}
            alt="Advertisement preview"
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
          />
        </div>
      ) : (
        <label
          className={`
            flex
            h-28
            cursor-pointer
            items-center
            justify-center
            gap-3
            rounded-lg
            border
            border-dashed
            bg-muted/10
            px-4
            transition-colors
            hover:bg-muted/30
            ${uploading ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          <div
            className="
              flex
              size-9
              shrink-0
              items-center
              justify-center
              rounded-md
              border
              bg-background
              text-muted-foreground
              shadow-sm
            "
          >
            <Upload className="size-4" />
          </div>

          <div>
            <p className="text-xs font-medium">
              {uploading
                ? 'Uploading image...'
                : 'Click to upload image'}
            </p>

            <p className="mt-0.5 text-[10px] text-muted-foreground">
              PNG, JPG, WEBP
            </p>
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={uploadImage}
          />
        </label>
      )}
    </div>
  );
}