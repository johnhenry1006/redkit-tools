import Image from 'next/image';
import BackToTop from '../components/BackToTop.jsx';
import ToolWorkspace from '../features/tools/ToolWorkspace.jsx';

export default function Page() {
    return <>
        <header className="site-header">
            <div className="site-header-inner">
                <a className="site-brand" href="#top" aria-label="RedKit — back to top">
                    <Image src="/redkit-logo.svg" alt="" width={40} height={40} unoptimized />
                    <span>Red<span className="brand-light">Kit</span><span className="brand-dot">.</span></span>
                </a>
            </div>
        </header>
        <main id="main-content" className="tools-page" tabIndex={-1}>
            <section id="top" className="tools-hero" aria-labelledby="hero-title">
                <h1 id="hero-title">Your everyday <span>toolkit.</span></h1>
                <p className="tools-lead">Generate, convert and format — all in one place.</p>
            </section>
            <ToolWorkspace />
            <footer className="site-footer">
                <strong>RedKit<span className="brand-dot">.</span></strong>
                <p>No history. No data sent to a server.</p>

            </footer>
        </main>
        <BackToTop />
    </>;
}
