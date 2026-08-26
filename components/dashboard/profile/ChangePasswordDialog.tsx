'use client';

import { useState } from 'react';
import { KeyRound, ShieldCheck, Lock } from 'lucide-react';
import { z } from 'zod';
import { useForm, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { changePassword } from '@/services/auth.service';
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

const schema = z
  .object({
    currentPassword: z.string().min(6, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine(
    ({ newPassword, confirmPassword }) =>
      newPassword === confirmPassword,
    {
      path: ['confirmPassword'],
      message: 'Passwords do not match',
    },
  );

type FormValues = z.infer<typeof schema>;

type PasswordFieldProps = {
  control: Control<FormValues>;
  name: keyof FormValues;
  label: string;
  placeholder: string;
  autoComplete: string;
};

function PasswordField({
  control,
  name,
  label,
  placeholder,
  autoComplete,
}: PasswordFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="text-s font-medium">
            {label}
          </FormLabel>

          <FormControl>
            <div className="relative">
              <Lock
                className="
                  pointer-events-none absolute left-3.5 top-1/2
                  h-4 w-4 -translate-y-1/2 text-muted-foreground
                "
              />

              <Input
                {...field}
                type="password"
                placeholder={placeholder}
                autoComplete={autoComplete}
                className="
                  h-10 rounded-lg border-border/60 bg-muted/20
                  pl-10 text-s shadow-none
                  placeholder:text-muted-foreground/50
                  focus-visible:border-primary/40
                  focus-visible:ring-2 focus-visible:ring-primary/10
                "
              />
            </div>
          </FormControl>

          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}

export default function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);

    try {
      const response = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      toast.success(
        response.message ?? 'Password changed successfully.',
      );

      form.reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          'Failed to change password.',
      );
    } finally {
      setLoading(false);
    }
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value);

    if (!value) {
      form.reset();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="
            h-9 rounded-lg border-primary/20 bg-primary/[0.04]
            px-3 text-s font-semibold text-primary shadow-none
            transition-colors hover:border-primary/35
            hover:bg-primary/[0.08] hover:text-primary
          "
        >
          <KeyRound className="mr-2 h-4 w-4" />
          Change Password
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="
          w-full border-l border-border/70 bg-background p-0
          shadow-2xl sm:max-w-md
        "
      >
        <div
          className="
            pointer-events-none absolute -right-20 -top-20
            h-48 w-48 rounded-full bg-primary/10 blur-3xl
          "
        />

        <div
          className="
            pointer-events-none absolute -bottom-20 -left-20
            h-48 w-48 rounded-full bg-blue-500/[0.06] blur-3xl
          "
        />

        <div className="relative flex h-full flex-col">
          <SheetHeader
            className="
              border-b border-border/50 px-5 py-5 pr-14 text-left
            "
          >
            <div
              className="
                mb-3 flex h-10 w-10 items-center justify-center
                rounded-xl border border-primary/20 bg-primary/10
                text-primary
              "
            >
              <ShieldCheck className="h-5 w-5" />
            </div>

            <SheetTitle className="text-lg font-bold tracking-tight">
              Change Password
            </SheetTitle>

            <SheetDescription className="mt-1 text-s leading-relaxed">
              Enter your current password and choose a new one.
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="space-y-4">
                  <PasswordField
                    control={form.control}
                    name="currentPassword"
                    label="Current Password"
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />

                  <div className="flex items-center gap-3 pt-1">
                    <div className="h-px flex-1 bg-border/50" />

                    <span
                      className="
                        text-xs font-medium text-muted-foreground
                      "
                    >
                      New password
                    </span>

                    <div className="h-px flex-1 bg-border/50" />
                  </div>

                  <PasswordField
                    control={form.control}
                    name="newPassword"
                    label="New Password"
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />

                  <PasswordField
                    control={form.control}
                    name="confirmPassword"
                    label="Confirm New Password"
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                  />

                  <div
                    className="
                      flex items-center gap-3 rounded-xl
                      border border-emerald-500/15
                      bg-emerald-500/[0.04] px-3 py-2.5
                    "
                  >
                    <ShieldCheck
                      className="
                        h-4 w-4 shrink-0 text-emerald-500
                      "
                    />

                    <p
                      className="
                        text-xs leading-relaxed text-muted-foreground
                      "
                    >
                      Use a strong password you do not use elsewhere.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="
                  shrink-0 border-t border-border/50
                  bg-background px-5 py-4
                "
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="
                    h-10 w-full rounded-lg bg-primary px-5
                    text-s font-semibold text-primary-foreground
                    shadow-sm transition-all
                    hover:bg-primary/90
                    disabled:pointer-events-none disabled:opacity-60
                  "
                >
                  <KeyRound className="mr-2 h-4 w-4" />

                  {loading ? 'Updating...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}