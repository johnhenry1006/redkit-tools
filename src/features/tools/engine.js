import { tools } from './catalog.js';
import { assertUnicode, convert } from './codecs.js';
import { randomTool } from './random.js';
import { hashTool } from './hashes.js';

export class ToolInputError extends Error {
    constructor({ code, message }) { super(message); this.name = 'ToolInputError'; this.code = code; }
}
const fail = (code, message) => { throw new ToolInputError({ code, message }); };
export async function runTool({ id, action = 'run', input = '', options = {}, key = '', crypto = globalThis.crypto }) {
    const tool = tools.find(tool => tool.id === id);
    if (!tool) fail('UNKNOWN_TOOL', 'Unknown tool.');
    if (typeof input !== 'string' || input.length > tool.limits.input) fail('INPUT_LIMIT', 'Input must not exceed 10,000 characters.');
    if (!tool.actions.some(entry => entry.id === action)) fail('INVALID_ACTION', 'Invalid action.');
    if (tool.group === 'hmac' && (typeof key !== 'string' || key.length < 1 || key.length > tool.limits.key)) fail('KEY_LIMIT', 'HMAC key must contain 1–1,000 characters.');
    const normalized = {};
    for (const field of tool.fields.filter(field => field.type === 'number')) {
        const raw = options[field.name] ?? field.value;
        const value = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() ? Number(raw) : NaN;
        if (!Number.isInteger(value) || value < field.min || value > field.max) fail('OPTION_LIMIT', `Enter an integer between ${field.min} and ${field.max}.`);
        normalized[field.name] = value;
    }
    const cryptographic = tool.group === 'hash' || tool.group === 'hmac';
    if ((tool.group === 'random' && typeof crypto?.getRandomValues !== 'function') || (cryptographic && (typeof crypto?.subtle?.digest !== 'function' && tool.group === 'hash' || tool.group === 'hmac' && (typeof crypto?.subtle?.importKey !== 'function' || typeof crypto?.subtle?.sign !== 'function')))) fail('CRYPTO_UNAVAILABLE', 'Web Crypto is unavailable. Use a supported browser over HTTPS.');
    try {
        assertUnicode(input);
        if (tool.group === 'hmac') assertUnicode(key);
        const result = tool.group === 'random' ? randomTool(id, normalized, crypto) : cryptographic ? await hashTool(id, input, key, crypto) : convert(id, action, input);
        if (result.length > tool.limits.output) fail('OUTPUT_LIMIT', 'Result is too long. Reduce the input.');
        return result;
    } catch (error) {
        if (error instanceof ToolInputError) throw error;
        fail(cryptographic ? 'CRYPTO_FAILED' : 'INVALID_INPUT', cryptographic ? 'Web Crypto could not process this request.' : 'Invalid input. Check the format and UTF-8 encoding.');
    }
}
