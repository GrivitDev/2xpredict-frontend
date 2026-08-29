'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Activity,
  BarChart3,
  Globe,
  Clock3,
  Globe2,
  Laptop2,
  Monitor,
  MousePointerClick,
  RefreshCw,
  Smartphone,
  TrendingUp,
  Users,
  Workflow,
} from 'lucide-react';

import {
  getWebsiteAnalyticsBrowsers,
  getWebsiteAnalyticsCountries,
  getWebsiteAnalyticsDailyTrend,
  getWebsiteAnalyticsDevices,
  getWebsiteAnalyticsEvents,
  getWebsiteAnalyticsExitPages,
  getWebsiteAnalyticsMonthlyTrend,
  getWebsiteAnalyticsOperatingSystems,
  getWebsiteAnalyticsOverview,
  getWebsiteAnalyticsPages,
  getWebsiteAnalyticsRealtime,
  getWebsiteAnalyticsSources,
  getWebsiteAnalyticsVisitors,
  type AnalyticsBrowser,
  type AnalyticsCountry,
  type AnalyticsDevice,
  type AnalyticsEventType,
  type AnalyticsOperatingSystem,
  type AnalyticsPage,
  type AnalyticsTrend,
  type AnalyticsTrafficSource,
  type AnalyticsVisitorBreakdown,
  type WebsiteAnalyticsOverview,
  getWebsiteAnalyticsEntryPages,
} from '@/services/website-analytics.service';

/* =========================================================
   TYPES
========================================================= */

type RangePreset =
  | 'today'
  | '7d'
  | '30d'
  | '90d'
  | '6m'
  | 'year';

interface RealtimeData {
  totalActive: number;
  registered: number;
  anonymous: number;

  pages: Array<{
    path: string;
    count: number;
  }>;
}

interface ChartItem {
  label: string;
  value: number;
  secondary?: string;
}

/* =========================================================
   DEFAULTS
========================================================= */

const EMPTY_OVERVIEW: WebsiteAnalyticsOverview = {
  visitors: 0,
  sessions: 0,
  activeSessions: 0,
  pageViews: 0,
  events: 0,
  totalTimeMs: 0,
  averageSessionDurationMs: 0,
  bounceRate: 0,
  bouncedSessions: 0,
};

const EMPTY_REALTIME: RealtimeData = {
  totalActive: 0,
  registered: 0,
  anonymous: 0,
  pages: [],
};

/* =========================================================
   HELPERS
========================================================= */

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1,
  )}-${pad(date.getDate())}`;
}

function getRange(preset: RangePreset) {
  const now = new Date();

  const to = formatDate(now);

  const from = new Date(now);

  switch (preset) {
    case 'today':
      break;

    case '7d':
      from.setDate(
        from.getDate() - 6,
      );
      break;

    case '30d':
      from.setDate(
        from.getDate() - 29,
      );
      break;

    case '90d':
      from.setDate(
        from.getDate() - 89,
      );
      break;

    case '6m':
      from.setMonth(
        from.getMonth() - 6,
      );
      break;

    case 'year':
      from.setFullYear(
        from.getFullYear() - 1,
      );
      break;
  }

  return {
    from: formatDate(from),
    to,
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat(
    'en-NG',
  ).format(value || 0);
}

function formatPercent(value: number) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatDuration(ms: number) {
  const totalMinutes = Math.round(
    (ms || 0) / 60000,
  );

  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const hours = Math.floor(
    totalMinutes / 60,
  );

  const minutes =
    totalMinutes % 60;

  return minutes
    ? `${hours}h ${minutes}m`
    : `${hours}h`;
}

function formatDateLabel(
  value: string,
) {
  const date = new Date(
    `${value}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
    },
  );
}

function shortPath(path: string) {
  if (!path) {
    return 'Unknown';
  }

  if (path.length <= 34) {
    return path;
  }

  return `${path.slice(0, 31)}...`;
}

/* =========================================================
   PAGE
========================================================= */

