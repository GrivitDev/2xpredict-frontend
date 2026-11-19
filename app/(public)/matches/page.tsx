import FixturesSection from '@/components/home-sections/fixtures/FixturesSection';

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] ?? '' : params.q ?? '';

  return (
    <main className="min-h-[60vh] w-full py-3 sm:py-5">
      <FixturesSection
        initialSearchQuery={query}
        title="Matches"
        subtitle="Browse live action, upcoming fixtures and final scores. Select a match for details."
      />
    </main>
  );
}
