/*
 * Footer block
 * Content comes from footer.plain.html, three sections in order:
 *   1. brand bar – logo image, call-to-action link, list of social links (image links)
 *   2. links     – list of site links, then a featured link + its description
 *   3. legal     – list of legal links, copyright paragraph
 * All copy, links and images are authored; this file only adds structure.
 */

/**
 * Fetches the footer fragment: /content/footer.plain.html locally, /footer.plain.html on DA/EDS.
 * @returns {Promise<Element|null>} wrapper holding the fragment sections
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  // resolve relative image paths against the fragment, not the current page
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
    img.loading = 'lazy';
  });
  return wrapper;
}

function band(name, section) {
  const outer = document.createElement('div');
  outer.className = `footer-${name}`;
  const inner = document.createElement('div');
  inner.className = `footer-${name}-inner`;
  if (section) inner.append(...section.childNodes);
  outer.append(inner);
  return outer;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const [brandSec, linksSec, legalSec] = [...fragment.children];

  const brand = band('brand', brandSec);
  brand.querySelectorAll(':scope > div > p').forEach((p) => {
    const link = p.querySelector('a');
    if (link && !link.querySelector('img')) link.className = 'button footer-cta';
    else if (p.querySelector('img')) p.classList.add('footer-logo');
  });
  brand.querySelector('ul')?.classList.add('footer-social');

  const links = band('links', linksSec);
  links.querySelector('ul')?.classList.add('footer-nav');
  // the featured link + description after the list form a callout box
  const paras = [...links.querySelectorAll(':scope > div > p')];
  if (paras.length) {
    const callout = document.createElement('div');
    callout.className = 'footer-callout';
    callout.append(...paras);
    callout.firstElementChild?.classList.add('footer-callout-title');
    links.firstElementChild.append(callout);
  }

  const legal = band('legal', legalSec);
  legal.querySelector('ul')?.classList.add('footer-legal-links');
  legal.querySelector(':scope > div > p')?.classList.add('footer-copyright');

  const footer = document.createElement('div');
  footer.className = 'footer-bands';
  footer.append(brand, links, legal);
  block.append(footer);
}
