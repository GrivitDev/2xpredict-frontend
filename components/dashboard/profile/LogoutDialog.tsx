'use client';

import {
  DoorOpen,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { Button } from '@/components/ui/button';
import { useSessions } from '@/hooks/useSessions';

export default function LogoutDialog() {
  const { logoutCurrent, loggingOut } = useSessions();

  const handleLogout = async () => {
    await logoutCurrent();
  };

  const handleCancel = () => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape' }),
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="
            h-9 rounded-lg border-amber-500/20
            bg-amber-500/[0.04] px-3 text-s
            font-semibold text-amber-600 shadow-none
            transition-all duration-200
            hover:border-amber-500/35
            hover:bg-amber-500/[0.08]
            hover:text-amber-600
            dark:text-amber-400
            dark:hover:text-amber-300
          "
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="
          mx-auto w-full max-w-lg overflow-hidden
          rounded-t-2xl border-border/70
          bg-background p-0 shadow-2xl
        "
      >
        <div
          className="
            pointer-events-none absolute -left-20 -top-20
            h-48 w-48 rounded-full
            bg-amber-500/10 blur-3xl
          "
        />

        <div
          className="
            pointer-events-none absolute -bottom-24 -right-20
            h-52 w-52 rounded-full
            bg-orange-500/[0.07] blur-3xl
          "
        />

        <div className="relative">
          <SheetHeader
            className="
              border-b border-border/50
              px-6 py-5 text-left
            "
          >
            <div
              className="
                mb-4 flex h-11 w-11 items-center
                justify-center rounded-xl
                border border-amber-500/20
                bg-amber-500/10 text-amber-500
              "
            >
              <DoorOpen className="h-5 w-5" />
            </div>

            <SheetTitle className="text-lg font-bold tracking-tight">
              Sign out of your account?
            </SheetTitle>

            <SheetDescription
              className="
                mt-1.5 max-w-sm
                text-s leading-relaxed
              "
            >
              You will be signed out of your current session on this
              device. Your account and data will remain intact.
            </SheetDescription>
          </SheetHeader>

          <div className="px-6 py-4">
            <div
              className="
                flex items-start gap-3 rounded-xl
                border border-amber-500/15
                bg-amber-500/[0.04] px-3.5 py-3
              "
            >
              <div
                className="
                  flex h-8 w-8 shrink-0 items-center
                  justify-center rounded-lg
                  bg-amber-500/10 text-amber-500
                "
              >
                <ShieldCheck className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-s font-semibold">
                  Your account remains secure
                </p>

                <p
                  className="
                    mt-1 text-xs leading-relaxed
                    text-muted-foreground
                  "
                >
                  You can sign in again whenever you need using your
                  account credentials.
                </p>
              </div>
            </div>
          </div>

          <SheetFooter
            className="
              flex flex-col-reverse gap-2
              border-t border-border/50
              px-6 py-4
              sm:flex-row sm:justify-end
            "
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="
                h-10 rounded-lg border-border/60
                px-4 text-s font-medium shadow-none
              "
            >
              Stay Logged In
            </Button>

            <Button
              type="button"
              disabled={loggingOut}
              onClick={handleLogout}
              className="
                h-10 rounded-lg bg-amber-500
                px-4 text-s font-semibold text-white
                shadow-sm transition-all
                hover:bg-amber-600 hover:shadow-md
                disabled:pointer-events-none
                disabled:opacity-60
              "
            >
              <LogOut className="mr-2 h-4 w-4" />

              {loggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}