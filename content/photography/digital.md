---
title: "Digital Photography"
date: 2025-03-27
updated: 2026-03-24
draft: false
tags:
  - file-formats
  - sensors
---

**Digital photography** refers to the process of capturing images using electronic sensors within digital cameras rather than traditional photographic film. Where film required chemical development to produce a visible image, a digital sensor converts incoming light into electrical signals that are processed by the camera's image signal processor (ISP) and written to a memory card as a digital file. This shift — from chemistry to computation — has not only changed how images are stored but has fundamentally reshaped every stage of photography, from capture to editing to distribution. Today, roughly 1.94 trillion photographs are taken annually, the overwhelming majority of them on smartphones rather than dedicated cameras.[^delbracio2021]

The dedicated digital camera market has itself undergone a significant structural shift in recent years. **Mirrorless** interchangeable-lens cameras have displaced the **DSLR** (Digital Single-Lens Reflex) as the dominant form factor, while the compact camera segment is experiencing a cultural revival driven largely by younger photographers seeking a tactile alternative to smartphone imaging.[^amateurphotographer2025] Understanding digital photography today means understanding not just the hardware categories but also the computational techniques, sensor technologies, and file formats that define how images are produced and preserved.

## Common types of digital cameras

### Digital Single-Lens Reflex (DSLR)

A **DSLR** uses a mirror positioned at 45 degrees behind the lens to redirect incoming light upward through a pentaprism and into an optical viewfinder. When the shutter fires, this mirror swings out of the light path, exposing the sensor for the duration of the exposure. The optical viewfinder shows the scene as it physically is — without electronic latency — and draws negligible power, contributing to the category's traditionally long battery life.[^mansurov_mirrorless]

The DSLR was the dominant professional and prosumer camera format from the late 1990s through roughly 2020. Its decline since has been steep. Canon — the last major manufacturer still producing new DSLR bodies — shipped approximately 790,000 units in 2024, down 14% year-over-year and representing around 91% of a rapidly shrinking market.[^gray2025] Canon has not released a new EF-mount lens since 2018, signalling the category's managed sunset. DSLRs remain in active use for their robust ergonomics, deep lens ecosystems, and value on the used market, but no major manufacturer is investing meaningfully in new DSLR development.

### Mirrorless

A mirrorless camera eliminates the reflex mirror entirely, routing light directly to the sensor at all times. Image composition occurs through an **electronic viewfinder** (EVF) or rear LCD, both of which display a live digital preview that reflects current exposure settings, white balance, and depth of field — a meaningful advantage over the purely optical DSLR viewfinder. Without the mechanical constraints of a mirror cycle, mirrorless cameras can sustain burst rates of 20 frames per second or higher and offer superior video capabilities, including 4K and 8K recording with advanced autofocus tracking.[^mansurov_mirrorless]

The segment's growth has been consistent and accelerating. Global mirrorless shipments reached 5.22 million units in 2024 — up 10% year-over-year and the highest annual total ever recorded — while the overall digital camera market grew 6% to 8.3 million units, its first increase since 2017.[^amateurphotographer2025] Canon leads by volume, followed by Sony and Fujifilm.

### Compact (point-and-shoot)

Compact cameras, often called **point-and-shoot** cameras, integrate a fixed lens directly into a small body designed for ease of use. Automatic exposure, focus, and white balance handling reduces the cognitive overhead of capture, making these cameras well-suited for casual photography and travel. After years of steep decline driven by smartphone adoption, the compact segment is experiencing a revival along two distinct trajectories.[^cooke_compact2026]

The first is a premium enthusiast tier — cameras such as the Fujifilm GFX100RF and Sony RX1R III — that emphasize high image quality through large sensors and deliberate constraint. The second is a broader cultural resurgence, particularly among younger photographers who associate compact digital cameras with images that feel warmer and less processed than smartphone output. TikTok's `#digitalcamera` hashtag has accumulated tens of billions of views, and retailers report difficulty keeping affordable compact models in stock.[^dupuis2024]

### Bridge

