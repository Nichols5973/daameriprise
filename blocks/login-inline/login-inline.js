import { toClassName } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

/**
 * Login (inline) block.
 *
 * Authored structure:
 *   Row 1: title (e.g. "Log in to your account")
 *   Key/value rows (key cell | value cell), all optional:
 *     action        | URL the form posts to
 *     user id       | label for the user ID field
 *     password      | label for the password field
 *     show          | label for the show-password toggle
 *     hide          | label for the toggle while the password is visible
 *     remember      | label for the "remember" checkbox
 *     remember help | help text revealed by the info button next to "remember"
 *     submit        | label for the submit button
 *     forgot        | link shown under the password field
 *     new user      | link shown next to the submit button
 *   Any other row containing links is rendered in the links area.
 *
 * All user-facing text comes from authored content; a field whose label is
 * not authored is not rendered (user ID / password / submit always render).
 *
 * @param {Element} block The login-inline block element
 */

const KEY_ALIASES = {
  action: 'action',
  'form-action': 'action',
  'user-id': 'username',
  username: 'username',
  'user-name': 'username',
  password: 'password',
  show: 'show',
  'show-password': 'show',
  hide: 'hide',
  'hide-password': 'hide',
  remember: 'remember',
  'remember-me': 'remember',
  'remember-user-id': 'remember',
  'remember-help': 'rememberHelp',
  'remember-info': 'rememberHelp',
  submit: 'submit',
  'log-in': 'submit',
  login: 'submit',
  button: 'submit',
  forgot: 'forgot',
  'forgot-password': 'forgot',
  'new-user': 'register',
  register: 'register',
};

let instanceCount = 0;

function parseRows(block) {
  const config = {};
  const extraLinks = [];
  let title = null;

  [...block.children].forEach((row, index) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = KEY_ALIASES[toClassName(cells[0].textContent)];
      if (key) {
        config[key] = cells[1];
        return;
      }
    }
    if (index === 0 && !title) {
      title = cells[0] || row;
      return;
    }
    row.querySelectorAll('a[href]').forEach((a) => extraLinks.push(a));
  });

  return { config, extraLinks, title };
}

const textOf = (cell) => (cell ? cell.textContent.trim() : '');

function buildField(id, type, name, labelText, autocomplete) {
  const field = createTag('div', { class: `login-inline-field login-inline-field-${name}` });
  const label = createTag('label', { for: id, class: 'login-inline-label' }, labelText);
  const input = createTag('input', {
    id,
    type,
    name,
    autocomplete,
    required: '',
    class: 'login-inline-input',
  });
  field.append(label, input);
  return { field, input };
}

function cleanLink(link) {
  link.classList.remove('button', 'primary', 'secondary');
  const container = link.closest('.button-container');
  if (container) container.classList.remove('button-container');
  link.classList.add('login-inline-link');
  return link;
}

export default function decorate(block) {
  instanceCount += 1;
  const uid = `login-inline-${instanceCount}`;
  const { config, extraLinks, title } = parseRows(block);

  // Header with collapsible toggle
  const header = createTag('div', { class: 'login-inline-header' });
  const panelId = `${uid}-panel`;
  const titleText = textOf(title);
  const heading = title?.querySelector('h1, h2, h3, h4, h5, h6');
  const headingTag = heading ? heading.tagName.toLowerCase() : 'h2';
  const toggle = createTag('button', {
    type: 'button',
    class: 'login-inline-toggle',
    'aria-expanded': 'true',
    'aria-controls': panelId,
  }, [
    createTag('span', { class: 'login-inline-toggle-icon', 'aria-hidden': 'true' }),
    createTag('span', { class: 'login-inline-title-text' }, titleText),
  ]);
  header.append(createTag(headingTag, { class: 'login-inline-title' }, toggle));

  // Form
  const form = createTag('form', { class: 'login-inline-form', id: panelId, method: 'post' });
  const action = config.action?.querySelector('a[href]')?.href || textOf(config.action);
  if (action) form.setAttribute('action', action);

  const user = buildField(`${uid}-username`, 'text', 'username', textOf(config.username), 'username');
  const pass = buildField(`${uid}-password`, 'password', 'password', textOf(config.password), 'current-password');

  const userGroup = createTag('div', { class: 'login-inline-group login-inline-group-user' }, user.field);
  const passGroup = createTag('div', { class: 'login-inline-group login-inline-group-password' }, pass.field);

  // Show/hide password toggle
  const showLabel = textOf(config.show);
  if (showLabel) {
    const hideLabel = textOf(config.hide) || showLabel;
    const showBtn = createTag('button', {
      type: 'button',
      class: 'login-inline-show',
      'aria-controls': pass.input.id,
      'aria-pressed': 'false',
    }, showLabel);
    showBtn.addEventListener('click', () => {
      const visible = pass.input.type === 'password';
      pass.input.type = visible ? 'text' : 'password';
      showBtn.setAttribute('aria-pressed', visible ? 'true' : 'false');
      showBtn.textContent = visible ? hideLabel : showLabel;
    });
    pass.field.append(showBtn);
  }

  // Remember checkbox (+ optional help toggletip)
  const rememberLabel = textOf(config.remember);
  if (rememberLabel) {
    const remember = createTag('div', { class: 'login-inline-remember' });
    const checkboxId = `${uid}-remember`;
    remember.append(
      createTag('input', {
        type: 'checkbox', id: checkboxId, name: 'remember', class: 'login-inline-checkbox',
      }),
      createTag('label', { for: checkboxId }, rememberLabel),
    );
    const helpText = textOf(config.rememberHelp);
    if (helpText) {
      const helpId = `${uid}-remember-help`;
      const help = createTag('p', { id: helpId, class: 'login-inline-help', hidden: '' }, helpText);
      const infoBtn = createTag('button', {
        type: 'button',
        class: 'login-inline-info',
        'aria-expanded': 'false',
        'aria-controls': helpId,
        'aria-label': helpText,
      });
      infoBtn.addEventListener('click', () => {
        const open = infoBtn.getAttribute('aria-expanded') === 'true';
        infoBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
        help.hidden = open;
      });
      remember.append(infoBtn, help);
    }
    userGroup.append(remember);
  }

  const forgotLink = config.forgot?.querySelector('a[href]');
  if (forgotLink) passGroup.append(cleanLink(forgotLink));

  const actions = createTag('div', { class: 'login-inline-actions' });
  const submit = createTag('button', { type: 'submit', class: 'login-inline-submit button secondary' }, textOf(config.submit));
  actions.append(submit);

  const links = [config.register?.querySelector('a[href]'), ...extraLinks].filter(Boolean);
  if (links.length) {
    const linkList = createTag('ul', { class: 'login-inline-links' });
    links.forEach((link) => linkList.append(createTag('li', {}, cleanLink(link))));
    actions.append(linkList);
  }

  form.append(userGroup, passGroup, actions);

  const setExpanded = (expanded) => {
    toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    form.hidden = !expanded;
  };

  toggle.addEventListener('click', () => {
    setExpanded(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Expanded on desktop; collapsed to just the header bar on smaller screens
  const desktop = window.matchMedia('(width >= 900px)');
  setExpanded(desktop.matches);
  desktop.addEventListener('change', (e) => setExpanded(e.matches));

  if (!titleText) header.hidden = true;
  block.replaceChildren(header, form);
}
