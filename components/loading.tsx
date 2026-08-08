export default function LoadingPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />

        <p className="mt-6 text-slate-400 text-lg">
          Loading...
        </p>
      </div>
    </main>
  );
}