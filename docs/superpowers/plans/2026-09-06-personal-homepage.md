# leemeii Personal Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, responsive academic-style homepage from the supplied achievements that publishes directly through GitHub Pages.

**Architecture:** A semantic static `index.html` owns all public content, a focused stylesheet owns layout and themes, and a small ES module owns theme preference behavior. Node's built-in test runner verifies the document contract and pure theme functions without adding a framework or build system.

**Tech Stack:** HTML5, CSS3, browser ES modules, Node.js 22 built-in test runner

**Spec:** `docs/superpowers/specs/2026-09-06-personal-homepage-design.md`

## Global Constraints

- Deploy as a build-free static site from the repository root.
- Identify the owner publicly as `leemeii`; do not infer private identity or contact details.
- Keep submitted papers visibly labeled as submissions and never imply acceptance.
- Do not expose proof-material paths, review scores, certificate identifiers, or unavailable links.
- Keep the page, metadata, source comments, and footer free of the prohibited product-brand strings named in the design spec.
- Support keyboard navigation, reduced motion, light/dark themes, and 360px through 1440px viewports.

---

### Task 1: Semantic Page and Content Contract

**Files:**
- Create: `package.json`
- Create: `tests/site.test.mjs`
- Create: `index.html`

**Interfaces:**
- Consumes: Achievement facts and content rules in the design spec.
- Produces: Stable section IDs `about`, `research`, `honors`, `journey`, and `contact`; asset references used by later tasks.

- [ ] **Step 1: Add the test runner and failing document-contract tests**

Create `package.json` with `"type": "module"` and `"test": "node --test"`. In `tests/site.test.mjs`, read `index.html` and assert the Chinese language declaration, viewport metadata, unique section IDs, complete internal anchors, external-link safety attributes, GitHub profile URL, key supplied achievements, clear submission labels, and absence of prohibited product-brand strings.

```js
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /<html[^>]+lang="zh-CN"/);
for (const id of ['about', 'research', 'honors', 'journey', 'contact']) {
  assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) ?? []).length, 1);
}
assert.match(html, /https:\/\/github\.com\/leemeii/);
assert.match(html, /3\.85/);
assert.match(html, /Under Review|Submitted/);
```

- [ ] **Step 2: Run the tests and confirm the expected red state**

Run: `npm test`

Expected: FAIL because `index.html` does not exist.

- [ ] **Step 3: Implement the semantic homepage**

Create a Chinese-first document with a skip link, sticky header, hero, `main` landmarks, research articles, honors lists, annual timeline, contact callout, and footer. Use honest public copy such as:

```html
<article class="work-item">
  <p class="work-meta"><span>First Author</span><span>Submitted · ASE 2026</span></p>
  <h3>Testing Static Analyzers via Semantic-Preserving Mutators Learned from Real-World Refactoring Practice</h3>
</article>
```

Reference `/assets/css/styles.css` and `/assets/js/main.js` as stable paths even though those assets arrive in later test cycles.

- [ ] **Step 4: Run the document tests and confirm green**

Run: `npm test`

Expected: document-contract tests PASS.

- [ ] **Step 5: Commit the semantic page**

```powershell
git add package.json tests/site.test.mjs index.html
git commit -m "feat: add semantic personal homepage"
```

### Task 2: Editorial Visual System and Responsive Layout

**Files:**
- Modify: `tests/site.test.mjs`
- Create: `assets/css/styles.css`

**Interfaces:**
- Consumes: Class names and asset link in `index.html`.
- Produces: CSS custom properties, page layout, theme selectors, responsive rules, focus styles, and reduced-motion handling.

- [ ] **Step 1: Add failing stylesheet-contract tests**

Read `assets/css/styles.css` and assert the design tokens, dark-theme selector, sticky header, responsive breakpoints, visible focus state, reduced-motion query, and no horizontal page overflow.

```js
const css = await readFile(new URL('../assets/css/styles.css', import.meta.url), 'utf8');
assert.match(css, /--paper:/);
assert.match(css, /\[data-theme=['"]dark['"]\]/);
assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
assert.match(css, /:focus-visible/);
```

