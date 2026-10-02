import { toClassName } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

/**
 * Tabs (split) block - self-contained; does not use the section-based
 * `tabs` block or the dynamic tab loader.
 *
 * Authored structure: one row per tab.
 *   Cell 1: tab label
 *   Cell 2: panel content - image (or video poster image + video link),
 *           heading, paragraph(s), optional CTA
 *   Cell 3 (optional): note shown below the panel
 *
 * In each panel, images (and a link that directly follows an image) form the
 * media side; everything else forms the text side.
 *
 * @param {Element} block The tabs-split block element
 */

let instanceCount = 0;

const isPictureOnly = (el) => !!el.querySelector('picture') && el.textContent.trim() === '';
const isLinkOnly = (el) => {
  const links = el.querySelectorAll('a[href]');
  return links.length === 1 && el.textContent.trim() === links[0].textContent.trim();
};

function buildPanelContent(cell) {
  const text = createTag('div', { class: 'tabs-split-text' });
  const media = createTag('div', { class: 'tabs-split-media' });
  let lastWasMedia = false;

  [...cell.children].forEach((child) => {
    if (child.tagName === 'PICTURE' || isPictureOnly(child)) {
      media.append(child);
      lastWasMedia = true;
    } else if (lastWasMedia && isLinkOnly(child)) {
      // Video (or media) link authored right after its poster image
      const link = child.querySelector('a[href]');
      const picture = media.lastElementChild?.querySelector('picture')
        || (media.lastElementChild?.tagName === 'PICTURE' ? media.lastElementChild : null);
      link.classList.remove('button', 'primary', 'secondary');
      if (picture) {
        const label = createTag('span', { class: 'tabs-split-media-label' });
        while (link.firstChild) label.append(link.firstChild);
        link.append(picture, label);
        link.classList.add('tabs-split-media-link');
        media.lastElementChild.replaceWith(link);
      } else {
        media.append(link);
      }
      media.classList.add('tabs-split-media-linked');
      lastWasMedia = false;
    } else {
      text.append(child);
      lastWasMedia = false;
    }
  });

  return { text, media };
}

function selectTab(tabs, index, focus = false) {
  tabs.forEach(({ button, panel, note }, i) => {
    const selected = i === index;
    button.setAttribute('aria-selected', selected ? 'true' : 'false');
    button.tabIndex = selected ? 0 : -1;
    panel.hidden = !selected;
    if (note) note.hidden = !selected;
  });
  if (focus) tabs[index].button.focus();
}

export default function decorate(block) {
  instanceCount += 1;
  const uid = `tabs-split-${instanceCount}`;

  const tabList = createTag('div', { class: 'tabs-split-list', role: 'tablist' });
  const panels = createTag('div', { class: 'tabs-split-panels' });
  const notes = createTag('div', { class: 'tabs-split-notes' });
  const tabs = [];

  [...block.children].forEach((row, index) => {
    const [labelCell, contentCell, noteCell] = [...row.children];
    if (!labelCell) return;
    const labelText = labelCell.textContent.trim();
    const slug = toClassName(labelText) || String(index + 1);
    const buttonId = `${uid}-tab-${slug}`;
    const panelId = `${uid}-panel-${slug}`;

    const button = createTag('button', {
      type: 'button',
      role: 'tab',
      id: buttonId,
      class: 'tabs-split-tab',
      'aria-controls': panelId,
    }, labelText);

    const panel = createTag('div', {
      role: 'tabpanel',
      id: panelId,
      class: 'tabs-split-panel',
      'aria-labelledby': buttonId,
      tabindex: '0',
    });

    if (contentCell) {
      const { text, media } = buildPanelContent(contentCell);
      if (text.children.length) panel.append(text);
      if (media.children.length) panel.append(media);
      else panel.classList.add('tabs-split-panel-no-media');
    }

    let note = null;
    if (noteCell && noteCell.textContent.trim()) {
      note = createTag('div', { class: 'tabs-split-note' });
      while (noteCell.firstChild) note.append(noteCell.firstChild);
      notes.append(note);
    }

    tabList.append(button);
    panels.append(panel);
    tabs.push({ button, panel, note });
  });

  if (!tabs.length) return;

  tabs.forEach(({ button }, index) => {
    button.addEventListener('click', () => selectTab(tabs, index));
    button.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      selectTab(tabs, next, true);
    });
  });

  selectTab(tabs, 0);

  const children = [tabList, panels];
  if (notes.children.length) children.push(notes);
  block.replaceChildren(...children);
}
