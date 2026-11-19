import type { RebuildCalibrationBody, SyncQueueBody, UpdateSportyBetBody } from '../requests';
import type { PredictionEventLevel, PredictionQueueStatus } from '../prediction-engine-monitor';
import type { ActiveSlipProductType, AdminCuratedPredictionQuery, MarketListQuery, PickCenterQuery, SlipListQuery, SlipProductType, SureOddsProduct, SureOddsTier, UpdatePredictionSlipLegsPayload } from '../predictions';
export interface GetRunsQuery { limit?: number | string }
export interface GetQueueQuery { status?: PredictionQueueStatus; limit?: number | string }
export interface GetEventsQuery { limit?: number | string; level?: PredictionEventLevel }
export interface GetRunsArgs { query?: GetRunsQuery }
export interface GetQueueArgs { query?: GetQueueQuery }
export interface GetEventsArgs { query?: GetEventsQuery }
export interface GetEventMarketsArgs { path: { eventId: string } }
export interface SyncQueueArgs { body: SyncQueueBody }
export interface GenerateFixtureArgs { path: { eventId: string } }
export interface BuildSlipBody {
  eventIds?: string[]; name?: string; selectionCount?: number;
  minimumProbability?: number; minimumConfidence?: number;
  fixtureFrom?: string; fixtureTo?: string; createdBy?: string; publish?: boolean;
  productType?: ActiveSlipProductType; sureOddsTier?: SureOddsTier; sureOddsProduct?: SureOddsProduct;
}
export interface BuildSlipArgs { body: BuildSlipBody }
export interface AdminSlipsQuery { from?: string; to?: string; productType?: SlipProductType; automatic?: boolean; page?: number; pageSize?: number; status?: string }
export interface AdminPickCenterQuery { leagueId?: string; from?: string; to?: string; page?: number; pageSize?: number; includePast?: boolean }
export type AdminCuratedPredictionsQuery = AdminCuratedPredictionQuery;
export interface ListAdminSlipsArgs { query?: AdminSlipsQuery }
export interface ListAdminPickCenterArgs { query?: AdminPickCenterQuery }
export interface ListAdminCuratedPredictionsArgs { query?: AdminCuratedPredictionsQuery }
export type UpdateSlipLegsBody = UpdatePredictionSlipLegsPayload;
export interface UpdateSlipLegsArgs { path: { slipId: string }; body: UpdateSlipLegsBody }
export interface UpdateSportyBetArgs { path: { slipId: string }; body: UpdateSportyBetBody }
export interface PublishSlipArgs { path: { slipId: string } }
export interface SetCuratedPredictionPublicationArgs { path: { predictionId: string } }
export interface GetSlipArgs { path: { slipId: string } }
export interface RebuildCalibrationArgs { body: RebuildCalibrationBody }
export interface ListMarketsArgs { query?: MarketListQuery }
export interface GetFixtureMarketsArgs { path: { eventId: string } }
export interface ListPickCenterArgs { query?: PickCenterQuery }
export interface GetPickCenterArgs { path: { eventId: string } }
export interface ListSlipsArgs { query?: Omit<SlipListQuery, 'includeDrafts'> }
export interface GetPublicSlipArgs { path: { slipId: string } }
export interface GetMarketCoverageArgs { path: { eventId: string } }
export interface GetMarketCoverageInventoryArgs { query?: { from?: string; to?: string; leagueId?: string; page?: number; pageSize?: number } }