**Bridge cameras** occupy a middle position between the compact and interchangeable-lens categories. They feature DSLR-style bodies with electronic viewfinders and fixed superzoom lenses — the Nikon Coolpix P1100, for instance, covers a 24–3000mm equivalent range at 125× optical zoom. This extreme reach comes from relatively small sensors (typically 1/2.3-inch), which enable compact optical designs but limit low-light performance compared to cameras with larger sensors.[^grigonis2025]

Unlike the compact segment, bridge cameras have not shared in the recent revival. Sony discontinued the RX10 IV with no announced successor, and Canon has exited the category entirely. They remain the most affordable path to extreme telephoto reach, but their niche has narrowed considerably as smartphones extend their own optical zoom ranges.

## Sensor formats

Sensor size is among the most consequential specifications in digital camera design. A larger sensor can accommodate larger photosites — the individual light-gathering elements — which collect more photons per unit time, resulting in lower noise, greater dynamic range, and more flexibility for shallow depth-of-field effects. The trade-off is always cost, weight, and the size of the optical system required to project an image circle large enough to cover the sensor.

### Full frame

A **full-frame** sensor measures 36 × 24mm, matching the frame area of 135 (35mm) film. This size is used as the reference standard against which other formats are compared. Full-frame sensors offer the best combination of low-light performance, dynamic range, and depth-of-field control available in a mainstream camera system, and they are found in professional bodies from Canon, Nikon, Sony, and Leica.[^canon_apsc][^nikon_dx] The larger image circle required by full-frame optics makes lenses physically larger and more expensive than their crop-sensor equivalents.

### APS-C

**APS-C** sensors are smaller than full frame, measuring approximately 23.5 × 15.6mm for most manufacturers (Canon uses a slightly smaller 22.3 × 14.9mm variant). The resulting **crop factor** — typically 1.5× for Canon RF-S, Fujifilm X, Nikon Z DX, and Sony E-mount APS-C systems, or 1.6× for Canon EF-S — means that a 50mm lens produces a field of view equivalent to an 80mm lens on full frame.[^canon_apsc]

APS-C has historically been framed as a compromise format, but that framing has become increasingly outdated. CIPA data from 2025 shows that interchangeable-lens cameras with sub-full-frame sensors — predominantly APS-C — outsold full-frame bodies at a ratio of roughly 1.75:1, and current flagship APS-C bodies such as the Fujifilm X-T5 (40.2MP) and Canon R7 Mark II (39MP BSI) match or exceed the resolution of many professional full-frame cameras.[^cooke_apsc2026]

### Micro Four Thirds

The **Micro Four Thirds** (MFT) standard was developed jointly by Olympus and Panasonic and released in 2008. It specifies a sensor measuring 17.3 × 13.0mm and a flange distance of 19.25mm — significantly shorter than DSLR flange distances — enabling more compact body and lens designs.[^wikipedia_mft] The 2× crop factor means that a 150mm MFT lens produces a field of view equivalent to 300mm on full frame, which has historically made the format popular for wildlife and bird photography where long reach in a compact package is valued.[^graham2024]

The system is supported by OM System (formerly Olympus), Panasonic, Blackmagic Design, DJI, and others, and has accumulated over 85 camera body models. Its primary competitive challenge in recent years has been the shrinking of full-frame mirrorless cameras: the Sony a7CR, for instance, weighs 515g — lighter than the Panasonic G9 II at 658g — which erodes MFT's traditional size advantage.[^graham2024]

## Lenses

The lens is the optical element that forms the image on the sensor. All other specifications being equal, lens quality — including sharpness, contrast, aberration control, and maximum aperture — has a greater effect on image quality than sensor resolution. Interchangeable-lens systems allow photographers to match the lens to the requirements of a given subject or lighting situation.

### Prime

A **prime lens** has a fixed focal length and no zoom mechanism. This simpler optical formula typically results in sharper images, less distortion, fewer aberrations, and wider maximum apertures than zooms at comparable price points. Common maximum apertures for prime lenses range from f/1.2 to f/1.8, compared to f/2.8 for professional zoom lenses — a difference of one to two full stops that translates directly into lower-light capability and more pronounced background separation.[^burnhill_prime] Popular focal lengths include 24mm, 35mm, 50mm, 85mm, and 135mm, each associated with characteristic perspectives and use cases.

