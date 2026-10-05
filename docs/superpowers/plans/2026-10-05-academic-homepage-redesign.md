# Meilin Li Academic Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current portfolio-style landing page with an English-first, bilingual-identity academic homepage using a sticky profile rail and a dense chronological research column.

**Architecture:** Keep the dependency-free static architecture: semantic content in `index.html`, the complete responsive design system in `assets/css/styles.css`, and progressive theme/scroll-spy behavior in `assets/js/main.js`. Extend the Node contract tests before each implementation change so content accuracy, privacy, accessibility, responsiveness, and browser fallbacks remain independently verifiable.

**Tech Stack:** HTML5, CSS3, browser ES modules, SVG, Node.js built-in test runner

**Spec:** `docs/superpowers/specs/2026-10-05-academic-homepage-redesign-design.md`

## Global Constraints

- Publish directly through GitHub Pages with no build step, framework, runtime fetch, or third-party dependency.
- Use English as the primary language and display `Meilin Li` with `李美霖` as supporting identity text.
- Publish `Leemeii@stu.cqu.edu.cn` and `https://github.com/leemeii`, but never publish phone, student number, QQ, date of birth, certificate/review/submission identifiers, or local filesystem paths.
- Label the ASE 2026 and EMNLP works as accepted; label the SIGMOD 2027 work as under review.
- Render only verified public URLs; do not create dead paper, code, DOI, or project controls.
- Preserve the existing uncommitted local-font, contrast, coordinate-privacy, theme-color, and storage-fallback improvements.
- Keep the page readable without JavaScript and usable with keyboard navigation and reduced-motion preferences.
- Support 360px mobile layouts through wide desktop layouts without horizontal page overflow.

## Review Focus

- Browser storage access can throw: theme initialization must still apply a deterministic system-based theme; Task 3 tests this.
- `IntersectionObserver` can be missing: every anchor must still work and no initialization error may occur; Task 3 tests this.
- Multiple observed sections can intersect simultaneously: active navigation must select one deterministically by visibility and document order; Task 3 tests this.
- Private data can appear accidentally while copying source material: the document contract must reject known private fields and Windows paths; Task 1 tests this.
- Long publication titles and bilingual identity can overflow narrow screens: the stylesheet must wrap them and prevent page-level overflow at 360px; Task 2 tests the required CSS contract and Task 4 verifies it visually.

---

## File Structure

- `index.html` — semantic academic content, metadata, section anchors, profile rail, and accessible controls.
- `assets/css/styles.css` — tokens, two-column layout, typography, light/dark themes, responsive rules, focus treatment, and motion.
- `assets/js/main.js` — pure theme and active-section decisions plus dependency-injected browser initialization.
- `assets/favicon.svg` — original `LM` monogram matching the profile artwork.
- `tests/site.test.mjs` — HTML/CSS/SVG contracts and unit tests for JavaScript behavior.
- `README.md` — local preview, verification, deployment, and content-maintenance guidance.

### Task 1: English-First Academic Content Contract

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `index.html`

**Interfaces:**
- Consumes: verified content and privacy decisions in the design spec; current theme-control hooks from `assets/js/main.js`.
- Produces: unique section IDs `about`, `news`, `research`, `publications`, `projects`, `honors`, and `activities`; `[data-section-link]` navigation anchors; `[data-theme-toggle]`; stable stylesheet and script paths.

- [ ] **Step 1: Replace the old content assertions with a failing English-first document contract**

Add tests named `publishes an English-first bilingual academic structure`, `presents current research outcomes accurately`, and `keeps private source data out of the public page`. Assert:

```js
assert.match(html, /<html[^>]+lang="en"/);
for (const id of ['about', 'news', 'research', 'publications', 'projects', 'honors', 'activities']) {
  assert.equal((html.match(new RegExp(`\\bid="${id}"`, 'g')) ?? []).length, 1);
}
for (const fact of [
  'Meilin Li', '李美霖', 'Chongqing University', 'Software Engineering',
  'Testing Static Analyzers via Semantic-Preserving Mutators',
  'CoEffi: Enhance Efficient Code Generation',
  'Detecting Logic Bugs in Vector DBMSs',
]) assert.ok(html.includes(fact));
assert.match(html, /Accepted\s*·\s*ASE 2026/);
assert.match(html, /Accepted\s*·\s*EMNLP 2026/);
assert.match(html, /Under Review\s*·\s*SIGMOD 2027/);
for (const secret of ['18223987782', '20241203', '434357686', '#2906', 'E:\\Personal_Honor', 'E:\\Projects']) {
  assert.ok(!html.includes(secret));
}
```

Also require a university `mailto:` link, the GitHub URL, one navigation link for every section, safe external-link attributes, the skip link, and no `href="#"` placeholders.

