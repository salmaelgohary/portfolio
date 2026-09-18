/* Build a static multi-page site out of the design canvas export. */
const fs = require('fs');
const path = require('path');
const COPY_FIXES = require('./copy-fixes.js');

const SRC = '/Users/salmaelgohary/Downloads/portfolio redesign';
const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');   /* the site: the only thing that gets deployed */
const DOC = path.join(SRC, 'Salma Portfolio - Final designs.dc.html');

const html = fs.readFileSync(DOC, 'utf8');
const slots = JSON.parse(fs.readFileSync(path.join(ROOT, 'media/_slots.json'), 'utf8'));

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'media'), { recursive: true });

/* ---------- links that need a real destination ---------- */
const LINKS = {
  email: 'mailto:salma.elgohary@uwaterloo.ca',
  linkedin: 'https://www.linkedin.com/in/salmaelgohary/',
  resume: 'media/resume.pdf',
};

/* ---------- artboard -> page ---------- */
const PAGES = {
  '11A home':                   { file: 'index.html',      title: 'Salma El Gohary — Product Designer', nav: 'Work' },
  '11C play':                   { file: 'play.html',       title: 'Play — Salma El Gohary',             nav: 'Play' },
  '12B about':                  { file: 'about.html',      title: 'About — Salma El Gohary',            nav: 'About' },
  '12D project':                { file: 'trax.html',       title: 'Trax Codes Copilot — Salma El Gohary', nav: 'Work' },
  '13A wonderMakr case':        { file: 'wondermakr.html', title: 'wonderMakr xVend — Salma El Gohary', nav: 'Work' },
  '13B SleepWell case':         { file: 'sleepwell.html',  title: 'SleepWell — Salma El Gohary',        nav: 'Play' },
  '13C GO Smart case':          { file: 'go-smart.html',   title: 'GO Smart — Salma El Gohary',         nav: 'Play' },
  '13D U4RIA case':             { file: 'u4ria.html',      title: 'U4RIA — Salma El Gohary',            nav: 'Play' },
  '13E AMD Install Manager case': { file: 'amd.html',      title: 'AMD Install Manager — Salma El Gohary', nav: 'Work' },
};

/* Case-study destination for each project card, in the order the cards appear. */
const CARD_LINKS = {
  'index.html': ['amd.html', 'trax.html', 'wondermakr.html'],
  'play.html':  ['sleepwell.html', 'u4ria.html', 'go-smart.html'],
};

/* Which listing page a case study belongs to, for "Back to work". */
const BACK = { Work: 'index.html', Play: 'play.html' };

/* ---------- a tiny tag-matching scanner ---------- */
/* The export is machine-generated and well formed, so counting <div>/</div>
   from an opening tag is enough to find its matching close. */
function matchTag(src, openStart, tag) {
  const openEnd = src.indexOf('>', openStart) + 1;
  let depth = 1;
  const re = new RegExp('<(\\/?)' + tag + '\\b', 'g');
  re.lastIndex = openEnd;
  let m;
  while ((m = re.exec(src))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return { openEnd, closeStart: m.index, closeEnd: src.indexOf('>', m.index) + 1 };
  }
  throw new Error('unbalanced <' + tag + '> at ' + openStart);
}

const matchDiv = (src, openStart) => matchTag(src, openStart, 'div');

/* ---------- pull the artboards out ---------- */
const boards = [];
const rootRe = /<div\b[^>]*\bdata-ink-root="true"[^>]*>/g;
let rm;
while ((rm = rootRe.exec(html))) {
  const label = /data-screen-label="([^"]+)"/.exec(rm[0])[1];
  const { openEnd, closeStart } = matchDiv(html, rm.index);
  boards.push({ label, inner: html.slice(openEnd, closeStart), spy: /data-spy-root/.test(rm[0]) });
  rootRe.lastIndex = closeStart;
}

/* ---------- the shared nav ---------- */
const NAV_ITEMS = [
  { label: 'Work',      href: 'index.html' },
  { label: 'Play',      href: 'play.html' },
  { label: 'About',     href: 'about.html' },
  { label: 'Resume ↗',  href: LINKS.resume, external: true },
];

function navHtml(active) {
  const items = NAV_ITEMS.map((it) => {
    const on = it.label === active;
    const bar = `<span data-inkbar="true" style="height:2px;border-radius:2px;background:#C8A253${on ? ';transform-origin:left;transform:scaleX(1)' : ''}"></span>`;
    const attrs = it.external ? ' target="_blank" rel="noopener"' : '';
    return `<a data-inklink="true" data-cursor="${it.external ? 'Open' : 'Go'}" href="${it.href}"${attrs} style="position:relative;display:inline-flex;flex-direction:column;gap:5px;font-family:'DM Sans',system-ui,sans-serif;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#14141C;text-decoration:none"><span>${it.label}</span>${bar}</a>`;
  }).join('');
  return `<div data-inknav="true" style="position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:20px 56px">
  <a class="wordmark" href="index.html" aria-label="Salma El Gohary — home"><img src="media/dark-logo.svg" alt="" width="53" height="53"></a>
  <nav data-navlinks="true" style="display:flex;gap:30px;align-items:center">${items}</nav>
  <button class="burger" type="button" data-menu-toggle aria-label="Open menu" aria-expanded="false" aria-controls="site-menu">
    <span class="burger__box" aria-hidden="true"><span></span><span></span><span></span></span>
  </button>
</div>`;
}

/* The mobile menu. Below the burger breakpoint the four nav links are replaced
   by this full-screen panel. The nav bar itself stays above the panel, so the
   logo and the burger keep their position and the burger animates into the
   close control rather than being swapped for a separate one. */
function menuHtml(active) {
  const links = NAV_ITEMS.map((it) => {
    const on = it.label === active;
    const attrs = it.external ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${it.href}"${attrs}${on ? ' aria-current="page"' : ''}>${it.label}</a>`;
  }).join('\n      ');

  return `<div class="menu" id="site-menu" data-menu hidden>
  <div class="menu__inner">
    <nav class="menu__links" aria-label="Main">
      ${links}
    </nav>
    <div class="menu__cta">
      <a class="menu__btn menu__btn--fill" href="${LINKS.email}">Contact me ↗</a>
      <a class="menu__btn" href="${LINKS.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a>
    </div>
  </div>
</div>`;
}

/* ---------- transforms ---------- */

/* Swap the design's nav block for a real one. */
function replaceNav(inner, active) {
  const i = inner.search(/<div\b[^>]*\bdata-inknav="true"/);
  if (i < 0) return inner;
  const { closeEnd } = matchDiv(inner, i);
  return inner.slice(0, i) + navHtml(active) + inner.slice(closeEnd);
}

/* Real assets for the Trax case study, dropped into assets/trax/ and staged
   into media/ at 2400px wide. They replace the canvas's own low-res slot
   images, and fill the slots the canvas left empty. Each renders at its own
   aspect ratio — width:100%, height:auto — rather than being cropped into the
   fixed-height box the artboard gave it. */
/* Exports that carry a transparent margin around the artwork to leave room for
   its drop shadow: 62px each side of a 2400px-wide file. Laid in normally, the
   artwork sits inset from the text above it. These are widened by exactly that
   margin (see .asset--bleed) so the artwork lines up with the text and the
   shadow spills into the gutter instead. */
const SHADOWED_EXPORTS = new Set(['u-social', 'u-recipe']);

