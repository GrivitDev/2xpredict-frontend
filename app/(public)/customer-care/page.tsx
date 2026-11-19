import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Customer Care' };

/** The global CustomerCareWidget opens automatically on this route. */
export default function CustomerCarePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-3 py-8 sm:px-5">
      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">2xPredict support</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Customer Care</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Your support conversation is available in the Customer Care panel. You can continue an existing conversation or start a new request there.</p>
      </section>
    </main>
  );
}
