/**
 * Columns (divider) block.
 *
 * Authored structure: one or more rows, each with N cells. Each cell holds an
 * optional icon (an `:icon-name:` token, rendered as `span.icon`, or an image),
 * a heading, a paragraph and a link/button. Columns are separated by a
 * divider rule.
 *
 * @param {Element} block The columns-divider block element
 */

/**
 * Finds the icon element of a column: a paragraph holding only a `span.icon`,
 * or the first picture in the column.
 * @param {Element} col The column element
 * @returns {Element|null} The element to mark as the column icon
 */
function findIcon(col) {
  const iconSpan = col.querySelector('span.icon');
  if (iconSpan) {
    const wrapper = iconSpan.parentElement;
    if (wrapper && wrapper !== col && wrapper.textContent.trim() === ''
      && wrapper.children.length === 1) {
      return wrapper;
    }
  }

  const picture = col.querySelector('picture');
  if (!picture) return null;
  const img = picture.querySelector('img');
  if (img && !img.hasAttribute('alt')) img.alt = '';
  const wrapper = picture.parentElement;
  if (wrapper && wrapper !== col && wrapper.textContent.trim() === '') return wrapper;
  const icon = document.createElement('div');
  picture.replaceWith(icon);
  icon.append(picture);
  return icon;
}

export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const colCount = firstRow ? firstRow.children.length : 0;
  if (colCount) block.classList.add(`columns-divider-${colCount}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-divider-row');
    [...row.children].forEach((col) => {
      col.classList.add('columns-divider-col');
      const icon = findIcon(col);
      if (icon) icon.classList.add('columns-divider-icon');
    });
  });
}
