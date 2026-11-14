import { hex, utf8 } from './codecs.js';
const algorithms = { sha256: 'SHA-256', sha384: 'SHA-384', sha512: 'SHA-512', sha1: 'SHA-1', hmac256: 'SHA-256', hmac512: 'SHA-512' };
export async function hashTool(id, input, key, crypto) {
    let result;
    if (id.startsWith('hmac')) {
        const imported = await crypto.subtle.importKey('raw', utf8(key), { name: 'HMAC', hash: algorithms[id] }, false, ['sign']);
        result = await crypto.subtle.sign('HMAC', imported, utf8(input));
    } else result = await crypto.subtle.digest(algorithms[id], utf8(input));
    return hex(new Uint8Array(result));
}
