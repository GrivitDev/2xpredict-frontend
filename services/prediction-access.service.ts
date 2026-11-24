/** API client for backend/src/prediction-access/controllers/prediction-access.controller.ts. */
import { apiRequest } from '../lib/axios';
import type {
  GetFixtureMarketsArgs,
  GetManualPredictionArgs,
  GetPickCenterArgs,
  GetSlipArgs,
  ListCuratedPredictionsArgs,
  ListManualPredictionsArgs,
  ListMarketsArgs,
  ListPickCenterArgs,
  ListSettledArgs,
  ListSlipsArgs,
  ListSureOddsArgs,
} from '../types/endpoint-args/prediction-access';
import type {
  CuratedPrediction,
  MarketPrediction,
  PickCenterRecord,
  PredictionAccessPolicy,
  PredictionPage,
  PredictionSlip,
  PredictionSlipListItem,
} from '../types/predictions';

export const predictionAccessService = {
  getPolicy: () =>
    apiRequest<PredictionAccessPolicy>({
      method: 'GET',
      path: '/prediction-access/policy',
    }),

  listManualPredictions: (args?: ListManualPredictionsArgs) =>
    apiRequest<PredictionPage<CuratedPrediction>>({
      method: 'GET',
      path: '/prediction-access/predictions',
      query: args?.query,
    }),

  listCuratedPredictions: (args?: ListCuratedPredictionsArgs) =>
    apiRequest<PredictionPage<CuratedPrediction>>({
      method: 'GET',
      path: '/prediction-access/curated-predictions',
      query: args?.query,
    }),

  getManualPrediction: (args: GetManualPredictionArgs) =>
    apiRequest<CuratedPrediction>({
      method: 'GET',
      path: '/prediction-access/predictions/:id',
      pathParams: args.path,
    }),

  listSettled: (args?: ListSettledArgs) =>
    apiRequest<PredictionPage<MarketPrediction>>({
      method: 'GET',
      path: '/prediction-access/settled',
      query: args?.query,
    }),

  listMarkets: (args?: ListMarketsArgs) =>
    apiRequest<PredictionPage<MarketPrediction>>({
      method: 'GET',
      path: '/prediction-access/markets',
      query: args?.query,
    }),

  getFixtureMarkets: (args: GetFixtureMarketsArgs) =>
    apiRequest<MarketPrediction[]>({
      method: 'GET',
      path: '/prediction-access/markets/:eventId',
      pathParams: args.path,
    }),

  listPickCenter: (args?: ListPickCenterArgs) =>
    apiRequest<PredictionPage<PickCenterRecord>>({
      method: 'GET',
      path: '/prediction-access/pick-center',
      query: args?.query,
    }),

  getPickCenter: (args: GetPickCenterArgs) =>
    apiRequest<PickCenterRecord>({
      method: 'GET',
      path: '/prediction-access/pick-center/:eventId',
      pathParams: args.path,
    }),

  listSlips: (args?: ListSlipsArgs) =>
    apiRequest<PredictionPage<PredictionSlipListItem>>({
      method: 'GET',
      path: '/prediction-access/slips',
      query: args?.query,
    }),

  getSlip: (args: GetSlipArgs) =>
    apiRequest<PredictionSlip>({
      method: 'GET',
      path: '/prediction-access/slips/:slipId',
      pathParams: args.path,
    }),

  listSureOdds: (args?: ListSureOddsArgs) =>
    apiRequest<PredictionPage<PredictionSlipListItem>>({
      method: 'GET',
      path: '/prediction-access/sure-odds',
      query: args?.query,
    }),
} as const;

