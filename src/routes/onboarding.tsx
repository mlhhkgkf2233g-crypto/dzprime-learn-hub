import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/app/Logo";
import { SplashScreen } from "@/components/app/SplashScreen";
import { AuthRequired } from "@/components/app/AuthRequired";
import { useSession } from "@/components/app/session";
import { getReferenceData, saveProfile } from "@/lib/app.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "إنشاء الملف الدراسي | DZ PRIME ACADEMY" },
      { name: "description", content: "أكمل معلوماتك الدراسية للانضمام إلى DZ PRIME ACADEMY." },
      { property: "og:title", content: "إنشاء الملف الدراسي | DZ PRIME ACADEMY" },
      { property: "og:description", content: "أكمل معلوماتك لنجهز لك تجربتك الدراسية." },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const { loading, error, profile, refresh, user, authenticated, ready } = useSession();
  const navigate = useNavigate();
  const refFn = useServerFn(getReferenceData);
  const submitFn = useServerFn(saveProfile);

  const [name, setName] = useState("");
  const [yearId, setYearId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [wilayaId, setWilayaId] = useState("");
  const [saving, setSaving] = useState(false);

  const reference = useQuery({ queryKey: ["reference"], queryFn: () => refFn() });

  useEffect(() => {
    if (!loading && profile) void navigate({ to: "/", replace: true });
  }, [loading, profile, navigate]);

  useEffect(() => {
    if (!name && user?.first_name) setName([user.first_name, user.last_name].filter(Boolean).join(" "));
  }, [user, name]);

  const branches = useMemo(
    () => (reference.data?.branches ?? []).filter((b) => b.school_year_id === yearId),
    [reference.data, yearId],
  );

  if (loading) return <SplashScreen />;
  if (error) return <AuthRequired code={error.code} message={error.message} />;

  const valid = name.trim().length >= 2 && yearId && branchId && wilayaId;

  async function submit() {
    if (!valid || saving) return;
    setSaving(true);
    const res = await submitFn({
      data: { name: name.trim(), school_year_id: yearId, branch_id: branchId, wilaya_id: wilayaId },
    });
    setSaving(false);
    if (res.ok) {
      refresh();
      void navigate({ to: "/", replace: true });
    } else {
      toast.error(res.error?.message ?? "تعذر حفظ المعلومات");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-5 py-8">
      <div className="animate-dz-fade-up flex flex-col items-center text-center">
        <Logo size={96} className="rounded-3xl" />
        <h1 className="mt-5 font-display text-xl font-extrabold silver-text">
          أهلاً بك في DZ PRIME ACADEMY
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">أكمل معلوماتك لنجهز لك تجربتك الدراسية</p>
      </div>

      <div className="glass-card animate-dz-fade-up mt-8 space-y-5 rounded-2xl p-5">
        <div className="space-y-2">
          <Label htmlFor="name">الاسم</Label>
          <Input
            id="name"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
            placeholder="اكتب اسمك الكامل"
            className="bg-secondary/50"
          />
        </div>

        <div className="space-y-2">
          <Label>السنة الدراسية</Label>
          <Select
            value={yearId}
            onValueChange={(v) => {
              setYearId(v);
              setBranchId("");
            }}
          >
            <SelectTrigger className="bg-secondary/50">
              <SelectValue placeholder="اختر السنة الدراسية" />
            </SelectTrigger>
            <SelectContent>
              {(reference.data?.years ?? []).map((y) => (
                <SelectItem key={y.id} value={y.id}>
                  {y.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>الشعبة</Label>
          <Select value={branchId} onValueChange={setBranchId} disabled={!yearId}>
            <SelectTrigger className="bg-secondary/50">
              <SelectValue placeholder={yearId ? "اختر الشعبة" : "اختر السنة أولاً"} />
            </SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>الولاية</Label>
          <Select value={wilayaId} onValueChange={setWilayaId}>
            <SelectTrigger className="bg-secondary/50">
              <SelectValue placeholder="اختر الولاية" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {(reference.data?.wilayas ?? []).map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.code} - {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full" size="lg" disabled={!valid || saving} onClick={() => void submit()}>
          {saving ? "جاري الحفظ..." : "متابعة"}
        </Button>
      </div>
    </div>
  );
}