export default function WebsiteAnalyticsDashboard() {
  const [
    preset,
    setPreset,
  ] = useState<RangePreset>('30d');

  const [
    overview,
    setOverview,
  ] = useState<WebsiteAnalyticsOverview>(
    EMPTY_OVERVIEW,
  );

  const [
    visitors,
    setVisitors,
  ] = useState<AnalyticsVisitorBreakdown[]>(
    [],
  );

  const [
    pages,
    setPages,
  ] = useState<AnalyticsPage[]>([]);

  const [
    entryPages,
    setEntryPages,
  ] = useState<AnalyticsPage[]>([]);

  const [
    exitPages,
    setExitPages,
  ] = useState<AnalyticsPage[]>([]);

  const [
    countries,
    setCountries,
  ] = useState<AnalyticsCountry[]>([]);

  const [
    devices,
    setDevices,
  ] = useState<AnalyticsDevice[]>([]);

  const [
    browsers,
    setBrowsers,
  ] = useState<AnalyticsBrowser[]>([]);

  const [
    operatingSystems,
    setOperatingSystems,
  ] = useState<
    AnalyticsOperatingSystem[]
  >([]);

  const [
    sources,
    setSources,
  ] = useState<AnalyticsTrafficSource[]>(
    [],
  );

  const [
    events,
    setEvents,
  ] = useState<AnalyticsEventType[]>([]);

  const [
    dailyTrend,
    setDailyTrend,
  ] = useState<AnalyticsTrend[]>([]);

  const [
    monthlyTrend,
    setMonthlyTrend,
  ] = useState<AnalyticsTrend[]>([]);

  const [
    realtime,
    setRealtime,
  ] = useState<RealtimeData>(
    EMPTY_REALTIME,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const range = useMemo(
    () => getRange(preset),
    [preset],
  );

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadAnalytics =
    useCallback(
      async (
        silent = false,
      ) => {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        try {
          const query = {
            from: range.from,
            to: `${range.to}T23:59:59.999Z`,
          };

          const [
            overviewData,
            visitorsData,
            pagesData,
            entryPagesData,
            exitPagesData,
            countriesData,
            devicesData,
            browsersData,
            operatingSystemsData,
            sourcesData,
            eventsData,
            dailyTrendData,
            monthlyTrendData,
          ] = await Promise.all([
            getWebsiteAnalyticsOverview(query),

            getWebsiteAnalyticsVisitors(query),

            getWebsiteAnalyticsPages(query),

            getWebsiteAnalyticsEntryPages(
              query,
            ),

            getWebsiteAnalyticsExitPages(
              query,
            ),

            getWebsiteAnalyticsCountries(
              query,
            ),

            getWebsiteAnalyticsDevices(
              query,
            ),

            getWebsiteAnalyticsBrowsers(
              query,
            ),

            getWebsiteAnalyticsOperatingSystems(
              query,
            ),

            getWebsiteAnalyticsSources(query),

            getWebsiteAnalyticsEvents(query),

            getWebsiteAnalyticsDailyTrend(
              query,
            ),

            getWebsiteAnalyticsMonthlyTrend(
              query,
            ),
          ]);

          setOverview(
            overviewData ?? EMPTY_OVERVIEW,
          );

          setVisitors(
            visitorsData ?? [],
          );

          setPages(
            pagesData ?? [],
          );

          setEntryPages(
            entryPagesData ?? [],
          );

          setExitPages(
            exitPagesData ?? [],
          );

          setCountries(
            countriesData ?? [],
          );

          setDevices(
            devicesData ?? [],
          );

          setBrowsers(
            browsersData ?? [],
          );

          setOperatingSystems(
            operatingSystemsData ?? [],
          );

          setSources(
            sourcesData ?? [],
          );

          setEvents(
            eventsData ?? [],
          );

          setDailyTrend(
            dailyTrendData ?? [],
          );

          setMonthlyTrend(
            monthlyTrendData ?? [],
          );

          try {
            const realtimeData =
              await getWebsiteAnalyticsRealtime();

            setRealtime(
              realtimeData ??
                EMPTY_REALTIME,
            );
          } catch {
            // Realtime failure must not
            // break the main dashboard.
          }
        } catch (requestError: any) {
          console.error(
            'Failed to load website analytics:',
            requestError,
          );

          setError(
            requestError?.response?.data
              ?.message ??
              'Unable to load website analytics.',
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [range.from, range.to],
    );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAnalytics();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadAnalytics]);

  /* =======================================================
     REALTIME REFRESH
  ======================================================= */

  useEffect(() => {
    const timer =
      window.setInterval(
        async () => {
          try {
            const data =
              await getWebsiteAnalyticsRealtime();

            setRealtime(
              data ??
                EMPTY_REALTIME,
            );
          } catch {
            // Ignore realtime-only failures.
          }
        },
        30000,
      );

    return () =>
      window.clearInterval(timer);
  }, []);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const registeredVisitors =
    visitors.find(
      (item) =>
        item.visitorType ===
        'registered',
    )?.visitors ?? 0;

  const anonymousVisitors =
    visitors.find(
      (item) =>
        item.visitorType ===
        'anonymous',
    )?.visitors ?? 0;

  const trendData =
    dailyTrend.length > 0
      ? dailyTrend
      : monthlyTrend;

  const trendLabel =
    dailyTrend.length > 0
      ? 'Daily'
      : 'Monthly';

  const visitorTrend: ChartItem[] =
    trendData.map((item) => ({
      label:
        item.date ??
        item.month ??
        '',
      value:
        item.visitors ?? 0,
    }));

  const sessionTrend: ChartItem[] =
    trendData.map((item) => ({
      label:
        item.date ??
        item.month ??
        '',
      value:
        item.sessions ?? 0,
    }));

  const pageViewTrend: ChartItem[] =
    trendData.map((item) => ({
      label:
        item.date ??
        item.month ??
        '',
      value:
        item.pageViews ?? 0,
    }));

  const pageChart: ChartItem[] =
    pages
      .slice(0, 8)
      .map((item) => ({
        label:
          shortPath(item.path),
        value: item.views,
        secondary:
          `${formatNumber(
            item.uniqueVisitors,
          )} visitors`,
      }));

  const countryChart: ChartItem[] =
    countries
      .slice(0, 8)
      .map((item) => ({
        label:
          item.country ||
          item.countryCode ||
          'Unknown',
        value: item.visitors,
        secondary:
          `${formatNumber(
            item.sessions,
          )} sessions`,
      }));

  const deviceChart: ChartItem[] =
    devices
      .filter(
        (item) => item.deviceType,
      )
      .slice(0, 6)
      .map((item) => ({
        label: item.deviceType,
        value: item.visitors,
      }));

  const browserChart: ChartItem[] =
    browsers
      .filter(
        (item) => item.browser,
      )
      .slice(0, 6)
      .map((item) => ({
        label: item.browser,
        value: item.visitors,
      }));

  const osChart: ChartItem[] =
    operatingSystems
      .filter(
        (item) =>
          item.operatingSystem,
      )
      .slice(0, 6)
      .map((item) => ({
        label:
          item.operatingSystem,
        value: item.visitors,
      }));

  const eventChart: ChartItem[] =
    events
      .slice(0, 8)
      .map((item) => ({
        label: item.eventType,
        value: item.count,
      }));

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <AdminAnalyticsShell>
        <DashboardLoading />
      </AdminAnalyticsShell>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <AdminAnalyticsShell>
        <section className="rounded-2xl border border-destructive/20 bg-destructive/5 p-10 text-center">
          <p className="text-sm font-semibold">
            Unable to load website analytics
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadAnalytics()
            }
            className="mt-5 inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-xs font-semibold transition hover:bg-muted"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </section>
      </AdminAnalyticsShell>
    );
  }

  return (
    <AdminAnalyticsShell>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="rounded-2xl border bg-card/95 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Website Analytics
                </h1>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Monitor traffic, engagement,
                behaviour and visitor activity.
              </p>

              <p className="mt-2 text-[10px] text-muted-foreground">
                {range.from} — {range.to}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex flex-wrap rounded-lg border bg-muted/20 p-1">
              {(
                [
                  ['today', 'Today'],
                  ['7d', '7 days'],
                  ['30d', '30 days'],
                  ['90d', '90 days'],
                  ['6m', '6 months'],
                  ['year', '1 year'],
                ] as const
              ).map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setPreset(value)
                    }
                    className={`
                      rounded-md
                      px-2.5
                      py-1.5
                      text-[10px]
                      font-semibold
                      transition
                      ${
                        preset === value
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-background hover:text-foreground'
                      }
                    `}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                void loadAnalytics(true)
              }
              disabled={refreshing}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-[10px] font-semibold transition hover:bg-muted disabled:opacity-60"
            >
              <RefreshCw
                className={
                  refreshing
                    ? 'h-3.5 w-3.5 animate-spin'
                    : 'h-3.5 w-3.5'
                }
              />

              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          LIVE PANEL
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b bg-muted/[0.02] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Activity className="h-4 w-4" />

              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>

            <div>
              <p className="text-sm font-bold">
                Real-time activity
              </p>

              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Visitors active within the last
                90 seconds.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <LiveStat
              label="Online"
              value={
                realtime.totalActive
              }
            />

            <LiveStat
              label="Registered"
              value={
                realtime.registered
              }
            />

            <LiveStat
              label="Anonymous"
              value={
                realtime.anonymous
              }
            />
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.2fr_1fr]">
          <div className="border-b p-4 lg:border-b-0 lg:border-r">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Current pages
            </p>

            {realtime.pages.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {realtime.pages
                  .slice(0, 8)
                  .map((page) => (
                    <div
                      key={page.path}
                      className="flex items-center justify-between gap-3 rounded-lg border bg-muted/[0.03] px-3 py-2.5"
                    >
                      <span className="min-w-0 truncate text-[10px] font-medium">
                        {page.path}
                      </span>

                      <span className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 px-1.5 text-[9px] font-bold text-primary">
                        {page.count}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <EmptyState text="No active pages." />
            )}
          </div>

          <div className="p-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Live distribution
            </p>

            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              <DistributionRow
                label="Registered"
                value={
                  realtime.registered
                }
                total={
                  realtime.totalActive
                }
              />

              <DistributionRow
                label="Anonymous"
                value={
                  realtime.anonymous
                }
                total={
                  realtime.totalActive
                }
              />

              <DistributionRow
                label="Total active"
                value={
                  realtime.totalActive
                }
                total={
                  realtime.totalActive
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRIMARY KPIs
      ===================================================== */}

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          icon={Users}
          label="Unique visitors"
          value={formatNumber(
            overview.visitors,
          )}
          description="Unique visitors"
        />

        <KpiCard
          icon={Workflow}
          label="Sessions"
          value={formatNumber(
            overview.sessions,
          )}
          description="Recorded visits"
        />

        <KpiCard
          icon={Clock3}
          label="Total time"
          value={formatDuration(
            overview.totalTimeMs,
          )}
          description="Total recorded time"
        />

        <KpiCard
          icon={MousePointerClick}
          label="Page views"
          value={formatNumber(
            overview.pageViews,
          )}
          description="Pages viewed"
        />
      </section>

      {/* =====================================================
          SECONDARY KPIs
      ===================================================== */}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniMetric
          label="Avg. session"
          value={formatDuration(
            overview.averageSessionDurationMs,
          )}
        />

        <MiniMetric
          label="Bounce rate"
          value={formatPercent(
            overview.bounceRate,
          )}
        />

        <MiniMetric
          label="Events"
          value={formatNumber(
            overview.events,
          )}
        />

        <MiniMetric
          label="Active sessions"
          value={formatNumber(
            overview.activeSessions,
          )}
        />
      </section>

      {/* =====================================================
          TREND ANALYSIS
      ===================================================== */}

      <section className="grid gap-3 xl:grid-cols-[1.65fr_1fr]">
        <Panel
          title={`${trendLabel} traffic`}
          description="Visitor and session movement"
          icon={TrendingUp}
        >
          <DualLineChart
            primary={visitorTrend}
            secondary={sessionTrend}
            primaryLabel="Visitors"
            secondaryLabel="Sessions"
          />
        </Panel>

        <Panel
          title="Visitor composition"
          description="Registered vs anonymous"
          icon={Users}
        >
          <DonutChart
            registered={
              registeredVisitors
            }
            anonymous={
              anonymousVisitors
            }
          />

          <div className="mt-5 grid grid-cols-2 gap-2">
            <LegendMetric
              label="Registered"
              value={
                registeredVisitors
              }
            />

            <LegendMetric
              label="Anonymous"
              value={
                anonymousVisitors
              }
            />
          </div>
        </Panel>
      </section>

      {/* =====================================================
          PAGE PERFORMANCE
      ===================================================== */}

      <section className="grid gap-3 xl:grid-cols-[1.25fr_1fr]">
        <Panel
          title="Top pages"
          description="Most viewed pages in the selected period"
          icon={Monitor}
        >
          <HorizontalBars
            items={pageChart}
          />
        </Panel>

        <Panel
          title="Page views trend"
          description="Daily or monthly page-view movement"
          icon={BarChart3}
        >
          <CompactLineChart
            data={pageViewTrend}
          />
        </Panel>
      </section>

      {/* =====================================================
          ENTRY / EXIT
      ===================================================== */}

      <section className="grid gap-3 xl:grid-cols-2">
        <RankedTable
        title="Top entry pages"
        description="Where sessions begin"
        data={entryPages}
        />

        <RankedTable
        title="Top exit pages"
        description="Where sessions end"
        data={exitPages}
        />
    </section>

      {/* =====================================================
          GEO + DEVICES
      ===================================================== */}

      <section className="grid gap-3 xl:grid-cols-2">
        <Panel
          title="Countries"
          description="Visitor distribution by country"
          icon={Globe2}
        >
          <HorizontalBars
            items={countryChart}
          />
        </Panel>

        <Panel
          title="Devices"
          description="Visitor distribution by device"
          icon={Smartphone}
        >
          <VerticalBars
            items={deviceChart}
          />
        </Panel>
      </section>

      {/* =====================================================
          BROWSER + OS
      ===================================================== */}

      <section className="grid gap-3 xl:grid-cols-2">
        <Panel
          title="Browsers"
          description="Browser usage among visitors"
          icon={Globe}
        >
          <VerticalBars
            items={browserChart}
          />
        </Panel>

        <Panel
          title="Operating systems"
          description="Operating systems used by visitors"
          icon={Laptop2}
        >
          <HorizontalBars
            items={osChart}
          />
        </Panel>
      </section>

      {/* =====================================================
          EVENTS + SOURCES
      ===================================================== */}

      <section className="grid gap-3 xl:grid-cols-[1fr_1.25fr]">
        <Panel
          title="Event activity"
          description="Most frequently recorded actions"
          icon={MousePointerClick}
        >
          <HorizontalBars
            items={eventChart}
          />
        </Panel>

        <TrafficSourcesTable
          data={sources}
        />
      </section>

      {/* =====================================================
          MONTHLY OVERVIEW
      ===================================================== */}

      {monthlyTrend.length > 0 && (
        <Panel
          title="Long-term traffic"
          description="Monthly visitors, sessions and page views"
          icon={BarChart3}
        >
          <MultiMetricBars
            data={monthlyTrend}
          />
        </Panel>
      )}
    </AdminAnalyticsShell>
  );
}

