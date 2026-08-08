'use client';

import {
  ImageIcon,
  MessageSquare,
  Plus,
} from 'lucide-react';

import {
  Button,
} from '@/components/ui/button';

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
          size="icon"
          variant="outline"
          aria-label="Create a community post"
          className="
            size-10
            rounded-full
            border-border
            bg-background
            shadow-sm
            transition-all
            hover:bg-muted
            active:scale-95
          "
        >
          <Plus
            className="size-5"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="
          w-56
          rounded-xl
          p-1.5
        "
      >
        <DropdownMenuItem
          onClick={onDiscussion}
          className="
            cursor-pointer
            gap-2
            rounded-lg
            px-3
            py-2.5
          "
        >
          <MessageSquare
            className="
              size-4
              text-muted-foreground
            "
            aria-hidden="true"
          />

          <span>
            Start Argument
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onMedia}
          className="
            cursor-pointer
            gap-2
            rounded-lg
            px-3
            py-2.5
          "
        >
          <ImageIcon
            className="
              size-4
              text-muted-foreground
            "
            aria-hidden="true"
          />

          <span>
            Share FootBall Moments 
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}