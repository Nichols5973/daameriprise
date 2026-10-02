/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-split. Base: tabs. Source: https://www.ameriprise.com/
 * Selector: .HorizontalTabs
 *
 * Output: one row per tab, 3 cells:
 *   cell 1: tab label
 *   cell 2: panel content - image (or video poster image followed by a link-only paragraph
 *           pointing at the video = clickable video poster), h3, p(s), optional CTA
 *   cell 3: optional note paragraph shown below the panel (panel <footer>), '' when absent
 *
 * Source selectors (validated against block-context/tabs-split/source.html):
 *   .HorizontalTabs-tabItem .HorizontalTabs-tabLabel   - tab labels (paired with panels by index)
 *   .HorizontalTabs-panel                               - panels
 *   .Promo-content (.Promo-image img | .video-poster img) - media column
 *   .Promo-content h3 / .Content p / .video-description - text column
 *   :scope > footer .Content                            - note
 * Hidden panels (Online Access, Security) keep their absolute source image URLs.
 *
 * Brightcove: the player is injected only after the poster is clicked, so data-video-id is
 * normally absent from the DOM the importer sees. Use it when present; otherwise fall back to
 * KNOWN_VIDEOS (poster asset GUID -> videoId, captured by inspecting the live player).
 */
const BRIGHTCOVE_DEFAULT = { account: '1625296066001', player: 'k4UdWzLO6n' };
const KNOWN_VIDEOS = {
  // "Two minutes on the Investment Research Group" (homepage Insights tab)
  '95313529-11c4-4fa2-a6c5-6fd77040878b': '6372032007112',
};

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

function videoUrl(panel, posterImg) {
  const vid = panel.querySelector('[data-video-id]');
  let account = BRIGHTCOVE_DEFAULT.account;
  let player = BRIGHTCOVE_DEFAULT.player;
  let videoId = null;
  if (vid) {
    videoId = vid.getAttribute('data-video-id');
    account = vid.getAttribute('data-account') || account;
    player = vid.getAttribute('data-player') || player;
  } else if (posterImg) {
    const src = posterImg.getAttribute('src') || '';
    const m = src.match(/\/static\/(\d+)\/([0-9a-f-]{36})\//i);
    if (m) {
      account = m[1];
      videoId = KNOWN_VIDEOS[m[2]] || null;
    }
  }
  if (!videoId) return null;
  return `https://players.brightcove.net/${account}/${player}_default/index.html?videoId=${videoId}`;
}

function buildPanelCell(document, panel) {
  const cell = [];
  const section = panel.querySelector('section') || panel;

  // Media first (image or video poster [+ video link])
  const poster = section.querySelector('.video-poster img, .vc-video-container img');
  const image = poster || section.querySelector('.Promo-image img, picture img, img');
  const textCol = [...section.querySelectorAll('.Promo-content')]
    .find((c) => c.querySelector('h1, h2, h3, h4')) || section;

  if (image) {
    cell.push(image);
    if (poster) {
      const url = videoUrl(panel, poster);
      if (url) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = url;
        const heading = textCol.querySelector('h1, h2, h3, h4');
        a.textContent = clean(heading && heading.textContent) || url;
        p.append(a);
        cell.push(p);
      }
    }
  }

  // Text column
  const heading = textCol.querySelector('h1, h2, h3, h4');
  if (heading) {
    const h = document.createElement(heading.tagName.toLowerCase());
    h.innerHTML = heading.innerHTML.trim();
    cell.push(h);
  }
  textCol.querySelectorAll('a[href]').forEach((a) => { if (a.href) a.setAttribute('href', a.href); });
  [...textCol.querySelectorAll('p')]
    .filter((p) => clean(p.textContent) && !p.closest('footer'))
    .forEach((p) => {
      if (p.querySelector('span')) {
        // video description: flatten <span>s into a single paragraph
        const np = document.createElement('p');
        np.textContent = clean(p.textContent);
        cell.push(np);
      } else {
        cell.push(p);
      }
    });
  [...textCol.querySelectorAll('a[href]')]
    .filter((a) => !a.closest('p') && clean(a.textContent))
    .forEach((a) => {
      const p = document.createElement('p');
      p.append(a);
      cell.push(p);
    });
  return cell;
}

function buildNote(document, panel) {
  const note = panel.querySelector(':scope > footer .Content, :scope > footer');
  if (!note || !clean(note.textContent)) return '';
  const p = document.createElement('p');
  const inner = note.querySelector(':scope > div') || note;
  // Resolve relative hrefs against the source page before moving the nodes
  inner.querySelectorAll('a[href]').forEach((a) => { if (a.href) a.setAttribute('href', a.href); });
  p.append(...inner.childNodes);
  return p;
}

export default function parse(element, { document }) {
  const labels = [...element.querySelectorAll('.HorizontalTabs-tabItem')]
    .map((t) => clean((t.querySelector('.HorizontalTabs-tabLabel') || t).textContent));
  const panels = [...element.querySelectorAll('.HorizontalTabs-panel')];

  if (!panels.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = panels.map((panel, i) => [
    labels[i] || `${i + 1}`,
    buildPanelCell(document, panel),
    buildNote(document, panel),
  ]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-split', cells });
  element.replaceWith(block);
}
