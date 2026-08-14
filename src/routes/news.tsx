import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Newspaper, Pin } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/app/EmptyState";
import { useSession } from "@/components/app/session";
import { getNewsFeed } from "@/lib/app.functions";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "الأخبار | DZ PRIME ACADEMY" },
      { name: "description", content: "آخر أخبار وإعلانات أكاديمية DZ PRIME ACADEMY." },
      { property: "og:title", content: "الأخبار | DZ PRIME ACADEMY" },
      { property: "og:description", content: "الإعلانات العامة وأخبار سنتك الدراسية." },
    ],
  }),
  component: () => (
    <AppShell title="الأخبار">
      <NewsBody />
    </AppShell>
  ),
});

function NewsBody() {
  const { initData } = useSession();
  const newsFn = useServerFn(getNewsFeed);
  const q = useQuery({
    queryKey: ["news", initData],
    queryFn: () => newsFn({ data: { initData } }),
    enabled: !!initData,
  });

  if (q.isPending) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-secondary/50" />
        ))}
      </div>
    );
  }

  const news = q.data?.news ?? [];
  if (news.length === 0) return <EmptyState icon={Newspaper} title="لا توجد أخبار حالياً" />;

  return (
    <div className="space-y-4">
      {news.map((n) => (
        <article key={n.id} className="glass-card animate-dz-fade-up overflow-hidden rounded-2xl">
          {n.image_url ? (
            <img src={n.image_url} alt={n.title} className="h-40 w-full object-cover" loading="lazy" />
          ) : null}
          <div className="p-4">
            <div className="flex items-center gap-2">
              {n.is_important ? <Pin className="h-4 w-4 text-accent" /> : null}
              <h2 className="font-display text-base font-bold">{n.title}</h2>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{n.content}</p>
            <p className="mt-3 text-[11px] text-muted-foreground" dir="ltr">
              {new Date(n.published_at).toLocaleDateString("ar-DZ")}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
