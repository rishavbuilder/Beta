import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fcqdotvzdfdxygkxuanm.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_UFaBQm0GWiKupNb23a-Grg_gba97k7V";
const SITE_URL = (process.env.VITE_APP_URL || "https://promptsos.vercel.app").replace(/\/+$/, "");

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

function buildXml(pages) {
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

async function generateSitemap() {
  let promptPages = [];

  const { data: prompts, error } = await supabase
    .from("prompts")
    .select("id, updated_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    console.error("Failed to fetch prompts:", error.message);
  } else {
    promptPages = prompts.map((p) => ({
      loc: `/prompt/${p.id}`,
      priority: "0.8",
      changefreq: "weekly",
      lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split("T")[0] : undefined,
    }));
  }

  const allPages = [...staticPages, ...promptPages];
  const xml = buildXml(allPages);

  // Write to public/ so it's served as a static file (instant, no cold start)
  writeFileSync("public/sitemap.xml", xml);
  writeFileSync("public/sitemap_index.xml", xml);
  console.log(`Sitemap generated with ${allPages.length} URLs (${promptPages.length} prompts)`);

  // robots.txt — clean, points to both sitemaps, blocks private routes
  const robots = `User-agent: *
Allow: /

Disallow: /dashboard/
Disallow: /admin/
Disallow: /auth/
Disallow: /notifications/
Disallow: /api/

# Sitemaps
Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/sitemap_index.xml
`;
  writeFileSync("public/robots.txt", robots);
  console.log("robots.txt generated");
}

generateSitemap().catch(console.error);
