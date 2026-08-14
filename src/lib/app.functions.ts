import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const sessionInput = z.object({ initData: z.string() });

export const getReferenceData = createServerFn({ method: "GET" }).handler(async () => {
  const { admin, toClientError } = await import("./session.server");
  try {
    const db = admin();
    const [years, branches, wilayas] = await Promise.all([
      db.from("school_years").select("id, slug, name, position").order("position"),
      db.from("branches").select("id, school_year_id, slug, name, position").order("position"),
      db.from("wilayas").select("id, code, name").order("code"),
    ]);
    return {
      ok: true as const,
      years: years.data ?? [],
      branches: branches.data ?? [],
      wilayas: wilayas.data ?? [],
    };
  } catch (e) {
    return { ok: false as const, error: toClientError(e), years: [], branches: [], wilayas: [] };
  }
});

export const getSession = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => sessionInput.parse(d))
  .handler(async ({ data }) => {
    const { requireUser, toClientError } = await import("./session.server");
    try {
      const { db, user } = await requireUser(data.initData);
      const { data: profile } = await db
        .from("student_profiles")
        .select(
          "id, name, school_year_id, branch_id, wilaya_id, school_years(name, slug), branches(name), wilayas(name, code)",
        )
        .eq("user_id", user.id)
        .maybeSingle();
      let { data: settings } = await db
        .from("user_settings")
        .select("notifications_enabled, language")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!settings) {
        const created = await db
          .from("user_settings")
          .insert({ user_id: user.id })
          .select("notifications_enabled, language")
          .single();
        settings = created.data;
      }
      return { ok: true as const, user, profile: profile ?? null, settings };
    } catch (e) {
      return { ok: false as const, error: toClientError(e) };
    }
  });

export const saveProfile = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        initData: z.string(),
        name: z.string().trim().min(2).max(80),
        school_year_id: z.string().uuid(),
        branch_id: z.string().uuid(),
        wilaya_id: z.string().uuid(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { requireUser, toClientError } = await import("./session.server");
    try {
      const { db, user } = await requireUser(data.initData);
      const { error } = await db.from("student_profiles").upsert(
        {
          user_id: user.id,
          name: data.name,
          school_year_id: data.school_year_id,
          branch_id: data.branch_id,
          wilaya_id: data.wilaya_id,
        },
        { onConflict: "user_id" },
      );
      if (error) throw new Error(error.message);
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: toClientError(e) };
    }
  });

export const getNewsFeed = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => sessionInput.parse(d))
  .handler(async ({ data }) => {
    const { requireUser, toClientError } = await import("./session.server");
    try {
      const { db, user } = await requireUser(data.initData);
      const { data: profile } = await db
        .from("student_profiles")
        .select("school_year_id, branch_id")
        .eq("user_id", user.id)
        .maybeSingle();
      let query = db
        .from("news")
        .select("id, title, content, image_url, visibility, is_important, published_at")
        .lte("published_at", new Date().toISOString())
        .order("published_at", { ascending: false });
      if (profile) {
        const filters = [
          "visibility.eq.global",
          `school_year_id.eq.${profile.school_year_id}`,
          profile.branch_id ? `branch_id.eq.${profile.branch_id}` : null,
        ].filter(Boolean) as string[];
        query = query.or(filters.join(","));
      } else {
        query = query.eq("visibility", "global");
      }
      const { data: news, error } = await query.limit(60);
      if (error) throw new Error(error.message);
      return { ok: true as const, news: news ?? [] };
    } catch (e) {
      return { ok: false as const, error: toClientError(e), news: [] };
    }
  });

export const getStudyContent = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        initData: z.string(),
        contentType: z.string().max(40).optional(),
        subjectId: z.string().uuid().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { requireUser, toClientError } = await import("./session.server");
    try {
      const { db, user } = await requireUser(data.initData);
      const { data: profile } = await db
        .from("student_profiles")
        .select("school_year_id, branch_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!profile) return { ok: true as const, content: [], subjects: [] };

      const { data: subjects } = await db
        .from("subjects")
        .select("id, name, slug, icon")
        .eq("school_year_id", profile.school_year_id)
        .or(`branch_id.is.null${profile.branch_id ? `,branch_id.eq.${profile.branch_id}` : ""}`)
        .order("position");

      let query = db
        .from("content")
        .select("id, title, description, content_type, file_url, external_url, subject_id, created_at")
        .eq("is_published", true)
        .eq("school_year_id", profile.school_year_id)
        .or(`branch_id.is.null${profile.branch_id ? `,branch_id.eq.${profile.branch_id}` : ""}`)
        .order("created_at", { ascending: false });
      if (data.contentType) query = query.eq("content_type", data.contentType);
      if (data.subjectId) query = query.eq("subject_id", data.subjectId);

      const { data: content, error } = await query.limit(100);
      if (error) throw new Error(error.message);
      return { ok: true as const, content: content ?? [], subjects: subjects ?? [] };
    } catch (e) {
      return { ok: false as const, error: toClientError(e), content: [], subjects: [] };
    }
  });

export const updateSettings = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        initData: z.string(),
        notifications_enabled: z.boolean().optional(),
        language: z.enum(["ar", "fr", "en"]).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { requireUser, toClientError } = await import("./session.server");
    try {
      const { db, user } = await requireUser(data.initData);
      const patch: Record<string, unknown> = { user_id: user.id };
      if (data.notifications_enabled !== undefined)
        patch["notifications_enabled"] = data.notifications_enabled;
      if (data.language !== undefined) patch["language"] = data.language;
      const { error } = await db.from("user_settings").upsert(patch, { onConflict: "user_id" });
      if (error) throw new Error(error.message);
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: toClientError(e) };
    }
  });
