import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Bell, Globe, Info, LifeBuoy, UserCog, ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { useSession } from "@/components/app/session";
import { updateSettings } from "@/lib/app.functions";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات | DZ PRIME ACADEMY" },
      { name: "description", content: "إعدادات الحساب: الإشعارات، اللغة، الدعم ومعلومات التطبيق." },
      { property: "og:title", content: "الإعدادات | DZ PRIME ACADEMY" },
      { property: "og:description", content: "تحكم في إعدادات حسابك داخل DZ PRIME ACADEMY." },
    ],
  }),
  component: () => (
    <AppShell title="الإعدادات">
      <SettingsBody />
    </AppShell>
  ),
});

function SettingsBody() {
  const { settings, initData, refresh, user } = useSession();
  const updateFn = useServerFn(updateSettings);
  const [busy, setBusy] = useState(false);

  async function patch(payload: { notifications_enabled?: boolean; language?: "ar" | "fr" | "en" }) {
    setBusy(true);
    const res = await updateFn({ data: { initData, ...payload } });
    setBusy(false);
    if (res.ok) {
      refresh();
      toast.success("تم حفظ الإعداد");
    } else {
      toast.error(res.error?.message ?? "تعذر حفظ الإعداد");
    }
  }

  return (
    <div className="space-y-4">
      <Link to="/account" className="glass-card flex items-center gap-3 rounded-2xl p-4">
        <UserCog className="h-5 w-5 text-accent" />
        <span className="flex-1 text-sm font-semibold">تعديل المعلومات الشخصية</span>
        <ChevronLeft className="h-4 w-4 text-muted-foreground" />
      </Link>

      <div className="glass-card flex items-center gap-3 rounded-2xl p-4">
        <Bell className="h-5 w-5 text-accent" />
        <span className="flex-1 text-sm font-semibold">الإشعارات</span>
        <Switch
          checked={settings?.notifications_enabled ?? true}
          disabled={busy}
          onCheckedChange={(v) => void patch({ notifications_enabled: v })}
        />
      </div>

      <div className="glass-card flex items-center gap-3 rounded-2xl p-4">
        <Globe className="h-5 w-5 text-accent" />
        <span className="flex-1 text-sm font-semibold">اللغة</span>
        <Select
          value={settings?.language ?? "ar"}
          disabled={busy}
          onValueChange={(v) => void patch({ language: v as "ar" | "fr" | "en" })}
        >
          <SelectTrigger className="w-32 bg-secondary/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ar">العربية</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card space-y-2 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold">حول التطبيق</span>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          DZ PRIME ACADEMY — منصة تعليمية جزائرية للطور الثانوي، تقدم الدروس والملخصات والتمارين
          والاختبارات حسب السنة الدراسية والشعبة.
        </p>
        {user ? (
          <p className="text-[11px] text-muted-foreground" dir="ltr">
            Telegram ID: {user.telegram_id}
          </p>
        ) : null}
      </div>

      <a
        href="https://t.me/share/url?url=&text=DZ%20PRIME%20ACADEMY"
        target="_blank"
        rel="noopener noreferrer"
        className="glass-card flex items-center gap-3 rounded-2xl p-4"
      >
        <LifeBuoy className="h-5 w-5 text-accent" />
        <span className="flex-1 text-sm font-semibold">الدعم</span>
        <ChevronLeft className="h-4 w-4 text-muted-foreground" />
      </a>
    </div>
  );
}
