import Link from 'next/link';
import { AdForm } from '@/components/admin/ads/AdForm';
export default function CreateAdPage() { return <div className="mx-auto w-full max-w-[1400px] space-y-3 p-3 sm:p-4"><header className="flex items-center justify-between"><div><Link href="/admin/ads" className="text-xs text-muted-foreground hover:text-foreground">← Ads</Link><h1 className="mt-1 text-base font-semibold">Create campaign</h1></div></header><AdForm mode="create" /></div>; }
