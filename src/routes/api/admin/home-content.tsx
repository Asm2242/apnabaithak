import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/home-content")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const body = (await request.json()) as Record<string, unknown>;
          const blob = new Blob([JSON.stringify({ id: "main", ...body })], { type: "application/json" });
          const { error } = await supabaseAdmin.storage.from("menu").upload("home_content.json", blob, {
            upsert: true,
            contentType: "application/json",
          });
          if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "content-type": "application/json" } });
          // also try to upsert table if it exists (best effort)
          try {
            const { id: _id, ...rest } = body as Record<string, unknown>;
            void _id;
            await (supabaseAdmin as unknown as { from: (t: string) => { upsert: (d: unknown, o: unknown) => Promise<unknown> } })
              .from("home_content")
              .upsert({ id: "main", ...rest }, { onConflict: "id" });
          } catch {
            // ignore table error
          }
          return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { "content-type": "application/json" } });
        }
      },
    },
  },
});
