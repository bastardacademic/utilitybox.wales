/** Builds a schema.org WebApplication JSON-LD record for a free, browser-only tool page. */
export function toolSchema(options: { name: string; description: string; path: string }): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: options.name,
    description: options.description,
    url: `https://utilitybox.wales${options.path}`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (runs in browser)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP'
    }
  };
}
