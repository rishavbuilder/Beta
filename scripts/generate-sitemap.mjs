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
  { loc: "/auth/login", priority: "0.3", changefreq: "monthly" },
  { loc: "/auth/register", priority: "0.3", changefreq: "monthly" },
];

async function generateSitemap() {
  const { data: prompts, error } = await supabase
    .from("prompts")
    .select("id, updated_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch prompts:", error.message);
  }

  const promptPages = (prompts || []).map((p) => ({
    loc: `/prompt/${p.id}`,
    priority: "0.8",
    changefreq: "weekly",
    lastmod: p.updated_at,
  }));

  const allPages = [...staticPages, ...promptPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
${page.lastmod ? `    <lastmod>${new Date(page.lastmod).toISOString().split("T")[0]}</lastmod>\n` : ""}    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  writeFileSync("public/sitemap.xml", xml);
  console.log(`Sitemap generated with ${allPages.length} URLs (${promptPages.length} prompts)`);

  // Also generate robots.txt
  const robots = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /admin/
Disallow: /auth/
Disallow: /notifications/

Sitemap: ${SITE_URL}/sitemap.xml
`;

  writeFileSync("public/robots.txt", robots);
  console.log("Robots.txt generated");
}

generateSitemap().catch(console.error);
