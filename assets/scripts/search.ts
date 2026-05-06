const modal = document.getElementById('search-modal');
const scrim = document.getElementById('search-scrim');
const trigger = document.getElementById('search-trigger');
const closeBtn = document.getElementById('search-close');
const input = document.getElementById('search-input') as HTMLInputElement | null;
const resultsList = document.getElementById('search-results-list');

type PagefindResult = {
  url: string;
  meta: { title: string };
  excerpt: string;
};

type PagefindModule = {
  search: (q: string) => Promise<{
    results: Array<{ data: () => Promise<PagefindResult> }>;
  }>;
};

let pagefind: PagefindModule | null = null;

async function loadPagefind(): Promise<void> {
  if (pagefind) return;
  try {
    pagefind = (await import('/_pagefind/pagefind.js')) as PagefindModule;
  } catch (_) {
    // not in production or not built yet
  }
}

function openModal(): void {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('open');
  document.body.classList.add('no-scroll');
  setTimeout(() => input?.focus(), 50);
  loadPagefind();
}

function closeModal(): void {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('open');
  document.body.classList.remove('no-scroll');
  if (input) input.value = '';
  if (resultsList) resultsList.innerHTML = '';
}

async function handleSearch(query: string): Promise<void> {
  if (!resultsList || !pagefind || !query.trim()) {
    if (resultsList) resultsList.innerHTML = '';
    return;
  }
  const search = await pagefind.search(query);
  const results = await Promise.all(
    search.results.slice(0, 8).map((r) => r.data())
  );
  resultsList.innerHTML = results
    .map((r) => {
      const crumb = r.url
        .replace(/\/$/, '')
        .split('/')
        .filter(Boolean)
        .join(' / ');
      return `<a class="search-result" href="${r.url}">
      <span class="search-result-title">${r.meta.title || r.url}</span>
      <span class="search-result-crumb">${crumb}</span>
    </a>`;
    })
    .join('');
  resultsList
    .querySelectorAll<HTMLAnchorElement>('.search-result')
    .forEach((el) => {
      el.addEventListener('click', closeModal);
    });
}

trigger?.addEventListener('click', openModal);
closeBtn?.addEventListener('click', closeModal);
scrim?.addEventListener('click', closeModal);

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const isOpen = modal?.classList.contains('open');
    isOpen ? closeModal() : openModal();
  }
  if (e.key === 'Escape') closeModal();
});

input?.addEventListener('input', () => {
  if (input) handleSearch(input.value);
});
