import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const projectFile = (path) => new URL(`../${path}`, import.meta.url);

async function readProjectFile(path) {
  return readFile(projectFile(path), 'utf8');
}

test('publishes an English-first bilingual academic structure', async () => {
  const html = await readProjectFile('index.html');
  const sectionIds = ['about', 'news', 'publications', 'honors', 'activities'];
  const requiredIds = ['main-content', ...sectionIds];

  assert.match(html, /<html[^>]+lang="en"/);
  assert.match(html, /<meta[^>]+name="viewport"/);
  assert.match(html, /class="skip-link"[^>]+href="#main-content"/);
  assert.match(html, /Meilin Li/);
  assert.match(html, /<span[^>]+lang="zh-CN"[^>]*>李美霖<\/span>/);
  assert.match(html, /Chongqing University/);
  assert.match(html, /Software Engineering/);
  assert.match(html, /rank(?:ed)? first in my major/i);
  assert.doesNotMatch(html, /GPA 3\.86|2025–26 academic year|\b1\/119\b/);

  for (const id of requiredIds) {
    const occurrences = html.match(new RegExp(`\\bid="${id}"`, 'g')) ?? [];
    assert.equal(occurrences.length, 1, `${id} must appear exactly once`);
  }

  for (const id of sectionIds) {
    assert.match(html, new RegExp(`<a[^>]+data-section-link[^>]+href="#${id}"|<a[^>]+href="#${id}"[^>]+data-section-link`));
  }

  assert.doesNotMatch(html, /\bid="(?:research|projects)"/);
  assert.doesNotMatch(html, /href="#(?:research|projects)"/);

  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const internalTargets = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
  assert.ok(internalTargets.length >= sectionIds.length, 'primary navigation must expose section links');
  for (const target of internalTargets) {
    assert.ok(ids.has(target), `#${target} must resolve to an element`);
  }
});

test('presents current research outcomes accurately', async () => {
  const html = await readProjectFile('index.html');

  for (const publicFact of [
    'National Scholarship',
    'National College Student Information Security Contest',
    '550,000',
    '110,000',
    'Testing Static Analyzers via Semantic-Preserving Mutators',
    'CoEffi: Enhance Efficient Code Generation',
  ]) {
    assert.ok(html.includes(publicFact), `missing supplied fact: ${publicFact}`);
  }

  assert.match(html, /ASE 2026\s*·\s*First Author[\s\S]*?Accepted/);
  assert.match(html, /EMNLP 2026\s*·\s*Fourth Author[\s\S]*?Accepted/);
  assert.match(html, /Under Review/);
  assert.match(html, /<time datetime="2026-10">2026\.10<\/time>[\s\S]*?National Scholarship/);
  assert.doesNotMatch(html, /Submitted\s*·\s*(ASE 2026|EMNLP 2026)/i);
  assert.doesNotMatch(html, /Accepted\s*·\s*SIGMOD 2027/i);

  assert.ok(html.includes('href="https://conf.researchr.org/details/ase-2026/ase-2026-research-track/248/Testing-Static-Analyzers-via-Semantic-Preserving-Mutators-Learned-from-Real-World-Ref"'));
  assert.ok(html.includes('href="https://2026.emnlp.org/"'));
});

test('withholds the under-review vector DBMS manuscript identity', async () => {
  const html = await readProjectFile('index.html');
  const publicationEntries = html.match(/<article class="publication-row(?: featured-publication)?">[\s\S]*?<\/article>/g) ?? [];
  const sigmodEntry = publicationEntries.find((entry) => entry.includes('Under Review'));

  assert.ok(sigmodEntry, 'the under-review status entry must remain visible');
  assert.match(html, /Under Review/);
  assert.match(sigmodEntry, /Title withheld during peer review\./);
  assert.doesNotMatch(sigmodEntry, /Meilin Li et al\./i);
});

test('presents the requested Beyond the lab activities in order', async () => {
  const html = await readProjectFile('index.html');
  const activities = html.match(/<section class="content-section" id="activities"[\s\S]*?<\/section>/)?.[0];

  assert.ok(activities, 'the activities section must remain visible');
  assert.match(
    activities,
    /Social media entrepreneur[\s\S]*?Xiaohongshu[\s\S]*?Badminton enthusiast[\s\S]*?Chongda Cup[\s\S]*?Long-distance runner[\s\S]*?marathon/i,
  );
  assert.doesNotMatch(activities, /Social practice|Hundred People, Hundred Classes/i);
  assert.ok(activities.includes('href="https://www.xiaohongshu.com/user/profile/5acc96a911be1002cdc6703b"'));
});

