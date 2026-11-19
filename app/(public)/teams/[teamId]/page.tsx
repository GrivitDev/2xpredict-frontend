import TeamProfilePage from '@/components/sports/team-profile-page';

export default async function Page({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  return <TeamProfilePage teamId={teamId} />;
}
