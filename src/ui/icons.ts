/** Inline SVG icon set (stroke = currentColor). No icon fonts, no assets. */

const svg = (viewBox: string, body: string): string =>
  `<svg viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICONS = {
  pause: svg('0 0 24 24', '<rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/>'),
  play: svg('0 0 24 24', '<path d="M7 4.5v15l13-7.5z"/>'),
  gear: svg('0 0 24 24', '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.04.04a2 2 0 1 1-2.83 2.83l-.04-.04a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.04.04a2 2 0 1 1-2.83-2.83l.04-.04a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.04-.04a2 2 0 1 1 2.83-2.83l.04.04a1.7 1.7 0 0 0 1.87.34h.08a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56h.08a1.7 1.7 0 0 0 1.87-.34l.04-.04a2 2 0 1 1 2.83 2.83l-.04.04a1.7 1.7 0 0 0-.34 1.87v.08a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03z"/>'),
  gem: svg('0 0 24 24', '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20"/><path d="M12 21 8 9l4-6 4 6z"/>'),
  trophy: svg('0 0 24 24', '<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a2 2 0 0 0 2 5"/><path d="M17 6h3a2 2 0 0 1-2 5"/>'),
  back: svg('0 0 24 24', '<path d="M15 5l-7 7 7 7"/>'),
  share: svg('0 0 24 24', '<circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="6" r="2.6"/><circle cx="18" cy="18" r="2.6"/><path d="M8.4 10.8 15.6 7.2"/><path d="M8.4 13.2l7.2 3.6"/>'),
  sound: svg('0 0 24 24', '<path d="M11 5 6.5 9H3v6h3.5L11 19z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>'),
  mute: svg('0 0 24 24', '<path d="M11 5 6.5 9H3v6h3.5L11 19z"/><path d="m16 9 6 6"/><path d="m22 9-6 6"/>'),
  vibe: svg('0 0 24 24', '<rect x="8" y="3" width="8" height="18" rx="2.5"/><path d="M4 8v8"/><path d="M1.5 10v4"/><path d="M20 8v8"/><path d="M22.5 10v4"/>'),
  globe: svg('0 0 24 24', '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14.5 14.5 0 0 1 0 18 14.5 14.5 0 0 1 0-18z"/>'),
  moon: svg('0 0 24 24', '<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/>'),
  target: svg('0 0 24 24', '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>'),
  sparkle: svg('0 0 24 24', '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>'),
};

/** The Stakura wordmark + tower mark (pure SVG, uses theme accents via CSS vars). */
export const LOGO_SVG = `
<svg class="logo-mark" viewBox="0 0 120 140" aria-hidden="true">
  <defs>
    <linearGradient id="lg-tower" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="var(--accent)"/>
      <stop offset="1" stop-color="var(--accent-2)"/>
    </linearGradient>
  </defs>
  <g fill="url(#lg-tower)">
    <rect x="14" y="112" width="92" height="20" rx="6"/>
    <rect x="22" y="90" width="76" height="20" rx="6"/>
    <rect x="30" y="68" width="60" height="20" rx="6"/>
    <rect x="38" y="46" width="44" height="20" rx="6"/>
    <rect x="46" y="24" width="28" height="20" rx="6"/>
    <rect x="52" y="4" width="16" height="18" rx="5"/>
  </g>
  <g fill="var(--accent-2)" opacity="0.85">
    <ellipse cx="20" cy="26" rx="5" ry="3" transform="rotate(-24 20 26)"/>
    <ellipse cx="100" cy="58" rx="5" ry="3" transform="rotate(18 100 58)"/>
    <ellipse cx="86" cy="14" rx="4" ry="2.4" transform="rotate(40 86 14)"/>
  </g>
</svg>`;