/* =========================================================
   SHELL
========================================================= */

function AdminAnalyticsShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-w-0 space-y-3 p-3 sm:p-4 xl:space-y-4 xl:p-5">
      {children}
    </main>
  );
}

/* =========================================================
   KPI
========================================================= */

function KpiCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition hover:border-primary/20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-70" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/10 bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold tracking-tight tabular-nums xl:text-2xl">
        {value}
      </p>

      <p className="mt-1 text-[9px] text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   MINI METRIC
========================================================= */

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-card px-3.5 py-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-base font-bold tabular-nums">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   LIVE
========================================================= */

function LiveStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-[88px] rounded-xl border bg-background px-3 py-2 text-center">
      <p className="text-lg font-bold tabular-nums">
        {formatNumber(value)}
      </p>

      <p className="mt-0.5 text-[8px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function DistributionRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percent =
    total > 0
      ? (value / total) * 100
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-medium">
          {label}
        </span>

        <span className="text-[9px] font-semibold tabular-nums">
          {formatNumber(value)}
        </span>
      </div>

      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted/50">
        <div
          className="h-full rounded-full bg-primary"
          style={{
            width: `${Math.max(
              value > 0 ? 2 : 0,
              percent,
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   PANEL
========================================================= */

function Panel({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: typeof BarChart3;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-primary/10 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold tracking-tight">
            {title}
          </h2>

          <p className="mt-0.5 text-[9px] text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   DUAL LINE CHART
========================================================= */

function DualLineChart({
  primary,
  secondary,
  primaryLabel,
  secondaryLabel,
}: {
  primary: ChartItem[];
  secondary: ChartItem[];
  primaryLabel: string;
  secondaryLabel: string;
}) {
  if (!primary.length) {
    return <EmptyState text="No trend data available." />;
  }

  const width = 800;
  const height = 280;
  const paddingX = 34;
  const paddingTop = 20;
  const paddingBottom = 34;

  const allValues = [
    ...primary.map(
      (item) => item.value,
    ),
    ...secondary.map(
      (item) => item.value,
    ),
  ];

  const maxValue = Math.max(
    ...allValues,
    1,
  );

  const count = Math.max(
    primary.length,
    1,
  );

  const step =
    count > 1
      ? (width -
          paddingX * 2) /
        (count - 1)
      : 0;

  const toPoint = (
    value: number,
    index: number,
  ) => ({
    x:
      paddingX +
      index * step,

    y:
      height -
      paddingBottom -
      (value / maxValue) *
        (height -
          paddingTop -
          paddingBottom),
  });

  const primaryPoints =
    primary.map(
      (item, index) =>
        toPoint(
          item.value,
          index,
        ),
    );

  const secondaryPoints =
    secondary.map(
      (item, index) =>
        toPoint(
          item.value,
          index,
        ),
    );

  const primaryPolyline =
    primaryPoints
      .map(
        (point) =>
          `${point.x},${point.y}`,
      )
      .join(' ');

  const secondaryPolyline =
    secondaryPoints
      .map(
        (point) =>
          `${point.x},${point.y}`,
      )
      .join(' ');

  const labelEvery =
    Math.max(
      1,
      Math.ceil(
        primary.length / 6,
      ),
    );

  return (
    <div>
      <div className="mb-3 flex items-center gap-4">
        <ChartLegend
          label={primaryLabel}
          primary
        />

        <ChartLegend
          label={secondaryLabel}
        />
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[280px] w-full"
      >
        {[0, 25, 50, 75, 100].map(
          (percent) => {
            const y =
              height -
              paddingBottom -
              (percent / 100) *
                (height -
                  paddingTop -
                  paddingBottom);

            return (
              <line
                key={percent}
                x1={paddingX}
                x2={
                  width - paddingX
                }
                y1={y}
                y2={y}
                className="stroke-border/60"
                strokeWidth="1"
              />
            );
          },
        )}

        <polyline
          points={primaryPolyline}
          fill="none"
          className="stroke-primary"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <polyline
          points={
            secondaryPolyline
          }
          fill="none"
          className="stroke-muted-foreground/60"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="6 5"
        />

        {primaryPoints.map(
          (point, index) => (
            <circle
              key={`primary-${index}`}
              cx={point.x}
              cy={point.y}
              r="3"
              className="fill-primary"
            />
          ),
        )}

        {primary.map(
          (item, index) => {
            if (
              index % labelEvery !== 0 &&
              index !==
                primary.length - 1
            ) {
              return null;
            }

            return (
              <text
                key={`label-${index}`}
                x={
                  primaryPoints[
                    index
                  ]?.x ?? 0
                }
                y={
                  height - 10
                }
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {item.label.includes(
                  '-',
                )
                  ? formatDateLabel(
                      item.label,
                    )
                  : item.label}
              </text>
            );
          },
        )}
      </svg>
    </div>
  );
}

/* =========================================================
   COMPACT LINE CHART
========================================================= */

function CompactLineChart({
  data,
}: {
  data: ChartItem[];
}) {
  if (!data.length) {
    return <EmptyState text="No chart data available." />;
  }

  const max = Math.max(
    ...data.map(
      (item) => item.value,
    ),
    1,
  );

  return (
    <div className="h-[280px] overflow-hidden">
      <div className="flex h-full items-end gap-1.5 overflow-x-auto pb-6">
        {data.map(
          (
            item,
            index,
          ) => {
            const height =
              Math.max(
                item.value > 0
                  ? 4
                  : 0,
                (item.value / max) *
                  100,
              );

            return (
              <div
                key={`${item.label}-${index}`}
                className="flex h-full min-w-[24px] flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-[8px] font-semibold tabular-nums text-muted-foreground">
                  {formatNumber(
                    item.value,
                  )}
                </span>

                <div className="relative flex h-[190px] w-full items-end rounded-md bg-muted/25">
                  <div
                    className="w-full rounded-md bg-primary/80 transition-all"
                    style={{
                      height: `${height}%`,
                    }}
                  />
                </div>

                <span className="max-w-14 truncate text-[7px] text-muted-foreground">
                  {item.label}
                </span>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}

/* =========================================================
   DONUT
========================================================= */

function DonutChart({
  registered,
  anonymous,
}: {
  registered: number;
  anonymous: number;
}) {
  const total =
    registered +
    anonymous;

  if (!total) {
    return (
      <EmptyState text="No visitor composition data." />
    );
  }

  const registeredPercent =
    (registered / total) *
    100;

  return (
    <div className="flex justify-center">
      <div
        className="relative flex h-52 w-52 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(
            hsl(var(--primary)) 0 ${registeredPercent}%,
            hsl(var(--muted)) ${registeredPercent}% 100%
          )`,
        }}
      >
        <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full border bg-card shadow-sm">
          <span className="text-2xl font-bold tabular-nums">
            {formatNumber(total)}
          </span>

          <span className="mt-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
            visitors
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HORIZONTAL BAR CHART
========================================================= */

