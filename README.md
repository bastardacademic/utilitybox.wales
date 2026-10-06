# UtilityBox

Free online calculators and everyday utility tools, built with [Astro](https://astro.build) and TypeScript. Static output, no backend required.

## Tools

**Calculators**
- Scientific calculator (trig, logs, powers, roots, constants)
- Currency converter (live rates via the Frankfurter/ECB API)
- Unit converter (length, weight, temperature, volume, area, speed, data, time)
- UK salary calculator (income tax, National Insurance, student loan, pension — 2026/27 bands)
- Percentage calculator (X% of Y, what % is X of Y, percentage change)
- VAT calculator (add/remove UK VAT at any rate)
- Tip calculator (tip amount, total, per-person split)
- Loan/mortgage repayment calculator (monthly payment, total interest)
- Budget calculator (monthly income vs spending, compared with the 50/30/20 guideline)

**Networking**
- CIDR / subnet calculator (network & broadcast address, host ranges, subnet splitting)
- IPv6 subnet calculator (expand/compress, address classification, subnet ranges)
- IP address converter (dotted decimal ⇄ binary ⇄ hex ⇄ 32-bit integer, auto-detected)
- DNS lookup (live A/AAAA/CNAME/MX/TXT/NS/SOA/SRV/CAA queries via DNS-over-HTTPS)
- DNS record type reference (searchable, A through TLSA)
- HTTP status code reference (searchable, 1xx–5xx)
- Port number reference (searchable common TCP/UDP ports)
- MAC address formatter/validator (colon/hyphen/dot notation, locally-administered/multicast detection)
- Bandwidth / transfer time calculator
- Is It Down? status checker (browser-side reachability test for any site, plus a live board of ~30 popular services read from their public Statuspage feeds, fetched only on click — never on page load, for privacy)

**Word Games**
- Word unscrambler
- Word builder (with pattern matching and word-game scoring)
- Word/character counter (with reading and speaking time estimates)
- Case converter (UPPER/lower/Title/Sentence/camelCase/PascalCase/snake_case/kebab-case/CONSTANT_CASE/path/case/MoCkInG CaSe)
- Palindrome checker
- Anagram solver

**Generators**
- Random string generator (passwords, tokens, UUID v4 — uses `crypto.getRandomValues`)
- UUID generator (v1, v4, v7, nil, max — one or many at once, plus a UUID validator)
- Lorem Ipsum generator
- Color converter (HEX/RGB/HSL + palette generator)
- Slug generator (URL-safe kebab-case/snake_case)
- Placeholder image generator (SVG, no image library needed)
- QR code generator (SVG, hand-written encoder — versions 1-10, byte mode, all 4 error correction levels)

**Developer Tools**
- JSON formatter/validator (pretty-print, minify, error line/column)
- JSON / YAML / XML / CSV converter (convert between any two formats)
- Regex tester with live match highlighting
- Diff viewer (line-level LCS diff)
- Base64 encoder/decoder (UTF-8 safe, optional URL-safe alphabet)
- JWT decoder (decodes header/payload only — does not verify the signature)
- Cron expression parser (plain-language summary + next run times)
- Hash generator (SHA-1/256/384/512 via native Web Crypto)
- RSA key pair generator (2048/3072/4096-bit, signing or encryption, PEM output, via native Web Crypto)
- Bcrypt hash generator / verifier (adjustable salt rounds, via `bcryptjs`)
- URL encoder/decoder (component and full-URI modes)
- Unix timestamp converter (seconds/milliseconds ⇄ date)
- HTML entity encoder/decoder

**Cheatsheets**
- Git cheatsheet (searchable reference)
- Bash cheatsheet (searchable reference)
- Regex cheatsheet (searchable reference)
- Excel cheatsheet (searchable reference)

## Project structure

```
src/
  components/
    calculators/    Scientific, Currency, Measurements, UKSalary, NetworkCalc, Ipv6Calculator, BandwidthCalculator,
                       PercentageCalculator, VatCalculator, TipCalculator, LoanCalculator, BudgetCalculator
    tools/           WordUnscrambler, WordBuilder, RandomString, UuidGenerator, LoremIpsum,
                       JsonFormatter, RegexTester, DiffViewer, Base64Tool, JwtDecoder, CronParser,
                       HttpStatusReference, PortReference, MacFormatter, IpConverter, DnsLookup, DnsRecordReference, StatusChecker,
                       WordCounter, CaseConverter, PalindromeChecker, AnagramSolver,
                       ColorConverter, SlugGenerator, PlaceholderImageGenerator,
                       HashGenerator, RsaKeyGenerator, BcryptTool, UrlEncoder, TimestampConverter, HtmlEntityEncoder,
                       CheatSheet (shared by the Git/Bash/Regex/Excel cheatsheet pages)
    ToolLayout.astro Two-column layout shared by every tool page
    FaqPage.astro    Layout shared by the standalone FAQ pages (FAQPage + breadcrumb JSON-LD)
  layouts/
    Layout.astro     Base HTML shell: header, nav, dark mode toggle, footer
  pages/
    index.astro      Home page / tools directory
    tools/*.astro     One route per tool
  styles/
    global.css        CSS variables, dark mode, base styles
  utils/
    calculators.ts    Expression evaluator, unit conversion, UK salary logic
    network.ts         IPv4 / CIDR math, multi-format IP address parsing
    ipv6.ts             IPv6 parsing, expand/compress, classification, CIDR ranges
    dns.ts              DNS record type reference data + DNS-over-HTTPS lookup helper
    serviceStatus.ts    Service list + Statuspage summary.json parsing for the Is It Down? board
    reachability.ts     Target parsing + no-cors reachability / DNS check for the Is It Down? tool
    bandwidth.ts        Data transfer time calculation
    generators.ts       Random string + Lorem Ipsum generation
    uuid.ts              UUID v1/v4/v7/nil/max generation and validation
    words.ts             Unscramble / word-building / word-game scoring
    json.ts               JSON format/minify/validate with error position
    yaml.ts                Hand-rolled YAML subset parser/serializer
    xmlConvert.ts            JSON <-> XML conversion (parses via native DOMParser)
    csvConvert.ts             CSV <-> JSON (flat array of objects) conversion
    dataConvert.ts             Unifies JSON/YAML/XML/CSV parsing and serialization
    regexTool.ts           Regex matching + HTML-safe match highlighting
    diff.ts                 Line-level LCS diff algorithm
    encoding.ts              UTF-8 safe Base64 / Base64URL
    jwt.ts                    JWT decode (no signature verification)
    cron.ts                    Cron parsing, next-run calc, plain-language summary
    finance.ts                  Percentage, VAT, tip, and loan repayment math
    budget.ts                    Monthly budget maths + 50/30/20 comparison
    httpStatus.ts                 HTTP status code reference data
    ports.ts                       Common port number reference data
    mac.ts                          MAC address validation/formatting
    textStats.ts                     Word/char/sentence counting, reading time
    textCase.ts                       Case conversions (camelCase, snake_case, etc.)
    color.ts                           HEX/RGB/HSL conversion and palette generation
    slug.ts                             URL-safe slug generation
    placeholderImage.ts                  SVG placeholder image generation
    qrcode.ts                             Hand-written QR code encoder (ISO 18004), versions 1-10, byte mode
    hash.ts                                SHA hashing via native Web Crypto
    rsa.ts                                  RSA key pair generation (PEM export) via native Web Crypto
    bcryptTool.ts                            Bcrypt hashing/verification wrapper around bcryptjs
    cheatsheet.ts                            Shared type for the Git/Bash/Regex/Excel cheatsheet data
    gitCheatsheet.ts                          Git cheatsheet reference data
    bashCheatsheet.ts                          Bash cheatsheet reference data
    regexCheatsheet.ts                          Regex syntax cheatsheet reference data
    excelCheatsheet.ts                           Excel formula/shortcut cheatsheet reference data
    urlEncoding.ts                          URL component/full-URI encoding
    timestamp.ts                             Unix timestamp conversion
    htmlEntities.ts                           HTML entity encode/decode
    seo.ts               JSON-LD structured-data helper for tool pages
    faq.ts                Shared types and cross-links for the standalone FAQ pages
    shareLink.ts          Read/write tool state as URL query params
  pages/
    404.astro          Custom not-found page
    faq/*.astro        Standalone FAQ pages: site-wide, UK money & budgeting, developer & networking
    privacy.astro     Privacy policy
    terms.astro        Terms of Use
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

- All interactive tools run entirely client-side — no user data is sent to a server, except the currency converter (fetches exchange rates from the public Frankfurter API), the DNS Lookup tool (queries Cloudflare's public DNS-over-HTTPS resolver), and the Is It Down? tool (reads each listed provider's public status feed and connects to any address the visitor enters). Only status pages that send `access-control-allow-origin: *` can be listed — verify with curl before adding a service.
- `bcryptjs` (used by the Bcrypt tool) is the project's first runtime dependency beyond Astro itself — every other tool is hand-rolled vanilla TypeScript, deliberately, to keep the client bundle small. Bcrypt specifically needs a JS implementation since there's no native Web Crypto equivalent; adding a dependency for it was a deliberate, one-off exception rather than a change in general policy.
- The word dictionary in `public/data/dictionary.json` (182,720 words, ~2.1MB) merges the original curated list, the [Google 10,000 English words](https://github.com/first20hours/google-10000-english) list (MIT-licensed, swear-filtered variant), and the [UK Advanced Cryptics Dictionary](https://github.com/rdeits/cryptics/blob/master/raw_data/UKACD.txt) (UKACD, © J Ross Beresford 1993–2009, BSD-style license — attribution required, credited at the bottom of `/tools/unscrambler` and `/tools/word-builder`). UKACD adds proper dictionary-grade coverage (British spellings like "colour"/"organise", genuinely valid short words) and doubles as ground truth: short words (≤3 letters) from the frequency-based Google list are only kept if UKACD or the original list also confirms them as real words, since frequency corpora are noisy at short lengths (raw web-text tokens like "cl", "pdf", "usa" would otherwise show up as if they were playable words). Checked against a standard profanity blocklist throughout. Client-side search over the full 182k-word list completes in well under 200ms.
- The currency converter offers all 30 currencies Frankfurter/the ECB publish reference rates for (see `CURRENCIES` in `Currency.astro`).
- Tax and NI figures in the UK salary calculator reflect the 2026/27 tax year and are for guidance only.
- Every tool page carries a `WebApplication` JSON-LD block (see `src/utils/seo.ts`) plus a `BreadcrumbList` block (added in `ToolLayout.astro`), a canonical URL, and Open Graph/Twitter Card tags (including the generated `og-image.png`) via `Layout.astro`.
- Every calculator has a "Copy" or "Copy summary" button next to its result, plus a "🔗 Share" button that copies a link pre-filled with the current inputs via URL query params (see `src/utils/shareLink.ts`) — e.g. `/tools/network/?cidr=10.0.0.0/8`.
- A "Skip to content" link (visible on keyboard focus) lets keyboard/screen-reader users bypass the header nav.
- The favicon/icon set (`favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`) was generated with a small pure-Python script (stdlib only, no installs) rather than a design tool — regenerate or replace with real brand assets whenever you have them.
- `/privacy` describes what the site actually does today (no accounts, no cookies, no analytics). Update it before turning on ads or analytics — see the "Advertising and analytics" section, which is written to require that.
- `privacy@utilitybox.wales` in the privacy policy is a placeholder — point it at a real inbox before launch.
- The Hash Generator and RSA Key Pair Generator both use `crypto.subtle`, which browsers only expose in a secure context (HTTPS or `localhost`). They'll work in dev and in production once the site is served over HTTPS, but not over plain HTTP.
- The homepage nav is a grouped dropdown (`<details>`/`<summary>`, no extra JS library) matching the five tool categories on the homepage — see the `navGroups` array in `Layout.astro`.
