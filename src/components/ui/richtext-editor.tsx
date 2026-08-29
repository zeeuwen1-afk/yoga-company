"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Heading2,
  Italic,
  Link2,
  List,
  Undo2,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Richtext-editor op basis van TipTap (BOUWPROMPT §14).
 *
 * Bewust karig: vet, cursief, een kop, een lijst en een link — meer niet. Wie
 * lettertypes en kleuren kan kiezen, maakt vroeg of laat een pagina die niet
 * meer op de rest van de site lijkt. De huisstijl hoort in de code te zitten,
 * niet in de knoppenbalk.
 */

function Knop({
  actief,
  icoon: Icoon,
  label,
  onClick,
}: {
  actief?: boolean;
  icoon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={actief}
      title={label}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md transition-colors",
        actief
          ? "bg-primary text-primary-foreground"
          : "text-muted hover:bg-hover",
      )}
    >
      <Icoon className="size-4" aria-hidden />
    </button>
  );
}

export function RichtextEditor({
  waarde,
  onWijzig,
}: {
  waarde: string;
  onWijzig: (html: string) => void;
}) {
  const editor = useEditor({
    // Zonder dit rendert TipTap eerst op de server en klaagt React over een
    // verschil met de browser.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
        // Uitgezet: deze opmaak past niet in de rustige huisstijl uit §5.
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
    ],
    content: waarde,
    onUpdate: ({ editor: huidige }) => onWijzig(huidige.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-32 px-4 py-3 focus:outline-none [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3 [&_p:last-child]:mb-0",
      },
    },
  });

  if (!editor) {
    return (
      <div className="rounded-lg border border-line p-4 text-sm text-muted">
        Editor wordt geladen…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <div
        role="toolbar"
        aria-label="Opmaak"
        className="flex flex-wrap gap-1 border-b border-line bg-cream p-1.5"
      >
        <Knop
          icoon={Bold}
          label="Vet"
          actief={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <Knop
          icoon={Italic}
          label="Cursief"
          actief={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <Knop
          icoon={Heading2}
          label="Kop"
          actief={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <Knop
          icoon={List}
          label="Lijst"
          actief={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <Knop
          icoon={Link2}
          label="Link"
          actief={editor.isActive("link")}
          onClick={() => {
            const huidig = editor.getAttributes("link").href as
              string | undefined;
            const adres = window.prompt(
              "Adres van de link:",
              huidig ?? "https://",
            );

            if (adres === null) return;
            if (adres === "") {
              editor.chain().focus().unsetLink().run();
              return;
            }
            editor.chain().focus().setLink({ href: adres }).run();
          }}
        />

        <span className="mx-1 w-px bg-line" aria-hidden />

        <Knop
          icoon={Undo2}
          label="Ongedaan maken"
          onClick={() => editor.chain().focus().undo().run()}
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
