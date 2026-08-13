import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link
            href="/"
            className="font-serif text-xl leading-none font-semibold text-green-dark"
          >
            YogaCompany
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-md rounded-[var(--radius-card)] border border-line bg-white p-6 sm:p-8">
          {children}
        </div>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
        <p className="text-center text-xs text-muted">
          <Link href="/privacyverklaring" className="hover:text-green">
            Privacyverklaring
          </Link>
          <span className="mx-2">·</span>
          <Link href="/algemene-voorwaarden" className="hover:text-green">
            Algemene voorwaarden
          </Link>
        </p>
      </footer>
    </div>
  );
}
