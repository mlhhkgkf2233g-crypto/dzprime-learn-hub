import { useServerFn } from "@tanstack/react-start";
import { Globe, Check } from "lucide-react";
import { useSession } from "./session";
import { updateSettings } from "@/lib/app.functions";
import { LANGS, useI18n, type Lang } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/** Global language switcher: updates UI instantly, persists locally and in user_settings. */
export function LanguageSelector({ variant = "icon" }: { variant?: "icon" | "full" }) {
  const { lang, setLang } = useI18n();
  const { initData } = useSession();
  const updateFn = useServerFn(updateSettings);
  const current = LANGS.find((l) => l.code === lang)!;

  function pick(next: Lang) {
    if (next === lang) return;
    setLang(next);
    if (initData) {
      void updateFn({ data: { initData, language: next } }).catch(() => undefined);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group inline-flex shrink-0 items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-3 py-2 text-xs font-semibold backdrop-blur transition-all",
          "hover:border-accent/60 hover:shadow-[0_0_18px_-4px_var(--color-accent)] active:scale-95",
        )}
        aria-label="Language"
      >
        {variant === "full" ? (
          <>
            <span className="text-base leading-none">{current.flag}</span>
            <span>{current.label}</span>
          </>
        ) : (
          <>
            <Globe className="h-4 w-4 text-accent" />
            <span className="text-base leading-none">{current.flag}</span>
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 rounded-xl">
        {LANGS.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onSelect={() => pick(l.code)}
            className="cursor-pointer gap-2 rounded-lg text-sm"
          >
            <span className="text-base leading-none">{l.flag}</span>
            <span className="flex-1">{l.label}</span>
            {l.code === lang ? <Check className="h-4 w-4 text-accent" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
