/*
 * Header block
 * Nav content comes from nav.plain.html, five sections in order:
 *   1. brand   – logo (linked image)
 *   2. utility – list of small links, primary CTA (<strong> link), secondary CTA link
 *   3. nav     – nested list (top level > flyout > second flyout)
 *   4. search  – link to the search page (query param in its href) + panel label
 *   5. labels  – list: menu button label, close label, back label
 * All copy, links and images are authored; this file only builds structure and behaviour.
 */
import { decorateIcons } from '../../scripts/aem.js';

const isDesktop = window.matchMedia('(width >= 900px)');

/**
 * Fetches the nav fragment: /content/nav.plain.html locally, /nav.plain.html on DA/EDS.
 * @returns {Promise<Element|null>} wrapper holding the fragment sections
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  // resolve relative image paths against the fragment, not the current page
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  return wrapper;
}

/**
 * Turns authored :icon-name: tokens into icon spans (the delivery pipeline does this for
 * documents, but not for a raw fragment fetch in local preview).
 * @param {Element} root fragment wrapper
 */
function convertIconTokens(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    if (/:[a-z0-9-]+:/.test(walker.currentNode.nodeValue)) nodes.push(walker.currentNode);
  }
  nodes.forEach((node) => {
    const frag = document.createDocumentFragment();
    node.nodeValue.split(/(:[a-z0-9-]+:)/).forEach((part) => {
      const match = part.match(/^:([a-z0-9-]+):$/);
      if (match) {
        const span = document.createElement('span');
        span.className = `icon icon-${match[1]}`;
        frag.append(span);
      } else if (part.trim()) {
        frag.append(part.trim());
      }
    });
    node.replaceWith(frag);
  });
}

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  children.filter(Boolean).forEach((child) => node.append(child));
  return node;
}

function textOf(node) {
  return node ? node.textContent.trim() : '';
}

/** closes every open dropdown / sub-panel inside the nav */
function closeAll(nav) {
  nav.querySelectorAll('.is-open').forEach((item) => item.classList.remove('is-open'));
  nav.querySelectorAll('[aria-expanded="true"]:not(.nav-hamburger)').forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
}

function setMobileMenu(nav, open) {
  nav.classList.toggle('menu-open', open);
  const hamburger = nav.querySelector('.nav-hamburger');
  hamburger.setAttribute('aria-expanded', String(open));
  hamburger.setAttribute('aria-label', open ? hamburger.dataset.closeLabel : hamburger.dataset.openLabel);
  document.body.classList.toggle('nav-menu-open', open);
  if (!open) {
    nav.querySelector('.nav-sections')?.classList.remove('is-drilled');
    closeAll(nav);
  }
}

function setSearch(nav, open) {
  nav.classList.toggle('search-open', open);
  nav.querySelectorAll('.nav-search-toggle').forEach((btn) => btn.setAttribute('aria-expanded', String(open)));
  document.body.classList.toggle('nav-search-open', open);
  if (open) {
    if (!isDesktop.matches) setMobileMenu(nav, false);
    nav.querySelector('.nav-search-input')?.focus();
  }
}

/**
 * Builds the nested nav list: desktop hover flyouts, mobile slide-in panels + accordions.
 * @param {Element} list top-level <ul> from the fragment
 * @param {string} backLabel authored "Back" label
 */