function HorizontalBars({
  items,
}: {
  items: ChartItem[];
}) {
  if (!items.length) {
    return (
      <EmptyState text="No data available." />
    );
  }

  const max = Math.max(
    ...items.map(
      (item) => item.value,
    ),
    1,
  );

  return (
    <div className="space-y-3.5">
      {items.map(
        (
          item,
          index,
        ) => {
          const width =
            Math.max(
              item.value > 0
                ? 2
                : 0,
              (item.value / max) *
                100,
            );

          return (
            <div
              key={`${item.label}-${index}`}
              className="min-w-0"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-[10px] font-medium">
                  {item.label}
                </span>

                <div className="flex shrink-0 items-center gap-2">
                  {item.secondary && (
                    <span className="text-[8px] text-muted-foreground">
                      {item.secondary}
                    </span>
                  )}

                  <span className="text-[9px] font-bold tabular-nums">
                    {formatNumber(
                      item.value,
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted/50">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${width}%`,
                  }}
                />
              </div>
            </div>
          );
        },
      )}
    </div>
  );
}

/* =========================================================
   VERTICAL BARS
========================================================= */

function VerticalBars({
  items,
}: {
  items: ChartItem[];
}) {
  if (!items.length) {
    return (
      <EmptyState text="No data available." />
    );
  }

  const max = Math.max(
    ...items.map(
      (item) => item.value,
    ),
    1,
  );

  return (
    <div className="flex h-[250px] items-end gap-2 overflow-x-auto pb-6">
      {items.map(
        (
          item,
          index,
        ) => {
          const height =
            Math.max(
              item.value > 0
                ? 4
                : 0,
              (item.value / max) *
                100,
            );

          return (
            <div
              key={`${item.label}-${index}`}
              className="flex min-w-12 flex-1 flex-col items-center justify-end gap-2"
            >
              <span className="text-[8px] font-bold tabular-nums text-muted-foreground">
                {formatNumber(
                  item.value,
                )}
              </span>

              <div className="flex h-40 w-full items-end rounded-lg bg-muted/25">
                <div
                  className="w-full rounded-lg bg-primary/80"
                  style={{
                    height: `${height}%`,
                  }}
                />
              </div>

              <span className="max-w-16 truncate text-center text-[8px] font-medium text-muted-foreground">
                {item.label}
              </span>
            </div>
          );
        },
      )}
    </div>
  );
}

