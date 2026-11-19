import { redirect } from 'next/navigation';

export default function SubscriptionsRedirectPage() {
  redirect('/profile#account-billing');
}
