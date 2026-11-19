import type { CuratedPredictionQuery, MarketListQuery, PickCenterQuery, SlipListQuery, SureOddsQuery } from '../predictions';
export interface ListManualPredictionsQuery { league?: string; page?: number; pageSize?: number }
export interface ListManualPredictionsArgs { query?: ListManualPredictionsQuery }
export interface GetManualPredictionArgs { path: { id: string } }
export interface ListCuratedPredictionsQuery extends CuratedPredictionQuery { league?: string }
export interface ListCuratedPredictionsArgs { query?: ListCuratedPredictionsQuery }
export type ListSettledQuery = Pick<MarketListQuery, 'eventId' | 'leagueId' | 'marketKey' | 'from' | 'to' | 'page' | 'pageSize'>;
export interface ListSettledArgs { query?: ListSettledQuery }
export type ListAccessMarketsQuery = Pick<MarketListQuery, 'eventId' | 'leagueId' | 'marketKey' | 'selectionKey' | 'from' | 'to' | 'page' | 'pageSize' | 'includePast'>;
export interface ListMarketsArgs { query?: ListAccessMarketsQuery }
export interface GetFixtureMarketsArgs { path: { eventId: string } }
export type ListAccessPickCenterQuery = Pick<PickCenterQuery, 'leagueId' | 'from' | 'to' | 'page' | 'pageSize' | 'includePast'> & { settledOnly?: boolean };
export interface ListPickCenterArgs { query?: ListAccessPickCenterQuery }
export interface GetPickCenterArgs { path: { eventId: string } }
export type ListAccessSlipsQuery = Pick<SlipListQuery, 'from' | 'to' | 'productType' | 'automatic' | 'page' | 'pageSize'>;
export interface ListSlipsArgs { query?: ListAccessSlipsQuery }
export interface GetSlipArgs { path: { slipId: string } }
export interface ListSureOddsArgs { query?: SureOddsQuery }