const SLOT_ASSETS = {
  'a-catalog': ['amd-overview.png', 'AMD Software: Adrenalin Edition and its installer, where AI Bundle is offered'],
  'a-current': ['amd-existing.png', 'The existing AI Bundle software catalog in Install Manager'],
  'a-s1':      ['amd-playbooks.png', 'The Playbooks view: choose a task and install the software it needs'],
  'a-s2':      ['amd-software.png', 'The Software view listing every application'],
  'a-s3':      ['amd-sync.png', 'The Sync all overlay bringing installed versions in line'],
  'a-flow':    ['amd-flow.png', 'User flow from discovering AI Bundle and Playbooks through to install'],
  'a-d1':      ['amd-d-playbooks.png', 'Browse Playbooks element'],
  'a-d2':      ['amd-d-resources.png', 'AI Resources panel'],
  'a-d3':      ['amd-d-bundle.png', 'What is AI Bundle? explainer'],
  'a-d4a':     ['amd-d-indiv.png', 'Individual install menu'],
  'a-d4b':     ['amd-d-group.png', 'Group install overlay'],
  'a-cards':   ['amd-cards.png', 'A compact software card beside a larger model card'],
  'a-d5a':     ['amd-nav-list.png', 'Playbooks listed in the side panel'],
  'a-d5b':     ['amd-nav-search.png', 'Playbooks side panel with search and filters'],
  'a-e1':      ['amd-e1.png', 'Install overlay with a global drive selector'],
  'a-e2':      ['amd-e2.png', 'Install overlay showing every install path'],
  'a-e3':      ['amd-e3.png', 'Install overlay with paths hidden behind a control'],
  'a-e4':      ['amd-e4.png', 'Install overlay tagging a locked install location'],
  'a-final-overlay': ['amd-final-overlay.png', 'The final install overlay with install paths hidden and shown'],
  'a-dep1':    ['amd-dep1.png', 'Individual install menu listing the dependencies it also installs'],
  'a-dep2':    ['amd-dep2.png', 'A locked dependency with a hover explanation'],
  'a-recovery': ['amd-recovery.png', 'Mixed result states: failed items to retry and a cancelled install'],
  't-brand': ['trax-banner.png', 'Trax brand'],
  't-nav':   ['trax-flow-current.png', 'The current flow: home page, All tab, select AI, click search bar, send query'],
  't-sol1':  ['trax-nav.png', 'Copilot promoted into the top-level navigation'],
  't-sol2':  ['trax-filters.png', 'Selected filters kept as editable pills below the question box'],
  't-sol3':  ['trax-citations.png', 'A citation opening the reference panel beside the answer'],
  't-res':   ['trax-affinity.png', 'Affinity map of the heuristic evaluation and feature requests'],
  't-comp':  ['trax-comp.png', 'Competitive audit board'],
  't-d1a':   ['trax-dec-1a.png', 'All suggested prompts shown upfront'],
  't-d1b':   ['trax-dec-1b.png', 'Suggested prompts using progressive disclosure'],
  't-d2a':   ['trax-dec-2a.png', 'Box-style filters'],
  't-d2b':   ['trax-dec-2b.png', 'Pill-style filters'],
  't-d3a':   ['trax-dec-3a.png', 'Different colours for each filter type'],
  't-d3b':   ['trax-dec-3b.png', 'Similar colours across filter types'],
  't-d4b':   ['trax-dec-4b.png', 'Inline citations with the reference panel'],
  't-d5a':   ['trax-dec-5a.png', 'A new question overriding the current chat'],
  't-d5b':   ['trax-dec-5b.png', 'A new question starting a new chat'],

  /* wonderMakr. w-f1/f2/f3 and w-w1/w-w2/w-w3 are absent on purpose:
     wondermakrMedia builds the first three as looping animations, and collapses
     the second three into the single board the wireframes were laid out on. */
  'w-pdf':        ['wm-pdf.png', 'Existing onboarding PDF — dense text, limited hierarchy, hard to scan'],
  'w-logo-slack': ['wm-logo-slack.png', 'Slack'],
  'w-logo-hp':    ['wm-logo-hp.png', 'HP'],
  'w-logo-pepsi': ['wm-logo-pepsi.png', 'Pepsi'],
  'w-logo-adidas':['wm-logo-adidas.png', 'Adidas'],
  'w-logo-disney':['wm-logo-disney.png', 'Disney'],
  'w-flow':       ['wm-flow.png', 'Refined user flow — new onboarding structure, entry points, progressive disclosure'],
  'w-d1a':        ['wm-dec-1a.png', 'One-flow concept'],
  'w-d1b':        ['wm-dec-1b.png', 'Separate-flow concept'],
  'w-d2a':        ['wm-dec-2a.png', 'Deliverables-first layout'],
  'w-d2b':        ['wm-dec-2b.png', 'Sample-visual-first layout'],
  'w-d3a':        ['wm-dec-3a.png', 'Scroll-based dieline interaction'],
  'w-d3b':        ['wm-dec-3b.png', 'Tap-through dieline interaction'],
  'w-d4a':        ['wm-dec-4a.png', 'Microsite demo using a hover interaction'],
  'w-d4b':        ['wm-dec-4b.png', 'Microsite demo using a draggable badge'],

  /* U4RIA. The last three content types are motion, so u4riaMedia builds
     those as rows of looping clips. */
  'u-social': ['u-social.png', 'Instagram posts — Midjourney output beside the Canva refinement'],
  'u-recipe': ['u-recipe.png', 'Recipe images across dietary categories from one template'],

  /* SleepWell. s-d1/s-d2/s-d3 are absent on purpose: sleepwellMedia builds
     those three as before/after cross-fades. */
  's-system': ['sw-system.png', 'The system — fan, wristband, and app working together'],
  's-f1':     ['sw-f1.png', 'Logging sleep quality from the home screen'],
  's-f2':     ['sw-f2.png', 'Setting a desired nightly body temperature'],
  's-f3':     ['sw-f3.png', 'An insight card expanded to explain a pattern'],
  's-f4':     ['sw-f4.png', "The morning summary of the night's temperature data"],
  's-comp':   ['sw-comp.png', 'Competitive review board of smart thermostat and sleep apps'],
  's-crazy':  ['sw-crazy.png', 'Crazy 8s sheet with the selected direction marked'],
  's-story':  ['sw-story.png', 'Storyboard'],
  's-wire':   ['sw-wire.png', 'Mid-fidelity wireframes'],

  /* GO Smart. g-plan and the final recording are portrait phone shots, so
     goSmartMedia stages those two rather than dropping them in here. */
  'g-home':    ['go-bus.jpg', 'GO Transit bus and train'],
  'g-journey': ['go-journey.png', 'Customer journey map with the three intervention points marked'],
  'g-flow':    ['go-flows.png', 'Core user flow — calendar sync through to the departure reminder'],
};

/* <image-slot> -> a real <img>, or a labelled placeholder when the slot is empty. */
function replaceSlots(inner) {
  return inner.replace(/<image-slot\b([^>]*)><\/image-slot>|<image-slot\b([^>]*)\/>/g, (_, a, b) => {
    const attrs = a || b || '';
    const id = (/\bid="([^"]+)"/.exec(attrs) || [])[1] || '';
    const style = (/\bstyle="([^"]*)"/.exec(attrs) || [])[1] || '';
    const ph = ((/\bplaceholder="([^"]*)"/.exec(attrs) || [])[1] || '').trim();

    const asset = SLOT_ASSETS[id];
    if (asset) {
      const cls = SHADOWED_EXPORTS.has(id) ? 'asset asset--bleed' : 'asset';
      return `<img class="${cls}" src="media/${asset[0]}" alt="${escapeAttr(asset[1])}" loading="lazy" decoding="async">`;
    }

    const filled = slots[id];

    if (filled) {
      /* s/x/y are the slot's pan-and-zoom, expressed as a fraction of the frame. */
      const ox = (50 + filled.x * 50).toFixed(2);
      const oy = (50 + filled.y * 50).toFixed(2);
      const zoom = filled.s && filled.s !== 1 ? `transform:scale(${filled.s});` : '';
      return `<img class="slot" src="media/${filled.file}" alt="${escapeAttr(ph)}" loading="lazy" style="display:block;width:100%;height:100%;object-fit:cover;object-position:${ox}% ${oy}%;${zoom}${style}">`;
    }
    return `<div class="slot slot--empty" data-slot="${escapeAttr(id)}" style="${style}"><span>${escapeHtml(ph || 'Image')}</span></div>`;
  });
}

