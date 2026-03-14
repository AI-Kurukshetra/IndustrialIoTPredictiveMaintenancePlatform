"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-3 p-6">
      <h2 className="text-xl font-semibold text-red-700">Something went wrong</h2>
      <p className="text-sm text-slate-600">{error.message}</p>
      <button onClick={reset} className="rounded bg-slate-900 px-3 py-2 text-white">
        Retry
      </button>
    </div>
  );
}
