'use client';

import {
  ImageIcon,
  MessageSquare,
  Plus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CommunityActionsProps {
  onDiscussion: () => void;
  onMedia: () => void;
}

export default function CommunityActions({
  onDiscussion,
  onMedia,
}: CommunityActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label="Create a community post"
          className="
            !flex
            !size-9
            shrink-0
            items-center
            justify-center
            rounded-full
            border-border/70
            bg-background
            p-0
            text-foreground
            shadow-sm
            transition-colors
            hover:bg-muted
            active:scale-95
            sm:size-9
          "
        >
          <Plus
            className="size-[18px]"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={5}
        className="
          z-50
          w-52
          rounded-lg
          border-border/70
          p-1
          shadow-md
        "
      >
        <DropdownMenuItem
          onSelect={onDiscussion}
          className="
            cursor-pointer
            gap-2
            rounded-md
            px-2.5
            py-2
            text-xs
            font-medium
          "
        >
          <MessageSquare
            className="
              size-3.5
              text-muted-foreground
            "
            aria-hidden="true"
          />

          <span>
            Start Argument
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={onMedia}
          className="
            cursor-pointer
            gap-2
            rounded-md
            px-2.5
            py-2
            text-xs
            font-medium
          "
        >
          <ImageIcon
            className="
              size-3.5
              text-muted-foreground
            "
            aria-hidden="true"
          />

          <span>
            Share Football Moments
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}