// Prepare the supplied artwork for sharing; preserve public/redkit-og.png as source.
import sharp from 'sharp';
import { site } from '../src/lib/site.js';

const root = new URL('../public/', import.meta.url);
const source = new URL('redkit-og.png', root);
const target = new URL(site.image.slice(1), root);
await sharp(source.pathname)
    .resize(1200, 630, { fit: 'contain', background: '#0b0b0d' })
    .png({ compressionLevel: 9 })
    .toFile(target.pathname);
