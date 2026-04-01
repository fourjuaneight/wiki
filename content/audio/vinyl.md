---
title: "Vinyl"
date: 2026-03-17
updated: 2026-03-19
draft: false
tags:
  - acoustics
  - analog
  - audio
  - signal-processing
---

**Vinyl records** store audio as a continuous physical waveform — a microscopic spiral groove pressed into polyvinyl chloride — that a diamond stylus traces to reproduce sound mechanically. The medium predates digital audio by nearly a century, yet the engineering underlying it is anything but simple: the full signal chain, from recording lathe to phono cartridge to equalization curve, involves applied electromagnetism, Hertzian contact mechanics, and a 40 dB frequency correction that must be inverted with sub-decibel precision during playback. Understanding how it works requires following the audio signal through each physical transformation in turn.[^pspatialLathes][^wikipediaPR]

The format that audiophiles now call vinyl emerged from a series of incremental engineering decisions made between the 1870s and the 1950s. Thomas Edison's 1877 phonograph used a stylus to etch vibrations into tinfoil on a rotating cylinder; Emile Berliner's 1887 gramophone shifted to flat lateral-cut discs, enabling mass stamping from a single master. Electrical recording arrived in 1925, replacing the acoustic horn with microphones and vacuum-tube amplifiers and expanding frequency response from roughly 100–5,000 Hz to something approaching the modern audio band. Columbia Records introduced the 12-inch 33⅓ RPM long-playing record on June 21, 1948, using polyvinyl chloride and narrower "microgroove" technology to achieve more than 20 minutes per side. Stereo LPs followed in 1958 using the Westrex 45/45 system, and vinyl remained the dominant consumer format until compact disc unit sales surpassed it in 1988.[^wikipediaPR]

## Physical structure and groove geometry

A standard LP is a disc of polyvinyl chloride blended with polyvinyl acetate, nominally 11⅞ inches in diameter and pressed at 80–200 g depending on grade. A single continuous spiral groove runs from the outer edge (radius ≈ 146 mm) to an inner stopping diameter of approximately 121 mm, covering a total groove length of roughly 500 meters per side.[^wikipediaPR] The groove profile is V-shaped with a 90° included angle, cut by a sapphire chisel on a precision mastering lathe.

Key dimensional parameters, per RIAA Bulletin E4 and Neumann lathe specifications, are as follows:[^pspatialDims][^riaaE4]

| Parameter | Typical value |
|---|---|
| Groove width (unmodulated top) | 40–80 µm (≈56 µm nominal) |
| Minimum groove width (stereo) | 25 µm (1 mil) |
| Groove depth (nominal) | ≈28 µm |
| Groove bottom radius | ≤6 µm |
| Groove pitch (spacing) | ≈200–254 grooves/inch |
| Maximum groove excursion | ±38 µm peak (76 µm peak-to-peak) |

Linear groove velocity — the speed at which the groove passes the stylus — varies substantially with radial position. At the outermost groove, velocity is approximately 0.509 m/s; at the innermost, it drops to about 0.196 m/s. This 60% reduction in velocity compresses high-frequency wavelengths toward the inner edge of the disc and is the primary source of tracing distortion, discussed further in the playback section.[^pspatialVelocity]

## Recording: the cutting lathe

Audio is cut into a lacquer-coated aluminium disc in real time on a precision lathe — predominantly Neumann models (VMS 66, 70, 80) or Scully equivalents. The cutter-head operates as a loudspeaker in reverse: two moving-coil solenoids, each driven by amplifiers of up to 500 W, vibrate a heated sapphire cutting stylus with a tip radius smaller than 4 µm. Heating the stylus reduces groove noise and improves high-frequency response by allowing the lacquer to flow cleanly during the cut; removed lacquer (swarf) is vacuumed away continuously.[^pspatialLathes][^pureAnalogue]

