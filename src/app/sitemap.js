import { site } from '../lib/site.js';
export const dynamic = 'force-static';
export default function sitemap() {
    return [{ url: site.url }];
}
