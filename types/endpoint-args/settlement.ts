import type { SettlementEventQuery, SettlementJobQuery, SettlementRunQuery } from '../monitoring';
import type { ManualBetLabLegSettlementRequest, ManualPredictionSelectionSettlementRequest } from '../settlement-admin';
export type RequeueFixtureQuery = { leagueId?: string };
export interface GetJobsArgs { query?: SettlementJobQuery }
export interface GetRunsArgs { query?: SettlementRunQuery }
export interface GetEventsArgs { query?: SettlementEventQuery }
export interface RequeueFixtureArgs { path: { eventId: string }; query?: RequeueFixtureQuery }
export interface GetOverdueBetLabLegsQuery { olderThanHours?: number; page?: number; limit?: number }
export interface GetOverdueBetLabLegsArgs { query?: GetOverdueBetLabLegsQuery }
export interface ManualSettlementReasonBody { reason: string }
export type ManualSettleBetLabLegBody = ManualBetLabLegSettlementRequest;
export type ManualSettlePredictionSelectionBody = ManualPredictionSelectionSettlementRequest;
export interface ManualSettleBetLabLegArgs { path: { ticketId: string; legId: string }; body: ManualSettleBetLabLegBody }
export interface ManualSettlePredictionSelectionArgs { path: { marketPredictionId: string; selectionKey: string }; body: ManualSettlePredictionSelectionBody }
