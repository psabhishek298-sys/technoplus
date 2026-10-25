# Techno Plus Associates: SEO audit and implementation

Audit date: 25 October 2026
Application reviewed: Vite + React SPA in this repository
Canonical host selected for this implementation: `https://technoplus-one.vercel.app`

This is a code and content audit, not a promise of search rankings. Keyword demand and difficulty have not been guessed. The opportunities below are hypotheses until they are checked in Search Console or a keyword research product.

## A. Prioritized audit

### Critical and high priority

1. **All public routes originally shared one HTML title and description.** There was no canonical tag, robots file, XML sitemap, Open Graph data, or structured data. This made search snippets generic and left canonical/indexing signals unspecified.
2. **Unknown URLs rendered the Projects page.** This is a soft-404 pattern: an invalid route looked like a valid page to crawlers and people. The client now renders a not-found page and marks unknown paths `noindex`; Vercel's SPA rewrite can still return HTTP 200, so a true server 404 remains outstanding.
3. **The app is client-rendered.** Initial HTML contains an app shell and Google must render JavaScript for route content and route metadata. Google documents that it can render JavaScript, while recommending server-side or static rendering where practical. No framework migration was made in this pass.
4. **Project detail records vary in depth.** Some seeded entries have only a short generic description and limited project facts. These are weaker landing pages than entries with location, design rationale, photos, and verified details.

### Other findings

- Main routes: `/`, `/projects`, `/projects/:slug`, `/about`, `/procedure`, `/contact`, and private `/admin`.
- The page templates already have a single visible H1 on the main routes, descriptive internal links, and a mobile viewport declaration.
- Meaningful project, process, and contact images generally have alt text. Generic About/Process hero image alts were empty; these now have descriptive alt values and high fetch priority. Decorative previews remain empty-alt.
- The home hero video is decorative and has a poster image. That poster is now preloaded. Most below-fold photographs are lazy-loaded.
- Project and category content can change in Firestore. The checked-in project seed has 15 project records. The sitemap generator includes those seed slugs; Firestore changes made only in the admin UI are not reflected until a new build/deploy.
- Firebase-backed content is now loaded as a deferred module, and route pages/admin are split into lazy-loaded chunks. The previous largest entry bundle was about 1.19 MB; after splitting, the initial entry is about 308 KB, with Firebase content and secondary routes in separate chunks. This is a build artifact comparison, not a Lighthouse or Core Web Vitals measurement.
- No analytics or Search Console verification was found in the repository. No access or verification was performed.
- Contact data visible in the app: Techno Plus Associates, Munduparamba, Malappuram, Kerala; `+91 9037 00 0619`; `info@technoplus.in`. A full street address and current service-area list are not established by the app.
- The visible site states the practice began in 1990, gives work hours, describes Kerala Tourism work, and displays review figures/quotes. These are preserved as existing site content, but should be confirmed by the owner before relying on them in marketing or structured data.

## B. Implemented changes

| File | Change |
|---|---|
| `index.html` | Set `en-IN`, unique homepage title/description, canonical, social metadata, preload for the home hero poster, and Organization/WebSite JSON-LD using only information already visible on the site. |
| `src/components/SEOHead.jsx` | Route-specific title, description, canonical, robots, Open Graph/Twitter metadata; WebPage/BreadcrumbList and project CreativeWork JSON-LD. `/admin` and unknown routes are `noindex`; project descriptions are used when available. |
| `src/app.jsx` | Add SEO head manager, lazy-load secondary routes/admin, and render a genuine not-found page instead of the Projects page for unknown paths. |
| `src/pages.jsx` | Add meaningful alt text and high fetch priority to About and Process hero images. |
| `src/firebase/SiteContentContext.jsx`, `src/firebase/config.js`, `src/firebase/client.js`, `src/data/clients.js`, `src/firebase/content.js` | Defer Firebase-backed public content loading and split Firebase configuration from SDK initialization. Existing Firestore behavior is retained. |
| `scripts/generate-sitemap.mjs`, `public/sitemap.xml`, `public/robots.txt`, `package.json` | Generate a sitemap for the five public main routes plus the 15 checked-in project seeds during production builds; publish a crawl-allowing robots file that points to it. No fake `lastmod` values are emitted. |
| `docs/seo-audit-implementation.md` | Record audit, keyword hypotheses, validation, limits, and owner actions. |

### Indexing and rendering limits

