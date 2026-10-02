/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-facet.js
  function keepSvgAsImage(img) {
    const src = img && img.getAttribute("src");
    if (src && /\.svg$/i.test(src)) img.setAttribute("src", `${img.src || src}#image`);
    return img;
  }
  function parse(element, { document: document2 }) {
    const bgImg = keepSvgAsImage(element.querySelector(".ComplexHero-background img") || element.querySelector(".ComplexHero-topWrapperFacet img"));
    const fgImg = element.querySelector(".ComplexHero-featuredImage img");
    const content = element.querySelector(".ComplexHero-content") || element;
    const heading = content.querySelector("h1, h2");
    const paragraphs = [...content.querySelectorAll("p")].filter((p) => p.textContent.trim());
    const ctas = [...content.querySelectorAll("a")].filter((a) => a.textContent.trim());
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
      const p = document2.createElement("p");
      p.append(a);
      contentCell.push(p);
    });
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-facet", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/login-inline.js
  var text = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  function fieldLabel(element, inputSelector, index) {
    var _a, _b;
    const input = element.querySelector(inputSelector);
    let label = null;
    if (input) {
      if (input.id) label = element.querySelector(`label[for="${input.id}"]`);
      if (!label) label = (_a = input.closest(".Input-group, .wam-login-input")) == null ? void 0 : _a.querySelector("label");
    }
    if (!label) {
      const groups = element.querySelectorAll(".wam-login-input");
      label = (_b = groups[index]) == null ? void 0 : _b.querySelector("label");
    }
    return text(label);
  }
  function parse2(element, { document: document2 }) {
    const title = text(element.querySelector(".Card-headerTitle, .Card-header h2, .Card-header h3, .Card-header p"));
    const userLabel = fieldLabel(element, '#w-lg-username, input[name="username"], input[type="text"]', 0);
    const passLabel = fieldLabel(element, '#w-lg-password, input[name="password"], input[type="password"]', 1);
    const toggle = element.querySelector(".password-toggle-btn");
    const showLabel = text(toggle);
    const hideLabel = toggle ? (toggle.getAttribute("data-hide-label") || "").trim() : "";
    const rememberWrap = element.querySelector('.customLoginCheckbox, [id*="rememberId-tooltip"]');
    const rememberLabel = text(rememberWrap == null ? void 0 : rememberWrap.querySelector("label p")) || text(rememberWrap == null ? void 0 : rememberWrap.querySelector("label"));
    const helpEl = rememberWrap == null ? void 0 : rememberWrap.querySelector('[role="tooltip"], .Tooltip-content, .tooltip-content');
    const rememberHelp = text(helpEl);
    const submitBtn = element.querySelector("#w-lg-login_submit") || element.querySelector('form button[type="submit"], form button.Button');
    const submitLabel = text(submitBtn);
    const forgot = element.querySelector("#w-lg-forgot_username") || [...element.querySelectorAll("a[href]")].find((a) => /forgot/i.test(a.textContent));
    const newUser = element.querySelector("#w-lg-new_user") || [...element.querySelectorAll("a[href]")].find((a) => /new user|register/i.test(a.textContent) && a !== forgot);
    const form = element.querySelector("form");
    const action = form && form.getAttribute("action") ? form.action || form.getAttribute("action") : "";
    if (!title && !userLabel && !submitLabel) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (title) cells.push([title, ""]);
    if (action) cells.push(["action", action]);
    if (userLabel) cells.push(["user id", userLabel]);
    if (passLabel) cells.push(["password", passLabel]);
    if (showLabel) cells.push(["show", showLabel]);
    if (hideLabel) cells.push(["hide", hideLabel]);
    if (rememberLabel) cells.push(["remember", rememberLabel]);
    if (rememberHelp) cells.push(["remember help", rememberHelp]);
    if (submitLabel) cells.push(["submit", submitLabel]);
    if (forgot) {
      const a = document2.createElement("a");
      a.href = forgot.href || forgot.getAttribute("href");
      a.textContent = text(forgot);
      cells.push(["forgot", a]);
    }
    if (newUser) {
      const a = document2.createElement("a");
      a.href = newUser.href || newUser.getAttribute("href");
      a.textContent = text(newUser);
      cells.push(["new user", a]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "login-inline", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-divider.js
  var SPRITE_RE = /\.svg#([a-z0-9_-]+)$/i;
  function spriteIdFromSvgMarkup(markup) {
    const m = markup && markup.match(/href="([^"]+)"/);
    const id = m && m[1].match(SPRITE_RE);
    return id ? id[1].toLowerCase() : null;
  }
  function iconId(node) {
    if (!node) return null;
    if (node.tagName && node.tagName.toLowerCase() === "svg") {
      const use = node.querySelector("use");
      const href = use && (use.getAttribute("href") || use.getAttribute("xlink:href"));
      const m = href && href.match(SPRITE_RE);
      return m ? m[1].toLowerCase() : null;
    }
    if (node.tagName === "IMG") {
      const src = node.getAttribute("src") || "";
      if (src.startsWith("data:image/svg+xml;base64,")) {
        try {
          return spriteIdFromSvgMarkup(atob(src.split(",")[1]));
        } catch (e) {
          return null;
        }
      }
      if (src.startsWith("data:image/svg+xml")) {
        return spriteIdFromSvgMarkup(decodeURIComponent(src.split(",")[1] || ""));
      }
      const m = src.match(/\/([a-z0-9_-]+)\.svg$/i);
      return m ? m[1].toLowerCase() : null;
    }
    if (node.classList && node.classList.contains("icon")) {
      const cls = [...node.classList].find((c) => c.startsWith("icon-"));
      return cls ? cls.slice(5) : null;
    }
    return null;
  }
  function buildIcon(document2, col) {
    const node = col.querySelector("svg, img, span.icon");
    const id = iconId(node);
    if (id) {
      const p = document2.createElement("p");
      p.textContent = `:${id}:`;
      return p;
    }
    if (node && node.tagName === "IMG" && !(node.getAttribute("src") || "").startsWith("data:")) return node;
    return null;
  }
  function parse3(element, { document: document2 }) {
    let columns = [...element.querySelectorAll(":scope > .Grid > div")];
    if (!columns.length) columns = [...element.querySelectorAll('[class*="size1of2"]')];
    columns = columns.filter((c) => c.querySelector("h2, h3, h4, p, a"));
    if (!columns.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const row = columns.map((col) => {
      const cell = [];
      const icon = buildIcon(document2, col);
      if (icon) cell.push(icon);
      const heading = col.querySelector("h2, h3, h4");
      if (heading) cell.push(heading);
      col.querySelectorAll("p").forEach((p) => {
        if (p.textContent.trim()) cell.push(p);
      });
      col.querySelectorAll("a[href]").forEach((a) => {
        if (!a.textContent.trim()) return;
        const p = document2.createElement("p");
        p.append(a);
        cell.push(p);
      });
      return cell;
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-divider", cells: [row] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-promo.js
  function parse4(element, { document: document2 }) {
    const columns = [...element.querySelectorAll(".Promo-content")];
    const imageCol = columns.find((c) => c.querySelector(".Promo-image, picture, img")) || null;
    const textCol = columns.find((c) => c !== imageCol && c.querySelector("h1, h2, h3, h4, p")) || element;
    const img = imageCol ? imageCol.querySelector("img") : null;
    const textCell = [];
    const eyebrow = textCol.querySelector(".u-textEyebrow");
    if (eyebrow && eyebrow.textContent.trim()) {
      const p = document2.createElement("p");
      p.innerHTML = eyebrow.innerHTML;
      textCell.push(p);
    }
    const heading = textCol.querySelector("h1, h2, h3, h4");
    if (heading) textCell.push(heading);
    [...textCol.querySelectorAll("p")].filter((p) => p !== eyebrow && p.textContent.trim()).forEach((p) => textCell.push(p));
    [...textCol.querySelectorAll("a[href]")].filter((a) => a.textContent.trim() && !a.closest("p")).forEach((a) => {
      const p = document2.createElement("p");
      if (/Button--primary/.test(a.className)) {
        const strong = document2.createElement("strong");
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
    const imageFirst = !!imageCol && imageCol.classList.contains("u-flexOrderFirst");
    const imageCell = img ? [img] : "";
    const row = imageFirst ? [imageCell, textCell] : [textCell, imageCell];
    const cells = [row];
    const isPurple = !!element.querySelector('[class*="u-bgColorPurple"]');
    let block;
    if (isPurple) {
      block = WebImporter.Blocks.createBlock(document2, { name: "columns-promo (purple)", cells });
    } else {
      block = WebImporter.Blocks.createBlock(document2, { name: "columns-promo", cells });
    }
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon.js
  var SPRITE_RE2 = /\.svg#([a-z0-9_-]+)$/i;
  function spriteIdFromSvgMarkup2(markup) {
    const m = markup && markup.match(/href="([^"]+)"/);
    const id = m && m[1].match(SPRITE_RE2);
    return id ? id[1].toLowerCase() : null;
  }
  function iconId2(node) {
    if (!node) return null;
    if (node.tagName && node.tagName.toLowerCase() === "svg") {
      const use = node.querySelector("use");
      const href = use && (use.getAttribute("href") || use.getAttribute("xlink:href"));
      const m = href && href.match(SPRITE_RE2);
      return m ? m[1].toLowerCase() : null;
    }
    if (node.tagName === "IMG") {
      const src = node.getAttribute("src") || "";
      if (src.startsWith("data:image/svg+xml;base64,")) {
        try {
          return spriteIdFromSvgMarkup2(atob(src.split(",")[1]));
        } catch (e) {
          return null;
        }
      }
      if (src.startsWith("data:image/svg+xml")) {
        return spriteIdFromSvgMarkup2(decodeURIComponent(src.split(",")[1] || ""));
      }
      const m = src.match(/\/([a-z0-9_-]+)\.svg$/i);
      return m ? m[1].toLowerCase() : null;
    }
    if (node.classList && node.classList.contains("icon")) {
      const cls = [...node.classList].find((c) => c.startsWith("icon-"));
      return cls ? cls.slice(5) : null;
    }
    return null;
  }
  function buildIcon2(document2, card) {
    const node = card.querySelector("svg, img, span.icon");
    const id = iconId2(node);
    if (id) {
      const p = document2.createElement("p");
      p.textContent = `:${id}:`;
      return p;
    }
    if (node && node.tagName === "IMG" && !(node.getAttribute("src") || "").startsWith("data:")) return node;
    return "";
  }
  function parse5(element, { document: document2 }) {
    let cards = [...element.querySelectorAll(".Categories-block")];
    if (!cards.length) cards = [...element.querySelectorAll(":scope > div")];
    const cells = [];
    cards.forEach((card) => {
      const headingEl = card.querySelector(".Categories-heading") || card.querySelector("h2, h3, h4, .u-textBold");
      const label = headingEl ? headingEl.textContent.replace(/\s+/g, " ").trim() : "";
      const body = [];
      if (label) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        strong.textContent = label;
        p.append(strong);
        body.push(p);
      }
      const content = card.querySelector(".Categories-content");
      if (content && content.textContent.trim()) {
        const ps = [...content.querySelectorAll("p")];
        if (ps.length) ps.forEach((p) => body.push(p));
        else {
          const p = document2.createElement("p");
          p.innerHTML = content.innerHTML;
          body.push(p);
        }
      }
      if (!body.length) return;
      cells.push([buildIcon2(document2, card), body]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-icon", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-split.js
  var BRIGHTCOVE_DEFAULT = { account: "1625296066001", player: "k4UdWzLO6n" };
  var KNOWN_VIDEOS = {
    // "Two minutes on the Investment Research Group" (homepage Insights tab)
    "95313529-11c4-4fa2-a6c5-6fd77040878b": "6372032007112"
  };
  var clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  function videoUrl(panel, posterImg) {
    const vid = panel.querySelector("[data-video-id]");
    let account = BRIGHTCOVE_DEFAULT.account;
    let player = BRIGHTCOVE_DEFAULT.player;
    let videoId = null;
    if (vid) {
      videoId = vid.getAttribute("data-video-id");
      account = vid.getAttribute("data-account") || account;
      player = vid.getAttribute("data-player") || player;
    } else if (posterImg) {
      const src = posterImg.getAttribute("src") || "";
      const m = src.match(/\/static\/(\d+)\/([0-9a-f-]{36})\//i);
      if (m) {
        account = m[1];
        videoId = KNOWN_VIDEOS[m[2]] || null;
      }
    }
    if (!videoId) return null;
    return `https://players.brightcove.net/${account}/${player}_default/index.html?videoId=${videoId}`;
  }
  function buildPanelCell(document2, panel) {
    const cell = [];
    const section = panel.querySelector("section") || panel;
    const poster = section.querySelector(".video-poster img, .vc-video-container img");
    const image = poster || section.querySelector(".Promo-image img, picture img, img");
    const textCol = [...section.querySelectorAll(".Promo-content")].find((c) => c.querySelector("h1, h2, h3, h4")) || section;
    if (image) {
      cell.push(image);
      if (poster) {
        const url = videoUrl(panel, poster);
        if (url) {
          const p = document2.createElement("p");
          const a = document2.createElement("a");
          a.href = url;
          const heading2 = textCol.querySelector("h1, h2, h3, h4");
          a.textContent = clean(heading2 && heading2.textContent) || url;
          p.append(a);
          cell.push(p);
        }
      }
    }
    const heading = textCol.querySelector("h1, h2, h3, h4");
    if (heading) {
      const h = document2.createElement(heading.tagName.toLowerCase());
      h.innerHTML = heading.innerHTML.trim();
      cell.push(h);
    }
    textCol.querySelectorAll("a[href]").forEach((a) => {
      if (a.href) a.setAttribute("href", a.href);
    });
    [...textCol.querySelectorAll("p")].filter((p) => clean(p.textContent) && !p.closest("footer")).forEach((p) => {
      if (p.querySelector("span")) {
        const np = document2.createElement("p");
        np.textContent = clean(p.textContent);
        cell.push(np);
      } else {
        cell.push(p);
      }
    });
    [...textCol.querySelectorAll("a[href]")].filter((a) => !a.closest("p") && clean(a.textContent)).forEach((a) => {
      const p = document2.createElement("p");
      p.append(a);
      cell.push(p);
    });
    return cell;
  }
  function buildNote(document2, panel) {
    const note = panel.querySelector(":scope > footer .Content, :scope > footer");
    if (!note || !clean(note.textContent)) return "";
    const p = document2.createElement("p");
    const inner = note.querySelector(":scope > div") || note;
    inner.querySelectorAll("a[href]").forEach((a) => {
      if (a.href) a.setAttribute("href", a.href);
    });
    p.append(...inner.childNodes);
    return p;
  }
  function parse6(element, { document: document2 }) {
    const labels = [...element.querySelectorAll(".HorizontalTabs-tabItem")].map((t) => clean((t.querySelector(".HorizontalTabs-tabLabel") || t).textContent));
    const panels = [...element.querySelectorAll(".HorizontalTabs-panel")];
    if (!panels.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = panels.map((panel, i) => [
      labels[i] || `${i + 1}`,
      buildPanelCell(document2, panel),
      buildNote(document2, panel)
    ]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-split", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/advisor-search-dark.js
  var DEFAULT_ACTION = "https://www.ameripriseadvisors.com/";
  var SPRITE_RE3 = /\.svg#([a-z0-9_-]+)$/i;
  var clean2 = (s) => (s || "").replace(/\s+/g, " ").trim();
  function spriteIdFromSvgMarkup3(markup) {
    const m = markup && markup.match(/href="([^"]+)"/);
    const id = m && m[1].match(SPRITE_RE3);
    return id ? id[1].toLowerCase() : null;
  }
  function iconId3(node) {
    if (!node) return null;
    if (node.tagName && node.tagName.toLowerCase() === "svg") {
      const use = node.querySelector("use");
      const href = use && (use.getAttribute("href") || use.getAttribute("xlink:href"));
      const m = href && href.match(SPRITE_RE3);
      return m ? m[1].toLowerCase() : null;
    }
    if (node.tagName === "IMG") {
      const src = node.getAttribute("src") || "";
      if (src.startsWith("data:image/svg+xml;base64,")) {
        try {
          return spriteIdFromSvgMarkup3(atob(src.split(",")[1]));
        } catch (e) {
          return null;
        }
      }
      if (src.startsWith("data:image/svg+xml")) {
        return spriteIdFromSvgMarkup3(decodeURIComponent(src.split(",")[1] || ""));
      }
      const m = src.match(/\/([a-z0-9_-]+)\.svg$/i);
      return m ? m[1].toLowerCase() : null;
    }
    if (node.classList && node.classList.contains("icon")) {
      const cls = [...node.classList].find((c) => c.startsWith("icon-"));
      return cls ? cls.slice(5) : null;
    }
    return null;
  }
  function backgroundImage(document2, element) {
    const img = element.querySelector(":scope > img, :scope > picture img");
    if (img) return img;
    let bg = element.style && element.style.backgroundImage;
    if (!bg || bg === "none") {
      const view = document2.defaultView || (typeof window !== "undefined" ? window : null);
      try {
        bg = view && view.getComputedStyle ? view.getComputedStyle(element).backgroundImage : "";
      } catch (e) {
        bg = "";
      }
    }
    const m = bg && bg.match(/url\(["']?([^"')]+)["']?\)/);
    if (!m) return null;
    const out = document2.createElement("img");
    out.src = new URL(m[1], document2.baseURI || "https://www.ameriprise.com/").href;
    out.alt = "";
    return out;
  }
  var absolutize = (root) => root.querySelectorAll("a[href]").forEach((a) => {
    if (a.href) a.setAttribute("href", a.href);
  });
  function parse7(element, { document: document2 }) {
    var _a;
    const headingWrap = element.querySelector(".DynamicAdvisor-heading") || element;
    const heading = headingWrap.querySelector("h2, h3, h4");
    const form = element.querySelector(".DynamicAdvisor-searchForm") || element;
    if (!heading && !form.querySelector("input")) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const bg = backgroundImage(document2, element);
    if (bg) cells.push([bg]);
    const intro = [];
    const id = iconId3(headingWrap.querySelector("svg, img, span.icon"));
    if (id) {
      const p = document2.createElement("p");
      p.textContent = `:${id}:`;
      intro.push(p);
    }
    if (heading) intro.push(heading);
    const panel = [];
    const input = form.querySelector('#DynamicAdvisor-input, input[type="text"], input:not([type])');
    const inputLabel = input ? (_a = input.closest(".Input-group, .Form-group")) == null ? void 0 : _a.querySelector("label") : null;
    const formLabel = [...form.querySelectorAll("label")].find((l) => l !== inputLabel && clean2(l.textContent));
    if (formLabel) {
      const p = document2.createElement("p");
      p.textContent = clean2(formLabel.textContent);
      panel.push(p);
    }
    absolutize(form);
    form.querySelectorAll("p").forEach((p) => {
      if (clean2(p.textContent)) panel.push(p);
    });
    cells.push([intro, panel]);
    const actionEl = element.querySelector("[data-action], form[action]");
    const advisorLink = [...element.querySelectorAll('a[href*="ameripriseadvisors.com"]')][0];
    const action = actionEl && (actionEl.getAttribute("data-action") || actionEl.getAttribute("action")) || advisorLink && advisorLink.href || DEFAULT_ACTION;
    cells.push(["action", action]);
    const placeholder = clean2(input && input.getAttribute("placeholder")) || clean2(inputLabel && inputLabel.textContent);
    if (placeholder) cells.push(["placeholder", placeholder]);
    const searchBtn = form.querySelector(".AdvisorProspect-button") || [...form.querySelectorAll("button")].find((b) => !b.classList.contains("DynamicAdvisor-findMyLocation"));
    if (searchBtn && clean2(searchBtn.textContent)) cells.push(["search", clean2(searchBtn.textContent)]);
    const locate = form.querySelector(".DynamicAdvisor-findMyLocation");
    if (locate && clean2(locate.textContent)) cells.push(["location", clean2(locate.textContent)]);
    const disclosure = element.querySelector(".DynamicAdvisor-disclosure");
    if (disclosure && clean2(disclosure.textContent)) {
      absolutize(disclosure);
      const ps = [...disclosure.querySelectorAll("p")];
      cells.push([ps.length ? ps : [...disclosure.childNodes]]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "advisor-search-dark", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/ameriprise-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var SPRITE_USE_RE = /\.svg#([a-z0-9-_]+)$/i;
  function convertSpriteIcons(element) {
    element.querySelectorAll("svg").forEach((svg) => {
      const use = svg.querySelector("use");
      const href = use && (use.getAttribute("href") || use.getAttribute("xlink:href"));
      const match = href && href.match(SPRITE_USE_RE);
      if (match) {
        const span = document.createElement("span");
        span.className = `icon icon-${match[1].toLowerCase()}`;
        svg.replaceWith(span);
      } else {
        svg.remove();
      }
    });
  }
  var KEEP_IF_CONTAINS = "img, picture, video, iframe, table, hr, a, input, button, span.icon, svg";
  function removeEmptyContainers(element) {
    const divs = [...element.querySelectorAll("div, section")].reverse();
    divs.forEach((el) => {
      if (el.closest("table")) return;
      if (el.textContent.trim() !== "") return;
      if (el.querySelector(KEEP_IF_CONTAINS)) return;
      el.remove();
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        // OneTrust cookie consent overlay
        "#onetrust-consent-sdk",
        // Qualtrics feedback widget + intercept container
        ".QSIFeedbackButton",
        "#ZN_37spM9cCMVfV1MV",
        // Tracking iframes / pixels
        "#destination_publishing_iframe_ameriprisefinancial_0",
        "#tmx_tags_iframe",
        "#universal_pixel_mxnurmo",
        "#lt_3p_15823",
        "#batBeacon892664124595",
        'img[src*="tags.w55c.net"]',
        'img[src*="crwdcntrl.net"]',
        'img[src*="adsrvr.org"]',
        'img[src*="bat.bing.com"]',
        // App store banner + shadow-root asset template (inside header)
        "#app-store-banner-element",
        "template#shadow-root-assets"
      ]);
      element.querySelectorAll(".SimpleContent .Disclaimer-text:not(:has(> div))").forEach((div) => {
        const p = document.createElement("p");
        p.innerHTML = div.innerHTML;
        div.replaceWith(p);
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Global header (AppBar + AppMenu mega nav)
        "#app-header",
        // Skip links (<nav class="u-posAbsolute u-sizeFull"> with a.Link--skip)
        "nav:has(> a.Link--skip)",
        "a.Link--skip",
        // Global footer (SocialMediaBar, FooterNavigation, FooterDisclaimer)
        "footer.footer",
        // Mobile back-to-top button
        "nav.BackToTop",
        // Safe leftovers
        "link",
        "noscript",
        "script",
        "style",
        "template",
        "iframe"
      ]);
      convertSpriteIcons(element);
      removeEmptyContainers(element);
    }
  }

  // tools/importer/transformers/ameriprise-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    "hero-facet": parse,
    "login-inline": parse2,
    "columns-divider": parse3,
    "columns-promo": parse4,
    "cards-icon": parse5,
    "tabs-split": parse6,
    "advisor-search-dark": parse7
  };
  var PAGE_TEMPLATE = {
    "name": "home",
    "urls": [
      "https://www.ameriprise.com/"
    ],
    "description": "Ameriprise homepage: hero with login, spotlight columns, promos, ratings cards, insights tabs, advisor search, disclaimers",
    "blocks": [
      {
        "name": "hero-facet",
        "instances": [
          "section.ComplexHero"
        ]
      },
      {
        "name": "login-inline",
        "instances": [
          ".LoginClient .wam-login-comp"
        ]
      },
      {
        "name": "columns-divider",
        "instances": [
          ".Spotlight"
        ]
      },
      {
        "name": "columns-promo",
        "instances": [
          ".component-wrapper > .component-loaded > div > section.Promo-redesign"
        ]
      },
      {
        "name": "cards-icon",
        "instances": [
          ".Categories-blocks"
        ]
      },
      {
        "name": "tabs-split",
        "instances": [
          ".HorizontalTabs"
        ]
      },
      {
        "name": "advisor-search-dark",
        "instances": [
          ".DynamicAdvisor"
        ]
      }
    ],
    "sections": [
      {
        "id": "section-1",
        "name": "hero-login",
        "selector": [
          ".OneColumnLayout-container > div > div:has(> .ComplexHero-container)",
          ".OneColumnLayout-container > div > div:nth-of-type(1)"
        ],
        "style": null,
        "blocks": [
          "hero-facet",
          "login-inline"
        ],
        "defaultContent": []
      },
      {
        "id": "section-2",
        "name": "spotlight",
        "selector": [
          ".OneColumnLayout-container > div > div:has(> .Spotlight-component)",
          ".OneColumnLayout-container > div > div:nth-of-type(3)"
        ],
        "style": null,
        "blocks": [
          "columns-divider"
        ],
        "defaultContent": []
      },
      {
        "id": "section-3",
        "name": "time-promo",
        "selector": [
          ".OneColumnLayout-container > div > div:nth-of-type(4)"
        ],
        "style": null,
        "blocks": [
          "columns-promo"
        ],
        "defaultContent": []
      },
      {
        "id": "section-4",
        "name": "top-ratings",
        "selector": [
          ".OneColumnLayout-container > div > div:has(> .Categories-component)",
          ".OneColumnLayout-container > div > div:nth-of-type(5)"
        ],
        "style": null,
        "blocks": [
          "cards-icon"
        ],
        "defaultContent": [
          ".Categories > .u-sizeConstrained > .Content"
        ]
      },
      {
        "id": "section-5",
        "name": "retirement-quiz-promo",
        "selector": [
          ".OneColumnLayout-container > div > div:nth-of-type(6)"
        ],
        "style": null,
        "blocks": [
          "columns-promo"
        ],
        "defaultContent": []
      },
      {
        "id": "section-6",
        "name": "insights-tabs",
        "selector": [
          ".OneColumnLayout-container > div > div:has(.HorizontalTabs)",
          ".OneColumnLayout-container > div > div:nth-of-type(7)"
        ],
        "style": "center",
        "blocks": [
          "tabs-split"
        ],
        "defaultContent": [
          "section > header h2"
        ]
      },
      {
        "id": "section-7",
        "name": "advisor-search",
        "selector": [
          "#advisor-locator",
          ".OneColumnLayout-container > div > div:nth-of-type(8)"
        ],
        "style": null,
        "blocks": [
          "advisor-search-dark"
        ],
        "defaultContent": []
      },
      {
        "id": "section-8",
        "name": "disclaimers",
        "selector": [
          ".OneColumnLayout-container > div > div:has(.SimpleContent)",
          ".OneColumnLayout-container > div > div:nth-of-type(10)"
        ],
        "style": "disclaimer",
        "blocks": [],
        "defaultContent": [
          ".SimpleContent > .u-sizeConstrained > .Content"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
