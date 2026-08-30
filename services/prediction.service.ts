import api from '@/lib/axios';

// ========================================
// SHARED TYPES
// ========================================

export type PredictionResult =
  | 'HOME'
  | 'DRAW'
  | 'AWAY';

export type PredictionStatus =
  | 'pending'
  | 'won'
  | 'lost'
  | 'void';

export type PredictionPlan =
  | 'free'
  | 'regular'
  | 'vip';

export type PredictionAccessState =
  | 'public_preview'
  | 'subscription'
  | 'purchased'
  | 'locked'
  | 'upgrade_required'
  | 'login_required';

export interface LeagueInfo {
  code: string;
  name: string;
  country: string;
  emblem?: string;
}

export interface PredictionProbability {
  home: number;
  draw: number;
  away: number;
}

export interface PredictionMarket {
  market: string;
  selection?: string;
}

// ========================================
// PREDICTION RESPONSE
// ========================================

export interface PredictionDetails {
  date?: string;
  match?: {
    utcDate?: string;
  };
  venue?: string;

  homeScore?: number;
  awayScore?: number;

  _id: string;
  id?: string;

  matchId: string;

  homeTeam: string;
  awayTeam: string;

  homeTeamBadge?: string;
  awayTeamBadge?: string;

  leagueCode: string;
  league?: LeagueInfo;

  matchDate: string;

  kickoffTimestamp: number;

  status: PredictionStatus;

  accessType: PredictionPlan;

  price: number;

  confidence: number;

  access: {
    allowed: boolean;
    state: PredictionAccessState;
    purchased: boolean;
    plan: PredictionPlan;
    released: boolean;
    releaseAt: number;
    message: string | null;
  };

  actions?: string[];

  data: {
    prediction?: PredictionResult;

    probabilities?: PredictionProbability | null;

    markets?: PredictionMarket[] | null;
  } | null;
}

// ========================================
// CREATE
// ========================================

export interface CreatePredictionPayload {
  matchId: string;

  leagueCode: string;

  league?: LeagueInfo;

  homeTeam: string;

  awayTeam: string;

  homeTeamBadge?: string;

  awayTeamBadge?: string;

  confidence: number;

  probabilities: PredictionProbability;

  markets: PredictionMarket[];

  accessType: PredictionPlan;

  price: number;

  matchDate: string;
}

export const createPrediction = async (
  payload: CreatePredictionPayload,
) => {
  const res = await api.post(
    '/predictions',
    payload,
  );

  return res.data;
};

// ========================================
// PUBLIC PREVIEW
// ========================================
//
// Returns the five public predictions selected
// by the backend.
//
// No authentication required.
//
// Backend rules:
// - free predictions only
// - confidence >= 80%
// - pending
// - unsettled
// - not deleted
// - current day first
// - can use qualifying predictions from
//   subsequent days when necessary
//
// ========================================

export const getPublicPredictionPreview = async (): Promise<
  PredictionDetails[]
> => {
  const res = await api.get(
    '/predictions/public-preview',
  );

  return Array.isArray(res.data)
    ? res.data
    : [];
};

// ========================================
// GET ALL
// ADMIN / TABLE VIEW
// ========================================

export const getPredictions = async () => {
  const res = await api.get(
    '/predictions',
  );

  return res.data;
};

// ========================================
// GET SETTLED WINS
// PUBLIC
// ========================================

export const getSettledWins = async (): Promise<
  PredictionDetails[]
> => {
  const res = await api.get(
    '/predictions/settled-wins',
  );

  return Array.isArray(res.data)
    ? res.data
    : [];
};

// ========================================
// GET ONE
// ADMIN RAW
// ========================================

export const getPrediction = async (
  id: string,
) => {
  const res = await api.get(
    `/predictions/${id}`,
  );

  return res.data;
};

// ========================================
// GET USER ACCESS VIEW
// ========================================

export const getPredictionAccess = async (
  id: string,
): Promise<PredictionDetails> => {
  const res = await api.get(
    `/predictions/user/${id}`,
  );

  return res.data;
};

// ========================================
// UPDATE
// ========================================

export const updatePrediction = async (
  id: string,
  payload: any,
) => {
  const res = await api.patch(
    `/predictions/${id}`,
    payload,
  );

  return res.data;
};

// ========================================
// DELETE
// ========================================

export const deletePrediction = async (
  id: string,
) => {
  const res = await api.delete(
    `/predictions/${id}`,
  );

  return res.data;
};

// ========================================
// SETTLE
// ADMIN
// ========================================

export const settlePrediction = async (
  id: string,
  actualResult: PredictionResult | 'VOID',
) => {
  const res = await api.post(
    `/settlement/${id}`,
    {
      result: actualResult,
    },
  );

  return res.data;
};