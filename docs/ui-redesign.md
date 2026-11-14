# Landing page — RedKit

## Current design

User-directed refinement: English-only UI; one compact page, no tabs or extra pages. Keep the red/white/black palette, local SVG logo and sticky header. Every button remains 40px tall.

- Header contains only the brand logo. Remove tool-count navigation, privacy navigation and the browser-local indicator.
- Remove the black statistics panel and the entire workspace heading/notice block.
- Replace the promotional hero with “Your everyday toolkit.” and one short description. Search and category filters lead directly into the existing 22 tools.
- Replace the footer back-to-top text with an inline arrow SVG, retaining an English accessible label and title. Its anchor stays on this page.
- Translate catalog titles, descriptions, categories, field labels, actions, status/output/copy messages, validation errors, metadata, skip link and document language into English.
- Preserve tool IDs, engine behavior, validation limits, secure randomness, asynchronous invalidation, clipboard fallback and local-only data handling. Keep security explanations in relevant card descriptions.

## Implementation and evidence

Next.js/React, JavaScript/JSX and plain CSS, static export. No new dependencies, external fonts or network services.

`npm run quality`: PASS — lint, 58 unit/component tests, static build and 6 Playwright tests. Browser coverage includes five viewport widths (390/768/1024/1440/1920), axe, real crypto/conversion behavior and privacy checks. The compact-landing test checks English document language, removed regions, sticky header, logo loading, 40px buttons, icon navigation and no new tabs. UI text assertions were translated; Unicode test inputs and behavior assertions are retained.

Current browser screenshots in `test-results/` were inspected at desktop and mobile widths. Artifacts are temporary test outputs.

## Card actions refinement

Each card now has Reset, which clears text, HMAC keys, output, errors and copy status, restores numeric defaults, and invalidates pending crypto/clipboard completions. Copy shares the action row; the visible Result label and separate card footer are removed. Output retains its accessible name. Browser tests verify a single action row at 320/390/768/1440/1920 and independent reset behavior; component tests cover delayed crypto and clipboard completions after reset.

## Current card spacing

The latest user request replaces the earlier equal action-row positions across cards with different field counts: actions now sit 16px below their own field section. Numeric fields no longer reserve an extra 88px minimum section height. Validation/copy errors remain within the field section.

Result panels start at 96px and absorb extra row height, instead of stretching the input section and leaving blank space above buttons. Neighboring result bottoms stay aligned; long results scroll. All action buttons remain 40px tall.

The updated browser regression checks exact 16px spacing, minimum 96px outputs, aligned result bottoms, visible errors and long-output scrolling at 768/1440/1920. It failed against the previous layout before implementation. Final quality: lint, 58 unit/component tests, static build and 6 browser tests PASS. Desktop screenshots confirm compact input/action spacing and taller hash result panels; responsive/no-overflow and mobile action-row tests also pass.

## Floating back-to-top icon

The arrow link is fixed to the viewport bottom-right (40px square, red outline, safe-area-aware insets). It is rendered only when scrollY > 0, using a passive scroll subscription with cleanup and an SSR-safe initial snapshot. Activating it returns focus to main content and scrolls to the document top, where it disappears. No extra tab or route is opened.

Browser checks verify initial hidden state, a stable viewport position at different scroll offsets, visibility while scrolled, and hidden state after returning to scrollY=0 at 390/768/1440 widths. Final quality: lint, 58 unit/component tests, static build and 6 browser tests PASS.

## Description-to-field spacing

Remove the fixed 41px description minimum height and set the description bottom margin to 12px (top 10px). Short descriptions no longer reserve an empty second line before the first input label. Applied consistently across tool cards. Final quality remains PASS: lint, 58 tests, static build, 6 browser tests.

## RedKit brand and favicon

User selected RedKit with the proposed domain redkit.tools. Header, footer, accessible brand name, browser title, application name and README use RedKit. The existing red code-symbol SVG remains the logo and is reused as icon.svg; favicon.ico includes 16/32/48px versions, with apple-icon.png at 180px. Icons follow local Next.js metadata file conventions and work with static export. Domain availability, registration, DNS and hosting are not configured or verified by this change.

Brand/icon verification: final `npm run quality` PASS (lint, 58 tests, static build, 6 browser tests). Browser test confirms RedKit title/brand and successful image responses for all favicon/Apple icon links. The local HTTPS harness now serves PNG with image/png; the initial missing PNG MIME mapping was fixed without relaxing icon assertions.

## SEO and sharing metadata

Production hostname was subsequently supplied as https://redkit-tools.thinh-it.com/ (supersedes the earlier redkit.tools proposal). Central origin config, canonical, Open Graph, Twitter Card, share image, robots and sitemap now use that origin. See docs/seo-audit.md for findings, verification and the live-site access limitation. The 1200×630 branded PNG is generated with scripts/generate-og.mjs. Final quality: lint, 58 tests, static build and 7 browser tests PASS. No production deployment was performed.