/* =========================================================
   MULTI METRIC MONTHLY
========================================================= */

function MultiMetricBars({
  data,
}: {
  data: AnalyticsTrend[];
}) {
  if (!data.length) {
    return (
      <EmptyState text="No long-term data available." />
    );
  }

  const max = Math.max(
    ...data.flatMap(
      (item) => [
        item.visitors,
        item.sessions,
        item.pageViews,
      ],
    ),
    1,
  );

  return (
    <div className="space-y-4">
      {data.map(
        (
          item,
          index,
        ) => (
          <div
            key={`${item.month}-${index}`}
            className="grid grid-cols-[64px_1fr] items-center gap-4"
          >
            <span className="text-[9px] font-semibold text-muted-foreground">
              {item.month}
            </span>

            <div className="space-y-1.5">
              <MultiBar
                label="Visitors"
                value={
                  item.visitors
                }
                max={max}
              />

              <MultiBar
                label="Sessions"
                value={
                  item.sessions
                }
                max={max}
              />

              <MultiBar
                label="Views"
                value={
                  item.pageViews
                }
                max={max}
              />
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function MultiBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const width =
    Math.max(
      value > 0 ? 1.5 : 0,
      (value / max) *
        100,
    );

  return (
    <div className="flex items-center gap-2">
      <span className="w-12 text-[8px] text-muted-foreground">
        {label}
      </span>

      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/50">
        <div
          className="h-full rounded-full bg-primary/80"
          style={{
            width: `${width}%`,
          }}
        />
      </div>

      <span className="w-14 text-right text-[8px] font-semibold tabular-nums">
        {formatNumber(value)}
      </span>
    </div>
  );
}

/* =========================================================
   TRAFFIC TABLE
========================================================= */

function TrafficSourcesTable({
  data,
}: {
  data: AnalyticsTrafficSource[];
}) {
  return (
    <section className="min-w-0 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-primary/10 text-primary">
          <Workflow className="h-3.5 w-3.5" />
        </div>

        <div>
          <h2 className="text-sm font-bold">
            Traffic sources
          </h2>

          <p className="mt-0.5 text-[9px] text-muted-foreground">
            Where your visitors originated.
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border">
        {data.length ? (
          <table className="w-full text-left">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-3 py-2.5 text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                  Source
                </th>

                <th className="px-3 py-2.5 text-right text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                  Visitors
                </th>

                <th className="px-3 py-2.5 text-right text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                  Sessions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {data
                .slice(0, 8)
                .map(
                  (
                    item,
                    index,
                  ) => (
                    <tr
                      key={`${item.utmSource}-${item.referrer}-${index}`}
                      className="transition-colors hover:bg-muted/20"
                    >
                      <td className="max-w-[240px] px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-semibold">
                            {item.utmSource ||
                              item.referrer ||
                              'Direct'}
                          </p>

                          {(item.utmMedium ||
                            item.utmCampaign) && (
                            <p className="mt-0.5 truncate text-[8px] text-muted-foreground">
                              {item.utmMedium ||
                                'organic'}

                              {item.utmCampaign
                                ? ` · ${item.utmCampaign}`
                                : ''}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-2.5 text-right text-[9px] font-semibold tabular-nums">
                        {formatNumber(
                          item.visitors,
                        )}
                      </td>

                      <td className="px-3 py-2.5 text-right text-[9px] font-semibold tabular-nums">
                        {formatNumber(
                          item.sessions,
                        )}
                      </td>
                    </tr>
                  ),
                )}
            </tbody>
          </table>
        ) : (
          <EmptyState text="No traffic-source data." />
        )}
      </div>
    </section>
  );
}

/* =========================================================
   RANKED TABLE
========================================================= */

function RankedTable({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: AnalyticsPage[];
}) {
  return (
    <section className="min-w-0 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold">
            {title}
          </h2>

          <p className="mt-0.5 text-[9px] text-muted-foreground">
            {description}
          </p>
        </div>

        <span className="rounded-full border bg-muted/30 px-2 py-1 text-[8px] font-semibold text-muted-foreground">
          Top 10
        </span>
      </div>

      <div className="mt-4 divide-y">
        {data.length ? (
          data
            .slice(0, 10)
            .map(
              (
                item,
                index,
              ) => (
                <div
                  key={`${item.path}-${index}`}
                  className="flex items-center gap-3 py-2.5"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted/40 text-[8px] font-bold text-muted-foreground">
                    {index + 1}
                  </span>

                  <span className="min-w-0 flex-1 truncate text-[10px] font-medium">
                    {item.path}
                  </span>

                  <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-[9px] font-bold tabular-nums text-primary">
                    {formatNumber(
                      item.views,
                    )}
                  </span>
                </div>
              ),
            )
        ) : (
          <EmptyState text="No data available." />
        )}
      </div>
    </section>
  );
}

/* =========================================================
   LEGEND
========================================================= */

function ChartLegend({
  label,
  primary = false,
}: {
  label: string;
  primary?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`
          h-2 w-2 rounded-full
          ${
            primary
              ? 'bg-primary'
              : 'bg-muted-foreground/50'
          }
        `}
      />

      <span className="text-[9px] font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function LegendMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border bg-muted/[0.03] p-2.5">
      <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold tabular-nums">
        {formatNumber(value)}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed bg-muted/[0.02]">
      <p className="text-[10px] text-muted-foreground">
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function DashboardLoading() {
  return (
    <div className="space-y-3">
      <div className="h-24 animate-pulse rounded-2xl border bg-muted/20" />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border bg-muted/20"
          />
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {Array.from({
          length: 2,
        }).map((_, index) => (
          <div
            key={index}
            className="h-80 animate-pulse rounded-2xl border bg-muted/20"
          />
        ))}
      </div>
    </div>
  );
}