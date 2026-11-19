import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Customer Care Conversation' };

/** The global CustomerCareWidget reads the conversation ID from the route. */
export default function CustomerCareConversationPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-3 py-8 sm:px-5">
      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">2xPredict support</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Your conversation</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">The linked support conversation is opening in the Customer Care panel.</p>
      </section>
    </main>
  );
}