/* placeholder text comes out of the canvas already HTML-escaped, so only a
   bare & needs escaping — re-escaping one turns &amp; into &amp;amp; */
function escapeAttr(s) {
  return String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/"/g, '&quot;');
}
function escapeHtml(s) { return String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/</g, '&lt;'); }

/* The canvas hardcodes the page colour into the markup — the footer band, and
   any other surface painted the same cream. Those follow the --surface token
   so the whole site can be recoloured from one place. */
function tokeniseSurface(inner) {
  return inner
    .replace(/background:\s*#FAFAF8/gi, 'background:var(--surface)')
    .replace(/background-color:\s*#FAFAF8/gi, 'background-color:var(--surface)');
}

/* The three custom media blocks on the Trax page.

   Two of them are before/after comparisons that cross-fade on a loop with a
   pause control, so the flow can be read at rest. The third is the prototype
   recording: the canvas exported it as a still inside a browser frame, and the
   frame is rebuilt here in proportions measured off that export so the gif
   itself can play inside it. */
function crossfade(before, after, beforeAlt, afterAlt, ratio, label) {
  return `<figure class="fade" style="aspect-ratio:${ratio}" role="group" aria-label="${escapeAttr(label)}">
  <img class="fade__layer" src="media/${after}" alt="${escapeAttr(afterAlt)}" loading="lazy" decoding="async">
  <img class="fade__layer fade__layer--first" src="media/${before}" alt="${escapeAttr(beforeAlt)}" loading="lazy" decoding="async">
  <button class="fade__btn" type="button" data-flowtoggle title="Pause" aria-label="Pause the before and after comparison"><span>\u2759\u2759</span></button>
</figure>`;
}

function traxMedia(inner) {
  /* the user-flow comparison replaces the canvas's placeholder pair */
  const i = inner.indexOf('<div style="position:relative;height:340px;border-radius:18px;overflow:hidden;background:#F1F1EE">');
  if (i >= 0) {
    const { closeEnd } = matchDiv(inner, i);
    inner = inner.slice(0, i) + crossfade(
      'trax-userflows-before.png', 'trax-userflows-after.png',
      'User flows before the redesign', 'User flows after the redesign',
      '7120 / 2952', 'User flows, before and after'
    ) + inner.slice(closeEnd);
  }

  /* the technical-constraint exploration, same treatment */
  inner = inner.replace(/<div class="slot slot--empty" data-slot="t-color"[^>]*>[\s\S]*?<\/div>/,
    crossfade(
      'trax-constraint-before.png', 'trax-constraint-after.png',
      'Colour-coded codebook exploration before the constraint',
      'Codebook exploration after the constraint',
      '7120 / 2952', 'Codebook exploration, before and after'
    ));

  /* the final prototype, in a rebuilt browser frame */
  inner = inner.replace(/<div class="slot slot--empty" data-slot="t-final"[^>]*>[\s\S]*?<\/div>/,
    `<figure class="browser">
  <div class="browser__win">
    <div class="browser__bar" aria-hidden="true"><span></span><span></span><span></span></div>
    ${media('trax-demo.gif', 'browser__screen', 'Final Copilot walkthrough: navigation, suggested prompts, filters, response, citations and project integration')}
  </div>
</figure>`);

  return inner;
}

/* The wonderMakr page.

   Its Solution section shows the three flows the onboarding experience is built
   from. Each one is a self-contained SVG animation with its own clock, served
   out of media/ and embedded in an iframe so three of them on one page cannot
   collide over element ids or globals — see .loop in section 8 of styles.css. */
const WM_FLOWS = [
  ['w-f1', 'wm-f-microsite.html',
   'Microsite flow: a badge is tapped onto the scanner and the microsite authorizes the user'],
  ['w-f2', 'wm-f-prizing.html',
   'Prizing flow: the microsite is tapped, a prize vends into the tray, and the tray is tapped to collect it'],
  ['w-f3', 'wm-f-dielines.html',
   'Dielines flow: the front, left, right and rear of the machine are stepped through in turn'],
];

function wondermakrMedia(inner) {
  for (const [id, file, label] of WM_FLOWS) {
    const re = new RegExp('<div class="slot slot--empty" data-slot="' + id + '"[^>]*>[\\s\\S]*?<\\/div>');
    if (!re.test(inner)) throw new Error('wonderMakr: no slot ' + id);
    inner = inner.replace(re,
      `<figure class="loop"><iframe class="loop__frame" src="media/${file}" title="${escapeAttr(label)}" scrolling="no" loading="lazy" tabindex="-1"></iframe></figure>`);
  }

  /* The wireframe exploration was laid out as one board, not three separate
     shots, so the three-up row collapses into a single full-width image. */
  const w1 = inner.indexOf('data-slot="w-w1"');
  if (w1 >= 0) {
    const gridStart = inner.lastIndexOf('<div data-cols="3"', w1);
    if (gridStart < 0) throw new Error('wonderMakr: no grid around w-w1');
    const { closeEnd } = matchDiv(inner, gridStart);
    inner = inner.slice(0, gridStart) +
      '<div style="height:200px;border-radius:14px;overflow:hidden;background:#F1F1EE">' +
      '<img class="asset" src="media/wm-wireframes.png" alt="Mid-fi wireframes and concepts — onboarding structure, the interactive microsite demo, and component information and deliverables" loading="lazy" decoding="async">' +
      '</div>' +
      inner.slice(closeEnd);
  }

  /* The final walkthrough, in the portrait browser frame the design composed it
     in — see .browser--wm in section 8 of styles.css for the measurements. */
  inner = inner.replace(/<div class="slot slot--empty" data-slot="w-final"[^>]*>[\s\S]*?<\/div>/,
    `<figure class="browser browser--wm">
  <div class="browser__win">
    <div class="browser__bar" aria-hidden="true"><span></span><span></span><span></span></div>
    ${media('wm-demo.gif', 'browser__screen', 'Walkthrough of the complete onboarding experience')}
  </div>
</figure>`);

  /* The client logos sit as one left-aligned strip rather than five equal
     tiles. The exports are cropped to their marks, so they share one height
     and shrink together (see .logos in styles.css) instead of wrapping. */
  const logo = inner.indexOf('src="media/wm-logo-slack.png"');
  if (logo < 0) throw new Error('wonderMakr: no logo row');
  const rowStart = inner.lastIndexOf('<div data-cols="5"', logo);
  if (rowStart < 0) throw new Error('wonderMakr: no grid around logos');
  const { closeEnd: rowEnd } = matchDiv(inner, rowStart);
  const imgs = inner.slice(rowStart, rowEnd).match(/<img class="asset" src="media\/wm-logo-[^"]+" alt="[^"]*"/g);
  inner = inner.slice(0, rowStart) +
    '<div class="logos">' +
    imgs.map(i => {
      /* Each mark grows in proportion to its aspect ratio, so all five keep
         one height while the row spans the full container width. */
      const png = fs.readFileSync(path.join(__dirname, i.match(/src="([^"]+)"/)[1]));
      const ratio = (png.readUInt32BE(16) / png.readUInt32BE(20)).toFixed(3);
      return i.replace('class="asset"', `class="logos__item" style="flex:${ratio} 1 0"`) + ' loading="lazy" decoding="async">';
    }).join('') +
    '</div>' +
    inner.slice(rowEnd);

  return inner;
}

/* The AMD page. The research photo and the system map were never going to be
   made, so their slots come out, and the storage decision goes with its image. */
function amdMedia(inner) {
  /* the two views swap in place, on the same loop as the before/after pairs */
  inner = inner.replace(/<div class="slot slot--empty" data-slot="a-views"[^>]*>[\s\S]*?<\/div>/,
    crossfade('amd-views-1.png', 'amd-views-2.png',
      'The Playbooks view', 'The Software view', '7564 / 2952', 'Playbooks and Software views'));
  inner = inner.replace(/<div class="slot slot--empty" data-slot="a-models"[^>]*>[\s\S]*?<\/div>/,
    crossfade('amd-models-before.png', 'amd-models-after.png',
      'Playbooks and Software views with model cards', 'The same views after models were removed',
      '7120 / 2952', 'Model removal, before and after'));
  /* the walkthrough, in a dark-mode window measured off
     assets/amd/final demo placement.png (see .browser--dark) */
  inner = inner.replace(/<div class="slot slot--empty" data-slot="a-final"[^>]*>[\s\S]*?<\/div>/,
    `<figure class="browser browser--dark">
  <div class="browser__win">
    <div class="browser__bar" aria-hidden="true"><span></span><span></span><span></span></div>
    ${media('amd-demo.mp4', 'browser__screen', 'Final Install Manager walkthrough: Home, Playbooks, Software, Sync, install paths, progress and recovery')}
  </div>
</figure>`);
  inner = removeSlot(inner, 'a-survey');
  inner = removeSlot(inner, 'a-system');
  const h = inner.indexOf('>Storage should inform the decision.</h3>');
  if (h < 0) throw new Error('AMD: no storage decision');
  const blockStart = inner.lastIndexOf('<div', inner.lastIndexOf('<h3', h));
  const { closeEnd } = matchDiv(inner, blockStart);
  if (!inner.slice(blockStart, closeEnd).includes('data-slot="a-storage"')) throw new Error('AMD: storage block mismatch');
  inner = inner.slice(0, blockStart) + inner.slice(closeEnd);

  return inner;
}

/* The SleepWell page.

   Each of its three design decisions is a before/after pair, so each becomes a
   cross-fade on the same loop and pause control the Trax flows use — the two
   states of one control are easier to read swapping in place than side by side.
   The exports carry their own Before / After pill, so the figure needs no
   label of its own.
*/
const SW_DECISIONS = [
  ['s-d1', 'sw-dec-1a.png', 'sw-dec-1b.png',
   'An icon-only plus button for sleep logging',
   'The same action labelled Log Sleep',
   'Sleep logging, before and after'],
  ['s-d2', 'sw-dec-2a.png', 'sw-dec-2b.png',
   'A long unbroken article',
   'The same content shortened, with a progress bar',
   'Educational content, before and after'],
  ['s-d3', 'sw-dec-3a.png', 'sw-dec-3b.png',
   'A card that expanded on a hidden drag gesture',
   'The same card with a tap-to-expand arrow',
   'Expanding a card, before and after'],
];

function sleepwellMedia(inner) {
  for (const [id, before, after, beforeAlt, afterAlt, label] of SW_DECISIONS) {
    const re = new RegExp('<div class="slot slot--empty" data-slot="' + id + '"[^>]*>[\\s\\S]*?<\\/div>');
    if (!re.test(inner)) throw new Error('SleepWell: no slot ' + id);
    inner = inner.replace(re, crossfade(before, after, beforeAlt, afterAlt, '7564 / 2952', label));
  }
  return inner;
}

/* The U4RIA page.

   Everything from the splash screens on is motion, delivered as a folder of
   clips per content type. Each becomes a row of tiles laid out the way that
   category's own still board is — four portrait splash screens, three square
   audio covers, three portrait short-form videos — so the page shows the set,
   not one example. The clips carry no controls and no sound; see .reel in
   section 8 of styles.css and reels() in script.js, which is what keeps thirty
   megabytes of video off the page until you scroll to it.

   Order within each row follows the still board rather than the filenames,
   which are content-hashed and sort arbitrarily. */
const U4_REELS = [
  ['u-splash', '9 / 16',
   ['u-splash-1.mp4', 'u-splash-2.mp4', 'u-splash-3.mp4', 'u-splash-4.mp4'],
   'Four app splash screens, each animating from its start frame to its end frame'],
  ['u-audio', '1 / 1',
   ['u-audio-1.mp4', 'u-audio-2.mp4', 'u-audio-3.mp4'],
   'Three affirmation and music tracks, each with its generated cover in motion', true],
  ['u-video', '9 / 16',
   ['u-video-1.mp4', 'u-video-2.mp4', 'u-video-3.mp4'],
   'Three finished looping sequences for TikTok and Reels', true],
];
/* The fifth field marks reels whose clips carry sound worth hearing: those get
   a sound toggle beside play/pause. Splash screens are silent. */

function u4riaMedia(inner) {
  for (const [id, ratio, files, label, sound] of U4_REELS) {
    const re = new RegExp('<div class="slot slot--empty" data-slot="' + id + '"[^>]*>[\\s\\S]*?<\\/div>');
    if (!re.test(inner)) throw new Error('U4RIA: no slot ' + id);
    /* every clip gets play/pause; clips with sound also get a mute toggle.
       They start muted, since browsers only allow sound after a tap. */
    const clips = files.map((f, i) =>
      `<div class="reel__item">` +
      `<video class="reel__clip" src="media/${f}" muted loop playsinline preload="none"></video>` +
      `<div class="reel__controls">` +
      (sound ? `<button class="reel__btn" type="button" data-reel-sound aria-pressed="false" aria-label="Turn sound on for clip ${i + 1}" title="Sound on">${ICON_MUTED}</button>` : '') +
      `<button class="reel__btn" type="button" data-reel-toggle aria-label="Play clip ${i + 1}" title="Play">\u25B6</button>` +
      `</div></div>`).join('');
    inner = inner.replace(re,
      `<figure class="reel" style="--reel-ratio:${ratio}" role="group" aria-label="${escapeAttr(label)}">${clips}</figure>`);
  }
  return stackFinalContent(inner);
}

/* Final content rows were media beside text, which left the work too small to
   read. Each row now runs text first, then the media at the full width of the
   column, in the same order at every breakpoint. */
function stackFinalContent(inner) {
  /* the contents sidebar carries the same words and comes first in the page,
     so match the section eyebrow, not the link */
  const at = inner.search(/<span(?![^>]*data-spy-link)[^>]*>Final content<\/span>/);
  if (at < 0) throw new Error('U4RIA: no Final content section');
  const secStart = inner.lastIndexOf('<div', inner.lastIndexOf('data-spy-section', at));
  const sec = matchDiv(inner, secStart);
  let body = inner.slice(sec.openEnd, sec.closeStart);

  let out = '', cursor = 0, rows = 0;
  const rowRe = /<div data-cols="2"[^>]*>/g;
  let m;
  while ((m = rowRe.exec(body))) {
    const row = matchDiv(body, m.index);
    const aStart = row.openEnd;
    const a = matchDiv(body, aStart);
    const bStart = body.indexOf('<div', a.closeEnd);
    const b = matchDiv(body, bStart);
    const media = body.slice(aStart, a.closeEnd);
    const text = body.slice(bStart, b.closeEnd);
    const open = m[0].replace('data-cols="2"', 'data-stack');
    out += body.slice(cursor, m.index) + open + text + media + '</div>';
    cursor = row.closeEnd;
    rowRe.lastIndex = row.closeEnd;
    rows++;
  }
  if (rows !== 5) throw new Error('U4RIA: expected 5 final content rows, found ' + rows);
  body = out + body.slice(cursor);
  return inner.slice(0, sec.openEnd) + body + inner.slice(sec.closeStart);
}

const ICON_MUTED = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';

/* A portrait phone shot or recording, centred on the flat #F2F2F2 band the
   design exports them on. */
function stage(file, alt) {
  return `<figure class="stage">${media(file, 'stage__media', alt)}</figure>`;
}

/* An image, or — for the prototype recordings, which were GIFs until they were
   re-encoded as MP4 at about a tenth of the weight — a silent looping video
   that script.js plays only while it is on screen. */
function media(file, cls, alt) {
  if (!file.endsWith('.mp4'))
    return `<img class="${cls}" src="media/${file}" alt="${escapeAttr(alt)}" loading="lazy" decoding="async">`;
  return `<video class="${cls}" src="media/${file}" muted loop playsinline preload="metadata" data-autoloop role="img" aria-label="${escapeAttr(alt)}"></video>`;
}

/* Replace one empty slot with a staged portrait shot. */
/* Drop an empty slot, and the box the canvas wrapped it in if that box holds
   nothing else, so no blank panel is left behind. */
function removeSlot(inner, id) {
  const at = inner.indexOf('data-slot="' + id + '"');
  if (at < 0) throw new Error('no slot ' + id);
  const slotStart = inner.lastIndexOf('<div', at);
  const { closeEnd: slotEnd } = matchDiv(inner, slotStart);
  const wrapStart = inner.lastIndexOf('<div', slotStart - 1);
  const wrap = matchDiv(inner, wrapStart);
  const onlyChild = wrap.openEnd === slotStart && wrap.closeStart === slotEnd;
  return onlyChild
    ? inner.slice(0, wrapStart) + inner.slice(wrap.closeEnd)
    : inner.slice(0, slotStart) + inner.slice(slotEnd);
}

/* The GO Smart page.

   Its Solution section was four text-only features in two rows. There are shots
   for three of them, so it becomes three image-and-text rows laid out like the
   Trax solution, and "High-visibility notifications" — which has none — comes
   out. The copy blocks are lifted out of the canvas's own grids rather than
   retyped, so copy-fixes.js still governs the wording.

   Its two portrait shots sit on the flat stage rather than being cropped into
   the artboard's fixed-height boxes. */
const GO_SOLUTION = [
  ['go-sol-1.png', 'Reminders that account for a rider consistently leaving late'],
  ['go-sol-2.png', 'A departure time updating as live traffic and weather change'],
  ['go-sol-3.png', 'A weekly bus plan built from an imported class calendar'],
];

function goSmartMedia(inner) {
  const head = inner.indexOf('An AI-powered assistant that adapts');
  if (head < 0) throw new Error('GO Smart: no Solution headline');

  const g1 = inner.indexOf('<div data-cols="2"', head);
  if (g1 < 0) throw new Error('GO Smart: no Solution feature grids');
  const end1 = matchDiv(inner, g1).closeEnd;
  const g2 = inner.indexOf('<div data-cols="2"', end1);
  if (g2 < 0 || g2 !== end1) throw new Error('GO Smart: Solution feature grids are not adjacent');
  const end2 = matchDiv(inner, g2).closeEnd;

  /* the four feature copy blocks, in the order the canvas lists them */
  const copy = [];
  const re = /<div style="display:flex;flex-direction:column;gap:12px">/g;
  re.lastIndex = g1;
  let m;
  while ((m = re.exec(inner)) && m.index < end2) {
    const { closeEnd } = matchDiv(inner, m.index);
    copy.push(inner.slice(m.index, closeEnd));
    re.lastIndex = closeEnd;
  }
  if (copy.length !== 4) throw new Error('GO Smart: expected 4 features, found ' + copy.length);

  const rows = GO_SOLUTION.map(([file, alt], i) =>
    `<div data-cols="2" style="display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:32px;align-items:center;padding-top:10px">` +
    `<div style="height:280px;border-radius:14px;overflow:hidden;background:#F1F1EE">` +
    `<img class="asset" src="media/${file}" alt="${escapeAttr(alt)}" loading="lazy" decoding="async">` +
    `</div>` + copy[i] + `</div>`).join('');

  inner = inner.slice(0, g1) + rows + inner.slice(end2);

  /* The prototype now lives in Final designs, and the weekly-plan image under
     the early-concept paragraph was cut. Both slots go, with their wrappers. */
  inner = removeSlot(inner, 'g-plan');
  inner = removeSlot(inner, 'g-video');

  return inner;
}

/* The hero's role / team / timeline / skills row.

   It is a four-up like every other grid on the page and carries data-cols="4"
   to match, but it sits above the case study rather than inside its narrow body
   column, so it steps down on its own schedule. Tagging it is what lets the
   stylesheet tell the two apart — see [data-meta] at the end of section 3 of
   styles.css. */
function tagHeroMeta(inner) {
  const open = '<div data-cols="4" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0"';
  const n = inner.split(open).length - 1;
  if (n !== 1) throw new Error('hero metadata row: expected 1, found ' + n);
  return inner.replace(open, '<div data-meta="true"' + open.slice('<div'.length));
}

/* Point asset references at media/. */
function rewriteAssets(inner) {
  return inner.replace(/(\ssrc=")\.?\/?([^"/][^"]*\.(?:png|jpg|jpeg|gif|svg|webp|html))"/g, '$1media/$2"');
}

/* Make the project cards clickable. */
function linkCards(inner, targets) {
  if (!targets) return inner;
  let out = '';
  let cursor = 0;
  let n = 0;
  const re = /<div\b[^>]*\bdata-inkcard="true"[^>]*>/g;
  let m;
  while ((m = re.exec(inner)) && n < targets.length) {
    const { closeEnd } = matchDiv(inner, m.index);
    out += inner.slice(cursor, m.index);
    out += `<a class="cardlink" href="${targets[n]}">` + inner.slice(m.index, closeEnd) + '</a>';
    cursor = closeEnd;
    re.lastIndex = closeEnd;
    n++;
  }
  return out + inner.slice(cursor);
}

/* Footer buttons and the back link.

   The canvas labels it "← Back to work", which is more than the link needs to
   say when it sits at the top of a case study with the work listing one click
   behind it — so it ships as "← Back". The canvas wording is still what the
   replace matches on, so a re-export keeps working. */
function linkChrome(inner, backHref) {
  inner = inner.replace(/<span ([^>]*?)>Contact me<\/span>/g,
    `<a $1 href="${LINKS.email}">Contact me</a>`);
  inner = inner.replace(/<span ([^>]*?)>LinkedIn ↗<\/span>/g,
    `<a $1 href="${LINKS.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a>`);
  if (backHref) {
    inner = inner.replace(/<span ([^>]*?)>← Back to work<\/span>/,
      `<a $1 data-backlink href="${backHref}">← Back</a>`);
  }
  return inner;
}

/* Case studies read plain above the fold: the drifting halftone blob comes out
   of the hero so the writing carries the page. The footer keeps its blob, the
   same as every other page. */
function stripDecor(inner) {
  let i;
  while ((i = inner.search(/<span\b[^>]*data-dotfield="true"/)) >= 0) {
    const { closeEnd } = matchTag(inner, i, 'span');
    inner = inner.slice(0, i) + inner.slice(closeEnd);
  }
  return inner;
}

/* The artboard is composed at 1440px. Inside the art bands — the coloured
   covers and project cards that clip a screenshot positioned inside them —
   every dimension is a fixed pixel value tuned to that width, so at a narrower
   viewport the band keeps its full height while the artwork shrinks, leaving a
   tall empty panel.

   Those bands scale proportionally instead: `min(Npx, <N/1440>vw)` is exactly N
   at 1440 and above and shrinks in step with the page below it, so the
   composition stays the one that was designed. `.page` is width:100% up to a
   1440 cap, so vw tracks the page width.

   Content figures are deliberately excluded. They hold object-fit images that
   fill whatever box they are given, so their fixed height stays legible at
   every width — scaling those down would just squash them into a strip. */
function scaleArtBands(inner) {
  const px = (n) => `min(${n}px, ${(n / 1440 * 100).toFixed(4)}vw)`;
  const scaleProps = /\b(height|top|bottom|width|max-width|gap):\s*(\d{2,4})px/g;
  const scaleHeight = /\bheight:\s*(\d{3,4})px/;

  /* A band is either a project card (tagged by the canvas) or a hero cover,
     which is the only other clipped box given an explicit design width. */
  const isBand = (tag) => {
    if (/\bdata-(?:proj|ink)art="true"/.test(tag)) return true;
    return /overflow:\s*hidden/.test(tag)
      && scaleHeight.test(tag)
      && /(?:^|[;\s])(?:max-)?width:\s*\d{4}px/.test(tag);
  };

  const out = [];
  let cursor = 0;
  const openRe = /<div\b[^>]*>/g;
  let m;
  while ((m = openRe.exec(inner))) {
    if (m.index < cursor || !isBand(m[0])) continue;
    const { closeEnd } = matchDiv(inner, m.index);
    const openEnd = m.index + m[0].length;

    /* the band itself only gives up its height; its width stays fluid */
    const open = m[0].replace(scaleHeight, (d, n) => `height:${px(Number(n))}`);
    /* everything inside scales together so the crop is preserved */
    const body = inner.slice(openEnd, closeEnd).replace(/style="([^"]*)"/g, (full, style) =>
      `style="${style.replace(scaleProps, (d, prop, n) => `${prop}:${px(Number(n))}`)}"`);

    out.push(inner.slice(cursor, m.index), open, body);
    cursor = closeEnd;
    openRe.lastIndex = closeEnd;
  }
  return out.join('') + inner.slice(cursor);
}

/* Fixed widths wider than a phone become fluid with a cap.
   The design pairs some of these with `max-width:none` to stop a parent rule
   from shrinking the artwork; that declaration comes later in the same style
   and would beat the cap we just set, so it has to go with it. */
function fluidWidths(inner) {
  return inner.replace(/style="([^"]*)"/g, (full, style) => {
    let capped = false;
    let next = style.replace(/\bwidth:\s*(\d{3,4})px/g, (decl, px) => {
      if (Number(px) < 600) return decl;
      capped = true;
      return `width:100%;max-width:${px}px`;
    });
    if (capped) next = next.replace(/;?\s*max-width:\s*none\b/g, '');
    return capped ? `style="${next}"` : full;
  });
}

