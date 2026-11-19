import type { Metadata } from 'next';
import NotificationsInbox from '@/components/notifications/NotificationsInbox';

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'View your 2xPredict account notifications and email preferences.',
};

export default function NotificationsPage() {
  return <NotificationsInbox />;
}
