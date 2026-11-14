// Unicode letters/marks preserve accents, including decomposed Vietnamese text.
const words = /\p{L}[\p{L}\p{M}\p{N}]*(?:['’][\p{L}\p{M}\p{N}]+)*/gu;
const smallWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'per', 'the', 'to', 'via', 'vs']);
const capitalize = word => {
    const first = String.fromCodePoint(word.codePointAt(0));
    return first.toUpperCase() + word.slice(first.length);
};

export function changeCase(action, input) {
    switch (action) {
        case 'lower': return input.toLowerCase();
        case 'upper': return input.toUpperCase();
        case 'capitalized': return input.toLowerCase().replace(words, capitalize);
        case 'title': {
            const lower = input.toLowerCase();
            const matches = [...lower.matchAll(words)];
            let index = 0;
            return lower.replace(words, word => {
                const position = index++;
                return position === 0 || position === matches.length - 1 || !smallWords.has(word) ? capitalize(word) : word;
            });
        }
        case 'alternating': {
            let index = 0;
            return Array.from(input, char => char.toLowerCase() === char.toUpperCase() ? char : index++ % 2 === 0 ? char.toLowerCase() : char.toUpperCase()).join('');
        }
        case 'inverse': return Array.from(input, char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()).join('');
        default: throw new Error('Invalid text case action.');
    }
}
