import type { DateRangeQuery, IdRecord } from '@/types/common';

export type BetLabTicketStatus =
  | 'OPEN'
  | 'PENDING_SETTLEMENT'
  | 'WON'
  | 'LOST'
  | 'VOID'
  | 'PUSH'
  | 'PARTIALLY_WON'
  | 'PARTIALLY_LOST'
  | 'CANCELLED';

/**
 * Persisted market codes include legacy ticket values. New placement requests
 * are restricted to ActiveBetLabMarketCode, matching the backend catalogue
 * allow-list enforced by PlaceBetLabTicketDto and PlaceBetLabSlipDto.
 */
export type BetLabMarketCode =
  | 'MATCH_RESULT'
  | 'DOUBLE_CHANCE'
  | 'DRAW_NO_BET'
  | 'ASIAN_HANDICAP'
  | 'EUROPEAN_HANDICAP'
  | 'TOTAL_GOALS_OVER_UNDER'
  | 'HOME_TEAM_GOALS_OVER_UNDER'
  | 'AWAY_TEAM_GOALS_OVER_UNDER'
  | 'BOTH_TEAMS_TO_SCORE'
  | 'HOME_TEAM_TO_SCORE'
  | 'AWAY_TEAM_TO_SCORE'
  | 'HOME_TEAM_TO_WIN_TO_NIL'
  | 'AWAY_TEAM_TO_WIN_TO_NIL'
  | 'HOME_TEAM_CLEAN_SHEET'
  | 'AWAY_TEAM_CLEAN_SHEET'
  | 'BTTS_AND_MATCH_RESULT'
  | 'BTTS_AND_TOTAL_GOALS'
  | 'HALF_TIME_RESULT'
  | 'SECOND_HALF_RESULT'
  | 'HALF_TIME_DOUBLE_CHANCE'
  | 'HALF_TIME_FULL_TIME'
  | 'FIRST_HALF_TOTAL_GOALS'
  | 'SECOND_HALF_TOTAL_GOALS'
  | 'ASIAN_TOTAL_GOALS'
  | 'HALF_TIME_GOALS_ODD_EVEN'
  | 'HIGHEST_SCORING_HALF'
  | 'BOTH_TEAMS_TO_SCORE_FIRST_HALF'
  | 'BOTH_TEAMS_TO_SCORE_SECOND_HALF'
  | 'FIRST_TEAM_TO_SCORE'
  | 'LAST_TEAM_TO_SCORE'
  | 'TOTAL_GOALS_ODD_EVEN'
  | 'EXACT_TOTAL_GOALS'
  | 'TOTAL_GOALS_RANGE'
  | 'CORRECT_SCORE'
  | 'HALF_TIME_CORRECT_SCORE'
  | 'WINNING_MARGIN'
  | 'GOAL_IN_BOTH_HALVES'
  | 'HOME_TEAM_TO_SCORE_IN_BOTH_HALVES'
  | 'AWAY_TEAM_TO_SCORE_IN_BOTH_HALVES'
  | 'TOTAL_CORNERS_OVER_UNDER'
  | 'TOTAL_CORNERS_ODD_EVEN'
  | 'TOTAL_CARDS_ODD_EVEN'
  | 'CORNER_RESULT'
  | 'HOME_TEAM_CORNERS_OVER_UNDER'
  | 'AWAY_TEAM_CORNERS_OVER_UNDER'
  | 'TOTAL_CARDS_OVER_UNDER'
  | 'TOTAL_SHOTS_OVER_UNDER'
  | 'TOTAL_SHOTS_ON_TARGET_OVER_UNDER'
  | 'TOTAL_FOULS_OVER_UNDER'
  | 'TOTAL_OFFSIDES_OVER_UNDER'
  | 'TOTAL_YELLOW_CARDS_OVER_UNDER'
  | 'TOTAL_RED_CARDS_OVER_UNDER'
  | 'HOME_TEAM_CARDS_OVER_UNDER'
  | 'AWAY_TEAM_CARDS_OVER_UNDER'
  | 'HOME_SHOTS_ON_TARGET_OVER_UNDER'
  | 'AWAY_SHOTS_ON_TARGET_OVER_UNDER'
  | 'OWN_GOAL_SCORED'
  | 'PLAYER_LAST_GOALSCORER'
  | 'RED_CARD'
  | 'PENALTY_AWARDED'
  | 'PLAYER_TO_SCORE_ANYTIME'
  | 'PLAYER_FIRST_GOALSCORER'
  | 'PLAYER_TO_BE_BOOKED'
  | 'PLAYER_TO_BE_SENT_OFF'
  | 'PLAYER_SHOTS_OVER_UNDER'
  | 'PLAYER_SHOTS_ON_TARGET_OVER_UNDER'
  | 'PLAYER_TO_RECORD_ASSIST';

