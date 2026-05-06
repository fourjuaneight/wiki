const themeToggle = document.getElementById('theme-toggle');

function getEffectiveTheme(): 'dark' | 'light' {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark') return 'dark';
  if (attr === 'light') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setTheme(theme: 'dark' | 'light'): void {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('wiki-theme', theme);
  } catch (_) {}
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = getEffectiveTheme();
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
}
