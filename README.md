# UtilityBox

Free online calculators and everyday utility tools, built with [Astro](https://astro.build) and TypeScript. Static output, no backend required.

## Tools

**Calculators**
- Scientific calculator (trig, logs, powers, roots, constants)
- Currency converter (live rates via the Frankfurter/ECB API)
- Unit converter (length, weight, temperature, volume, area, speed, data, time)
- UK salary calculator (income tax, National Insurance, student loan, pension — 2024/25 bands)
- Percentage calculator (X% of Y, what % is X of Y, percentage change)
- VAT calculator (add/remove UK VAT at any rate)
- Tip calculator (tip amount, total, per-person split)
- Loan/mortgage repayment calculator (monthly payment, total interest)

**Networking**
- CIDR / subnet calculator (network & broadcast address, host ranges, subnet splitting)
- HTTP status code reference (searchable, 1xx–5xx)
- Port number reference (searchable common TCP/UDP ports)
- MAC address formatter/validator (colon/hyphen/dot notation, locally-administered/multicast detection)

**Word Games**
- Word unscrambler
- Word builder (with pattern matching and Scrabble scoring)
- Word/character counter (with reading and speaking time estimates)
- Case converter (UPPER/lower/Title/Sentence/camelCase/PascalCase/snake_case/kebab-case/CONSTANT_CASE)
- Palindrome checker
- Anagram solver

**Generators**
- Random string generator (passwords, tokens, UUID v4 — uses `crypto.getRandomValues`)
- Lorem Ipsum generator
- Color converter (HEX/RGB/HSL + palette generator)
- Slug generator (URL-safe kebab-case/snake_case)
- Placeholder image generator (SVG, no image library needed)

**Developer Tools**
- JSON formatter/validator (pretty-print, minify, error line/column)
- Regex tester with live match highlighting
- Diff viewer (line-level LCS diff)
- Base64 encoder/decoder (UTF-8 safe, optional URL-safe alphabet)
- JWT decoder (decodes header/payload only — does not verify the signature)
- Cron expression parser (plain-language summary + next run times)
- Hash generator (SHA-1/256/384/512 via native Web Crypto)
- URL encoder/decoder (component and full-URI modes)
- Unix timestamp converter (seconds/milliseconds ⇄ date)
- HTML entity encoder/decoder

## Project structure

```
src/
  components/
    calculators/    Scientific, Currency, Measurements, UKSalary, NetworkCalc,
                       PercentageCalculator, VatCalculator, TipCalculator, LoanCalculator
    tools/           WordUnscrambler, WordBuilder, RandomString, LoremIpsum,
                       JsonFormatter, RegexTester, DiffViewer, Base64Tool, JwtDecoder, CronParser,
                       HttpStatusReference, PortReference, MacFormatter,
                       WordCounter, CaseConverter, PalindromeChecker, AnagramSolver,
                       ColorConverter, SlugGenerator, PlaceholderImageGenerator,
                       HashGenerator, UrlEncoder, TimestampConverter, HtmlEntityEncoder
    ToolLayout.astro Two-column layout shared by every tool page
  layouts/
    Layout.astro     Base HTML shell: header, nav, dark mode toggle, footer
  pages/
    index.astro      Home page / tools directory
    tools/*.astro     One route per tool
  styles/
    global.css        CSS variables, dark mode, base styles
  utils/
    calculators.ts    Expression evaluator, unit conversion, UK salary logic
    network.ts         IPv4 / CIDR math
    generators.ts       Random string + Lorem Ipsum generation
    words.ts             Unscramble / word-building / Scrabble scoring
    json.ts               JSON format/minify/validate with error position
    regexTool.ts           Regex matching + HTML-safe match highlighting
    diff.ts                 Line-level LCS diff algorithm
    encoding.ts              UTF-8 safe Base64 / Base64URL
    jwt.ts                    JWT decode (no signature verification)
    cron.ts                    Cron parsing, next-run calc, plain-language summary
    finance.ts                  Percentage, VAT, tip, and loan repayment math
    httpStatus.ts                 HTTP status code reference data
    ports.ts                       Common port number reference data
    mac.ts                          MAC address validation/formatting
    textStats.ts                     Word/char/sentence counting, reading time
    textCase.ts                       Case conversions (camelCase, snake_case, etc.)
    color.ts                           HEX/RGB/HSL conversion and palette generation
    slug.ts                             URL-safe slug generation
    placeholderImage.ts                  SVG placeholder image generation
    hash.ts                                SHA hashing via native Web Crypto
    urlEncoding.ts                          URL component/full-URI encoding
    timestamp.ts                             Unix timestamp conversion
    htmlEntities.ts                           HTML entity encode/decode
    seo.ts               JSON-LD structured-data helper for tool pages
    shareLink.ts          Read/write tool state as URL query params
  pages/
    404.astro          Custom not-found page
    privacy.astro     Privacy policy
    sitemap.xml.ts     Hand-rolled sitemap endpoint (no extra dependency)
public/
  data/dictionary.json  Word list used by the word-game tools
  robots.txt              Crawler rules + sitemap pointer
  og-image.png            Social share preview image (1200x630)
  favicon.svg, favicon.ico, favicon-32.png,
  apple-touch-icon.png, icon-192.png, icon-512.png   Full favicon/icon set
  site.webmanifest        Icon manifest for "add to home screen"
```

## Development

```bash
npm install
npm run dev
```

```bash
npm run build    # type-check and build static site to dist/
npm run preview  # preview the production build locally
```

## Deployment

Hosted via [IONOS Deploy Now](https://www.ionos.com/hosting/deploy-now), which builds and deploys straight from a GitHub repo on every push — no server to manage.

**One-time setup:**
1. Push this repo to GitHub (see below).
2. In the IONOS dashboard, create a Deploy Now project and connect it to the GitHub repo.
3. If it isn't auto-detected as a static project, configure it manually:
   - **Build command**: `npm ci && npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 20.x
4. Point `utilitybox.wales` at the project in the IONOS dashboard (Deploy Now provisions HTTPS automatically).

**Every time you want to ship:** push to `main` on GitHub. Deploy Now picks it up, builds, and publishes automatically.

## Notes

- All interactive tools run entirely client-side — no user data is sent to a server, except the currency converter, which fetches exchange rates from the public Frankfurter API.
- The word dictionary in `public/data/dictionary.json` is a curated common-word list (~2,700 words). Swap it for a larger word list if you need full Scrabble-dictionary coverage.
- Tax and NI figures in the UK salary calculator reflect the 2024/25 tax year and are for guidance only.
- Every tool page carries a `WebApplication` JSON-LD block (see `src/utils/seo.ts`) plus a `BreadcrumbList` block (added in `ToolLayout.astro`), a canonical URL, and Open Graph/Twitter Card tags (including the generated `og-image.png`) via `Layout.astro`.
- Every calculator has a "Copy" or "Copy summary" button next to its result, plus a "🔗 Share" button that copies a link pre-filled with the current inputs via URL query params (see `src/utils/shareLink.ts`) — e.g. `/tools/network/?cidr=10.0.0.0/8`.
- A "Skip to content" link (visible on keyboard focus) lets keyboard/screen-reader users bypass the header nav.
- The favicon/icon set (`favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`) was generated with a small pure-Python script (stdlib only, no installs) rather than a design tool — regenerate or replace with real brand assets whenever you have them.
- `/privacy` describes what the site actually does today (no accounts, no cookies, no analytics). Update it before turning on ads or analytics — see the "Advertising and analytics" section, which is written to require that.
- `privacy@utilitybox.wales` in the privacy policy is a placeholder — point it at a real inbox before launch.
- The Hash Generator uses `crypto.subtle`, which browsers only expose in a secure context (HTTPS or `localhost`). It'll work in dev and in production once the site is served over HTTPS, but not over plain HTTP.
- The homepage nav is a grouped dropdown (`<details>`/`<summary>`, no extra JS library) matching the five tool categories on the homepage — see the `navGroups` array in `Layout.astro`.
