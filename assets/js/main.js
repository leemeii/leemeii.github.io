const THEME_KEY = 'leemeii-theme';

export function resolveTheme(storedTheme, prefersDark) {
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return prefersDark ? 'dark' : 'light';
}

export function nextTheme(currentTheme) {
  return currentTheme === 'dark' ? 'light' : 'dark';
}

export function applyTheme(root, button, theme) {
  root.dataset.theme = theme;

  if (!button) {
    return;
  }

  const isDark = theme === 'dark';
  const text = button.querySelector('.theme-toggle-text');
  button.setAttribute('aria-label', isDark ? '切换到浅色主题' : '切换到深色主题');

  if (text) {
    text.textContent = isDark ? 'Dark' : 'Light';
  }
}

export function initializeTheme({ root, button, storage, mediaQuery }) {
  let storedTheme = null;

  try {
    storedTheme = storage?.getItem(THEME_KEY) ?? null;
  } catch {
    storedTheme = null;
  }

  const initialTheme = resolveTheme(storedTheme, mediaQuery?.matches ?? false);
  applyTheme(root, button, initialTheme);

  if (!button) {
    return initialTheme;
  }

  button.addEventListener('click', () => {
    const theme = nextTheme(root.dataset.theme);
    applyTheme(root, button, theme);

    try {
      storage?.setItem(THEME_KEY, theme);
    } catch {
      // The visual preference still applies for the current page view.
    }
  });

  return initialTheme;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  initializeTheme({
    root: document.documentElement,
    button: document.querySelector('[data-theme-toggle]'),
    storage: window.localStorage,
    mediaQuery: window.matchMedia('(prefers-color-scheme: dark)'),
  });
}
