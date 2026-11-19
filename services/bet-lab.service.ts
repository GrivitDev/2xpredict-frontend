import api from '@/lib/axios';
import { apiRequest } from '../lib/axios';
import type {
  GetFixturesArgs, GetMarketsArgs, GetOddsArgs, GetTicketArgs, GetTicketsArgs,
  PlaceAccumulatorArgs, PlaceSingleTicketArgs,
} from '../types/endpoint-args/bet-lab';
import type { GetLedgerArgs } from '../types/endpoint-args/bet-lab';
import type { GetRecentEventsArgs } from '../types/endpoint-args/bet-lab';
import type {
  BetLabCatalog, BetLabFixtureMarketsResponse, BetLabFixtureOddsResponse,
  BetLabFixturesPage, BetLabPlacementResponse, BetLabStatisticsResponse,
  BetLabTicket, BetLabTicketPage, BetLabLedgerPage, BetLabWallet,
  BetLabAdminEvent, BetLabAdminMonitorResponse,
} from '../types/bet-lab';

export interface BetLabVirtualPointsSettings {
  registrationBonus: number;
  monthlyAllowanceByPlan: { free: number; regular: number; vip: number; premium: number };
}
export interface BetLabSettingsResponse extends BetLabVirtualPointsSettings {
  updatedBy?: string;
  updatedAt?: string;
}
export type UpdateBetLabSettingsPayload = BetLabVirtualPointsSettings;

/** Single client for Bet Lab tickets, wallet, settings and operational endpoints. */
export const betLabService = {
  // Main Bet Lab controller
  getMarketCatalog: () => apiRequest<BetLabCatalog>({ method: 'GET', path: '/bet-lab/catalog' }),
  getFixtures: (args?: GetFixturesArgs) =>
    apiRequest<BetLabFixturesPage>({ method: 'GET', path: '/bet-lab/fixtures', query: args?.query }),
  getMarkets: (args: GetMarketsArgs) =>
    apiRequest<BetLabFixtureMarketsResponse>({ method: 'GET', path: '/bet-lab/fixtures/:eventId/markets', pathParams: args.path }),
  getOdds: (args: GetOddsArgs) =>
    apiRequest<BetLabFixtureOddsResponse>({ method: 'GET', path: '/bet-lab/fixtures/:eventId/odds', pathParams: args.path }),
  placeSingleTicket: (args: PlaceSingleTicketArgs) =>
    apiRequest<BetLabPlacementResponse>({ method: 'POST', path: '/bet-lab/tickets', body: args.body }),
  placeAccumulator: (args: PlaceAccumulatorArgs) =>
    apiRequest<BetLabPlacementResponse>({ method: 'POST', path: '/bet-lab/slips', body: args.body }),
  getTickets: (args?: GetTicketsArgs) =>
    apiRequest<BetLabTicketPage>({ method: 'GET', path: '/bet-lab/tickets', query: args?.query }),
  getTicket: (args: GetTicketArgs) =>
    apiRequest<BetLabTicket>({ method: 'GET', path: '/bet-lab/tickets/:ticketId', pathParams: args.path }),
  getStatistics: () => apiRequest<BetLabStatisticsResponse>({ method: 'GET', path: '/bet-lab/statistics' }),

  // Wallet controller
  getWallet: () => apiRequest<BetLabWallet>({ method: 'GET', path: '/bet-lab/wallet' }),
  getLedger: (args?: GetLedgerArgs) =>
    apiRequest<BetLabLedgerPage>({ method: 'GET', path: '/bet-lab/wallet/ledger', query: args?.query }),

  // Admin controller
  getMonitor: () => apiRequest<BetLabAdminMonitorResponse>({ method: 'GET', path: '/bet-lab/admin/monitor' }),
  getRecentEvents: (args: GetRecentEventsArgs = {}) =>
    apiRequest<BetLabAdminEvent[]>({
      method: 'GET', path: '/bet-lab/admin/events', query: args.query ?? { limit: 50 },
    }),
  getSettings: () => api.get<BetLabSettingsResponse>('/bet-lab/admin/settings').then((response) => response.data),
  updateSettings: (payload: UpdateBetLabSettingsPayload) =>
    api.patch<BetLabSettingsResponse>('/bet-lab/admin/settings', payload).then((response) => response.data),
} as const;


