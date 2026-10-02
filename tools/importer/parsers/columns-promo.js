/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-promo. Base: columns. Source: https://www.ameriprise.com/
 * Selector: .component-wrapper > .component-loaded > div > section.Promo-redesign (2 instances)
 *
 * Output: 1 row x 2 cells - image cell + text cell (eyebrow p, h3, p, CTA link).
 * Cell order follows the desktop visual order of the source:
 *   - image column carrying `u-flexOrderFirst` (desktop) -> image cell first
 *   - otherwise source DOM order (text first, image second)
 * Variant: light-purple card (`u-bgColorPurpleLight*`) -> `columns-promo (purple)`.
 *
 * Source selectors (validated against block-context/columns-promo/source.html + instances/01.html):
 *   .Promo-content                 - the two columns
 *   .Promo-image img               - image
 *   .u-textEyebrow                 - eyebrow
 *   h2/h3, .Content p, a[href]     - heading, body, CTA
 */
export default function parse(element, { document }) {
  const columns = [...element.querySelectorAll('.Promo-content')];
  const imageCol = columns.find((c) => c.querySelector('.Promo-image, picture, img'))
    || null;
  const textCol = columns.find((c) => c !== imageCol && c.querySelector('h1, h2, h3, h4, p'))
    || element;

  const img = imageCol ? imageCol.querySelector('img') : null;

  const textCell = [];
  const eyebrow = textCol.querySelector('.u-textEyebrow');
  if (eyebrow && eyebrow.textContent.trim()) {
    const p = document.createElement('p');
    p.innerHTML = eyebrow.innerHTML;
    textCell.push(p);
  }
  const heading = textCol.querySelector('h1, h2, h3, h4');
  if (heading) textCell.push(heading);
  [...textCol.querySelectorAll('p')]
    .filter((p) => p !== eyebrow && p.textContent.trim())
    .forEach((p) => textCell.push(p));
  [...textCol.querySelectorAll('a[href]')]
    .filter((a) => a.textContent.trim() && !a.closest('p'))
    .forEach((a) => {
      const p = document.createElement('p');
      // Primary (filled) buttons are bold in EDS authoring
      if (/Button--primary/.test(a.className)) {
        const strong = document.createElement('strong');
        strong.append(a);
        p.append(strong);
      } else {
        p.append(a);
      }
      textCell.push(p);
    });

  if (!heading && !img) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Desktop order: image first only when its column is ordered first at lg (u-flexOrderFirst)
  const imageFirst = !!imageCol && imageCol.classList.contains('u-flexOrderFirst');
  const imageCell = img ? [img] : '';
  const row = imageFirst ? [imageCell, textCell] : [textCell, imageCell];
  const cells = [row];

  const isPurple = !!element.querySelector('[class*="u-bgColorPurple"]');
  let block;
  if (isPurple) {
    block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo (purple)', cells });
  } else {
    block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  }
  element.replaceWith(block);
}
