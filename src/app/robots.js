import { site } from '../lib/site.js';
export const dynamic = 'force-static';
export default function robots() {
    return { rules: { userAgent: '*', allow: '/' }, sitemap: new URL('/sitemap.xml', site.url).href };
}
