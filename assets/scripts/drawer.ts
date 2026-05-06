const drawerScrim = document.getElementById('drawer-scrim');
const sidebarDrawer = document.getElementById('sidebar-drawer');
const tocDrawer = document.getElementById('toc-drawer');
const menuBtn = document.getElementById('menu-btn');
const tocBtn = document.getElementById('toc-btn');
const sidebarClose = document.getElementById('sidebar-close');
const tocDrawerClose = document.getElementById('toc-drawer-close');

type DrawerType = 'sidebar' | 'toc';

function openDrawer(type: DrawerType): void {
  drawerScrim?.classList.add('active');
  document.body.classList.add('no-scroll');
  if (type === 'sidebar') sidebarDrawer?.classList.add('open');
  if (type === 'toc') tocDrawer?.classList.add('open');
}

function closeDrawer(type?: DrawerType): void {
  if (!type || type === 'sidebar') sidebarDrawer?.classList.remove('open');
  if (!type || type === 'toc') tocDrawer?.classList.remove('open');
  const anyOpen =
    sidebarDrawer?.classList.contains('open') ||
    tocDrawer?.classList.contains('open');
  if (!anyOpen) {
    drawerScrim?.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }
}

menuBtn?.addEventListener('click', () => openDrawer('sidebar'));
tocBtn?.addEventListener('click', () => openDrawer('toc'));
sidebarClose?.addEventListener('click', () => closeDrawer('sidebar'));
tocDrawerClose?.addEventListener('click', () => closeDrawer('toc'));
drawerScrim?.addEventListener('click', () => closeDrawer());

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeDrawer();
});

sidebarDrawer?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 720) closeDrawer('sidebar');
  });
});

tocDrawer?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 1100) closeDrawer('toc');
  });
});
