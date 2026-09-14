import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/home-content")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          // try storage file first (always works, no schema cache)
          const { data, error } = await supabaseAdmin.storage.from("menu").download("home_content.json");
          if (!error && data) {
            const text = await data.text();
            return new Response(text, {
              headers: {
                "content-type": "application/json",
                "cache-control": "no-store, max-age=0",
              },
            });
          }
          // fallback: try table via service role (if table exists)
          const { data: row } = await (supabaseAdmin as unknown as { from: (t: string) => { select: (c: string) => { eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: unknown }> } } } })
            .from("home_content")
            .select("*")
            .eq("id", "main")
            .maybeSingle();
          if (row) {
            return new Response(JSON.stringify(row), {
              headers: { "content-type": "application/json", "cache-control": "no-store" },
            });
          }
          return new Response(JSON.stringify({}), {
            headers: { "content-type": "application/json", "cache-control": "no-store" },
          });
        } catch {
          return new Response(JSON.stringify({}), {
            headers: { "content-type": "application/json", "cache-control": "no-store" },
          });
        }
      },
    },
  },
});