Modern lathes dynamically adjust groove spacing based on an advance playback signal read approximately one second ahead of the cut. Loud passages receive wider spacing to prevent groove breakthrough; quiet passages are packed tighter to conserve space. The Neumann VMS 80 extended this to variable depth control, reducing groove depth during quiet passages because a shallower V-groove also narrows laterally. Together, these techniques allow a 12-inch side to hold more than 22 minutes of program material.[^pspatialLathes] The finished lacquer is electroplated to produce nickel stampers for mass pressing.

Two cutting geometries exist. **Lateral modulation** moves the stylus side-to-side at constant depth — the industry standard for mono since Berliner's era. **Vertical (hill-and-dale) modulation**, used by Edison, moves the stylus up and down at constant lateral position. Vertical cutting lost the commercial format competition by the 1920s but found new life in stereo encoding.[^wikipediaVC]

## Stereo encoding: the 45/45 system

The **Westrex 45/45 system**, commercially introduced in 1958 (though the core concept was patented by Alan Blumlein in 1933), encodes two audio channels by mounting two drive coils at right angles in the cutter-head, each oriented at 45° to the vertical. The left channel modulates the inner groove wall; the right channel modulates the outer groove wall.[^riaaE3]

The elegance of 45/45 lies in its mid-side equivalence:

- A mono (L+R) signal produces lateral-only modulation — identical to a mono record.
- A difference (L−R) signal produces vertical-only modulation.
- A signal present in only one channel produces diagonal movement at 45°.

This design achieves mono compatibility automatically: a lateral-only cartridge naturally sums L+R from a stereo groove. It also distributes horizontal and vertical noise equally between channels, unlike the competing lateral-vertical (L-V) approach where turntable rumble would contaminate only one channel.[^nelsonStafford1964]

A practical constraint arises from V-groove geometry: vertical modulation increases groove width. Out-of-phase bass content (L−R at low frequencies) produces large vertical excursions that can cause groove breakthrough or stylus disengagement. Mastering engineers therefore use an elliptical equalizer to progressively sum bass to mono below approximately 150 Hz, confining low-frequency energy to the lateral plane. The RIAA standard also specifies a nominal vertical tracking angle (VTA) of 20° ±5°[^iec60098_1987], requiring the playback stylus to be tilted to match the cutting angle.[^pspatialLathes]

## The stylus: tracing the groove

The playback stylus is a diamond (occasionally sapphire) mounted at the tip of a cantilever — a thin, rigid bar of aluminium, boron, sapphire, or diamond. As the record rotates, the stylus is deflected by the microscopic undulations of both groove walls simultaneously, vibrating across a frequency range from below 20 Hz to above 20 kHz. The stylus experiences extraordinary accelerations: at 400 Hz with maximum groove excursion, peak acceleration reaches approximately 240 m/s² (≈24 g), and at high frequencies this can exceed 1,000 g.[^pspatialVelocity]

Tip geometry is critical to tracing accuracy. The original mono conical (spherical) stylus had a 25 µm radius; stereo styli were reduced to 18 µm to ride deeper in narrower microgrooves. More advanced profiles include:

- **Elliptical**: major radius ≈18 µm, minor radius ≈8–10 µm. The narrower contact dimension traces high-frequency modulations more accurately than a spherical tip.
- **Shibata** (JVC, 1973): a complex asymmetric profile with a vertical contact area large enough to dramatically reduce groove-wall pressure, extending stylus and record life.
- **MicroLine/MicroRidge**: contact radii as small as 2.5 µm, approximating the shape of the cutting stylus itself and providing the most accurate tracing at inner grooves.[^audioTechnicaStylus][^soundsmith]

Despite a tracking force of only 1–2 grams, the contact pressure at the stylus-groove interface is immense because of the minuscule contact area — a consequence of Hertzian contact mechanics. Counterintuitively, too little tracking force is as damaging as too much: an underloaded stylus loses contact with the groove walls, bouncing and impacting them rather than gliding smoothly.

## The phono cartridge: motion to voltage

