'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_API_URL!);

export function useAdminRealtime(onEvent: (event: string, data: any) => void) {
  useEffect(() => {
    socket.on('payment:new', (data) => onEvent('payment:new', data));
    socket.on('payment:update', (data) => onEvent('payment:update', data));
    socket.on('analytics:update', (data) => onEvent('analytics:update', data));

    return () => {
      socket.disconnect();
    };
  }, []);
}