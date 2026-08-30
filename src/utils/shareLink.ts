/** Helpers for reading/writing tool state as URL query params, so a specific calculation can be shared or bookmarked. */

export function getShareParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

export function buildShareUrl(params: Record<string, string>): string {
  const url = new URL(window.location.pathname, window.location.origin);
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value != null) url.searchParams.set(key, value);
  }
  return url.toString();
}

/** Copies a shareable link built from `params` to the clipboard, with brief button feedback. */
export async function copyShareLink(params: Record<string, string>, button: HTMLButtonElement): Promise<void> {
  const url = buildShareUrl(params);
  try {
    await navigator.clipboard.writeText(url);
    const original = button.textContent;
    button.textContent = 'Link copied!';
    setTimeout(() => {
      button.textContent = original;
    }, 1500);
  } catch {
    // Clipboard API unavailable — silently ignore.
  }
}
