import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-green text-cream hover:bg-green-dark",
        secondary:
          "border border-line-strong bg-transparent text-green-dark hover:bg-sand-light",
        ghost: "text-green-dark hover:bg-sand-light",
        danger: "bg-error text-cream hover:opacity-90",
      },
      size: {
        // Minimaal 44px hoog: tap-target voor mobiel (BOUWPROMPT §11/§18)
        md: "h-11 px-5 text-base",
        sm: "h-9 px-3 text-sm",
        lg: "h-12 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, ...props }, ref) {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

export { buttonVariants };
