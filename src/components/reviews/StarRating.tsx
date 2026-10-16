"use client";

import { useId, type KeyboardEvent } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Read-only stars (supports fractional) ---------- */

export function StarDisplay({ value, size = 18 }: { value: number; size?: number }) {
  const label = `Rating ${value.toLocaleString("id-ID", { maximumFractionDigits: 1 })} dari 5`;
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.min(1, Math.max(0, value - i));
        return (
          <span key={i} className="relative" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-kapur/20" style={{ width: size, height: size }} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="text-seduh-light fill-seduh-light" style={{ width: size, height: size }} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/* ---------- Interactive star input ---------- */

const LABELS = ["", "Kurang", "Cukup", "Baik", "Enak", "Luar biasa"];

export function StarInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const groupId = useId();

  const handleKey = (e: KeyboardEvent, idx: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(5, idx + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(1, idx - 1));
    }
  };

  return (
    <fieldset className="flex items-center gap-3" role="radiogroup" aria-label="Beri bintang">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className={cn(
              "relative cursor-pointer transition-transform hover:scale-110",
              disabled && "pointer-events-none opacity-50",
            )}
            style={{ minWidth: 44, minHeight: 44, display: "grid", placeItems: "center" }}
          >
            <input
              type="radio"
              name={`star-${groupId}`}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              onKeyDown={(e) => handleKey(e, n)}
              className="sr-only"
              disabled={disabled}
            />
            <Star
              className={cn(
                "h-7 w-7 transition-colors",
                n <= value ? "fill-seduh-light text-seduh-light" : "text-kapur/25",
              )}
            />
          </label>
        ))}
      </div>
      {value > 0 && (
        <span className="text-sm text-kapur-dim">{LABELS[value]}</span>
      )}
    </fieldset>
  );
}
