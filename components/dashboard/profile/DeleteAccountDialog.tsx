'use client';

import {
  AlertTriangle,
  Trash2,
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

import { useProfile } from '@/hooks/useProfile';

export default function DeleteAccountDialog() {

  const {
    deleteAccount,
    deleting,
  } = useProfile();

  async function handleDelete() {
    await deleteAccount();
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
            border-red-500/30
            bg-red-500/5
            text-red-600
            shadow-sm
            transition-all
            duration-300
            hover:border-red-500/50
            hover:bg-red-500/10
            hover:text-red-600
            dark:text-red-400
          "
        >

          <Trash2 className="mr-2 h-4 w-4" />

          Delete Account

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
            -left-16
            -top-16
            h-44
            w-44
            rounded-full
            bg-red-500/20
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-16
            -right-16
            h-44
            w-44
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
                from-red-500
                via-red-600
                to-orange-500
                text-white
                shadow-lg
              "
            >

              <AlertTriangle className="h-8 w-8" />

            </div>

            <AlertDialogTitle
              className="
                text-2xl
                font-bold
              "
            >

              Delete Account

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
                This action is
                <span className="font-semibold text-foreground">
                  {' '}permanent
                </span>
                {' '}and cannot be undone.
              </p>

              <div
                className="
                  rounded-xl
                  border
                  border-red-500/20
                  bg-red-500/5
                  p-4
                "
              >

                <p className="font-medium text-red-600 dark:text-red-400">

                  Deleting your account will permanently remove:

                </p>

                <ul
                  className="
                    mt-3
                    list-disc
                    space-y-1
                    pl-5
                    text-muted-foreground
                  "
                >

                  <li>Your profile information</li>

                  <li>Your prediction history</li>

                  <li>Your purchases and subscriptions</li>

                  <li>Your referral and reward records</li>

                </ul>

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

              Cancel

            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="
                h-11
                rounded-xl
                bg-gradient-to-r
                from-red-600
                via-red-500
                to-orange-500
                text-white
                shadow-lg
                transition-all
                duration-300
                hover:scale-[1.02]
                hover:shadow-red-500/30
                disabled:opacity-70
              "
            >

              <Trash2 className="mr-2 h-4 w-4" />

              {deleting
                ? 'Deleting...'
                : 'Delete Account'}

            </AlertDialogAction>

          </AlertDialogFooter>

        </div>

      </AlertDialogContent>

    </AlertDialog>

  );

}