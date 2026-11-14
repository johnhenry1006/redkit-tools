// Local test harness only; production serves out/ directly on any HTTPS static host.
import { createServer } from 'node:https';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, sep, join, extname } from 'node:path';
const temporary = await mkdtemp(join(tmpdir(), 'browser-tools-https-'));
const key = join(temporary, 'key.pem');
const cert = join(temporary, 'cert.pem');
execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', cert, '-subj', '/CN=localhost', '-days', '1'], { stdio: 'ignore' });
const root = resolve('out');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const server = createServer({ key: await readFile(key), cert: await readFile(cert) }, async (request, response) => {
    try {
        const pathname = decodeURIComponent(new URL(request.url, 'https://localhost').pathname);
        const file = resolve(root, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
        if (!file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
        const data = await readFile(file);
        response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        response.end(data);
    } catch { response.writeHead(404).end('Not found'); }
});
server.listen(4175, '127.0.0.1');
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(async () => { await rm(temporary, { recursive: true, force: true }); process.exit(0); }));
