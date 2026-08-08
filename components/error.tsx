'use client';

export default function ErrorPage({
  error,

  reset,
}: {
  error: Error;

  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
        <h1 className="text-5xl font-black text-white">
          Something Went Wrong
        </h1>

        <p className="mt-6 text-slate-400">
          An unexpected error
          occurred.
        </p>

        <button
          onClick={reset}
          className="mt-10 bg-green-600 hover:bg-green-700 transition px-10 py-4 rounded-xl font-bold text-white"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}