---
title: "Film Photography"
date: 2023-12-22
updated: 2026-03-24
draft: false
tags:
  - analog
  - chemistry
---

**Film photography** is the practice of capturing images on a light-sensitive chemical medium — the film — rather than on a digital sensor. At its core, the process relies on a photochemical reaction: silver halide crystals suspended in a gelatin emulsion respond to incident light by releasing free electrons, which reduce ionic silver to metallic silver atoms, creating a latent (invisible) image that chemical development later amplifies into a visible negative or positive. This underlying mechanism, established in the mid-nineteenth century and refined continuously through the twentieth, remains unchanged in the films commercially available today.

What distinguishes film photography from digital capture is not simply the recording medium but the entire downstream workflow it implies: careful exposure judgment without real-time feedback, wet chemical development with its precise temperature and timing requirements, and an analog printing process that involves projecting light through a negative onto sensitized paper. Each of these stages introduces variables — and creative control — that digital processes either automate or eliminate entirely.

## Film characteristics

### Film speed and ISO

A film's **ISO speed** is a standardized numerical rating that quantifies its sensitivity to light: the higher the number, the less exposure is needed to produce a usable image. The current standard traces its lineage through two parallel systems — the ASA arithmetic scale developed in the United States and the DIN logarithmic scale used in Europe — which were unified by the International Organization for Standardization into the modern ISO system.[^ansi2016] The governing technical standard for color negative films, ISO 5800:1987, defines speed using a density criterion: the exposure required to produce a density 0.10 above the base-plus-fog level of the film.[^iso1987]

Sensitivity and grain are inseparable. Higher-speed emulsions achieve their greater light-gathering efficiency by using larger silver halide crystals, and those larger crystals produce coarser, more visible grain in the final image. Tabular-grain emulsions — a major emulsion engineering advance introduced by Kodak in the 1980s — partially decouple this relationship by optimizing crystal geometry to capture more light per unit of surface area, allowing finer grain at a given speed.[^eastman2006] A film rated ISO 400, for instance, will exhibit more prominent grain than an ISO 100 film from the same manufacturer, but the practical difference depends heavily on the degree of enlargement and the viewing conditions.

### Format and resolution

Film is manufactured in several standard widths, each with different implications for image quality and intended use. **35mm film** (nominally 36 × 24 mm per frame) is the most widely used format; its compact cassette form allowed the development of portable, fast-handling cameras and remains the entry point for most practitioners today. **Medium format** refers to 120 rollfilm, yielding frame sizes from 6 × 4.5 cm up to 6 × 9 cm depending on the camera's mask; the larger negative area captures substantially more detail. **Large format** sheet film, beginning at 4 × 5 inches, offers the highest resolution and the greatest control over perspective and plane of focus through camera movements, at the cost of a much slower, more deliberate working method.

The resolution advantage of larger formats is not simply a matter of more film area — it follows from the *system resolving power equation*, which models the combined effect of lens resolving power and film resolving power.[^vitale2009] Because larger negatives require less enlargement to reach a given print size, the film's native grain contributes proportionally less to final image degradation. A 4 × 5 negative enlarged to an 8 × 10 print has been magnified only 2×, while a 35mm negative reaching the same size has been enlarged roughly 8×, amplifying every imperfection in the emulsion along with the image.

### Exposure and reciprocity failure

Photographic exposure is formally defined as \(H = E \times t\), where \(H\) is exposure (in lux-seconds), \(E\) is illuminance at the film plane, and \(t\) is shutter duration.[^eastman2006] In practice, photographers control exposure through the interdependent variables of aperture (which governs \(E\)) and shutter speed (which governs \(t\)). Unlike digital cameras, analog cameras do not automatically log these values, making manual record-keeping important for consistent results.

**Reciprocity failure** — also called the Schwarzschild effect — occurs when the simple \(H = E \times t\) relationship breaks down at extreme exposure durations, typically longer than about one second. Under these conditions, the film's effective sensitivity decreases and a longer-than-calculated exposure is needed to achieve correct density. Each emulsion has a characteristic failure curve; Ilford publishes correction factors in the form \(T_c = T_m^P\), where \(T_c\) is the corrected exposure time, \(T_m\) is the metered time, and \(P\) is an emulsion-specific exponent (for example, 1.31 for HP5 Plus and 1.26 for FP4 Plus).[^ilford2023] Color films complicate matters further because the three dye-forming emulsion layers fail at different rates, potentially introducing color casts that may require filtration correction in addition to extended exposure.

## The development process

Film development is the set of chemical reactions that converts the latent image — the pattern of metallic silver seeds deposited by exposure — into a stable, visible image. Because undeveloped film is highly sensitive to light, all handling from the camera through the first development step must occur in complete darkness, either inside a lightproof changing bag or a dedicated darkroom.

