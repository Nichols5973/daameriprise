import { createTag } from '../../scripts/shared.js';

/**
 * Returns the icon element (an EDS `span.icon` or a `<picture>`) when the node
 * contains nothing but that icon, otherwise null.
 * @param {Node} node A child node of a block cell
 * @returns {Element|null}
 */
function getIcon(node) {
  if (node.nodeType !== Node.ELEMENT_NODE || node.textContent.trim() !== '') return null;
  if (node.matches('span.icon, picture')) return node;
  const icons = node.querySelectorAll('span.icon, picture');
  if (icons.length !== 1) return null;
  // the node must hold only the icon (e.g. <p><span class="icon">…</span></p>)
  return node.children.length === 1 ? icons[0] : null;
}

/**
 * Cards (icon) block.
 *
 * Authored structure: one row per item, 2 cells.
 *   Cell 1: icon (`:icon-name:` token, rendered as span.icon) or image
 *   Cell 2: bold label text (optionally a description and/or link)
 * A single-cell row is also accepted (icon and text in the same cell).
 *
 * @param {Element} block The cards-icon block element
 */
export default function decorate(block) {
  const list = createTag('ul', { class: 'cards-icon-list' });

  [...block.children].forEach((row) => {
    const item = createTag('li', { class: 'cards-icon-item' });
    const icon = createTag('div', { class: 'cards-icon-icon' });
    const body = createTag('div', { class: 'cards-icon-body' });

    [...row.children].forEach((cell) => {
      [...cell.childNodes].forEach((node) => {
        const iconEl = !icon.children.length && getIcon(node);
        if (iconEl) {
          const img = iconEl.querySelector('img');
          if (img && !img.hasAttribute('alt')) img.alt = '';
          icon.append(iconEl);
        } else if (node.nodeType === Node.ELEMENT_NODE || node.textContent.trim()) {
          body.append(node);
        }
      });
    });

    if (icon.children.length) item.append(icon);
    if (body.childNodes.length) item.append(body);
    if (item.children.length) list.append(item);
  });

  block.replaceChildren(list);
}