- [ ] **Step 2: Run the document tests and confirm the expected red state**

Run: `npm test`

Expected: FAIL because the current page is Chinese-first, lacks the new section contract, and still contains stale publication statuses and sections.

- [ ] **Step 3: Rewrite `index.html` around the profile rail and academic sections**

Use `<html lang="en">`, English metadata, and this public identity:

- `Meilin Li` with `<span lang="zh-CN">李美霖</span>`.
- `Undergraduate in Software Engineering` and `Chongqing University`.
- University email through a `mailto:` link and GitHub through a safe external link.
- `LM` monogram markup instead of a personal photograph.

Replace the old hero/journey flow with the seven required main sections. Use the newest source facts: 2025–26 GPA 3.86 with academic and comprehensive rankings both `1/119`, ASE 2026 and EMNLP 2026 acceptances, SIGMOD 2027 under review, National College Student Information Security Contest national second prize, National College Student Mathematics Competition provincial first prize, over 550,000 content reads, over 110,000 likes and saves, social practice, sport, and Oxford/Cambridge study experience. Omit unsupported links and all private proof details.

- [ ] **Step 4: Run the document contract and confirm green**

Run: `npm test`

Expected: PASS for all HTML/content/privacy tests; stylesheet/JavaScript tests may remain unchanged and passing.

- [ ] **Step 5: Commit the semantic redesign**

```powershell
git add index.html tests/site.test.mjs
git commit -m "feat: restructure homepage as academic profile"
```

### Task 2: Sticky Academic Layout and Visual System

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `assets/css/styles.css`
- Modify: `assets/favicon.svg`

**Interfaces:**
- Consumes: profile rail, section, publication, news, project, honor, and activity class hooks from Task 1.
- Produces: CSS tokens; `.page-shell`, `.profile-rail`, `.content-column`, `.section-nav`, `.publication-row`, `.news-row`; responsive and theme behavior; `LM` favicon artwork.

- [ ] **Step 1: Add failing visual-contract tests**

Add a test named `ships the sticky academic rail and narrow-screen fallback`. Require:

```js
assert.match(css, /\.page-shell\s*{[^}]*display:\s*grid/s);
assert.match(css, /\.profile-rail\s*{[^}]*position:\s*sticky/s);
assert.match(css, /grid-template-columns:\s*(?:minmax\([^;]+|\d+px)\s+minmax\(0,\s*1fr\)/);
assert.match(css, /@media\s*\(max-width:\s*900px\)/);
assert.match(css, /@media\s*\(max-width:\s*640px\)/);
assert.match(css, /overflow-wrap:\s*anywhere/);
assert.match(css, /overflow-x:\s*(?:hidden|clip)/);
assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
```

Keep the existing dark-theme, focus-visible, local-font, and contrast assertions. Add an SVG assertion for an accessible `LM`-based favicon title.

- [ ] **Step 2: Run the visual contract and confirm the expected red state**

Run: `npm test`

Expected: FAIL because the current stylesheet implements a full-width marketing hero rather than the specified profile rail and new class contract.

- [ ] **Step 3: Rebuild `assets/css/styles.css` as the academic dossier design system**

Define warm ivory, charcoal-green, muted ink, rule, and university-red tokens for both themes. Implement a centered desktop grid with a 270–310px sticky rail and a flexible reading column; compact news/publication rows; serif display type with local fallbacks; restrained dividers; visible focus; and short staged entry motion.

At `900px`, move the profile rail into normal flow above the content. At `640px`, make the section navigation horizontally scrollable and collapse dated rows to one column. Apply `min-width: 0`, `overflow-wrap: anywhere`, and page-level `overflow-x: clip` so bilingual identity and long titles remain safe at 360px. Preserve all existing contrast improvements and reduced-motion behavior.

- [ ] **Step 4: Redraw `assets/favicon.svg` as the matching monogram**

Keep `viewBox="0 0 64 64"`, add `<title>Meilin Li monogram</title>`, and use the same charcoal/ivory/red visual tokens without external assets.

- [ ] **Step 5: Run all tests and confirm green**

Run: `npm test`

Expected: all document, privacy, visual, contrast, and favicon contracts PASS.

- [ ] **Step 6: Commit the visual redesign**

```powershell
git add assets/css/styles.css assets/favicon.svg tests/site.test.mjs
git commit -m "feat: add sticky academic visual system"
```

### Task 3: Active Navigation and Resilient Theme Behavior

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `assets/js/main.js`