### Chemical steps

The development sequence follows a fixed progression, each bath serving a chemically distinct function:

1. **Developer** reduces the light-exposed silver halide crystals to metallic silver, building up density in the exposed areas. The developer reacts selectively with exposed crystals because the latent image silver specks act as catalysts, enabling a small initial signal to be amplified into a dense, visible image.
2. **Stop bath** halts development immediately by neutralizing the alkaline developer. Typically a dilute acetic acid solution, it prevents the developer from continuing to act as the film is transferred to the next bath.
3. **Fixer** dissolves the remaining unexposed silver halide, making the image permanent and stable under normal lighting. Without fixation, the unreacted silver would continue to darken on exposure to light.
4. **Wash** removes all processing chemicals from the emulsion. Residual fixer in particular causes long-term deterioration; the thoroughness of the wash is the single largest determinant of archival permanence.[^eastman2016]

After washing, a brief treatment with a **wetting agent** (such as Kodak Photo-Flo or Ilford Ilfotol) reduces surface tension in the rinse water, minimizing drying marks. The film is then hung to dry in a dust-free environment before being cut into strips for storage, printing, or scanning.

### Black-and-white development

Black-and-white film is the most straightforward type to process, tolerating moderate temperature variation and amenable to development in inexpensive, reusable chemistry. Development is typically performed at 20°C (68°F), a temperature chosen because it is easy to maintain in most environments and provides a convenient reference point for published time charts.[^ilford2003] Developer formulations vary considerably in their properties: fine-grain developers (such as Kodak XTOL or Ilford Ilfosol 3) sacrifice a small amount of acutance for reduced granularity, while high-acutance developers (such as Kodak HC-110 or Rodinal) sharpen edge contrast at the cost of slightly coarser grain. The choice is governed by the film speed, enlargement ratio, and the desired aesthetic character of the final image.[^eastman2002b]

### Color negative development (C-41)

The **C-41 process** is the industry-standard development process for color negative films, introduced by Kodak in 1972 as a standardized replacement for the earlier C-22 chemistry. Its key innovation was the reduction of processing time and the simplification of chemistry to a degree that made minilab automation commercially viable. The process uses a chromogenic development mechanism: the color developer oxidizes during silver development, and the oxidized developer reacts with dye couplers embedded in each of the film's three emulsion layers (sensitive to red, green, and blue light respectively) to form the complementary cyan, magenta, and yellow dye clouds that constitute the color image. The silver is subsequently removed in a combined bleach-fixer (blix) or separate bleach and fixer baths, leaving only the dye image.[^eastmanZ131]

Temperature control is far more critical in C-41 than in black-and-white processing. The standard development temperature is 37.8°C (100°F), and the tolerance is ±0.15°C for consistent results; deviations of even half a degree can shift color balance across the three emulsion layers.[^fujifilm2020] For this reason, C-41 processing at home typically requires a water bath or sous-vide-style temperature controller to maintain stability throughout the development step.

### Color reversal development (E-6)

The **E-6 process** produces color reversal (slide) film — a positive transparency on a clear base, intended for projection or direct viewing rather than printing from a negative. The mechanism is substantially more complex than C-41, involving seven distinct chemical baths and two separate development stages. In the first development step, a black-and-white developer converts exposed silver halides to silver without forming any dye. A chemical or light-based reversal step then fogs the remaining unexposed halides, and a subsequent color development step converts those fogged halides to silver while simultaneously forming dye clouds — producing the final positive image in the areas that were *not* originally exposed.[^eastman2005]

The process demands tighter tolerances than any other conventional film chemistry. The first developer temperature is 38°C (100.4°F) with a tolerance of ±0.17°C, and the first developer time directly controls the overall density of the final image.[^eastman2005] Push or pull processing (intentionally lengthening or shortening first development to compensate for over- or under-exposure) is possible but affects color balance and contrast more noticeably than in C-41. Kodak's comprehensive reference manual for E-6, *Using KODAK Chemicals, Process E-6* (Publication Z-119), remains the definitive technical resource for both laboratory and small-tank processing.[^eastmanZ119]

## Push and pull processing

**Push processing** is the practice of intentionally underexposing film during capture and compensating by extending development time, effectively increasing the film's working sensitivity beyond its rated ISO. The mechanism relies on the fact that extended development continues to reduce exposed silver halides even after the normal stopping point, building additional density in the shadow areas of the negative. The tradeoff is increased grain, elevated contrast, and compressed highlight detail — all of which can be either technical liabilities or deliberate aesthetic choices.[^ilford2006]

