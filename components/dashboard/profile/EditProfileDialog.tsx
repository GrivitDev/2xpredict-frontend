'use client';

import { useEffect, useState } from 'react';

import {
  Pencil,
  User2,
  Phone,
  Save,
} from 'lucide-react';

import { z } from 'zod';

import {
  useForm,
} from 'react-hook-form';

import {
  zodResolver,
} from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';

import { useProfile } from '@/hooks/useProfile';

import type { User } from '@/types/user';


// ============================================================
// VALIDATION
// ============================================================

const schema = z.object({

  fullName: z
    .string()
    .trim()
    .min(
      3,
      'Full name must be at least 3 characters.',
    ),

  phoneNumber: z
    .string()
    .trim()
    .min(
      11,
      'Phone number is invalid.',
    ),

});


type FormValues = z.infer<typeof schema>;


// ============================================================
// PROPS
// ============================================================

interface Props {
  user: User;
}


// ============================================================
// COMPONENT
// ============================================================

export default function EditProfileDialog({
  user,
}: Props) {

  const {
    updateProfile,
    updating,
  } = useProfile();


  const [open, setOpen] = useState(false);


  const form = useForm<FormValues>({

    resolver: zodResolver(schema),

    defaultValues: {

      fullName:
        user.fullName || '',

      phoneNumber:
        user.phoneNumber || '',

    },

  });


  // ==========================================================
  // SYNC USER DATA
  // ==========================================================

  useEffect(() => {

    form.reset({

      fullName:
        user.fullName || '',

      phoneNumber:
        user.phoneNumber || '',

    });

  }, [user, form]);


  // ==========================================================
  // SUBMIT
  // ==========================================================

  async function onSubmit(
    values: FormValues,
  ) {

    await updateProfile(values);

    /*
     * If updateProfile already handles the success state,
     * this simply closes the sheet after completion.
     */
    setOpen(false);

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <Sheet
      open={open}
      onOpenChange={(value) => {

        setOpen(value);

        if (!value) {
          form.reset();
        }

      }}
    >

      {/* ====================================================
          TRIGGER
          ==================================================== */}

      <SheetTrigger asChild>

        <Button
          variant="outline"
          className="
            h-9
            rounded-lg
            border-primary/25
            bg-primary/[0.05]
            px-3.5
            text-s
            font-semibold
            text-primary
            shadow-none
            transition-colors
            hover:border-primary/40
            hover:bg-primary/10
            hover:text-primary
          "
        >

          <Pencil
            className="
              mr-2
              h-4
              w-4
            "
          />

          Edit Profile

        </Button>

      </SheetTrigger>


      {/* ====================================================
          SHEET
          ==================================================== */}

      <SheetContent
        side="right"
        className="
          w-full
          border-l
          border-border/70
          bg-background
          p-0
          shadow-2xl
          sm:max-w-md
        "
      >

        {/* ==================================================
            AMBIENT ACCENT
            ================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-48
            w-48
            rounded-full
            bg-primary/10
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
            bg-blue-500/[0.06]
            blur-3xl
          "
        />


        <div
          className="
            relative
            flex
            h-full
            flex-col
          "
        >

          {/* ==================================================
              HEADER
              ================================================== */}

          <SheetHeader
            className="
              border-b
              border-border/50
              px-5
              py-5
              pr-14
              text-left
            "
          >

            <div
              className="
                mb-3
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-primary/20
                bg-primary/10
                text-primary
              "
            >

              <Pencil
                className="h-5 w-5"
              />

            </div>


            <SheetTitle
              className="
                text-lg
                font-bold
                tracking-tight
              "
            >
              Edit Profile
            </SheetTitle>


            <SheetDescription
              className="
                mt-1
                text-s
                leading-relaxed
              "
            >
              Update your name and phone number.
            </SheetDescription>

          </SheetHeader>


          {/* ==================================================
              FORM
              ================================================== */}

          <Form {...form}>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="
                flex
                min-h-0
                flex-1
                flex-col
              "
            >

              {/* =================================================
                  SCROLLABLE CONTENT
                  ================================================= */}

              <div
                className="
                  flex-1
                  overflow-y-auto
                  px-5
                  py-5
                "
              >

                <div
                  className="
                    space-y-4
                  "
                >

                  {/* =============================================
                      FULL NAME
                      ============================================= */}

                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (

                      <FormItem>

                        <FormLabel
                          className="
                            text-s
                            font-semibold
                          "
                        >
                          Full Name
                        </FormLabel>


                        <FormControl>

                          <div
                            className="
                              relative
                            "
                          >

                            <User2
                              className="
                                pointer-events-none
                                absolute
                                left-3.5
                                top-1/2
                                h-4
                                w-4
                                -translate-y-1/2
                                text-muted-foreground
                              "
                            />


                            <Input
                              {...field}
                              placeholder="John Doe"
                              autoComplete="name"
                              className="
                                h-10
                                rounded-lg
                                border-border/60
                                bg-muted/[0.22]
                                pl-10
                                text-s
                                shadow-none
                                placeholder:text-muted-foreground/50
                                focus-visible:border-primary/40
                                focus-visible:ring-1
                                focus-visible:ring-primary/30
                              "
                            />

                          </div>

                        </FormControl>


                        <FormMessage
                          className="text-xs"
                        />

                      </FormItem>

                    )}
                  />


                  {/* =============================================
                      PHONE
                      ============================================= */}

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (

                      <FormItem>

                        <FormLabel
                          className="
                            text-s
                            font-semibold
                          "
                        >
                          Phone Number
                        </FormLabel>


                        <FormControl>

                          <div
                            className="
                              relative
                            "
                          >

                            <Phone
                              className="
                                pointer-events-none
                                absolute
                                left-3.5
                                top-1/2
                                h-4
                                w-4
                                -translate-y-1/2
                                text-muted-foreground
                              "
                            />


                            <Input
                              {...field}
                              placeholder="+234 800 000 0000"
                              autoComplete="tel"
                              className="
                                h-10
                                rounded-lg
                                border-border/60
                                bg-muted/[0.22]
                                pl-10
                                text-s
                                shadow-none
                                placeholder:text-muted-foreground/50
                                focus-visible:border-primary/40
                                focus-visible:ring-1
                                focus-visible:ring-primary/30
                              "
                            />

                          </div>

                        </FormControl>


                        <FormMessage
                          className="text-xs"
                        />

                      </FormItem>

                    )}
                  />

                </div>

              </div>


              {/* =================================================
                  FOOTER
                  ================================================= */}

              <div
                className="
                  shrink-0
                  border-t
                  border-border/50
                  bg-background
                  px-5
                  py-4
                "
              >

                <div
                  className="
                    flex
                    justify-end
                    gap-2
                  "
                >

                  <Button
                    type="button"
                    variant="outline"
                    className="
                      h-9
                      rounded-lg
                      border-border/60
                      px-4
                      text-s
                      font-semibold
                      shadow-none
                    "
                    onClick={() => {

                      form.reset();

                      setOpen(false);

                    }}
                  >
                    Cancel
                  </Button>


                  <Button
                    type="submit"
                    disabled={updating}
                    className="
                      h-9
                      rounded-lg
                      bg-primary
                      px-4
                      text-s
                      font-semibold
                      text-primary-foreground
                      shadow-sm
                      transition-colors
                      hover:bg-primary/90
                      disabled:pointer-events-none
                      disabled:opacity-60
                    "
                  >

                    <Save
                      className="
                        mr-2
                        h-4
                        w-4
                      "
                    />

                    {updating
                      ? 'Saving...'
                      : 'Save Changes'}

                  </Button>

                </div>

              </div>

            </form>

          </Form>

        </div>

      </SheetContent>

    </Sheet>

  );
}