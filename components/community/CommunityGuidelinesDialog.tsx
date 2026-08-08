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
          h-[92dvh]
          w-full
          max-w-none
          flex-col
          gap-0
          self-end
          overflow-hidden
          rounded-t-3xl
          border-x-0
          border-b-0
          border-t
          border-border
          bg-background
          p-0
          shadow-2xl

          sm:h-[90dvh]
          sm:w-[95vw]
          sm:max-w-5xl
          sm:self-center
          sm:rounded-3xl
          sm:border
          sm:bg-card
        "
      >
        {/* Header */}

        <DialogHeader
          className="
            sticky
            top-0
            z-20
            flex
            flex-row
            items-center
            justify-between
            border-b
            border-border
            bg-background/95
            px-4
            py-4
            backdrop-blur

            sm:bg-card/95
            sm:px-6
          "
        >
          <DialogTitle
            className="
              text-lg
              font-semibold
              text-foreground
              sm:text-xl
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
              h-9
              w-9
              rounded-full
            "
            aria-label="Close"
          >
            <X
              className="
                size-5
              "
            />
          </Button>
        </DialogHeader>

        {/* Scrollable Content */}

        <div
          className="
            flex-1
            overflow-y-auto
            overscroll-contain
          "
        >
          <CommunityGuidelinesContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}