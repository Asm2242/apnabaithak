import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/home-content")({
  server: {
    handlers: {
      GET: async () => {
        // try service_role first, fallback to anon client if env missing (Lovable/Vercel)
        const tryAdmin = async () => {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin.storage.from("menu").download("home_content.json");
          if (!error && data) return await data.text();
          const { data: row } = await (supabaseAdmin as unknown as { from: (t: string) => { select: (c: string) => { eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: unknown }> } } } })
            .from("home_content")
            .select("*")
            .eq("id", "main")
            .maybeSingle();
          if (row) return JSON.stringify(row);
          return null;
        };
        const tryAnon = async () => {
          const { supabase } = await import("@/integrations/supabase/client");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data } = await (supabase as any).from("home_content").select("*").eq("id", "main").maybeSingle();
          if (data) return JSON.stringify(data);
          return null;
        };
        try {
          const t = await tryAdmin();
          if (t) return new Response(t, { headers: { "content-type": "application/json", "cache-control": "no-store" } });
        } catch {
          // service_role missing — try anon
        }
        try {
          const t2 = await tryAnon();
          if (t2) return new Response(t2, { headers: { "content-type": "application/json", "cache-control": "no-store" } });
        } catch {
          // ignore
        }
        return new Response(JSON.stringify({}), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
      },
    },
  },
});
