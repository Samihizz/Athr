import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <div className="text-8xl font-bold text-gradient-gold">404</div>
          <h1 className="text-2xl font-semibold">Page not found</h1>
          <p className="text-muted max-w-sm mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/en"
            className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold"
          >
            Go home
          </Link>
        </div>
      </body>
    </html>
  );
}