/* Drop canvas-only wrappers. */
function stripCanvasTags(inner) {
  return inner.replace(/<sc-if\b[^>]*>/g, '').replace(/<\/sc-if>/g, '');
}

/* On a phone the contents column goes away, and with it the back link that
   lives in it. This second one sits above the title instead, where you expect
   to find it on a small screen. Only one of the two is ever visible. */
function mobileBackLink(inner, backHref) {
  const i = inner.search(/<div\b[^>]*\bdata-inknav="true"/);
  if (i < 0) return inner;
  const { closeEnd } = matchDiv(inner, i);
  const link = `<a class="backtop" href="${backHref}">← Back</a>`;
  return inner.slice(0, closeEnd) + link + inner.slice(closeEnd);
}

/* The canvas hung a small italic caption under some case-study images ("Before
   and after.", "The weekly plan is generated automatically…"). They were cut
   from the markdown, so they come off the page too. The footer's italic "Have
   an idea?" is Newsreader, not DM Sans, so it is untouched. */
function stripImageCaptions(inner) {
  let n = 0;
  const out = inner.replace(
    /<span style="[^"]*DM Sans[^"]*font-style:\s*italic[^"]*">[^<]*<\/span>/g,
    () => { n++; return ''; });
  return { inner: out, n };
}

