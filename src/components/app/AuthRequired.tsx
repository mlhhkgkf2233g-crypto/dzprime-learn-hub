import { ShieldAlert, Settings2 } from "lucide-react";
import { Logo } from "./Logo";

export function AuthRequired({ code, message }: { code: string; message: string }) {
  const isConfig = code === "CONFIG_REQUIRED";
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo size={110} className="rounded-3xl" />
      <div className="glass-card animate-dz-fade-up max-w-sm rounded-2xl p-6">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/70">
          {isConfig ? (
            <Settings2 className="h-6 w-6 text-accent" />
          ) : (
            <ShieldAlert className="h-6 w-6 text-accent" />
          )}
        </div>
        <h1 className="font-display text-lg font-bold">
          {isConfig ? "إعداد مطلوب" : "مطلوب تسجيل الدخول عبر تيليغرام"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {isConfig
            ? "لم يتم ضبط مفاتيح الخادم بعد. يرجى إضافة TELEGRAM_BOT_TOKEN في إعدادات الخادم."
            : "هذا التطبيق يعمل داخل تيليغرام. افتحه من بوت DZ PRIME ACADEMY لتسجيل الدخول بحسابك الحقيقي."}
        </p>
        <p className="mt-4 rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground" dir="ltr">
          {message}
        </p>
      </div>
    </div>
  );
}
