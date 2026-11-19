'use client';

import Link from 'next/link';
import { useState } from 'react';
import { adsService } from '@/services/ads.service';
import { adDestinationFor, adDefaultActionLabel } from '@/constants/ads/ad-destination';
import { useAdsListQuery, useAdAnalyticsQuery, useSingleAdAnalyticsQuery, useAdEventsQuery, useAutomationOptionsQuery, useDiscoverAdContentQuery, useExternalAdPolicyQuery, useDeleteAdMutation, useToggleAdStatusMutation, useUpdateExternalAdPolicyMutation } from '@/hooks/use-admin-ads';
import type { AdAudience, AdAudienceKey, AdContentSource, AdEventType, AdPage, AdPosition, AdDevice, AdType, AdsListQuery, AdEventQuery, ExternalAdPolicy, AdminAd, AdPreviewResponse } from '@/types/ads';

const input = 'h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring';
const btn = 'inline-flex h-7 items-center justify-center border px-2 text-[11px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50';
const primary = `${btn} border-primary bg-primary text-primary-foreground hover:bg-primary/90`;
const muted = `${btn} border-border bg-background hover:bg-muted`;
const label = 'mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground';
const panel = 'rounded-md border border-border bg-card p-2.5';
const audiences: AdAudience[] = ['ALL','GUEST','FREE','REGULAR','VIP','PREMIUM'];
const audienceKeys: AdAudienceKey[] = ['GUEST','FREE','REGULAR','VIP','PREMIUM'];
const adTypes: AdType[] = ['BANNER','INTERSTITIAL','NATIVE','REWARDED','POPUP','STICKY','VIDEO'];
const sources: AdContentSource[] = ['CUSTOM','PREDICTION','SLIP','SURE_ODDS','PROMO','BONUS','REFERRAL','SUBSCRIPTION','BET_LAB'];
const pages: AdPage[] = ['HOME','DASHBOARD','PRICING','PREDICTIONS','ABOUT','PURCHASES','SUBSCRIPTIONS','REFERRALS','BET_LAB','PICK_CENTER','SLIP_CENTER','ODDS_CENTER','BONUSES','PROMOS','WALLET','REGISTER','LOGIN'];
const positions: AdPosition[] = ['POPUP','HERO','TOP_BANNER','INLINE','SIDEBAR_LEFT','SIDEBAR_RIGHT','BOTTOM','FOOTER','INTERSTITIAL','STICKY_BOTTOM','STICKY_TOP','FEED'];
const devices: AdDevice[] = ['ALL','MOBILE','TABLET','DESKTOP'];
const eventTypes: AdEventType[] = ['IMPRESSION','CLICK','CONVERSION','DISMISS'];
const fmt = (n?: number) => Number(n ?? 0).toLocaleString();
const dateLabel = (value?: string) => value ? new Date(value).toLocaleString() : '—';
const unwrapItems = <T,>(value: unknown): T[] => Array.isArray(value) ? value as T[] : ((value as { items?: T[] } | null)?.items ?? []);

function createContentHref(item: { source: AdContentSource; sourceId?: string; title: string; subTitle?: string; description?: string; destinationUrl?: string; defaultActionLabel?: string }) {
  const query = new URLSearchParams({ source: item.source, title: item.title });
  if (item.sourceId) query.set('sourceId', item.sourceId);
  if (item.subTitle) query.set('subTitle', item.subTitle);
  if (item.description) query.set('description', item.description);
  query.set('destinationUrl', item.destinationUrl || adDestinationFor(item.source, item.sourceId));
  query.set('actionLabel', item.defaultActionLabel || adDefaultActionLabel(item.source));
  return `/admin/ads/create?${query.toString()}`;
}

function createAutomationHref(option: { key: string; source: AdContentSource; title: string; resolves?: string }) {
  const query = new URLSearchParams({ source: option.source, automated: 'true', automationKey: option.key, title: option.title });
  return `/admin/ads/create?${query.toString()}`;
}

