'use client';

import Link from 'next/link';

import {
  ChevronDown,
  LogOut,
  LayoutDashboard,
  User,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';

import { useAuth } from '@/providers/auth-provider';

export default function UserMenu() {
  const {
    user,
    logout,
    loading,
  } = useAuth();

  if (loading) {
    return null;
  }


  if (!user) {
    return (
      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        <Link
          href="/login"
          className="
            rounded-full
            px-3
            py-2
            text-sm
            font-medium
            text-muted-foreground
            transition-colors
            duration-200
            hover:bg-muted
            hover:text-foreground
          "
        >
          Login
        </Link>


        <Link
          href="/register"
          className="
            rounded-full
            bg-gradient-to-r
            from-indigo-500
            via-sky-500
            to-emerald-500
            px-4
            py-2
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition-all
            duration-300
            hover:opacity-90
            hover:shadow-md
          "
        >
          Register
        </Link>
      </div>
    );
  }


  const dashboard =
    user.role === 'admin'
      ? '/admin'
      : '/dashboard';


  return (
    <DropdownMenu>

      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="
            h-10
            rounded-full
            border
            border-border/50
            bg-background/40
            px-4
            backdrop-blur-md
            transition-all
            duration-200
            hover:bg-muted/60
          "
        >
          <span
            className="
              text-sm
              font-semibold
            "
          >
            {user.role === 'admin'
              ? 'Admin'
              : 'Dashboard'}
          </span>

          <ChevronDown
            className="
              ml-2
              h-4
              w-4
              text-muted-foreground
            "
          />
        </Button>
      </DropdownMenuTrigger>


      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="
          w-60
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


        <DropdownMenuItem
          asChild
          className="
            cursor-pointer
            rounded-xl
            py-2.5
          "
        >
          <Link
            href={dashboard}
            className="
              flex
              items-center
            "
          >
            <LayoutDashboard
              className="
                mr-3
                h-4
                w-4
                text-muted-foreground
              "
            />

            Dashboard
          </Link>
        </DropdownMenuItem>


        {user.role !== 'admin' && (
          <DropdownMenuItem
            asChild
            className="
              cursor-pointer
              rounded-xl
              py-2.5
            "
          >
            <Link
              href="/dashboard/profile"
              className="
                flex
                items-center
              "
            >
              <User
                className="
                  mr-3
                  h-4
                  w-4
                  text-muted-foreground
                "
              />

              Profile
            </Link>
          </DropdownMenuItem>
        )}


        <div
          className="
            my-2
            border-t
            border-border/50
          "
        />


        <DropdownMenuItem
          onClick={logout}
          className="
            cursor-pointer
            rounded-xl
            py-2.5
            text-destructive
            focus:bg-destructive/10
            focus:text-destructive
          "
        >
          <LogOut
            className="
              mr-3
              h-4
              w-4
              text-destructive
            "
          />

          Logout
        </DropdownMenuItem>

      </DropdownMenuContent>

    </DropdownMenu>
  );
}