test('keeps private source data out of the public page', async () => {
  const html = await readProjectFile('index.html');

  assert.match(html, /href="mailto:Leemeii@stu\.cqu\.edu\.cn"/i);
  assert.match(html, /href="https:\/\/github\.com\/leemeii"/);
  for (const secret of [
    '18223987782',
    '20241203',
    '434357686',
    '#2906',
    'E:\\Personal_Honor',
    'E:\\Projects',
  ]) {
    assert.ok(!html.includes(secret), `private source data leaked: ${secret}`);
  }
  assert.doesNotMatch(html, /证明材料|评审分数|review score|submission id/i);
  assert.doesNotMatch(html, /29\.5630°|106\.5516°/);
  assert.doesNotMatch(html, /href="#"/);

  const externalAnchors = [...html.matchAll(/<a\s+[^>]*href="https:[^"]+"[^>]*>/g)].map(
    (match) => match[0],
  );
  assert.ok(externalAnchors.length > 0, 'the GitHub profile must be linked');
  for (const anchor of externalAnchors) {
    assert.match(anchor, /target="_blank"/);
    assert.match(anchor, /rel="noopener noreferrer"/);
  }
});

test('declares descriptive metadata and stable asset paths', async () => {
  const html = await readProjectFile('index.html');
  const iconPath = html.match(/<link[^>]+rel="icon"[^>]+href="([^"]+)"/)?.[1];
  const profilePhotoPath = html.match(/<img[^>]+class="profile-photo"[^>]+src="([^"]+)"/)?.[1];

  assert.match(html, /<title>[^<]*Meilin Li[^<]*<\/title>/i);
  assert.match(html, /<meta[^>]+name="description"[^>]+content="[^"]{20,}"/);
  assert.doesNotMatch(html, /fonts\.(?:googleapis|gstatic)\.com/);
  assert.equal(iconPath, 'assets/favicon.svg');
  const icon = await readProjectFile(iconPath);
  assert.match(icon, /<svg[^>]+viewBox="0 0 64 64"/);
  assert.match(icon, /<title>Meilin Li monogram<\/title>/);
  assert.match(icon, /<text[^>]*>LML<\/text>/);
  assert.match(icon, /fill="#1e4f91"/);
  assert.equal(profilePhotoPath, 'assets/img/meilin-li.jpg');
  const profilePhoto = await readFile(projectFile(profilePhotoPath));
  assert.ok(profilePhoto.length > 10_000, 'profile photo must be a real local image');
  assert.match(html, /<img[^>]+class="profile-photo"[^>]+alt="Meilin Li hiking in the mountains"/);
  assert.match(html, /href="assets\/css\/styles\.css"/);
  assert.match(html, /src="assets\/js\/main\.js"/);
  assert.match(html, /type="module"/);
});

