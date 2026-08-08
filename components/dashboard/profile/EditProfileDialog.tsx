'use client';

import { useEffect } from 'react';

import {
  Pencil,
  User2,
  Phone,
  Sparkles,
} from 'lucide-react';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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

const schema = z.object({

  fullName:
    z.string().min(
      3,
      'Full name is required',
    ),

  phoneNumber:
    z.string().min(
      11,
      'Phone number is invalid',
    ),

});

type FormValues =
  z.infer<typeof schema>;

interface Props {
  user: User;
}

export default function EditProfileDialog({
  user,
}: Props) {

  const {
    updateProfile,
    updating,
  } = useProfile();

  const form =
    useForm<FormValues>({
      resolver:
        zodResolver(schema),

      defaultValues: {
        fullName:
          user.fullName,

        phoneNumber:
          user.phoneNumber || '',
      },
    });

  useEffect(() => {

    form.reset({

      fullName:
        user.fullName,

      phoneNumber:
        user.phoneNumber || '',

    });

  }, [user, form]);

  async function onSubmit(
    values: FormValues,
  ) {

    await updateProfile(values);

  }

  return (

    <Dialog>

      <DialogTrigger asChild>

        <Button
          className="
            h-11
            rounded-xl
            bg-gradient-to-r
            from-blue-600
            via-indigo-600
            to-violet-600
            text-white
            shadow-lg
            transition-all
            duration-300
            hover:scale-[1.02]
            hover:shadow-blue-500/30
            active:scale-[0.98]
          "
        >

          <Pencil className="mr-2 h-4 w-4" />

          Edit Profile

        </Button>

      </DialogTrigger>

      <DialogContent
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
            bg-blue-500/20
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
            bg-violet-500/20
            blur-3xl
          "
        />

        <div className="relative">

          <DialogHeader
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
                from-blue-500
                via-indigo-500
                to-violet-500
                text-white
                shadow-xl
              "
            >

              <Sparkles className="h-7 w-7" />

            </div>

            <DialogTitle
              className="
                text-2xl
                font-bold
              "
            >

              Edit Profile

            </DialogTitle>

            <DialogDescription
              className="
                max-w-md
                text-sm
                leading-relaxed
              "
            >

              Keep your account information
              up to date. Changes are saved
              immediately after submission.

            </DialogDescription>

          </DialogHeader>

          <Form {...form}>

            <form
              onSubmit={form.handleSubmit(
                onSubmit,
              )}
              className="
                space-y-6
                px-6
                py-6
              "
            >

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (

                  <FormItem>

                    <FormLabel>
                      Full Name
                    </FormLabel>

                    <FormControl>

                      <div className="relative">

                        <User2
                          className="
                            absolute
                            left-3
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
                          className="
                            h-12
                            rounded-xl
                            border-border/60
                            bg-muted/40
                            pl-10
                            transition-all
                            backdrop-blur
                            focus-visible:ring-2
                            focus-visible:ring-blue-500
                          "
                        />

                      </div>

                    </FormControl>

                    <FormMessage />

                  </FormItem>

                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (

                  <FormItem>

                    <FormLabel>
                      Phone Number
                    </FormLabel>

                    <FormControl>

                      <div className="relative">

                        <Phone
                          className="
                            absolute
                            left-3
                            top-1/2
                            h-4
                            w-4
                            -translate-y-1/2
                            text-muted-foreground
                          "
                        />

                        <Input
                          {...field}
                          placeholder="+234..."
                          className="
                            h-12
                            rounded-xl
                            border-border/60
                            bg-muted/40
                            pl-10
                            transition-all
                            backdrop-blur
                            focus-visible:ring-2
                            focus-visible:ring-blue-500
                          "
                        />

                      </div>

                    </FormControl>

                    <FormMessage />

                  </FormItem>

                )}
              />

              <DialogFooter
                className="
                  pt-2
                "
              >

                <Button
                  type="submit"
                  disabled={updating}
                  className="
                    h-12
                    w-full
                    rounded-xl
                    bg-gradient-to-r
                    from-blue-600
                    via-indigo-600
                    to-violet-600
                    text-white
                    shadow-lg
                    transition-all
                    duration-300
                    hover:scale-[1.01]
                    hover:shadow-blue-500/30
                    sm:w-auto
                  "
                >

                  <Pencil className="mr-2 h-4 w-4" />

                  {updating
                    ? 'Saving...'
                    : 'Save Changes'}

                </Button>

              </DialogFooter>

            </form>

          </Form>

        </div>

      </DialogContent>

    </Dialog>

  );

}