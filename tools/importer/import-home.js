/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroFacetParser from './parsers/hero-facet.js';
import loginInlineParser from './parsers/login-inline.js';
import columnsDividerParser from './parsers/columns-divider.js';
import columnsPromoParser from './parsers/columns-promo.js';
import cardsIconParser from './parsers/cards-icon.js';
import tabsSplitParser from './parsers/tabs-split.js';
import advisorSearchDarkParser from './parsers/advisor-search-dark.js';

// TRANSFORMER IMPORTS
import ameripriseCleanupTransformer from './transformers/ameriprise-cleanup.js';
import ameripriseSectionsTransformer from './transformers/ameriprise-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-facet': heroFacetParser,
  'login-inline': loginInlineParser,
  'columns-divider': columnsDividerParser,
  'columns-promo': columnsPromoParser,
  'cards-icon': cardsIconParser,
  'tabs-split': tabsSplitParser,
  'advisor-search-dark': advisorSearchDarkParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
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

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata
const transformers = [
  ameripriseCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [ameripriseSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page, in document order
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Initial cleanup + section breaks (while section elements still exist)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block; skip elements already replaced by an earlier parser
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + section metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path; root URL maps to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
