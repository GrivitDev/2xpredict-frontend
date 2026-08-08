'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  Moon,
  Sun,
  Monitor,
  Check,
} from 'lucide-react';

import { useTheme } from 'next-themes';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';

export default function ThemeSwitcher() {
  const {
    theme,
    setTheme,
  } = useTheme();

  const [mounted, setMounted] =
    useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);


  if (!mounted) {
    return null;
  }


  const themes = [
    {
      name: 'Light',
      value: 'light',
      icon: Sun,
    },
    {
      name: 'Dark',
      value: 'dark',
      icon: Moon,
    },
    {
      name: 'System',
      value: 'system',
      icon: Monitor,
    },
  ];


  const ActiveIcon =
    theme === 'dark'
      ? Moon
      : theme === 'light'
        ? Sun
        : Monitor;


  return (
    <DropdownMenu>

      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="
            group
            h-10
            w-10
            rounded-xl
            border
            border-border/50
            bg-background/40
            p-0
            backdrop-blur-md
            transition-all
            duration-300
            hover:border-primary/30
            hover:bg-primary/10
          "
        >
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
              transition-transform
              duration-300
              group-hover:scale-110
            "
          >
            <ActiveIcon
              className="
                h-4
                w-4
              "
            />
          </span>
        </Button>
      </DropdownMenuTrigger>


      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="
          w-56
          rounded-2xl
          border
          border-border/50
          bg-background/90
          p-2
          shadow-lg
          backdrop-blur-xl
        "
      >

        <div
          className="
            mb-2
            h-px
            w-full
            bg-gradient-to-r
            from-indigo-500/30
            via-sky-500/30
            to-emerald-500/30
          "
        />


        {themes.map((item) => {

          const Icon = item.icon;

          const active =
            theme === item.value;


          return (
            <DropdownMenuItem
              key={item.value}
              onClick={() =>
                setTheme(item.value)
              }
              className="
                flex
                cursor-pointer
                items-center
                justify-between
                rounded-xl
                px-3
                py-2.5
                transition-all
                duration-200
                hover:bg-muted
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <span
                  className={`
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-xl

                    ${
                      active
                        ? `
                          bg-primary/10
                          text-primary
                        `
                        : `
                          bg-muted
                          text-muted-foreground
                        `
                    }
                  `}
                >
                  <Icon
                    className="
                      h-4
                      w-4
                    "
                  />
                </span>


                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  {item.name}
                </span>

              </div>


              {active && (
                <Check
                  className="
                    h-4
                    w-4
                    text-primary
                  "
                />
              )}

            </DropdownMenuItem>
          );

        })}

      </DropdownMenuContent>

    </DropdownMenu>
  );
}