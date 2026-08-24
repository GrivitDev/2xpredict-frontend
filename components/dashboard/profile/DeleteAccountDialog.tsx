'use client';

import {
  AlertTriangle,
  ShieldAlert,
  Trash2,
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

import { useProfile } from '@/hooks/useProfile';


// ============================================================
// DELETE ACCOUNT DIALOG
// ============================================================

export default function DeleteAccountDialog() {

  const {
    deleteAccount,
    deleting,
  } = useProfile();


  async function handleDelete() {
    await deleteAccount();
  }


  return (

    <Sheet>

      {/* ======================================================
          TRIGGER
          ====================================================== */}

      <SheetTrigger asChild>

        <Button
          variant="outline"
          className="
            h-10
            w-full
            justify-center
            rounded-lg
            border-red-500/20
            bg-red-500/[0.04]
            px-4
            text-s
            font-semibold
            text-red-600
            shadow-none
            transition-all
            duration-200
            hover:border-red-500/35
            hover:bg-red-500/[0.08]
            hover:text-red-600
            dark:text-red-400
            dark:hover:text-red-400
          "
        >

          <Trash2 className="mr-2 h-4 w-4" />

          Delete Account

        </Button>

      </SheetTrigger>


      {/* ======================================================
          SHEET
          ====================================================== */}

      <SheetContent
        side="bottom"
        className="
          mx-auto
          w-full
          max-w-lg
          overflow-hidden
          rounded-t-2xl
          border-border/70
          bg-background
          p-0
          shadow-2xl
        "
      >

        {/* ====================================================
            AMBIENT ACCENTS
            ==================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-48
            w-48
            rounded-full
            bg-red-500/10
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-20
            -left-20
            h-48
            w-48
            rounded-full
            bg-orange-500/[0.06]
            blur-3xl
          "
        />


        <div className="relative">


          {/* ==================================================
              HEADER
              ================================================== */}

          <SheetHeader
            className="
              border-b
              border-border/50
              px-6
              py-5
              text-left
            "
          >

            <div
              className="
                mb-4
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                border
                border-red-500/20
                bg-red-500/10
                text-red-500
              "
            >

              <AlertTriangle className="h-5 w-5" />

            </div>


            <SheetTitle
              className="
                text-lg
                font-bold
                tracking-tight
              "
            >
              Delete your account?
            </SheetTitle>


            <SheetDescription
              className="
                mt-1.5
                text-s
                leading-relaxed
              "
            >
              This action is permanent and cannot be
              undone. Your account and associated data
              will be permanently removed.
            </SheetDescription>

          </SheetHeader>


          {/* ==================================================
              WARNING
              ================================================== */}

          <div className="px-6 py-4">

            <div
              className="
                rounded-xl
                border
                border-red-500/15
                bg-red-500/[0.035]
                p-4
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-red-500/10
                    text-red-500
                  "
                >

                  <ShieldAlert className="h-4 w-4" />

                </div>


                <div className="min-w-0">

                  <p
                    className="
                      text-s
                      font-semibold
                    "
                  >
                    The following data will be deleted
                  </p>


                  <ul
                    className="
                      mt-2.5
                      space-y-1.5
                      text-s
                      leading-relaxed
                      text-muted-foreground
                    "
                  >

                    <li>
                      • Your profile information
                    </li>

                    <li>
                      • Your prediction history
                    </li>

                    <li>
                      • Your purchases and subscriptions
                    </li>

                    <li>
                      • Your referral and reward records
                    </li>

                  </ul>

                </div>

              </div>

            </div>

          </div>


          {/* ==================================================
              ACTIONS
              ================================================== */}

          <SheetFooter
            className="
              flex
              flex-col-reverse
              gap-2
              border-t
              border-border/50
              px-6
              py-4
              sm:flex-row
              sm:justify-end
            "
          >

            <Button
              type="button"
              variant="outline"
              className="
                h-10
                rounded-lg
                border-border/60
                px-5
                text-s
                font-medium
                shadow-none
              "
              disabled={deleting}
              onClick={() => {
                document.dispatchEvent(
                  new KeyboardEvent('keydown', {
                    key: 'Escape',
                  }),
                );
              }}
            >
              Cancel
            </Button>


            <Button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="
                h-10
                rounded-lg
                bg-red-600
                px-5
                text-s
                font-semibold
                text-white
                shadow-sm
                transition-all
                hover:bg-red-700
                hover:shadow-red-500/20
                disabled:pointer-events-none
                disabled:opacity-60
              "
            >

              <Trash2 className="mr-2 h-4 w-4" />

              {deleting
                ? 'Deleting...'
                : 'Delete Account'}

            </Button>

          </SheetFooter>

        </div>

      </SheetContent>

    </Sheet>
  );
}