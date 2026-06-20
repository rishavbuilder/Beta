const SITE_URL = "https://promptsos.vercel.app";

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

export default defineEventHandler(async () => {
  // Try to read the pre-generated sitemap first (includes dynamic prompts)
  try {
    const { readFile } = await import("node:fs/promises");
    const content = await readFile("public/sitemap.xml", "utf-8");
    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600",
      },
    });
  } catch {
    // Fallback to static-only sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600",
      },
    });
  }
});
