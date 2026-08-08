export default function LoadingState() {
  return (
    <div className="space-y-6 animate-pulse">

      {/* STATS SKELETON */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 bg-slate-800 rounded-xl"
          />
        ))}
      </div>

      {/* CARD SKELETON */}
      <div className="h-32 bg-slate-800 rounded-xl" />

      {/* TABLE SKELETON */}
      <div className="h-40 bg-slate-800 rounded-xl" />

      <div className="h-40 bg-slate-800 rounded-xl" />

    </div>
  );
}