---
title: "PlayStation 2 Hardware Models"
date: 2026-08-20
draft: false
tags:
  - backward-compatibility
  - consoles
  - playstation
  - retro
---

The **PlayStation 2** is not two consoles. It is three hardware families across roughly twenty-one retail revisions, and the divisions that matter are not the ones printed on the box. Sony shipped the machine from March 2000 to 2013, thirteen years, the longest production run of any home console, and re-engineered it continuously across that span: chips merged, ports removed, an entire co-processor replaced with software.

The popular framing splits the line into "Fat" and "Slim" by chassis. That split is real but shallow. It groups consoles with fundamentally different silicon together and separates consoles that are electrically near-identical. This entry reorganises the line by the three things that actually determine how a given unit behaves today: which PS1 execution architecture it carries, how its optical drive and MechaCon age, and what homebrew it will accept.

## Scope

This entry is not a games compatibility list; per-title PS1 behaviour is tracked elsewhere and changes as homebrew drivers improve. It is not a repair manual; no disassembly steps, laser-pot values, or solder points appear here. It is not a collector price guide, because those figures decay faster than this entry will be revised. Non-retail hardware, meaning the DTL-H debugging stations, DTL-T reference tools, and COH-H arcade boards, of which both Fat and Slim debug units exist, is named for completeness and otherwise out of scope.[^consolemodsb2026]

### The two divisions that matter

| Division | Splits at | What it determines |
|---|---|---|
| **PGIF** vs **DECKARD** | SCPH-70000 / SCPH-75000 | Whether PS1 code runs on a physical MIPS R3000A processor or is translated in software. Governs PS1 compatibility, timing accuracy, and which homebrew features are available. |
| Fat vs Slim chassis | SCPH-50000 / SCPH-70000 | Expansion bay and internal HDD support, cooling headroom, power supply topology, and long-term optical drive service intervals. |

The two divisions do not align. SCPH-70000 is a Slim chassis carrying the Fat generation's PS1 silicon, which is why it appears on both sides of most recommendation lists.

## Architecture

Backward compatibility was never emulation and was never fully native. It was a hardware CPU bolted to an emulated GPU, and Sony removed the hardware half in 2005.

### The PGIF arrangement

Sony embedded the original PlayStation's MIPS R3000A-derived CPU, running at roughly 33.8 MHz, directly onto the PS2 motherboard. Under PS2 software this chip serves as the system's Input Output Processor, handling controllers, memory cards, and the optical drive. When a PS1 disc is inserted it resumes its original role and executes PS1 code natively, with no instruction translation and no timing approximation.[^obsoletesony2026]

This arrangement covers every Fat model from SCPH-10000 through SCPH-50000, plus the first Slim revision, SCPH-70000. It produces the highest overall PS1 compatibility available on any PS2.

### The GPU that was never there

The PS1 GPU was not carried over. PS1 draw commands are intercepted and re-executed on the PS2's Graphics Synthesizer. The results are close but not identical: original dithering is lost, producing visible colour banding; certain transparency tricks break; texture corruption appears occasionally. This affects every PS2 ever made, PGIF and DECKARD alike, and is the single most common cause of "this looks wrong on my PS2" reports.[^obsoletesony2026]

### The DECKARD substitution

From SCPH-75000 onward the physical R3000A was removed and replaced with a software environment known as **DECKARD**, running on a PowerPC-based subsystem performing real-time instruction translation. The change reduced manufacturing cost and invalidated timing assumptions that a meaningful minority of PS1 titles relied on. Roughly ninety-five percent of the PS1 library still runs; the remaining five percent ranges from cosmetic glitching to hard freezes.[^obsoletesony2026]

Known regressions on DECKARD hardware include *Chrono Cross* failing during the ending FMV sequence, *Crash Bash* freezing, frame pacing irregularities in *Spyro: Year of the Dragon*, audio glitching in *Resident Evil 3*, and *The X-Files Game* crashing during video playback. All five behave correctly on PGIF units. This is an illustrative sample rather than an exhaustive list; community regression tracking for DECKARD consoles remains incomplete.[^obsoletesony2026]

### The MechaCon crash

