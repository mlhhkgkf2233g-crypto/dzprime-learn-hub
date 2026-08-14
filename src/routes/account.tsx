import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
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

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "الحساب | DZ PRIME ACADEMY" },
      { name: "description", content: "معلومات الطالب: الاسم، السنة الدراسية، الشعبة والولاية." },
      { property: "og:title", content: "الحساب | DZ PRIME ACADEMY" },
      { property: "og:description", content: "إدارة ملفك الدراسي في DZ PRIME ACADEMY." },
    ],
  }),
  component: () => (
    <AppShell title="الحساب">
      <AccountBody />
    </AppShell>
  ),
});

function AccountBody() {
  const { profile, user, initData, refresh } = useSession();
  const refFn = useServerFn(getReferenceData);
  const submitFn = useServerFn(saveProfile);
  const reference = useQuery({ queryKey: ["reference"], queryFn: () => refFn() });

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name ?? "");
  const [yearId, setYearId] = useState(profile?.school_year_id ?? "");
  const [branchId, setBranchId] = useState(profile?.branch_id ?? "");
  const [wilayaId, setWilayaId] = useState(profile?.wilaya_id ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setYearId(profile.school_year_id);
      setBranchId(profile.branch_id ?? "");
      setWilayaId(profile.wilaya_id ?? "");
    }
  }, [profile]);

  const branches = useMemo(
    () => (reference.data?.branches ?? []).filter((b) => b.school_year_id === yearId),
    [reference.data, yearId],
  );

  async function save() {
    if (saving) return;
    if (name.trim().length < 2 || !yearId || !branchId || !wilayaId) {
      toast.error("يرجى إكمال جميع الحقول");
      return;
    }
    setSaving(true);
    const res = await submitFn({
      data: { initData, name: name.trim(), school_year_id: yearId, branch_id: branchId, wilaya_id: wilayaId },
    });
    setSaving(false);
    if (res.ok) {
      refresh();
      setEditing(false);
      toast.success("تم حفظ التعديلات");
    } else {
      toast.error(res.error?.message ?? "تعذر الحفظ");
    }
  }

  return (
    <div className="space-y-5">
      <section className="glass-card animate-dz-fade-up flex items-center gap-4 rounded-2xl p-5">
        {user?.photo_url ? (
          <img src={user.photo_url} alt={profile?.name ?? ""} className="h-16 w-16 rounded-2xl object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 font-display text-xl font-bold text-accent">
            {(profile?.name ?? "").slice(0, 1)}
          </div>
        )}
        <div>
          <h2 className="font-display text-lg font-bold">{profile?.name}</h2>
          {user?.username ? (
            <p className="text-sm text-muted-foreground" dir="ltr">
              @{user.username}
            </p>
          ) : null}
        </div>
      </section>

      {!editing ? (
        <section className="glass-card space-y-3 rounded-2xl p-5 text-sm">
          <Row label="الاسم" value={profile?.name ?? "—"} />
          <Row label="السنة الدراسية" value={profile?.school_years?.name ?? "—"} />
          <Row label="الشعبة" value={profile?.branches?.name ?? "—"} />
          <Row label="الولاية" value={profile?.wilayas?.name ?? "—"} />
          <Button className="mt-2 w-full" onClick={() => setEditing(true)}>
            تعديل المعلومات
          </Button>
        </section>
      ) : (
        <section className="glass-card space-y-4 rounded-2xl p-5">
          <div className="space-y-2">
            <Label htmlFor="acc-name">الاسم</Label>
            <Input id="acc-name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} className="bg-secondary/50" />
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
                <SelectValue placeholder="اختر السنة" />
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
                <SelectValue placeholder="اختر الشعبة" />
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
          <div className="flex gap-2">
            <Button className="flex-1" disabled={saving} onClick={() => void save()}>
              {saving ? "جاري الحفظ..." : "حفظ"}
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => setEditing(false)}>
              إلغاء
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
