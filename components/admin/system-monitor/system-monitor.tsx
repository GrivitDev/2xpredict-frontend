/* Compact operational monitor for every backend monitoring domain. */
'use client';

import { useState } from 'react';
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

import SystemMonitorErrors from './system-monitor-errors';
import SystemMonitorHealth from './system-monitor-health';
import SystemMonitorOverview from './system-monitor-overview';
import SystemMonitorCrons from './system-monitor-crons';
import SystemMonitorStorage from './system-monitor-storage';
import SystemMonitorActivity from './system-monitor-activity';
import SystemMonitorSportsExplorer from './system-monitor-sports-explorer';
import SystemMonitorSportsV2 from './system-monitor-sports-v2';
import SystemMonitorModules from './system-monitor-modules';
import SystemMonitorDatabase from './system-monitor-database';
import BetLabAdmin from '@/components/admin/system-monitor/bet-lab/BetLabAdmin';
import PredictionEngineAdmin from '@/components/admin/system-monitor/prediction-engine/PredictionEngineAdmin';
import SettlementAdmin from '@/components/admin/system-monitor/settlement/SettlementAdmin';
import ModuleMonitorAdmin from './module-monitor';
import CustomerCareAdmin from './customer-care/CustomerCareAdmin';
import NotificationsMonitor from '@/components/admin/notifications/NotificationsMonitor';
import SystemMonitorCoverage from './system-monitor-coverage';

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