Independent of the PS1 architecture, a fault in the **MechaCon** drive controller first appears in the SCPH-39000 revision at very low frequency, then rises considerably in SCPH-50000, where the SYSCON chip was eliminated and its functions folded into a new MechaCon. Because the fault became conspicuous only on the 50000 series, it is widely and incorrectly believed to have originated there.[^consolemods2026]

The same SCPH-50000 revision introduced MechaCon software patching via the encrypted EEPROM area, the mechanism the MechaPwn softmod exploits.[^consolemods2026]

### Silicon consolidation

Cost reduction drove a steady merge of discrete chips into single packages. SCPH-70000 shipped in two sub-variants, one with separate Emotion Engine and Graphics Synthesizer dies and one unified; SCPH-77000 shipped unified exclusively with a redesigned ASIC and updated BIOS. SCPH-79000 merged the EE, RDRAM, SPU2, and IOP into a single ASIC and brought the console down to 600 g with a 250 g adapter. SCPH-90000 restored the internal power supply.[^wikipedia2025]

## Model taxonomy

Ratings below are out of five and weigh optical drive service interval, thermal headroom, known controller faults, and documented failure clustering. They describe expected longevity of an average surviving unit in 2026, not build quality when new, and not feature set. A 2024 survey of 127 active PS2 repair technicians found Fat units required laser servicing roughly once every 4.2 years against once every 1.3 years for Slims; that ratio anchors the scale.[^alibaba2026]

### Fat chassis, 2000–2004

| Model | Year | Region | PS1 | Notes | Rating |
|---|---|---|---|---|---|
| SCPH-10000 / 15000 | 2000 | JP | PGIF | "ProtoKernels". Early kernel software with unresolved defects; fixable only via kernel replacement. PCMCIA slot, external HDD. No DVD playback without encrypted memory card software. | 2 / 5 |
| SCPH-18000 | 2000–01 | JP | PGIF | First major redesign. Kernel defects resolved. Built-in DVD playback added. Last retail PS2 using PCMCIA for HDD. | 3 / 5 |
| SCPH-30000 | 2000–01 | WW | PGIF | First worldwide launch model. Expansion bay replaces PCMCIA. Multi-board PCB. Disc Read Error laser defect; subject of a class-action suit. | 2 / 5 |
| SCPH-30000R / 35000 | 2001–02 | WW | PGIF | Heavy motherboard redesign, unified board, improved laser. Chassis screws reduced from ten to eight. | 4 / 5 |
| SCPH-37000 | 2002 | JP | PGIF | Reduced power consumption. Exclusive semi-transparent Ocean Blue (L) and Zen Black (B) shells, never repeated. | 4 / 5 |
| SCPH-39000 | 2002–03 | WW | PGIF | Worldwide equivalent of the 37000. Reputation as the most reliable revision is a myth propagated by modchip installers; it was simply the easiest to chip. First model susceptible to the MechaCon crash, at low frequency. | 4 / 5 |
| SCPH-50000 | 2003–04 | WW | PGIF | Final Fat revision. Adds IR receiver, 480p DVD output, DVD±R/RW support, quieter fans. Removes i.LINK and SYSCON. MechaCon crash frequency rises considerably. | 3 / 5 |

### Slim chassis, 2004–2013

| Model | Year | Region | PS1 | Notes | Rating |
|---|---|---|---|---|---|
| SCPH-70000 | 2004–05 | WW | PGIF | First Slim. Roughly 75% smaller and lighter. Expansion bay removed, Ethernet added, external power brick. Early production PSUs recalled for overheating. Retains the physical PS1 CPU, the last model to do so. | 4 / 5 |
| SCPH-75000 | 2005–06 | WW | DECKARD | Physical R3000A removed; DECKARD substituted. HDD support fully dropped. New disc drive assembly. First model with documented PS1 regressions. | 3 / 5 |
| SCPH-77000 | 2006–07 | WW | DECKARD | Unified EE and GS exclusively. Redesigned ASIC, updated BIOS and drivers. PS1 compatibility improved over the 75000 but still below PGIF. | 3 / 5 |
| SCPH-79000 | 2007–08 | WW | DECKARD | EE, RDRAM, SPU2, and IOP merged into one ASIC. Reduced to 600 g. Highest documented failure rate of any PS2 revision. | 2 / 5 |
| SCPH-90000 | 2007–13 | WW | DECKARD | Final revision; internal PSU restored. Elevated disc-laser failure rate. Units after Q3 2008 carry a patched BIOS closing the memory card exploit. Endpoint of cost reduction and the most software-reliant configuration. | 2 / 5 |