export type ActiveBetLabMarketCode =
  | 'MATCH_RESULT'
  | 'DOUBLE_CHANCE'
  | 'DRAW_NO_BET'
  | 'TOTAL_GOALS_OVER_UNDER'
  | 'HOME_TEAM_GOALS_OVER_UNDER'
  | 'AWAY_TEAM_GOALS_OVER_UNDER'
  | 'ASIAN_HANDICAP'
  | 'BOTH_TEAMS_TO_SCORE'
  | 'FIRST_HALF_TOTAL_GOALS'
  | 'HALF_TIME_RESULT'
  | 'TOTAL_CORNERS_OVER_UNDER'
  | 'TOTAL_SHOTS_OVER_UNDER'
  | 'TOTAL_SHOTS_ON_TARGET_OVER_UNDER'
  | 'TOTAL_CARDS_OVER_UNDER'
  | 'TOTAL_FOULS_OVER_UNDER'
  | 'TOTAL_OFFSIDES_OVER_UNDER'
  | 'ASIAN_TOTAL_GOALS'
  | 'BTTS_AND_MATCH_RESULT'
  | 'BTTS_AND_TOTAL_GOALS'
  | 'EUROPEAN_HANDICAP'
  | 'HALF_TIME_CORRECT_SCORE'
  | 'HALF_TIME_DOUBLE_CHANCE'
  | 'HOME_TEAM_TO_SCORE'
  | 'AWAY_TEAM_TO_SCORE'
  | 'HOME_TEAM_CLEAN_SHEET'
  | 'AWAY_TEAM_CLEAN_SHEET'
  | 'HOME_TEAM_TO_WIN_TO_NIL'
  | 'AWAY_TEAM_TO_WIN_TO_NIL'
  | 'TOTAL_GOALS_ODD_EVEN'
  | 'EXACT_TOTAL_GOALS'
  | 'TOTAL_GOALS_RANGE'
  | 'CORRECT_SCORE'
  | 'WINNING_MARGIN'
  | 'FIRST_TEAM_TO_SCORE'
  | 'LAST_TEAM_TO_SCORE'
  | 'SECOND_HALF_TOTAL_GOALS'
  | 'SECOND_HALF_RESULT'
  | 'HALF_TIME_FULL_TIME'
  | 'HALF_TIME_GOALS_ODD_EVEN'
  | 'GOAL_IN_BOTH_HALVES'
  | 'HOME_TEAM_TO_SCORE_IN_BOTH_HALVES'
  | 'AWAY_TEAM_TO_SCORE_IN_BOTH_HALVES'
  | 'BOTH_TEAMS_TO_SCORE_FIRST_HALF'
  | 'BOTH_TEAMS_TO_SCORE_SECOND_HALF'
  | 'HIGHEST_SCORING_HALF'
  | 'HOME_TEAM_CORNERS_OVER_UNDER'
  | 'AWAY_TEAM_CORNERS_OVER_UNDER'
  | 'TOTAL_CORNERS_ODD_EVEN'
  | 'CORNER_RESULT'
  | 'TOTAL_YELLOW_CARDS_OVER_UNDER'
  | 'TOTAL_RED_CARDS_OVER_UNDER'
  | 'HOME_TEAM_CARDS_OVER_UNDER'
  | 'AWAY_TEAM_CARDS_OVER_UNDER'
  | 'HOME_SHOTS_ON_TARGET_OVER_UNDER'
  | 'AWAY_SHOTS_ON_TARGET_OVER_UNDER'
  | 'TOTAL_CARDS_ODD_EVEN'
  | 'RED_CARD'
  | 'PENALTY_AWARDED'
  | 'OWN_GOAL_SCORED';

