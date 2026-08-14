import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Official DZ PRIME ACADEMY logo.
 * The image file lives at public/logo.png (uploaded brand asset).
 */
export function Logo({ className, size = 120 }: { className?: string; size?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl border border-border/60 bg-card font-display font-bold silver-text",
          className,
        )}
        style={{ width: size, height: size, fontSize: size / 4 }}
      >
        DZ
      </div>
    );
  }

  return (
    <img
      src="/logo.png"
      alt="DZ PRIME ACADEMY"
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={cn("object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.55)]", className)}
      style={{ width: size, height: size }}
    />
  );
}