test('ships an accessible responsive stylesheet for every declared visual mode', async () => {
  const html = await readProjectFile('index.html');
  const stylesheetPath = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/)?.[1];

  assert.equal(stylesheetPath, 'assets/css/styles.css');
  const css = await readProjectFile(stylesheetPath);

  assert.match(css, /:root\s*{[^}]*--paper:/s);
  assert.match(css, /\[data-theme="dark"\]\s*{/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(max-width:\s*900px\)/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /overflow-x:\s*(?:hidden|clip)/);

  const cssColor = (name) => css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1];
  const channel = (value) => {
    const normalized = value / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  const luminance = (hex) => {
    const [red, green, blue] = [1, 3, 5].map((index) =>
      channel(Number.parseInt(hex.slice(index, index + 2), 16)),
    );
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const contrast = (foreground, background) => {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  };

  const field = cssColor('field');
  const fieldAccent = cssColor('field-accent');
  const fieldMuted = cssColor('field-muted');
  assert.ok(field && fieldAccent && fieldMuted, 'field contrast tokens must be declared');
  assert.ok(contrast(fieldAccent, field) >= 4.5);
  assert.ok(contrast(fieldMuted, field) >= 4.5);
  assert.match(css, /\.featured-publication\s*{[^}]*background:\s*var\(--paper-raised\)/s);
  assert.match(css, /\.featured-publication \.publication-venue\s*{[^}]*color:\s*var\(--accent\)/s);
  assert.match(css, /\.featured-publication \.publication-copy > p\s*{[^}]*color:\s*var\(--ink-soft\)/s);
});

test('ships the sticky academic rail and narrow-screen fallback', async () => {
  const css = await readProjectFile('assets/css/styles.css');

  assert.match(css, /\.page-shell\s*{[^}]*display:\s*grid/s);
  assert.match(css, /\.profile-rail\s*{[^}]*position:\s*sticky/s);
  assert.match(
    css,
    /grid-template-columns:\s*(?:minmax\([^;]+|\d+px)\s+minmax\(0,\s*1fr\)/,
  );
  assert.match(css, /@media\s*\(max-width:\s*900px\)/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.match(css, /overflow-x:\s*(?:hidden|clip)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

test('uses a wide, youthful academic treatment with readable type and a circular portrait', async () => {
  const html = await readProjectFile('index.html');
  const css = await readProjectFile('assets/css/styles.css');

  assert.match(html, /<nav class="site-nav section-nav"/);
  assert.match(html, /<div class="profile-photo-frame">\s*<img[^>]+class="profile-photo"/s);
  assert.match(css, /--paper:\s*#ffffff/);
  assert.match(css, /--shell:\s*calc\(100vw\s*-\s*144px\)/);
  assert.match(css, /--accent:\s*#1e4f91/);
  assert.match(css, /\.page-shell\s*{[^}]*grid-template-columns:\s*270px\s+minmax\(0,\s*1fr\)/s);
  assert.match(css, /\.content-column\s*{[^}]*max-width:\s*none/s);
  assert.match(css, /\.site-nav\s*{[^}]*position:\s*sticky/s);
  assert.match(css, /body\s*{[^}]*background:\s*var\(--paper\)/s);
  assert.match(css, /body\s*{[^}]*font-family:\s*var\(--sans\)[^}]*font-size:\s*18px/s);
  assert.match(css, /\.site-nav a\s*{[^}]*font-size:\s*18px/s);
  assert.match(css, /\.site-nav \.site-brand\s*{[^}]*font-size:\s*23px/s);
  assert.match(css, /\.section-heading h2,[\s\S]*?\.about-copy h2\s*{[^}]*font-size:\s*31px/s);
  assert.doesNotMatch(css, /radial-gradient/);
  assert.match(css, /\.profile-photo-frame\s*{[^}]*width:\s*230px[^}]*height:\s*230px[^}]*overflow:\s*hidden[^}]*border-radius:\s*50%/s);
  assert.match(css, /\.profile-photo\s*{[^}]*object-fit:\s*cover[^}]*transform:\s*scale\(1\.45\)/s);
  assert.match(css, /\.reveal\s*{[^}]*opacity:\s*1[^}]*animation:\s*none/s);
});

test('links public work and reserves responsive publication artwork', async () => {
  const html = await readProjectFile('index.html');
  const css = await readProjectFile('assets/css/styles.css');
  const artwork = [
    'assets/img/publications/safuzzer-teaser.svg',
    'assets/img/publications/coeffi-teaser.svg',
    'assets/img/publications/under-review-teaser.svg',
  ];

  for (const path of artwork) {
    assert.ok(html.includes(`src="${path}"`), `${path} must be used by a publication`);
    assert.match(await readProjectFile(path), /<svg[^>]+viewBox="0 0 640 360"/);
  }

  assert.match(css, /\.publication-row\s*{[^}]*grid-template-columns:\s*190px\s+minmax\(0,\s*1fr\)/s);
  assert.match(css, /\.publication-visual\s*{[^}]*aspect-ratio:\s*16\s*\/\s*9/s);
  assert.ok((html.match(/class="inline-icon"/g) ?? []).length >= 3);
});

test('resolves and toggles color themes deterministically', async () => {
  const { nextTheme, resolveTheme } = await import('../assets/js/main.js');

  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme(null, true), 'light');
  assert.equal(resolveTheme('unexpected', false), 'light');
  assert.equal(nextTheme('dark'), 'light');
  assert.equal(nextTheme('light'), 'dark');
});

test('applies a theme with an accurate accessible action label', async () => {
  const { applyTheme } = await import('../assets/js/main.js');
  const label = { textContent: '' };
  const button = {
    attributes: {},
    querySelector(selector) {
      return selector === '.theme-toggle-text' ? label : null;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
  };
  const root = { dataset: {} };
  const themeMeta = {
    content: '',
    setAttribute(name, value) {
      if (name === 'content') this.content = value;
    },
  };

  applyTheme(root, button, 'dark', themeMeta);

  assert.equal(root.dataset.theme, 'dark');
  assert.equal(label.textContent, 'Dark');
  assert.equal(button.attributes['aria-label'], 'Switch to light theme');
  assert.equal(themeMeta.content, '#0f172a');

  applyTheme(root, button, 'light', themeMeta);

  assert.equal(root.dataset.theme, 'light');
  assert.equal(label.textContent, 'Light');
  assert.equal(button.attributes['aria-label'], 'Switch to dark theme');
  assert.equal(themeMeta.content, '#ffffff');
});

test('initializes from preferences and persists the next user choice', async () => {
  const { initializeTheme } = await import('../assets/js/main.js');
  const label = { textContent: '' };
  const button = new EventTarget();
  const attributes = {};
  button.querySelector = () => label;
  button.setAttribute = (name, value) => {
    attributes[name] = value;
  };
  const root = { dataset: {} };
  const saved = new Map([['leemeii-theme', 'dark']]);
  const storage = {
    getItem(key) {
      return saved.get(key) ?? null;
    },
    setItem(key, value) {
      saved.set(key, value);
    },
  };

  const initialTheme = initializeTheme({
    root,
    button,
    storage,
    mediaQuery: { matches: false },
  });
  assert.equal(initialTheme, 'dark');

  button.dispatchEvent(new Event('click'));

  assert.equal(root.dataset.theme, 'light');
  assert.equal(saved.get('leemeii-theme'), 'light');
  assert.equal(label.textContent, 'Light');
  assert.equal(attributes['aria-label'], 'Switch to dark theme');
});

test('falls back safely when browser storage is unavailable', async () => {
  const { initializeTheme } = await import('../assets/js/main.js');
  const root = { dataset: {} };
  const unavailableStorage = {
    getItem() {
      throw new Error('storage unavailable');
    },
  };

  const initialTheme = initializeTheme({
    root,
    button: null,
    storage: unavailableStorage,
    mediaQuery: { matches: true },
  });

  assert.equal(initialTheme, 'light');
  assert.equal(root.dataset.theme, 'light');
});

test('browser bootstrap survives a throwing localStorage property getter', async () => {
  const { initializeBrowserTheme } = await import('../assets/js/main.js');
  const browserWindow = {
    matchMedia() {
      return { matches: true };
    },
  };
  Object.defineProperty(browserWindow, 'localStorage', {
    get() {
      throw new DOMException('blocked', 'SecurityError');
    },
  });
  const root = { dataset: {} };
  const browserDocument = {
    documentElement: root,
    querySelector() {
      return null;
    },
  };

  assert.doesNotThrow(() => initializeBrowserTheme(browserWindow, browserDocument));
  assert.equal(root.dataset.theme, 'light');
});

test('first-paint theme defaults to light when storage is blocked', async () => {
  const html = await readProjectFile('index.html');
  const inlineScript = html.match(/<script>\s*([\s\S]*?)<\/script>/)?.[1];
  const root = { dataset: { theme: 'light' } };
  const context = {
    document: { documentElement: root },
    window: {
      matchMedia(query) {
        assert.equal(query, '(prefers-color-scheme: dark)');
        return { matches: true };
      },
    },
  };
  Object.defineProperty(context, 'localStorage', {
    get() {
      throw new DOMException('blocked', 'SecurityError');
    },
  });

  assert.ok(inlineScript, 'the first-paint theme script must exist');
  runInNewContext(inlineScript, context);

  assert.equal(root.dataset.theme, 'light');
});

test('resolves the most visible active section deterministically', async () => {
  const { resolveActiveSection } = await import('../assets/js/main.js');
  const order = ['about', 'news', 'research'];

  assert.equal(resolveActiveSection([
    { target: { id: 'news' }, isIntersecting: true, intersectionRatio: 0.4 },
    { target: { id: 'research' }, isIntersecting: true, intersectionRatio: 0.7 },
  ], order, 'about'), 'research');
  assert.equal(resolveActiveSection([
    { target: { id: 'research' }, isIntersecting: true, intersectionRatio: 0.5 },
    { target: { id: 'news' }, isIntersecting: true, intersectionRatio: 0.5 },
  ], order, 'about'), 'news');
  assert.equal(resolveActiveSection([
    { target: { id: 'research' }, isIntersecting: false, intersectionRatio: 1 },
  ], order, 'about'), 'about');
});

test('applies one accurate current-location marker to section links', async () => {
  const { applyActiveLink } = await import('../assets/js/main.js');
  const createLink = (hash) => ({
    hash,
    attributes: new Map(),
    setAttribute(name, value) {
      this.attributes.set(name, value);
    },
    removeAttribute(name) {
      this.attributes.delete(name);
    },
  });
  const links = [createLink('#about'), createLink('#news'), createLink('#research')];

  applyActiveLink(links, 'news');

  assert.equal(links[0].attributes.has('aria-current'), false);
  assert.equal(links[1].attributes.get('aria-current'), 'location');
  assert.equal(links[2].attributes.has('aria-current'), false);
});

test('leaves ordinary anchors untouched when section observation is unavailable', async () => {
  const { initializeSectionNavigation } = await import('../assets/js/main.js');
  const links = [{ hash: '#about', attributes: new Map() }];

  const navigation = initializeSectionNavigation({
    links,
    sections: [{ id: 'about' }],
    observerFactory: null,
  });

  assert.equal(navigation, null);
  assert.equal(links[0].attributes.size, 0);
});

test('updates link state from real observer entries', async () => {
  const { initializeSectionNavigation } = await import('../assets/js/main.js');
  const createLink = (hash) => ({
    hash,
    attributes: new Map(),
    setAttribute(name, value) {
      this.attributes.set(name, value);
    },
    removeAttribute(name) {
      this.attributes.delete(name);
    },
  });
  const links = [createLink('#about'), createLink('#news')];
  const sections = [{ id: 'about' }, { id: 'news' }];
  const observed = [];
  let notify = null;
  const observer = {
    observe(section) {
      observed.push(section.id);
    },
    disconnect() {},
  };

  const result = initializeSectionNavigation({
    links,
    sections,
    observerFactory(callback) {
      notify = callback;
      return observer;
    },
  });
  notify([
    { target: sections[0], isIntersecting: true, intersectionRatio: 0.2 },
    { target: sections[1], isIntersecting: true, intersectionRatio: 0.8 },
  ]);

  assert.equal(result, observer);
  assert.deepEqual(observed, ['about', 'news']);
  assert.equal(links[0].attributes.has('aria-current'), false);
  assert.equal(links[1].attributes.get('aria-current'), 'location');
});

test('keeps the most visible section active across incremental observer callbacks', async () => {
  const { initializeSectionNavigation } = await import('../assets/js/main.js');
  const createLink = (hash) => ({
    hash,
    attributes: new Map(),
    setAttribute(name, value) {
      this.attributes.set(name, value);
    },
    removeAttribute(name) {
      this.attributes.delete(name);
    },
  });
  const links = [createLink('#about'), createLink('#news')];
  const sections = [{ id: 'about' }, { id: 'news' }];
  let notify = null;

  initializeSectionNavigation({
    links,
    sections,
    observerFactory(callback) {
      notify = callback;
      return { observe() {} };
    },
  });

  notify([
    { target: sections[0], isIntersecting: true, intersectionRatio: 0.9 },
    { target: sections[1], isIntersecting: true, intersectionRatio: 0.4 },
  ]);
  notify([
    { target: sections[1], isIntersecting: true, intersectionRatio: 0.5 },
  ]);

  assert.equal(links[0].attributes.get('aria-current'), 'location');
  assert.equal(links[1].attributes.has('aria-current'), false);
});
