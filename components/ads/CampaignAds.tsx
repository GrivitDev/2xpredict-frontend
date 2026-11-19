'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { adsService } from '@/services/ads.service';
import { useGetAdsQuery } from '@/hooks/use-ads';
import type { AdDevice, AdEventType, AdPage, AdPosition, AdTriggerEvent, PublicAd } from '@/types/ads';

interface Props {
  page: AdPage;
  position?: AdPosition;
  triggerEvent?: AdTriggerEvent;
  className?: string;
}
interface ClientKeys { visitorKey: string; sessionKey: string }
const createKey = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
function readOrCreate(storage: Storage, key: string) {
  const current = storage.getItem(key);
  if (current) return current;
  const next = createKey();
  storage.setItem(key, next);
  return next;
}
function detectDevice(): AdDevice {
  if (typeof window === 'undefined') return 'DESKTOP';
  if (window.innerWidth < 640) return 'MOBILE';
  if (window.innerWidth < 1024) return 'TABLET';
  return 'DESKTOP';
}
function safeString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}
function formatValue(value: unknown, suffix = ''): string | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return `${value > 1 && value < 100 && suffix === '%' ? value.toFixed(1) : value.toLocaleString()}${suffix}`;
}

function CampaignAdCard({ ad, page, device, position, keys, className }: {
  ad: PublicAd; page: AdPage; device: AdDevice; position?: AdPosition; keys: ClientKeys; className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const impressionRecorded = useRef(false);
  const [dismissed, setDismissed] = useState(false);
  const content = (ad.content ?? {}) as Record<string, unknown>;
  const display = (ad.display ?? []).find(d => !position || d.position === position) ?? ad.display?.[0];
  const selectedPosition = position ?? display?.position ?? 'INLINE';
  const title = ad.title || safeString(content.title) || 'Featured';
  const subtitle = ad.subTitle || safeString(content.subTitle);
  const description = ad.description || safeString(content.description);
  const imageUrl = ad.image?.url || (content.image && typeof content.image === 'object' ? safeString((content.image as Record<string,unknown>).url) : undefined);
  const media = (ad.media ?? content.media) as { url?:string; type?:string; posterUrl?:string; autoplay?:boolean; muted?:boolean; loop?:boolean } | undefined;
  const configuredActions = Array.isArray(ad.actions) ? ad.actions : [];
  const dynamicActions = Array.isArray(content.actions) ? content.actions : [];
  // Mongoose supplies [] for an unset actions field; prefer resolved dynamic CTAs in that case.
  const actions = (configuredActions.length ? configuredActions : dynamicActions) as Array<{label:string;url:string}>;
  const featured = content.featuredSelection && typeof content.featuredSelection === 'object' ? content.featuredSelection as Record<string, unknown> : undefined;
  const popup = ad.type === 'POPUP' || selectedPosition === 'POPUP';
  const interstitial = ad.type === 'INTERSTITIAL' || selectedPosition === 'INTERSTITIAL';
  const sticky = ad.type === 'STICKY' || selectedPosition.startsWith('STICKY_');
  const eventKey = useCallback((type: AdEventType) => `${ad._id}:${type}:${createKey()}`,[ad._id]);
  const track = useCallback(async (type: AdEventType, action?: { conversionType?:string; conversionValue?:number; currency?:'NGN'|'USD' }) => {
    try {
      await adsService.trackEvent({ path: { id: ad._id }, body: {
        type, eventKey: eventKey(type), visitorKey: keys.visitorKey, sessionKey: keys.sessionKey,
        page, position: selectedPosition, device, placement: selectedPosition,
        ...(action ?? {}), metadata: { source: 'campaign-renderer', clientTimestamp: Date.now() },
      } });
    } catch { /* Tracking failure must never interrupt ad delivery or navigation. */ }
  },[ad._id, device, eventKey, keys.sessionKey, keys.visitorKey, page, selectedPosition]);

  useEffect(() => {
    const target = ref.current;
    if (!target || impressionRecorded.current) return;
    if (typeof IntersectionObserver === 'undefined') {
      impressionRecorded.current = true;
      void track('IMPRESSION');
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.35) && !impressionRecorded.current) {
        impressionRecorded.current = true;
        void track('IMPRESSION');
        observer.disconnect();
      }
    }, { threshold: [0.35, 0.6] });
    observer.observe(target);
    return () => observer.disconnect();
  },[track]);

  const outerClass = `${className ?? ''} ${sticky ? 'fixed inset-x-2 bottom-2 z-40 mx-auto max-w-3xl shadow-xl' : ''} ${popup || interstitial ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3' : ''}`;
  const close = popup || interstitial;
  if (dismissed) return null;
  return <div className={outerClass}>
    <article ref={ref} className={`relative mx-auto w-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm ${interstitial ? 'max-w-2xl' : popup ? 'max-w-lg' : ''}`} style={{ width: display?.widthPercent ? `${display.widthPercent}%` : undefined, maxWidth: display?.maxWidth ?? display?.maxWidthPercent ? (display?.maxWidth ? `${display.maxWidth}px` : `${display?.maxWidthPercent}%`) : undefined, maxHeight: display?.maxHeight ? `${display.maxHeight}px` : undefined, aspectRatio: display?.aspectRatio, position: display?.fixed && !sticky ? 'sticky' : undefined }}>
      {close && <button type="button" aria-label="Dismiss advertisement" className="absolute right-2 top-2 z-10 rounded-full border bg-background/90 px-2 py-1 text-xs" onClick={()=>{setDismissed(true);void track('DISMISS');}}>×</button>}
      {(media?.type === 'VIDEO' && media.url) ? <video src={media.url} poster={media.posterUrl} autoPlay={media.autoplay} muted={media.muted ?? true} loop={media.loop} controls={!media.autoplay} playsInline className="max-h-64 w-full bg-black object-contain" /> : imageUrl ? <img src={imageUrl} alt={title} loading="lazy" className="max-h-64 w-full object-cover" style={{objectFit:display?.objectFit??'cover'}}/> : null}
      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sponsored</div><h3 className="truncate text-sm font-semibold">{title}</h3>{subtitle&&<p className="truncate text-xs text-muted-foreground">{subtitle}</p>}</div><span className="rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground">{ad.type??'AD'}</span></div>
        {description&&<p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>}
        <div className="grid grid-cols-2 gap-1.5 text-xs sm:grid-cols-3">
          {(safeString(content.homeTeamName)&&safeString(content.awayTeamName))&&<div className="col-span-2 rounded bg-muted/60 px-2 py-1.5 sm:col-span-1"><div className="font-medium">{safeString(content.homeTeamName)} vs {safeString(content.awayTeamName)}</div>{safeString(content.leagueId)&&<div className="text-[10px] text-muted-foreground">{safeString(content.leagueId)}</div>}</div>}
          {safeString(content.marketName)&&<div className="rounded bg-muted/60 px-2 py-1.5"><div className="text-[10px] text-muted-foreground">Market</div><div className="font-medium">{safeString(content.marketName)}</div></div>}
          {safeString(content.productType)&&<div className="rounded bg-muted/60 px-2 py-1.5"><div className="text-[10px] text-muted-foreground">Product</div><div className="font-medium">{safeString(content.productType)}</div></div>}
          {formatValue(typeof content.probability==='number'?content.probability*100:undefined,'%')&&<div className="rounded bg-muted/60 px-2 py-1.5"><div className="text-[10px] text-muted-foreground">Probability</div><div className="font-semibold">{formatValue((content.probability as number)*100,'%')}</div></div>}
          {formatValue(typeof content.confidence==='number'?content.confidence:typeof content.averageConfidence==='number'?content.averageConfidence:typeof content.generalConfidence==='number'?content.generalConfidence:undefined,'%')&&<div className="rounded bg-muted/60 px-2 py-1.5"><div className="text-[10px] text-muted-foreground">Confidence</div><div className="font-semibold">{formatValue((typeof content.confidence==='number'?content.confidence:content.averageConfidence??content.generalConfidence) as number,'%')}</div></div>}
          {typeof content.combinedOdds==='number'&&<div className="rounded bg-muted/60 px-2 py-1.5"><div className="text-[10px] text-muted-foreground">Combined odds</div><div className="font-semibold">{content.combinedOdds.toFixed(2)}</div></div>}
          {typeof content.legCount==='number'&&<div className="rounded bg-muted/60 px-2 py-1.5"><div className="text-[10px] text-muted-foreground">Selections</div><div className="font-semibold">{content.legCount}</div></div>}
          {typeof content.welcomePoints==='number'&&<div className="rounded bg-muted/60 px-2 py-1.5"><div className="text-[10px] text-muted-foreground">Welcome points</div><div className="font-semibold">{content.welcomePoints.toLocaleString()}</div></div>}
          {typeof content.rewardValue==='number'&&<div className="rounded bg-muted/60 px-2 py-1.5"><div className="text-[10px] text-muted-foreground">Reward</div><div className="font-semibold">{content.rewardValue.toLocaleString()}</div></div>}
          {typeof content.pointsAmount==='number'&&<div className="rounded bg-muted/60 px-2 py-1.5"><div className="text-[10px] text-muted-foreground">Points</div><div className="font-semibold">{content.pointsAmount.toLocaleString()}</div></div>}
          {typeof content.discountValue==='number'&&<div className="rounded bg-muted/60 px-2 py-1.5"><div className="text-[10px] text-muted-foreground">Discount</div><div className="font-semibold">{content.discountType==='percentage'?`${content.discountValue}%`:`${content.amountCurrency==='USD'?'$':'₦'}${content.discountValue.toLocaleString()}`}</div></div>}
          {typeof content.rewardDurationDays==='number'&&<div className="rounded bg-muted/60 px-2 py-1.5"><div className="text-[10px] text-muted-foreground">Duration</div><div className="font-semibold">{content.rewardDurationDays} days</div></div>}
        </div>
        {featured&&<div className="flex flex-wrap items-center gap-2 rounded bg-muted/40 px-2 py-1.5 text-xs"><span className="font-medium">{safeString(featured.selectionName)||safeString(featured.fullName)||safeString(featured.name)||'Featured selection'}</span>{typeof featured.probabilityPercent==='number'&&<span className="text-muted-foreground">{featured.probabilityPercent.toFixed(1)}%</span>}{typeof featured.probability==='number'&&typeof featured.probabilityPercent!=='number'&&<span className="text-muted-foreground">{(featured.probability*100).toFixed(1)}%</span>}{typeof featured.confidence==='number'&&<span className="text-muted-foreground">Confidence {featured.confidence.toFixed(0)}%</span>}{typeof featured.decimalOdds==='number'&&<span className="font-semibold">Odds {featured.decimalOdds.toFixed(2)}</span>}{typeof featured.fairOdds==='number'&&<span className="text-muted-foreground">Fair {featured.fairOdds.toFixed(2)}</span>}</div>}
        {safeString(content.promoCode)&&<div className="flex flex-wrap items-center gap-2 rounded border border-dashed px-2 py-1.5 text-xs"><span className="text-muted-foreground">Promo code</span><code className="font-semibold">{safeString(content.promoCode)}</code></div>}
        {Array.isArray(content.plans)&&content.plans.length>0&&<div className="grid gap-1 sm:grid-cols-3">{(content.plans as Array<Record<string,unknown>>).map((plan,index)=><div key={`${String(plan.plan)}-${index}`} className="rounded border px-2 py-1.5"><div className="text-[10px] font-medium">{safeString(plan.label)||safeString(plan.plan)}</div>{typeof plan.priceNGN==='number'&&<div className="text-xs font-semibold">₦{plan.priceNGN.toLocaleString()}</div>}{typeof plan.priceUSD==='number'&&<div className="text-[10px] text-muted-foreground">${plan.priceUSD.toLocaleString()}</div>}</div>)}</div>}
        {content.monthlyAllowanceByPlan !== null && content.monthlyAllowanceByPlan !== undefined && typeof content.monthlyAllowanceByPlan === 'object' && !Array.isArray(content.monthlyAllowanceByPlan) && <div className="flex flex-wrap gap-1.5">{Object.entries(content.monthlyAllowanceByPlan as Record<string,unknown>).map(([plan,points])=>typeof points==='number'?<span key={plan} className="rounded border px-2 py-1 text-[10px]">{plan}: {points.toLocaleString()} pts</span>:null)}</div>}
        {Array.isArray(content.legs)&&content.legs.length>0&&<div className="space-y-1">{(content.legs as Array<Record<string,unknown>>).slice(0,3).map((leg,index)=><div key={`${String(leg.eventId??index)}`} className="flex justify-between gap-2 rounded bg-muted/40 px-2 py-1 text-[10px]"><span className="truncate">{safeString(leg.homeTeamName)} vs {safeString(leg.awayTeamName)}</span><span className="shrink-0 font-medium">{safeString(leg.selectionName)||safeString(leg.marketName)||'Selection'}</span></div>)}</div>}
        {actions.length>0&&<div className="flex flex-wrap gap-1.5">{actions.map((action,index)=><Link key={`${action.url}-${index}`} href={action.url} target={action.url.startsWith('http')?'_blank':undefined} rel={action.url.startsWith('http')?'noopener noreferrer':undefined} onClick={()=>void track('CLICK')} className="inline-flex h-7 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90">{action.label||'Learn more'}</Link>)}</div>}
      </div>
    </article>
  </div>;
}

export function CampaignAds({ page, position, triggerEvent = 'VISIT', className }: Props) {
  const [device,setDevice] = useState<AdDevice>('DESKTOP');
  const [keys,setKeys] = useState<ClientKeys | null>(null);
  useEffect(()=>{
    const update=()=>setDevice(detectDevice()); update(); window.addEventListener('resize',update);
    try { setKeys({ visitorKey:readOrCreate(window.localStorage,'2xp-ads-visitor'), sessionKey:readOrCreate(window.sessionStorage,'2xp-ads-session') }); } catch { setKeys({visitorKey:createKey(),sessionKey:createKey()}); }
    return ()=>window.removeEventListener('resize',update);
  },[]);
  const args = useMemo(()=>({query:{page,device,position,triggerEvent,...(keys?{visitorKey:keys.visitorKey,sessionKey:keys.sessionKey}:{})}}),[page,device,position,triggerEvent,keys]);
  const query = useGetAdsQuery(args,Boolean(keys));
  if(query.isLoading||!keys||!query.data?.length)return null;
  return <div className={`space-y-2 ${className??''}`}>{query.data.map((ad)=><CampaignAdCard key={ad._id} ad={ad} page={page} device={device} position={position} keys={keys} className={className}/>)}</div>;
}

