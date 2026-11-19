import { redirect } from 'next/navigation';

export default function SubscriptionRedirectPage() {
  redirect('/profile#account-billing');
}
