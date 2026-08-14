import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="glass-card animate-dz-fade-up flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/70">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="font-display text-base font-bold text-foreground">{title}</p>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
