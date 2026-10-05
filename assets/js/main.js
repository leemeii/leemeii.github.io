const THEME_KEY = 'leemeii-theme';
const THEME_COLORS = Object.freeze({
  light: '#ffffff',
  dark: '#0f172a',
});

export function resolveTheme(storedTheme, _prefersDark) {
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return 'light';
}

export function nextTheme(currentTheme) {
  return currentTheme === 'dark' ? 'light' : 'dark';
}

export function applyTheme(root, button, theme, themeMeta = null) {
  root.dataset.theme = theme;

  if (themeMeta) {
    themeMeta.setAttribute('content', THEME_COLORS[theme]);
  }

  if (!button) {
    return;
  }

  const isDark = theme === 'dark';
  const text = button.querySelector('.theme-toggle-text');
  button.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');

  if (text) {
    text.textContent = isDark ? 'Dark' : 'Light';
  }
}

export function initializeTheme({ root, button, storage, mediaQuery, themeMeta = null }) {
  let storedTheme = null;

  try {
    storedTheme = storage?.getItem(THEME_KEY) ?? null;
  } catch {
    storedTheme = null;
  }

  const initialTheme = resolveTheme(storedTheme, mediaQuery?.matches ?? false);
  applyTheme(root, button, initialTheme, themeMeta);

  if (!button) {
    return initialTheme;
  }

  button.addEventListener('click', () => {
    const theme = nextTheme(root.dataset.theme);
    applyTheme(root, button, theme, themeMeta);

    try {
      storage?.setItem(THEME_KEY, theme);
    } catch {
      // The visual preference still applies for the current page view.
    }
  });

  return initialTheme;
}

export function initializeBrowserTheme(windowRef, documentRef) {
  let storage = null;

  try {
    storage = windowRef.localStorage;
  } catch {
    storage = null;
  }

  return initializeTheme({
    root: documentRef.documentElement,
    button: documentRef.querySelector('[data-theme-toggle]'),
    themeMeta: documentRef.querySelector('meta[name="theme-color"]'),
    storage,
    mediaQuery: windowRef.matchMedia?.('(prefers-color-scheme: dark)') ?? { matches: false },
  });
}

export function resolveActiveSection(entries, sectionOrder, currentId) {
  const orderIndex = new Map(sectionOrder.map((id, index) => [id, index]));
  const visible = Array.from(entries)
    .filter((entry) => entry.isIntersecting && orderIndex.has(entry.target?.id))
    .sort((left, right) => {
      const ratioDifference = (right.intersectionRatio ?? 0) - (left.intersectionRatio ?? 0);
      if (ratioDifference !== 0) return ratioDifference;
      return orderIndex.get(left.target.id) - orderIndex.get(right.target.id);
    });

  return visible[0]?.target.id ?? currentId;
}

export function applyActiveLink(links, activeId) {
  for (const link of links) {
    const hash = link.hash ?? link.getAttribute?.('href') ?? '';
    if (hash === `#${activeId}`) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  }
}

export function initializeSectionNavigation({ links, sections, observerFactory }) {
  if (typeof observerFactory !== 'function' || sections.length === 0 || links.length === 0) {
    return null;
  }

  const sectionOrder = sections.map((section) => section.id);
  const sectionIds = new Set(sectionOrder);
  const visibilityById = new Map(sections.map((section) => [section.id, {
    target: section,
    isIntersecting: false,
    intersectionRatio: 0,
  }]));
  let currentId = sectionOrder[0];
  applyActiveLink(links, currentId);

  const observer = observerFactory((entries) => {
    for (const entry of entries) {
      if (sectionIds.has(entry.target?.id)) {
        visibilityById.set(entry.target.id, entry);
      }
    }

    currentId = resolveActiveSection(visibilityById.values(), sectionOrder, currentId);
    applyActiveLink(links, currentId);
  }, {
    rootMargin: '-22% 0px -58% 0px',
    threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
  });

  for (const section of sections) {
    observer.observe(section);
  }

  return observer;
}

export function initializeBrowserNavigation(windowRef, documentRef) {
  const links = Array.from(documentRef.querySelectorAll?.('[data-section-link]') ?? []);
  const sections = links
    .map((link) => documentRef.getElementById?.(link.hash.slice(1)))
    .filter(Boolean);
  const Observer = windowRef.IntersectionObserver;
  const observerFactory = typeof Observer === 'function'
    ? (callback, options) => new Observer(callback, options)
    : null;

  return initializeSectionNavigation({ links, sections, observerFactory });
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  initializeBrowserTheme(window, document);
  initializeBrowserNavigation(window, document);
}
