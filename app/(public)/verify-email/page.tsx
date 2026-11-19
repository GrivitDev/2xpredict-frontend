import { Suspense } from 'react';
import VerifyEmailClient from './VerifyEmailClient';

export default function VerifyEmailPage() {
  return <Suspense fallback={<div className="flex min-h-[100svh] items-center justify-center bg-background"><span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><VerifyEmailClient /></Suspense>;
}
