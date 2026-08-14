import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSession } from "@/lib/app.functions";
import { initTelegram, getInitData } from "@/lib/telegram";

export type Profile = {
  id: string;
  name: string;
  school_year_id: string;
  branch_id: string | null;
  wilaya_id: string | null;
  school_years?: { name: string; slug: string } | null;
  branches?: { name: string } | null;
  wilayas?: { name: string; code: string } | null;
};

export type SessionUser = {
  id: string;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  photo_url: string | null;
};

type SessionValue = {
  initData: string;
  ready: boolean;
  loading: boolean;
  error: { code: string; message: string } | null;
  user: SessionUser | null;
  profile: Profile | null;
  settings: { notifications_enabled: boolean; language: string } | null;
  refresh: () => void;
};

const Ctx = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [initData, setInitData] = useState<string | null>(null);
  const fetchSession = useServerFn(getSession);
  const queryClient = useQueryClient();

  useEffect(() => {
    initTelegram();
    setInitData(getInitData());
  }, []);

  const query = useQuery({
    queryKey: ["session", initData],
    enabled: initData !== null && initData !== "",
    queryFn: () => fetchSession({ data: { initData: initData! } }),
    retry: false,
    staleTime: 60_000,
  });

  const value: SessionValue = {
    initData: initData ?? "",
    ready: initData !== null,
    loading: initData === null || (initData !== "" && query.isPending),
    error:
      initData === ""
        ? { code: "TELEGRAM_AUTH_REQUIRED", message: "يجب فتح التطبيق داخل تيليغرام" }
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
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
