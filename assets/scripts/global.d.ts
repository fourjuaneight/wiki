declare module '/_pagefind/pagefind.js' {
  interface PagefindResult {
    url: string;
    meta: { title: string };
    excerpt: string;
  }

  interface PagefindSearchResult {
    results: Array<{ data: () => Promise<PagefindResult> }>;
  }

  export function search(q: string): Promise<PagefindSearchResult>;
}
