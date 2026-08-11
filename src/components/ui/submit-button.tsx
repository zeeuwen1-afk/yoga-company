"use client";

import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "./button";

/** Verzendknop die zichzelf uitschakelt zolang het formulier bezig is. */
export function SubmitButton({
  children,
  bezigLabel = "Even geduld…",
  ...props
}: ButtonProps & { bezigLabel?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} aria-busy={pending} {...props}>
      {pending ? bezigLabel : children}
    </Button>
  );
}
