/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Ameriprise site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html (https://www.ameriprise.com/).
 *
 * beforeTransform: remove overlays / widgets / tracking that could interfere with parsing.
 *   NOTE: does NOT remove empty containers here - section selectors in page-templates.json
 *   use `.OneColumnLayout-container > div > div:nth-of-type(N)`, so sibling counts must stay intact
 *   until the section transformer has inserted its breaks.
 * afterTransform: remove global chrome (header, footer, skip links, back-to-top), leftover
 *   non-authorable elements, convert sprite icons to EDS icon spans, and prune empty containers.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// Sprite icons: <svg class="BrandIcon"><use href="/webfiles/.../icon-sprite-2025-11-12.svg#handshake"></use></svg>
const SPRITE_USE_RE = /\.svg#([a-z0-9-_]+)$/i;

function convertSpriteIcons(element) {
  element.querySelectorAll('svg').forEach((svg) => {
    const use = svg.querySelector('use');
    const href = use && (use.getAttribute('href') || use.getAttribute('xlink:href'));
    const match = href && href.match(SPRITE_USE_RE);
    if (match) {
      const span = document.createElement('span');
      span.className = `icon icon-${match[1].toLowerCase()}`;
      svg.replaceWith(span);
    } else {
      // Local-symbol svgs (#ampf-logo, #ampf-compass, #social-*) and inline decorative svgs
      // are not authorable and cannot render in EDS.
      svg.remove();
    }
  });
}

const KEEP_IF_CONTAINS = 'img, picture, video, iframe, table, hr, a, input, button, span.icon, svg';

function removeEmptyContainers(element) {
  const divs = [...element.querySelectorAll('div, section')].reverse();
  divs.forEach((el) => {
    if (el.closest('table')) return; // never touch block cells built by parsers
    if (el.textContent.trim() !== '') return;
    if (el.querySelector(KEEP_IF_CONTAINS)) return;
    el.remove();
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    WebImporter.DOMUtils.remove(element, [
      // OneTrust cookie consent overlay
      '#onetrust-consent-sdk',
      // Qualtrics feedback widget + intercept container
      '.QSIFeedbackButton',
      '#ZN_37spM9cCMVfV1MV',
      // Tracking iframes / pixels
      '#destination_publishing_iframe_ameriprisefinancial_0',
      '#tmx_tags_iframe',
      '#universal_pixel_mxnurmo',
      '#lt_3p_15823',
      '#batBeacon892664124595',
      'img[src*="tags.w55c.net"]',
      'img[src*="crwdcntrl.net"]',
      'img[src*="adsrvr.org"]',
      'img[src*="bat.bing.com"]',
      // App store banner + shadow-root asset template (inside header)
      '#app-store-banner-element',
      'template#shadow-root-assets',
    ]);

    // Disclaimer lines are bare <div> text runs; make each a <p> so inline footnote
    // markers (<sup>1</sup>) stay in the same paragraph as their text.
    element.querySelectorAll('.SimpleContent .Disclaimer-text:not(:has(> div))').forEach((div) => {
      const p = document.createElement('p');
      p.innerHTML = div.innerHTML;
      div.replaceWith(p);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      // Global header (AppBar + AppMenu mega nav)
      '#app-header',
      // Skip links (<nav class="u-posAbsolute u-sizeFull"> with a.Link--skip)
      'nav:has(> a.Link--skip)',
      'a.Link--skip',
      // Global footer (SocialMediaBar, FooterNavigation, FooterDisclaimer)
      'footer.footer',
      // Mobile back-to-top button
      'nav.BackToTop',
      // Safe leftovers
      'link',
      'noscript',
      'script',
      'style',
      'template',
      'iframe',
    ]);

    convertSpriteIcons(element);
    removeEmptyContainers(element);
  }
}
