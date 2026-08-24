'use client';

import { useState } from 'react';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';

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
          left-0
          right-0
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
          <AnimatePresence mode="wait">
            {searchMode ? (
              /* MOBILE SEARCH */
              <motion.div
                key="mobile-search"
                initial={{
                  opacity: 0,
                  y: -4,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -4,
                }}
                transition={{
                  duration: 0.18,
                }}
                className="
                  flex
                  h-14
                  items-center
                  gap-2
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
                    size-9
                    shrink-0
                    rounded-full
                  "
                >
                  <ArrowLeft className="size-5" />
                </Button>

                <div className="min-w-0 flex-1">
                  <CommunitySearch
                    value={search}
                    onChange={onSearch}
                    autoFocus
                  />
                </div>
              </motion.div>
            ) : (
              /* MAIN HEADER */
              <motion.div
                key="header"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="
                  flex
                  h-14
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
                      text-s
                      font-bold
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
                  max-w-xl
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
                    gap-1
                  "
                >
                  {/* MOBILE SEARCH */}

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Search community"
                    className="
                      size-9
                      rounded-full
                      md:hidden
                    "
                    onClick={() => setSearchMode(true)}
                  >
                    <Search className="size-5" />
                  </Button>

                  {/* CREATE POST */}

                  <CommunityActions
                    onDiscussion={onDiscussion}
                    onMedia={onMedia}
                  />

                  {/* MORE */}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="More community options"
                        className="
                          size-9
                          rounded-full
                        "
                      >
                        <MoreVertical className="size-5" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="
                        w-52
                        rounded-xl
                        p-1.5
                      "
                    >
                      <DropdownMenuItem
                        onSelect={() =>
                          setGuidelinesOpen(true)
                        }
                        className="
                          cursor-pointer
                          rounded-lg
                          px-3
                          py-2.5
                        "
                      >
                        Community Guidelines
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <CommunityGuidelinesDialog
        open={guidelinesOpen}
        onOpenChange={setGuidelinesOpen}
      />
    </>
  );
}