**Pull processing** (the inverse: overexposure combined with reduced development) is less commonly used but valuable for controlling contrast in harshly lit scenes. By reducing development time, the photographer limits the density range of the negative, making it easier to print or scan without losing highlight detail. The relationship between exposure index adjustment and required development time change is emulsion-specific; manufacturers publish dedicated push/pull time tables for each film.[^ilford2025]

## Printing and enlargement

A **darkroom enlarger** projects light through the negative onto a sheet of light-sensitive photographic paper, creating a scaled-up positive image. The enlarger's lens aperture and the duration of the exposure control how much light reaches the paper, and test strips — small sections of paper exposed in successive increments — are used to determine the correct exposure before a full print is made. **Variable-contrast papers** (Ilford Multigrade, Kodak Polycontrast) respond differently to different colors of light, allowing the printer to dial in contrast using colored filters from grade 00 (very low contrast) through grade 5 (very high contrast) in half-grade steps — a system that replaces the older requirement of stocking separate paper grades.[^ilford2017a]

Selective exposure control during printing — **dodging** (holding back light from specific areas to lighten them) and **burning** (adding extra exposure to darken specific areas) — allows the printer to locally correct tonal imbalances in the negative that global exposure cannot address. These are the same operations that digital editing software later formalized as tools, inheriting both their names and their logic from the darkroom. Advanced practitioners also use **split-grade printing**, a technique in which separate exposures through a grade 00 filter (for highlights) and a grade 5 filter (for shadows) are made sequentially, decoupling shadow and highlight control entirely.[^lambrecht2011]

Print chemical processing follows the same general logic as film development: developer, stop bath, fixer, and a thorough wash. For archival permanence, fiber-base papers processed with hypo clearing agent and fully washed can achieve print lifetimes measured in centuries under controlled storage conditions; resin-coated (RC) papers are faster to process and dry but are considered less stable for long-term archival use.[^coote1996]

## Alternative processes

Beyond the mainstream silver-halide processes, a number of earlier or experimental processes remain in active use, valued for their distinctive visual character and their historical significance.

**Cyanotype**, invented by John Herschel in 1842, uses iron salts rather than silver and produces a characteristic Prussian blue image with ultraviolet exposure and a simple water wash — no darkroom required beyond UV avoidance. **Platinum/palladium printing** produces images with an exceptionally wide tonal range and extreme archival stability, as platinum group metals are resistant to oxidation; the process was commercially dominant before the 1920s but was largely abandoned as silver paper became cheaper. **Gum bichromate** printing uses a pigment-sensitized colloid and allows photographers to apply multiple color layers, blurring the line between photography and painting.[^alternativephoto]

These processes have seen a substantial revival since the late 1990s, facilitated both by internet-based communities that exchange technical knowledge and by the use of inkjet-printed digital negatives to transfer high-resolution scans of film originals onto historical process-compatible transparencies.

## Archival storage and digitization

Proper storage is the primary determinant of film longevity. Both acetate (safety film) and polyester-base films are susceptible to chemical degradation; acetate in particular is prone to a hydrolytic breakdown that produces acetic acid — detectable as a vinegary odor and known informally as "vinegar syndrome." The Image Permanence Institute recommends storing film collections below 21°C and between 30–50% relative humidity, with frozen storage at or below −18°C for maximum life extension of color materials.[^adelstein2009] Enclosures should be made of inert, acid-free materials conforming to ISO 18902; common choices include polypropylene sleeves, polyester (Mylar) envelopes, and acid-free paper envelopes.[^loc]

**Digitization** — scanning film to produce a high-resolution digital file — is the primary strategy for access preservation, ensuring that the image content remains usable even as the physical carrier ages. The Federal Agencies Digital Guidelines Initiative (FADGI) publishes the governing U.S. standard for this work, specifying a four-star quality rating system with metrics for spatial resolution, tonal reproduction, color accuracy (measured in Delta E), noise, and illumination uniformity.[^fadgi2023] For most 35mm negatives, a scan resolution between 2,000 and 4,000 pixels per inch captures the full information content of the film; medium- and large-format originals require proportionally less resolution to achieve the same result because they need less optical enlargement to fill the sensor.