export function AdsAdminWorkspace() {
  const [tab, setTab] = useState<'campaigns'|'analytics'|'events'|'external'>('campaigns');
  const [filters, setFilters] = useState<AdsListQuery>({ page: 1, limit: 25 });
  const [search, setSearch] = useState('');
  const [eventFilters, setEventFilters] = useState<AdEventQuery>({ page: 1, limit: 25 });
  const [days, setDays] = useState(30);
  const [analyticsStart, setAnalyticsStart] = useState('');
  const [analyticsEnd, setAnalyticsEnd] = useState('');
  const [statsAdId, setStatsAdId] = useState('');
  const [discoverKind, setDiscoverKind] = useState<AdContentSource | ''>('');
  const [previewState, setPreviewState] = useState<{ id: string; audience: AdAudienceKey; result?: AdPreviewResponse; error?: string; loading: boolean } | null>(null);
  const listQuery = useAdsListQuery(filters);
  const analyticsQuery = useAdAnalyticsQuery({ ...(analyticsStart || analyticsEnd ? { startDate: analyticsStart || undefined, endDate: analyticsEnd || undefined } : { days }) });
  const statsQuery = useSingleAdAnalyticsQuery(statsAdId, { days });
  const eventQuery = useAdEventsQuery(eventFilters);
  const automationQuery = useAutomationOptionsQuery();
  const discoverQuery = useDiscoverAdContentQuery(discoverKind || undefined, tab === 'campaigns');
  const policyQuery = useExternalAdPolicyQuery();
  const removeMutation = useDeleteAdMutation();
  const toggleMutation = useToggleAdStatusMutation();
  const savePolicyMutation = useUpdateExternalAdPolicyMutation();
  const [policyDraft, setPolicyDraft] = useState<ExternalAdPolicy | null>(null);
  const ads = unwrapItems<AdminAd>(listQuery.data);
  const events = unwrapItems<(NonNullable<typeof eventQuery.data>['items'][number])>(eventQuery.data);
  const analytics = analyticsQuery.data;
  const policy = policyDraft ?? policyQuery.data ?? null;
  const pagination = (listQuery.data as { pagination?: { page:number; limit:number; total:number; pages:number } } | undefined)?.pagination;
  const eventPagination = eventQuery.data?.pagination;
  const automationOptions = automationQuery.data ?? discoverQuery.data?.automationOptions ?? [];
  const content = discoverQuery.data?.items ?? [];

  async function showPreview(id: string, audience: AdAudienceKey) {
    setPreviewState({ id, audience, loading: true });
    try {
      const result = await adsService.preview({ path: { id }, query: { audience } });
      setPreviewState({ id, audience, result, loading: false });
    } catch (error) {
      setPreviewState({ id, audience, error: error instanceof Error ? error.message : 'Preview failed', loading: false });
    }
  }
  async function savePolicy() {
    if (!policy) return;
    try {
      await savePolicyMutation.mutateAsync({ enabled: policy.enabled, audiences: policy.audiences, frequency: policy.frequency, refreshIntervalSeconds: policy.refreshIntervalSeconds, maxImpressionsPerSession: policy.maxImpressionsPerSession, maxImpressionsPerDay: policy.maxImpressionsPerDay, allowedTypes: policy.allowedTypes });
      setPolicyDraft(null);
    } catch { /* mutation state renders the error */ }
  }

  return <div className="space-y-3 text-sm">
    <header className="flex flex-wrap items-center justify-between gap-2">
      <div><h1 className="text-base font-semibold tracking-tight">Ads</h1><p className="text-[10px] text-muted-foreground">Campaigns · analytics · external delivery</p></div>
      <Link href="/admin/ads/create" className={primary}>+ Create ad</Link>
    </header>

    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {[['Campaigns', fmt(analytics?.totalAds ?? ads.length)],['Active',fmt(analytics?.activeAds ?? ads.filter(a=>a.isActive).length)],['Impressions',fmt(analytics?.impressions)],['CTR',`${Number(analytics?.ctr ?? 0).toFixed(2)}%`]].map(([title,value])=><div key={title} className={`${panel} py-2`}><div className="text-[10px] uppercase tracking-wide text-muted-foreground">{title}</div><div className="mt-1 text-sm font-semibold tabular-nums">{value}</div></div>)}
    </div>

    <nav className="flex flex-wrap gap-1 border-b pb-2">
      {([['campaigns','Campaigns'],['analytics','Analytics'],['events','Events'],['external','External policy']] as const).map(([key,text])=><button key={key} onClick={()=>setTab(key)} className={`${btn} ${tab===key?'border-foreground/30 bg-muted text-foreground':'border-transparent text-muted-foreground hover:bg-muted'}`}>{text === 'External policy' ? 'External ads' : text}</button>)}
    </nav>

    {tab === 'campaigns' && <div className="space-y-3">
      <form className={`${panel} grid grid-cols-1 gap-2 sm:grid-cols-4 xl:grid-cols-8`} onSubmit={e=>{e.preventDefault();setFilters(v=>({...v,search:search.trim()||undefined,page:1}));}}>
        <div className="sm:col-span-2"><label className={label}>Search</label><input className={input} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Title or subtitle" /></div>
        <div><label className={label}>Status</label><select className={input} value={filters.active===undefined?'ALL':String(filters.active)} onChange={e=>setFilters(v=>({...v,active:e.target.value==='ALL'?undefined:e.target.value==='true',page:1}))}><option value="ALL">All</option><option value="true">Active</option><option value="false">Inactive</option></select></div>
        <div><label className={label}>Type</label><select className={input} value={filters.type??'ALL'} onChange={e=>setFilters(v=>({...v,type:e.target.value==='ALL'?undefined:e.target.value as AdType,page:1}))}><option value="ALL">All types</option>{adTypes.map(t=><option key={t}>{t}</option>)}</select></div>
        <div><label className={label}>Source</label><select className={input} value={filters.contentSource??'ALL'} onChange={e=>setFilters(v=>({...v,contentSource:e.target.value==='ALL'?undefined:e.target.value as AdContentSource,page:1}))}><option value="ALL">All sources</option>{sources.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label className={label}>Audience</label><select className={input} value={filters.audience??'ALL'} onChange={e=>setFilters(v=>({...v,audience:e.target.value==='ALL'?undefined:e.target.value as AdAudience,page:1}))}><option value="ALL">All audiences</option>{audiences.map(a=><option key={a}>{a}</option>)}</select></div>
        <div><label className={label}>Page</label><select className={input} value={filters.displayPage??'ALL'} onChange={e=>setFilters(v=>({...v,displayPage:e.target.value==='ALL'?undefined:e.target.value as AdPage,page:1}))}><option value="ALL">All pages</option>{pages.map(p=><option key={p}>{p}</option>)}</select></div>
        <div><label className={label}>Position</label><select className={input} value={filters.position??'ALL'} onChange={e=>setFilters(v=>({...v,position:e.target.value==='ALL'?undefined:e.target.value as AdPosition,page:1}))}><option value="ALL">All positions</option>{positions.map(p=><option key={p}>{p}</option>)}</select></div>
        <div><label className={label}>Device</label><select className={input} value={filters.device??'ALL'} onChange={e=>setFilters(v=>({...v,device:e.target.value==='ALL'?undefined:e.target.value as AdDevice,page:1}))}><option value="ALL">All devices</option>{devices.map(d=><option key={d}>{d}</option>)}</select></div>
        <div className="flex items-end gap-1"><button className={primary} type="submit">Apply</button><button className={muted} type="button" onClick={()=>{setSearch('');setFilters({page:1,limit:25});}}>Reset</button></div>
      </form>
      <div className={panel}>
        <div className="mb-2 flex items-center justify-between"><h2 className="font-semibold">Campaigns <span className="ml-1 text-xs text-muted-foreground">{pagination?.total ?? ads.length}</span></h2><button className={muted} onClick={()=>{void listQuery.refetch();void analyticsQuery.refetch();}}>Refresh</button></div>
        {listQuery.isLoading?<p className="py-6 text-center text-xs text-muted-foreground">Loading…</p>:listQuery.isError?<p className="py-5 text-xs text-destructive">Could not load ads.</p>:ads.length===0?<p className="py-6 text-center text-xs text-muted-foreground">No ads match these filters.</p>:<div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-xs"><thead className="border-b text-[10px] uppercase text-muted-foreground"><tr>{['Campaign','Type / source','Audience','Placement','Activity','Status','Actions'].map(x=><th key={x} className="px-2 py-2 font-medium">{x}</th>)}</tr></thead><tbody>{ads.map(ad=><tr key={ad._id} className="border-b last:border-0 hover:bg-muted/20"><td className="max-w-[220px] px-2 py-2"><div className="truncate font-medium">{ad.title}</div><div className="truncate text-[10px] text-muted-foreground">{ad.automated?`Auto · ${ad.automationKey}`:ad.subTitle||ad.contentSource}</div></td><td className="px-2 py-2"><div>{ad.type}</div><div className="text-[10px] text-muted-foreground">{ad.contentSource}</div></td><td className="px-2 py-2">{(ad.audience??[]).join(', ')||'—'}</td><td className="px-2 py-2">{(ad.displays??[]).map(d=>`${d.page}/${d.position}`).join(', ')||'—'}</td><td className="px-2 py-2 tabular-nums"><div>{fmt(ad.impressions)} views</div><div className="text-[10px] text-muted-foreground">{fmt(ad.clicks)} clicks · {Number(ad.impressions)>0?((Number(ad.clicks)/Number(ad.impressions))*100).toFixed(1):'0.0'}% CTR</div></td><td className="px-2 py-2"><span className={`rounded px-1.5 py-0.5 text-[10px] ${ad.isActive?'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300':'bg-muted text-muted-foreground'}`}>{ad.isActive?'Active':'Paused'}</span></td><td className="px-2 py-2"><div className="flex items-center gap-1"><Link className={muted} href={`/admin/ads/${ad._id}/edit`}>Edit</Link><button className={muted} onClick={()=>setStatsAdId(ad._id)}>Stats</button><button className={muted} onClick={()=>void showPreview(ad._id,'GUEST')}>Preview</button><button className={muted} disabled={toggleMutation.isPending} onClick={()=>toggleMutation.mutate(ad._id)}>{ad.isActive?'Pause':'Activate'}</button><button className={`${btn} border-destructive/30 text-destructive hover:bg-destructive/10`} disabled={removeMutation.isPending} onClick={()=>{if(window.confirm(`Delete “${ad.title}”?`)) removeMutation.mutate(ad._id);}}>Delete</button></div></td></tr>)}</tbody></table></div>}
        {pagination && pagination.pages>1 && <div className="mt-3 flex items-center justify-end gap-2 text-xs"><span className="text-muted-foreground">Page {pagination.page} of {pagination.pages}</span><button className={muted} disabled={pagination.page<=1} onClick={()=>setFilters(v=>({...v,page:Math.max(1,(v.page??1)-1)}))}>Previous</button><button className={muted} disabled={pagination.page>=pagination.pages} onClick={()=>setFilters(v=>({...v,page:(v.page??1)+1}))}>Next</button></div>}
        {(removeMutation.isError||toggleMutation.isError)&&<p className="mt-2 text-xs text-destructive">{(removeMutation.error??toggleMutation.error)?.message||'Action failed.'}</p>}
      </div>
      <div className={`${panel} space-y-2`}>
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold">Content discovery</h2><select className={`${input} max-w-[210px]`} value={discoverKind} onChange={e=>setDiscoverKind(e.target.value as AdContentSource|'')}><option value="">All linked sources</option>{sources.filter(s=>s!=='CUSTOM').map(s=><option key={s}>{s}</option>)}</select></div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr]">
          <div className="max-h-60 space-y-1 overflow-auto">{discoverQuery.isLoading?<p className="text-xs text-muted-foreground">Loading content…</p>:discoverQuery.isError?<p className="text-xs text-destructive">Could not load content.</p>:content.length===0?<p className="text-xs text-muted-foreground">No eligible linked content found.</p>:content.slice(0,30).map((item,i)=><div key={`${item.source}-${item.sourceId??i}`} className="flex items-center justify-between gap-2 rounded border px-2 py-1.5 hover:bg-muted/30"><Link href={createContentHref(item)} className="min-w-0 flex-1" title="Create an ad using this content"><div className="truncate text-xs font-medium">{item.title}</div><div className="truncate text-[10px] text-muted-foreground">{item.source} {item.subTitle?`· ${item.subTitle}`:''}</div></Link><div className="flex shrink-0 items-center gap-1"><Link className={primary} href={createContentHref(item)}>Use</Link></div></div>)}</div>
          <div className="space-y-1"><h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Automation</h3>{automationQuery.isLoading?<p className="text-xs text-muted-foreground">Loading automations…</p>:automationQuery.isError?<p className="text-xs text-destructive">Could not load automation options.</p>:automationOptions.map(option=><Link key={option.key} href={createAutomationHref(option)} className="block rounded border px-2 py-1.5 transition-colors hover:border-primary/50 hover:bg-muted/30" title="Create an automated ad with this rule"><div className="flex justify-between gap-2 text-xs"><span className="font-medium">{option.title}</span><span className="text-[10px] text-muted-foreground">{option.source}</span></div><div className="mt-0.5 flex items-center justify-between gap-2"><span className="line-clamp-2 text-[10px] text-muted-foreground">{option.resolves}</span><span className="shrink-0 text-[10px] font-medium text-primary">Create →</span></div></Link>)}</div>
        </div>
      </div>
    </div>}

    {tab === 'analytics' && <div className="space-y-3">
      <div className={`${panel} flex flex-wrap items-end gap-2`}><h2 className="mr-auto self-center font-semibold">Performance</h2><div><label className={label}>From</label><input className={input} type="date" value={analyticsStart} onChange={e=>setAnalyticsStart(e.target.value)}/></div><div><label className={label}>To</label><input className={input} type="date" value={analyticsEnd} onChange={e=>setAnalyticsEnd(e.target.value)}/></div><div><label className={label}>Window</label><select className={input} disabled={Boolean(analyticsStart||analyticsEnd)} value={days} onChange={e=>setDays(Number(e.target.value))}><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option><option value={180}>180 days</option><option value={365}>365 days</option></select></div><button className={muted} onClick={()=>{setAnalyticsStart('');setAnalyticsEnd('');setDays(30);}}>Reset</button></div>
      {analyticsQuery.isLoading?<p className="py-8 text-center text-xs text-muted-foreground">Loading analytics…</p>:analyticsQuery.isError?<p className="text-xs text-destructive">Analytics could not be loaded.</p>:<>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">{[['Impressions',analytics?.impressions],['Clicks',analytics?.clicks],['CTR',`${Number(analytics?.ctr??0).toFixed(2)}%`],['Conversions',analytics?.conversions],['Conversion rate',`${Number(analytics?.conversionRate??0).toFixed(2)}%`],['Dismissals',analytics?.dismissals]].map(([k,v])=><div className={`${panel} py-2`} key={String(k)}><div className="text-[10px] text-muted-foreground">{k}</div><div className="text-base font-semibold">{typeof v==='string'?v:fmt(Number(v))}</div></div>)}</div>
        <div className={`${panel} overflow-x-auto`}><h3 className="mb-2 font-semibold">Daily activity</h3><table className="w-full min-w-[470px] text-xs"><thead className="border-b text-[10px] text-muted-foreground"><tr>{['Day','Impressions','Clicks','Conversions','Dismissals'].map(x=><th key={x} className="px-2 py-2 text-right first:text-left">{x}</th>)}</tr></thead><tbody>{(analytics?.byDay??[]).map(day=><tr key={day._id} className="border-b last:border-0"><td className="px-2 py-1.5">{day._id}</td><td className="px-2 py-1.5 text-right">{fmt(day.impressions)}</td><td className="px-2 py-1.5 text-right">{fmt(day.clicks)}</td><td className="px-2 py-1.5 text-right">{fmt(day.conversions)}</td><td className="px-2 py-1.5 text-right">{fmt(day.dismissals)}</td></tr>)}</tbody></table></div>
        <div className={`${panel} overflow-x-auto`}><h3 className="mb-2 font-semibold">Top campaigns</h3><table className="w-full min-w-[470px] text-xs"><thead className="border-b text-[10px] text-muted-foreground"><tr>{['Campaign','Type','Impressions','Clicks','Conversions'].map(x=><th key={x} className="px-2 py-2 text-right first:text-left">{x}</th>)}</tr></thead><tbody>{(analytics?.topAds??[]).map(ad=><tr key={ad.adId} className="border-b last:border-0"><td className="px-2 py-1.5">{ad.title??ad.adId}</td><td className="px-2 py-1.5 text-right">{ad.type}</td><td className="px-2 py-1.5 text-right">{fmt(ad.impressions)}</td><td className="px-2 py-1.5 text-right">{fmt(ad.clicks)}</td><td className="px-2 py-1.5 text-right">{fmt(ad.conversions)}</td></tr>)}</tbody></table></div>
        {Boolean(analytics?.conversionValueByCurrency?.length) && <div className={`${panel} space-y-2`}><h3 className="font-semibold">Conversion value by currency</h3><div className="flex flex-wrap gap-2">{analytics?.conversionValueByCurrency?.map(row=><div key={row._id} className="min-w-28 rounded-sm border px-2 py-1.5"><div className="text-[10px] text-muted-foreground">{row._id} · {fmt(row.events)} conversions</div><div className="text-sm font-semibold tabular-nums">{row._id==='NGN'?'₦':row._id==='USD'?'$':''}{fmt(row.value)}</div></div>)}</div></div>}
        <div className="grid gap-3 md:grid-cols-2">{([['By audience', analytics?.byAudience], ['By placement', analytics?.byPosition], ['By page', analytics?.byPage], ['By device', analytics?.byDevice]] as Array<[string, Array<Record<string, unknown>> | undefined]>).map(([title, rows])=><div className={panel} key={String(title)}><h3 className="mb-2 font-semibold">{title}</h3><div className="space-y-1">{((rows??[]) as Array<Record<string,unknown>>).slice(0,8).map((row,i)=><div key={`${String(row._id)}-${i}`} className="flex justify-between border-b py-1 text-xs last:border-0"><span>{String(row._id??'Unknown')}</span><span className="tabular-nums">{fmt(Number(row.events??row.count??0))}</span></div>)}</div></div>)}</div>
      </>}
    </div>}

    {tab === 'events' && <div className={`${panel} space-y-2`}>
      <form className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-6" onSubmit={e=>{e.preventDefault();setEventFilters(v=>({...v,page:1}));}}>
        <div><label className={label}>Event</label><select className={input} value={eventFilters.type??'ALL'} onChange={e=>setEventFilters(v=>({...v,type:e.target.value==='ALL'?undefined:e.target.value as AdEventType,page:1}))}><option value="ALL">All events</option>{eventTypes.map(t=><option key={t}>{t}</option>)}</select></div>
        <div><label className={label}>Audience</label><select className={input} value={eventFilters.audience??'ALL'} onChange={e=>setEventFilters(v=>({...v,audience:e.target.value==='ALL'?undefined:e.target.value as AdAudience,page:1}))}><option value="ALL">All audiences</option>{audiences.map(a=><option key={a}>{a}</option>)}</select></div>
        <div><label className={label}>Page</label><select className={input} value={eventFilters.adPage??'ALL'} onChange={e=>setEventFilters(v=>({...v,adPage:e.target.value==='ALL'?undefined:e.target.value as AdPage,page:1}))}><option value="ALL">All pages</option>{pages.map(p=><option key={p}>{p}</option>)}</select></div>
        <div><label className={label}>Position</label><select className={input} value={eventFilters.position??'ALL'} onChange={e=>setEventFilters(v=>({...v,position:e.target.value==='ALL'?undefined:e.target.value as AdPosition,page:1}))}><option value="ALL">All positions</option>{positions.map(p=><option key={p}>{p}</option>)}</select></div>
        <div><label className={label}>Device</label><select className={input} value={eventFilters.device??'ALL'} onChange={e=>setEventFilters(v=>({...v,device:e.target.value==='ALL'?undefined:e.target.value as AdDevice,page:1}))}><option value="ALL">All devices</option>{devices.map(d=><option key={d}>{d}</option>)}</select></div>
        <div><label className={label}>Campaign ID</label><input className={input} value={eventFilters.adId??''} onChange={e=>setEventFilters(v=>({...v,adId:e.target.value||undefined,page:1}))} placeholder="Campaign ID"/></div>
        <div><label className={label}>Conversion type</label><input className={input} value={eventFilters.conversionType??''} onChange={e=>setEventFilters(v=>({...v,conversionType:e.target.value||undefined,page:1}))} placeholder="purchase, signup…"/></div>
        <div><label className={label}>From</label><input className={input} type="date" value={eventFilters.startDate??''} onChange={e=>setEventFilters(v=>({...v,startDate:e.target.value||undefined,page:1}))}/></div>
        <div><label className={label}>To</label><input className={input} type="date" value={eventFilters.endDate??''} onChange={e=>setEventFilters(v=>({...v,endDate:e.target.value||undefined,page:1}))}/></div>
        <div className="flex items-end gap-1"><button className={primary} type="submit">Apply</button><button className={muted} type="button" onClick={()=>setEventFilters({page:1,limit:25})}>Reset</button></div>
      </form>
      {eventQuery.isLoading?<p className="py-6 text-center text-xs text-muted-foreground">Loading events…</p>:<div className="overflow-x-auto"><table className="w-full min-w-[720px] text-xs"><thead className="border-b text-[10px] uppercase text-muted-foreground"><tr>{['Event','Campaign','Audience','Page / placement','Device','Conversion','Time'].map(x=><th key={x} className="px-2 py-2 text-left font-medium">{x}</th>)}</tr></thead><tbody>{events.map(ev=><tr key={ev._id} className="border-b last:border-0"><td className="px-2 py-2">{ev.type}</td><td className="px-2 py-2">{typeof ev.adId==='object'?ev.adId.title:ev.adId}</td><td className="px-2 py-2">{ev.audience??'—'}</td><td className="px-2 py-2">{ev.page??'—'}{ev.position?` / ${ev.position}`:''}</td><td className="px-2 py-2">{ev.device??'—'}</td><td className="px-2 py-2">{ev.conversionType?`${ev.conversionType} · ${ev.conversionValue??0} ${ev.currency??''}`:'—'}</td><td className="px-2 py-2">{dateLabel(ev.createdAt)}</td></tr>)}</tbody></table>{events.length===0&&<p className="py-6 text-center text-xs text-muted-foreground">No events found.</p>}</div>}
      {eventPagination&&eventPagination.pages>1&&<div className="flex items-center justify-end gap-2 text-xs"><span className="text-muted-foreground">Page {eventPagination.page} of {eventPagination.pages} · {eventPagination.total} events</span><button className={muted} disabled={eventPagination.page<=1} onClick={()=>setEventFilters(v=>({...v,page:(v.page ?? 1)-1}))}>Previous</button><button className={muted} disabled={eventPagination.page>=eventPagination.pages} onClick={()=>setEventFilters(v=>({...v,page:(v.page ?? 1)+1}))}>Next</button></div>}
    </div>}

    {tab === 'external' && <div className={`${panel} space-y-3`}>
      <div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">External ad delivery</h2><p className="text-[10px] text-muted-foreground">Third-party ads only. Internal campaigns are unaffected.</p></div><button className={muted} onClick={()=>{setPolicyDraft(null);void policyQuery.refetch();}}>Reset</button></div>
      {policyQuery.isLoading&&!policy?<p className="py-5 text-xs text-muted-foreground">Loading policy…</p>:!policy?<p className="text-xs text-destructive">Policy unavailable.</p>:<>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex items-center justify-between rounded border px-3 py-2 text-xs">External ads enabled<input type="checkbox" checked={policy.enabled} onChange={e=>setPolicyDraft({...policy,enabled:e.target.checked})}/></label>
          <div><label className={label}>Frequency</label><select className={input} value={policy.frequency} onChange={e=>setPolicyDraft({...policy,frequency:e.target.value as ExternalAdPolicy['frequency']})}><option value="NONE">Off</option><option value="LOW">Low</option><option value="NORMAL">Normal</option></select></div>
          <div><label className={label}>Refresh interval (seconds)</label><input className={input} type="number" min={0} max={3600} value={policy.refreshIntervalSeconds} onChange={e=>setPolicyDraft({...policy,refreshIntervalSeconds:Number(e.target.value)})}/></div>
          <div><label className={label}>Max impressions / session</label><input className={input} type="number" min={0} max={20} value={policy.maxImpressionsPerSession} onChange={e=>setPolicyDraft({...policy,maxImpressionsPerSession:Number(e.target.value)})}/></div>
          <div><label className={label}>Max impressions / day</label><input className={input} type="number" min={0} max={100} value={policy.maxImpressionsPerDay} onChange={e=>setPolicyDraft({...policy,maxImpressionsPerDay:Number(e.target.value)})}/></div>
        </div>
        <div className="space-y-2"><h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Audience access</h3><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{audienceKeys.map(a=><label key={a} className="flex items-center justify-between rounded border px-2 py-2 text-xs">{a}<input type="checkbox" checked={policy.audiences?.[a]===true} onChange={e=>setPolicyDraft({...policy,audiences:{...policy.audiences,[a]:e.target.checked}})}/></label>)}</div></div>
        <div className="space-y-2"><h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Allowed formats</h3><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{adTypes.map(t=><label key={t} className="flex items-center justify-between rounded border px-2 py-2 text-xs">{t}<input type="checkbox" checked={policy.allowedTypes?.[t]===true} onChange={e=>setPolicyDraft({...policy,allowedTypes:{...policy.allowedTypes,[t]:e.target.checked}})}/></label>)}</div></div>
        <div className="flex items-center gap-2"><button className={primary} disabled={savePolicyMutation.isPending} onClick={()=>void savePolicy()}>{savePolicyMutation.isPending?'Saving…':'Save policy'}</button>{savePolicyMutation.isSuccess&&<span className="text-xs text-emerald-600">Saved</span>}{savePolicyMutation.isError&&<span className="text-xs text-destructive">{savePolicyMutation.error.message}</span>}</div>
      </>}
    </div>}

    {statsAdId && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" role="dialog" aria-modal="true"><div className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-md border bg-background p-4 shadow-lg"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Campaign statistics</h2><button className={muted} onClick={()=>setStatsAdId('')}>Close</button></div>{statsQuery.isLoading?<p className="py-4 text-xs text-muted-foreground">Loading statistics…</p>:statsQuery.isError?<p className="text-xs text-destructive">Could not load campaign statistics.</p>:<><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{[['Impressions',statsQuery.data?.impressions],['Clicks',statsQuery.data?.clicks],['CTR',`${Number(statsQuery.data?.ctr??0).toFixed(2)}%`],['Conversions',statsQuery.data?.conversions],['Dismissals',statsQuery.data?.dismissals]].map(([k,v])=><div key={String(k)} className={`${panel} py-2`}><div className="text-[10px] text-muted-foreground">{k}</div><div className="text-sm font-semibold">{typeof v==='string'?v:fmt(Number(v))}</div></div>)}</div>{Boolean(statsQuery.data?.conversionValueByCurrency?.length) && <div className="mt-3 rounded-sm border p-2"><div className="mb-1 text-[10px] font-semibold text-muted-foreground">Conversion value by currency</div><div className="flex flex-wrap gap-2">{statsQuery.data?.conversionValueByCurrency?.map(row=><div key={row._id} className="text-xs"><span className="text-muted-foreground">{row._id}: </span><b>{row._id==='NGN'?'₦':row._id==='USD'?'$':''}{fmt(row.value)}</b><span className="ml-1 text-muted-foreground">({fmt(row.events)})</span></div>)}</div></div>}<div className="mt-3 overflow-x-auto"><table className="w-full text-xs"><thead className="border-b text-left text-[10px] text-muted-foreground"><tr>{['Day','Views','Clicks','Conversions'].map(k=><th className="px-2 py-2" key={k}>{k}</th>)}</tr></thead><tbody>{(statsQuery.data?.byDay??[]).map(row=><tr className="border-b last:border-0" key={row._id}><td className="px-2 py-1.5">{row._id}</td><td className="px-2 py-1.5">{fmt(row.impressions)}</td><td className="px-2 py-1.5">{fmt(row.clicks)}</td><td className="px-2 py-1.5">{fmt(row.conversions)}</td></tr>)}</tbody></table></div></>}</div></div>}

    {previewState && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" role="dialog" aria-modal="true"><div className="max-h-[85vh] w-full max-w-xl overflow-auto rounded-md border bg-background p-4 shadow-lg"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Campaign preview</h2><div className="flex items-center gap-2"><select className={`${input} w-28`} value={previewState.audience} onChange={e=>void showPreview(previewState.id,e.target.value as AdAudienceKey)}>{audienceKeys.map(a=><option key={a}>{a}</option>)}</select><button className={muted} onClick={()=>setPreviewState(null)}>Close</button></div></div>{previewState.loading?<p className="py-4 text-xs text-muted-foreground">Loading preview…</p>:previewState.error?<p className="text-xs text-destructive">{previewState.error}</p>:<><div className="mb-2 rounded border p-3"><div className="text-sm font-semibold">{previewState.result?.ad?.title??'Advertisement'}</div><div className="mt-1 text-xs text-muted-foreground">{previewState.result?.ad?.subTitle}</div>{previewState.result?.ad?.image?.url&&<img src={previewState.result.ad.image.url} alt="Ad preview" className="mt-2 max-h-44 w-full rounded object-contain"/>}</div><pre className="max-h-60 overflow-auto rounded bg-muted p-2 text-[10px]">{JSON.stringify(previewState.result?.content??null,null,2)}</pre></>}</div></div>}
  </div>;
}

