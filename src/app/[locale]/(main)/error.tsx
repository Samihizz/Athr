"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="pt-20 pb-16 flex items-center justify-center min-h-[60vh]">
      <div className="glass rounded-2xl p-8 sm:p-12 max-w-md text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-surface flex items-center justify-center">
          <svg
            className="h-8 w-8 text-gold"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm text-muted">
            An unexpected error occurred. Please try again.
          </p>
        </div>
        <button
          onClick={reset}
          className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
