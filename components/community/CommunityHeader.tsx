'use client';

import {
  useState,
} from 'react';

import Image from 'next/image';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';

import {
  ArrowLeft,
  MoreVertical,
  Search,
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

import CommunitySearch from './CommunitySearch';
import CommunityActions from './CommunityActions';
import CommunityGuidelinesDialog from './CommunityGuidelinesDialog';

import { cn } from '@/lib/utils';

import {
  useNavbar,
} from '../navbar/NavbarContext';


interface CommunityHeaderProps {
  search: string;
  onSearch: (
    value: string,
  ) => void;
  onDiscussion: () => void;
  onMedia: () => void;
}

export default function CommunityHeader({
  search,
  onSearch,
  onDiscussion,
  onMedia,
}: CommunityHeaderProps) {
  const [
    searchMode,
    setSearchMode,
  ] = useState(false);

  const [
    guidelinesOpen,
    setGuidelinesOpen,
  ] = useState(false);

  const { visible } =
  useNavbar();
  return (
    <>
<header
  className={cn(
    `
      fixed
      left-0
      right-0
      z-40
      transition-all
      duration-300
    `,
    visible
      ? 'top-18'
      : 'top-0',
  )}
>
<div
  className="
    mx-auto
    max-w-8xl
    px-8
    sm:px-8
  "
>

          <AnimatePresence
            mode="wait"
          >
            {searchMode ? (
              /* MOBILE SEARCH */

              <motion.div
                key="mobile-search"
                initial={{
                  opacity: 0,
                  y: -6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                transition={{
                  duration: 0.18,
                }}
                className="
                  flex
                  h-16
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
                  onClick={() =>
                    setSearchMode(false)
                  }
                  className="
                    shrink-0
                    rounded-full
                  "
                >
                  <ArrowLeft
                    className="size-5"
                    aria-hidden="true"
                  />
                </Button>

                <CommunitySearch
                  value={search}
                  onChange={onSearch}
                  autoFocus
                />
              </motion.div>
            ) : (
              /* MAIN HEADER */

              <motion.div
                key="header"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="
                  flex
                  h-16
                  items-center
                  justify-between
                  gap-3
                "
              >
                {/* BRAND */}

                <div
                  className="
                    flex
                    min-w-0
                    shrink-0
                    items-center
                    px-6
                  "
                >

                  <h1
                    className="
                      truncate
                      text-l
                      font-semibold
                      tracking-tight
                      text-foreground
                      sm:text-base
                    "
                  >
                    Football Community
                  </h1>
                </div>

                {/* DESKTOP SEARCH */}

                <div
                  className="
                    hidden
                    min-w-0
                    max-w-xl
                    flex-1
                    px-4
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
                      rounded-full
                      md:hidden
                    "
                    onClick={() =>
                      setSearchMode(true)
                    }
                  >
                    <Search
                      className="size-5"
                      aria-hidden="true"
                    />
                  </Button>

                  <CommunityActions
                    onDiscussion={
                      onDiscussion
                    }
                    onMedia={
                      onMedia
                    }
                  />

                  {/* MORE MENU */}

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                    >
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="More community options"
                        className="
                          rounded-full
                        "
                      >
                        <MoreVertical
                          className="size-5"
                          aria-hidden="true"
                        />
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

      {/* GUIDELINES DIALOG */}

      <CommunityGuidelinesDialog
        open={guidelinesOpen}
        onOpenChange={
          setGuidelinesOpen
        }
      />
    </>
  );
}