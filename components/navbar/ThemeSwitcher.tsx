'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  Check,
  Monitor,
  Moon,
  Sparkles,
  Sun,
} from 'lucide-react';

import {
  useTheme,
} from 'next-themes';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Button,
} from '@/components/ui/button';


// ============================================================
// CONSTANTS
// ============================================================

const THEMES = [
  {
    name: 'Light',
    description: 'Bright interface',
    value: 'light',
    icon: Sun,
  },
  {
    name: 'Dark',
    description: 'Easy on the eyes',
    value: 'dark',
    icon: Moon,
  },
  {
    name: 'System',
    description: 'Follow device settings',
    value: 'system',
    icon: Monitor,
  },
] as const;


// ============================================================
// COMPONENT
// ============================================================

export default function ThemeSwitcher() {

  const {
    theme,
    setTheme,
  } = useTheme();

  const [
    mounted,
    setMounted,
  ] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);


  if (!mounted) {
    return null;
  }


  const activeTheme =
    THEMES.find(
      item => item.value === theme,
    ) ?? THEMES[2];

  const ActiveIcon =
    activeTheme.icon;


  return (

    <DropdownMenu>

      {/* TRIGGER */}

      <DropdownMenuTrigger asChild>

        <Button
          variant="ghost"
          aria-label="Change theme"
          className="
            group
            relative
            h-10
            w-10
            rounded-xl
            border
            border-border
            bg-card
            p-0
            shadow-sm
            transition-all
            duration-300
            hover:border-primary/30
            hover:bg-secondary
            hover:shadow-md
            focus-visible:border-primary
            focus-visible:ring-2
            focus-visible:ring-primary/20
          "
        >

          <span
            className="
              absolute
              bottom-0
              left-1/2
              h-0.5
              w-5
              -translate-x-1/2
              rounded-full
              bg-gold
              opacity-60
              transition-all
              duration-300
              group-hover:w-7
              group-hover:opacity-100
            "
          />

          <span
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              bg-primary/10
              text-primary
              transition-all
              duration-300
              group-hover:scale-105
              group-hover:bg-primary/15
            "
          >
            <ActiveIcon
              className="
                h-4
                w-4
                transition-transform
                duration-300
                group-hover:rotate-6
              "
            />
          </span>

        </Button>

      </DropdownMenuTrigger>


      {/* DROPDOWN */}

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="
          w-[250px]
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-popover
          p-2
          text-popover-foreground
          shadow-2xl
          shadow-black/10
          dark:shadow-black/40
        "
      >

        {/* HEADER */}

        <div
          className="
            relative
            mb-1
            overflow-hidden
            rounded-xl
            border
            border-border
            bg-secondary/60
            px-3
            py-3
          "
        >

          <div
            className="
              pointer-events-none
              absolute
              -right-8
              -top-8
              h-20
              w-20
              rounded-full
              bg-primary/10
              blur-2xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              bottom-0
              left-0
              h-px
              w-20
              bg-gradient-to-r
              from-gold
              to-transparent
            "
          />

          <div
            className="
              relative
              flex
              items-center
              gap-3
            "
          >

            <span
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-primary/15
                bg-primary/10
                text-primary
              "
            >
              <Sparkles className="h-4 w-4" />
            </span>

            <div className="min-w-0">

              <p
                className="
                  text-s
                  font-bold
                  text-foreground
                "
              >
                Appearance
              </p>

              <p
                className="
                  mt-0.5
                  text-[11px]
                  text-muted-foreground
                "
              >
                Choose your preferred theme
              </p>

            </div>

          </div>

        </div>


        {/* OPTIONS */}

        <div className="space-y-1">

          {THEMES.map(item => {

            const Icon = item.icon;

            const active =
              theme === item.value;

            return (

              <DropdownMenuItem
                key={item.value}
                onClick={() =>
                  setTheme(item.value)
                }
                className={`
                  group
                  cursor-pointer
                  rounded-xl
                  border
                  p-2
                  outline-none
                  transition-all
                  duration-200
                  ${
                    active
                      ? `
                        border-primary/20
                        bg-primary/10
                        text-foreground
                      `
                      : `
                        border-transparent
                        text-foreground
                        hover:border-border
                        hover:bg-secondary
                        focus:bg-secondary
                        data-[highlighted]:bg-secondary
                        data-[highlighted]:text-foreground
                      `
                  }
                `}
              >

                {/* ICON */}

                <span
                  className={`
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    transition-all
                    duration-200
                    ${
                      active
                        ? `
                          border-primary/20
                          bg-primary/10
                          text-primary
                        `
                        : `
                          border-border
                          bg-secondary
                          text-muted-foreground
                          group-hover:text-foreground
                        `
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                </span>


                {/* TEXT */}

                <div
                  className="
                    ml-3
                    min-w-0
                    flex-1
                  "
                >

                  <span
                    className="
                      block
                      text-s
                      font-semibold
                      text-foreground
                    "
                  >
                    {item.name}
                  </span>

                  <span
                    className="
                      mt-0.5
                      block
                      text-[11px]
                      text-muted-foreground
                    "
                  >
                    {item.description}
                  </span>

                </div>


                {/* ACTIVE */}

                {active && (

                  <span
                    className="
                      ml-2
                      flex
                      h-6
                      w-6
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-primary
                      text-primary-foreground
                    "
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>

                )}

              </DropdownMenuItem>

            );

          })}

        </div>


        {/* CURRENT THEME */}

        <div
          className="
            mt-2
            flex
            items-center
            justify-between
            border-t
            border-border
            px-2
            pt-2
          "
        >

          <span
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-muted-foreground
            "
          >
            Current
          </span>

          <span
            className="
              rounded-md
              bg-secondary
              px-2
              py-1
              text-[10px]
              font-semibold
              text-foreground
            "
          >
            {activeTheme.name}
          </span>

        </div>

      </DropdownMenuContent>

    </DropdownMenu>

  );
}