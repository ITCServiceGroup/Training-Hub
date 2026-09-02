(function preloadTheme() {
  const storageKey = 'codexThemePreferences';

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  };

  const rgbToHex = (r, g, b) =>
    `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

  const setVariable = (name, value) => {
    if (value) document.documentElement.style.setProperty(name, value, 'important');
  };

  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;

    const preferences = JSON.parse(stored) || {};
    const themeMode = preferences.themeMode || 'system';
    const resolvedTheme =
      themeMode === 'system'
        ? window.matchMedia?.('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : themeMode;

    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');

    const colors = preferences.themeColors;
    if (!colors?.primary || !colors?.secondary) return;

    const variant = resolvedTheme === 'dark' ? 'dark' : 'light';
    const primary = colors.primary[variant];
    const secondary = colors.secondary[variant];
    setVariable('--primary-color', primary);
    setVariable('--color-primary', primary);

    const rgb = hexToRgb(primary);
    if (rgb) {
      setVariable(
        '--primary-dark',
        rgbToHex(Math.round(rgb.r * 0.8), Math.round(rgb.g * 0.8), Math.round(rgb.b * 0.8))
      );
      setVariable(
        '--primary-light',
        rgbToHex(
          Math.min(255, Math.round(rgb.r + (255 - rgb.r) * 0.3)),
          Math.min(255, Math.round(rgb.g + (255 - rgb.g) * 0.3)),
          Math.min(255, Math.round(rgb.b + (255 - rgb.b) * 0.3))
        )
      );
    }

    setVariable('--secondary-color', secondary);
    setVariable('--color-secondary', secondary);
  } catch (error) {
    console.warn('Theme preload failed:', error);
  }
})();