### Zoom

A **zoom lens** covers a range of focal lengths in a single optical design, adjustable via a rotating or sliding zoom ring. The primary advantage is versatility: a single 24–70mm zoom replaces several primes, reduces the need to change lenses in dynamic environments, and simplifies travel kit selection. Professional-grade zoom lenses maintain a constant maximum aperture throughout their range (typically f/2.8), while consumer lenses use a variable aperture that narrows at longer focal lengths.[^mansurov_zoom] Advances in optical engineering have brought the best modern professional zooms — such as the Canon RF 28-70mm f/2L USM — to a level of sharpness and aberration control that approaches or matches prime lenses in the same focal range.

### Wide-angle

**Wide-angle lenses** have a focal length shorter than approximately 35mm on a full-frame equivalent basis, producing a field of view greater than roughly 65 degrees.[^bauer_wideangle] Their defining optical characteristic is perspective exaggeration: elements close to the lens appear disproportionately large relative to the background, which can be used deliberately to convey depth and environmental context. Wide-angle lenses also produce inherently large depth of field, making it possible to hold sharpness from a foreground subject through to a distant horizon. These properties make them the standard choice for landscape, architectural, interior, and environmental portrait photography.[^nikon_focal]

### Telephoto

**Telephoto lenses** cover focal lengths of approximately 80mm and above, with the category subdivided into medium telephoto (~80–300mm) and ultra-telephoto (300mm and longer).[^tamron_telephoto] Beyond simple magnification, telephoto lenses produce a **compression effect** — the apparent collapsing of spatial depth between foreground and background elements — that is distinct from any other focal length characteristic. They also produce very shallow depth of field at wide apertures, making subject isolation straightforward even at moderate distances. These properties drive their dominant use cases: wildlife and nature photography, where physical proximity to subjects is often impossible or unsafe, and sports photography, where subjects are distant and isolation from crowds is desirable.

## Computational photography and autofocus

The boundary between optical hardware and software has become increasingly blurred in modern digital photography. Contemporary cameras — and especially smartphones — rely on computational techniques that process multiple exposures, apply machine learning models, and execute complex image signal processing pipelines to produce images that would be optically impossible from a single raw exposure.

### Computational photography

**Computational photography** encompasses any photographic technique that uses computation as an integral part of the capture process rather than purely as post-processing. On smartphones, this includes multi-frame noise reduction (where tens of frames are aligned and fused before the shutter sound plays), synthetic aperture blur, night mode (long-exposure simulation through burst fusion), and real-time HDR tone mapping.[^delbracio2021] The result is that smartphone cameras — constrained by tiny sensors and fixed lenses — produce images competitive with dedicated cameras in many conditions by leveraging processing power rather than optics.

Dedicated cameras have adopted computational techniques as well, though typically in more constrained forms. Features such as in-camera focus stacking, pixel-shift high-resolution shooting, computational live neutral density filters (as seen in OM System cameras), and AI-driven noise reduction in post-processing software represent the growing intersection of optics and software in traditional camera systems.

### Autofocus systems

Modern autofocus systems operate on three primary detection mechanisms. **Contrast detection** (CDAF) maximizes edge contrast in the image by moving the lens until the sensor signal peaks; it is reliable but slow because it requires searching across a range of focus positions. **Phase detection** (PDAF) uses pairs of masked pixels to measure the direction and magnitude of focus error directly, enabling faster and more predictable lens movement. **Hybrid autofocus** systems combine both, using phase detection for rapid acquisition and contrast detection for fine tuning.[^canon_autofocus]

The most significant recent development in autofocus is the widespread deployment of deep learning–based subject detection. Current systems from Canon (Dual Pixel Intelligent AF), Sony (Real-time Tracking), and Nikon (Subject Detection AF) can identify and track human eyes, faces, bodies, animals, birds, and vehicles in real time, maintaining focus lock through partial occlusion and erratic movement. This capability — effectively impossible with earlier deterministic autofocus algorithms — has substantially reduced the technical barrier to consistently sharp images of moving subjects.

