/** Returns a path string. Callers that navigate to it MUST use router.parseUrl / navigateByUrl. */
export function safeRedirect(raw: string | null): string {
  if (!raw) return '/';
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('://')) return '/';
  return raw;
}
