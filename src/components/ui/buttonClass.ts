import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline: "border bg-card hover:bg-muted",
  ghost: "hover:bg-muted",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;

/** Button styles, shared by <Button> and links or labels that should look like buttons. */
export const buttonClass = (variant: ButtonVariant = "primary", className?: string) =>
  cn(
    "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3.5 text-sm font-medium",
    "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    "cursor-pointer disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    className,
  );
