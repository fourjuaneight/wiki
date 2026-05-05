---
title: "M-Disc"
date: 2026-04-30
draft: false
tags:
  - archival
  - data-preservation
  - optical-media
  - physical-media
---

**M-Disc** (Millennial Disc) is a write-once optical archival medium available in DVD+R (4.7 GB), BD-R (25 GB), BD-R DL (50 GB), and BDXL (100 GB) form factors. Its distinguishing feature is an inorganic, multi-layer recording film made of metals and metal oxides — rather than the organic dye used in conventional recordable optical media — giving it substantially lower susceptibility to thermo-oxidative and photochemical decay.

Recorded M-Discs are read in any standard DVD or Blu-ray drive. Writing a DVD M-Disc requires a firmware-capable M-Ready burner, because ablating the inorganic layer demands roughly five times the laser power of a conventional DVD-R burn. Most Blu-ray writers manufactured after ~2011 can write BD M-Disc without modification, as the format complies with the BD-R HTL specification certified by the Blu-ray Disc Association.

## How writing works

Conventional CD-R/DVD-R/BD-R media stores data by altering the optical absorption of an organic dye — a metastable chemical state that degrades through heat, UV exposure, and oxidation. M-Disc replaces this mechanism with physical **laser ablation**: the write laser, operating at elevated power, melts or vaporizes material from the inorganic layer, leaving a permanent topographic void. The result is structurally analogous to the embossed pits of a pressed ROM disc, not a reversible chemical change. Because the mark is missing material rather than an altered molecular state, it cannot fade, oxidize back, or photo-bleach.[^lunt2009][^verbatim2013]

## Available formats

| Format | Capacity | Write speed |
|---|---|---|
| DVD+R M-Disc | 4.7 GB | 2×–4× |
| BD-R M-Disc | 25 GB | 4×–6× |
| BD-R DL M-Disc | 50 GB | 6×–8× |
| BDXL M-Disc | 100 GB | 4×–6× |

## Longevity and durability

Lifetime estimates for M-Disc are derived from accelerated-aging tests conducted under **ISO/IEC 10995** and **ISO/IEC 16963**, which apply elevated temperature and humidity stress and extrapolate failure rates via Arrhenius/Eyring models.[^iso10995][^iso16963] These methodologies model only heat and humidity — not UV light, atmospheric pollutants, or mechanical damage.

Third-party testing includes the 2009 U.S. Naval Air Warfare Center (China Lake) study, which subjected M-Disc and several dye-based DVDs to combined heat, humidity, and high-intensity light. All organic-dye discs exceeded acceptable error thresholds; the M-Disc showed no measurable degradation.[^svrcek2009] French standards laboratory LNE conducted a more aggressive 90 °C / 85 % RH soak and rated M-Disc DVD as surviving less than 250 hours — better than several dye-based competitors but well below the manufacturer's own projections.[^perdereau2012]

Verbatim's technical documentation identifies the **polycarbonate substrate** — rated on the order of 1,000 years — as the life-limiting component, not the data layer itself.[^verbatim2013] NIST IR 8387 takes a more conservative position, listing M-Disc as acceptable for archival use with an estimated longevity of at least 100 years, and recommends refreshing to new media every ~20 years regardless of rated lifetime to hedge against drive obsolescence and unmodeled failure modes.[^guttman2022]

## Limitations

M-Disc is **write-once**: data cannot be modified or erased after burning, which is advantageous for chain-of-custody and ransomware-immune backups but disqualifies it from any rotating-archive or working-data role. Physical durability is bounded by the polycarbonate substrate, which is vulnerable to warping, scratching, and edge delamination.

The accelerated-aging methodology cannot reliably extrapolate beyond a few hundred years, and inconsistencies exist between the manufacturer's ISO/IEC 10995 projections and the LNE independent results. A 2022 reformulation by Verbatim to a **Metal Ablative Layer (MABL)** formulation raised BD write speeds to 6× but generated unresolved consumer and press skepticism, as no independent peer-reviewed validation of the new formulation has been published.

Hardware availability is a practical long-term risk. Optical drive production is contracting — Pioneer exited Blu-ray drive manufacturing in May 2025 — meaning future readability depends on retaining working drives as well as intact discs.[^guttman2022]

[^guttman2022]: Guttman, B., White, D., & Walraven, C. (2022). *NIST Interagency Report 8387: Digital evidence preservation — Considerations for evidence handlers*. National Institute of Standards and Technology. https://nvlpubs.nist.gov/nistpubs/ir/2022/NIST.IR.8387.pdf
[^iso10995]: International Organization for Standardization. (2011). *Information technology — Digitally recorded media for information interchange and storage — Test method for the estimation of the archival lifetime of optical media* (ISO/IEC 10995:2011). https://www.iso.org/standard/46554.html
[^iso16963]: International Organization for Standardization. (2017). *Information technology — Digitally recorded media for information interchange and storage — Test method for the estimation of lifetime of optical disks for long-term data storage* (ISO/IEC 16963:2017). https://www.iso.org/standard/62781.html
[^lunt2009]: Lunt, B. M., Linford, M. R., Hansen, P., & Davis, R. (2009). *Towards a true archival-quality optical disc*. Proceedings of the International Symposium on Optical Memory–Optical Data Storage Conference, Nagasaki, Japan.
[^perdereau2012]: Perdereau, M. (2012). *Comparison of archival optical disc formats under accelerated aging*. Laboratoire national de métrologie et d'essais (LNE).
[^svrcek2009]: Svrcek, I. (2009). *Accelerated life cycle comparison of Millenniata archival DVD*. Naval Air Warfare Center Weapons Division, China Lake. https://archive.org/details/ChinaLakeFullReport
[^verbatim2013]: Verbatim Corporation. (2013). *M-DISC™ data layer stability: The data layer*. https://www.verbatim.jp/download/products/mdisc/M-DISC_1sheet_DataLayer_vF.pdf
