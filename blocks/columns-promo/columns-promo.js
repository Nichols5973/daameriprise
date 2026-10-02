/**
 * Columns (promo) block.
 *
 * Authored structure: 1 row x 2 cells.
 *   Image cell: a single picture (may be the first or the second cell).
 *   Text cell: optional eyebrow paragraph, heading, paragraph(s), link/button.
 *
 * Options (CSS classes):
 *   purple - alternate surface treatment for the card (CSS only; no DOM change).
 *
 * @param {Element} block The columns-promo block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-promo-row');
    const cells = [...row.children];

    cells.forEach((cell, index) => {
      const pictures = cell.querySelectorAll('picture');
      const isMedia = pictures.length > 0 && cell.textContent.trim() === '';

      if (isMedia) {
        cell.classList.add('columns-promo-media');
        if (index === 0) row.classList.add('columns-promo-media-first');
        return;
      }

      cell.classList.add('columns-promo-text');
      const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
      if (!heading) return;
      const children = [...cell.children];
      const headingIndex = children.indexOf(heading);
      const eyebrow = children
        .slice(0, headingIndex)
        .find((el) => el.tagName === 'P' && !el.classList.contains('button-container'));
      if (eyebrow) eyebrow.classList.add('columns-promo-eyebrow');
    });

    if (!row.querySelector('.columns-promo-media')) row.classList.add('columns-promo-no-media');
  });
}
