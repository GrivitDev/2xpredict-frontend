/* Single client for prediction-engine and predictions-read controllers. */
import { apiRequest } from '../lib/axios';
import type {
  BuildSlipArgs, GenerateFixtureArgs, GetEventMarketsArgs, GetEventsArgs,
  GetQueueArgs, GetRunsArgs, GetSlipArgs, GetMarketCoverageArgs, GetMarketCoverageInventoryArgs, ListAdminCuratedPredictionsArgs,
  ListAdminPickCenterArgs, ListAdminSlipsArgs, PublishSlipArgs,
  SetCuratedPredictionPublicationArgs, RebuildCalibrationArgs, SyncQueueArgs,
  UpdateSlipLegsArgs, UpdateSportyBetArgs,
} from '../types/endpoint-args/prediction-engine';
import type {
  GetFixtureMarketsArgs, GetPickCenterArgs, ListMarketsArgs,
  ListPickCenterArgs, ListSlipsArgs,
} from '../types/endpoint-args/prediction-engine';
import type {
  AdminCuratedPredictionResponse, AdminPickCenterResponse, AdminSlipListResponse,
  CuratedPrediction, CuratedPredictionRefreshResult, MarketPrediction,
  PickCenterRecord, PredictionPage, PredictionSlip,
} from '../types/predictions';
import type {
  AutomaticSlipRefreshResult,
  MarketCalibrationRecord,
  MarketCatalogDefinition,
  PredictionEngineDashboard,
  PredictionEngineEventRecord,
  PredictionEngineQueueRecord,
  PredictionEngineRunRecord,
  PredictionQueueRecoveryResult,
  PredictionQueueRunNextResult,
  PredictionQueueSyncResult,
  RebuildCalibrationResult,
} from '../types/prediction-engine-monitor';

