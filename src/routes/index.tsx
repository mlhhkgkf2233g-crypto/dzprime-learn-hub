import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Newspaper, Megaphone, Sparkles, FileText, GraduationCap } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/app/EmptyState";
import { useSession } from "@/components/app/session";
import { getNewsFeed, getStudyContent } from "@/lib/app.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "الرئيسية | DZ PRIME ACADEMY" },
      { name: "description", content: "لوحة الطالب: آخر الأخبار والمحتوى التعليمي حسب سنتك وشعبتك." },
      { property: "og:title", content: "الرئيسية | DZ PRIME ACADEMY" },
      { property: "og:description", content: "لوحة الطالب في منصة DZ PRIME ACADEMY." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <AppShell title="الرئيسية">
      <HomeBody />
    </AppShell>
  );
}

function HomeBody() {
  const { profile, user, initData } = useSession();
  const newsFn = useServerFn(getNewsFeed);
  const contentFn = useServerFn(getStudyContent);

  const news = useQuery({
    queryKey: ["news", initData],
    queryFn: () => newsFn({ data: { initData } }),
    enabled: !!initData,
  });
  const content = useQuery({
    queryKey: ["content", initData, "all"],
    queryFn: () => contentFn({ data: { initData } }),
    enabled: !!initData,
  });

  const firstName = profile?.name?.split(" ")[0] || user?.first_name || "";
  const important = (news.data?.news ?? []).filter((n) => n.is_important).slice(0, 2);
  const latest = (news.data?.news ?? []).slice(0, 3);
  const recommended = (content.data?.content ?? []).slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="glass-card animate-dz-fade-up rounded-2xl p-5">
        <p className="text-sm text-muted-foreground">مرحباً بك</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold silver-text">{firstName}</h2>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-primary/15 px-3 py-1 text-accent">
            {profile?.school_years?.name}
          </span>
          {profile?.branches?.name ? (
            <span className="rounded-full bg-secondary/70 px-3 py-1">{profile.branches.name}</span>
          ) : null}
          {profile?.wilayas?.name ? (
            <span className="rounded-full bg-secondary/70 px-3 py-1">{profile.wilayas.name}</span>
          ) : null}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {[
          { to: "/content", label: "الدروس", icon: BookOpen, search: { type: "lesson" } },
          { to: "/content", label: "الملخصات", icon: FileText, search: { type: "summary" } },
          { to: "/content", label: "التمارين", icon: GraduationCap, search: { type: "exercise" } },
          { to: "/news", label: "الأخبار", icon: Newspaper, search: undefined },
        ].map((item) => (
          <Link
            key={item.label}
            to={item.to}
            search={item.search as never}
            className="glass-card flex items-center gap-3 rounded-2xl p-4 transition-transform active:scale-[0.98]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <item.icon className="h-5 w-5 text-accent" />
            </span>
            <span className="text-sm font-semibold">{item.label}</span>
          </Link>
        ))}
      </section>

      {important.length > 0 ? (
        <section className="space-y-3">
          <SectionTitle icon={Megaphone} title="إعلانات هامة" />
          {important.map((n) => (
            <article key={n.id} className="rounded-2xl border border-accent/40 bg-accent/10 p-4">
              <h3 className="font-display text-sm font-bold">{n.title}</h3>
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{n.content}</p>
            </article>
          ))}
        </section>
      ) : null}

      <section className="space-y-3">
        <SectionTitle icon={Newspaper} title="آخر الأخبار" />
        {news.isPending ? (
          <SkeletonList />
        ) : latest.length === 0 ? (
          <EmptyState icon={Newspaper} title="لا توجد أخبار حالياً" />
        ) : (
          latest.map((n) => (
            <Link
              key={n.id}
              to="/news"
              className="glass-card block rounded-2xl p-4 transition-transform active:scale-[0.99]"
            >
              <h3 className="font-display text-sm font-bold">{n.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.content}</p>
            </Link>
          ))
        )}
      </section>

      <section className="space-y-3">
        <SectionTitle icon={Sparkles} title="محتوى مقترح" />
        {content.isPending ? (
          <SkeletonList />
        ) : recommended.length === 0 ? (
          <EmptyState icon={BookOpen} title="لا يوجد محتوى متاح حالياً" />
        ) : (
          recommended.map((c) => (
            <Link
              key={c.id}
              to="/content"
              className="glass-card block rounded-2xl p-4 transition-transform active:scale-[0.99]"
            >
              <h3 className="font-display text-sm font-bold">{c.title}</h3>
              {c.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              ) : null}
            </Link>
          ))
        )}
      </section>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: typeof Newspaper;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-accent" />
      <h2 className="font-display text-sm font-bold">{title}</h2>
      <span className="gold-divider h-px flex-1" />
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[0, 1].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-secondary/50" />
      ))}
    </div>
  );
}
