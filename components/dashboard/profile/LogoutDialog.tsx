'use client';

import {
  DoorOpen,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Button } from '@/components/ui/button';

import { useSessions } from '@/hooks/useSessions';

export default function LogoutDialog() {

  const {
    logoutCurrent,
    loggingOut,
  } = useSessions();

  async function handleLogout() {

    await logoutCurrent();

  }

  return (

    <AlertDialog>

      <AlertDialogTrigger asChild>

        <Button
          variant="outline"
          className="
            h-11
            w-full
            justify-start
            rounded-xl
            border-amber-500/30
            bg-amber-500/5
            text-amber-600
            shadow-sm
            transition-all
            duration-300
            hover:border-amber-500/50
            hover:bg-amber-500/10
            hover:text-amber-600
            dark:text-amber-400
          "
        >

          <LogOut className="mr-2 h-4 w-4" />

          Logout

        </Button>

      </AlertDialogTrigger>

      <AlertDialogContent
        className="
          overflow-hidden
          border-border/60
          bg-background/95
          p-0
          backdrop-blur-2xl
          sm:max-w-lg
        "
      >

        <div
          className="
            absolute
            -left-20
            -top-20
            h-52
            w-52
            rounded-full
            bg-amber-500/20
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-20
            -right-20
            h-52
            w-52
            rounded-full
            bg-orange-500/15
            blur-3xl
          "
        />

        <div className="relative">

          <AlertDialogHeader
            className="
              border-b
              border-border/50
              px-6
              py-6
            "
          >

            <div
              className="
                mb-4
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-amber-500
                via-orange-500
                to-yellow-500
                text-white
                shadow-xl
              "
            >

              <DoorOpen className="h-8 w-8" />

            </div>

            <AlertDialogTitle
              className="
                text-2xl
                font-bold
              "
            >

              Logout

            </AlertDialogTitle>

            <AlertDialogDescription
              className="
                mt-2
                space-y-3
                text-sm
                leading-relaxed
              "
            >

              <p>

                You're about to sign out of your
                account on this device.

              </p>

              <div
                className="
                  rounded-xl
                  border
                  border-amber-500/20
                  bg-amber-500/5
                  p-4
                "
              >

                <div className="flex items-start gap-3">

                  <ShieldCheck
                    className="
                      mt-0.5
                      h-5
                      w-5
                      text-amber-500
                    "
                  />

                  <div>

                    <p className="font-medium text-foreground">

                      Your account remains safe.

                    </p>

                    <p
                      className="
                        mt-1
                        text-muted-foreground
                      "
                    >

                      You can sign in again at any
                      time using your email and
                      password.

                    </p>

                  </div>

                </div>

              </div>

            </AlertDialogDescription>

          </AlertDialogHeader>

          <AlertDialogFooter
            className="
              flex-col-reverse
              gap-3
              px-6
              py-5
              sm:flex-row
              sm:justify-end
            "
          >

            <AlertDialogCancel
              className="
                h-11
                rounded-xl
              "
            >

              Stay Logged In

            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleLogout}
              disabled={loggingOut}
              className="
                h-11
                rounded-xl
                bg-gradient-to-r
                from-amber-500
                via-orange-500
                to-yellow-500
                text-white
                shadow-lg
                transition-all
                duration-300
                hover:scale-[1.02]
                hover:shadow-amber-500/30
                disabled:opacity-70
              "
            >

              <LogOut className="mr-2 h-4 w-4" />

              {loggingOut
                ? 'Logging out...'
                : 'Logout'}

            </AlertDialogAction>

          </AlertDialogFooter>

        </div>

      </AlertDialogContent>

    </AlertDialog>

  );

}