/**
 * Hero (facet) block.
 *
 * Authored structure (one column):
 *   Row 1: background image (decorative pattern)
 *   Row 2: foreground image (e.g. portrait), heading, paragraph(s), CTA link(s)
 *
 * The foreground image may also be authored in its own cell or row; any row
 * that contains only a picture after the first is treated as foreground media.
 *
 * @param {Element} block The hero-facet block element
 */
export default function decorate(block) {
  // white text and white outline buttons (global .on-dark button styles)
  block.classList.add('on-dark');

  const rows = [...block.children];
  const isPictureOnly = (el) => {
    const pictures = el.querySelectorAll('picture');
    return pictures.length === 1 && el.textContent.trim() === '';
  };

  const background = document.createElement('div');
  background.className = 'hero-facet-background';

  const content = document.createElement('div');
  content.className = 'hero-facet-content';

  const text = document.createElement('div');
  text.className = 'hero-facet-text';

  const media = document.createElement('div');
  media.className = 'hero-facet-media';

  rows.forEach((row, rowIndex) => {
    if (rowIndex === 0 && isPictureOnly(row)) {
      const picture = row.querySelector('picture');
      const img = picture.querySelector('img');
      if (img) img.alt = img.alt || '';
      background.append(picture);
      return;
    }

    [...row.children].forEach((cell) => {
      [...cell.children].forEach((child) => {
        const picture = child.tagName === 'PICTURE' ? child : child.querySelector('picture');
        if (picture && child.textContent.trim() === '') {
          media.append(picture);
        } else {
          text.append(child);
        }
      });
    });
  });

  content.append(text);
  if (media.children.length) {
    content.append(media);
  } else {
    block.classList.add('hero-facet-no-media');
  }

  const children = [content];
  if (background.children.length) {
    children.unshift(background);
  } else {
    block.classList.add('hero-facet-no-background');
  }

  block.replaceChildren(...children);
}
