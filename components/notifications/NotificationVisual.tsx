import Image from 'next/image';
import {
  FaBell,
  FaBullhorn,
  FaGift,
  FaHeadset,
  FaShieldHalved,
  FaTicket,
  FaTrophy,
  FaUser,
  FaUsers,
  FaWallet,
} from 'react-icons/fa6';
import type { IconType } from 'react-icons';
import type {
  NotificationIcon,
  NotificationPresentation,
  NotificationVariant,
} from '@/types/notifications';

const iconMap: Record<NotificationIcon, IconType> = {
  user: FaUser,
  shield: FaShieldHalved,
  users: FaUsers,
  gift: FaGift,
  wallet: FaWallet,
  ticket: FaTicket,
  trophy: FaTrophy,
  headset: FaHeadset,
  megaphone: FaBullhorn,
  bell: FaBell,
};

const variantClasses: Record<NotificationVariant, string> = {
  default: 'bg-muted text-muted-foreground ring-border/70',
  info: 'bg-primary/10 text-primary ring-primary/15',
  success: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
  warning: 'bg-amber-500/10 text-amber-800 ring-amber-500/20 dark:text-amber-300',
  danger: 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300',
  promotion: 'bg-primary/10 text-primary ring-primary/20',
};

interface NotificationVisualProps {
  presentation?: NotificationPresentation;
  className?: string;
}

/** Small, consistent icon/image treatment for all notification surfaces. */
export function NotificationVisual({
  presentation,
  className = 'h-10 w-10',
}: NotificationVisualProps) {
  const variant = presentation?.variant ?? 'info';
  const iconName = presentation?.icon ?? 'bell';
  const Icon = iconMap[iconName] ?? FaBell;
  const imageUrl = presentation?.imageUrl === '/banner.png' ? '/banner.png' : null;

  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ${variantClasses[variant]} ${className}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          width={72}
          height={72}
          className="h-full w-full object-cover"
          sizes="72px"
        />
      ) : (
        <Icon className="h-[42%] w-[42%]" />
      )}
    </span>
  );
}

export function notificationActionLabel(
  presentation?: NotificationPresentation,
  actionUrl?: string | null,
): string | null {
  if (!actionUrl) return null;
  const label = presentation?.actionLabel?.trim();
  return label || 'View details';
}
