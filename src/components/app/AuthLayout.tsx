import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { LanguageSelector } from "./LanguageSelector";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent/15 blur-[120px]" />

      <div className="absolute top-4 ltr:right-4 rtl:left-4 z-10">
        <LanguageSelector />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="animate-dz-fade-up flex flex-col items-center text-center">
          <div className="relative">
            <span className="absolute inset-0 rounded-3xl bg-primary/30 blur-2xl" />
            <Logo size={96} className="relative rounded-3xl" />
          </div>
          <p className="mt-4 font-display text-sm font-extrabold tracking-[0.18em] silver-text">
            DZ PRIME ACADEMY
          </p>
        </div>

        <div className="glass-card animate-dz-fade-up mt-6 rounded-2xl p-6 shadow-[0_20px_60px_-20px_rgba(22,131,255,0.45)]">
          <h1 className="font-display text-xl font-extrabold">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
          <div className="mt-6 space-y-4">{children}</div>
        </div>

        {footer ? <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div> : null}
      </div>
    </div>
  );
}
