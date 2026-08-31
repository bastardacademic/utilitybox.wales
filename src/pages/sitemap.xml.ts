import type { APIRoute } from 'astro';

const SITE = 'https://utilitybox.wales';

const PAGES: { path: string; priority: string; changefreq: string }[] = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/privacy/', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms/', priority: '0.3', changefreq: 'yearly' },
  { path: '/tools/scientific/', priority: '0.8', changefreq: 'monthly' },
  { path: '/tools/currency/', priority: '0.8', changefreq: 'monthly' },
  { path: '/tools/measurements/', priority: '0.8', changefreq: 'monthly' },
  { path: '/tools/uk-salary/', priority: '0.8', changefreq: 'monthly' },
  { path: '/tools/network/', priority: '0.8', changefreq: 'monthly' },
  { path: '/tools/unscrambler/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/word-builder/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/random-string/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/lorem/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/json-formatter/', priority: '0.8', changefreq: 'monthly' },
  { path: '/tools/regex-tester/', priority: '0.8', changefreq: 'monthly' },
  { path: '/tools/diff-viewer/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/base64/', priority: '0.8', changefreq: 'monthly' },
  { path: '/tools/jwt-decoder/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/cron-parser/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/percentage/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/vat/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/tip/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/loan/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/http-status/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/port-lookup/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/mac-address/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/word-counter/', priority: '0.8', changefreq: 'monthly' },
  { path: '/tools/case-converter/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/palindrome/', priority: '0.6', changefreq: 'monthly' },
  { path: '/tools/anagram/', priority: '0.6', changefreq: 'monthly' },
  { path: '/tools/color-converter/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/slug/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/placeholder-image/', priority: '0.6', changefreq: 'monthly' },
  { path: '/tools/hash-generator/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/url-encoder/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/timestamp/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/html-entities/', priority: '0.6', changefreq: 'monthly' }
];

export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().split('T')[0];

  const urlEntries = PAGES.map(
    (page) => `  <url>
    <loc>${SITE}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  ).join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