- Sitemap generation reads the checked-in project seed. Additions, deletions, or unpublished-state changes made only in Firestore require the sitemap to be refreshed through a build/deploy. A future server-side sitemap endpoint or authenticated build hook would keep it in sync.
- Route-specific metadata is updated in React after hydration. For stronger support across crawlers and social preview bots, prerender or server-render public routes. That architecture change was evaluated and deferred to avoid a broad framework migration without deployment testing.
- Vercel's current catch-all rewrite supports direct links into the SPA but may serve HTTP 200 for unknown routes. The new client not-found view and `noindex` help crawlers after rendering; configure a server-side 404 response if Vercel routing is later changed to support route-aware status codes.

## C. Keyword-to-page map

Search volume and ranking difficulty are **not available here**. Priorities are search-intent hypotheses, not measured demand.

| Target URL | Primary hypothesis | Supporting hypotheses | Intent / geography | Suggested title and H1 | Internal links |
|---|---|---|---|---|---|
| `/` | architecture firm in Kerala | architecture and planning in Malappuram; architecture and interiors Kerala | Commercial/local; Malappuram and actual Kerala service area | Title: “Architecture, Planning & Interiors in Kerala | Techno Plus Associates”; current H1: “We design thoughtful spaces for people and place.” | Projects, About, Procedure, Contact |
| `/projects` | architecture projects in Kerala | architecture portfolio Kerala; residential and hospitality architecture Kerala | Portfolio research; Kerala | “Architecture Projects in Kerala | Techno Plus Associates”; current H1: “Spaces shaped around life.” | Each project, category filters, Contact |
| `/projects/:slug` | project name + architecture + verified place | project category and verified design details | Project-specific discovery; only the project’s actual location | Unique project title; H1 is project name | Projects, related category/service, Contact |
| `/about` | architecture practice in Malappuram | architecture firm Malappuram; Kerala architecture practice | Commercial/local trust; Malappuram | “About Our Architecture Practice | Techno Plus Associates”; current H1: “We design with purpose.” | Projects, Procedure, Contact |
| `/procedure` | architectural design process | architecture project process Kerala; site study and design process | Informational/commercial; Kerala context | “Our Architecture Design Process | Techno Plus Associates”; current H1: “From idea to space.” | Projects, About, Contact |
| `/contact` | architect in Malappuram | architecture studio Munduparamba; contact architect Malappuram | Local conversion; Munduparamba/Malappuram | “Contact an Architect in Malappuram, Kerala | Techno Plus Associates”; current H1: “Let’s build meaningful.” | Projects, About, Procedure, map/call/email |

Avoid “best architect” claims and city landing pages until coverage and genuinely unique city-specific project/service information are verified. Current content supports Kerala work and a Malappuram studio; it does not establish service in every Kerala city.

## D. Local SEO and competitor snapshot

