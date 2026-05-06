const headings = Array.from(
  document.querySelectorAll<HTMLHeadingElement>('.doc h2[id], .doc h3[id]')
);

const allTocLinks = Array.from(
  document.querySelectorAll<HTMLAnchorElement>('.toc-col a, .toc-drawer a')
);

function setActiveLink(id: string): void {
  allTocLinks.forEach((link) => {
    const matches = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('active', matches);
  });
}

if (headings.length > 0 && allTocLinks.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveLink((entry.target as HTMLElement).id);
          break;
        }
      }
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
  );

  headings.forEach((h) => observer.observe(h));
}

allTocLinks.forEach((link) => {
  link.addEventListener('click', (e: MouseEvent) => {
    const href = link.getAttribute('href');
    if (!href?.startsWith('#')) return;
    e.preventDefault();
    const target = document.querySelector<HTMLElement>(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', href);
    }
  });
});
