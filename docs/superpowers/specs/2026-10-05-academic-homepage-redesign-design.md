# Meilin Li Academic Homepage Redesign

## Purpose

Redesign `leemeii.github.io` as an English-first academic homepage for Meilin Li / 李美霖. The page should follow the structural character of Jialun Cao's academic homepage—persistent profile navigation beside a dense, chronological content column—while using original visual styling and Meilin's verified material.

The homepage should help research collaborators, faculty members, scholarship reviewers, and fellow students understand Meilin's research direction and strongest work quickly. It must publish directly through GitHub Pages without a build step.

## Public Identity and Privacy

- Display the primary name as `Meilin Li`, with `李美霖` as supporting text.
- Display `Undergraduate in Software Engineering`, `Chongqing University`, and the university email address supplied in the source material.
- Link to `https://github.com/leemeii`.
- Use an original `LM` monogram portrait because no suitable public portrait was found in the supplied files.
- Never publish a phone number, student number, QQ number, date of birth, certificate identifier, review score, submission identifier, or local evidence-file path.
- Do not expose forms, certificates, or application archives as downloadable assets.

## Information Sources

Content is reconciled from:

- `E:\Personal_Honor`, prioritizing the newest completed application forms and supporting records.
- `E:\Projects\-\honors`, especially `总表.md` and the category records.
- Existing public homepage content and repository documentation.

When sources conflict, the newest specific record wins. Only confirmed public-facing facts appear on the page. Unconfirmed project names, roles, dates, and links are omitted rather than replaced with placeholders.

## Information Architecture

The site remains a single-page static document with stable anchor navigation.

1. **Profile rail** — monogram portrait, bilingual name, current role, university, location, email, GitHub, theme control, and section navigation.
2. **About** — concise English biography, current research focus, and research-interest tags.
3. **News** — reverse-chronological highlights for publications, major awards, research activities, and selected experiences.
4. **Research Interests** — software testing, static analysis, vector database systems, and intelligent code generation.
5. **Publications** — a compact academic bibliography with author role, venue, year, and an accurate status label.
6. **Projects & Open Source** — selected research systems, competition work, and contributions to static-analysis projects.
7. **Honors & Awards** — a curated list of high-signal academic, research, and competition honors.
8. **Activities** — knowledge sharing, social practice, sport, volunteering, and international study experience.
9. **Footer** — copyright and a short update note.

The page will not include a separate journey section or oversized marketing hero. Its hierarchy should resemble a focused academic CV rather than a commercial portfolio.

## Content Decisions

### Biography

The biography presents Meilin as a 2024-entry undergraduate in Software Engineering at Chongqing University whose work centers on dependable software through testing, program analysis, database systems, and code intelligence. It may mention first-place academic standing and a preference for evidence-driven research, but it should avoid application-style self-praise.

### Publications

The publication section distinguishes accepted work from ongoing review:

- ASE 2026 paper on testing static analyzers — accepted, first author.
- EMNLP paper on efficient code generation — accepted, fourth author.
- SIGMOD 2027 paper on logic bugs in vector DBMSs — under review, first author.

No paper receives a fabricated paper, code, DOI, or project link. Links are rendered only when a verified public URL exists.

### Current Facts

The redesign uses the newest verified figures instead of stale homepage copy, including the latest academic rankings, national information-security competition result, research acceptances, and knowledge-sharing reach. Time-sensitive social metrics are rounded and dated or phrased with `over` so that the copy remains honest as values grow.

### Selection and Density

News and honors prioritize the most meaningful items. The page should not reproduce every line from the private honor archive. Long evidence lists are distilled into readable public summaries.

## Visual Design

### Direction

The visual direction is a restrained modern academic dossier. It borrows the reference site's fixed-profile/scrolling-content relationship, not its branding or source code.

- Warm ivory paper background in light mode and deep charcoal-green in dark mode.
- Near-black body text with Chongqing University red used sparingly for dates, active navigation, status marks, and focus states.
- A literary serif display face using reliable local font fallbacks, paired with a precise sans-serif body face.
- Fine rules, compact metadata, and deliberate whitespace instead of rounded dashboard cards.
- Original geometric `LM` monogram artwork with subtle grid and orbital details.

### Desktop Layout

- A centered shell with a left profile rail of roughly 270–310 pixels and a wider content column.
- The profile rail remains sticky below the viewport edge while the main column scrolls.
- Section headings, dates, publication metadata, and list content align to a consistent editorial grid.
- Active navigation reflects the section nearest the reading position.

### Mobile Layout

- Below the tablet breakpoint, the rail becomes a compact top profile block.
- Navigation becomes a horizontally scrollable sticky strip with visible focus states.
- Publication and news rows collapse from date/content columns into a single readable flow.
- The layout must remain free of horizontal page overflow at 360 pixels.

### Motion

- A short, staggered initial reveal establishes hierarchy.
- Section navigation and theme transitions remain subtle and fast.
- `prefers-reduced-motion: reduce` disables nonessential animation and smooth scrolling.

## Interaction Design

- Anchor navigation scrolls to every main section and updates its active state as the reader moves.
- The theme toggle resolves saved preference first, then the system preference, and persists explicit user choices when storage is available.
- The email control uses a `mailto:` link; GitHub opens in a new tab with safe relationship attributes.
- Keyboard users receive a skip link, logical tab order, and visible focus indicators.
- JavaScript enhances navigation and theme behavior but is not required to read any content.

## Technical Architecture

The site stays build-free and dependency-free:

- `index.html` owns semantic structure, metadata, and public content.
- `assets/css/styles.css` owns design tokens, layout, themes, responsive behavior, and motion.
- `assets/js/main.js` owns theme preference and active-section navigation.
- `assets/favicon.svg` remains a lightweight brand asset and may be revised to match the new monogram.
- `tests/site.test.mjs` verifies the document contract, privacy rules, content accuracy, asset paths, accessibility hooks, themes, and navigation logic.

The existing uncommitted accessibility, local-font, privacy, and theme-metadata improvements must be preserved while the redesign is implemented.

## Data Flow and Failure Handling

Public content is authored directly in HTML from reconciled source notes; there is no runtime data fetch. This keeps GitHub Pages deployment deterministic and prevents local evidence paths from leaking.

Theme initialization catches unavailable browser storage and falls back to the system preference. Active-section logic tolerates a missing `IntersectionObserver` by leaving anchor navigation fully functional. Missing optional external links result in plain text, not dead controls.

## Verification

Automated checks will cover:

- Required section IDs and resolvable internal anchors.
- English-first metadata and bilingual identity.
- Accurate accepted/under-review publication labels.
- Presence of selected current facts and absence of stale claims.
- Absence of private identifiers and local filesystem paths.
- Safe external links, accessible labels, skip navigation, focus styles, and reduced-motion support.
- Responsive breakpoints, dark theme declarations, and theme/navigation unit behavior.

Manual verification will cover desktop and mobile rendering, sticky behavior, navigation highlighting, email and GitHub links, theme switching, typography, contrast, wrapping, and horizontal overflow.

## Acceptance Criteria

- The result visually reads as an academic homepage in the same broad layout family as the supplied reference while remaining an original design.
- A visitor can identify Meilin, her institution, research focus, accepted publications, strongest projects, and major honors within the first two screenfuls.
- English is the primary language; `李美霖` is clearly presented alongside the English name.
- Facts match the newest supplied evidence and private information is excluded.
- The site works without a build step and remains usable without JavaScript.
- Automated tests pass, and manual checks succeed at representative desktop and mobile widths.
