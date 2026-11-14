# RedKit SEO and Open Graph audit

Production origin supplied by the user: `https://redkit-tools.thinh-it.com/`.

## Findings and changes

| Item | Before | Current source/static export |
| --- | --- | --- |
| Title, favicon, document language | Present | RedKit title, English, local favicon variants retained |
| Description | Generic | Names Base64, JSON, UUIDs, passwords and hashes; describes local processing |
| Canonical | Missing | One absolute canonical for the production homepage |
| Open Graph | Missing | title, description, type website, URL, site name, locale, PNG URL/type/dimensions/alt |
| Twitter Card | Missing | summary_large_image with matching title/description/image/alt |
| Share image | Missing | Branded PNG, 1200×630, actual production hostname, visually inspected |
| robots.txt | Missing | Crawl allowed, production sitemap URL |
| Sitemap | Missing | One canonical homepage; no invented tool routes or fabricated modification dates |
| Static HTML | Contains tool catalog | One H1 and all 22 cards remain available without JavaScript |

`src/lib/site.js` is the source for origin, title, description and share image. Changing domains requires updating that file, running `node scripts/generate-og.mjs`, rebuilding and deploying the new `out/`.

No extra product pages, analytics, uploads, tracking, dependencies or fake ratings were added. Tool behavior and UI remain unchanged.

## Verification

- `npm run quality`: PASS — lint, 58 unit/component tests, static export and 7 Playwright tests.
- New SEO browser test disables JavaScript and checks emitted metadata, canonical uniqueness, OG image PNG dimensions/size, robots and sitemap. It failed on missing canonical before implementation.
- Static image, robots and sitemap are served successfully through the local HTTPS harness. The harness gained XML MIME support; no assertions were relaxed.
- Independent review: PASS for source, static artifacts and the updated OG image.

## Live-site limitation

The web tool could not access the supplied URL. A direct read-only HTTPS probe for the homepage, robots.txt, sitemap.xml and share image failed to resolve the hostname in this execution environment. No HTTP status or live metadata was obtained. This does not establish a public DNS failure.

The changes are local and have not been deployed. Public HTTP/TLS/redirects, server headers, social crawler access, social-preview caches, Search Console/indexing and field performance remain unverified. Deploy the rebuilt output, then verify the production homepage and share image are publicly accessible and re-scrape the link in the relevant social debugger. No indexing or ranking guarantee is implied.

## References

- [Open Graph protocol](https://ogp.me/): required base properties and image metadata.
- [Google Search: supported meta tags](https://developers.google.com/search/docs/crawling-indexing/special-tags): description and robots behavior.
- [Google Search: build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap): canonical URLs and sitemap scope.
- Installed Next.js documentation: `generate-metadata.md` and metadata conventions for Open Graph, robots and sitemap under `node_modules/next/dist/docs/`.
