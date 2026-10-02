/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-icon. Base: cards. Source: https://www.ameriprise.com/
 * Selector: .Categories-blocks
 *
 * Output: one row per card (3 rows x 2 cells); cell 1: icon ; cell 2: bold label text
 * (plus any non-empty .Categories-content description/links).
 *
 * Source selectors (validated against block-context/cards-icon/source.html):
 *   .Categories-block                    - card (iterated; stable block wrapper, no nested interactives)
 *   svg > use[href$=".svg#id"] (live) or img[src^="data:image/svg+xml"] (cleaned) - brand icon
 *   .Categories-heading                  - bold label
 *   .Categories-content                  - optional description
 *
 * Icons are emitted as ":id:" tokens (EDS icon notation) so they survive html2md.
 */
const SPRITE_RE = /\.svg#([a-z0-9_-]+)$/i;

function spriteIdFromSvgMarkup(markup) {
  const m = markup && markup.match(/href="([^"]+)"/);
  const id = m && m[1].match(SPRITE_RE);
  return id ? id[1].toLowerCase() : null;
}

function iconId(node) {
  if (!node) return null;
  if (node.tagName && node.tagName.toLowerCase() === 'svg') {
    const use = node.querySelector('use');
    const href = use && (use.getAttribute('href') || use.getAttribute('xlink:href'));
    const m = href && href.match(SPRITE_RE);
    return m ? m[1].toLowerCase() : null;
  }
  if (node.tagName === 'IMG') {
    const src = node.getAttribute('src') || '';
    if (src.startsWith('data:image/svg+xml;base64,')) {
      try { return spriteIdFromSvgMarkup(atob(src.split(',')[1])); } catch (e) { return null; }
    }
    if (src.startsWith('data:image/svg+xml')) {
      return spriteIdFromSvgMarkup(decodeURIComponent(src.split(',')[1] || ''));
    }
    const m = src.match(/\/([a-z0-9_-]+)\.svg$/i);
    return m ? m[1].toLowerCase() : null;
  }
  if (node.classList && node.classList.contains('icon')) {
    const cls = [...node.classList].find((c) => c.startsWith('icon-'));
    return cls ? cls.slice(5) : null;
  }
  return null;
}

function buildIcon(document, card) {
  const node = card.querySelector('svg, img, span.icon');
  const id = iconId(node);
  if (id) {
    const p = document.createElement('p');
    p.textContent = `:${id}:`;
    return p;
  }
  if (node && node.tagName === 'IMG' && !(node.getAttribute('src') || '').startsWith('data:')) return node;
  return '';
}

export default function parse(element, { document }) {
  let cards = [...element.querySelectorAll('.Categories-block')];
  if (!cards.length) cards = [...element.querySelectorAll(':scope > div')];

  const cells = [];
  cards.forEach((card) => {
    const headingEl = card.querySelector('.Categories-heading') || card.querySelector('h2, h3, h4, .u-textBold');
    const label = headingEl ? headingEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const body = [];
    if (label) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = label;
      p.append(strong);
      body.push(p);
    }
    const content = card.querySelector('.Categories-content');
    if (content && content.textContent.trim()) {
      const ps = [...content.querySelectorAll('p')];
      if (ps.length) ps.forEach((p) => body.push(p));
      else {
        const p = document.createElement('p');
        p.innerHTML = content.innerHTML;
        body.push(p);
      }
    }
    if (!body.length) return;
    cells.push([buildIcon(document, card), body]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon', cells });
  element.replaceWith(block);
}
