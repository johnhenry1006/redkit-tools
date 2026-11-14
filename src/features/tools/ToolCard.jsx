'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { groups } from './catalog.js';
import { runTool } from './engine.js';

export default function ToolCard({ definition }) {
    const identity = useId();
    const [input, setInput] = useState('');
    const [key, setKey] = useState('');
    const defaultOptions = () => Object.fromEntries(definition.fields.filter(field => field.type === 'number').map(field => [field.name, field.value]));
    const [options, setOptions] = useState(defaultOptions);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [pending, setPending] = useState(false);
    const [copied, setCopied] = useState(false);
    const sequence = useRef(0);
    const output = useRef(null);
    // Retire all asynchronous continuations; input/key state is discarded on unmount.
    useEffect(() => () => { sequence.current++; }, []);
    function invalidate() {
        sequence.current++;
        setResult(null); setError(''); setPending(false); setCopied(false);
    }
    function reset() {
        invalidate();
        setInput('');
        setKey('');
        setOptions(defaultOptions());
    }
    async function run(action) {
        invalidate();
        const operation = sequence.current;
        setPending(true);
        try {
            const value = await runTool({ id: definition.id, action, input, key, options });
            if (operation === sequence.current) setResult(value);
        } catch (error) {
            if (operation === sequence.current) setError(error.message);
        } finally {
            if (operation === sequence.current) setPending(false);
        }
    }
    async function copy() {
        if (!result) return;
        const operation = sequence.current;
        try {
            if (!navigator.clipboard?.writeText) throw new Error();
            await navigator.clipboard.writeText(result);
            if (operation === sequence.current) { setCopied(true); setError(''); }
        } catch {
            if (operation !== sequence.current) return;
            setError('Could not copy automatically. Select the result and copy it manually.');
            if (output.current) {
                output.current.focus();
                const range = document.createRange();
                range.selectNodeContents(output.current);
                const selection = window.getSelection();
                selection?.removeAllRanges(); selection?.addRange(range);
            }
        }
    }
    const actionButton = action => <button key={action.id} type="button" disabled={pending} onClick={() => run(action.id)}>
        {action.badge && <span className={`tools-case-badge tools-case-${action.id}`} aria-hidden="true">{action.badge}</span>}
        {action.label}
    </button>;
    return <article className="tools-tool-card" data-tool={definition.id} aria-labelledby={`${identity}-title`}>
        <header><h2 id={`${identity}-title`}>{definition.title}</h2><span className="tools-tool-group">{groups.find(group => group.id === definition.group)?.label}</span></header>
        <p className="tools-tool-description" id={`${identity}-description`}>{definition.description}</p>
        <div className="tools-tool-fields">
            {definition.fields.map(field => {
                const fieldId = `${identity}-${field.name}`;
                return <div key={field.name}><label htmlFor={fieldId}>{field.label}</label>{field.type === 'textarea' ?
                    <textarea id={fieldId} value={input} maxLength={definition.limits.input} rows={3} spellCheck={false} aria-describedby={`${identity}-description`} onChange={event => { invalidate(); setInput(event.target.value); }} /> :
                    field.type === 'password' ? <input id={fieldId} type="password" value={key} maxLength={definition.limits.key} autoComplete="off" spellCheck={false} onChange={event => { invalidate(); setKey(event.target.value); }} /> :
                    <input id={fieldId} type="number" min={field.min} max={field.max} step="1" value={options[field.name]} onChange={event => { invalidate(); setOptions(previous => ({ ...previous, [field.name]: event.target.value })); }} />}</div>;
            })}
            {definition.actions.some(action => action.badge) && <div className="tools-case-actions" role="group" aria-label="Text case conversions">
                {definition.actions.filter(action => action.badge).map(actionButton)}
            </div>}
            {error && <p className="tools-tool-error" role="alert">{error}</p>}
        </div>
        <div className="tools-tool-actions">
            {definition.actions.filter(action => !action.badge).map(actionButton)}
            <button type="button" className="tools-secondary" onClick={reset}>Reset</button>
            <button type="button" className="tools-secondary tools-copy" disabled={!result || pending} onClick={copy}>Copy</button>
        </div>
        <p className="tools-tool-status" role="status" aria-live="polite">{pending ? 'Processing…' : copied ? 'Copied' : ''}</p>
        <pre ref={output} tabIndex={0} className="tools-tool-output" aria-label={`Result ${definition.title}`} aria-busy={pending}>{result === null ? 'No result yet' : result === '' ? 'Empty result' : result}</pre>
    </article>;
}