[^adelstein2009]: Adelstein, P. Z. (2009). [*IPI media storage quick reference*](https://s3.cad.rit.edu/ipi-assets/publications/msqr.pdf) (2nd ed.). Image Permanence Institute, Rochester Institute of Technology.
[^alternativephoto]: Fabbri, M. (Ed.). (1999–present). [*Alternative photographic processes A–Z*](https://www.alternativephotography.com/processes/). AlternativePhotography.com.
[^ansi2016]: Kelechava, B. (2016). [*ISO speed standard for film speed*](https://blog.ansi.org/ansi/iso-speed-standard-for-film-speed/). ANSI Blog, American National Standards Institute.
[^coote1996]: Coote, J. H. (1996). *Ilford monochrome darkroom practice: A manual of black & white processing & printing* (3rd ed.). Focal Press.
[^eastman2002b]: Eastman Kodak Company. (2002). [*Black-and-white tips and techniques for darkroom enthusiasts*](https://125px.com/docs/techpubs/kodak/o3-2002_02.pdf) (Publication No. O-3). Eastman Kodak Company.
[^eastman2005]: Eastman Kodak Company. (2005). [*KODAK PROFESSIONAL chemicals, Process E-6*](https://125px.com/docs/techpubs/kodak/j83-2005_11.pdf) (Publication No. J-83). Eastman Kodak Company.
[^eastman2006]: Eastman Kodak Company. (2006). [*Basic photographic sensitometry workbook*](https://www.kodak.com/content/products-brochures/Film/Basic-Photographic-Sensitometry-Workbook.pdf) (Publication No. H-740). Eastman Kodak Company.
[^eastman2016]: Kodak Alaris Inc. (2016). [*How to process and print black-and-white film*](https://business.kodakmoments.com/sites/default/files/files/resources/AJ-3.pdf) (Publication No. AJ-3). Kodak Alaris.
[^eastmanZ119]: Eastman Kodak Company. (n.d.). *Using KODAK chemicals, Process E-6* (Publication No. Z-119, 6th ed.). Eastman Kodak Company. Chapter PDFs available at [125px.com](https://125px.com/docs/techpubs/kodak/z119-11.pdf).
[^eastmanZ131]: Eastman Kodak Company. (n.d.). [*Using KODAK FLEXICOLOR chemicals*](https://business.kodakmoments.com/sites/default/files/wysiwyg/pro/chemistry/z131.pdf) (Publication No. Z-131). Kodak Professional.
[^fadgi2023]: FADGI Still Image Working Group. (2023). [*Technical guidelines for digitizing cultural heritage materials*](https://www.digitizationguidelines.gov/guidelines/digitize-technical.html) (3rd ed.). Federal Agencies Digital Guidelines Initiative / Library of Congress.
[^fujifilm2020]: FUJIFILM Corporation. (2020). [*Processing manual: Fujicolor negative process CN-16Q, CN-16FA, CN-16L, CN-16S*](https://asset.fujifilm.com/www/nz/files/2020-11/7bc24ba0b5e224bc74a11f1cda56b78b/cn16lq_.pdf). FUJIFILM Corporation.
[^ilford2003]: HARMAN technology Limited. (2003, rev. 2017). [*Processing your first black & white film*](https://www.ilfordphoto.com/wp/wp-content/uploads/2017/04/Processing-your-first-black-and-white-film.pdf). Ilford Photo.
[^ilford2006]: HARMAN technology Limited. (2006). [*Push processing: Increasing apparent film speed by over-development*](https://www.darkroomdave.com/wp-content/uploads/2018/06/Push-Processing-Films-2006-2102012331472.pdf). Ilford Photo.
[^ilford2017a]: HARMAN technology Limited. (2017). [*Making your first black & white print*](https://www.ilfordphoto.com/wp/wp-content/uploads/2017/04/Making-your-first-print.pdf). Ilford Photo.
[^ilford2023]: HARMAN technology Limited. (2023). [*Film reciprocity failure compensation*](https://www.ilfordphoto.com/wp/wp-content/uploads/2024/05/Reciprocity-Failure-Compensation-v2.pdf) (v2). Ilford Photo.
[^ilford2025]: HARMAN technology Limited. (2025). [*Film developing chart*](https://www.ilfordphoto.com/wp/wp-content/uploads/2025/05/18x24-film-developing-chart-Poster-colour-2025.pdf) [Poster]. Ilford Photo.
[^iso1987]: International Organization for Standardization. (1987). [*Photography — Colour negative films for still photography — Determination of ISO speed*](https://www.iso.org/standard/11948.html) (ISO 5800:1987, 2nd ed.). ISO.
[^lambrecht2011]: Lambrecht, R. W., & Woodhouse, C. (2011). *Way beyond monochrome: Advanced techniques for traditional black & white photography including digital negatives and hybrid printing* (2nd ed.). Focal Press / Routledge.
[^loc]: Library of Congress Preservation Directorate. (n.d.). [*Care, handling and storage of photographs*](https://www.loc.gov/preservation/care/photo.html). Library of Congress.
[^vitale2009]: Vitale, T. (2009). [*Estimating the resolution of historic film images: Using the resolving power equation (RPE) and estimates of lens quality*](https://cool.culturalheritage.org/videopreservation/library/estimating_historic_image_resolution_v9.pdf) (Version 9). Foundation for Advancement in Conservation / Conservation OnLine.
