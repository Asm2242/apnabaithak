import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/home-content")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const payload = { id: "main", ...body };
        // try service_role first
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
          const { error } = await supabaseAdmin.storage.from("menu").upload("home_content.json", blob, {
            upsert: true,
            contentType: "application/json",
          });
          if (!error) {
            try {
              const { id: _id, ...rest } = body as Record<string, unknown>;
              void _id;
              await (supabaseAdmin as unknown as { from: (t: string) => { upsert: (d: unknown, o: unknown) => Promise<unknown> } })
                .from("home_content")
                .upsert({ id: "main", ...rest }, { onConflict: "id" });
            } catch {
              // ignore table
            }
            return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
          }
          // if service_role failed but not missing env, return error
          if (!String(error.message).includes("Missing Supabase")) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "content-type": "application/json" } });
          }
        } catch (e) {
          const m = e instanceof Error ? e.message : String(e);
          if (!m.includes("Missing Supabase")) {
            return new Response(JSON.stringify({ error: m }), { status: 500, headers: { "content-type": "application/json" } });
          }
          // missing env — fall through to anon fallback (client will handle)
        }
        // fallback: tell client to save directly via anon (admin role via RLS)
        return new Response(JSON.stringify({ ok: false, fallback: true }), { headers: { "content-type": "application/json" } });
      },
    },
  },
});