A **phono cartridge** converts the stylus's mechanical motion into an electrical signal via Faraday's law: relative motion between a magnetic field and a conductor induces a voltage proportional to the rate of change of magnetic flux. Because output voltage is proportional to stylus *velocity* rather than displacement, phono cartridges are velocity transducers — a fact that directly motivates RIAA equalization.[^cambridgeAudio][^psAudio2020]

### Moving magnet cartridges

In a **moving magnet** (MM) design, tiny permanent magnets attached to the internal end of the cantilever vibrate between fixed wound coils. Typical output is 3–6 mV at 5 cm/s recorded velocity at 1 kHz, into a standard load of 47 kΩ. MM cartridges exhibit high coil inductance (100–500 mH), forming an LCR resonant circuit with cable and preamp input capacitance; total capacitive loading must typically be held to 100–300 pF to keep that resonance just above 20 kHz. The stylus assembly is user-replaceable, and cost is lower than moving coil designs.[^hagerman][^psAudio2020]

### Moving coil cartridges

**Moving coil** (MC) cartridges reverse the arrangement: fine-wire coils are attached to the cantilever and move within a fixed permanent magnetic field. The dramatically lower moving mass yields superior transient response and extended high-frequency capability. Output is much lower — typically 0.15–0.5 mV for low-output designs — requiring a dedicated high-gain phono stage (55–70 dB) or a step-up transformer. Internal impedance is very low (2–40 Ω) and inductance is orders of magnitude below MM (5–500 µH), pushing electrical resonance to approximately 1 MHz and well outside the audible band.[^hagerman][^psAudio2020]

| Parameter | Moving magnet (MM) | Moving coil (MC) |
|---|---|---|
| Output voltage | 3–6 mV | 0.15–0.5 mV |
| Load impedance | 47 kΩ | 100–1,000 Ω |
| Coil inductance | 100–500 mH | 5 µH – 500 µH |
| Electrical resonance | Near 20 kHz | ~1 MHz |
| Stylus replacement | User-serviceable | Factory service |

## RIAA equalization

**RIAA equalization** is the reciprocal frequency-response modification applied during recording and playback that makes the vinyl LP practical. Two physical constraints make it necessary. First, bass frequencies produce enormous groove excursions: without attenuation below ~500 Hz during cutting, adjacent grooves would overlap and a 12-inch side would hold only a few minutes of music. Second, vinyl surface noise (hiss, crackle) is concentrated at high frequencies; boosting treble during recording and cutting it during playback buries that noise below the de-emphasized noise floor. Together, the recording pre-emphasis and playback de-emphasis achieve a net improvement in signal-to-noise ratio across the full audio band.[^howardRIAA][^wikipediaRIAA]

Adopted in 1954 and standardized internationally as IEC 60098 in 1964, the RIAA curve replaced more than 100 proprietary equalization curves — including Columbia LP, Decca-US, and NAB variants — with a single characteristic defined by three time constants:

| Time constant | Corner frequency | Role |
|---|---|---|
| 3,180 µs | 50.05 Hz | Bass shelving turnover |
| 318 µs | 500.5 Hz | Transition to flat midrange |
| 75 µs | 2,122 Hz | Treble pre-emphasis onset |

During cutting, bass below ~500 Hz is progressively attenuated (reaching approximately −20 dB at 20 Hz relative to 1 kHz) while treble above ~2,122 Hz is boosted (reaching approximately +20 dB at 20 kHz). The total correction swing across the audio band is roughly 40 dB. The playback phono preamplifier applies the exact inverse, restoring flat frequency response.[^howardRIAA][^wikipediaRIAA]

The playback de-emphasis transfer function is:

```
H(s) = (1 + s·T₂) / [(1 + s·T₁)(1 + s·T₃)]

where T₁ = 3,180 µs, T₂ = 318 µs, T₃ = 75 µs, s = jω
```