function buildSections(list, backLabel) {
  // authoring tools may wrap list item text in <p>; unwrap so links are direct children
  list.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
  list.classList.add('nav-sections', 'nav-list');
  const backItem = el('li', 'nav-back');
  const backBtn = el('button', 'nav-back-button', backLabel);
  backBtn.type = 'button';
  backItem.append(backBtn);
  list.prepend(backItem);

  [...list.children].filter((li) => li !== backItem).forEach((li) => {
    li.classList.add('nav-item');
    const link = li.querySelector(':scope > a');
    const sub = li.querySelector(':scope > ul');
    link?.classList.add('nav-trigger');
    if (link && new URL(link.href).pathname === '/') li.classList.add('nav-item-home');
    if (link && new URL(link.href).pathname === window.location.pathname) {
      link.setAttribute('aria-current', 'page');
    }
    if (!sub) return;

    li.classList.add('nav-drop');
    sub.classList.add('nav-flyout');
    link?.setAttribute('aria-haspopup', 'true');
    link?.setAttribute('aria-expanded', 'false');

    // mobile: tapping a top-level item slides in its panel instead of navigating
    link?.addEventListener('click', (e) => {
      if (isDesktop.matches) return;
      e.preventDefault();
      list.querySelectorAll(':scope > .is-open').forEach((open) => open.classList.remove('is-open'));
      li.classList.add('is-open');
      list.classList.add('is-drilled');
    });

    // desktop: hover / keyboard focus opens the flyout
    li.addEventListener('mouseenter', () => {
      if (!isDesktop.matches) return;
      li.classList.add('is-open');
      link?.setAttribute('aria-expanded', 'true');
    });
    li.addEventListener('mouseleave', () => {
      if (!isDesktop.matches) return;
      li.classList.remove('is-open');
      link?.setAttribute('aria-expanded', 'false');
    });
    li.addEventListener('focusin', () => {
      if (!isDesktop.matches) return;
      li.classList.add('is-open');
      link?.setAttribute('aria-expanded', 'true');
    });
    li.addEventListener('focusout', (e) => {
      if (!isDesktop.matches || li.contains(e.relatedTarget)) return;
      li.classList.remove('is-open');
      link?.setAttribute('aria-expanded', 'false');
    });

    [...sub.children].forEach((subLi) => {
      subLi.classList.add('nav-sub-item');
      const subLink = subLi.querySelector(':scope > a');
      const subList = subLi.querySelector(':scope > ul');
      if (!subList) return;
      subLi.classList.add('nav-sub-drop');
      subList.classList.add('nav-flyout-2');
      // mobile accordion toggle (chevron); the label stays a navigable link
      const toggle = el('button', 'nav-sub-toggle');
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', textOf(subLink));
      toggle.addEventListener('click', () => {
        const open = !subLi.classList.contains('is-open');
        subLi.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
      });
      subLi.prepend(toggle);
      subLi.addEventListener('mouseenter', () => {
        if (isDesktop.matches) subLi.classList.add('is-open');
      });
      subLi.addEventListener('mouseleave', () => {
        if (isDesktop.matches) subLi.classList.remove('is-open');
      });
      subLi.addEventListener('focusin', () => {
        if (isDesktop.matches) subLi.classList.add('is-open');
      });
      subLi.addEventListener('focusout', (e) => {
        if (isDesktop.matches && !subLi.contains(e.relatedTarget)) subLi.classList.remove('is-open');
      });
    });
  });

  backBtn.addEventListener('click', () => {
    list.classList.remove('is-drilled');
    list.querySelectorAll(':scope > .is-open').forEach((open) => open.classList.remove('is-open'));
  });
  return list;
}

/**
 * Builds the search panel (form) from the authored search link and label.
 * @param {Element} section search section of the fragment
 * @param {string} closeLabel authored close label
 */
function buildSearch(section, closeLabel) {
  const link = section.querySelector('a');
  const label = [...section.querySelectorAll('p')].map(textOf).find((t) => t && t !== textOf(link));
  const url = new URL(link.href);
  const param = [...url.searchParams.keys()][0] || 'q';

  const form = el('form', 'nav-search-form');
  form.action = `${url.origin}${url.pathname}`;
  form.method = 'get';
  form.setAttribute('role', 'search');
  const inputId = 'nav-search-input';
  const lbl = el('label', 'nav-search-label', label);
  lbl.htmlFor = inputId;
  const input = el('input', 'nav-search-input');
  input.type = 'search';
  input.name = param;
  input.id = inputId;
  const submit = el('button', 'button primary nav-search-submit', textOf(link));
  submit.type = 'submit';
  form.append(lbl, el('div', 'nav-search-row', el('div', 'nav-search-field', input), submit));

  const close = el('button', 'nav-search-close');
  close.type = 'button';
  close.setAttribute('aria-label', closeLabel);
  return el('div', 'nav-search', el('div', 'nav-search-inner', form, close));
}

