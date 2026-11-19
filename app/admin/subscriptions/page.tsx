'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSubscriptionsMonitor } from '@/hooks/use-subscriptions';
import { paymentsQueryKeys } from '@/hooks/use-payments';
import { planConfigQueryKey } from '@/hooks/use-plan-config';
import PlanConfigPanel from '@/components/admin/subscriptions/PlanConfigPanel';
import BankDetailsPanel from '@/components/admin/subscriptions/BankDetailsPanel';
import PaymentsReviewPanel from '@/components/admin/subscriptions/PaymentsReviewPanel';
import BetLabSettingsPanel from '@/components/admin/subscriptions/BetLabSettingsPanel';
import { AdminError, AdminPageFrame, AdminPanel, AdminTabs, adminButton, displayValue } from '@/components/admin/AdminWorkspace';

type Tab = 'plans' | 'betlab' | 'bank' | 'payments' | 'monitor';

export default function AdminSubscriptionsPage() {
  const [tab, setTab] = useState<Tab>('plans');
  const queryClient = useQueryClient();
  const monitor = useSubscriptionsMonitor({ enabled: tab === 'monitor' });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: planConfigQueryKey });
    void queryClient.invalidateQueries({ queryKey: paymentsQueryKeys.all });
    void queryClient.invalidateQueries({ queryKey: ['bet-lab'] });
    if (tab === 'monitor') void monitor.refetch();
  };

  return (
    <AdminPageFrame
      title="Plans & payments"
      description="Pricing, Bet Lab virtual points, payment review, transfer details and subscription-module health."
      actions={<button type="button" className={adminButton} onClick={refresh}>Refresh</button>}
    >
      <AdminTabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'plans', label: 'Pricing' },
          { value: 'betlab', label: 'Bet Lab settings' },
          { value: 'bank', label: 'Bank details' },
          { value: 'payments', label: 'Payment review' },
          { value: 'monitor', label: 'Module health' },
        ]}
      />

      {tab === 'plans' && <PlanConfigPanel />}
      {tab === 'betlab' && <BetLabSettingsPanel />}
      {tab === 'bank' && <BankDetailsPanel />}
      {tab === 'payments' && <PaymentsReviewPanel />}

      {tab === 'monitor' && (
        <AdminPanel
          title="Subscription module monitor"
          meta={monitor.dataUpdatedAt ? `Updated ${new Date(monitor.dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Live health snapshot'}
          actions={<button type="button" className={adminButton} disabled={monitor.isFetching} onClick={() => void monitor.refetch()}>{monitor.isFetching ? 'Refreshing…' : 'Refresh'}</button>}
        >
          {monitor.isLoading ? (
            <div className="p-4 text-[11px] text-muted-foreground">Loading module health…</div>
          ) : monitor.isError ? (
            <div className="p-2.5"><AdminError error={monitor.error} retry={() => void monitor.refetch()} /></div>
          ) : (
            <div className="space-y-2 p-2.5">
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-4">
                {Object.entries((monitor.data && typeof monitor.data === 'object' ? monitor.data : {}) as Record<string, unknown>)
                  .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
                  .slice(0, 16)
                  .map(([key, value]) => (
                    <div key={key} className="min-w-0 rounded-md border border-border/70 px-2 py-1.5">
                      <p className="truncate text-[9px] uppercase tracking-wide text-muted-foreground">{key.replaceAll('_', ' ')}</p>
                      <p className="truncate text-[11px] font-semibold" title={String(value)}>{displayValue(value)}</p>
                    </div>
                  ))}
              </div>
              <details className="rounded-md border border-border/60">
                <summary className="cursor-pointer px-2 py-1.5 text-[10px] font-semibold">Full monitor response</summary>
                <pre className="max-h-[420px] overflow-auto border-t p-2 text-[10px] leading-4">{JSON.stringify(monitor.data, null, 2)}</pre>
              </details>
            </div>
          )}
        </AdminPanel>
      )}
    </AdminPageFrame>
  );
}
