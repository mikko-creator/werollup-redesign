# werollup.com reforge — plan of record

Session 224f7ad2, started 2026-10-13. Skill: `site-reforge` (REFORGE lane). Workspace: `C:\Users\Dell\werollup-reforge`.

## The request

Capture werollup.com's exact structure and architecture, then redesign the site completely while keeping We Roll Up's
branding and brand tone:
- an "ethereal" style that is hip, modern and has a strong character;
- multiple layers and real depth, with images protruding into other sections or out of their frames;
- scroll-through animations and hover effects;
- the existing imagery, plus fal-generated industry imagery, plus optional Higgsfield motion.

## What "correct" means here

1. **Structure.** Every crawled URL (91 pages, inventory `audit/site-inventory.json`) is served by the rebuild at the same
   path. The navigation, location switcher, age and location gate, shop embeds and forms keep their function. The shop
   query-string and `/shop/menu/*` routes keep working.
2. **Content.** Every word of live copy is carried verbatim. Nothing is invented: no claim, review, statistic, price or
   hours that are absent from the crawl or from `facts/client-facts.json`. A section is dropped only through a `REMOVE`
   ledger row with a reason.
3. **Brand.** The We Roll Up wordmark, the green family, the bold grotesque type character and the voice are kept. The
   layout, effects, depth and imagery treatment are new.
4. **Imagery.** Real photos are kept and shown at a sharp size. Generated media is decorative or atmospheric and specific
   to the industry. It never depicts the client's store, staff, customers or products, carries no text or brand marks,
   follows the California cannabis advertising rules in `docs/COMPLIANCE.md`, and is AI-labelled (XMP or a metadata
   comment) and disclosed.
5. **Verification.** `sr-gate.mjs` is the only authority on READY. Text parity is measured on the BUILT pages with
   controls. First screens are checked at the operator's windows (1280x585 @1.5, 1600x662 @1.2) and on phones
   (390x844 @3).

## Phases (each one a workflow; results are read before the next is launched)

| # | Phase | Output |
|---|---|---|
| 0 | Harvest (inline, done 09:42-10:05) | crawl 91 pages, extract, assets, live capture of 25 pages x 4 widths, tokens, motion |
| 1 | WF1 Understand | SITE-ARCHITECTURE, CONTENT-MODEL, BRAND-SYSTEM, IMAGE-INVENTORY, COMPLIANCE + facts, COMMERCE, critic review |
| 2 | WF2 Design panel | 3 independent ethereal directions prototyped on real content, judged at the operator's viewports, DESIGN-SPEC |
| 3 | WF3 Build | BUILD-CONTRACT lanes: pipeline, theme, imagery (fal + Higgsfield) with refuter, integration |
| 4 | WF4 Verify + ship | gates, browser QA, refuter, fixes, sr-gate, package; preview only with the operator's approval |

## Decisions taken up front

- **D1 Lane.** REFORGE on the source information architecture. No URL is renamed.
- **D2 Copy.** Verbatim, reviews included (names as shown). A typo or defect fix needs operator approval and is logged.
- **D3 Gates.** The 21+ age gate and the store picker are kept as one flow: "Yes" reveals the store choice, and choosing a
  store sets `agePass_v2` in localStorage and a cookie. Only the look changes.
- **D4 Shop.** The menu embeds are kept as they are, because they have no local alternative.
- **D5 Third-party runtime.**
  - Removed: analytics and ads (GA4 G-148QKPF1CL, GTM-T4RHQDB, StackAdapt) and the agency credit (corrected 11:15:
    G-148QKPF1CL is the GA4 id, not GTM).
  - Operator decision: the UserWay widget (see `docs/OPEN-DECISIONS.md`).
- **D6 Media budget.** A cap of $15 across fal and Higgsfield, every call booked in `audit/generated-images.json`.
- **D7 Keys.** The keys live ONLY in the session scratchpad (`fal.key`, `hf.key`). Every runner refuses a key file inside
  the project. Every package and preview is secret-scanned with a positive control.
- **D8 Publishing.** Nothing leaves this machine (no repo, no Pages preview) without the operator's explicit approval.
- **D9 Requests to the client host.** The harvest is complete. A further request to werollup.com needs a stated reason
  and keeps the breakers on (`tools/crawl-live.mjs`).

## Rulings after WF1 (2026-10-13 11:15)

`docs/OPEN-DECISIONS.md` holds rulings A1-A18, which the build follows by default and each of which is reversible, and
questions B1-B17 for the operator or the client.

One correction to my own intake notes: the shops are the other way round. **San Pedro** is the Jane Boost embed
(storeId 4281), and **Culver City** and `/lax-menu` are the Weedmaps WM Store embed (COMMERCE.md).

## Source findings to hand to the client (from the harvest)

- The dead internal link `/products/edibles-gummies` returns 404.
- The `og:image` is malformed: `https://werollup.comhttps://werollup.com/media/logo-white-x.png`.