/* Every case study except U4RIA closes on a "Final designs" section, in the
   format the Trax page set: eyebrow, a "We created…" headline, one summary
   paragraph, then a single piece of media. Trax and wonderMakr already have
   one from the canvas. SleepWell and GO Smart did not, so theirs are built
   here; AMD had the same section under the label "Final flow".

   New sections are cloned from the page's own markup, so they inherit the
   same type, spacing, contents link and scroll-spy behaviour as the rest. They
   go in before the Reflection section, and their link before Reflection's. */
const FINAL_DESIGNS = {
  'sleepwell.html': {
    heading: 'We created a sleep system that looks after the room overnight.',
    body: 'The final design puts the nightly temperature target at the centre of the home screen, gives sleep logging a clear label, and turns each night’s data into results and insights people can review in the morning.',
    media: () => stage('sw-demo.mp4', 'SleepWell prototype walkthrough: setting the nightly temperature, logging sleep and reviewing insights'),
  },
  'go-smart.html': {
    heading: 'We created a commute assistant that tells students when to leave.',
    body: 'The final design plans each week around a student’s class schedule and turns every trip into a clear departure time that updates with live conditions, so students no longer have to work it out themselves.',
    media: () => stage('go-demo.mp4', 'GO Smart prototype walkthrough, from the weekly plan to a departure reminder'),
  },
};

