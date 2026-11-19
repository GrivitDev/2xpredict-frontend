import MatchDetailsPage from '@/components/sports/match-details-page';

export default async function Page({
  params,
}: {
  params: Promise<{ fixtureId: string }>;
}) {
  const { fixtureId } = await params;
  return <MatchDetailsPage fixtureId={fixtureId} />;
}
