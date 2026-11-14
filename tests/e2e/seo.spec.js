import { test, expect } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test('static HTML exposes consistent SEO, Open Graph and Twitter metadata without JavaScript', async ({ page, request }) => {
    const origin = 'https://redkit-tools.thinh-it.com';
    const title = 'RedKit · Free Online Developer Tools';
    await page.goto('/');
    await expect(page).toHaveTitle(title);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('[data-tool]')).toHaveCount(22);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${origin}/`);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toContain('Base64');
    const tags = {
        'og:title': title, 'og:description': description, 'og:type': 'website',
        'og:url': `${origin}/`, 'og:site_name': 'RedKit', 'og:locale': 'en_US',
        'og:image': `${origin}/redkit-og.png`, 'og:image:width': '1200', 'og:image:height': '630',
        'og:image:alt': 'RedKit — free browser tools to generate, convert and format data.',
    };
    for (const [property, content] of Object.entries(tags)) {
        const tag = page.locator(`meta[property="${property}"]`);
        await expect(tag).toHaveCount(1);
        await expect(tag).toHaveAttribute('content', content);
    }
    for (const [name, content] of Object.entries({ 'twitter:card': 'summary_large_image', 'twitter:title': title, 'twitter:description': description, 'twitter:image': `${origin}/redkit-og.png`, 'twitter:image:alt': tags['og:image:alt'] })) {
        await expect(page.locator(`meta[name="${name}"]`)).toHaveAttribute('content', content);
    }
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
    const image = await request.get('/redkit-og.png');
    expect(image.ok()).toBe(true);
    expect(image.headers()['content-type']).toBe('image/png');
    const data = await image.body();
    expect(data.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(data.readUInt32BE(16)).toBe(1200);
    expect(data.readUInt32BE(20)).toBe(630);
    expect(data.length).toBeLessThan(1024 * 1024);
    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toContain('Allow: /');
    expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap.xml`);
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBe(true);
    expect(sitemap.headers()['content-type']).toContain('application/xml');
    expect(await sitemap.text()).toContain(`<loc>${origin}/</loc>`);
    expect((await sitemap.text()).match(/<loc>/g)).toHaveLength(1);
});