export type BetLabTicketType = 'SINGLE' | 'ACCUMULATOR';
export type BetLabLegStatus =
  | 'OPEN'
  | 'WON'
  | 'LOST'
  | 'VOID'
  | 'PUSH'
  | 'HALF_WON'
  | 'HALF_LOST'
  | 'PARTIALLY_WON';
export type BetLabSettlementOutcome =
  | 'WON'
  | 'LOST'
  | 'VOID'
  | 'PUSH'
  | 'HALF_WON'
  | 'HALF_LOST'
  | 'PARTIALLY_WON'
  | 'PARTIALLY_LOST';
export type BetLabLedgerType =
  | 'REGISTRATION_BONUS'
  | 'MONTHLY_ALLOWANCE'
  | 'MONTHLY_ALLOWANCE_EXPIRY'
  | 'STAKE_DEBIT'
  | 'SETTLEMENT_RETURN'
  | 'VOID_OR_PUSH_RETURN'
  | 'ADMIN_ADJUSTMENT';
export type BetLabCreditBucket =
  | 'WELCOME'
  | 'MONTHLY'
  | 'WINNINGS'
  | 'BONUS'
  | 'MIXED'
  | 'SYSTEM';
export type BetLabOddsSource =
  | 'API_FOOTBALL'
  | 'THE_ODDS_API'
  | 'ESPN_ODDS'
  | 'UNKNOWN_PROVIDER'
  | 'ESTIMATED'
  | 'ESPN_PICKCENTER'
  | 'DERIVED_FAIR';
export type BetLabPriceType = 'PROVIDER' | 'ESTIMATED';
export type BetLabOddsTimestampBasis =
  | 'PROVIDER_UPDATED_AT'
  | 'INGESTED_AT'
  | 'MODEL_GENERATED';
export type BetLabOddsProvider = 'ESPN' | 'THE_ODDS_API';
export type BetLabOddsBasis =
  | 'BOOKMAKER_ONLY'
  | 'BOOKMAKER_PLUS_HISTORY'
  | 'HISTORICAL_ONLY'
  | 'PRIOR_ONLY';
export type BetLabFairOddsBasis = 'MODEL' | 'PRIOR';
export type BetLabPricingGroup = 'MATCH' | 'SCORE' | 'SHOTS';
export type BetLabMarketCategory =
  | 'MATCH_RESULT'
  | 'GOALS'
  | 'HALF_TIME'
  | 'HANDICAP'
  | 'CORNERS'
  | 'CARDS'
  | 'SPECIALS'
  | 'STATISTICS'
  | 'PLAYER';
export type BetLabPeriod = 'FULL_TIME' | 'FIRST_HALF' | 'SECOND_HALF';
export type BetLabSelectionMode =
  | 'STATIC'
  | 'OVER_UNDER'
  | 'ASIAN_HANDICAP'
  | 'EUROPEAN_HANDICAP';
export type BetLabPlan = 'free' | 'regular' | 'vip' | 'premium';