### Image stabilization

**Image stabilization** compensates for the small, involuntary camera movements that cause motion blur in handheld photography. Two complementary approaches are commonly combined in modern mirrorless cameras. **Optical Image Stabilization** (OIS) operates within the lens using gyroscopic sensors and electromagnetically actuated lens elements to correct angular motion. **In-Body Image Stabilization** (IBIS) moves the sensor itself across up to five axes, compensating for pitch, yaw, roll, and lateral shift in addition to the angular movements OIS addresses.[^canon_ibis]

When OIS and IBIS operate cooperatively — each sharing motion data with the other — the combined system can achieve up to 8 stops of effective compensation, making exposures as long as several seconds feasible without a tripod in some conditions. IBIS is now standard across most mirrorless camera lines and has expanded the practical shooting envelope for low-light, macro, and telephoto photography.

## File formats

When an image is captured, the camera must decide how to encode and store the raw sensor data. The choice of format involves trade-offs between file size, image quality, editability, and compatibility.

**JPEG** (Joint Photographic Experts Group) is the most widely used image format in the world, with several billion images produced in the format daily.[^jpeg_org] It applies Discrete Cosine Transform (DCT)-based lossy compression — standardised as ISO/IEC 10918 — which can achieve roughly 10:1 compression ratios with perceptually acceptable quality loss. JPEG's ubiquity makes it the default choice for images destined for the web, social platforms, or direct printing without further editing.

**TIFF** (Tagged Image File Format) is a tag-based raster format that supports lossless compression (LZW, ZIP) as well as uncompressed storage, making it the preferred archival format at institutions such as the Library of Congress, which holds over 3.5 petabytes of TIFF files.[^loc_tiff] TIFF supports high bit depths (up to 32-bit per channel), CMYK and CIE Lab colour models, and embedded layers, which makes it the standard interchange format in print production workflows. Its large file sizes make it impractical for web publishing or casual sharing.

**RAW** files contain minimally processed sensor data — linear 12- or 14-bit values that preserve the full dynamic range and colour information captured by the sensor before any in-camera processing is applied.[^adobe_raw] Each manufacturer uses a proprietary RAW format (Canon `.CR3`, Nikon `.NEF`, Sony `.ARW`, etc.), which has driven adoption of Adobe's open **DNG** (Digital Negative) format as an interoperability standard; DNG files are approximately 20% smaller than their proprietary equivalents at identical quality.[^adobe_dng] RAW files require dedicated processing software — such as Adobe Lightroom, Capture One, or DxO PhotoLab — to convert to a viewable format, but they afford significantly more latitude for recovering shadows, highlights, and colour balance in post-production.

---

