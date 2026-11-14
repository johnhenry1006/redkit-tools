import { changeCase } from './text-case.js';

export function assertUnicode(value) {
    if (!value.isWellFormed()) throw new Error('Invalid Unicode text.');
    return value;
}
export const utf8 = value => new TextEncoder().encode(assertUnicode(value));
export const fromUtf8 = bytes => new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
export const hex = bytes => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
export const base64 = bytes => btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''));

function decodeBase64(input, url) {
    if (url ? !/^[A-Za-z0-9_-]*$/.test(input) : !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(input)) throw new Error();
    const normalized = url ? input.replace(/-/g, '+').replace(/_/g, '/') : input;
    const bytes = Uint8Array.from(atob(normalized), char => char.charCodeAt(0));
    const canonical = url ? base64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : base64(bytes);
    if (canonical !== input) throw new Error();
    return fromUtf8(bytes);
}
const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
function decodeHtml(input) {
    return input.replace(/&([^;\s&]*);/g, (_, entity) => {
        if (Object.hasOwn(named, entity)) return named[entity];
        if (!/^#(?:[0-9]+|x[0-9a-f]+)$/i.test(entity)) throw new Error();
        const point = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
        if (!Number.isSafeInteger(point) || point < 0 || point > 0x10ffff || (point >= 0xd800 && point <= 0xdfff)) throw new Error();
        return String.fromCodePoint(point);
    });
}
export function convert(id, action, input) {
    const encode = action === 'encode';
    switch (id) {
        case 'base64': return encode ? base64(utf8(input)) : decodeBase64(input, false);
        case 'base64url': return encode ? base64(utf8(input)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : decodeBase64(input, true);
        case 'url': return encode ? encodeURIComponent(input) : assertUnicode(decodeURIComponent(input));
        case 'html': return encode ? input.replace(/[&<>"']/g, char => entities[char]) : assertUnicode(decodeHtml(input));
        case 'hex': {
            if (encode) return hex(utf8(input));
            if (!/^(?:[\da-f]{2})*$/i.test(input)) throw new Error();
            return fromUtf8(Uint8Array.from(input.match(/../g) || [], byte => parseInt(byte, 16)));
        }
        case 'binary': {
            if (encode) return Array.from(utf8(input), byte => byte.toString(2).padStart(8, '0')).join(' ');
            if (input !== '' && !/^[01]{8}(?: [01]{8})*$/.test(input)) throw new Error();
            return fromUtf8(Uint8Array.from(input === '' ? [] : input.split(' '), byte => parseInt(byte, 2)));
        }
        case 'unicode': {
            if (encode) return input.split('').map(char => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0')).join('');
            if (!/^(?:\\u[\da-f]{4})*$/i.test(input)) throw new Error();
            return assertUnicode(input.replace(/\\u([\da-f]{4})/gi, (_, code) => String.fromCharCode(parseInt(code, 16))));
        }
        case 'json-string': {
            if (encode) return JSON.stringify(input);
            const value = JSON.parse(input);
            if (typeof value !== 'string') throw new Error();
            return assertUnicode(value);
        }
        case 'text-case': return changeCase(action, input);
        case 'json': return JSON.stringify(JSON.parse(input), null, action === 'format' ? 2 : 0);
        case 'rot13': return input.replace(/[a-z]/gi, char => String.fromCharCode(char.charCodeAt(0) + (char.toLowerCase() <= 'm' ? 13 : -13)));
        case 'query': {
            let pairs;
            if (action === 'read') {
                const value = input.startsWith('?') ? input.slice(1) : input;
                // URLSearchParams alone replaces malformed UTF-8; validate each encoded component first.
                for (const part of value.split(/[&=]/)) decodeURIComponent(part.replace(/\+/g, ' '));
                pairs = [...new URLSearchParams(value)];
            } else {
                pairs = JSON.parse(input);
                if (!Array.isArray(pairs) || pairs.some(pair => !Array.isArray(pair) || pair.length !== 2 || pair.some(value => typeof value !== 'string' || !value.isWellFormed()))) throw new Error();
            }
            if (pairs.length > 1000) throw new Error();
            return action === 'read' ? JSON.stringify(pairs, null, 2) : new URLSearchParams(pairs).toString();
        }
        default: throw new Error();
    }
}
