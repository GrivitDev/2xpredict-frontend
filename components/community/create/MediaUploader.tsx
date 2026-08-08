'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Image as ImageIcon,
  Upload,
  Video,
  X,
} from 'lucide-react';

import {
  Button,
} from '@/components/ui/button';

import {
  toast,
} from 'sonner';

interface Props {

  onFileSelected: (
    file: File | undefined,
  ) => void;

  disabled?: boolean;

}

const MAX_MEDIA_SIZE =
  20 * 1024 * 1024;


export default function MediaUploader({

  onFileSelected,

  disabled = false,

}: Props) {


  const fileInputRef =
    useRef<HTMLInputElement>(
      null,
    );


  const previewUrlRef =
    useRef<
      string | undefined
    >(
      undefined,
    );


  const [
    preview,
    setPreview,
  ] = useState<string>();


  const [
    mediaType,
    setMediaType,
  ] = useState<
    'image' | 'video'
  >();


  function clearPreview() {

    if (
      previewUrlRef.current
    ) {

      URL.revokeObjectURL(
        previewUrlRef.current,
      );

      previewUrlRef.current =
        undefined;

    }


    setPreview(
      undefined,
    );

    setMediaType(
      undefined,
    );

  }


  useEffect(() => {

    return () => {

      if (
        previewUrlRef.current
      ) {

        URL.revokeObjectURL(
          previewUrlRef.current,
        );

      }

    };

  }, []);


  function handleFile(
    event:
      React.ChangeEvent<
        HTMLInputElement
      >,
  ) {

    const file =
      event.target.files?.[0];


    if (!file) {

      return;

    }


    if (
      !file.type.startsWith(
        'image/',
      ) &&
      !file.type.startsWith(
        'video/',
      )
    ) {

      toast.error(
        'Only images and videos are allowed.',
      );

      event.target.value =
        '';

      return;

    }


    if (
      file.size >
      MAX_MEDIA_SIZE
    ) {

      toast.error(
        'Media size cannot exceed 20MB.',
      );

      event.target.value =
        '';

      return;

    }


    const type =
      file.type.startsWith(
        'image/',
      )
        ? 'image'
        : 'video';


    const localPreview =
      URL.createObjectURL(
        file,
      );


    if (
      previewUrlRef.current
    ) {

      URL.revokeObjectURL(
        previewUrlRef.current,
      );

    }


    previewUrlRef.current =
      localPreview;


    setPreview(
      localPreview,
    );


    setMediaType(
      type,
    );


    onFileSelected(
      file,
    );

  }


  function removeMedia() {

    clearPreview();


    onFileSelected(
      undefined,
    );


    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        '';

    }

  }


  return (

    <div
      className="
        w-full
        space-y-3
      "
    >

      {
        preview &&
        mediaType && (

          <div
            className="
              relative
              overflow-hidden
              rounded-xl
              border
              border-border
              bg-muted/30
              shadow-sm
            "
          >

            {
              mediaType ===
              'image'

                ? (

                  <img
                    src={
                      preview
                    }
                    alt="
                      Selected media preview
                    "
                    className="
                      block
                      h-auto
                      max-h-[500px]
                      w-full
                      object-contain
                    "
                  />

                )

                : (

                  <video
                    src={
                      preview
                    }
                    controls
                    playsInline
                    className="
                      block
                      max-h-[500px]
                      w-full
                      object-contain
                    "
                  />

                )
            }


            <Button
              type="button"
              size="icon"
              variant="destructive"
              disabled={
                disabled
              }
              onClick={
                removeMedia
              }
              aria-label="
                Remove selected media
              "
              className="
                absolute
                right-3
                top-3
                size-9
                rounded-full
                shadow-sm
              "
            >

              <X
                className="
                  size-4
                "
                aria-hidden={true}
              />

            </Button>

          </div>

        )
      }


      <input
        ref={
          fileInputRef
        }
        hidden
        type="file"
        accept="
          image/*,
          video/*
        "
        onChange={
          handleFile
        }
        disabled={
          disabled
        }
      />


      <Button
        type="button"
        variant="outline"
        disabled={
          disabled
        }
        onClick={() =>
          fileInputRef
            .current
            ?.click()
        }
        className="
          h-11
          w-full
          gap-2
          rounded-xl
          border-border
          bg-background/60
          text-sm
          font-medium
          shadow-sm
          transition-colors
          hover:bg-muted
          sm:h-12
          sm:text-base
        "
      >

        {
          mediaType ===
          'video'

            ? (

              <Video
                className="
                  size-4
                  sm:size-[18px]
                "
                aria-hidden="true"
              />

            )

            : (

              <ImageIcon
                className="
                  size-4
                  sm:size-[18px]
                "
                aria-hidden="true"
              />

            )
        }


        <span>
          {
            preview
              ? 'Change Match Media'
              : 'Choose Match Media'
          }
        </span>


        <Upload
          className="
            size-4
            text-muted-foreground
          "
          aria-hidden="true"
        />

      </Button>


      <p
        className="
          text-center
          text-xs
          text-muted-foreground
        "
      >
        Images or videos up to 20MB
      </p>


      <div
        className="
          sr-only
        "
        aria-live="polite"
      >

        {
          preview
            ? 'Media selected and ready to post.'
            : 'No media selected.'
        }

      </div>

    </div>

  );

}