A 1976 IEC amendment added a fourth time constant of 7,950 µs (20.02 Hz) for a subsonic rolloff below 20 Hz, attenuating warp and rumble. This remains debated: it introduces −3.0 dB at 20 Hz and −1.0 dB at 40 Hz, audibly affecting deep bass (Wikipedia, n.d.-c).

## Playback physics: resonance, tracking force, and skating

The tonearm and cartridge together form a damped mass-spring oscillator. The tonearm's effective mass acts as the oscillating mass; the cartridge suspension compliance acts as the spring. Their resonant frequency is:

```
f₀ = 1 / (2π√(M × C))

where M = effective mass (g), C = dynamic compliance at 10 Hz (10⁻⁶ cm/dyne)
```

The target resonance window is 8–12 Hz — above record-warp frequencies (2–5 Hz) and below the audible bass band (≥20 Hz). Below 8 Hz, warps excite the resonance, causing woofer pumping and groove-skipping; above 12 Hz, it colors the bass response.[^sumiko][^vinylClear]

Vertical tracking force (VTF) must be set within the cartridge manufacturer's specified range, typically 1.0–2.5 g. Too little force causes mistracking and paradoxically increases record wear because the stylus bounces and impacts groove walls rather than gliding along them. Too much force deforms groove walls plastically.

On a pivoted tonearm, the headshell offset angle and stylus-groove friction produce an unbalanced inward force — **skating force** — roughly 10–15% of the tracking force in magnitude. Left uncompensated, the stylus presses harder on the inner groove wall, degrading right-channel tracking and causing asymmetric stylus wear. Anti-skating mechanisms (springs, hanging weights, or magnets) apply an outward counterforce, though perfect compensation is not achievable because skating force varies continuously with groove radius and modulation level.[^audioTechnicaAntiskate]

## Frequency response, dynamic range, and limitations

A vinyl LP's nominal frequency response is 20 Hz–20 kHz ±3 dB, though real-world deviations of 5–10 dB at the extremes are common. The progressive reduction of groove velocity toward the inner edge compresses high-frequency wavelengths: a 10 kHz tone has a groove wavelength of ≈51 µm at the outermost track but only ≈20 µm at the innermost, approaching the physical dimensions of the playback stylus and causing **inner groove distortion** (IGD). This phenomenon, analyzed by H. A. Frederick in 1932 and formalized by M. J. Di Toro in 1937, is the dominant source of distortion on vinyl and worsens progressively throughout each side. Mitigation strategies include pressing at 45 RPM to increase inner-groove velocity, using advanced stylus profiles (Shibata and MicroLine trace inner grooves far more accurately than conical tips), and keeping sides short.[^jovanovic2023][^pspatialVelocity]

The theoretical maximum dynamic range is approximately 70 dB, derived from the ratio of maximum groove modulation (~76 µm peak-to-peak) to surface roughness (~25 nm) — equivalent to roughly 13-bit digital resolution. Practical measurements range from 55–70 dB depending on pressing quality and frequency.[^pspatialVelocity] For comparison, a 16-bit Red Book CD delivers approximately 96 dB theoretical dynamic range, a 20–40 dB advantage. Other quantifiable limitations versus digital formats include:

- **Channel separation**: typically 20–30 dB at 1 kHz (vs. 90–115 dB on CD).
- **Total harmonic distortion**: 0.4–3% on vinyl (vs. <0.01% for a competent DAC).
- **Wow and flutter**: 0.01–0.25% depending on turntable quality (vs. effectively zero on digital).
- **Pre-echo**: groove-wall deformation from adjacent loud passages creates a faint ghost signal approximately 1.8 seconds before the intended sound (one revolution at 33⅓ RPM); digital formats are immune.[^hydrogenaudio][^wikipediaPR]

