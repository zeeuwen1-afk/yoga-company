import { cn } from "@/lib/utils";

/** Statusmelding boven of onder een formulier. */
export function FormMessage({
  variant,
  children,
  className,
}: {
  variant: "fout" | "gelukt";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      role={variant === "fout" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        variant === "fout"
          ? "border-error/40 bg-error/10 text-error"
          : "border-success/40 bg-success/10 text-success",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Foutmelding onder één specifiek veld. */
export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1.5 text-sm text-error">{children}</p>;
}

/**
 * Onzichtbaar veld dat mensen nooit invullen en bots vaak wel
 * (BOUWPROMPT §7). Niet met `hidden`: dat slaan bots over.
 */
export function Honeypot() {
  return (
    <div
      aria-hidden
      className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
    >
      <label htmlFor="website">Laat dit veld leeg</label>
      <input
        id="website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