export interface BetLabWallet {
  walletId: string;
  userId: string;
  balance: number;
  welcomeBalance: number;
  monthlyBalance: number;
  winningsBalance: number;
  bonusBalance: number;
  registrationBonusGranted: boolean;
  monthlyAllowanceAmount: number;
  monthlyAllowancePlan: BetLabPlan;
  monthlyPeriodStart: string;
  monthlyPeriodEnd: string;
  totalStaked: number;
  totalReturns: number;
  netProfitLoss: number;
  ticketsPlaced: number;
  ticketsSettled: number;
  ticketsWon: number;
  ticketsLost: number;
  ticketsVoided: number;
  ticketsPushed: number;
  ticketsPartiallyWon: number;
  ticketsPartiallyLost: number;
  lastTicketAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BetLabLedgerEntry extends IdRecord {
  userId: string;
  walletId: string;
  transactionType: BetLabLedgerType;
  bucket: BetLabCreditBucket;
  /** Signed virtual-point change; credits are positive and debits are negative. */
  delta: number;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  ticketId?: string;
  idempotencyKey: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/** Selection definition returned by GET /bet-lab/catalog. */
export interface BetLabSelectionDefinition {
  code: string;
  jsonVariable: string;
  fullName: string;
  abbreviation: string;
  settlementKey: string;
  line?: number;
  handicap?: number;
  homeGoals?: number;
  awayGoals?: number;
  subjectId?: string;
  subjectName?: string;
  subjectAbbreviation?: string;
  subjectTeamId?: string;
}

/** Exact Odds-module quote snapshot returned for a fixture's market. */
export interface BetLabSelectionQuote extends BetLabSelectionDefinition {
  available: boolean;
  decimalOdds: number | null;
  oddsSource: BetLabOddsSource | null;
  priceType: BetLabPriceType | null;
  bookmaker: string | null;
  providerUpdatedAt: string | null;
  oddsTimestampBasis: BetLabOddsTimestampBasis | null;
  oddsCapturedAt: string | null;
  oddsRecordUpdatedAt: string | null;
  oddsFreshUntil?: string | null;
  fairOdds: number | null;
  fairOddsBasis: BetLabFairOddsBasis | null;
  marketFairOdds: number | null;
  impliedProbability: number | null;
  fairProbability: number | null;
  valuePercent: number | null;
  dataQuality: number | null;
  sampleSize: number | null;
  calculationVersion: string | null;
  sourceRevision: number | null;
  fixtureSourceRevision: number | null;
  sourceDataUpdatedAt: string | null;
  provider: BetLabOddsProvider | null;
  isFresh: boolean;
  oddsBasis: BetLabOddsBasis | null;
  oddsCalculationMethod: string | null;
  isStale: boolean;
  unavailableReason?: string;
}

/**
 * GET /bet-lab/fixtures/:eventId/odds returns a deliberate quote projection.
 * Unlike /markets, it omits settlement/line metadata and adds oddsMode.
 */
export interface BetLabOddsSelectionQuote {
  code: string;
  jsonVariable: string;
  fullName: string;
  abbreviation: string;
  available: boolean;
  decimalOdds: number | null;
  fairOdds: number | null;
  fairOddsBasis: BetLabFairOddsBasis | null;
  marketFairOdds: number | null;
  impliedProbability: number | null;
  fairProbability: number | null;
  valuePercent: number | null;
  dataQuality: number | null;
  sampleSize: number | null;
  calculationVersion: string | null;
  sourceRevision: number | null;
  sourceDataUpdatedAt: string | null;
  provider: BetLabOddsProvider | null;
  oddsFreshUntil?: string | null;
  isFresh: boolean;
  oddsMode: 'VIRTUAL_GAME';
  oddsSource: BetLabOddsSource | null;
  priceType: BetLabPriceType | null;
  bookmaker: string | null;
  providerUpdatedAt: string | null;
  oddsTimestampBasis: BetLabOddsTimestampBasis | null;
  oddsCapturedAt: string | null;
  isStale: boolean;
  unavailableReason?: string;
}

export interface BetLabOddsMarket {
  code: BetLabMarketCode;
  jsonVariable: string;
  fullName: string;
  abbreviation: string;
  available: boolean;
  pricingEnabled: boolean;
  availableSelectionCount: number;
  notes?: string;
  selections: BetLabOddsSelectionQuote[];
}

/** Backwards-compatible name for consumers rendering a priced market. */
export type BetLabMarketSelection = BetLabSelectionQuote;

export interface BetLabMarket {
  code: BetLabMarketCode;
  jsonVariable: string;
  fullName: string;
  abbreviation: string;
  category: BetLabMarketCategory;
  period: BetLabPeriod;
  available: boolean;
  availableSelectionCount: number;
  pricingEnabled: boolean;
  selections: BetLabSelectionQuote[];
  notes?: string;
}

/** Exact item returned by GET /bet-lab/catalog. */
export interface BetLabCatalogMarket {
  code: BetLabMarketCode;
  predictionMarketKey: string;
  jsonVariable: string;
  fullName: string;
  abbreviation: string;
  category: BetLabMarketCategory;
  period: BetLabPeriod;
  selectionMode: BetLabSelectionMode;
  selections: BetLabSelectionDefinition[];
  lines: number[];
  notes?: string;
  pricingEnabled: boolean;
  dynamicSelections: boolean;
}
export type BetLabCatalog = BetLabCatalogMarket[];

export interface BetLabFixture {
  eventId: string;
  leagueId: string;
  leagueName: string;
  fixtureDate: string;
  status: string;
  live: boolean;
  completed: boolean;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
  venueName?: string;
  hasSportsData: boolean;
  hasPricedSelections: boolean;
  pricedSelectionCount: number;
  sportsUpdatedAt?: string | null;
}

export interface BetLabFixtureIdentity {
  eventId: string;
  leagueId: string;
  leagueName: string;
  fixtureDate: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
}

export interface BetLabFixtureMarketsResponse {
  fixture: BetLabFixtureIdentity;
  oddsMode: 'VIRTUAL_GAME';
  oddsCapturedAt: string | null;
  oddsFreshUntil: string | null;
  markets: BetLabMarket[];
}

export interface BetLabFixtureOddsResponse {
  eventId: string;
  oddsMode: 'VIRTUAL_GAME';
  oddsCapturedAt: string | null;
  oddsFreshUntil: string | null;
  markets: BetLabOddsMarket[];
}

export interface BetLabFixtureQuery extends DateRangeQuery {
  leagueId?: string;
  teamId?: string;
  page?: number;
  /** Backend DTO maximum is 100. */
  limit?: number;
}
export interface BetLabHistoryQuery {
  status?: BetLabTicketStatus;
  page?: number;
  limit?: number;
}

export interface PlaceBetLabTicketPayload {
  eventId: string;
  marketCode: ActiveBetLabMarketCode;
  selectionCode: string;
  stake: number;
  /** Reuse the same key when retrying the same logical placement request. */
  idempotencyKey: string;
}
export interface BetLabSlipLegPayload {
  eventId: string;
  marketCode: ActiveBetLabMarketCode;
  selectionCode: string;
}
export interface PlaceBetLabSlipPayload {
  legs: BetLabSlipLegPayload[];
  stake: number;
  /** Reuse the same key when retrying the same logical placement request. */
  idempotencyKey: string;
}

export interface BetLabTicketLeg {
  legId: string;
  eventId: string;
  leagueId: string;
  leagueName: string;
  fixtureDate: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  marketCode: BetLabMarketCode;
  marketJsonVariable: string;
  marketFullName: string;
  marketAbbreviation: string;
  selectionCode: string;
  selectionJsonVariable: string;
  selectionFullName: string;
  selectionAbbreviation: string;
  decimalOdds: number;
  fixturePricingGroup?: BetLabPricingGroup;
  fixturePricingAdjustment?: number;
  oddsSource: BetLabOddsSource;
  priceType?: BetLabPriceType;
  bookmaker?: string;
  providerUpdatedAt?: string;
  oddsTimestampBasis?: BetLabOddsTimestampBasis;
  oddsBasis?: BetLabOddsBasis;
  oddsCalculationMethod?: string;
  fairOdds?: number;
  fairOddsBasis?: BetLabFairOddsBasis;
  marketFairOdds?: number;
  impliedProbability?: number;
  fairProbability?: number;
  valuePercent?: number;
  dataQuality?: number;
  sampleSize?: number;
  calculationVersion?: string;
  sourceRevision?: number;
  fixtureSourceRevision?: number;
  oddsSnapshotFingerprint?: string;
  sourceDataUpdatedAt?: string;
  provider?: BetLabOddsProvider;
  oddsFreshUntil?: string;
  oddsCapturedAt: string;
  oddsRecordUpdatedAt?: string;
  status: BetLabLegStatus;
  settlementKey?: string;
  line?: number;
  handicap?: number;
  homeGoals?: number;
  awayGoals?: number;
  subjectId?: string;
  subjectName?: string;
  subjectTeamId?: string;
  settlementMethod?: string;
  settlementNote?: string;
  settlementOutcome?: string;
  settlementPhase?: 'IN_PLAY' | 'HALF_TIME' | 'FULL_TIME';
  settlementSourceFingerprint?: string;
  settlementEvidence?: Record<string, unknown>;
  settlementHistory?: Array<Record<string, unknown>>;
  matchSettlementStatus: BetLabLegStatus;
  settledAt?: string;
}

export interface BetLabTicket extends IdRecord {
  userId: string;
  ticketNumber: string;
  ticketType: BetLabTicketType;
  status: BetLabTicketStatus;
  stake: number;
  combinedOdds: number;
  potentialReturn: number;
  potentialProfit: number;
  legs: BetLabTicketLeg[];
  idempotencyKey: string;
  requestFingerprint: string;
  pricingSnapshotVersion?: string;
  pricingSnapshotFingerprint?: string;
  pricingSnapshotCapturedAt?: string;
  settlementId?: string;
  settlementFingerprint?: string;
  placedAt?: string;
  settledAt?: string;
  visibleUntil?: string;
  settledGrossReturn?: number;
  settlementNote?: string;
}

export interface BetLabPlacementResponse {
  ticket: BetLabTicket;
  alreadyPlaced: boolean;
  /** A wallet snapshot may be unavailable during idempotent replay recovery. */
  wallet: BetLabWallet | null;
}

export interface BetLabStatisticsResponse {
  wallet: Pick<BetLabWallet,
    | 'balance' | 'welcomeBalance' | 'monthlyBalance' | 'winningsBalance' | 'bonusBalance'
    | 'monthlyAllowanceAmount' | 'monthlyAllowancePlan' | 'monthlyPeriodStart' | 'monthlyPeriodEnd'>;
  performance: {
    ticketsPlaced: number;
    ticketsSettled: number;
    ticketsWon: number;
    ticketsLost: number;
    ticketsVoided: number;
    ticketsPushed: number;
    ticketsPartiallyWon: number;
    ticketsPartiallyLost: number;
    totalStaked: number;
    totalReturns: number;
    netProfitLoss: number;
    winRatePercent: number;
  };
  ticketStatus: { open: number; pendingSettlement: number; recentlySettledVisible: number };
}

export interface BetLabPagePagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
export interface BetLabPage<T> {
  items: T[];
  pagination: BetLabPagePagination;
}
export type BetLabFixturesPage = BetLabPage<BetLabFixture>;
export type BetLabLedgerPage = BetLabPage<BetLabLedgerEntry>;
export type BetLabTicketPage = BetLabPage<BetLabTicket>;

export interface BetLabAdminEvent {
  _id?: string;
  level: 'INFO' | 'WARN' | 'ERROR' | string;
  category: 'WALLET' | 'TICKET' | 'ODDS' | 'SETTLEMENT_INTEGRATION' | 'RETENTION' | 'ADMIN' | 'SYSTEM' | string;
  action: string;
  message: string;
  userId?: string;
  eventId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface BetLabAdminMonitorResponse {
  generatedAt: string;
  health: {
    status: 'OK' | 'DEGRADED' | string;
    walletBalanceInconsistencies: number;
    systemErrorsLast24Hours: number;
    ticketPlacementsRejectedLast24Hours: number;
  };
  usersAndWallets: {
    wallets: number;
    balanceByCreditSource: {
      totalAvailablePoints: number;
      welcomePointsRemaining: number;
      monthlyPointsRemaining: number;
      winningsPointsRemaining: number;
      bonusPointsRemaining: number;
    };
    bySubscriptionAllowancePlan: Array<Record<string, unknown>>;
  };
  tickets: {
    currentlyStoredTicketDocuments: number;
    statuses: Array<Record<string, unknown>>;
    lifetimeTicketsPlaced: number;
    lifetimeTicketsSettled: number;
    lifetimeTicketsWon: number;
    lifetimeTicketsLost: number;
    totalStakedPoints: number;
    totalReturnedPoints: number;
    netVirtualProfitLoss: number;
    ticketsDueForRetentionCleanup: number;
    topMarketFamilies: Array<Record<string, unknown>>;
  };
  ledger: { totalEntries: number; transactionTypes: Array<Record<string, unknown>> };
  marketCatalog: { marketFamilyCount: number; markets: Array<Record<string, unknown>> };
  sportsDataCoverage: {
    eligibleUpcomingFixturesNext14Days: number;
    fixturesWithSummary: number;
    fixturesWithProviderOdds: number;
  };
  recentEvents: BetLabAdminEvent[];
}

