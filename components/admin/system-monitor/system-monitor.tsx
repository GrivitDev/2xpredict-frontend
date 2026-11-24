/* Compact operational monitor for every backend monitoring domain. */
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  FaServer,
  FaFutbol,
  FaChartLine,
  FaListCheck,
  FaBullseye,
  FaWallet,
  FaRectangleAd,
  FaHeadset,
  FaGift,
  FaUsers,
  FaCreditCard,
  FaBell,
} from 'react-icons/fa6';

function MonitorPanelLoading() {
  return (
    <div aria-busy="true" className="space-y-2 rounded-lg border border-border/70 bg-card p-3">
      <div className="h-4 w-40 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-16 animate-pulse rounded-md bg-muted/70" />)}
      </div>
      <div className="h-28 animate-pulse rounded-md bg-muted/70" />
    </div>
  );
}

// The monitor is a collection of independent workspaces. Keep inactive tabs
// out of the initial route bundle and load each workspace on first selection.
// Next.js 16 requires the dynamic() options argument to be an object literal.
const SystemMonitorErrors = dynamic(() => import('./system-monitor-errors'), { loading: () => <MonitorPanelLoading /> });
const SystemMonitorHealth = dynamic(() => import('./system-monitor-health'), { loading: () => <MonitorPanelLoading /> });
const SystemMonitorOverview = dynamic(() => import('./system-monitor-overview'), { loading: () => <MonitorPanelLoading /> });
const SystemMonitorCrons = dynamic(() => import('./system-monitor-crons'), { loading: () => <MonitorPanelLoading /> });
const SystemMonitorStorage = dynamic(() => import('./system-monitor-storage'), { loading: () => <MonitorPanelLoading /> });
const SystemMonitorActivity = dynamic(() => import('./system-monitor-activity'), { loading: () => <MonitorPanelLoading /> });
const SystemMonitorSportsExplorer = dynamic(() => import('./system-monitor-sports-explorer'), { loading: () => <MonitorPanelLoading /> });
const SystemMonitorSportsV2 = dynamic(() => import('./system-monitor-sports-v2'), { loading: () => <MonitorPanelLoading /> });
const SystemMonitorModules = dynamic(() => import('./system-monitor-modules'), { loading: () => <MonitorPanelLoading /> });
const SystemMonitorDatabase = dynamic(() => import('./system-monitor-database'), { loading: () => <MonitorPanelLoading /> });
const BetLabAdmin = dynamic(() => import('@/components/admin/system-monitor/bet-lab/BetLabAdmin'), { loading: () => <MonitorPanelLoading /> });
const PredictionEngineAdmin = dynamic(() => import('@/components/admin/system-monitor/prediction-engine/PredictionEngineAdmin'), { loading: () => <MonitorPanelLoading /> });
const SettlementAdmin = dynamic(() => import('@/components/admin/system-monitor/settlement/SettlementAdmin'), { loading: () => <MonitorPanelLoading /> });
const ModuleMonitorAdmin = dynamic(() => import('./module-monitor'), { loading: () => <MonitorPanelLoading /> });
const CustomerCareAdmin = dynamic(() => import('./customer-care/CustomerCareAdmin'), { loading: () => <MonitorPanelLoading /> });
const NotificationsMonitor = dynamic(() => import('@/components/admin/notifications/NotificationsMonitor'), { loading: () => <MonitorPanelLoading /> });
const SystemMonitorCoverage = dynamic(() => import('./system-monitor-coverage'), { loading: () => <MonitorPanelLoading /> });

type ModuleId =
  | 'system'
  | 'sports'
  | 'odds'
  | 'prediction-engine'
  | 'settlement'
  | 'bet-lab'
  | 'ads'
  | 'customer-care'
  | 'promos'
  | 'referrals'
  | 'subscriptions'
  | 'notifications';

type SystemTab =
  | 'overview'
  | 'health'
  | 'crons'
  | 'errors'
  | 'activity'
  | 'storage'
  | 'modules'
  | 'database'
  | 'coverage';

type SportsTab = 'sports-overview' | 'sports-explorer';

const modules: { id: ModuleId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'system', label: 'System', icon: FaServer },
  { id: 'sports', label: 'Sports', icon: FaFutbol },
  { id: 'odds', label: 'Odds', icon: FaChartLine },
  { id: 'prediction-engine', label: 'Predictions', icon: FaBullseye },
  { id: 'settlement', label: 'Settlement', icon: FaListCheck },
  { id: 'bet-lab', label: 'Bet Lab', icon: FaWallet },
  { id: 'ads', label: 'Ads', icon: FaRectangleAd },
  { id: 'customer-care', label: 'Customer Care', icon: FaHeadset },
  { id: 'promos', label: 'Promos', icon: FaGift },
  { id: 'referrals', label: 'Referrals', icon: FaUsers },
  { id: 'subscriptions', label: 'Subscriptions', icon: FaCreditCard },
  { id: 'notifications', label: 'Notifications', icon: FaBell },
];

