/* eslint-disable */
/* global WebImporter */
/**
 * Parser for advisor-search-dark. Base: advisor-search (custom). Source: https://www.ameriprise.com/
 * Selector: .DynamicAdvisor
 *
 * Output (contract from blocks/advisor-search-dark/metadata.json):
 *   Row 1: background image (single cell)
 *   Row 2: cell 1: icon, h3 ; cell 2: form label text, appointment paragraph with link
 *   Key/value rows: action | placeholder | search | location  (labels read from the DOM)
 *   Row N: FINRA note paragraph with link (single cell)
 *
 * Source selectors (validated against block-context/advisor-search-dark/source.html):
 *   :scope > img (cleaned) | CSS background-image on .DynamicAdvisor (live)  - background
 *   .DynamicAdvisor-heading svg/img, h3                                     - icon + heading
 *   .DynamicAdvisor-searchForm > div > label.Input-label                    - form label
 *   #DynamicAdvisor-input + label / [placeholder]                           - placeholder
 *   .AdvisorProspect-button                                                 - search label
 *   .DynamicAdvisor-findMyLocation                                          - location label
 *   .DynamicAdvisor-searchForm p                                            - appointment text
 *   .DynamicAdvisor-disclosure                                              - FINRA note
 *
 * Action: the source form has no action attribute - search is a JS window.open() to
 * ameripriseadvisors.com. Use a data-action/form action/advisor link if present, else the
 * observed search host.
 */
const DEFAULT_ACTION = 'https://www.ameripriseadvisors.com/';
const SPRITE_RE = /\.svg#([a-z0-9_-]+)$/i;
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

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

function backgroundImage(document, element) {
  const img = element.querySelector(':scope > img, :scope > picture img');
  if (img) return img;
  let bg = element.style && element.style.backgroundImage;
  if (!bg || bg === 'none') {
    const view = document.defaultView || (typeof window !== 'undefined' ? window : null);
    try { bg = view && view.getComputedStyle ? view.getComputedStyle(element).backgroundImage : ''; } catch (e) { bg = ''; }
  }
  const m = bg && bg.match(/url\(["']?([^"')]+)["']?\)/);
  if (!m) return null;
  const out = document.createElement('img');
  out.src = new URL(m[1], document.baseURI || 'https://www.ameriprise.com/').href;
  out.alt = '';
  return out;
}

const absolutize = (root) => root.querySelectorAll('a[href]').forEach((a) => {
  if (a.href) a.setAttribute('href', a.href);
});

export default function parse(element, { document }) {
  const headingWrap = element.querySelector('.DynamicAdvisor-heading') || element;
  const heading = headingWrap.querySelector('h2, h3, h4');
  const form = element.querySelector('.DynamicAdvisor-searchForm') || element;

  if (!heading && !form.querySelector('input')) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 1: background
  const bg = backgroundImage(document, element);
  if (bg) cells.push([bg]);

  // Row 2: intro (icon + heading) | panel (form label + appointment text)
  const intro = [];
  const id = iconId(headingWrap.querySelector('svg, img, span.icon'));
  if (id) {
    const p = document.createElement('p');
    p.textContent = `:${id}:`;
    intro.push(p);
  }
  if (heading) intro.push(heading);

  const panel = [];
  const input = form.querySelector('#DynamicAdvisor-input, input[type="text"], input:not([type])');
  const inputLabel = input ? input.closest('.Input-group, .Form-group')?.querySelector('label') : null;
  const formLabel = [...form.querySelectorAll('label')].find((l) => l !== inputLabel && clean(l.textContent));
  if (formLabel) {
    const p = document.createElement('p');
    p.textContent = clean(formLabel.textContent);
    panel.push(p);
  }
  absolutize(form);
  form.querySelectorAll('p').forEach((p) => { if (clean(p.textContent)) panel.push(p); });
  cells.push([intro, panel]);

  // Key/value config rows
  const actionEl = element.querySelector('[data-action], form[action]');
  const advisorLink = [...element.querySelectorAll('a[href*="ameripriseadvisors.com"]')][0];
  const action = (actionEl && (actionEl.getAttribute('data-action') || actionEl.getAttribute('action')))
    || (advisorLink && advisorLink.href) || DEFAULT_ACTION;
  cells.push(['action', action]);

  const placeholder = clean(input && input.getAttribute('placeholder')) || clean(inputLabel && inputLabel.textContent);
  if (placeholder) cells.push(['placeholder', placeholder]);

  const searchBtn = form.querySelector('.AdvisorProspect-button')
    || [...form.querySelectorAll('button')].find((b) => !b.classList.contains('DynamicAdvisor-findMyLocation'));
  if (searchBtn && clean(searchBtn.textContent)) cells.push(['search', clean(searchBtn.textContent)]);

  const locate = form.querySelector('.DynamicAdvisor-findMyLocation');
  if (locate && clean(locate.textContent)) cells.push(['location', clean(locate.textContent)]);

  // Row N: FINRA disclosure note
  const disclosure = element.querySelector('.DynamicAdvisor-disclosure');
  if (disclosure && clean(disclosure.textContent)) {
    absolutize(disclosure);
    const ps = [...disclosure.querySelectorAll('p')];
    cells.push([ps.length ? ps : [...disclosure.childNodes]]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'advisor-search-dark', cells });
  element.replaceWith(block);
}
