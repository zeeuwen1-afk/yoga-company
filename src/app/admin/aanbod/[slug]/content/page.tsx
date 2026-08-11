import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminKop, LegeLijst, Paneel } from "@/features/admin/components/ui";
import {
  ItemToevoegen,
  ItemVerwijderen,
  ModuleToevoegen,
} from "@/features/content/components/content-beheer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Lesmateriaal",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const SOORT_LABEL = {
  video: "Video",
  pdf: "Document",
  tekst: "Tekst",
} as const;

export default async function ContentBeheerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: cursus } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!cursus) notFound();

  const { data: modules } = await supabase
    .from("course_modules")
    .select(
      `id, title, sort,
       lessons (id, title, sort,
         content_items (id, title, kind, storage_path, duration_seconds, is_preview, sort))`,
    )
    .eq("course_id", cursus.id)
    .order("sort", { ascending: true });

  const gesorteerd = (modules ?? []).map((module) => ({
    ...module,
    lessons: [...(module.lessons ?? [])].sort((a, b) => a.sort - b.sort),
  }));

  return (
    <>
      <AdminKop
        kruimel={{ href: `/admin/aanbod/${slug}`, label: cursus.title }}
        titel="Lesmateriaal"
        toelichting="Video's, documenten en teksten die klanten na betaling zien."
      />

      <div className="space-y-5">
        {gesorteerd.length === 0 ? (
          <Paneel>
            <LegeLijst>
              Nog geen modules. Voeg er hieronder een toe om te beginnen.
            </LegeLijst>
          </Paneel>
        ) : (
          gesorteerd.map((module) => {
            const les = module.lessons[0];
            const items = [...(les?.content_items ?? [])].sort(
              (a, b) => a.sort - b.sort,
            );

            return (
              <Paneel key={module.id} titel={module.title}>
                {items.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-muted">
                    Nog geen lesonderdelen in deze module.
                  </p>
                ) : (
                  <ul className="divide-y divide-line">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-4 px-5 py-3"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">
                            {item.title}
                          </span>
                          <span className="block text-sm text-muted">
                            {SOORT_LABEL[item.kind]}
                            {item.duration_seconds
                              ? ` · ${Math.round(item.duration_seconds / 60)} min`
                              : null}
                            {item.is_preview ? " · proefles" : null}
                            {item.storage_path ? (
                              <span className="ml-1 font-mono text-xs">
                                {item.storage_path}
                              </span>
                            ) : null}
                          </span>
                        </span>

                        <ItemVerwijderen
                          itemId={item.id}
                          slug={slug}
                          titel={item.title}
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {les ? (
                  <div className="border-t border-line p-5">
                    <ItemToevoegen
                      lessonId={les.id}
                      slug={slug}
                      cursusSlug={cursus.slug}
                      volgendeSort={items.length}
                    />
                  </div>
                ) : null}
              </Paneel>
            );
          })
        )}

        <Paneel titel="Module toevoegen">
          <div className="p-5">
            <ModuleToevoegen
              cursusId={cursus.id}
              slug={slug}
              volgendeSort={gesorteerd.length}
            />
          </div>
        </Paneel>
      </div>
    </>
  );
}
