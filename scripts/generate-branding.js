import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

// MASTER EMBLEM (Q Monogram — Senior Grade Corporate Identity)
// - Obsidian Squircle base with subtle cyber-luminescent rim
// - Bold Precision Q Aperture Ring in Electric Cyan to Royal Cobalt (#00F2FE -> #2563EB)
// - Crisp White Query Slash (#FFFFFF)
// - Indonesian Crimson Red-and-White Bullseye Terminal Node (#FF2E54 & #FFFFFF)
const masterFaviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B1120"/>
      <stop offset="100%" stop-color="#020408"/>
    </linearGradient>
    <linearGradient id="qStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F2FE"/>
      <stop offset="45%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
    <linearGradient id="redAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF2E54"/>
      <stop offset="100%" stop-color="#E11D48"/>
    </linearGradient>
    <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#1E293B" stop-opacity="0.25"/>
    </linearGradient>
  </defs>

  <!-- Squircle Base (Apple 22.5% squircle curvature) -->
  <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#bgGrad)" stroke="url(#rimGrad)" stroke-width="1.2"/>

  <!-- Bold Precision Q Circle -->
  <circle cx="29" cy="29" r="14.5" fill="none" stroke="url(#qStrokeGrad)" stroke-width="6" stroke-linecap="round"/>

  <!-- Dynamic Diagonal Query Slash (crossing out from center to bottom-right) -->
  <path d="M 27 27 L 46 46" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>

  <!-- Indonesian Coral Accent Terminal Node -->
  <circle cx="46.5" cy="46.5" r="4.5" fill="url(#redAccent)"/>
  <circle cx="46.5" cy="46.5" r="1.5" fill="#FFFFFF"/>
</svg>`;

// MASTER HORIZONTAL BRAND LOGO (For Navbar, Footer, and Corporate Documents)
// Dimension: 300 x 56
const masterHorizontalLogoSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 56" width="100%" height="100%">
  <defs>
    <linearGradient id="hdrBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B1120"/>
      <stop offset="100%" stop-color="#020408"/>
    </linearGradient>
    <linearGradient id="hdrQGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F2FE"/>
      <stop offset="45%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
    <linearGradient id="hdrRed" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF2E54"/>
      <stop offset="100%" stop-color="#E11D48"/>
    </linearGradient>
    <linearGradient id="indoTextGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D2FF"/>
      <stop offset="50%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
  </defs>

  <!-- Left Icon Emblem (44x44) -->
  <g transform="translate(6, 6)">
    <rect x="0" y="0" width="44" height="44" rx="12" fill="url(#hdrBg)" stroke="#38BDF8" stroke-width="1.2" stroke-opacity="0.4"/>
    <circle cx="20" cy="20" r="10" fill="none" stroke="url(#hdrQGrad)" stroke-width="4.2" stroke-linecap="round"/>
    <path d="M 18.5 18.5 L 32 32" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="32" cy="32" r="3.2" fill="url(#hdrRed)"/>
    <circle cx="32" cy="32" r="1" fill="#FFFFFF"/>
  </g>

  <!-- Journalistic Kicker / Tagline -->
  <text x="62" y="19" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="8" font-weight="800" letter-spacing="1.6" fill="#94A3B8">PORTAL TEKNOLOGI NUSANTARA</text>

  <!-- Wordmark -->
  <text x="61" y="44" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="25" font-weight="900" letter-spacing="-0.8">
    <tspan fill="#FFFFFF">QUERY</tspan><tspan fill="url(#indoTextGrad)">INDO</tspan>
  </text>

  <!-- Domain Pill Badge (.ID) -->
  <g transform="translate(236, 26)">
    <rect x="0" y="0" width="34" height="18" rx="4" fill="rgba(0, 242, 254, 0.08)" stroke="rgba(0, 242, 254, 0.25)" stroke-width="1"/>
    <text x="17" y="13" font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif" font-size="9.5" font-weight="800" fill="#00F2FE" text-anchor="middle" letter-spacing="0.5">.ID</text>
  </g>
</svg>`;