function finalDesigns(inner, file) {
  if (file === 'amd.html') {
    /* same section, older label; and the summary goes above the media */
    inner = inner.replace(/>Final flow</g, '>Final designs<');
    const i = inner.indexOf('>Final designs</span><h2');
    if (i < 0) throw new Error('AMD: final section not found');
    const secStart = inner.lastIndexOf('<div', inner.lastIndexOf('data-spy-section', i));
    const { closeStart } = matchDiv(inner, secStart);
    const sec = inner.slice(secStart, closeStart);
    /* the media is a wrapper div around the slot; the summary <p> follows it */
    const slotAt = sec.search(/data-slot="a-final"|class="[^"]*"[^>]*src="media\/amd-final/);
    if (slotAt < 0) throw new Error('AMD: final media not found');
    const wrapStart = sec.lastIndexOf('<div', sec.lastIndexOf('<div', slotAt) - 1);
    const { closeEnd: wrapEnd } = matchDiv(sec, wrapStart);
    const pm = /^\s*(<p\b[^>]*>[\s\S]*?<\/p>)/.exec(sec.slice(wrapEnd));
    if (!pm) return inner;                      /* already in order */
    const media = sec.slice(wrapStart, wrapEnd);
    const moved = sec.slice(0, wrapStart) + pm[1] + media + sec.slice(wrapEnd + pm[0].length);
    return inner.slice(0, secStart) + moved + inner.slice(closeStart);
  }

  const spec = FINAL_DESIGNS[file];
  if (!spec) return inner;
  if (/>Final designs</.test(inner)) return inner;

  const eyebrowAt = inner.search(/>Reflection<\/span><h2/);
  if (eyebrowAt < 0) throw new Error(file + ': Reflection section not found');
  const secStart = inner.lastIndexOf('<div', inner.lastIndexOf('data-spy-section', eyebrowAt));
  const secOpen = inner.slice(secStart, inner.indexOf('>', secStart) + 1);
  const eyebrow = /<span\b[^>]*>(?=Reflection<\/span><h2)/.exec(inner.slice(secStart))[0];
  const h2Open = /<h2\b[^>]*>/.exec(inner.slice(eyebrowAt))[0];
  const pOpen = /<p\b[^>]*>/.exec(inner.slice(inner.search(/data-spy-section/)))[0];

  const section = secOpen + eyebrow + 'Final designs</span>' +
    h2Open + escapeHtml(spec.heading) + '</h2>' +
    pOpen + escapeHtml(spec.body) + '</p>' +
    spec.media() + '</div>\n    ';
  inner = inner.slice(0, secStart) + section + inner.slice(secStart);

  const link = /<span\b[^>]*data-spy-link[^>]*>Reflection<\/span>/.exec(inner);
  if (!link) throw new Error(file + ': Reflection contents link not found');
  return inner.replace(link[0], link[0].replace('>Reflection<', '>Final designs<') + link[0]);
}

