import { groups } from './catalog.js';
export default function ToolFilters({ search, group, onSearch, onGroup, count }) {
    return <><div className="tools-tool-filters"><div><label htmlFor="tools-tool-search">Search tools</label><input id="tools-tool-search" type="search" placeholder="Search tools, e.g. Base64, UUID, SHA-256…" value={search} onChange={event => onSearch(event.target.value)} /></div><div><label htmlFor="tools-tool-group">Category</label><select id="tools-tool-group" value={group} onChange={event => onGroup(event.target.value)}><option value="all">All categories</option>{groups.map(group => <option key={group.id} value={group.id}>{group.label}</option>)}</select></div></div><p className="tools-tool-count" role="status">{count} tools</p></>;
}
