import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, ExternalLink } from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/app/EmptyState";
import { useSession } from "@/components/app/session";
import { getStudyContent } from "@/lib/app.functions";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  type: z.string().optional(),
  subject: z.string().optional(),
});

const CATEGORIES = [
  { value: undefined, label: "الكل" },
  { value: "lesson", label: "الدروس" },
  { value: "summary", label: "الملخصات" },
  { value: "exercise", label: "التمارين" },
  { value: "exam", label: "الاختبارات" },
  { value: "file", label: "الملفات" },
] as const;

export const Route = createFileRoute("/content")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "المحتوى | DZ PRIME ACADEMY" },
      { name: "description", content: "دروس وملخصات وتمارين واختبارات حسب سنتك وشعبتك." },
      { property: "og:title", content: "المحتوى | DZ PRIME ACADEMY" },
      { property: "og:description", content: "المحتوى التعليمي الخاص بسنتك الدراسية وشعبتك." },
    ],
  }),
  component: () => (
    <AppShell title="المحتوى">
      <ContentBody />
    </AppShell>
  ),
});

function ContentBody() {
  const { initData } = useSession();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/content" });
  const contentFn = useServerFn(getStudyContent);

  const q = useQuery({
    queryKey: ["content", initData, search.type ?? "all", search.subject ?? "all"],
    queryFn: () =>
      contentFn({
        data: {
          initData,
          ...(search.type ? { contentType: search.type } : {}),
          ...(search.subject ? { subjectId: search.subject } : {}),
        },
      }),
    enabled: !!initData,
  });

  const subjects = q.data?.subjects ?? [];
  const items = q.data?.content ?? [];

  return (
    <div className="space-y-5">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.label}
            onClick={() =>
              void navigate({ search: (prev) => ({ ...prev, type: c.value }), replace: true })
            }
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
              (search.type ?? undefined) === c.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/60 text-muted-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {subjects.length > 0 ? (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            onClick={() =>
              void navigate({ search: (prev) => ({ ...prev, subject: undefined }), replace: true })
            }
            className={cn(
              "shrink-0 rounded-xl border px-3 py-1.5 text-xs",
              !search.subject ? "border-accent text-accent" : "border-border text-muted-foreground",
            )}
          >
            كل المواد
          </button>
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() =>
                void navigate({ search: (prev) => ({ ...prev, subject: s.id }), replace: true })
              }
              className={cn(
                "shrink-0 rounded-xl border px-3 py-1.5 text-xs",
                search.subject === s.id
                  ? "border-accent text-accent"
                  : "border-border text-muted-foreground",
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      ) : null}

      {q.isPending ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-secondary/50" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={BookOpen} title="لا يوجد محتوى متاح حالياً" />
      ) : (
        <div className="space-y-3">
          {items.map((c) => {
            const url = c.file_url || c.external_url;
            const Card = (
              <div className="glass-card animate-dz-fade-up rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-sm font-bold">{c.title}</h2>
                    {c.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                    ) : null}
                  </div>
                  {url ? <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-accent" /> : null}
                </div>
              </div>
            );
            return url ? (
              <a key={c.id} href={url} target="_blank" rel="noopener noreferrer" className="block">
                {Card}
              </a>
            ) : (
              <div key={c.id}>{Card}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
