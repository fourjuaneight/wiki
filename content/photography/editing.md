---
title: "Photo Editing"
date: 2023-12-23
updated: 2026-03-24
draft: false
tags:
  - color
  - file-formats
---

**Photo editing** encompasses the full range of adjustments applied to an image after capture, from basic tonal corrections to compositing and retouching. At its core, editing is a data transformation: each operation remaps the numerical values of pixels, and the quality of the result depends on both the information available in the source file and the order in which transformations are applied. Because adjustments interact — boosting shadows while recovering highlights simultaneously narrows dynamic range headroom — understanding the underlying mechanisms matters as much as knowing the controls themselves.

The most significant workflow decision is whether to edit from a **RAW file** or a processed format like JPEG. RAW files contain undemosaiced Bayer-pattern sensor data with full bit depth, preserving maximum color information and dynamic range headroom.[^loc_raw] JPEG and similar compressed formats apply tone curves, white balance, and lossy compression in-camera, permanently discarding data that cannot be recovered in post-processing.

## Tonal adjustments

Tonal adjustments operate on the luminance distribution of an image — the range of brightnesses from pure black to pure white. They are the foundational tools of photo editing, and they interact strongly with one another.

**Exposure** controls the overall brightness of the image by scaling pixel values linearly, analogous to changing shutter speed or aperture at capture time. In a linear RAW capture, half of all available tonal levels reside in the single brightest stop, so exposure adjustments have asymmetric effects across the tonal range: pulling exposure down by one stop halves those levels, while pushing it up doubles them.[^li2022] A strategy called expose-to-the-right (ETTR) exploits this asymmetry to pack the maximum number of tonal levels into the captured data before post-processing pulls the image back to a natural brightness.[^cambridge_ettr]

**Highlights** and **shadows** are region-selective tonal controls that adjust only the upper or lower portions of the tone curve, respectively. Reducing highlights recovers detail in overexposed areas by pulling down the upper portion of the curve; lifting shadows reveals texture in dark regions. Modern raw processors implement these as tone mapping operators — algorithms that compress a wide tonal range into a smaller displayable range while preserving local contrast within each region.[^han2023]

**Contrast** changes the separation between dark and light areas of the image. It is fundamentally a tone-curve operation: steeper slopes increase local contrast while flatter slopes compress it, creating a finite "contrast budget" — boosting contrast in one tonal region necessarily reduces it elsewhere.[^cambridge_curves] The classic S-curve is the most common expression of this, simultaneously lifting highlights and deepening shadows to add perceived depth without touching midtones.

**Brightness** and **black point** offer coarser tonal levers. Brightness shifts all pixel values uniformly up or down — unlike exposure, which scales them multiplicatively — while black point sets the floor below which all values are clipped to pure black. Raising the black point crushes shadow detail but adds a sense of depth, a common choice in commercial and cinematic color grades.

## Color adjustments

Color adjustments operate on hue, saturation, and luminance, and they are sensitive to the order in which they are applied and the color space in which the file is processed.

**Saturation** increases or decreases the chroma of all colors uniformly. Because it applies a linear multiplier to every pixel regardless of how saturated the color already is, high values frequently clip fully saturated colors — reds and blues are often the first to lose detail.[^adobe_vibrance] **Vibrance**, introduced as a nonlinear alternative, applies a hue-selective boost that amplifies less-saturated colors more strongly than colors that are already vivid. Empirical pixel-level analysis of Adobe's implementation shows that Vibrance follows separate response curves for each hue range, actively protecting skin tones (reds and oranges) while aggressively boosting blues and greens — achieving high settings with minimal clipping.[^meyer2009]

**Warmth** (often labeled Temperature) adjusts color temperature in Kelvin (K). Color temperature is grounded in blackbody radiation physics and codified through CIE illuminant specifications: daylight is standardized at approximately 6500 K (CIE D65) and tungsten at approximately 2856 K (CIE Illuminant A).[^iso11664] Lower values shift the image toward cooler blue tones; higher values shift it toward warmer yellow and orange. White balance correction is a chromatic adaptation problem — because white balance is applied early in the camera pipeline before nonlinear processing stages, accurately correcting it in an already-processed file is substantially more difficult than adjusting a RAW capture.[^afifi2019]

**Tint** adjusts image color orthogonally to the warmth axis, toward green or toward magenta, and is used together with warmth as a two-axis white balance system. Tint corrections are most commonly needed when shooting under fluorescent or LED sources whose spectral power distributions deviate from the blackbody curve.

## Detail and texture

**Sharpness** enhances the perceived clarity of edges in the image. The standard algorithm is **unsharp masking** (USM): a blurred copy of the image is subtracted from the original to isolate edge transitions, and that difference signal is added back at a controlled strength.[^deng2011] Over-sharpening creates halo artifacts — bright or dark fringes along high-contrast edges — because the algorithm amplifies edge signals beyond what was present in the original scene. Camera and lens resolving power is objectively characterized by the **modulation transfer function** (MTF); the most common benchmark is MTF50, the spatial frequency at which image contrast drops to 50% of its original value.[^iso12233]