- [ ] **Step 2: Run the tests and confirm the expected red state**

Run: `npm test`

Expected: FAIL because `assets/css/styles.css` does not exist.

- [ ] **Step 3: Implement the visual system**

Define warm-paper and ink tokens, an asymmetrical hero grid, typographic display scale, numbered research rows, restrained bordered honors groups, a vertical journey line, dark theme overrides, and carefully targeted breakpoints at 960px and 640px. Use CSS-only staged entry animation and disable transitions and animation under reduced-motion preference.

```css
:root {
  --paper: #f4f0e6;
  --ink: #16332b;
  --accent: #b63b2e;
  --line: color-mix(in srgb, var(--ink) 18%, transparent);
}

[data-theme="dark"] {
  --paper: #10201b;
  --ink: #edf0e5;
  --accent: #f07b63;
}
```

- [ ] **Step 4: Run all tests and confirm green**

Run: `npm test`

Expected: all document and stylesheet tests PASS.

- [ ] **Step 5: Commit the visual system**

```powershell
git add tests/site.test.mjs assets/css/styles.css
git commit -m "feat: add editorial responsive styling"
```

### Task 3: Theme Preference Behavior

**Files:**
- Modify: `tests/site.test.mjs`
- Create: `assets/js/main.js`

**Interfaces:**
- Consumes: `[data-theme-toggle]` button and document root from `index.html`.
- Produces: `resolveTheme(storedTheme, prefersDark)`, `nextTheme(currentTheme)`, `applyTheme(root, button, theme)`, and `initializeTheme(options)` exports.

- [ ] **Step 1: Add failing unit tests for theme decisions**

Import the theme functions and assert that valid stored preferences win, invalid stored values fall back to system preference, toggling is deterministic, and applying a theme updates both the root dataset and accessible button label.

```js
assert.equal(resolveTheme('light', true), 'light');
assert.equal(resolveTheme(null, true), 'dark');
assert.equal(nextTheme('dark'), 'light');
```

- [ ] **Step 2: Run the tests and confirm the expected red state**

Run: `npm test`

Expected: FAIL because `assets/js/main.js` does not exist.

- [ ] **Step 3: Implement minimal theme behavior**

Implement pure decision functions plus dependency-injected initialization. Browser bootstrap reads `localStorage`, checks `matchMedia`, applies the initial theme, and stores the next value when the theme button is clicked. Storage failures are caught so private browsing restrictions cannot break the page.

```js
export function resolveTheme(storedTheme, prefersDark) {
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
  return prefersDark ? 'dark' : 'light';
}

export function nextTheme(currentTheme) {
  return currentTheme === 'dark' ? 'light' : 'dark';
}
```

- [ ] **Step 4: Run all tests and confirm green**

Run: `npm test`

Expected: all tests PASS with zero warnings.

- [ ] **Step 5: Commit the theme behavior**

```powershell
git add tests/site.test.mjs assets/js/main.js
git commit -m "feat: add persistent color theme"
```

### Task 4: Repository Presentation and Final Verification

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: Completed homepage and verification commands.
- Produces: Concise repository documentation for local preview and GitHub Pages publishing.

- [ ] **Step 1: Update repository documentation**

Document the homepage URL, local preview with `python -m http.server 8000`, test command, file structure, and content-update locations without adding tool attribution.

- [ ] **Step 2: Run automated verification**

Run: `npm test`

Expected: all tests PASS.

- [ ] **Step 3: Run a local HTTP smoke check**

Start a temporary local server and request `/`, `/assets/css/styles.css`, and `/assets/js/main.js`; each response must return HTTP 200.

- [ ] **Step 4: Inspect the rendered page at desktop and mobile widths**

Capture the homepage at 1440px and 390px widths. Verify hierarchy, wrapping, contrast, navigation reachability, theme switching, and absence of horizontal overflow.

- [ ] **Step 5: Commit documentation and final corrections**

```powershell
git add README.md index.html assets tests package.json
git commit -m "docs: add homepage usage notes"
```