Regional variation is encoded in the final digit of the model number; SCPH-90001 is North America, 90002 Australia. Parts are not interchangeable across regions and power supply voltages differ.[^wikipedia2025] The elevated disc-laser failure rate on the 90000 series is the most consistently reported hardware complaint across the Slim line.[^retrobroker]

### Special and embedded variants

| Model | Year | Region | PS1 | Notes | Rating |
|---|---|---|---|---|---|
| PSX — DESR-5000 / 7000 series | 2003–06 | JP | PGIF | PS2 internals plus DVR, DVD-R/RW burner, TV tuner, and 64 MB RDRAM. Debut of the XrossMediaBar. 160 GB or 250 GB HDD, unreplaceable due to DVRP chip security. Incompatible with multitaps. High DVD laser and HDD failure rates. Commercial failure; four revisions shipped. | 1 / 5 |
| Audiovox VOD10PS2 | 2009 | US | DECKARD | In-car overhead unit. SCPH-9000x internals in a 10.2-inch 800×480 display with FM modulator, wireless controllers and headphones. Vehicle heat and vibration compound an already weak laser. | 2 / 5 |
| Sony BRAVIA KDL-22PX300 | 2010 | EU | DECKARD | 22-inch 1366×768 television with an integrated PS2. Cannot be serviced independently of the panel; a console fault risks the whole unit. | 2 / 5 |
| Advent ADV10PS2 | — | US | DECKARD | In-car variant closely related to the Audiovox unit. Sparsely documented; figures here require re-verification. | 2 / 5 |

## Selection and triage

Decide what the console is for before deciding which one to buy; the answer changes completely between a PS1 machine, a PS2 machine, and a homebrew platform.

| If the goal is | Buy | Because |
|---|---|---|
| Best PS1 playback | SCPH-39000 or SCPH-30000R | Physical R3000A, low MechaCon exposure, worldwide availability, and Fat cooling headroom. |
| PS1 playback in a small footprint | SCPH-70000 | Only Slim with the physical PS1 CPU. Verify the unit is not an early-production recalled PSU batch. |
| Internal HDD and full PS2 compatibility | SCPH-50000 | Expansion bay support with the mature late-Fat board. Accept the elevated MechaCon crash rate. |
| Softmod and USB PS1 loading | SCPH-75000 – SCPH-79000 | DECKARD-only DKWDRV features require DECKARD silicon. Avoid SCPH-90000 units made after Q3 2008. |
| Display piece only | Anything | Model choice matters least when runtime is minimal. |

### Pre-purchase verification

Run these in order and stop at the first failure.[^alibaba2026]

1. **Confirm the model number.** Request a clear photograph of the bottom label. A seller who will not photograph the label is selling an untested unit.
2. **Demand video, not a power-on photo.** The tray must open and close, the disc must spin, and the unit must boot to the browser screen with a disc inserted.
3. **Ask about Disc Read Error history** and whether it was resolved by cleaning or by part replacement. "I don't know" means untested.
4. **Treat "refurbished" without service documentation as a null claim.** Most such listings carry no service log at all.
5. **Do not let a modchip or softmod substitute for laser health.** Neither extends the functional life of a decaying laser; they mask symptoms.

### Failure modes and false positives

| Symptom | Likely cause | Not the cause |
|---|---|---|
| Black screen on a modern TV | PS1 titles output 240p, which many displays will not lock onto over component. Requires RGB SCART, OSSC, RetroTINK, or an HDMI mod. | A dead console or a failed laser. |
| Disc read failure on original discs | Mechanical alignment, lens wear, or drive control behaviour. Game discs stress the mechanism far harder than DVD films. | Region locking, or a setting that can be changed in software. |
| Colour banding in PS1 titles | The absent PS1 GPU. Dithering is lost in translation to the Graphics Synthesizer. Present on every model. | DECKARD. This occurs identically on PGIF units. |
| PS1 save data will not load | PS1 saves require a PS1 memory card. PS2 cards cannot store PS1 save data. | A corrupted save or an incompatible disc. |
| A specific PS1 title freezes | If the unit is SCPH-75000 or later, a DECKARD timing regression is the first hypothesis. | Disc condition, if the same disc runs on a PGIF unit. |

