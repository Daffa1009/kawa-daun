import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "whatsapp";

const variants: Record<Variant, string> = {
  primary:
    "bg-seduh text-sayak-900 hover:bg-seduh-light active:bg-seduh-dark font-semibold",
  outline:
    "border border-seduh/50 text-kapur hover:bg-seduh/10 hover:border-seduh",
  ghost: "text-kapur-dim hover:text-kapur hover:bg-kapur/5",
  whatsapp: "bg-[#25D366] text-[#07240F] hover:bg-[#3BE57B] font-semibold",
};

export const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm transition-colors duration-200 " +
  "disabled:cursor-not-allowed disabled:bg-kapur/10 disabled:text-kapur-dim/70 disabled:border-transparent disabled:hover:bg-kapur/10";

export const buttonClass = (variant: Variant = "primary", className?: string) =>
  cn(buttonBase, variants[variant], className);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass(variant, className)}
      {...props}
    />
  );
});
