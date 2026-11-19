'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdForm } from '@/components/admin/ads/AdForm';
import { useAdDetailsQuery } from '@/hooks/use-admin-ads';
export default function EditAdPage() { const params=useParams<{id:string}>(); const id=String(params.id??''); const query=useAdDetailsQuery(id,Boolean(id)); if(query.isLoading)return <div className="p-4 text-xs text-muted-foreground">Loading…</div>; if(query.isError||!query.data)return <div className="space-y-2 p-4"><Link href="/admin/ads" className="text-xs text-muted-foreground">← Ads</Link><p className="text-sm text-destructive">Advertisement not found.</p></div>; return <div className="mx-auto w-full max-w-[1400px] space-y-3 p-3 sm:p-4"><header><Link href="/admin/ads" className="text-xs text-muted-foreground hover:text-foreground">← Ads</Link><h1 className="mt-1 text-base font-semibold">Edit campaign</h1></header><AdForm mode="edit" defaultValues={query.data}/></div>; }