/* A rule marks where each case study moves from the summary (problem, solution,
   outcomes) into the process, matching the --- in the markdown. It sits on the
   first research section. U4RIA has no research section and no rule. */
function researchDivider(inner) {
  const m = /<div\b[^>]*\bdata-spy-section="true"[^>]*>(?=<span\b[^>]*>(?:User )?research<\/span>)/i.exec(inner);
  if (!m) return inner;
  return inner.slice(0, m.index) + m[0].replace('<div', '<div data-divider') + inner.slice(m.index + m[0].length);
}

/* Resolve the canvas template bindings on the before/after crossfade. */
function resolveBindings(inner) {
  return inner
    .replace(/animation-play-state:\{\{ flowPlayState \}\}/g, 'animation-play-state:running')
    .replace(/onClick="\{\{ toggleFlow \}\}" title="\{\{ flowLabel \}\}"/g,
      'data-flowtoggle="true" role="button" tabindex="0" title="Pause" aria-label="Pause the before and after comparison"')
    .replace(/\{\{ flowGlyph \}\}/g, '\u2759\u2759')
    .replace(/\s*style-hover="[^"]*"/g, '');
}

/* Tag every grid with its column count so the stylesheet can collapse them by
   number rather than by matching the shape of the inline style — the canvas
   uses repeat(2..5), asymmetric fr pairs and fixed-first pairs, and matching
   each spelling by hand kept missing some. */
function tagGridColumns(inner) {
  return inner.replace(/<div\b([^>]*\bstyle="([^"]*)"[^>]*)>/g, (full, attrs, style) => {
    const m = /grid-template-columns:\s*([^;"]+)/.exec(style);
    if (!m) return full;
    const spec = m[1].trim();
    let cols;
    const rep = /^repeat\(\s*(\d+)/.exec(spec);
    if (rep) {
      cols = Number(rep[1]);
    } else {
      /* count top-level tracks: split on spaces that are not inside parens */
      let depth = 0, n = spec ? 1 : 0;
      for (const ch of spec) {
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        else if (ch === ' ' && depth === 0) n++;
      }
      cols = n;
    }
    if (!cols || cols < 2) return full;
    return `<div data-cols="${cols}"${attrs}>`;
  });
}

/* "Outside design, you can find me..." — the four photos on the about page.

   The canvas fades its caption in place. These rewrap it in a clipped box
   sitting directly under the photo so it can slide out from behind the image
   instead, and carry the wording Salma asked for. The box is absolutely
   positioned, so nothing it does moves the grid. */
const OUT_CAPTIONS = [
  'walking and enjoying beautiful sunsets',
  'cooking and baking (especially tiramisu!)',
  'binge watching movies with friends',
  'traveling',
];

function outsidePhotos(inner) {
  let n = 0;
  let cursor = 0;
  const out = [];
  const re = /<span\b[^>]*\bdata-outcap="true"[^>]*>/g;
  let m;
  while ((m = re.exec(inner)) && n < OUT_CAPTIONS.length) {
    const { openEnd, closeStart, closeEnd } = matchTag(inner, m.index, 'span');
    const body = inner.slice(openEnd, closeStart);
    /* keep the canvas's emoji, replace the words */
    const emoji = (/<span[^>]*>([^<]*)<\/span>/.exec(body) || [])[1] || '';
    const text = OUT_CAPTIONS[n];

    out.push(inner.slice(cursor, m.index));
    out.push(
      `<span data-outcap="true" class="outcap">` +
        `<span class="outcap__in">` +
          (emoji ? `<span class="outcap__emoji">${emoji}</span>` : '') +
          `<span>${escapeHtml(text)}</span>` +
        `</span>` +
      `</span>`
    );
    cursor = closeEnd;
    re.lastIndex = closeEnd;
    n++;
  }
  if (n === 0) return inner;

  inner = out.join('') + inner.slice(cursor);

  /* the alt text mirrored the old wording */
  let k = 0;
  return inner.replace(/(<img[^>]*\bclass="slot"[^>]*\balt=")([^"]*)(")/g, (full, a, alt, b) =>
    /e12b-(walk|bake|cro|trav)/.test(full) && k < OUT_CAPTIONS.length
      ? a + escapeAttr(OUT_CAPTIONS[k++]) + b
      : full);
}

/* Page headlines are set in fixed pixels for a 1440px artboard. Below that the
   stylesheet scales them fluidly, but it needs to know what each one was
   designed at so it never grows a headline past its own size — the about page
   is set at 40px where the home page is 72px. That size is published here as
   --h1 and the fixed value is left in place for full-width screens. */
function fluidHeadings(inner) {
  return inner.replace(/<h1\b[^>]*\bstyle="([^"]*)"/g, (full, style) => {
    if (!/\bfont-size:\s*[\d.]+(px|rem)/.test(style)) return full;
    /* one display size for every page, whatever the artboard used */
    return full.replace(style,
      style.replace(/\bfont-size:\s*[\d.]+(px|rem)/, `font-size:${TYPE.display}px`) +
      `;--h1:${TYPE.display}px`);
  });
}

/* The type scale.

   The artboard used eighteen different sizes, topping out at 76px, which is
   what made the site read as oversized. These are the seven it actually needs.
   Every inline font-size in the canvas markup is mapped onto the nearest one,
   and body copy is re-led at 1.55 — the leading did as much of the damage as
   the sizes did. */
const TYPE = { display: 56, section: 32, sub: 21, nav: 16, body: 15, label: 13, meta: 12 };
const BODY_LEADING = 1.55;

/* Each source size maps to exactly one step. The values are unambiguous: 17px
   is only ever the contents links, 18px only the about page's intro. */
function typeStep(px) {
  if (px >= 26) return TYPE.section;   // 50, 42, 38, 32, 28
  if (px >= 19) return TYPE.sub;       // 22, 21.2
  if (px === 17) return TYPE.nav;      // the case-study contents links
  if (px >= 14) return TYPE.body;      // 18, 16, 15
  if (px >= 13) return TYPE.label;
  return TYPE.meta;
}

function normaliseTypeScale(inner) {
  return inner.replace(/<(\w+)\b([^>]*\bstyle="([^"]*)")([^>]*)>/g, (full, tag, pre, style, post) => {
    if (tag === 'h1') return full;                      /* handled by fluidHeadings */
    if (!/\bfont-size:\s*[\d.]+(px|rem)/.test(style)) return full;

    let size = null;
    let next = style.replace(/\bfont-size:\s*([\d.]+)(px|rem)/g, (d, n, unit) => {
      const px = unit === 'rem' ? parseFloat(n) * 16 : parseFloat(n);
      size = typeStep(px);
      return `font-size:${size}px`;
    });

    /* body copy carries its leading inline; re-lead it with the new size */
    if (size === TYPE.body) {
      next = next.replace(/\bline-height:\s*[\d.]+/g, `line-height:${BODY_LEADING}`);
    }
    return `<${tag}${pre.replace(style, next)}${post}>`;
  });
}

