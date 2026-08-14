import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, Newspaper, BookOpen, User, Settings } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useSession } from "./session";
import { SplashScreen } from "./SplashScreen";
import { AuthRequired } from "./AuthRequired";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "الرئيسية", icon: Home },
  { to: "/news", label: "الأخبار", icon: Newspaper },
  { to: "/content", label: "المحتوى", icon: BookOpen },
  { to: "/account", label: "الحساب", icon: User },
  { to: "/settings", label: "الإعدادات", icon: Settings },
] as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { loading, error, profile } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !error && !profile) void navigate({ to: "/onboarding", replace: true });
  }, [loading, error, profile, navigate]);

  if (loading) return <SplashScreen />;
  if (error) return <AuthRequired code={error.code} message={error.message} />;
  if (!profile) return <SplashScreen message="جاري تجهيز حسابك..." />;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-xl">
        <Logo size={38} className="rounded-xl" />
        <div className="flex-1">
          <p className="font-display text-[13px] font-extrabold tracking-[0.14em] silver-text">
            DZ PRIME ACADEMY
          </p>
          <h1 className="text-xs text-muted-foreground">{title}</h1>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>

      <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-lg -translate-x-1/2 border-t border-border/60 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <ul className="grid grid-cols-5">
          {TABS.map((tab) => {
            const active = pathname === tab.to;
            return (
              <li key={tab.to}>
                <Link
                  to={tab.to}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors",
                    active ? "text-accent" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                      active && "bg-primary/15 shadow-[0_0_0_1px_var(--color-primary)]",
                    )}
                  >
                    <tab.icon className="h-[18px] w-[18px]" />
                  </span>
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
