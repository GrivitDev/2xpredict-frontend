'use client';

import {
  X,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Button,
} from '@/components/ui/button';

import CommunityGuidelinesContent from './CommunityGuidelinesContent';

interface CommunityGuidelinesDialogProps {
  open: boolean;

  onOpenChange: (
    open: boolean,
  ) => void;
}

export default function CommunityGuidelinesDialog({
  open,
  onOpenChange,
}: CommunityGuidelinesDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="
          flex
          h-[90dvh]
          w-full
          max-w-none
          flex-col
          gap-0
          self-end
          overflow-hidden
          rounded-t-2xl
          border-x-0
          border-b-0
          border-border
          bg-background
          p-0
          shadow-xl

          sm:h-[88dvh]
          sm:w-[94vw]
          sm:max-w-4xl
          sm:self-center
          sm:rounded-2xl
          sm:border
          sm:bg-card
        "
      >
        <DialogHeader
          className="
            flex
            shrink-0
            flex-row
            items-center
            justify-between
            border-b
            border-border
            bg-background/95
            px-3
            py-2.5
            backdrop-blur-sm

            sm:px-4
            sm:py-3
            sm:bg-card/95
          "
        >
          <DialogTitle
            className="
              text-base
              font-semibold
              tracking-tight
              text-foreground
              sm:text-lg
            "
          >
            Community Guidelines
          </DialogTitle>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() =>
              onOpenChange(false)
            }
            className="
              size-8
              shrink-0
              rounded-lg
              text-muted-foreground
              hover:bg-muted
              hover:text-foreground
              sm:size-9
            "
            aria-label="Close"
          >
            <X
              className="
                size-4
                sm:size-5
              "
            />
          </Button>
        </DialogHeader>

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            [scrollbar-width:thin]
          "
        >
          <CommunityGuidelinesContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}