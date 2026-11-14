import { describe, it, expect } from 'vitest';
import { createHash, createHmac, webcrypto } from 'node:crypto';
import { tools } from '../../src/features/tools/catalog.js';
import { runTool, ToolInputError } from '../../src/features/tools/engine.js';

const run = args => runTool({ crypto: webcrypto, ...args });
describe('23 local tools', () => {
    it('keeps the approved ordered independent inventory', () => {
        expect(tools.map(t => t.id)).toEqual(['password','hex-token','base64-token','uuid','digits','base64','base64url','url','html','hex','binary','unicode','json-string','json','rot13','sha256','sha384','sha512','sha1','query','hmac512','hmac256','text-case']);
        expect(tools.find(t => t.id === 'sha1').description).toMatch(/legacy.*not for new security/i);
        expect(tools.find(t => t.id === 'rot13').description).toMatch(/do not use for security/i);
    });
    it.each(['sha256','sha384','sha512','sha1'])('%s matches independent Node crypto vectors including UTF-8', async id => {
        for (const input of ['', 'abc', 'Tiếng Việt đ 😀']) expect(await run({id,input})).toBe(createHash(id).update(input).digest('hex'));
    });
    it.each([['hmac256','sha256'],['hmac512','sha512']])('%s matches keyed Node crypto vectors', async (id,hash) => {
        for (const [input,key] of [['The quick brown fox jumps over the lazy dog','key'],['Tiếng Việt 😀','khóa đ']]) expect(await run({id,input,key})).toBe(createHmac(hash,key).update(input).digest('hex'));
    });
    it.each(['base64','base64url','url','html','hex','binary','unicode','json-string'])('%s preserves UTF-8, markup and empty text', async id => {
        for (const input of ['Tiếng Việt đ 😀 <img src=x onerror=alert(1)> & "', '\ufeffđ', '']) {
            const encoded = await run({id,input,action:'encode'});
            expect(await run({id,input:encoded,action:'decode'})).toBe(input);
        }
    });
    it('uses known representation vectors', async () => {
        const vectors = {base64:'xJE=',base64url:'xJE',url:'%C4%91',html:'&lt;&amp;&quot;&#39;&gt;',hex:'c491',binary:'11000100 10010001',unicode:'\\u0111', 'json-string':'"đ"'};
        for (const [id,output] of Object.entries(vectors)) expect(await run({id,input:id==='html'?'<&"\'>':'đ',action:'encode'})).toBe(output);
        expect(await run({id:'html',action:'decode',input:'&#273; &#x1f600; &amp;lt;'})).toBe('đ 😀 &lt;');
    });
    it.each([['base64','%%%%'],['base64','Zh=='],['base64','/w=='],['base64url','ab+c'],['hex','a'],['hex','ff'],['binary','11111111'],['binary','101'],['unicode','\\uZZZZ'],['unicode','\\ud800'],['url','%FF'],['html','&#x110000;'],['html','&unknown;'],['json-string','123'],['json-string','{}'],['json','{'],['query','[["a"]]'],['query','[[1,"a"]]']])('rejects malformed %s input %s with a typed safe error', async (id,input) => {
        await expect(run({id,input,action:id==='json'?'format':id==='query'?'create':'decode'})).rejects.toBeInstanceOf(ToolInputError);
    });
    it('formats JSON scalars/objects and preserves duplicate query keys', async () => {
        expect(await run({id:'json',action:'format',input:'{"a":1}'})).toBe('{\n  "a": 1\n}');
        expect(await run({id:'json',action:'minify',input:' [1, 2] '})).toBe('[1,2]');
        expect(await run({id:'json',action:'format',input:'null'})).toBe('null');
        expect(await run({id:'query',action:'read',input:'?a=1&a=2&q=%C4%91'})).toBe('[\n  [\n    "a",\n    "1"\n  ],\n  [\n    "a",\n    "2"\n  ],\n  [\n    "q",\n    "đ"\n  ]\n]');
        expect(await run({id:'query',action:'create',input:'[["a","1"],["a","2"],["q","đ"]]'})).toBe('a=1&a=2&q=%C4%91');
        expect(await run({id:'rot13',input:'Hello, đ 123'})).toBe('Uryyb, đ 123');
        expect(JSON.parse(await run({id:'query',action:'read',input:'a=1&'.repeat(999)+'a=1'}))).toHaveLength(1000);
        await expect(run({id:'query',action:'read',input:'a=1&'.repeat(1000)+'a=1'})).rejects.toBeInstanceOf(ToolInputError);
        await expect(run({id:'query',action:'read',input:'q=%FF'})).rejects.toBeInstanceOf(ToolInputError);
    });
    it('enforces text/key bounds at their exact edges and rejects unknown actions', async () => {
        expect(await run({id:'sha256',input:'a'.repeat(10000)})).toHaveLength(64);
        await expect(run({id:'sha256',input:'a'.repeat(10001)})).rejects.toMatchObject({code:'INPUT_LIMIT'});
        expect(await run({id:'hmac256',key:'k'.repeat(1000)})).toHaveLength(64);
        for (const key of ['', 'k'.repeat(1001)]) await expect(run({id:'hmac256',key})).rejects.toMatchObject({code:'KEY_LIMIT'});
        await expect(run({id:'missing'})).rejects.toBeInstanceOf(ToolInputError);
        await expect(run({id:'base64',action:'sign'})).rejects.toBeInstanceOf(ToolInputError);
        await expect(run({id:'hex',input:'\ud800',action:'encode'})).rejects.toBeInstanceOf(ToolInputError);
    });
    it('generates bounded password groups, tokens, UUID bits and leading-zero digits', async () => {
        for (const length of [8,20,128]) {
            const value = await run({id:'password',options:{length}});
            expect(value).toHaveLength(length);
            for (const group of [/[A-Z]/,/[a-z]/,/[0-9]/,/[!@#$%^&*]/]) expect(value).toMatch(group);
        }
        for (const bytes of [1,32,256]) {
            expect(await run({id:'hex-token',options:{bytes}})).toMatch(new RegExp(`^[0-9a-f]{${bytes*2}}$`));
            expect(Buffer.from(await run({id:'base64-token',options:{bytes}}),'base64')).toHaveLength(bytes);
        }
        const uuids = (await run({id:'uuid',options:{count:10}})).split('\n');
        expect(uuids).toHaveLength(10);
        for (const uuid of uuids) expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        expect(await runTool({id:'digits',options:{length:256},crypto:{getRandomValues:array=>array.fill(0)}})).toBe('0'.repeat(256));
    });
    it('rejection sampling discards biased bytes', async () => {
        let call = 0;
        const crypto = {getRandomValues:array=>array.fill(call++ === 0 ? 255 : 9)};
        expect(await runTool({id:'digits',options:{length:1},crypto})).toBe('9');
        expect(call).toBe(2);
    });
    it.each([['password','length',7],['password','length',129],['hex-token','bytes',0],['base64-token','bytes',257],['uuid','count',0],['uuid','count',11],['digits','length',0],['digits','length',257],['digits','length',1.5],['digits','length','']])('rejects invalid %s %s %s', async (id,field,value) => {
        await expect(run({id,options:{[field]:value}})).rejects.toBeInstanceOf(ToolInputError);
    });
    it('does not fake unavailable cryptographic capabilities', async () => {
        for (const id of ['sha256','hmac256','password','uuid']) await expect(runTool({id,key:'key',crypto:{}})).rejects.toMatchObject({code:'CRYPTO_UNAVAILABLE'});
    });
});

describe('text case conversion', () => {
    it.each([
        ['lower', 'TiẾnG VIỆT Đ 😀', 'tiếng việt đ 😀'],
        ['upper', 'Tiếng Việt đ 😀', 'TIẾNG VIỆT Đ 😀'],
        ['capitalized', "  hELLO\tWORLD\nTIẾNG viỆT don't-stop", "  Hello\tWorld\nTiếng Việt Don't-Stop"],
        ['alternating', 'AB 12 cd-éĐ 😀ef', 'aB 12 cD-éĐ 😀eF'],
        ['title', 'THE lord OF the RINGS', 'The Lord of the Rings'],
        ['title', 'a TALE of TWO cities and', 'A Tale of Two Cities And'],
        ['inverse', 'hELLo TiẾng Đ 😀123', 'HellO tIếNG đ 😀123'],
        ['capitalized', 'tIẾNG việT', 'Tiếng Việt'],
        ['capitalized', '𐐨 hello', '𐐀 Hello'],
        ['title', '𐐨 and 𐐨', '𐐀 and 𐐀'],
    ])('%s converts text while preserving spacing, accents and nonletters', async (action, input, expected) => {
        expect(await run({ id: 'text-case', action, input })).toBe(expected);
    });
    it.each(['lower', 'upper', 'capitalized', 'alternating', 'title', 'inverse'])('%s handles empty and whitespace-only input without crypto', async action => {
        expect(await runTool({ id: 'text-case', action, input: '', crypto: {} })).toBe('');
        expect(await runTool({ id: 'text-case', action, input: ' \n\t123😀', crypto: {} })).toBe(' \n\t123😀');
    });
    it('enforces the shared input and action boundaries', async () => {
        expect(await run({ id: 'text-case', action: 'upper', input: 'đ'.repeat(10000) })).toBe('Đ'.repeat(10000));
        await expect(run({ id: 'text-case', action: 'upper', input: 'a'.repeat(10001) })).rejects.toMatchObject({ code: 'INPUT_LIMIT' });
        await expect(run({ id: 'text-case', action: 'missing', input: 'abc' })).rejects.toMatchObject({ code: 'INVALID_ACTION' });
        await expect(run({ id: 'text-case', action: 'upper', input: '\ud800' })).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    });
});