[^adobe_dng]: Adobe. (n.d.). [*DNG files: What they are and how to open them*](https://www.adobe.com/creativecloud/file-types/image/raw/dng-file.html). Adobe Creative Cloud.

[^adobe_raw]: Adobe. (n.d.). [*DNG vs. RAW: Which is better and why?*](https://www.adobe.com/creativecloud/file-types/image/comparison/dng-vs-raw.html). Adobe Creative Cloud.

[^amateurphotographer2025]: Amateur Photographer staff. (2025, September 3). [Worldwide mirrorless camera shipments up by 10% with one clear winner growing fastest](https://amateurphotographer.com/latest/photo-news/worldwide-mirrorless-camera-shipments-up-by-10-with-one-clear-winner-growing-fastest/). *Amateur Photographer*.

[^bauer_wideangle]: Bauer, M. (n.d.). [How to use a wide-angle lens for landscape photography](https://www.naturettl.com/wide-angle-lens-for-landscape-photography/). *Nature TTL*.

[^burnhill_prime]: Burnhill, M. (n.d.). [Prime vs zoom lenses](https://www.canon-europe.com/pro/stories/expert-view-prime-vs-zoom-lenses/). Canon Europe.

[^canon_apsc]: Canon Europe. (n.d.). [*APS-C vs full-frame – the difference explained*](https://www.canon-europe.com/get-inspired/tips-and-techniques/aps-c-vs-full-frame/). Canon.

[^canon_autofocus]: Canon Europe. (2024). [*All about autofocus*](https://www.canon-europe.com/pro/infobank/autofocus/). Canon Professional Network Infobank.

[^canon_ibis]: Canon Europe. (2024). [*8-stops image stabilisation*](https://www.canon-europe.com/pro/stories/8-stops-image-stabilization/). Canon Professional Network.

[^cooke_apsc2026]: Cooke, A. (2026, March 7). [Why APS-C cameras and lenses are having their best year ever](https://fstoppers.com/gear/why-aps-c-cameras-and-lenses-are-having-their-best-year-ever-900236). *Fstoppers*.

[^cooke_compact2026]: Cooke, A. (2026, January 1). [The compact camera comeback is real: Why people want dedicated cameras again](https://fstoppers.com/gear/compact-camera-comeback-real-why-people-want-dedicated-cameras-again-719421). *Fstoppers*.

[^delbracio2021]: Delbracio, M., Kelly, D., Brown, M. S., & Milanfar, P. (2021). Mobile computational photography: A tour. *Annual Review of Vision Science, 7*, 571–604. https://doi.org/10.1146/annurev-vision-093019-115521

[^dupuis2024]: Dupuis, L. (2024, December 25). [Why Gen Z is sparking a digital camera renaissance](https://www.cbc.ca/news/canada/calgary/gen-z-youth-culture-digital-camera-renaissance-trends-1.7416893). *CBC News*.

[^graham2024]: Graham, M. (2024, December 11). [Why 2025 could be a make-or-break year for Micro Four Thirds](https://petapixel.com/2024/12/11/why-2025-could-be-a-make-or-break-year-for-micro-four-thirds/). *PetaPixel*.

[^gray2025]: Gray, J. (2025, September 3). [Canon sold more DSLRs in 2024 than Fujifilm sold total digital cameras](https://petapixel.com/2025/09/03/canon-sold-more-dslrs-in-2024-than-fujifilm-sold-total-digital-cameras/). *PetaPixel*.

[^grigonis2025]: Grigonis, H. K. (2025, February 14). [Trends revived the point-and-shoot from the dead. But what about the superzoom bridge camera?](https://www.digitalcameraworld.com/cameras/bridge-cameras/trends-revived-the-point-and-shoot-from-the-dead-but-what-about-the-superzoom-bridge-camera) *Digital Camera World*.

[^jpeg_org]: Joint Photographic Experts Group. (n.d.). [*Overview of JPEG 1*](https://jpeg.org/jpeg/). JPEG.

[^loc_tiff]: Library of Congress. (2024, May 6). [*TIFF, Revision 6.0*](https://www.loc.gov/preservation/digital/formats/fdd/fdd000022.shtml). Sustainability of Digital Formats: Planning for Library of Congress Collections.

[^mansurov_mirrorless]: Mansurov, N. (2024, September 28). [Mirrorless vs DSLR cameras: Which one is better and why](https://photographylife.com/mirrorless-vs-dslr). *Photography Life*.

[^mansurov_zoom]: Mansurov, N. (2024, October 31). [Prime vs zoom lenses: Everything you need to know](https://photographylife.com/prime-vs-zoom-lenses). *Photography Life*.

[^nikon_dx]: Nikon USA. (n.d.). [*The DX and FX formats*](https://www.nikonusa.com/learn-and-explore/c/products-and-innovation/the-dx-and-fx-formats). Nikon Learn & Explore.

[^nikon_focal]: Nikon USA. (2025, December). [*Understanding focal length*](https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/understanding-focal-length). Nikon Learn & Explore.

[^tamron_telephoto]: Tamron. (2024, September 30). [What is a telephoto lens? Introducing key tips on how to use a telephoto and how to choose the right lens](https://www.tamron.com/global/consumer/sp/impression/detail/article-what-is-telephoto-lense.html). *Tamron Photo Site: Impression*.

[^wikipedia_mft]: Wikipedia contributors. (2025, November). [Micro Four Thirds system](https://en.wikipedia.org/wiki/Micro_Four_Thirds_system). In *Wikipedia, The Free Encyclopedia*.