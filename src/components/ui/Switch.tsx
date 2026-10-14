import { cn } from "@/lib/utils";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
};

export function Switch({ checked, onChange, label, disabled }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50",
        checked ? "bg-daun" : "bg-kapur/20",
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-kapur shadow transition-transform duration-200",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}
