const ROBOTS = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /admin/
Disallow: /auth/
Disallow: /notifications/

Sitemap: https://promptsos.vercel.app/sitemap.xml
`;

export default defineEventHandler(async () => {
  return new Response(ROBOTS, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
