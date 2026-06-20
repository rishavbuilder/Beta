import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://promptsos.vercel.app";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fcqdotvzdfdxygkxuanm.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_UFaBQm0GWiKupNb23a-Grg_gba97k7V";

// Lazy-init so cold starts don't fail if env is missing
let supabase: ReturnType<typeof createClient> | null = null;
function getClient() {
  if (!supabase) supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabase;
}

const staticPages = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/explore", priority: "0.9", changefreq: "daily" },
  { loc: "/categories", priority: "0.8", changefreq: "weekly" },
  { loc: "/community", priority: "0.7", changefreq: "daily" },
  { loc: "/battle", priority: "0.7", changefreq: "daily" },
  { loc: "/battle/leaderboard", priority: "0.5", changefreq: "daily" },
  { loc: "/lab", priority: "0.6", changefreq: "weekly" },
  { loc: "/optimizer", priority: "0.6", changefreq: "weekly" },
];

function buildXml(pages: Array<{ loc: string; priority: string; changefreq: string; lastmod?: string }>) {
  const urls = pages
    .map((p) => {
      const lastmodLine = p.lastmod
        ? `    <lastmod>${p.lastmod}</lastmod>\n`
        : "";
      return `  <url>
    <loc>${SITE_URL}${p.loc}</loc>
${lastmodLine}    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export default defineEventHandler(async () => {
  let xml: string;

  try {
    const { data: prompts, error } = await getClient()
      .from("prompts")
      .select("id, updated_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) throw error;

    const promptPages = (prompts || []).map((p) => ({
      loc: `/prompt/${p.id}`,
      priority: "0.8",
      changefreq: "weekly",
      lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split("T")[0] : undefined,
    }));

    xml = buildXml([...staticPages, ...promptPages]);
  } catch (e) {
    // Fallback: static pages only if DB fails
    console.error("Sitemap DB fetch failed, using static fallback:", e);
    xml = buildXml(staticPages);
  }

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
      "X-Robots-Tag": "all",
    },
  });
});
