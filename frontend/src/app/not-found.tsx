import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-gray-700">Page not found</h2>
        <p className="mt-2 text-gray-500">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
