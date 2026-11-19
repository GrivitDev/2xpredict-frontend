import type { Metadata } from 'next';
import PromosPage from '@/components/promos/PromosPage';

export const metadata: Metadata = { title: 'Promotions' };

export default function PublicPromosRoute() {
  return <PromosPage />;
}
