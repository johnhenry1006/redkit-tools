const text = { name: 'input', label: 'Input text', type: 'textarea' };
const number = (name, label, value, min, max) => ({ name, label, type: 'number', value, min, max });
const actions = (...entries) => entries.map(([id, label]) => ({ id, label }));
const representation = actions(['encode', 'Encode'], ['decode', 'Decode']);
const generate = actions(['run', 'Generate']);
const caseActions = [
    ['lower', 'lower case', 'lc'], ['upper', 'UPPER CASE', 'UC'],
    ['capitalized', 'Capitalized Case', 'CC'], ['alternating', 'aLtErNaTiNg cAsE', 'aC'],
    ['title', 'Title Case', 'TC'], ['inverse', 'InVeRsE CaSe', 'iC'],
].map(([id, label, badge]) => ({ id, label, badge }));
const definitions = [
    ['password', 'Random password', 'random', [number('length', 'Length · 8–128 characters', 20, 8, 128)], generate, 'Includes uppercase, lowercase, numbers and !@#$%^&*.'],
    ['hex-token', 'Hex token', 'random', [number('bytes', 'Bytes · 1–256', 32, 1, 256)], generate, 'Random bytes as hex, with two characters per byte.'],
    ['base64-token', 'Base64 token', 'random', [number('bytes', 'Bytes · 1–256', 32, 1, 256)], generate, 'Random bytes encoded as Base64.'],
    ['uuid', 'UUID v4', 'random', [number('count', 'Count · 1–10', 1, 1, 10)], generate, 'Version 4 identifiers using secure browser randomness.'],
    ['digits', 'Random digits', 'random', [number('length', 'Digits · 1–256', 16, 1, 256)], generate, 'Random digits with leading zeros preserved.'],
    ['base64', 'Base64 UTF-8', 'representation', [text], representation, 'Encode text as Base64; this does not protect secrets.'],
    ['base64url', 'Base64URL UTF-8', 'representation', [text], representation, 'URL-safe Base64 without padding.'],
    ['url', 'URL component', 'representation', [text], representation, 'Encode or decode a URL component.'],
    ['html', 'HTML entities', 'representation', [text], representation, 'Escape HTML characters; output is displayed as plain text.'],
    ['hex', 'UTF-8 ↔ Hex', 'representation', [text], representation, 'Convert between UTF-8 text and hexadecimal bytes.'],
    ['binary', 'UTF-8 ↔ Binary', 'representation', [text], representation, 'Eight bits per UTF-8 byte, separated by spaces.'],
    ['unicode', 'Unicode escapes', 'representation', [text], representation, 'Convert text to \\uXXXX escapes and back.'],
    ['json-string', 'JSON string', 'representation', [text], representation, 'Escape or parse a JSON string, including its quotes.'],
    ['json', 'JSON format / minify', 'format', [text], actions(['format', 'Format'], ['minify', 'Minify']), 'Format or minify valid JSON, including scalar values.'],
    ['rot13', 'ROT13', 'representation', [text], actions(['run', 'Convert']), 'Rotate Latin letters; do not use for security.'],
    ['sha256', 'SHA-256', 'hash', [text], actions(['run', 'Hash']), 'SHA-256 hash of UTF-8 text; this is not encryption.'],
    ['sha384', 'SHA-384', 'hash', [text], actions(['run', 'Hash']), 'SHA-384 hash of UTF-8 text.'],
    ['sha512', 'SHA-512', 'hash', [text], actions(['run', 'Hash']), 'SHA-512 hash of UTF-8 text.'],
    ['sha1', 'SHA-1 · legacy', 'hash', [text], actions(['run', 'Hash']), 'Legacy: for existing systems only, not for new security use.'],
    ['query', 'URL query parser / builder', 'format', [text], actions(['read', 'Parse query'], ['create', 'Build query']), 'Parse or build [key, value] pairs, preserving duplicate keys. Up to 1,000 pairs.'],
    ['hmac512', 'HMAC-SHA512', 'hmac', [text, { name: 'key', label: 'HMAC key (UTF-8)', type: 'password' }], actions(['run', 'Compute HMAC']), 'Keyed SHA-512 authentication, not encryption. Key: 1–1,000 characters.'],
    ['hmac256', 'HMAC-SHA256', 'hmac', [text, { name: 'key', label: 'HMAC key (UTF-8)', type: 'password' }], actions(['run', 'Compute HMAC']), 'Keyed SHA-256 authentication, not encryption. Key: 1–1,000 characters.'],
    ['text-case', 'Text case', 'format', [text], caseActions, 'Change letter case, including Vietnamese accents. Capitalized: every word. Title: English small words stay lowercase except first/last. Alternating: letters only, starting lowercase.'],
];
export const groups = [
    { id: 'random', label: 'Random' }, { id: 'representation', label: 'Encode' },
    { id: 'hash', label: 'Hash' }, { id: 'hmac', label: 'HMAC' }, { id: 'format', label: 'Format' },
];
export const tools = definitions.map(([id, title, group, fields, actions, description]) => ({
    id, title, group, fields, actions, description, limits: { input: 10000, key: 1000, output: 360000 },
}));
