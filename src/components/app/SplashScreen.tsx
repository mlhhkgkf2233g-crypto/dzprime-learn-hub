import { Logo } from "./Logo";

export function SplashScreen({ message = "جاري التحميل..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background px-6">
      <div className="relative flex items-center justify-center">
        <span className="absolute h-44 w-44 rounded-full border border-primary/40 animate-dz-ring" />
        <span className="absolute h-44 w-44 rounded-full border border-primary/20 animate-dz-ring [animation-delay:0.7s]" />
        <div className="animate-dz-float">
          <Logo size={168} className="rounded-3xl" />
        </div>
      </div>

      <div className="animate-dz-fade-up text-center">
        <h1 className="font-display text-2xl font-extrabold tracking-[0.18em] silver-text">
          DZ PRIME ACADEMY
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">منصة تعليمية جزائرية متميزة</p>
      </div>

      <div className="w-48 overflow-hidden rounded-full bg-secondary/70">
        <div className="h-1 w-1/2 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent animate-dz-bar" />
      </div>
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}
