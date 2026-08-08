import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-[120px] font-black text-green-400 leading-none">
          404
        </h1>

        <h2 className="mt-6 text-5xl font-black text-white">
          Page Not Found
        </h2>

        <p className="mt-6 text-slate-400 text-lg">
          The page you are trying
          to access does not exist.
        </p>

        <Link
          href="/"
          className="inline-block mt-10 bg-green-600 hover:bg-green-700 transition px-10 py-4 rounded-xl font-bold text-white"
        >
          Back Home
        </Link>
      </div>
    </main>
  );
}