import type { DateRangeQuery, IdRecord, LimitPageResult } from '@/types/common';

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
export type BetLabMarketCode = string;
export type BetLabCreditBucket = 'welcome' | 'monthly' | 'bonus' | 'winnings' | 'system' | string;

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
  monthlyAllowancePlan: 'free' | 'regular' | 'vip' | 'premium';
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
  userId?: string;
  walletId?: string;
  transactionType: string;
  bucket: string;
  delta: number;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  idempotencyKey: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface BetLabMarketSelection {
  code: string;
  jsonVariable: string;
  fullName: string;
  abbreviation: string;
  available: boolean;
  decimalOdds?: number | null;
  oddsSource?: string;
  oddsCapturedAt?: string | null;
  isStale?: boolean;
  unavailableReason?: string;
  line?: number;
  subjectId?: string;
  subjectName?: string;
  [key: string]: unknown;
}

export interface BetLabMarket {
  code: string;
  jsonVariable: string;
  fullName: string;
  abbreviation: string;
  available: boolean;
  selections: BetLabMarketSelection[];
  [key: string]: unknown;
}

export interface BetLabCatalogMarket {
  code: string;
  /** Canonical Prediction Engine key supplied by the shared Odds catalogue. */
  predictionMarketKey: string;
  jsonVariable: string;
  fullName: string;
  abbreviation: string;
  category: string;
  period?: string;
  selectionMode: string;
  selections: BetLabMarketSelection[];
  lines?: number[];
  selectionTemplate?: Record<string, string>;
  notes?: string | string[];
  pricingEnabled?: boolean;
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
  hasSummary: boolean;
  hasPricedSelections: boolean;
  pricedSelectionCount: number;
  summaryCollectedAt?: string | null;
}

export interface BetLabFixtureMarketsResponse {
  fixture: {
    eventId: string;
    leagueId: string;
    leagueName: string;
    fixtureDate: string;
    homeTeamId: string;
    homeTeamName: string;
    awayTeamId: string;
    awayTeamName: string;
  };
  oddsCapturedAt: string | null;
  oddsFreshUntil: string | null;
  markets: BetLabMarket[];
}

export interface BetLabFixtureOddsResponse {
  eventId: string;
  oddsCapturedAt: string | null;
  oddsFreshUntil: string | null;
  markets: BetLabMarket[];
}

export interface BetLabFixtureQuery extends DateRangeQuery {
  leagueId?: string;
  teamId?: string;
  page?: number;
  limit?: number;
}
export interface BetLabHistoryQuery { status?: BetLabTicketStatus; page?: number; limit?: number }
export interface PlaceBetLabTicketPayload {
  eventId: string;
  marketCode: BetLabMarketCode;
  selectionCode: string;
  stake: number;
  idempotencyKey: string;
}
export interface BetLabSlipLegPayload { eventId: string; marketCode: BetLabMarketCode; selectionCode: string }
export interface PlaceBetLabSlipPayload { legs: BetLabSlipLegPayload[]; stake: number; idempotencyKey: string }

export interface BetLabTicket extends IdRecord {
  userId?: string;
  ticketNumber: string;
  ticketType: 'SINGLE' | 'ACCUMULATOR' | string;
  status: BetLabTicketStatus;
  stake: number;
  combinedOdds: number;
  potentialReturn: number;
  potentialProfit: number;
  settledGrossReturn?: number;
  placedAt?: string;
  settledAt?: string;
  legs: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface BetLabPlacementResponse {
  ticket: BetLabTicket;
  alreadyPlaced: boolean;
  wallet: BetLabWallet;
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

export type BetLabFixturesPage = LimitPageResult<BetLabFixture>;
export type BetLabLedgerPage = LimitPageResult<BetLabLedgerEntry>;
export type BetLabTicketPage = LimitPageResult<BetLabTicket>;


export interface BetLabAdminEvent {
  _id?: string;
  level: string;
  category: string;
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
