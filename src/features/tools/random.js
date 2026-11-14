import { base64, hex } from './codecs.js';
const characterGroups = ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz', '0123456789', '!@#$%^&*'];
function index(max, crypto) {
    const cutoff = 256 - 256 % max;
    const byte = new Uint8Array(1);
    do { crypto.getRandomValues(byte); } while (byte[0] >= cutoff);
    return byte[0] % max;
}
export function randomTool(id, options, crypto) {
    if (id === 'hex-token' || id === 'base64-token') {
        const bytes = crypto.getRandomValues(new Uint8Array(options.bytes));
        return id === 'hex-token' ? hex(bytes) : base64(bytes);
    }
    if (id === 'uuid') return Array.from({ length: options.count }, () => {
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        bytes[6] = bytes[6] & 15 | 64;
        bytes[8] = bytes[8] & 63 | 128;
        const value = hex(bytes);
        return [value.slice(0, 8), value.slice(8, 12), value.slice(12, 16), value.slice(16, 20), value.slice(20)].join('-');
    }).join('\n');
    if (id === 'digits') return Array.from({ length: options.length }, () => String(index(10, crypto))).join('');
    const alphabet = characterGroups.join('');
    const chars = characterGroups.map(group => group[index(group.length, crypto)]);
    while (chars.length < options.length) chars.push(alphabet[index(alphabet.length, crypto)]);
    for (let i = chars.length - 1; i > 0; i--) {
        const j = index(i + 1, crypto);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
}
