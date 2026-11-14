// Rebuild the local sharing image after updating the brand. No external assets.
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { site } from '../src/lib/site.js';
const root = new URL('../', import.meta.url);
const logo = (await readFile(new URL('public/redkit-logo.svg', root))).toString('base64');
const host = new URL(site.url).host;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#f8f8f8"/>
<rect width="1200" height="10" fill="#cf242b"/>
<rect x="960" y="10" width="240" height="620" fill="#f1eded"/>
<image href="data:image/svg+xml;base64,${logo}" x="64" y="62" width="76" height="76"/>
<g font-family="Arial, Helvetica, sans-serif">
<text x="158" y="116" font-size="52" font-weight="700" fill="#18181b">${site.name}<tspan fill="#cf242b">.</tspan></text>
<text x="64" y="204" font-size="17" letter-spacing="3" font-weight="700" fill="#cf242b">FREE ONLINE DEVELOPER TOOLS</text>
<text x="60" y="298" font-size="76" font-weight="700" letter-spacing="-3" fill="#18181b">Your everyday</text>
<text x="60" y="382" font-size="76" font-weight="700" letter-spacing="-3" fill="#cf242b">toolkit.</text>
<text x="64" y="446" font-size="25" fill="#525257">Generate, convert and format. Right in your browser.</text>
<path d="M64 502h1072" stroke="#d9d9dd"/>
<text x="64" y="554" font-size="22" font-weight="700" fill="#18181b">Base64 · JSON · UUID · Hashing</text>
<text x="1136" y="554" text-anchor="end" font-size="22" fill="#cf242b">${host}</text>
</g></svg>`;
await sharp(Buffer.from(svg)).png().toFile(new URL('public/redkit-og.png', root).pathname);