**Interfaces:**
- Consumes: `[data-section-link]` anchors, corresponding section IDs, `[data-theme-toggle]`, and `meta[name="theme-color"]`.
- Produces: `resolveActiveSection(entries, sectionOrder, currentId) -> string`; `applyActiveLink(links, activeId) -> void`; `initializeSectionNavigation({ links, sections, observerFactory }) -> { disconnect(): void } | null`; `initializeBrowserNavigation(windowRef, documentRef) -> { disconnect(): void } | null`; existing theme exports remain stable. `observerFactory` has the signature `(callback, options) -> { observe(element): void, disconnect(): void }`.

- [ ] **Step 1: Add failing unit tests for deterministic active-section selection**

Test that `resolveActiveSection` ignores non-intersecting entries, chooses the highest `intersectionRatio`, resolves equal ratios by `sectionOrder`, and returns `currentId` when no entry intersects.

```js
assert.equal(resolveActiveSection([
  { target: { id: 'news' }, isIntersecting: true, intersectionRatio: 0.4 },
  { target: { id: 'research' }, isIntersecting: true, intersectionRatio: 0.7 },
], ['about', 'news', 'research'], 'about'), 'research');
```

- [ ] **Step 2: Add failing tests for link state and unsupported observers**

Test that `applyActiveLink` assigns `aria-current="location"` only to the matching hash and removes it from other links. Test that `initializeSectionNavigation` returns `null` without throwing when `observerFactory` is absent, while the links remain ordinary usable anchors.

- [ ] **Step 3: Run the interaction tests and confirm the expected red state**

Run: `npm test`

Expected: FAIL because the new navigation exports do not exist.

- [ ] **Step 4: Implement the pure selection and link-state functions**

Add the exact Task 3 exports without changing `resolveTheme`, `nextTheme`, `applyTheme`, `initializeTheme`, or their storage-fallback semantics.

- [ ] **Step 5: Implement dependency-injected section navigation**

Observe every required section with a center-weighted root margin. On callback, resolve the active ID and update the links. When no observer is available, return `null` and do not modify anchor behavior. Return the observer so browser teardown remains possible.

- [ ] **Step 6: Extend browser bootstrap**

Keep `initializeBrowserTheme(windowRef, documentRef)` unchanged. Add `initializeBrowserNavigation(windowRef, documentRef)` to gather `[data-section-link]` anchors and matching sections, create an observer through `window.IntersectionObserver` when available, and delegate to `initializeSectionNavigation`. The module's browser guard calls both initializers and retains the existing protection against a throwing `localStorage` getter.

- [ ] **Step 7: Run all tests and confirm green**

Run: `npm test`

Expected: all theme, storage-fallback, active-section, observer-fallback, and page-contract tests PASS.

- [ ] **Step 8: Commit the interactions**

```powershell
git add assets/js/main.js tests/site.test.mjs
git commit -m "feat: add academic section navigation"
```

### Task 4: Documentation and End-to-End Verification

**Files:**
- Modify: `README.md`
- Modify if verification finds defects: `index.html`
- Modify if verification finds defects: `assets/css/styles.css`
- Modify if verification finds defects: `assets/js/main.js`
- Modify if verification finds defects: `tests/site.test.mjs`

**Interfaces:**
- Consumes: completed static homepage and its `npm test` contract.
- Produces: maintainable repository guidance and verification evidence for the finished site.

- [ ] **Step 1: Update `README.md` for the redesigned site**

Document the live URL, English-first academic purpose, file responsibilities, `python -m http.server 8000` preview command, `npm test` verification command, and the sections to edit when publications, news, or honors change. State that proof documents and private identifiers must never be copied into the public repository.

- [ ] **Step 2: Run the complete automated suite**

Run: `npm test`

Expected: all tests PASS with zero failures.

- [ ] **Step 3: Run a static HTTP smoke check**

Serve the repository root locally and request `/`, `/assets/css/styles.css`, `/assets/js/main.js`, and `/assets/favicon.svg`.

Expected: every asset returns HTTP 200, and the HTML response includes `Meilin Li`.

- [ ] **Step 4: Inspect desktop rendering**

Render at 1440×1000. Verify that the profile rail remains sticky, all sections are reachable, the English/Chinese name hierarchy is clear, accepted/review statuses are legible, the active navigation changes, email/GitHub links are correct, and both themes have sufficient contrast.

- [ ] **Step 5: Inspect mobile rendering**

Render at 390×844 and 360×800. Verify that the profile precedes content, navigation scrolls horizontally, long titles wrap, controls remain keyboard/touch reachable, reduced motion removes nonessential animation, and the document has no horizontal overflow.

- [ ] **Step 6: Re-run verification after any visual correction**

Run: `npm test`

Expected: all tests PASS after the final corrections.

- [ ] **Step 7: Commit documentation and final corrections**

```powershell
git add README.md index.html assets tests
git commit -m "docs: finalize academic homepage"
```
