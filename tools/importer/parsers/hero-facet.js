/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-facet. Base: hero. Source: https://www.ameriprise.com/
 * Selector: section.ComplexHero
 *
 * Output (1 column):
 *   Row 1: background image (blue facet pattern)
 *   Row 2: foreground portrait image, h1, paragraph(s), CTA link(s)
 *
 * Source selectors (validated against block-context/hero-facet/source.html):
 *   .ComplexHero-background img (fallback .ComplexHero-topWrapperFacet img) - background facet
 *   .ComplexHero-featuredImage img - portrait
 *   .ComplexHero-content h1 / p / a.Button
 */
/**
 * The live facet background is an <img src="...light-blue.svg">. helix-importer's convertIcons
 * rule turns any img whose src ends with ".svg" into an :icon: token, which would lose the
 * background image. Append a URL fragment so the asset is kept as an image (fragment is never
 * sent to the server, so the downloaded file is unchanged).
 */
function keepSvgAsImage(img) {
  const src = img && img.getAttribute('src');
  if (src && /\.svg$/i.test(src)) img.setAttribute('src', `${img.src || src}#image`);
  return img;
}

export default function parse(element, { document }) {
  const bgImg = keepSvgAsImage(element.querySelector('.ComplexHero-background img')
    || element.querySelector('.ComplexHero-topWrapperFacet img'));
  const fgImg = element.querySelector('.ComplexHero-featuredImage img');

  const content = element.querySelector('.ComplexHero-content') || element;
  const heading = content.querySelector('h1, h2');
  const paragraphs = [...content.querySelectorAll('p')].filter((p) => p.textContent.trim());
  const ctas = [...content.querySelectorAll('a')].filter((a) => a.textContent.trim());

  if (!heading && !paragraphs.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (bgImg) cells.push([bgImg]);

  const contentCell = [];
  if (fgImg) contentCell.push(fgImg);
  if (heading) contentCell.push(heading);
  paragraphs.forEach((p) => contentCell.push(p));
  ctas.forEach((a) => {
    const p = document.createElement('p');
    p.append(a);
    contentCell.push(p);
  });
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-facet', cells });
  element.replaceWith(block);
}
