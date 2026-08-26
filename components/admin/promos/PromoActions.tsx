'use client';

import {
  Copy,
  Edit,
  Power,
} from 'lucide-react';

import { useRouter } from 'next/navigation';

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { Button } from '@/components/ui/button';

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

import { Promo } from '@/types/promo';

import { deactivatePromo } from '@/services/admin-promos.service';

import { toast } from 'sonner';

interface PromoActionsProps {
  promo: Promo;
}

export default function PromoActions({
  promo,
}: PromoActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const deactivateMutation = useMutation({
    mutationFn: () => deactivatePromo(promo._id),

    onSuccess: () => {
      toast.success('Promo deactivated successfully');

      queryClient.invalidateQueries({
        queryKey: ['admin-promos'],
      });
    },

    onError: () => {
      toast.error('Failed to deactivate promo');
    },
  });

  const copyLink = async () => {
    if (!promo.registrationUrl) {
      toast.error('No registration link available');
      return;
    }

    try {
      await navigator.clipboard.writeText(
        promo.registrationUrl,
      );

      toast.success('Promo link copied');
    } catch {
      toast.error('Failed to copy promo link');
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="Edit promo"
        onClick={() =>
          router.push(`/admin/promos/${promo._id}`)
        }
      >
        <Edit className="h-4 w-4" />
      </Button>

      {promo.registrationUrl && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Copy promo link"
          onClick={copyLink}
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}

      {promo.isActive && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Deactivate promo"
              disabled={deactivateMutation.isPending}
            >
              <Power className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Deactivate Promo?
              </AlertDialogTitle>

              <AlertDialogDescription>
                This will stop users from participating
                in this campaign.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                disabled={deactivateMutation.isPending}
                onClick={() =>
                  deactivateMutation.mutate()
                }
              >
                {deactivateMutation.isPending
                  ? 'Deactivating...'
                  : 'Deactivate'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}