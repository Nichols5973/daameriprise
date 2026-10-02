/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-divider. Base: columns. Source: https://www.ameriprise.com/
 * Selector: .Spotlight
 *
 * Output: 1 row x 2 cells; each cell: icon, h3, p, link
 *
 * Source selectors (validated against block-context/columns-divider/source.html):
 *   .Spotlight > .Grid > div          - one column each (2)
 *   svg > use[href$=".svg#id"] (live) or img[src^="data:image/svg+xml"] (cleaned) - brand icon
 *   h3, p, a.Button
 *
 * Icons are emitted as ":id:" tokens (EDS icon notation) so they survive html2md - an empty
 * <span class="icon"> or a data: URI image would be dropped/unusable in the import.
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

function buildIcon(document, col) {
  const node = col.querySelector('svg, img, span.icon');
  const id = iconId(node);
  if (id) {
    const p = document.createElement('p');
    p.textContent = `:${id}:`;
    return p;
  }
  // Real raster image: keep as-is
  if (node && node.tagName === 'IMG' && !(node.getAttribute('src') || '').startsWith('data:')) return node;
  return null;
}

export default function parse(element, { document }) {
  let columns = [...element.querySelectorAll(':scope > .Grid > div')];
  if (!columns.length) columns = [...element.querySelectorAll('[class*="size1of2"]')];
  columns = columns.filter((c) => c.querySelector('h2, h3, h4, p, a'));

  if (!columns.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const row = columns.map((col) => {
    const cell = [];
    const icon = buildIcon(document, col);
    if (icon) cell.push(icon);
    const heading = col.querySelector('h2, h3, h4');
    if (heading) cell.push(heading);
    col.querySelectorAll('p').forEach((p) => {
      if (p.textContent.trim()) cell.push(p);
    });
    col.querySelectorAll('a[href]').forEach((a) => {
      if (!a.textContent.trim()) return;
      const p = document.createElement('p');
      p.append(a);
      cell.push(p);
    });
    return cell;
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-divider', cells: [row] });
  element.replaceWith(block);
}
