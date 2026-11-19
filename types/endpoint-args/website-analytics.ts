/* Request contracts for website-analytics endpoints. */
import type { EndSessionBody, TrackEventsDto, TrackSessionDto } from '../requests';

export interface GetOverviewQuery {
  from?: string;
  to?: string;
}

export interface GetDashboardQuery {
  from?: string;
  to?: string;
}

export interface GetPageEngagementQuery {
  from?: string;
  to?: string;
  limit?: string;
}

export interface GetVisitorTypesQuery {
  from?: string;
  to?: string;
}

export interface GetConversionsQuery {
  from?: string;
  to?: string;
}

export interface GetPagesQuery {
  from?: string;
  to?: string;
  limit?: string;
}

export interface GetEntryPagesQuery {
  from?: string;
  to?: string;
  limit?: string;
}

export interface GetExitPagesQuery {
  from?: string;
  to?: string;
  limit?: string;
}

export interface GetVisitorsQuery {
  from?: string;
  to?: string;
}

export interface GetSourcesQuery {
  from?: string;
  to?: string;
  limit?: string;
}

export interface GetLocationsQuery {
  from?: string;
  to?: string;
  limit?: string;
}

export interface GetCitiesQuery {
  from?: string;
  to?: string;
  limit?: string;
}

export interface GetDevicesQuery {
  from?: string;
  to?: string;
}

export interface GetBrowsersQuery {
  from?: string;
  to?: string;
}

export interface GetOperatingSystemsQuery {
  from?: string;
  to?: string;
}

export interface GetEventTypesQuery {
  from?: string;
  to?: string;
  limit?: string;
}

export interface GetEventNamesQuery {
  from?: string;
  to?: string;
  limit?: string;
}

export interface GetSearchesQuery {
  from?: string;
  to?: string;
  limit?: string;
}

export interface GetFiltersQuery {
  from?: string;
  to?: string;
  limit?: string;
}

export interface GetHourlyTrendQuery {
  from?: string;
  to?: string;
}

export interface GetDailyTrendQuery {
  from?: string;
  to?: string;
}

export interface GetMonthlyTrendQuery {
  from?: string;
  to?: string;
}

export interface TrackEventsArgs {
  body: TrackEventsDto;
}

export interface TrackSessionArgs {
  body: TrackSessionDto;
}

export interface EndSessionArgs {
  body: EndSessionBody;
}

export interface GetOverviewArgs {
  query?: GetOverviewQuery;
}

export interface GetDashboardArgs {
  query?: GetDashboardQuery;
}

export interface GetPageEngagementArgs {
  query?: GetPageEngagementQuery;
}

export interface GetVisitorTypesArgs {
  query?: GetVisitorTypesQuery;
}

export interface GetConversionsArgs {
  query?: GetConversionsQuery;
}

export interface GetPagesArgs {
  query?: GetPagesQuery;
}

export interface GetEntryPagesArgs {
  query?: GetEntryPagesQuery;
}

export interface GetExitPagesArgs {
  query?: GetExitPagesQuery;
}

export interface GetVisitorsArgs {
  query?: GetVisitorsQuery;
}

export interface GetSourcesArgs {
  query?: GetSourcesQuery;
}

export interface GetLocationsArgs {
  query?: GetLocationsQuery;
}

export interface GetCitiesArgs {
  query?: GetCitiesQuery;
}

export interface GetDevicesArgs {
  query?: GetDevicesQuery;
}

export interface GetBrowsersArgs {
  query?: GetBrowsersQuery;
}

export interface GetOperatingSystemsArgs {
  query?: GetOperatingSystemsQuery;
}

export interface GetEventTypesArgs {
  query?: GetEventTypesQuery;
}

export interface GetEventNamesArgs {
  query?: GetEventNamesQuery;
}

export interface GetSearchesArgs {
  query?: GetSearchesQuery;
}

export interface GetFiltersArgs {
  query?: GetFiltersQuery;
}

export interface GetHourlyTrendArgs {
  query?: GetHourlyTrendQuery;
}

export interface GetDailyTrendArgs {
  query?: GetDailyTrendQuery;
}

export interface GetMonthlyTrendArgs {
  query?: GetMonthlyTrendQuery;
}

export interface GetUserAnalyticsArgs {
  path: { userId: string };
}

export interface GetVisitorAnalyticsArgs {
  path: { visitorId: string };
}