// MASTER OPENGRAPH / TWITTER BANNER (1200 x 630)
const masterOGBannerSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="ogBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B1120"/>
      <stop offset="50%" stop-color="#050811"/>
      <stop offset="100%" stop-color="#020307"/>
    </linearGradient>
    <radialGradient id="ogGlow" cx="50%" cy="35%" r="45%">
      <stop offset="0%" stop-color="#00F2FE" stop-opacity="0.14"/>
      <stop offset="60%" stop-color="#2563EB" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="qGradOG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F2FE"/>
      <stop offset="50%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
    <linearGradient id="redAccentOG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF2E54"/>
      <stop offset="100%" stop-color="#E11D48"/>
    </linearGradient>
    <linearGradient id="indoTextGradOG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D2FF"/>
      <stop offset="50%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#ogBg)"/>
  <rect width="1200" height="630" fill="url(#ogGlow)"/>

  <!-- Centered Emblem (120x120) -->
  <g transform="translate(540, 110)">
    <rect x="0" y="0" width="120" height="120" rx="32" fill="#0B1120" stroke="#38BDF8" stroke-width="2.5" stroke-opacity="0.4"/>
    <circle cx="56" cy="56" r="28" fill="none" stroke="url(#qGradOG)" stroke-width="11.5" stroke-linecap="round"/>
    <path d="M 52 52 L 89 89" stroke="#FFFFFF" stroke-width="9.5" stroke-linecap="round"/>
    <circle cx="90" cy="90" r="8.5" fill="url(#redAccentOG)"/>
    <circle cx="90" cy="90" r="3" fill="#FFFFFF"/>
  </g>

  <!-- Journalistic Kicker -->
  <text x="600" y="315" font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="800" letter-spacing="4" fill="#38BDF8" text-anchor="middle">PORTAL JURNALISME TEKNOLOGI INDONESIA</text>

  <!-- Brand Name -->
  <text x="600" y="420" font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif" font-size="88" font-weight="900" letter-spacing="-2" text-anchor="middle">
    <tspan fill="#FFFFFF">QUERY</tspan><tspan fill="url(#indoTextGradOG)">INDO</tspan>
  </text>

  <!-- Editorial Creed -->
  <text x="600" y="485" font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="600" letter-spacing="1.5" fill="#94A3B8" text-anchor="middle">JERNIH • TAJAM • KEDAULATAN DIGITAL</text>
  <text x="600" y="525" font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="500" fill="#64748B" text-anchor="middle">https://queryindo.com</text>
</svg>`;

async function buildAllBrandAssets() {
  console.log('🚀 Building Senior-Grade Corporate Brand Identity Assets...');

  // 1. Write SVGs
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), masterFaviconSVG, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'logo-brand.svg'), masterHorizontalLogoSVG, 'utf8');
  console.log('✅ public/favicon.svg and public/logo-brand.svg written.');

  // 2. Render Multi-size PNGs
  const pngOutputs = [
    { file: 'logo.png', size: 512 },
    { file: 'icon-512.png', size: 512 },
    { file: 'icon-192.png', size: 192 },
    { file: 'apple-touch-icon.png', size: 180 },
    { file: 'favicon-32x32.png', size: 32 },
    { file: 'favicon-16x16.png', size: 16 }
  ];

  for (const { file, size } of pngOutputs) {
    await sharp(Buffer.from(masterFaviconSVG))
      .resize(size, size)
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(path.join(publicDir, file));
    console.log(`✅ public/${file} (${size}x${size}) generated.`);
  }

  // 3. Render Master OG Banner
  await sharp(Buffer.from(masterOGBannerSVG))
    .resize(1200, 630)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('✅ public/og-image.png (1200x630) generated.');

  // 4. Generate Multi-Resolution favicon.ico (16x16 and 32x32 binary package)
  const p16 = fs.readFileSync(path.join(publicDir, 'favicon-16x16.png'));
  const p32 = fs.readFileSync(path.join(publicDir, 'favicon-32x32.png'));

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // ICO format
  header.writeUInt16LE(2, 4); // 2 images

  const offset1 = 6 + 16 * 2;
  const entry1 = Buffer.alloc(16);
  entry1.writeUInt8(16, 0);
  entry1.writeUInt8(16, 1);
  entry1.writeUInt8(0, 2);
  entry1.writeUInt8(0, 3);
  entry1.writeUInt16LE(1, 4);
  entry1.writeUInt16LE(32, 6);
  entry1.writeUInt32LE(p16.length, 8);
  entry1.writeUInt32LE(offset1, 12);

  const offset2 = offset1 + p16.length;
  const entry2 = Buffer.alloc(16);
  entry2.writeUInt8(32, 0);
  entry2.writeUInt8(32, 1);
  entry2.writeUInt8(0, 2);
  entry2.writeUInt8(0, 3);
  entry2.writeUInt16LE(1, 4);
  entry2.writeUInt16LE(32, 6);
  entry2.writeUInt32LE(p32.length, 8);
  entry2.writeUInt32LE(offset2, 12);

  const ico = Buffer.concat([header, entry1, entry2, p16, p32]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
  console.log('✅ public/favicon.ico (Multi-size ICO) generated.');

  // Clean temporary test files
  const testFiles = ['test-a.png', 'test-b.png', 'test-c.png', 'test-b1.png', 'test-b2.png', 'test-b3.png', 'test-b1-16.png', 'test-b1-32.png'];
  for (const f of testFiles) {
    const p = path.join(publicDir, f);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  console.log('🧹 Cleaned temporary preview files.');

  console.log('🎉 Senior-grade brand identity assets completely generated!');
}

buildAllBrandAssets().catch(err => {
  console.error('Build brand assets error:', err);
  process.exit(1);
});
