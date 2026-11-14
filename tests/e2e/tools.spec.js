import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function openTools(page) {
    await page.goto('/');
    await expect(page.locator('[data-tool]')).toHaveCount(22);
    await page.waitForLoadState('networkidle');
}
const card = (page, id) => page.locator(`[data-tool="${id}"]`);

test('compact English landing keeps sticky logo, icon navigation and 40px buttons', async ({ page, context }) => {
    await openTools(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle('RedKit · Free Online Developer Tools');
    await expect(page.locator('.site-brand')).toHaveText('RedKit.');
    await expect(page.locator('.site-brand')).toHaveAccessibleName('RedKit — back to top');
    const icons = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').evaluateAll(elements => elements.map(element => element.href));
    expect(icons.some(url => new URL(url).pathname === '/favicon.ico')).toBe(true);
    expect(icons.some(url => new URL(url).pathname === '/icon.svg')).toBe(true);
    expect(icons.some(url => new URL(url).pathname === '/apple-icon.png')).toBe(true);
    for (const url of icons) {
        const response = await page.request.get(url);
        expect(response.ok()).toBe(true);
        expect(response.headers()['content-type']).toMatch(/^image\//);
        expect((await response.body()).length).toBeGreaterThan(0);
    }
    await expect(page.getByRole('link', { name: 'Back to top', exact: true })).toBeHidden();
    const logo = page.locator('.site-brand img');
    await expect(logo).toBeVisible();
    expect(await logo.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    await expect(page.locator('.site-header nav, .header-local, .hero-summary, .tools-tools-heading, .tools-tools-notice')).toHaveCount(0);
    await expect(page.locator('a[target="_blank"]')).toHaveCount(0);
    for (const width of [390, 768, 1440]) {
        await page.setViewportSize({ width, height: 1056 });
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your everyday toolkit.');
        await expect(page.getByLabel('Search tools')).toBeInViewport();
        await page.screenshot({ path: test.info().outputPath(`landing-${width}.png`), fullPage: false });
        await page.evaluate(() => window.scrollTo(0, 600));
        expect(await page.locator('.site-header').evaluate(header => header.getBoundingClientRect().top)).toBe(0);
        const heights = await page.locator('button').evaluateAll(buttons => buttons.map(button => button.getBoundingClientRect().height));
        expect(heights.every(height => height === 40)).toBe(true);
        const back = page.getByRole('link', { name: 'Back to top', exact: true });
        await expect(back).toBeVisible();
        expect(await back.evaluate(element => getComputedStyle(element).position)).toBe('fixed');
        const before = await back.boundingBox();
        await page.evaluate(() => window.scrollTo(0, 1000));
        const after = await back.boundingBox();
        expect(after.x).toBe(before.x);
        expect(after.y).toBe(before.y);
        await expect(back.locator('svg')).toHaveCount(1);
        await expect(back).toHaveText('');
        await back.click();
        await expect(back).toBeHidden();
        await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    expect(context.pages()).toHaveLength(1);
});

test('all 22 independent cards follow five approved viewports without overflow', async ({ page }) => {
    await openTools(page);
    for (const [width, columns] of [[390,1],[768,2],[1024,2],[1440,3],[1920,4]]) {
        await page.setViewportSize({ width, height: 1056 });
        expect(await page.locator('.tools-tools-grid').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(columns);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        const sizes = await page.locator('[data-tool]').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().width));
        expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThan(1);
        await page.screenshot({ path: test.info().outputPath(`tools-${width}.png`), fullPage: false });
    }
    await page.setViewportSize({ width: 1440, height: 1056 });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.getByLabel('Search tools').fill('rándom dígits');
    await expect(page.locator('[data-tool]')).toHaveCount(1);
    await expect(card(page,'digits')).toBeVisible();
    await page.getByLabel('Search tools').fill('nothing-matches');
    await expect(page.getByRole('heading',{name:'No tools found'})).toBeVisible();
    await page.getByLabel('Search tools').fill('');
    await page.getByLabel('Category').selectOption('hmac');
    await expect(page.locator('[data-tool]')).toHaveCount(2);
});

test('each card keeps Copy and Reset on its action row and resets independently', async ({ page }) => {
    await openTools(page);
    for (const width of [320, 390, 768, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1056 });
        const rows = await page.locator('.tools-tool-actions').evaluateAll(elements => elements.map(row => [...row.querySelectorAll('button')].map(button => button.getBoundingClientRect().top)));
        expect(rows.every(tops => Math.max(...tops) - Math.min(...tops) < 1)).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await expect(page.getByText('Result', { exact: true })).toHaveCount(0);
    const digits = card(page, 'digits');
    const password = card(page, 'password');
    await password.getByRole('button', { name: 'Generate' }).click();
    const retained = await password.locator('pre').textContent();
    await digits.getByLabel('Digits · 1–256').fill('8');
    await digits.getByRole('button', { name: 'Generate' }).click();
    await expect(digits.locator('pre')).toHaveText(/^\d{8}$/);
    await digits.getByRole('button', { name: 'Reset' }).click();
    await expect(digits.getByLabel('Digits · 1–256')).toHaveValue('16');
    await expect(digits.locator('pre')).toHaveText('No result yet');
    await expect(digits.getByRole('button', { name: 'Copy' })).toBeDisabled();
    await expect(password.locator('pre')).toHaveText(retained);
    await page.setViewportSize({ width: 390, height: 1056 });
    await card(page, 'base64').scrollIntoViewIfNeeded();
    await page.screenshot({ path: test.info().outputPath('actions-mobile.png') });
});

test('compact field spacing and taller results remain stable with errors and long output', async ({ page }) => {
    await openTools(page);
    await card(page, 'json').getByRole('button', { name: 'Format', exact: true }).click();
    await expect(card(page, 'json').getByRole('alert')).toBeVisible();
    await card(page, 'base64').getByLabel('Input text').fill('x'.repeat(10000));
    await card(page, 'base64').getByRole('button', { name: 'Encode' }).click();
    for (const width of [768, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1056 });
        const rows = await page.locator('[data-tool]').evaluateAll(cards => {
            const rows = new Map();
            for (const card of cards) {
                const top = Math.round(card.getBoundingClientRect().top);
                const row = rows.get(top) || [];
                const fields = card.querySelector('.tools-tool-fields').getBoundingClientRect();
                const actions = card.querySelector('.tools-tool-actions').getBoundingClientRect();
                const output = card.querySelector('pre').getBoundingClientRect();
                row.push({ gap: actions.top - fields.bottom, height: output.height, bottom: output.bottom });
                rows.set(top, row);
            }
            return [...rows.values()];
        });
        for (const row of rows) {
            for (const card of row) {
                expect(card.gap).toBe(16);
                expect(card.height).toBeGreaterThanOrEqual(96);
            }
            const bottoms = row.map(card => card.bottom);
            expect(Math.max(...bottoms) - Math.min(...bottoms)).toBeLessThan(1);
        }
    }
    await card(page, 'sha384').scrollIntoViewIfNeeded();
    await page.screenshot({ path: test.info().outputPath('compact-input-taller-result.png') });
    expect(await card(page, 'base64').locator('pre').evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
});

test('actual HTTPS generators, hashes and representations stay local and inert', async ({ page }) => {
    await openTools(page);
    const requests=[];
    page.on('request', request=>requests.push(request.url()));
    await page.evaluate(() => {
        window.toolSideEffects=0;
        for (const name of ['fetch']) {
            const original=window[name];
            window[name]=function(...args) { window.toolSideEffects++; return original.apply(this,args); };
        }
        for (const [object,names] of [[XMLHttpRequest.prototype,['open']],[Storage.prototype,['getItem','setItem','removeItem','clear']],[navigator,['sendBeacon']],[IDBFactory.prototype,['open']]]) for (const name of names) {
            const original=object[name];
            object[name]=function(...args) { window.toolSideEffects++; return original.apply(this,args); };
        }
        window.toolXss=false;
    });
    const password=card(page,'password');
    await password.getByRole('button',{name:'Generate'}).click();
    await expect(password.locator('pre')).toHaveText(/^[A-Za-z0-9!@#$%^&*]{20}$/);
    for (const [id,pattern] of [['hex-token',/^[0-9a-f]{64}$/],['base64-token',/^[A-Za-z0-9+/]{43}=$/],['uuid',/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/],['digits',/^\d{16}$/]]) {
        await card(page,id).getByRole('button',{name:'Generate'}).click();
        await expect(card(page,id).locator('pre')).toHaveText(pattern);
    }
    await card(page,'sha256').getByLabel('Input text').fill('abc');
    await card(page,'sha256').getByRole('button',{name:'Hash'}).click();
    await expect(card(page,'sha256').locator('pre')).toHaveText('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    const hmac=card(page,'hmac256');
    await hmac.getByLabel('Input text').fill('The quick brown fox jumps over the lazy dog');
    await hmac.getByLabel('HMAC key (UTF-8)').fill('key');
    await hmac.getByRole('button',{name:'Compute HMAC'}).click();
    await expect(hmac.locator('pre')).toHaveText('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8');
    const html=card(page,'html');
    await html.getByLabel('Input text').fill('&lt;img src=x onerror="window.toolXss=true"&gt;');
    await html.getByRole('button',{name:'Decode'}).click();
    await expect(html.locator('pre')).toContainText('<img');
    await expect(html.locator('img')).toHaveCount(0);
    const base64=card(page,'base64');
    await base64.getByLabel('Input text').fill('đ'.repeat(10000));
    await base64.getByRole('button',{name:'Encode'}).click();
    expect(await base64.locator('pre').evaluate(element=>element.scrollHeight>element.clientHeight)).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect(await page.evaluate(()=>window.toolXss)).toBe(false);
    expect(await page.evaluate(()=>window.toolSideEffects)).toBe(0);
    expect(requests).toEqual([]);
});

test('late crypto result, invalid input and denied clipboard retain honest per-card state', async ({ page }) => {
    await openTools(page);
    await page.evaluate(() => {
        const digest=crypto.subtle.digest.bind(crypto.subtle);
        crypto.subtle.digest=(...args)=>new Promise((resolve,reject)=>{
            window.releaseToolDigest=()=>digest(...args).then(resolve,reject);
        });
        Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied');}}});
    });
    const hash=card(page,'sha256');
    await hash.getByLabel('Input text').fill('old');
    await hash.getByRole('button',{name:'Hash'}).click();
    await expect(hash.getByRole('status')).toHaveText('Processing…');
    await hash.getByLabel('Input text').fill('new');
    await page.evaluate(()=>window.releaseToolDigest());
    await expect(hash.locator('pre')).toHaveText('No result yet');
    await expect(hash.getByRole('button',{name:'Copy'})).toBeDisabled();
    const base64=card(page,'base64');
    await base64.getByLabel('Input text').fill('đ 😀');
    await base64.getByRole('button',{name:'Encode'}).click();
    await expect(base64.locator('pre')).toHaveText('xJEg8J+YgA==');
    await base64.getByRole('button',{name:'Copy'}).click();
    await expect(base64.getByRole('alert')).toContainText('copy it manually');
    expect(await page.evaluate(()=>window.getSelection().toString())).toBe('xJEg8J+YgA==');
    await base64.getByLabel('Input text').fill('/w==');
    await base64.getByRole('button',{name:'Decode'}).click();
    await expect(base64.getByRole('alert')).toContainText('Invalid input');
    await expect(base64.getByRole('button',{name:'Copy'})).toBeDisabled();
    await expect(hash.locator('pre')).toHaveText('No result yet');
    await base64.getByLabel('Input text').fill('77u/xJE=');
    await base64.getByRole('button',{name:'Decode'}).click();
    await expect(base64.locator('pre')).toHaveJSProperty('textContent','\ufeffđ');
    await base64.getByLabel('Input text').fill('');
    await base64.getByRole('button',{name:'Encode'}).click();
    await expect(base64.locator('pre')).toHaveText('Empty result');
    await expect(base64.getByRole('button',{name:'Copy'})).toBeDisabled();
});
