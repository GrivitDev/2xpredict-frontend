'use client';

import { useState } from 'react';

import {
  ArrowLeft,
  MoreVertical,
  Search,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import CommunitySearch from './CommunitySearch';
import CommunityActions from './CommunityActions';
import CommunityGuidelinesDialog from './CommunityGuidelinesDialog';

interface CommunityHeaderProps {
  search: string;
  onSearch: (value: string) => void;
  onDiscussion: () => void;
  onMedia: () => void;
}

export default function CommunityHeader({
  search,
  onSearch,
  onDiscussion,
  onMedia,
}: CommunityHeaderProps) {
  const [searchMode, setSearchMode] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);

  return (
    <>
      <header
        className="
          fixed
          inset-x-0
          top-22
          z-40
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-8xl
            px-3
            sm:px-6
            lg:px-8
          "
        >
          {searchMode ? (
            <div
              className="
                flex
                h-12
                items-center
                gap-1
                md:hidden
              "
            >
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Close search"
                onClick={() => setSearchMode(false)}
                className="
                  size-8
                  shrink-0
                  rounded-lg
                "
              >
                <ArrowLeft className="size-4" />
              </Button>

              <div className="min-w-0 flex-1">
                <CommunitySearch
                  value={search}
                  onChange={onSearch}
                  autoFocus
                />
              </div>
            </div>
          ) : (
            <div
              className="
                relative
                flex
                h-12
                items-center
                justify-between
                gap-2
              "
            >
              {/* BRAND */}

              <div
                className="
                  min-w-0
                  flex-1
                "
              >
                <h1
                  className="
                    truncate
                    text-sm
                    font-semibold
                    tracking-tight
                    text-foreground
                    sm:text-base
                  "
                >
                  2XFOOTBALL Community
                </h1>
              </div>

              {/* DESKTOP SEARCH */}

              <div
                className="
                  absolute
                  left-1/2
                  hidden
                  w-full
                  max-w-md
                  -translate-x-1/2
                  md:block
                "
              >
                <CommunitySearch
                  value={search}
                  onChange={onSearch}
                />
              </div>

              {/* ACTIONS */}

              <div
                className="
                  flex
                  shrink-0
                  items-center
                  gap-0.5
                "
              >
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Search community"
                  className="
                    size-8
                    rounded-lg
                    md:hidden
                  "
                  onClick={() => setSearchMode(true)}
                >
                  <Search className="size-4" />
                </Button>

                <CommunityActions
                  onDiscussion={onDiscussion}
                  onMedia={onMedia}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="More community options"
                      className="
                        size-8
                        rounded-lg
                      "
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    sideOffset={6}
                    className="
                      w-48
                      rounded-lg
                      p-1
                    "
                  >
                    <DropdownMenuItem
                      onSelect={() =>
                        setGuidelinesOpen(true)
                      }
                      className="
                        cursor-pointer
                        rounded-md
                        px-2.5
                        py-2
                        text-sm
                      "
                    >
                      Community Guidelines
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </div>
      </header>

      <CommunityGuidelinesDialog
        open={guidelinesOpen}
        onOpenChange={setGuidelinesOpen}
      />
    </>
  );
}