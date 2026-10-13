# Designer B (Green Aura): fal spend ledger

Price basis: fal-ai/flux-pro/v1.1-ultra about $0.06 per image (the panel brief's figure). fal-ai/birefnet/v2 is billed
by compute; its exact price was **not verified** in this session, so it is booked here as an estimate of $0.02 per
call (an upper guess). Keys came from the session scratchpad only; no key file is in the project.

| # | Call | Model / input | Request id | Output | Verdict | Cost | Running total |
|---|---|---|---|---|---|---|---|
| 1 | g1-hero-bud | flux-pro ultra, 16:9, seed 181926495 | 01a1334b-b448-7251-8716-457dfc44bdbe | 2752x1536 | ACCEPTED: home hero (graded: saturation 0.84) | $0.06 | $0.06 |
| 2 | g2-trichome-field | flux-pro ultra, 16:9, seed 1670578878 | 01a1334b-b4b8-7793-80ff-493c13a24057 | 2752x1536 | ACCEPTED: /products/flower banner (hue pulled 18 deg from teal toward leaf green) | $0.06 | $0.12 |
| 3 | g3-cartridge | flux-pro ultra, 4:3, seed 1345624524 | 01a1334b-b50f-7422-bfa0-5cc6ee1d1182 | 2368x1792 | ACCEPTED: Vaporizers & Cartridges menu card (cartridge zoomed at 100%: no print, no mark) | $0.06 | $0.18 |
| 4 | g4-leaf-dew | flux-pro ultra, 4:3, seed 4158450763 | 01a1334b-b587-7c31-a1c4-fd3004e4564d | 2368x1792 | ACCEPTED: Edibles menu card (deliberately non-depictive: A9 forbids edibles imagery) | $0.06 | $0.24 |
| 5 | g5-bud-studio | flux-pro ultra, 1:1, seed 1249413863 | 01a1334b-b61d-7e32-931f-3cc921288b82 | 2048x2048 | ACCEPTED: source of the flower-banner cut-out | $0.06 | $0.30 |
| 5b | g5 cut-out (fal-one --cutout) | birefnet v2, General Use (Heavy), 2048 | 01a1334b-e245-73b2-845c-fcd60e04e687 | 2048x2048 RGBA | ACCEPTED: bud-cut-760.webp | ~$0.02 (unverified) | ~$0.32 |
| 6 | g6-mist-ribbons | flux-pro ultra, 21:9, seed 2050173123 | 01a1334b-b6b0-7ed3-bac6-e10174534d46 | 3136x1344 | ACCEPTED: atmosphere plane (night band, Hits Different band) | $0.06 | ~$0.38 |
| 7 | cap cut-out (REAL photo 7ed18521) | birefnet v2, General Use (Heavy), 2048 | 01a1334b-b764-7920-bd07-7585cc7422e0 | 1920x1920 RGBA | ACCEPTED: cap-cut-900.webp (community light box) | ~$0.02 (unverified) | ~$0.40 |
| 8 | CBD bottle cut-out (REAL photo e181cbbf) | birefnet v2, Matting, 2048 | 01a1334b-b7b6-7673-a452-58d6b0e29660 | 1920x1920 RGBA | ACCEPTED: cbd-bottle-cut-420.webp (night light box). Label claims flagged, see NOTES | ~$0.02 (unverified) | ~$0.42 |
| 9 | g7-preroll | flux-pro ultra, 3:4, seed 491924393 | 01a13350-5f24-7fa2-9a27-574aee9b7c6f | 1792x2368 | **REJECTED**: the pre-roll stands in a rocks-glass tumbler (an alcohol cue, A9) and reads as a white crayon, not a joint | $0.06 | ~$0.48 |
| 10 | g8-preroll-flat | flux-pro ultra, 3:4, seed 1373954519 | 01a13351-f7b6-7070-a2e0-2eb8dcf49842 | 1792x2368 | ACCEPTED: Pre-Rolls menu card (no glass, no smoke, no print) | $0.06 | ~$0.54 |

**Total: 8 generation calls (limit 10) + 3 cut-out calls (limit 6) = about $0.54** ($0.48 verified at the brief's rate,
plus about $0.06 of birefnet at an unverified estimate).

AI label: the IPTC trainedAlgorithmicMedia XMP (tools/ai-label.xmp) is embedded in every generated master
(`node tools/ai-label.mjs verify` on the 8 JPEGs and the bud PNG: 9 of 9 labelled) and, with `webpmux -set xmp`, in
every shipped generated WebP (hero-bud-2400, hero-bud-phone, trichome-field-2400, trichome-field-phone,
mist-ribbons-2400, card-prerolls, card-vape, card-edibles, bud-cut-760: byte grep 1 hit each; the real-photo
card-flower.webp gives 0, the control). The two real-photo cut-outs (cap, CBD bottle) are the client's photographs with
the background removed, not generated media, so they carry no AI label.
