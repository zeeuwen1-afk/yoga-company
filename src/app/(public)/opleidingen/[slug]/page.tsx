import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { haalCursus, haalSlugs } from "@/features/courses";
import { CursusDetail } from "@/features/courses/components/cursus-detail";
import { CursusJsonLd } from "@/features/courses/components/cursus-jsonld";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await haalSlugs("opleiding");

  // De 200-uurs Yogaopleiding heeft een eigen pagina onder dezelfde naam. Een
  // vaste map wint van deze dynamische route, dus die variant zou nooit worden
  // getoond; hem toch bouwen kost tijd en zet twee pagina's met hetzelfde adres
  // in het overzicht van de build.
  return slugs
    .filter((slug) => slug !== "200-uurs-yogaopleiding")
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cursus = await haalCursus(slug);

  if (!cursus || cursus.type !== "opleiding") {
    return { title: "Opleiding niet gevonden" };
  }

  return {
    title: cursus.titel,
    description: cursus.samenvatting.slice(0, 160),
    alternates: { canonical: `/opleidingen/${cursus.slug}` },
    openGraph: {
      title: `${cursus.titel} · YogaCompany`,
      description: cursus.samenvatting,
      type: "website",
      locale: "nl_NL",
    },
  };
}

export default async function OpleidingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cursus = await haalCursus(slug);

  if (!cursus || cursus.type !== "opleiding") notFound();

  return (
    <>
      <CursusJsonLd cursus={cursus} />
      <CursusDetail cursus={cursus} />
    </>
  );
}
