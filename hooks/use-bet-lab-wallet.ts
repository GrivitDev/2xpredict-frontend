'use client';
/* React Query hooks for every bet-lab-wallet controller endpoint. */
import { useQuery } from '@tanstack/react-query';
import type { ApiQueryHookOptions } from '../types/common';
import { betLabService } from '../services/bet-lab.service';
import type { BetLabLedgerPage, BetLabWallet } from '../types/bet-lab';
import type { GetLedgerArgs } from '../types/endpoint-args/bet-lab';

export function useGetWalletQuery<TData = BetLabWallet>(options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['bet-lab-wallet', 'getWallet'],
    queryFn: async () => (await betLabService.getWallet()) as unknown as TData,
    ...options,
  });
}

export function useGetLedgerQuery<TData = BetLabLedgerPage>(args?: GetLedgerArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['bet-lab-wallet', 'getLedger', args ?? null],
    queryFn: async () => (await betLabService.getLedger(args)) as unknown as TData,
    ...options,
  });
}
