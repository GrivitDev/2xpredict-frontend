'use client';

import { useState } from 'react';

import {
  QueryClient,
} from '@tanstack/react-query';

import {
  PersistQueryClientProvider,
} from '@tanstack/react-query-persist-client';

import {
  createSyncStoragePersister,
} from '@tanstack/query-sync-storage-persister';


const CACHE_TIME =
  1000 * 60 * 60 * 12;


export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: CACHE_TIME,
            gcTime: CACHE_TIME,

            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      }),
  );


  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage:
        typeof window !== 'undefined'
          ? window.localStorage
          : undefined,
    }),
  );


  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: CACHE_TIME,
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}