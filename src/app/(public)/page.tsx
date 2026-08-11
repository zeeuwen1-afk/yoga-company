import Link from "next/link";

// Voorlopige landingspagina. In Fase 2 komt alle inhoud uit `content_blocks`
// en wordt deze pagina volledig opgebouwd volgens BOUWPROMPT §8.1.
export default function HomePage() {
  return (
    <section className="border-b border-line bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <h1 className="max-w-3xl text-4xl sm:text-5xl">
          Yoga Companie — opleidingsinstituut voor yoga
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted">
          Opleidingen, trainingen en yogalessen. Deskundig en betrouwbaar, warm
          en persoonlijk.
        </p>
        <Link
          href="/opleidingen"
          className="mt-8 inline-flex h-12 items-center rounded-lg bg-green px-7 font-semibold text-cream transition-colors hover:bg-green-dark"
        >
          Bekijk de opleidingen
        </Link>
      </div>
    </section>
  );
}
