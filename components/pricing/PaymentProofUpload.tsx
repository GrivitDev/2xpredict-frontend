'use client';

import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, ImagePlus, Loader2 } from 'lucide-react';

import { uploadService } from '@/services/uploads.service';

interface PaymentProofUploadProps {
  onUpload: (data: {
    url: string;
    publicId: string;
  }) => void;
  onClear?: () => void;
}

export default function PaymentProofUpload({
  onUpload,
  onClear,
}: PaymentProofUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      event.target.value = '';
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await uploadService.uploadPaymentProof(file);
      setFileName(file.name);
      onUpload({ url: result.url, publicId: result.publicId });
    } catch (uploadError) {
      console.error('Payment proof upload failed', uploadError);
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  }

  return (
    <section className="rounded-xl border border-border/70 bg-card/70 p-3">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : fileName ? <CheckCircle2 className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-bold text-foreground">Payment proof</h3>
          <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
            Upload a clear screenshot or image of your transfer confirmation.
          </p>
          {fileName && (
            <p className="mt-1 truncate text-xs font-medium text-emerald-600" title={fileName}>
              {fileName}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-xs font-bold text-primary transition hover:border-primary/50 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading proof…
          </>
        ) : (
          <>
            <ImagePlus className="h-4 w-4" />
            {fileName ? 'Choose a different image' : 'Upload payment screenshot'}
          </>
        )}
      </button>

      {fileName && onClear ? (
        <button
          type="button"
          onClick={() => { setFileName(''); setError(''); onClear(); }}
          disabled={loading}
          className="mt-2 text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground disabled:opacity-50"
        >Remove uploaded proof</button>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleUpload}
      />

      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-2.5 text-xs leading-4 text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </section>
  );
}