/* Hooks the stylesheet needs to reflow the fixed-width composition. */
function tagLayout(inner) {
  return inner
    .replace(/<div (?=[^>]*flex-direction: row; justify-content: space-between)/g, '<div data-hero-split="true" ')
    .replace(/<div (?=[^>]*justify-content:space-between;align-items:flex-end;gap:40px;background:#FAFAF8)/g, '<div data-foot="true" ')
    .replace(/<div (?=[^>]*flex-direction:column;align-items:flex-end;gap:2px)/g, '<div data-foot-cta="true" ')
    .replace(/<span data-spy-link="true"/g, '<span data-spy-link="true" role="link" tabindex="0"');
}

/* Scroll-spy sections need ids so the TOC can link to them. */
function idSections(inner) {
  let n = 0;
  return inner.replace(/<div\b(?=[^>]*\bdata-spy-section="true")/g, () => `<div id="s${n++}"`);
}

/* Restore the case-study wording from case-studies/*.md. See copy-fixes.js. */
function applyCopyFixes(inner, file) {
  const fixes = COPY_FIXES[file];
  if (!fixes) return inner;
  for (const [from, to] of fixes) {
    /* the canvas and the markdown disagree about apostrophes; match either */
    const pattern = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/['\u2019]/g, "['\u2019]");
    const re = new RegExp(pattern, 'g');
    const hits = inner.match(re);
    if (!hits) throw new Error(`copy fix for ${file} matched nothing:\n  ${from}`);
    if (hits.length > 1) throw new Error(`copy fix for ${file} matched ${hits.length}x:\n  ${from}`);
    inner = inner.replace(re, to.replace(/\$/g, '$$$$'));
  }
  return inner;
}

/* ---------- page shell ---------- */
function shell(title, body, spy, menu) {
  /* search results and link previews summarise the page with its headline */
  const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/.exec(body);
  const summary = h1 ? h1[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() : '';
  const meta = summary ? `<meta name="description" content="${escapeAttr(summary)}">
<meta property="og:title" content="${escapeAttr(title)}">
<meta property="og:description" content="${escapeAttr(summary)}">
<meta property="og:type" content="website">
` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
${meta}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet">
<link rel="icon" href="media/dark-logo.svg" type="image/svg+xml">
<link rel="icon" href="media/light-logo.svg" type="image/svg+xml" media="(prefers-color-scheme: dark)">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<main class="page"${spy ? ' data-spy-root="true"' : ''}>
${body}
</main>
${menu}
<script src="script.js" defer></script>
</body>
</html>
`;
}

/* ---------- run ---------- */
let built = 0;
for (const board of boards) {
  const page = PAGES[board.label];
  if (!page) { console.warn('no page mapping for', board.label); continue; }

  let inner = board.inner;
  inner = stripCanvasTags(inner);
  /* rewriteAssets first: the nav we inject already points at media/. */
  inner = rewriteAssets(inner);
  inner = replaceNav(inner, page.nav);
  inner = replaceSlots(inner);
  if (board.spy) inner = stripDecor(inner);
  inner = linkCards(inner, CARD_LINKS[page.file]);
  inner = linkChrome(inner, board.spy ? BACK[page.nav] : null);
  if (board.spy) inner = mobileBackLink(inner, BACK[page.nav]);
  inner = resolveBindings(inner);
  if (board.spy) inner = finalDesigns(inner, page.file);
  if (board.spy) inner = researchDivider(inner);
  inner = tagLayout(inner);
  inner = fluidHeadings(inner);
  inner = normaliseTypeScale(inner);
  inner = tagGridColumns(inner);
  if (board.spy) inner = tagHeroMeta(inner);
  inner = outsidePhotos(inner);
  inner = idSections(inner);
  inner = scaleArtBands(inner);
  inner = fluidWidths(inner);
  if (page.file === 'trax.html') inner = traxMedia(inner);
  if (page.file === 'wondermakr.html') inner = wondermakrMedia(inner);
  if (page.file === 'go-smart.html') inner = goSmartMedia(inner);
  if (page.file === 'sleepwell.html') inner = sleepwellMedia(inner);
  if (page.file === 'u4ria.html') inner = u4riaMedia(inner);
  if (page.file === 'amd.html') inner = amdMedia(inner);
  if (board.spy) {
    const cut = stripImageCaptions(inner);
    inner = cut.inner;
    if (cut.n) console.log(`  ${page.file}: removed ${cut.n} italic caption(s)`);
  }
  inner = applyCopyFixes(inner, page.file);
  /* last: tagLayout and the copy fixes match on the canvas's own colour */
  inner = tokeniseSurface(inner);

  /* every image slot must be filled or removed; an empty one would ship as a bare box */
  const empty = /data-slot="([^"]+)"/.exec(inner);
  if (empty) throw new Error(page.file + ': unfilled image slot ' + empty[1]);

  /* canvas-only hooks nothing on the site reads */
  inner = inner.replace(/ data-(?:cursor|outcap|inkart|projart|inktitle)(?:="[^"]*")?/g, '');

  /* timelines read "8 weeks (Oct – Dec 2025)": the duration, then the dates */
  inner = inner.replace(/>(\d+ (?:weeks?|months?)) · ([^<]+)</g, '>$1 ($2)<');

  /* Netlify's Pretty URLs rewrites every link to a .html page, and in doing so
     cuts a style attribute off at its first quote — so those links lost their
     font and fell back to blue Times. Font names don't need quotes in CSS, so
     inline styles carry none. */
  inner = inner.replace(/style="[^"]*"/g, (m) => m.replace(/'(DM Sans|Newsreader)'/g, '$1'));
  if (/style="[^"]*'/.test(inner)) throw new Error(page.file + ': quote left in an inline style');
  fs.writeFileSync(path.join(DIST, page.file), shell(page.title, inner.trim(), board.spy, menuHtml(page.nav)));
  console.log('wrote', page.file, '(' + Math.round(inner.length / 1024) + 'KB)');
  built++;
}
console.log('built', built, 'pages');

/* ---------- dist: the rest of what goes online ---------- */
/* Alongside the pages, dist/ gets styles.css, script.js and just the media
   files something actually references — unused exports and _slots.json stay
   behind. A file counts as referenced when its name appears in a page, the
   stylesheet, the script, or an HTML file (the wonderMakr flow animations)
   that is itself referenced. */
const PAGE_FILES = Object.values(PAGES).map(p => p.file);
const mediaNames = fs.readdirSync(path.join(ROOT, 'media')).filter(n => !n.startsWith('_') && !n.startsWith('.'));
const shipped = new Set();
const scan = (text) => {
  for (const n of mediaNames) {
    if (shipped.has(n) || !text.includes(n)) continue;
    shipped.add(n);
    if (n.endsWith('.html')) scan(fs.readFileSync(path.join(ROOT, 'media', n), 'utf8'));
  }
};
for (const f of ['styles.css', 'script.js']) fs.copyFileSync(path.join(ROOT, f), path.join(DIST, f));
for (const f of [...PAGE_FILES, 'styles.css', 'script.js']) scan(fs.readFileSync(path.join(DIST, f), 'utf8'));
let bytes = 0;
for (const n of shipped) {
  fs.copyFileSync(path.join(ROOT, 'media', n), path.join(DIST, 'media', n));
  bytes += fs.statSync(path.join(ROOT, 'media', n)).size;
}
/* every media/ path a page points at has to exist, or the site ships a broken image */
for (const f of PAGE_FILES) {
  for (const [, ref] of fs.readFileSync(path.join(DIST, f), 'utf8').matchAll(/media\/([^"')\s]+)/g)) {
    if (ref !== 'resume.pdf' && !fs.existsSync(path.join(ROOT, 'media', ref))) throw new Error(f + ': media/' + ref + ' does not exist');
  }
}
if (!shipped.has('resume.pdf')) console.warn('dist: media/resume.pdf is missing, so the Resume link is broken');
const unused = mediaNames.filter(n => !shipped.has(n));
if (unused.length) console.warn('media/ files nothing uses:', unused.join(', '));
console.log(`dist: ${PAGE_FILES.length} pages + ${shipped.size} media (${(bytes / 1048576).toFixed(1)} MB)`);
