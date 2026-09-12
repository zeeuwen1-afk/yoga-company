import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { haalPagina } from "@/features/cms";
import { haalCursus, haalSlugs } from "@/features/courses";
import { CursusDetail } from "@/features/courses/components/cursus-detail";
import { CursusJsonLd } from "@/features/courses/components/cursus-jsonld";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await haalSlugs("workshop");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cursus = await haalCursus(slug);

  if (!cursus || cursus.type !== "workshop") {
    return { title: "Workshop niet gevonden" };
  }

  return {
    title: cursus.titel,
    description: cursus.samenvatting.slice(0, 160),
    alternates: { canonical: `/workshops/${cursus.slug}` },
    openGraph: {
      title: `${cursus.titel} · YogaCompany`,
      description: cursus.samenvatting,
      type: "website",
      locale: "nl_NL",
    },
  };
}

export default async function WorkshopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cursus = await haalCursus(slug);

  if (!cursus || cursus.type !== "workshop") notFound();

  return (
    <>
      <CursusJsonLd cursus={cursus} />
      <CursusDetail cursus={cursus} pagina={await haalPagina("cursus")} />
    </>
  );
}