- Keep name, phone, email, location, hours, and service-area details consistent across the website and the owner-managed Google Business Profile.
- Verify the exact public address/postcode, appointment or walk-in status, business hours, and actual cities served before adding complete LocalBusiness address data or city-specific pages. The schema currently uses the broader `Organization` type rather than claiming an unverified full local address.
- A limited web search snapshot surfaced Malappuram-area practices including [Design Arch](https://www.designarch.studio/), [Avenor Spaces](https://avenorspaces.com/), and [AtticLab](https://www.atticlab.in/). Their public pages visibly describe services and/or project work. This is a sample, not a ranked competitor list or a ranking claim.
- Useful gap to close: publish more original project narratives (client-approved concept, place, design decisions, materials only when known, and image captions). Competitors cannot be compared reliably on rankings without a fixed-location SERP or Search Console data.
- Claim/verify the eligible Google Business Profile, select the most accurate category, publish authentic project photographs, keep contact details current, and respond to genuine reviews. Do not create duplicate listings or request fabricated reviews.

## E. Content plan: first 90 days

Publish only after the relevant details are reviewed by the practice. Suggested cadence is one useful piece every two weeks, not mass content.

| Timing | Topic / intent | Suggested URL | Links |
|---|---|---|---|
| Days 1–14 | How Kerala's climate affects home design choices — practical informational guide | `/journal/kerala-climate-home-design/` | About, residential projects, Contact |
| Days 15–28 | What happens during an architecture site study — explain the actual first process phase | `/journal/architecture-site-study/` | Procedure, relevant projects |
| Days 29–42 | From first brief to handover — explain the five phases already described on the Procedure page | `/journal/architecture-design-process/` | Procedure, Contact |
| Days 43–56 | A project story: one owner-approved residence, with place and design decisions verified | `/journal/residential-project-story/` | Project detail, Contact |
| Days 57–70 | Planning a Kerala home around site, daylight, ventilation, and local rules — reviewed by the practice | `/journal/planning-a-kerala-home/` | Procedure, relevant residence projects |
| Days 71–90 | Tourism/public destination project case study, selected from verified portfolio records | `/journal/kerala-destination-project/` | Tourism projects, Contact |

These are proposals only. There is no blog route/CMS in the current app; add a maintained editorial workflow before publishing them. Cite technical or regulatory claims from authoritative current sources.

## F. Performance, accessibility, conversion

- Build output still has a deferred Firebase content chunk around 576 KB uncompressed, while the initial entry is around 308 KB. Image/video transfer bytes were not measured. Consider further Firebase/auth separation only after checking the user-visible CMS data loading and real field data.
- No Lighthouse, PageSpeed Insights, Core Web Vitals field data, or multi-device browser audit was available in this implementation. Do not infer LCP/INP/CLS results from bundle size alone.
- Contact provides form submission, click-to-call, email, WhatsApp, and a lazy-loaded map. Analytics conversion events are absent; only add GA4 after the owner supplies a measurement ID and privacy/consent requirements are decided.
- The portfolio uses meaningful alt text and lazy loading for galleries. Some existing project descriptions are minimal; obtain owner-approved detail rather than inventing budgets, specifications, awards, or client identities.

## G. Search Console, Analytics, and outstanding owner tasks

1. Confirm the public canonical domain. This release uses `technoplus-one.vercel.app`, the current app host. A web search also surfaced a separate/older site at `technoplus.in`; confirm whether that domain should point to this Vercel deployment before switching canonical URLs. Do not publish both as competing canonical sites.
2. In Google Search Console, verify the chosen domain property, submit `/sitemap.xml`, inspect Home/Projects/About/Contact and representative project URLs, then monitor indexing and crawl reports. No verification or submission was performed.
3. Confirm the complete studio address, postcode, current opening hours, appointment policy, and real service-area towns/districts.
4. Confirm all displayed practice history, tourism claims, project completion/status/area/year/location, review score/count, and permissions for client names and testimonials.
5. If qualified conversion measurement is required, provide the GA4 measurement ID and approve consent/privacy behavior before adding analytics.
6. For projects added or unpublished through Firestore, rebuild/deploy so the static sitemap is refreshed; an automated CMS-aware sitemap is a future improvement.

## H. 30/60/90-day action plan

- **Days 1–30:** confirm domain and business facts; verify Search Console/Business Profile; submit sitemap; request indexing for core pages; improve the five thinnest project narratives with owner-approved information.
- **Days 31–60:** publish one reviewed climate/site-study article; inspect query and page impressions in Search Console; improve title/H1/snippet copy based on actual queries; verify mobile contact flow and project image captions.
- **Days 61–90:** publish one to two reviewed project/process articles; earn a genuine project feature or partner reference; review Search Console indexing and query changes; measure LCP/INP/CLS in PageSpeed Insights and address the largest measured bottleneck.

## I. Validation and task status

| Task | Status |
|---|---|
| Production Vite build | **Completed and tested** (`npm run build` succeeded). |
| Sitemap generation | **Completed and tested**: 20 URLs (5 main public routes + 15 checked-in project slugs); generated on each build. |
| `robots.txt` sitemap pointer | **Implemented**; production response not checked because the change has not been deployed in this task. |
| XML and static JSON-LD syntax | **Completed and tested**: sitemap parsed as XML; homepage Organization/WebSite JSON-LD parsed as JSON. Dynamic route JSON-LD was build-checked but not sent to Rich Results/Schema.org validators. |
| Route metadata, canonical and social tags | **Implemented client-side**; requires rendered-route inspection or Search Console URL Inspection for external verification. |
| Admin/unknown route noindex and not-found view | **Implemented client-side**; server HTTP status for unknown SPA routes is still not verified/fixed. |
| Initial bundle split | **Completed and measured in local build output**; no field-performance claim. |
| Search Console/Google Business Profile/GA4 | **Requires owner account action**; not configured or verified here. |
| Competitor observations and keyword demand | **Partial research only**; no volume/difficulty/ranking metrics claimed. |

## Sources

- [Google Search Central: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google Search Central: build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google Search Central: canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google Search Central: Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- Competitor snapshot: [Design Arch](https://www.designarch.studio/), [Avenor Spaces](https://avenorspaces.com/), [AtticLab](https://www.atticlab.in/)
