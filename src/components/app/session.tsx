import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { Session } from "@supabase/supabase-js";
import { getSession } from "@/lib/app.functions";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  name: string;
  school_year_id: string;
  branch_id: string | null;
  wilaya_id: string | null;
  school_year_name: string | null;
  school_year_slug: string | null;
  branch_name: string | null;
  wilaya_name: string | null;
};

export type SessionUser = {
  id: string;
  email: string | null;
  telegram_id: number | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  photo_url: string | null;
};

type SessionValue = {
  /** true once the Supabase auth state has been resolved on the client */
  ready: boolean;
  authenticated: boolean;
  loading: boolean;
  error: { code: string; message: string } | null;
  user: SessionUser | null;
  profile: Profile | null;
  settings: { notifications_enabled: boolean; language: string } | null;
  refresh: () => void;
  signOut: () => Promise<void>;
};

const Ctx = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const fetchSession = useServerFn(getSession);
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!active) return;
      setAuthSession(s);
      setReady(true);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setAuthSession(data.session);
      setReady(true);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const userId = authSession?.user?.id ?? null;

  const query = useQuery({
    queryKey: ["session", userId],
    enabled: !!userId,
    queryFn: () => fetchSession(),
    retry: false,
    staleTime: 60_000,
  });

  const value: SessionValue = {
    ready,
    authenticated: !!userId,
    loading: !ready || (!!userId && query.isPending),
    error:
      !userId && ready
        ? null
        : query.data && !query.data.ok
          ? (query.data.error ?? { code: "ERROR", message: "خطأ غير متوقع" })
          : query.error
            ? { code: "ERROR", message: "تعذر الاتصال بالخادم" }
            : null,
    user: query.data?.ok ? ((query.data.user as unknown as SessionUser) ?? null) : null,
    profile: query.data?.ok ? ((query.data.profile as unknown as Profile) ?? null) : null,
    settings: query.data?.ok ? ((query.data.settings as never) ?? null) : null,
    refresh: () => {
      void queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    signOut: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
