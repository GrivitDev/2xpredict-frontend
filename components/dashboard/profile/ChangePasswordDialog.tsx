'use client';

import { useState } from 'react';

import {
  KeyRound,
  ShieldCheck,
  Lock,
} from 'lucide-react';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { toast } from 'sonner';

import { changePassword } from '@/services/auth.service';

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

const schema = z
  .object({

    currentPassword: z
      .string()
      .min(
        6,
        'Current password is required',
      ),

    newPassword: z
      .string()
      .min(
        6,
        'Password must be at least 6 characters',
      ),

    confirmPassword: z.string(),

  })
  .refine(
    (data) =>
      data.newPassword ===
      data.confirmPassword,
    {
      path: ['confirmPassword'],
      message:
        'Passwords do not match',
    },
  );

type FormValues =
  z.infer<typeof schema>;

export default function ChangePasswordDialog() {

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const form =
    useForm<FormValues>({
      resolver:
        zodResolver(schema),

      defaultValues: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
    });

  async function onSubmit(
    values: FormValues,
  ) {

    try {

      setLoading(true);

      const response =
        await changePassword({

          currentPassword:
            values.currentPassword,

          newPassword:
            values.newPassword,

        });

      toast.success(
        response.message ??
          'Password changed successfully.',
      );

      form.reset();

      setOpen(false);

    } catch (error: any) {

      toast.error(
        error?.response?.data
          ?.message ??
          'Failed to change password.',
      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <Dialog
      open={open}
      onOpenChange={setOpen}
    >

      <DialogTrigger asChild>

        <Button
          className="
            h-11
            rounded-xl
            bg-gradient-to-r
            from-violet-600
            via-indigo-600
            to-cyan-600
            text-white
            shadow-lg
            transition-all
            duration-300
            hover:scale-[1.02]
            hover:shadow-cyan-500/30
            active:scale-[0.98]
          "
        >

          <KeyRound className="mr-2 h-4 w-4" />

          Change Password

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
            h-48
            w-48
            rounded-full
            bg-violet-500/20
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-20
            -right-20
            h-48
            w-48
            rounded-full
            bg-cyan-500/20
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
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-violet-500
                via-indigo-500
                to-cyan-500
                text-white
                shadow-lg
              "
            >

              <ShieldCheck className="h-7 w-7" />

            </div>

            <DialogTitle
              className="
                text-2xl
                font-bold
              "
            >

              Change Password

            </DialogTitle>

            <DialogDescription
              className="
                max-w-sm
                text-sm
                leading-relaxed
              "
            >

              Secure your account by verifying
              your current password before
              choosing a stronger new password.

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
                name="currentPassword"
                render={({ field }) => (

                  <FormItem>

                    <FormLabel>
                      Current Password
                    </FormLabel>

                    <FormControl>

                      <div className="relative">

                        <Lock
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
                          type="password"
                          {...field}
                          className="
                            h-12
                            rounded-xl
                            border-border/60
                            bg-muted/40
                            pl-10
                            backdrop-blur
                            transition-all
                            focus-visible:ring-2
                            focus-visible:ring-violet-500
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
                name="newPassword"
                render={({ field }) => (

                  <FormItem>

                    <FormLabel>
                      New Password
                    </FormLabel>

                    <FormControl>

                      <div className="relative">

                        <Lock
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
                          type="password"
                          {...field}
                          className="
                            h-12
                            rounded-xl
                            border-border/60
                            bg-muted/40
                            pl-10
                            backdrop-blur
                            transition-all
                            focus-visible:ring-2
                            focus-visible:ring-violet-500
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
                name="confirmPassword"
                render={({ field }) => (

                  <FormItem>

                    <FormLabel>
                      Confirm Password
                    </FormLabel>

                    <FormControl>

                      <div className="relative">

                        <Lock
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
                          type="password"
                          {...field}
                          className="
                            h-12
                            rounded-xl
                            border-border/60
                            bg-muted/40
                            pl-10
                            backdrop-blur
                            transition-all
                            focus-visible:ring-2
                            focus-visible:ring-violet-500
                          "
                        />

                      </div>

                    </FormControl>

                    <FormMessage />

                  </FormItem>

                )}
              />

              <DialogFooter>

                <Button
                  type="submit"
                  disabled={loading}
                  className="
                    h-12
                    w-full
                    rounded-xl
                    bg-gradient-to-r
                    from-violet-600
                    via-indigo-600
                    to-cyan-600
                    text-white
                    shadow-lg
                    transition-all
                    duration-300
                    hover:scale-[1.01]
                    hover:shadow-cyan-500/30
                    sm:w-auto
                  "
                >

                  {loading
                    ? 'Updating...'
                    : 'Change Password'}

                </Button>

              </DialogFooter>

            </form>

          </Form>

        </div>

      </DialogContent>

    </Dialog>

  );

}