A related control, **Brilliance**, enhances local texture and detail, particularly in well-lit areas, without altering global color saturation. It operates similarly to a large-radius unsharp mask (sometimes called Clarity), increasing midtone local contrast at coarser scales than conventional edge sharpening.

**Grain** adds synthetic texture resembling the grain structure of photographic film. In physical film, grain arises from the stochastic distribution of silver halide crystals in the emulsion. Modern physics-based grain synthesis models crystal centers as an inhomogeneous Poisson process with a log-normal radius distribution, rendering results far more perceptually authentic than simple Gaussian noise overlays.[^zhang2023]

## File formats

The choice of file format determines how much image data is preserved and whether quality can be recovered in subsequent editing.

- **JPEG (JPG)**: A DCT-based lossy compressed format defined in ITU-T T.81 and ISO/IEC 10918-1, ubiquitous for web delivery and in-camera storage. It permanently discards high-frequency detail at compression time, and repeated re-encoding accumulates generation loss.[^loc_jpeg]
- **PNG**: A lossless format using DEFLATE compression, well-suited for images with transparency or graphics with sharp edges. The third edition of the W3C PNG specification (2025) adds HDR support via BT.2100 HLG/PQ coding and Animated PNG (APNG).[^w3c2025]
- **TIFF**: A flexible lossless container format supporting multiple compression schemes and bit depths, built on a tag-based IFD architecture. Federal agencies and cultural heritage institutions specify TIFF as the archival master format for digitization projects.[^fadgi2023]
- **RAW**: The family of proprietary camera raw formats (Canon CR2/CR3, Nikon NEF, Sony ARW, and others) containing unprocessed Bayer-pattern sensor data.[^loc_raw] Adobe's **Digital Negative** (DNG) format provides an open, documented alternative; DNG 1.7.1.0 (2023) added JPEG XL compression and floating-point HDR data support.[^adobe_dng]

## Bit depth

**Bit depth** (color depth) determines how many discrete tonal levels are available per color channel. An 8-bit image provides 256 levels per channel — approximately 16.7 million colors — while a 16-bit image provides 65,536 levels per channel, enabling far more precise tonal gradations and far greater editing latitude.[^cambridge_gamma]

The practical significance of bit depth becomes apparent during heavy post-processing. Aggressive edits — large exposure corrections, steep contrast curves, heavy shadow recovery — spread existing tonal values further apart, widening quantization gaps. Empirical testing suggests the visible banding threshold lies at approximately 9 bits; a 4-stop exposure change consumes roughly 4 bits of depth, making 14–15-bit captures (achieved via RAW files) the practical sweet spot for latitude-intensive editing.[^benz2018] Converting an existing 8-bit image to a 16-bit document in editing software does not improve it — the extra levels are simply empty and unused.

### Color banding

Color banding (posterization) appears as discrete, visible steps in regions that should transition smoothly — most commonly skies, defocused backgrounds, and gradients. It occurs when quantization gaps become wide enough to exceed the just-noticeable difference threshold for the human visual system. The primary causes are insufficient bit depth, aggressive post-processing of already-compressed files, and JPEG re-encoding. Mitigation strategies include editing in 16-bit throughout the full pipeline, shooting RAW to preserve original depth, and applying dithering on final export — which distributes quantization error across neighboring pixels to break up the visible steps.[^tu2020]

## Dynamic range

**Dynamic range** is the ratio of the maximum to minimum light intensity a sensor can record in a single exposure, expressed in stops (doublings of light). The upper bound is set by photosite well capacity at saturation, and the lower bound is set by the noise floor of the readout electronics. Dynamic range is formally defined in ISO 15739 as the ratio of saturation signal level to the minimum level at which the temporal signal-to-noise ratio \(\text{SNR} \geq 1\).[^iso15739]

Consumer cameras typically achieve 8–11 stops of measured dynamic range; human vision accommodates approximately 10–14 stops instantaneously.[^cambridge_dr] RAW files preserve the full sensor dynamic range; JPEG discards headroom by baking a tone curve in-camera. Gamma encoding increases effective dynamic range for a given bit depth by redistributing linear sensor data into perceptually uniform steps — without gamma, capturing the full perceptible tonal range at 8 bits would require roughly three additional bits.[^cambridge_gamma]

