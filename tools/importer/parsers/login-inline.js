/* eslint-disable */
/* global WebImporter */
/**
 * Parser for login-inline. Base: login (custom). Source: https://www.ameriprise.com/
 * Selector: .LoginClient .wam-login-comp
 *
 * Output (contract from blocks/login-inline/metadata.json):
 *   Row 1: title ("Log in to your account")
 *   Key/value rows (2 cols):  action | user id | password | show | hide | remember | remember help |
 *                             submit | forgot (link) | new user (link)
 * Rows are only emitted when the label/link exists in the source DOM - no hard-coded text.
 *
 * Source selectors (validated against block-context/login-inline/source.html):
 *   .Card-headerTitle                         - title
 *   .wam-login-input (#w-lg-username / #w-lg-password) .Input-label - field labels
 *   a.password-toggle-btn                     - show-password toggle label
 *   .customLoginCheckbox p                    - remember label
 *   #w-lg-login_submit                        - submit label
 *   a#w-lg-forgot_username                    - forgot link
 *   a#w-lg-new_user                           - new user link
 */
const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

function fieldLabel(element, inputSelector, index) {
  const input = element.querySelector(inputSelector);
  let label = null;
  if (input) {
    if (input.id) label = element.querySelector(`label[for="${input.id}"]`);
    if (!label) label = input.closest('.Input-group, .wam-login-input')?.querySelector('label');
  }
  if (!label) {
    const groups = element.querySelectorAll('.wam-login-input');
    label = groups[index]?.querySelector('label');
  }
  return text(label);
}

export default function parse(element, { document }) {
  const title = text(element.querySelector('.Card-headerTitle, .Card-header h2, .Card-header h3, .Card-header p'));

  const userLabel = fieldLabel(element, '#w-lg-username, input[name="username"], input[type="text"]', 0);
  const passLabel = fieldLabel(element, '#w-lg-password, input[name="password"], input[type="password"]', 1);

  const toggle = element.querySelector('.password-toggle-btn');
  const showLabel = text(toggle);
  const hideLabel = toggle ? (toggle.getAttribute('data-hide-label') || '').trim() : '';

  const rememberWrap = element.querySelector('.customLoginCheckbox, [id*="rememberId-tooltip"]');
  // Checkbox glyph is an <img> (cleaned) or <svg> (live) in a sibling span - take the <p> label text.
  const rememberLabel = text(rememberWrap?.querySelector('label p'))
    || text(rememberWrap?.querySelector('label'));
  const helpEl = rememberWrap?.querySelector('[role="tooltip"], .Tooltip-content, .tooltip-content');
  const rememberHelp = text(helpEl);

  const submitBtn = element.querySelector('#w-lg-login_submit')
    || element.querySelector('form button[type="submit"], form button.Button');
  const submitLabel = text(submitBtn);

  const forgot = element.querySelector('#w-lg-forgot_username')
    || [...element.querySelectorAll('a[href]')].find((a) => /forgot/i.test(a.textContent));
  const newUser = element.querySelector('#w-lg-new_user')
    || [...element.querySelectorAll('a[href]')].find((a) => /new user|register/i.test(a.textContent) && a !== forgot);

  const form = element.querySelector('form');
  const action = form && form.getAttribute('action') ? form.action || form.getAttribute('action') : '';

  if (!title && !userLabel && !submitLabel) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (title) cells.push([title, '']);
  if (action) cells.push(['action', action]);
  if (userLabel) cells.push(['user id', userLabel]);
  if (passLabel) cells.push(['password', passLabel]);
  if (showLabel) cells.push(['show', showLabel]);
  if (hideLabel) cells.push(['hide', hideLabel]);
  if (rememberLabel) cells.push(['remember', rememberLabel]);
  if (rememberHelp) cells.push(['remember help', rememberHelp]);
  if (submitLabel) cells.push(['submit', submitLabel]);
  if (forgot) {
    const a = document.createElement('a');
    a.href = forgot.href || forgot.getAttribute('href');
    a.textContent = text(forgot);
    cells.push(['forgot', a]);
  }
  if (newUser) {
    const a = document.createElement('a');
    a.href = newUser.href || newUser.getAttribute('href');
    a.textContent = text(newUser);
    cells.push(['new user', a]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'login-inline', cells });
  element.replaceWith(block);
}
