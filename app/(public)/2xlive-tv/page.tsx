import type { Metadata } from 'next';
import LiveTvComingSoon from '@/components/live-tv/LiveTvComingSoon';

export const metadata: Metadata = {
  title: '2xLive TV — Coming Soon',
  description:
    'The 2xLive TV launch preview is available. Live match streaming will be announced when the streaming service is ready.',
};

export default function LiveTvPage() {
  return <LiveTvComingSoon />;
}
