/** Single client for Settlement admin operations and monitoring endpoints. */
import { apiRequest } from '../lib/axios';
import type {
  GetEventsArgs, GetJobsArgs, GetRunsArgs, RequeueFixtureArgs,
  GetOverdueBetLabLegsArgs, ManualSettleBetLabLegArgs,
  ManualSettlePredictionSelectionArgs,
} from '../types/endpoint-args/settlement';
import type {
  RequeueFixtureResponse, SettlementEventsResponse, SettlementJob,
  SettlementMonitorOverview, SettlementPage, SettlementRun,
  OverdueBetLabLegsResponse, ManualBetLabLegSettlementResponse,
  ManualPredictionSelectionSettlementResponse,
} from '../types/settlement-admin';

export const settlementService = {
  getMonitor: () => apiRequest<SettlementMonitorOverview>({ method: 'GET', path: '/settlement/admin/monitor' }),
  getJobs: (args?: GetJobsArgs) =>
    apiRequest<SettlementPage<SettlementJob>>({ method: 'GET', path: '/settlement/admin/jobs', query: args?.query }),
  getRuns: (args?: GetRunsArgs) =>
    apiRequest<SettlementPage<SettlementRun>>({ method: 'GET', path: '/settlement/admin/runs', query: args?.query }),
  getEvents: (args?: GetEventsArgs) =>
    apiRequest<SettlementEventsResponse>({ method: 'GET', path: '/settlement/admin/events', query: args?.query }),
  requeueFixture: (args: RequeueFixtureArgs) =>
    apiRequest<RequeueFixtureResponse>({
      method: 'POST', path: '/settlement/admin/fixtures/:eventId/requeue',
      pathParams: args.path, query: args.query,
    }),
  getOverdueBetLabLegs: (args?: GetOverdueBetLabLegsArgs) =>
    apiRequest<OverdueBetLabLegsResponse>({ method: 'GET', path: '/settlement/admin/bet-lab/overdue-legs', query: args?.query }),
  manuallySettleBetLabLeg: (args: ManualSettleBetLabLegArgs) =>
    apiRequest<ManualBetLabLegSettlementResponse>({
      method: 'POST', path: '/settlement/admin/bet-lab/tickets/:ticketId/legs/:legId/manual-settlement',
      pathParams: args.path, body: args.body,
    }),
  manuallySettlePredictionSelection: (args: ManualSettlePredictionSelectionArgs) =>
    apiRequest<ManualPredictionSelectionSettlementResponse>({
      method: 'POST', path: '/settlement/admin/predictions/markets/:marketPredictionId/selections/:selectionKey/manual-settlement',
      pathParams: args.path, body: args.body,
    }),
} as const;

/** Temporary alias for existing admin hook imports. */
export const settlementAdminService = settlementService;
