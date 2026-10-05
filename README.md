# Meilin Li · Academic Homepage

An English-first academic homepage for **Meilin Li / 李美霖**, an undergraduate in Software Engineering at Chongqing University. The site presents a concise biography, news, publications, honors, and activities in a compact profile-rail layout inspired by modern academic CVs.

## Live site

[leemeii.github.io](https://leemeii.github.io/)

## Local preview

From the repository root, start a static server:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Verification

```powershell
npm test
```

The Node test suite checks page structure, publication statuses, privacy boundaries, internal and external links, responsive CSS, contrast tokens, theme behavior, and active-section navigation.

## Project structure

- `index.html` — public profile content, metadata, navigation, publications, news, and honors.
- `assets/css/styles.css` — visual system, sticky profile rail, themes, responsive layout, and reduced-motion behavior.
- `assets/js/main.js` — persistent theme preference and active-section navigation.
- `assets/img/meilin-li.jpg` — the locally hosted profile photograph.
- `assets/favicon.svg` — the `LML` monogram.
- `tests/site.test.mjs` — automated content, privacy, accessibility, layout, and interaction contracts.
- `docs/superpowers/` — approved design specification and implementation plan.

## Updating content

- Add recent events to the `#news` section in `index.html`, newest first.
- Update research outcomes in `#publications`; keep accepted and under-review statuses exact.
- Add only selected, confirmed items to `#honors`.
- Add external buttons only when a verified public URL exists.
- Run `npm test` after every content change.

Proof documents, local evidence paths, phone numbers, student identifiers, account identifiers, certificate numbers, submission IDs, and private review details must never be copied into this public repository.