## Homebrew state

**DKWDRV** is a unified replacement for *PS1DRV*, the Sony driver layer that mediates PS1 execution on PS2 hardware. It installs on both architectures and replaces Sony's driver wholesale. Version 1.7.6g is the current release as of August 2026; the project remains in active development, and this section will date faster than any other in this entry.[^psxplace2025]

Its feature set splits along the same PGIF and DECKARD line as the hardware itself.

| Feature | PGIF | DECKARD | Detail |
|---|---|---|---|
| Forced dithering control | Yes | Yes | Enable or disable dithering outright. Removes the need for per-game patches and cheat codes. |
| GPU colour banding control | Yes | Yes | Sony's PS1DRV applied banding correction to sprites only. |
| Screen offset adjustment | Yes | Yes | Configurable horizontal and vertical positioning. |
| Per-game saved configuration | Yes | Yes | All PS1 config options can be tweaked and written to disk. |
| Extended polygon sharpening | Yes | Yes | More filtering values than the original driver exposed, plus a separate filtering option for sprites. Sony applied sharpening only to textured polygons. |
| GP1 reset fix | Yes | Yes | Repairs GPU GP1 reset handling used widely in PS1 homebrew, which otherwise fails under PS2. |
| Automatic license and logo patching | No | Yes | DECKARD only. PGIF units receive a warning explaining the resulting black screen; booting still requires a modchip or disc swap. |
| USB mass loading of PS1 images | No | Yes | DECKARD only, SCPH-75000 and later. Beta status. |

A PGIF console gains the entire GPU-layer improvement set on top of hardware PS1 execution it already has, a strong unit made stronger, with no compromise traded away.[^dkwdrv] A DECKARD console gains the same GPU-layer set plus the loading and patching features, but cannot recover the timing accuracy lost when the R3000A was removed.[^aldostools2025] Neither driver closes the architectural gap; it narrows the visual one.

Version numbers, release status, and DECKARD feature availability described here were current on 28 August 2026 and should be re-verified against the project repository before use.

[^aldostools2025]: aldostools. (2025, January 20). [*PS2 DKWDRV 1.7.6b updated*](https://x.com/aldostools/status/1881176553733886402) [Post]. X.
[^alibaba2026]: Alibaba Electronics. (2026). [*PS2 buying guide: What to know*](https://electronics.alibaba.com/buyingguides/ps2-buying-guide-what-to-know-in-2025). Alibaba.
[^consolemods2026]: ConsoleMods Wiki. (2026). [*PS2: Model differences*](https://consolemods.org/wiki/PS2:Model_Differences).
[^consolemodsb2026]: ConsoleMods Wiki. (2026). [*PS2 talk: Model differences*](https://consolemods.org/wiki/PS2_talk:Model_Differences).
[^dkwdrv]: DKWDRV. (n.d.). [*Unified single PS1DRV replacement, compatible with mostly all PS2 models*](https://github.com/DKWDRV/DKWDRV) [Computer software]. GitHub.
[^obsoletesony2026]: ObsoleteSony. (2026, January 27). [*PlayStation 2 backward compatibility explained*](https://obsoletesony.substack.com/p/ps2-backward-compatibility). Substack.
[^psxplace2025]: PSX-Place. (2025). [*DKWDRV: Unified PS1DRV for all PS2 models*](https://www.psx-place.com/threads/dkwdrv-unified-ps1drv-for-all-ps2-models.37183/).
[^retrobroker]: RetroBroker. (n.d.). [*PS2 console versions explained: Fat vs. slim & model guide*](https://retrobroker.com/en/blog/ps-2-console-versions-explained-fat-vs-slim-and-model-guide-retro-broker).
[^wikipedia2025]: Wikipedia. (2025). [*PlayStation 2 models*](https://en.wikipedia.org/wiki/PlayStation_2_models).
