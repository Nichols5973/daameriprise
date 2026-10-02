import { toClassName } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

/**
 * Advisor search (dark) block.
 *
 * Authored structure:
 *   Row 1: background image (decorative pattern)
 *   Row 2: cell 1: icon (image or :icon: token) + heading ; cell 2: form label text (first
 *          paragraph/heading), then any paragraphs shown below the form
 *          (e.g. appointment text with link)
 *   Key/value rows (key cell | value cell), all optional:
 *     action         | advisor search results URL (link or text)
 *     param          | query parameter name for the ZIP code (default "zip")
 *     placeholder    | input placeholder / floating label text
 *     search         | submit button label
 *     location       | label for the "use my location" button
 *     location error | message shown when the location cannot be determined
 *   Any other single-cell row: note shown below the band (e.g. FINRA note)
 *
 * All user-facing text comes from authored content.
 *
 * @param {Element} block The advisor-search-dark block element
 */

const KEY_ALIASES = {
  action: 'action',
  url: 'action',
  'search-url': 'action',
  param: 'param',
  parameter: 'param',
  placeholder: 'placeholder',
  'input-label': 'placeholder',
  search: 'search',
  submit: 'search',
  button: 'search',
  location: 'location',
  'find-my-location': 'location',
  'location-error': 'locationError',
};

let instanceCount = 0;

const isPictureOnly = (el) => !!el.querySelector('picture') && el.textContent.trim() === '';
// icon paragraph: an authored image or an icon token (span.icon) with no text
const isIconOnly = (el) => el.tagName === 'PICTURE'
  || (!!el.querySelector('picture, .icon') && el.textContent.trim() === '');
const textOf = (cell) => (cell ? cell.textContent.trim() : '');

function parseRows(block) {
  const config = {};
  let background = null;
  let intro = null;
  let panel = null;
  const notes = [];

  [...block.children].forEach((row, index) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = KEY_ALIASES[toClassName(cells[0].textContent)];
      if (key) {
        config[key] = cells[1];
        return;
      }
      if (!panel) {
        [intro, panel] = cells;
        return;
      }
    }
    if (index === 0 && !background && isPictureOnly(row)) {
      background = row.querySelector('picture');
      return;
    }
    if (cells.length === 1 && !panel && isPictureOnly(cells[0])) {
      background = background || cells[0].querySelector('picture');
      return;
    }
    cells.forEach((cell) => notes.push(...cell.childNodes));
  });

  return {
    config, background, intro, panel, notes,
  };
}

function buildForm(uid, config, labelEl) {
  const action = config.action?.querySelector('a[href]')?.href || textOf(config.action);
  const param = textOf(config.param) || 'zip';
  const form = createTag('form', { class: 'advisor-search-dark-form', method: 'get', role: 'search' });
  if (action) form.setAttribute('action', action);

  const inputId = `${uid}-zip`;
  const input = createTag('input', {
    id: inputId,
    type: 'text',
    name: param,
    inputmode: 'numeric',
    pattern: '[0-9]{5}',
    maxlength: '5',
    autocomplete: 'postal-code',
    required: '',
    class: 'advisor-search-dark-input',
  });
  const inputGroup = createTag('div', { class: 'advisor-search-dark-input-group' }, input);

  // authored placeholder becomes a floating label (placeholder=" " drives :placeholder-shown)
  const placeholder = textOf(config.placeholder);
  const labelledBy = [];
  if (labelEl) {
    labelEl.id = labelEl.id || `${uid}-label`;
    labelEl.classList.add('advisor-search-dark-label');
    labelledBy.push(labelEl.id);
    form.append(labelEl);
  }
  if (placeholder) {
    const floatId = `${uid}-float`;
    input.placeholder = ' ';
    inputGroup.append(createTag('label', { id: floatId, for: inputId, class: 'advisor-search-dark-float' }, placeholder));
    labelledBy.push(floatId);
  }
  if (labelledBy.length) input.setAttribute('aria-labelledby', labelledBy.join(' '));

  const field = createTag('div', { class: 'advisor-search-dark-field' }, inputGroup);

  const locationLabel = textOf(config.location);
  if (locationLabel && 'geolocation' in navigator) {
    const errorText = textOf(config.locationError);
    const status = createTag('p', { class: 'advisor-search-dark-status', role: 'status', hidden: '' });
    const locate = createTag('button', { type: 'button', class: 'advisor-search-dark-locate' }, locationLabel);
    locate.addEventListener('click', () => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const url = new URL(action || window.location.href, window.location.href);
          url.searchParams.set('lat', coords.latitude);
          url.searchParams.set('lng', coords.longitude);
          window.location.assign(url.toString());
        },
        () => {
          if (!errorText) return;
          status.textContent = errorText;
          status.hidden = false;
        },
      );
    });
    field.append(createTag('div', { class: 'advisor-search-dark-location' }, [locate, status]));
  }

  const submit = createTag('button', { type: 'submit', class: 'advisor-search-dark-submit button primary' }, textOf(config.search));
  form.append(createTag('div', { class: 'advisor-search-dark-controls' }, [field, submit]));

  return form;
}

export default function decorate(block) {
  instanceCount += 1;
  const uid = `advisor-search-dark-${instanceCount}`;
  const {
    config, background, intro, panel, notes,
  } = parseRows(block);

  const children = [];

  if (background) {
    const img = background.querySelector('img');
    if (img) img.alt = img.alt || '';
    children.push(createTag('div', { class: 'advisor-search-dark-background' }, background));
  }

  const content = createTag('div', { class: 'advisor-search-dark-content' });

  if (intro) {
    const introEl = createTag('div', { class: 'advisor-search-dark-intro' });
    [...intro.children].forEach((child) => {
      if (isIconOnly(child)) {
        child.classList.add('advisor-search-dark-icon');
        child.querySelectorAll('img').forEach((img) => {
          if (!img.hasAttribute('alt')) img.alt = '';
        });
      }
      introEl.append(child);
    });
    content.append(introEl);
  }

  const card = createTag('div', { class: 'advisor-search-dark-card' });
  const panelChildren = panel ? [...panel.children] : [];
  const labelEl = panelChildren.shift() || null;
  card.append(buildForm(uid, config, labelEl));
  if (panelChildren.length) {
    card.append(createTag('div', { class: 'advisor-search-dark-extra' }, panelChildren));
  }
  content.append(card);
  children.push(content);

  const noteNodes = notes.filter((n) => n.nodeType === Node.ELEMENT_NODE || n.textContent.trim());
  if (noteNodes.length) {
    const noteBody = createTag('div', { class: 'advisor-search-dark-note-body' }, noteNodes);
    children.push(createTag('div', { class: 'advisor-search-dark-note' }, noteBody));
  }

  block.replaceChildren(...children);
}