[^analogmagik]: AnalogMagik. (n.d.). [*Anti-skate*](https://www.analogmagik.com/antiskate).
[^audioTechnicaStylus]: Audio-Technica. (n.d.). [*Understanding the different stylus shapes*](https://www.audio-technica.com/en-eu/support/understanding-the-different-stylus-shapes).
[^audioTechnicaAntiskate]: Audio-Technica. (n.d.). [*Anti-skate feature on turntable*](https://www.audio-technica.com/en-us/support/audio-solutions-question-week-anti-skate-feature-turntable-need-set/).
[^cambridgeAudio]: Cambridge Audio. (n.d.). [*What is the difference between a moving magnet cartridge and a moving coil cartridge?*](https://manuals.cambridgeaudio.com/en/alva-duo/what-difference-between-moving-magnet-cartridge-and-moving-coil-cartridge).
[^hagerman]: Hagerman Technology. (n.d.). [*Cartridge loading*](https://www.hagtech.com/loading.html).
[^howardRIAA]: Howard, K. (n.d.). [Cut and thrust: RIAA LP equalization](https://www.stereophile.com/features/cut_and_thrust_riaa_lp_equalization/index.html). *Stereophile*.
[^hydrogenaudio]: Hydrogenaudio. (n.d.). [Myths (vinyl)](https://wiki.hydrogenaudio.org/index.php?title=Myths_(Vinyl)). *Hydrogenaudio Knowledgebase*.
[^iec60098_1987]: International Electrotechnical Commission. (1987). *IEC 60098: Analogue audio disk records and reproducing equipment*. IEC.
[^jovanovic2023]: Jovanovic, V. (2023). Tracing distortion on vinyl LPs. *Journal of the Audio Engineering Society*, *71*(10). https://www.aes.org/tmpFiles/elib/20251204/22236.pdf
[^nelsonStafford1964]: Nelson, C. S., & Stafford, J. W. (1964). The Westrex 3D StereoDisk system. *Journal of the Audio Engineering Society*, *12*(3).
[^psAudio2020]: PS Audio. (2020, February 21). [Secrets of the phono cartridge, part two](https://www.psaudio.com/blogs/copper/secrets-of-the-phono-cartridge-part-two). *Copper Magazine*.
[^pspatialDims]: Pspatial Audio. (n.d.). [*Gramophone styli and groove dimensions*](http://pspatialaudio.com/stylus_grooves.htm).
[^pspatialVelocity]: Pspatial Audio. (n.d.). [*Maximum recorded velocities*](https://pspatialaudio.com/max_velo.htm).
[^pspatialLathes]: Pspatial Audio. (n.d.). [*Disc-cutting lathes*](https://pspatialaudio.com/lathes.htm).
[^pureAnalogue]: Pure-analogue.com. (n.d.). [*The cutting lathe*](https://pure-analogue.com/the-cutting-lathe/).
[^riaaE4]: RIAA. (n.d.). [Bulletin E4: Dimensional standards for disc phonograph records](http://www.aardvarkmastering.com/riaa.htm).
[^riaaE3]: RIAA. (1963). [Bulletin E3: Standards for stereophonic disc records](http://www.aardvarkmastering.com/riaa.htm).
[^soundsmith]: Soundsmith. (n.d.). [*Stylus shape information*](https://www.sound-smith.com/articles/stylus-shape-information).
[^sumiko]: Sumiko. (n.d.). [*Tonearm resonance*](https://sumikophonocartridges.com/tonearm-resonance/).
[^vinylClear]: Vinyl Clear. (n.d.). [Tonearm and cartridge resonance: A guide to better vinyl sound](https://vinylclear.com/blogs/all-things-vinyl/tonearm-and-cartridge-resonance-a-guide-to-better-vinyl-sound). *Vinyl Clear*.
[^wikipediaPR]: Wikipedia. (n.d.). [Phonograph record](https://en.wikipedia.org/wiki/Phonograph_record). *Wikipedia*.
[^wikipediaVC]: Wikipedia. (n.d.). [Vertical cut recording](https://en.wikipedia.org/wiki/Vertical_cut_recording). *Wikipedia*.
[^wikipediaRIAA]: Wikipedia. (n.d.). [RIAA equalization](https://en.wikipedia.org/wiki/RIAA_equalization). *Wikipedia*.