export const predictionEngineService = {
  // Normalized public/read controller routes: /predictions/*
  listMarkets: (args?: ListMarketsArgs) =>
    apiRequest<PredictionPage<MarketPrediction>>({ method: 'GET', path: '/predictions/markets', query: args?.query }),
  getFixtureMarkets: (args: GetFixtureMarketsArgs) =>
    apiRequest<MarketPrediction[]>({ method: 'GET', path: '/predictions/markets/:eventId', pathParams: args.path }),
  listPickCenter: (args?: ListPickCenterArgs) =>
    apiRequest<PredictionPage<PickCenterRecord>>({ method: 'GET', path: '/predictions/pick-center', query: args?.query }),
  getPickCenter: (args: GetPickCenterArgs) =>
    apiRequest<PickCenterRecord>({ method: 'GET', path: '/predictions/pick-center/:eventId', pathParams: args.path }),
  listSlips: (args?: ListSlipsArgs) =>
    apiRequest<PredictionPage<PredictionSlip>>({ method: 'GET', path: '/predictions/slips', query: args?.query }),
  getPublishedSlip: (args: GetSlipArgs) =>
    apiRequest<PredictionSlip>({ method: 'GET', path: '/predictions/slips/:slipId', pathParams: args.path }),

  // Prediction engine controller routes
  getCatalog: () => apiRequest<MarketCatalogDefinition[]>({ method: 'GET', path: '/predictions-engine/catalog' }),
  getDashboard: () => apiRequest<PredictionEngineDashboard>({ method: 'GET', path: '/predictions-engine/monitor' }),
  getRuns: (args?: GetRunsArgs) =>
    apiRequest<PredictionEngineRunRecord[]>({ method: 'GET', path: '/predictions-engine/monitor/runs', query: args?.query }),
  getQueue: (args?: GetQueueArgs) =>
    apiRequest<PredictionEngineQueueRecord[]>({ method: 'GET', path: '/predictions-engine/monitor/queue', query: args?.query }),
  getEvents: (args?: GetEventsArgs) =>
    apiRequest<PredictionEngineEventRecord[]>({ method: 'GET', path: '/predictions-engine/monitor/events', query: args?.query }),
  getEventMarkets: (args: GetEventMarketsArgs) =>
    apiRequest<MarketPrediction[]>({ method: 'GET', path: '/predictions-engine/monitor/markets/:eventId', pathParams: args.path }),
  getMarketCoverage: (args: GetMarketCoverageArgs) =>
    apiRequest<Record<string, unknown>>({ method: 'GET', path: '/predictions-engine/monitor/market-coverage/:eventId', pathParams: args.path }),
  getMarketCoverageInventory: (args?: GetMarketCoverageInventoryArgs) =>
    apiRequest<Record<string, unknown>>({ method: 'GET', path: '/predictions-engine/monitor/market-coverage', query: args?.query }),
  syncQueue: (args: SyncQueueArgs) =>
    apiRequest<PredictionQueueSyncResult>({ method: 'POST', path: '/predictions-engine/queue/sync', body: args.body }),
  recoverStaleQueue: () => apiRequest<PredictionQueueRecoveryResult>({ method: 'POST', path: '/predictions-engine/queue/recover-stale' }),
  runNextQueueItem: () => apiRequest<PredictionQueueRunNextResult>({ method: 'POST', path: '/predictions-engine/queue/run-next' }),
  generateFixture: (args: GenerateFixtureArgs) =>
    apiRequest<unknown>({ method: 'POST', path: '/predictions-engine/generate/:eventId', pathParams: args.path }),
  buildSlip: (args: BuildSlipArgs) =>
    apiRequest<PredictionSlip>({ method: 'POST', path: '/predictions-engine/slips', body: args.body }),
  listAdminSlips: (args?: ListAdminSlipsArgs) =>
    apiRequest<AdminSlipListResponse>({ method: 'GET', path: '/predictions-engine/admin/slips', query: args?.query }),
  listAdminPickCenter: (args?: ListAdminPickCenterArgs) =>
    apiRequest<AdminPickCenterResponse>({ method: 'GET', path: '/predictions-engine/admin/pick-center', query: args?.query }),
  listAdminCuratedPredictions: (args?: ListAdminCuratedPredictionsArgs) =>
    apiRequest<AdminCuratedPredictionResponse>({ method: 'GET', path: '/predictions-engine/admin/predictions', query: args?.query }),
  refreshCuratedPredictions: () =>
    apiRequest<CuratedPredictionRefreshResult>({ method: 'POST', path: '/predictions-engine/predictions/refresh' }),
  publishCuratedPrediction: (args: SetCuratedPredictionPublicationArgs) =>
    apiRequest<CuratedPrediction>({ method: 'POST', path: '/predictions-engine/predictions/:predictionId/publish', pathParams: args.path }),
  unpublishCuratedPrediction: (args: SetCuratedPredictionPublicationArgs) =>
    apiRequest<CuratedPrediction>({ method: 'POST', path: '/predictions-engine/predictions/:predictionId/unpublish', pathParams: args.path }),
  updateSlipLegs: (args: UpdateSlipLegsArgs) =>
    apiRequest<PredictionSlip>({ method: 'PATCH', path: '/predictions-engine/slips/:slipId/legs', pathParams: args.path, body: args.body }),
  updateSportyBet: (args: UpdateSportyBetArgs) =>
    apiRequest<PredictionSlip>({ method: 'PATCH', path: '/predictions-engine/slips/:slipId/sportybet', pathParams: args.path, body: args.body }),
  publishSlip: (args: PublishSlipArgs) =>
    apiRequest<PredictionSlip>({ method: 'POST', path: '/predictions-engine/slips/:slipId/publish', pathParams: args.path }),
  refreshSlips: () => apiRequest<AutomaticSlipRefreshResult>({ method: 'POST', path: '/predictions-engine/slips/refresh' }),
  getEngineSlip: (args: GetSlipArgs) =>
    apiRequest<PredictionSlip>({ method: 'GET', path: '/predictions-engine/slips/:slipId', pathParams: args.path }),
  rebuildCalibration: (args: RebuildCalibrationArgs) =>
    apiRequest<RebuildCalibrationResult>({ method: 'POST', path: '/predictions-engine/calibration/rebuild', body: args.body }),
  listCalibration: () => apiRequest<MarketCalibrationRecord[]>({ method: 'GET', path: '/predictions-engine/calibration' }),
} as const;
