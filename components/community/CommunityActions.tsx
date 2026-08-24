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
            !size-10
            shrink-0
            items-center
            justify-center
            rounded-full
            border-border
            bg-background
            text-foreground
            shadow-sm
            opacity-100
            transition-all
            hover:bg-muted
            active:scale-95
            sm:size-10
          "
        >
          <Plus
            className="
              !size-5
              shrink-0
              text-foreground
            "
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="
          z-50
          w-56
          rounded-xl
          p-1.5
        "
      >
        <DropdownMenuItem
          onSelect={onDiscussion}
          className="
            cursor-pointer
            gap-2
            rounded-lg
            px-3
            py-2.5
          "
        >
          <MessageSquare
            className="size-4 text-muted-foreground"
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
            rounded-lg
            px-3
            py-2.5
          "
        >
          <ImageIcon
            className="size-4 text-muted-foreground"
          />

          <span>
            Share Football Moments
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}