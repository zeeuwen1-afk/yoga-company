import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#inhoud"
        className="sr-only rounded bg-green px-4 py-2 text-cream focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
      >
        Naar de inhoud
      </a>
      <SiteHeader />
      <main id="inhoud" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