[^adobe_dng]: Adobe Inc. (2023, September). [*Digital Negative (DNG) Specification, Version 1.7.1.0*](https://helpx.adobe.com/content/dam/help/en/camera-raw/digital-negative/jcr_content/root/content/flex/items/position/position-par/download_section_733958301/download-1/DNG_Spec_1_7_1_0.pdf). Adobe.
[^adobe_vibrance]: Adobe. (n.d.). [*Vibrance adjustment layer*](https://helpx.adobe.com/photoshop/using/adjust-vibrance.html). Adobe Photoshop User Guide.
[^afifi2019]: Afifi, M., Punnappurath, A., Abdelhamed, A., Karaimer, H. C., Abuolaim, A., & Brown, M. S. (2019). [Color temperature tuning: Allowing accurate post-capture white-balance editing](https://yorkucvil.github.io/projects/public_html/ColorTemperatureTuning/files/ColorTemperatureTuning.pdf). In *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*. IEEE.
[^benz2018]: Benz, G. (2018, September 19). [8, 12, 14 vs 16-bit depth: What do you really need?!](https://petapixel.com/2018/09/19/8-12-14-vs-16-bit-depth-what-do-you-really-need/) *PetaPixel*.
[^cambridge_curves]: Cambridge in Colour. (n.d.). [Using the Photoshop curves tool](https://www.cambridgeincolour.com/tutorials/photoshop-curves.htm). *Cambridge in Colour*.
[^cambridge_dr]: Cambridge in Colour. (n.d.). [Understanding dynamic range in digital photography](https://www.cambridgeincolour.com/tutorials/dynamic-range.htm). *Cambridge in Colour*.
[^cambridge_ettr]: Cambridge in Colour. (n.d.). [Digital exposure techniques](https://www.cambridgeincolour.com/tutorials/digital-exposure-techniques.htm). *Cambridge in Colour*.
[^cambridge_gamma]: Cambridge in Colour. (n.d.). [Understanding gamma correction](https://www.cambridgeincolour.com/tutorials/gamma-correction.htm). *Cambridge in Colour*.
[^deng2011]: Deng, G. (2011). A generalized unsharp masking algorithm. *IEEE Transactions on Image Processing, 20*(5), 1249–1261. https://doi.org/10.1109/TIP.2010.2092441
[^fadgi2023]: Federal Agencies Digital Guidelines Initiative (FADGI) Still Image Working Group. (2023, May 10). [*Technical Guidelines for Digitizing Cultural Heritage Materials* (3rd ed.)](https://www.digitizationguidelines.gov/guidelines/FADGI%20Technical%20Guidelines%20for%20Digitizing%20Cultural%20Heritage%20Materials_3rd%20Edition_05092023.pdf). FADGI.
[^han2023]: Han, X., Khan, I. R., & Rahardja, S. (2023). High dynamic range image tone mapping: Literature review and performance benchmark. *Digital Signal Processing, 137*, Article 104015. https://doi.org/10.1016/j.dsp.2023.104015
[^iso11664]: International Organization for Standardization & International Commission on Illumination. (2022). *Colorimetry — Part 2: CIE standard illuminants* (ISO/CIE 11664-2:2022). https://www.iso.org/standard/77215.html
[^iso12233]: International Organization for Standardization. (2024). *Digital cameras — Resolution and spatial frequency responses* (ISO 12233:2024). https://www.iso.org/standard/88626.html
[^iso15739]: International Organization for Standardization. (2023). *Photography — Electronic still-picture imaging — Noise measurements* (ISO 15739:2023, 4th ed.). https://www.iso.org/standard/82233.html
[^li2022]: Li, C., Guo, C., Han, L., Jiang, J., Cheng, M.-M., Gu, J., & Loy, C. C. (2022). Low-light image and video enhancement using deep learning: A survey. *IEEE Transactions on Pattern Analysis and Machine Intelligence, 44*(12), 9396–9416. https://doi.org/10.1109/TPAMI.2021.3126387
[^loc_jpeg]: Library of Congress. (2024, May 6). [*JPEG Image Encoding Family* (FDD ID: fdd000017)](https://www.loc.gov/preservation/digital/formats/fdd/fdd000017.shtml). Sustainability of Digital Formats.
[^loc_raw]: Library of Congress. (n.d.). [*Camera Raw Formats (Group Description)* (FDD ID: fdd000241)](https://www.loc.gov/preservation/digital/formats/fdd/fdd000241.shtml). Sustainability of Digital Formats.
[^meyer2009]: Meyer, M. (2009). [Analyzing Photoshop vibrance and saturation](https://www.photo-mark.com/notes/analyzing-photoshop-vibrance-and-saturation/). *Photo-Mark.com*.
[^tu2020]: Tu, Z., Lin, J., Wang, Y., Adsumilli, B., & Bovik, A. C. (2020). Adaptive debanding filter. *IEEE Signal Processing Letters, 27*, 1715–1719. https://doi.org/10.1109/LSP.2020.3025040
[^w3c2025]: World Wide Web Consortium. (2025, June 24). [*Portable Network Graphics (PNG) Specification (Third Edition)*](https://www.w3.org/TR/png-3/). W3C Recommendation.
[^zhang2023]: Zhang, K., Wang, J., Tian, D., & Pappas, T. N. (2023). Film grain rendering and parameter estimation. *ACM Transactions on Graphics, 42*(4), Article 63, 1–14. https://doi.org/10.1145/3592127
