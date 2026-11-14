import './globals.css';
import { site } from '../lib/site.js';

const image = { url: new URL(site.image, site.url).href, width: 1200, height: 630, alt: site.imageAlt, type: 'image/png' };
export const metadata = {
    metadataBase: new URL(site.url),
    title: site.title,
    applicationName: site.name,
    description: site.description,
    alternates: { canonical: site.url },
    robots: { index: true, follow: true },
    openGraph: {
        title: site.title,
        description: site.description,
        url: site.url,
        siteName: site.name,
        type: 'website',
        locale: 'en_US',
        images: [image],
    },
    twitter: {
        card: 'summary_large_image',
        title: site.title,
        description: site.description,
        images: [{ url: image.url, alt: image.alt }],
    },
};

export default function RootLayout({ children }) {
    return <html lang="en"><body className="tools-root"><a className="skip-link" href="#main-content">Skip to main content</a>{children}</body></html>;
}