const systemTabs: { id: SystemTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'health', label: 'Health' },
  { id: 'modules', label: 'Modules' },
  { id: 'crons', label: 'Cron jobs' },
  { id: 'errors', label: 'Errors' },
  { id: 'activity', label: 'Activity' },
  { id: 'storage', label: 'Storage' },
  { id: 'database', label: 'Database' },
  { id: 'coverage', label: 'Coverage' },
];

const sportsTabs: { id: SportsTab; label: string }[] = [
  { id: 'sports-overview', label: 'Overview' },
  { id: 'sports-explorer', label: 'Data explorer' },
];

function TabButton({
  active,
  children,
  onClick,
  icon: Icon,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-md border px-2 text-[11px] font-medium transition-colors',
        active
          ? 'border-primary/20 bg-primary text-primary-foreground'
          : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/70 hover:text-foreground',
      ].join(' ')}
    >
      {Icon ? <Icon className="h-3 w-3 shrink-0" /> : null}
      {children}
    </button>
  );
}

export default function SystemMonitor() {
  const [moduleId, setModuleId] = useState<ModuleId>('system');
  const [systemTab, setSystemTab] = useState<SystemTab>('overview');
  const [sportsTab, setSportsTab] = useState<SportsTab>('sports-overview');

  function changeModule(next: ModuleId) {
    setModuleId(next);
    if (next === 'system') setSystemTab('overview');
    if (next === 'sports') setSportsTab('sports-overview');
  }

  return (
    <main className="min-w-0 space-y-1.5 pb-2">
      <header className="flex min-h-8 items-center justify-between gap-2">
        <h1 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">System Monitor</h1>
      </header>

      <div className="sticky top-0 z-30 space-y-1 border-y border-border/70 bg-background/95 py-1 backdrop-blur">
        <nav aria-label="Monitoring modules" className="flex gap-0.5 overflow-x-auto pb-0.5">
          {modules.map((item) => {
            const Icon = item.icon;
            return (
              <TabButton
                key={item.id}
                active={moduleId === item.id}
                icon={Icon}
                onClick={() => changeModule(item.id)}
              >
                {item.label}
              </TabButton>
            );
          })}
        </nav>

        {moduleId === 'system' ? (
          <nav aria-label="System tabs" className="flex gap-0.5 overflow-x-auto">
            {systemTabs.map((tab) => (
              <TabButton key={tab.id} active={systemTab === tab.id} onClick={() => setSystemTab(tab.id)}>
                {tab.label}
              </TabButton>
            ))}
          </nav>
        ) : null}

        {moduleId === 'sports' ? (
          <nav aria-label="Sports data tabs" className="flex gap-0.5 overflow-x-auto">
            {sportsTabs.map((tab) => (
              <TabButton key={tab.id} active={sportsTab === tab.id} onClick={() => setSportsTab(tab.id)}>
                {tab.label}
              </TabButton>
            ))}
          </nav>
        ) : null}
      </div>



      <div className="min-w-0">
        {moduleId === 'system' && systemTab === 'overview' ? <SystemMonitorOverview /> : null}
        {moduleId === 'system' && systemTab === 'health' ? <SystemMonitorHealth /> : null}
        {moduleId === 'system' && systemTab === 'modules' ? <SystemMonitorModules /> : null}
        {moduleId === 'system' && systemTab === 'crons' ? <SystemMonitorCrons /> : null}
        {moduleId === 'system' && systemTab === 'errors' ? <SystemMonitorErrors /> : null}
        {moduleId === 'system' && systemTab === 'activity' ? <SystemMonitorActivity /> : null}
        {moduleId === 'system' && systemTab === 'storage' ? <SystemMonitorStorage /> : null}
        {moduleId === 'system' && systemTab === 'database' ? <SystemMonitorDatabase /> : null}
        {moduleId === 'system' && systemTab === 'coverage' ? <SystemMonitorCoverage /> : null}

        {moduleId === 'sports' && sportsTab === 'sports-overview' ? <SystemMonitorSportsV2 /> : null}
        {moduleId === 'sports' && sportsTab === 'sports-explorer' ? <SystemMonitorSportsExplorer /> : null}

        {moduleId === 'odds' ? <ModuleMonitorAdmin key="odds" module="odds" /> : null}
        {moduleId === 'ads' ? <ModuleMonitorAdmin key="ads" module="ads" /> : null}
        {moduleId === 'promos' ? <ModuleMonitorAdmin key="promos" module="promos" /> : null}
        {moduleId === 'referrals' ? <ModuleMonitorAdmin key="referrals" module="referrals" /> : null}
        {moduleId === 'subscriptions' ? <ModuleMonitorAdmin key="subscriptions" module="subscriptions" /> : null}
        {moduleId === 'notifications' ? <NotificationsMonitor /> : null}
        {moduleId === 'customer-care' ? <CustomerCareAdmin /> : null}
        {moduleId === 'bet-lab' ? <BetLabAdmin /> : null}
        {moduleId === 'prediction-engine' ? <PredictionEngineAdmin /> : null}
        {moduleId === 'settlement' ? <SettlementAdmin /> : null}
      </div>
    </main>
  );
}