function searchToggle(text) {
  const btn = el('button', 'nav-search-toggle', text);
  btn.type = 'button';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'nav-search');
  return btn;
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;
  convertIconTokens(fragment);
  decorateIcons(fragment);

  const [brandSec, utilitySec, navSec, searchSec, labelSec] = [...fragment.children];
  const labels = labelSec ? [...labelSec.querySelectorAll('li')].map(textOf) : [];
  const [menuLabel = '', closeLabel = '', backLabel = ''] = labels;

  const nav = el('nav');
  nav.id = 'nav';

  // row 1: hamburger | brand | utility links + CTAs
  const hamburger = el('button', 'nav-hamburger', el('span', 'nav-hamburger-icon'), el('span', 'nav-hamburger-label', menuLabel));
  hamburger.type = 'button';
  hamburger.setAttribute('aria-controls', 'nav-main');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.dataset.openLabel = menuLabel;
  hamburger.dataset.closeLabel = closeLabel;
  hamburger.setAttribute('aria-label', menuLabel);

  const brand = el('div', 'nav-brand', ...(brandSec ? [...brandSec.querySelectorAll('a')] : []));

  const utilityList = utilitySec?.querySelector('ul');
  utilityList?.classList.add('nav-utility-links');
  const ctaLinks = utilitySec ? [...utilitySec.querySelectorAll(':scope > p a')] : [];
  ctaLinks.forEach((a) => {
    a.className = a.closest('strong') ? 'button primary' : 'button secondary';
  });
  const [primaryCta, ...otherCtas] = ctaLinks;
  const utility = el('div', 'nav-utility', utilityList, primaryCta);
  const login = el('div', 'nav-login', ...otherCtas);

  const bar = el('div', 'nav-bar', el('div', 'nav-bar-inner', hamburger, brand, utility, login));

  // row 2: sections + search toggle; on mobile this is the slide-out menu
  const navList = navSec?.querySelector('ul');
  const sections = navList ? buildSections(navList, backLabel) : el('ul', 'nav-sections');
  const searchText = textOf(searchSec?.querySelector('a'));
  const desktopSearch = searchToggle(searchText);
  desktopSearch.classList.add('nav-search-toggle-desktop');

  // mobile drawer footer: search toggle, utility links, primary CTA (clones of authored content)
  const drawerTools = el('div', 'nav-drawer-tools');
  const drawerSearch = searchToggle(searchText);
  drawerTools.append(el('ul', 'nav-drawer-links', el('li', '', drawerSearch)));
  if (utilityList) {
    [...utilityList.children].forEach((li) => drawerTools.firstChild.append(li.cloneNode(true)));
  }
  if (primaryCta) drawerTools.append(primaryCta.cloneNode(true));

  const main = el('div', 'nav-main', el('div', 'nav-main-inner', sections, desktopSearch), drawerTools);
  main.id = 'nav-main';

  const search = searchSec ? buildSearch(searchSec, closeLabel) : null;
  if (search) search.id = 'nav-search';

  nav.append(bar, main, search);
  const wrapper = el('div', 'nav-wrapper', nav, el('div', 'nav-overlay'));
  block.append(wrapper);

  hamburger.addEventListener('click', () => setMobileMenu(nav, !nav.classList.contains('menu-open')));
  nav.querySelectorAll('.nav-search-toggle').forEach((btn) => {
    btn.addEventListener('click', () => setSearch(nav, !nav.classList.contains('search-open')));
  });
  search?.querySelector('.nav-search-close').addEventListener('click', () => setSearch(nav, false));
  wrapper.querySelector('.nav-overlay').addEventListener('click', () => setSearch(nav, false));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (nav.classList.contains('search-open')) setSearch(nav, false);
    else if (nav.classList.contains('menu-open')) setMobileMenu(nav, false);
    else closeAll(nav);
  });

  // reset state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    setMobileMenu(nav, false);
    setSearch(nav, false);
  });
}
