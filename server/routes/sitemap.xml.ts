const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://promptsos.vercel.app/</loc>
    
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://promptsos.vercel.app/explore</loc>
    
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://promptsos.vercel.app/categories</loc>
    
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://promptsos.vercel.app/community</loc>
    
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://promptsos.vercel.app/battle</loc>
    
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://promptsos.vercel.app/battle/leaderboard</loc>
    
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://promptsos.vercel.app/lab</loc>
    
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://promptsos.vercel.app/optimizer</loc>
    
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://promptsos.vercel.app/auth/login</loc>
    
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://promptsos.vercel.app/auth/register</loc>
    
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://promptsos.vercel.app/prompt/6621d8ef-a13e-418d-b17b-4048437508e1</loc>
        <lastmod>2026-06-18</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://promptsos.vercel.app/prompt/c2f21e5c-6f84-41ac-81fe-4af5c32af914</loc>
        <lastmod>2026-06-18</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://promptsos.vercel.app/prompt/7eb8b65e-dcf9-456a-93b0-b5292645243f</loc>
        <lastmod>2026-06-18</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

export default defineEventHandler(async () => {
  return new Response(SITEMAP, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
});
