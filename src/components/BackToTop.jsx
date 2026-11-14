'use client';
import { useSyncExternalStore } from 'react';

function subscribe(onChange) {
    window.addEventListener('scroll', onChange, { passive: true });
    return () => window.removeEventListener('scroll', onChange);
}
const getSnapshot = () => window.scrollY > 0;
const getServerSnapshot = () => false;

export default function BackToTop() {
    const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    if (!visible) return null;

    function goToTop(event) {
        event.preventDefault();
        document.getElementById('main-content')?.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    return <a className="back-to-top" href="#top" aria-label="Back to top" title="Back to top" onClick={goToTop}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" /></svg>
    </a>;
}
