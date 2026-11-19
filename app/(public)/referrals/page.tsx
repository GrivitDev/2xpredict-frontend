import { redirect } from 'next/navigation';

export default function ReferralsRedirectPage() {
  redirect('/profile#referrals');
}
