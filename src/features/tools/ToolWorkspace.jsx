'use client';
import { useState } from 'react';
import { tools } from './catalog.js';
import ToolCard from './ToolCard.jsx';
import ToolFilters from './ToolFilters.jsx';
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
export default function ToolWorkspace() {
    const [search, setSearch] = useState('');
    const [group, setGroup] = useState('all');
    const filtered = tools.filter(tool => (group === 'all' || tool.group === group) && normalize(`${tool.title} ${tool.description}`).includes(normalize(search.trim())));
    return <section id="toolkit" className="tools-tools" aria-label="Tools">
        <ToolFilters search={search} group={group} onSearch={setSearch} onGroup={setGroup} count={filtered.length} />
        <div className="tools-tools-grid">{filtered.map(definition => <ToolCard key={definition.id} definition={definition} />)}</div>
        {filtered.length === 0 && <div className="tools-panel tools-empty"><h2>No tools found</h2><p>Try another name or select all categories.</p></div>}
    </section>;
}
