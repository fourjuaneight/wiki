---
title: Audio Hardware
draft: false
---

## DAC

Digital-to-Analog Converters are the bridge between the digital realm of ones and zeros and the analog waves that reach our ears. A DAC is a vital component that translates digital information into analog signals that our ears can understand. The quality of a DAC can have a significant effect on sound quality, particularly through performance metrics such as THD+N (Total Harmonic Distortion plus Noise), SNR (Signal-to-Noise Ratio), dynamic range, and jitter sensitivity — all of which are standardized by AES17-2020, the Audio Engineering Society's benchmark method for measuring digital audio equipment (Audio Engineering Society, 2020). The governing IEEE standard for DAC terminology and test methods is IEEE Std 1658-2023 (IEEE, 2024).

One underappreciated factor is **clock jitter** — small timing variations in the digital signal that can introduce noise sidebands in the analog output. Dunn (1992) established that approximately 10–20 ns of peak-to-peak jitter becomes audible with high-frequency test tones, while Benjamin and Gannon (1998) confirmed that asynchronous USB DACs, which use their own internal clock rather than recovering it from the data stream, achieve single-digit picosecond jitter — far below the threshold of audibility.

Here is a list of common inputs and outputs you might find on a DAC:

### Inputs

- **[USB](https://en.wikipedia.org/wiki/USB#Audio_streaming)**: USB Audio Class 2.0 supports up to 32-bit/384 kHz audio and DSD via High Speed USB. Asynchronous isochronous mode — where the DAC controls its own clock — is the preferred architecture for high-performance audio (USB Implementers Forum, n.d.).
- **[Optical](https://en.wikipedia.org/wiki/TOSLINK) (TOSLINK / S/PDIF)**: A fiber-optic consumer digital audio connection standardized as IEC 60958-3. Supports up to 768 kHz/24-bit in modern implementations, though TOSLINK signals exhibit higher jitter than coaxial due to LED and photodetector bandwidth limitations (International Electrotechnical Commission, 2006).
- **[Coaxial](https://en.wikipedia.org/wiki/Coaxial_cable) (S/PDIF)**: A digital connection using standard RCA jacks, also governed by IEC 60958-3. Common in CD players and transports; coaxial generally achieves lower jitter than TOSLINK.
- **AES/EBU (XLR)**: The professional-grade digital audio interface, standardized as AES3-2009, using 110 Ω balanced twisted pair with XLR connectors. Supports up to 192 kHz/24-bit and is specified for runs up to 100–300 m unequalized (Audio Engineering Society, 2009).
- **[Bluetooth](https://en.wikipedia.org/wiki/Bluetooth)**: Wireless connection using the A2DP profile. Audio quality is codec-dependent: SBC (mandatory baseline) operates at ~328 kbps; LDAC (Sony) reaches 990 kbps at 24-bit/96 kHz; aptX Lossless scales to ~1.2 Mbps for CD-quality audio under favorable RF conditions.
- **[HDMI](https://en.wikipedia.org/wiki/HDMI#HDMI_Ethernet_and_Audio_Return_Channel) (eARC)**: HDMI 2.1's Enhanced Audio Return Channel supports up to 37 Mbps, enabling 32 channels of uncompressed audio at 24-bit/192 kHz, including lossless Dolby TrueHD and DTS-HD Master Audio (HDMI Forum, n.d.).
- **[Ethernet / AoIP](https://en.wikipedia.org/wiki/AES67)**: For networked audio and streaming services. The AES67-2018 standard governs high-performance audio-over-IP interoperability, using IEEE 1588 PTPv2 for clock synchronization and targeting ≤10 ms latency (Audio Engineering Society, 2018).
- **SD Card / Flash Drive**: Some DACs allow direct playback from memory cards or USB drives, bypassing a computer entirely.

### Outputs

- **[RCA](https://en.wikipedia.org/wiki/RCA_connector)**: Standard unbalanced analog connection for most consumer home audio equipment.
- **[XLR](https://en.wikipedia.org/wiki/XLR_connector)**: Balanced analog connection used in professional and high-end audio systems. The balanced topology rejects common-mode noise, making XLR preferable for longer cable runs.
- **[Headphone Jack](https://en.wikipedia.org/wiki/Phone_connector_(audio)) (3.5 mm or 1/4-inch)**: For connecting headphones directly to the DAC.
- **Preamp Output**: To connect to an external amplifier or powered speakers.

### Key References

- Audio Engineering Society. (2020). *AES17-2020: AES standard method for digital audio engineering — Measurement of digital audio equipment*. AES.
- Audio Engineering Society. (2009, reaffirmed 2014). *AES3-2009 (r2014): AES standard for digital audio engineering — Serial transmission format for two-channel linearly represented digital audio data*. AES.
- Audio Engineering Society. (2018). *AES67-2018: AES standard for audio applications of networks — High-performance streaming audio-over-IP interoperability*. AES.
- Benjamin, E., & Gannon, B. (1998). Theoretical and audible effects of jitter on digital audio quality [Convention paper 4826]. *105th AES Convention*, San Francisco, CA.
- Dunn, J. (1992). Jitter: Specification and assessment in digital audio equipment [Convention paper 3361]. *93rd AES Convention*, San Francisco, CA.
- IEEE. (2024). *IEEE standard for terminology and test methods of digital-to-analog converter devices* (IEEE Std 1658-2023). IEEE.
- International Electrotechnical Commission. (2006). *IEC 60958-3:2006 digital audio interface — Part 3: Consumer applications*. IEC.

-----

## Pre-Amp

Preamplifiers are signal-conditioning components that sit between a source (or DAC) and a power amplifier. Their primary functions are **source selection** (switching between inputs), **voltage gain**, and **impedance matching** — ensuring that a high-impedance source drives a low-impedance power amplifier input without signal loss. An ideal preamplifier presents high input impedance and low output impedance, functioning as an impedance transformer. The practical standard is the "10:1 rule": load impedance should be at least 10 times the source impedance for clean voltage-mode signal transfer. Typical line-level preamp output impedance is 25–100 Ω, feeding power amplifier inputs of 10–47 kΩ.

The quality of a preamplifier is critical for maintaining a pure, minimally altered signal. A well-designed unit passes as much of the original signal as possible with minimal noise addition, ensuring that the SNR of the overall system is not compromised before amplification.

**Phono preamplifiers** are a specialized category that apply RIAA equalization — a standardized frequency curve using three time constants (75 µs, 318 µs, and 3,180 µs) that provides approximately +20 dB at 20 Hz and −20 dB at 20 kHz relative to 1 kHz. Lipshitz (1979) demonstrated that many disc preamplifiers of the era had audibly inaccurate RIAA equalization due to incorrect design equations, establishing the precise mathematical framework now used universally.

In complex home theater setups, **AV preamplifiers** (also called preamp/processors) extend beyond simple gain and switching to decode multichannel surround formats (Dolby Atmos, DTS:X, Auro-3D) and distribute audio signals to multiple amplifier channels. These are distinct from stereo preamplifiers in function and signal routing architecture.

### Key References

- International Electrotechnical Commission. (1964). *IEC 60098: Analogue audio disk records and reproducing equipment*. IEC.
- Lipshitz, S. P. (1979). On RIAA equalization networks. *Journal of the Audio Engineering Society*, *27*(6), 458–481.

-----

## Amplifier

Amplifiers boost the low-level signal from a DAC or preamplifier to the power level required to drive loudspeakers. The wattage of an amplifier is not in itself a measure of quality — a well-engineered 100-watt amplifier can outperform a poorly designed 500-watt unit. Amplifiers must also be matched to speakers' power-handling capability: too much power can damage drivers, while insufficient power may cause clipping distortion, which is itself a common cause of driver damage.

Amplifiers are broadly divided into **tube (valve) amplifiers** and **solid-state amplifiers**. Solid-state designs offer lower THD (typically 0.001–0.05%), higher damping factors (100–1000+), greater reliability, and no tube replacement. Tube amplifiers typically measure higher THD (0.1–1%+) and lower damping factors (10–40), but many listeners find their overload character more pleasant.

> **Important nuance on tube "warmth":** The even-order harmonic character often attributed to tubes is primarily a property of **circuit topology**, not the device type. Single-ended topologies (tube or solid-state) produce predominantly even-order harmonics. Push-pull topologies cancel even harmonics regardless of whether tubes or transistors are used. Hamm (1973) found that under linear operation, tubes and transistors have very similar performance characteristics; differences emerge mainly under overload conditions. Monteith and Flowers (1977) demonstrated a high-voltage transistor preamplifier with tube-like overload behavior, confirming that circuit design — not the active device — determines harmonic character.

### [Types and Classes](https://en.wikipedia.org/wiki/Power_amplifier_classes)

- **Class A Amplifiers**
  - *Benefits*: High linearity, very low distortion, excellent sound quality.
  - *Drawbacks*: Inefficient — theoretical maximum is ~50% at clipping, but practical efficiency at typical listening levels can fall to 3–15% (Gaalaas, 2006). Generates substantial heat.
- **Class B Amplifiers**
  - *Benefits*: More efficient than Class A — theoretical maximum of **78.5%** (π/4); practical average with music signals is 60–70%.
  - *Drawbacks*: Crossover distortion at the zero-crossing point where the circuit transitions between positive and negative half-cycles.
- **Class AB Amplifiers**
  - *Benefits*: The most common design. Combines Class A's low distortion near zero-crossing with Class B's efficiency. Practical efficiency: ~50–60%.
  - *Drawbacks*: Small residual bias current reduces but does not fully eliminate crossover artifacts; at moderate bias levels, "gm-doubling" — where both transistors conduct simultaneously near the crossover region — introduces low-level higher-order harmonics (Self, 2013).
- **Class D Amplifiers ("Switching" Amplifiers)**
  - *Benefits*: Highly efficient — typically 85–95% at moderate to high output levels (Gaalaas, 2006). Compact size, minimal heat. Note: the "D" does not stand for "digital."
  - *Drawbacks*: Performance varies widely by implementation. Well-designed Class D amplifiers can achieve THD+N and dynamic range comparable to high-quality Class AB designs (Attwood, 1982; Nielsen, 1997).
- **Tube Amplifiers**
  - *Benefits*: Warm, musically pleasing character, particularly from single-ended topologies. Soft-clipping behavior is subjectively preferred by many listeners at moderate overdrive (Barbour, 1998).
  - *Drawbacks*: Higher THD, lower damping factor, bulkier, requires periodic tube replacement, less efficient.
- **Integrated Amplifiers**
  - *Benefits*: Combines preamplifier and power amplifier in one unit; convenient and cost-effective.
  - *Drawbacks*: Less flexibility for component matching.
- **Monoblock Amplifiers**
  - *Benefits*: Dedicated amplifier for each channel; eliminates crosstalk, and can allow shorter speaker cable runs.
  - *Drawbacks*: Requires more space; higher cost.

### Key References

- Attwood, B. E. (1982). Design parameters important for optimization of very high fidelity PWM (Class D) audio amplifiers [Convention paper 1867]. *71st AES Convention*.
- Barbour, E. (1998). The cool sound of tubes. *IEEE Spectrum*, *35*(8), 24–35.
- Bussey, W. S., & Haigler, R. M. (1981). Tubes versus transistors in electric guitar amplifiers. In *Proceedings of the IEEE ICASSP '81* (pp. 800–803). IEEE.
- Gaalaas, E. (2006). Class D audio amplifiers: What, why, and how. *Analog Dialogue*, *40*(2), 1–7.
- Hamm, R. O. (1973). Tubes versus transistors — Is there an audible difference? *Journal of the Audio Engineering Society*, *21*(4), 267–273.
- Monteith, D. O., & Flowers, R. R. (1977). Transistors sound better than tubes. *Journal of the Audio Engineering Society*, *25*(3), 116–119.
- Nielsen, K. (1997). A review and comparison of pulse-width modulation (PWM) methods for analog and digital input switching power amplifiers [Convention paper]. *102nd AES Convention*, Munich.
- Self, D. (2013). *Audio power amplifier design* (6th ed.). Focal Press.

-----

## Speakers

Speakers are the final and essential component in an audio system, translating electrical signals into sound. A typical 2-way bookshelf speaker consists of a **tweeter** for high frequencies and a **woofer** for mid-bass and bass. A **crossover network** divides the frequency spectrum, routing appropriate bands to each driver and preventing each driver from receiving frequencies outside its optimal operating range. Small (1971) provided the foundational engineering analysis of crossover network design, establishing that drivers have limited useful frequency ranges that mandate careful frequency division.

The **Linkwitz-Riley crossover** (Linkwitz, 1976) — using 24 dB/octave slopes with −6 dB crossover points — has become the de facto industry standard for active crossovers, as it produces flat summed frequency response and zero lobing error at the crossover frequency.

Speaker loudspeaker measurements are governed internationally by **IEC 60268-5** (International Electrotechnical Commission, 2003).

### Active Speakers

Active speakers integrate amplifiers directly into the cabinet, with the crossover operating at line level before amplification. This arrangement allows each driver to be driven by a dedicated amplifier optimized for that frequency range. Ashley and Kaminsky (1971) described active crossovers as "the most significant means of loudspeaker improvement" available. Active designs have become increasingly sophisticated with DSP-based time and phase correction. The **IEC 60268-21:2018** standard was developed specifically to address active and DSP-equipped loudspeakers (International Electrotechnical Commission, 2018).

### Passive Speakers

Passive speakers use a passive crossover (inductors, capacitors, and resistors) placed after a single external amplifier. The passive component values interact with the driver's impedance and require careful design for accurate frequency division. The trade-off for greater cabinet volume and customization flexibility is crossover insertion loss and potential impedance-driven frequency response variation.

### Subwoofers

Subwoofers are specialized speakers designed to reproduce low frequencies. In bass-managed systems (per THX standards), the crossover is typically set to **80 Hz** using a 4th-order Linkwitz-Riley filter, because frequencies below ~80 Hz are largely non-localizable by human hearing — allowing the subwoofer to be placed more freely than satellite speakers. The physical capability of subwoofers often extends from 15–20 Hz on the low end to 120–200+ Hz on the high end.

Room placement profoundly affects subwoofer output. **Allison (1974)** quantitatively demonstrated that each additional room boundary increases bass output by approximately +6 dB SPL: one wall adds +6 dB, a wall and floor combination adds +12 dB, and a corner adds +18 dB compared to free-field radiation. This is consistent with Waterhouse's (1955) earlier analysis of interference patterns in reverberant sound fields. The practical implication is that corner placement maximizes output but degrades bass accuracy through excessive boundary reinforcement.

**Toole (2006)** further established that loudspeaker-room interactions are particularly complex below ~300 Hz, with standing waves causing large frequency-response variations at the listening position. **Welti and Devantier (2006)** demonstrated in JAES that using multiple subwoofers can significantly reduce seat-to-seat variation and smooth room mode irregularities.

The subwoofer must also be **phase-aligned** with the satellite speakers. Some subwoofers include a continuously variable phase control (0°–180°) to compensate for physical offset and group delay differences. Proper level, crossover frequency, and phase/delay alignment are all required for seamless integration.

### Key References

- Allison, R. F. (1974). The influence of room boundaries on loudspeaker power output. *Journal of the Audio Engineering Society*, *22*(5), 314–320.
- Ashley, J. R., & Kaminsky, A. L. (1971). Active and passive filters as loudspeaker crossover networks. *Journal of the Audio Engineering Society*, *19*(6), 494–502.
- International Electrotechnical Commission. (2003). *IEC 60268-5: Sound system equipment — Part 5: Loudspeakers* (3rd ed.). IEC.
- International Electrotechnical Commission. (2018). *IEC 60268-21: Sound system equipment — Part 21: Acoustical (non-electrical) performance specifications*. IEC.
- Linkwitz, S. H. (1976). Active crossover networks for noncoincident drivers. *Journal of the Audio Engineering Society*, *24*(1), 2–8.
- Small, R. H. (1971). Constant-voltage crossover network design. *Journal of the Audio Engineering Society*, *19*(1), 12–19.
- Toole, F. E. (2006). Loudspeakers and rooms for sound reproduction — A scientific review. *Journal of the Audio Engineering Society*, *54*(6), 451–476.
- Vanderkooy, J., & Lipshitz, S. P. (1986). Power response of loudspeakers with noncoincident drivers. *Journal of the Audio Engineering Society*, *34*(4), 236–244.
- Waterhouse, R. V. (1955). Interference patterns in reverberant sound fields. *Journal of the Acoustical Society of America*, *27*(2), 247–258.
- Welti, T., & Devantier, A. (2006). Low-frequency optimization using multiple subwoofers. *Journal of the Audio Engineering Society*, *54*(5), 347–364.

-----

## Headphones

The choice between speakers and headphones often comes down to personal preference and listening context. Headphones offer privacy, isolation from external distractions, and a more intimate listening experience unaffected by room acoustics.

### Types

- In-Ear Headphones (Earbuds / IEMs)
- On-Ear Headphones
- Over-Ear Headphones
- Open-Back Headphones
- Closed-Back Headphones
- Bone Conduction Headphones
- Noise-Canceling Headphones

### [Drivers](https://www.soundguys.com/driver-types-19347/)

- **Dynamic Drivers (Moving Coil):** The most common and affordable driver type. A voice coil suspended in a permanent magnetic field drives a diaphragm to produce sound. Known for capable bass output, though Mills and Hawksford (1989) documented that distortion mechanisms include nonlinear voice-coil force factor (Bl) and displacement-dependent suspension compliance — meaning THD rises at low frequencies and high excursion levels.
- **Balanced Armature Drivers:** Compact transducers used in IEMs and hearing instruments. The armature operates above its resonant frequency by design, producing high force with very small excursion — yielding excellent treble detail but inherently limited low-frequency extension per driver. Multi-driver and hybrid configurations address this limitation. Knowles Corporation offers pre-configured assemblies up to 4-way/8-driver packages (Knowles Corporation, 2025).
- **Planar Magnetic Drivers:** A voice conductor is printed directly onto a thin diaphragm suspended between opposing magnetic arrays, distributing driving force uniformly across the entire diaphragm surface. This produces low distortion, fast transient response, and a flat (resistive) impedance curve. Typical trade-offs are lower sensitivity and greater weight compared to dynamic designs.
- **Electrostatic / Electret Drivers:** A thin conductive film is suspended between two polarized stators. Electrostatic designs require an external bias voltage — typically **580 V DC** for modern Stax "Pro bias" models — supplied by a dedicated energizer/amplifier. The near-zero diaphragm mass enables extremely low distortion (Stax SRM-717 measures ~0.01% THD at 1 kHz) and wide frequency response. Electret drivers use a permanently polarized dielectric material, eliminating the need for an external bias supply, though some designs use "back electret" construction where the polarization is applied to the stators rather than the diaphragm (e.g., certain Audio-Technica models).
- **Piezoelectric Drivers:** Voltage applied to piezoelectric material causes mechanical deformation, moving the diaphragm. Once considered suitable only for high-frequency tweeters, modern MEMS piezoelectric designs have demonstrated broadband SPL of 110 dB in standardized ear simulator measurements — a full-range capability — though resonance management typically requires DSP equalization (Männchen et al., 2018).
- **Bone Conduction Drivers:** Vibrate the skull bones, transmitting sound directly to the cochlea and bypassing the outer and middle ear. Lee et al. (2023) established that the skull behaves as a rigid body below ~300 Hz, transitions to a mass-spring system at 300–1000 Hz, and enters wave transmission mode above ~1 kHz. Multiple parallel transmission pathways exist (bone, cerebrospinal fluid, soft tissue). Practical limitations include limited isolation, low sound quality compared to conventional headphones, and susceptibility to ambient noise leakage.
- **Hybrid Drivers:** Combine two or more driver types (commonly dynamic + balanced armature, or planar magnetic + dynamic) to leverage the strengths of each across different frequency bands.

The overall integration, tuning, and enclosure design of headphones are as important as driver type in determining final sound character.

### Key References

- International Electrotechnical Commission. (2010). *IEC 60268-7: Sound system equipment — Part 7: Headphones and earphones*. IEC.
- Lee, J., et al. (2023). Contralateral bone conducted sound wave propagation on the skull bones in fresh frozen cadaver. *Scientific Reports*, *13*, 1–11.
- Männchen, A., Stoppel, F., Beer, D., Niekiel, F., & Wagner, B. (2018). In-ear headphone system with piezoelectric MEMS driver [Engineering Brief 469]. *145th AES Convention*.
- Mills, P. G., & Hawksford, M. J. (1989). Distortion reduction in moving-coil loudspeaker systems using current-drive technology. *Journal of the Audio Engineering Society*, *37*(3), 129–148.

-----

## Cables

High-end audio cables are frequently marketed as essential upgrades for the ultimate listening experience. The scientific literature, however, consistently demonstrates that cable construction has no audible effect on sound quality when cables are of adequate gauge and connector quality for the application.

**Davis (1991)** measured twelve speaker cables ranging from $2 to $419 per meter across varying geometries and gauges, finding distinct frequency-dependent impedance differences. Crucially, these differences were entirely explained by basic electrical properties — resistance, capacitance, and inductance — not by exotic materials or construction. **Clark (1991)**, summarizing a decade of double-blind ABX listening tests at AES conventions, concluded that listeners who identified differences in non-controlled listening conditions repeatedly failed to demonstrate those differences when tested under controlled conditions.

On the quantitative side, Murphy (2001) calculated that total series cable resistance in a typical domestic system produces at most ~0.75 dB variation at woofer resonance — and that it takes approximately 1 Ω of cable resistance to produce even a 1 dB drop with an 8 Ω speaker load. Standard adequate-gauge speaker cable presents far less than 0.1 Ω for typical domestic runs, placing cable-induced variation well below the threshold of audibility (~1 dB for broadband level changes in controlled conditions).

The famous anecdote about coat hanger wire being indistinguishable from Monster Cable — often cited as a "study" — is an informal forum post from Audioholics (2004), attributed to a user reporting results from an informal ABX session among audiophile listeners. It has no documented protocol, statistical analysis, or independent verification and should not be treated as peer-reviewed evidence. It is, however, consistent with the controlled research.

There are **valid reasons to purchase better cables**: durability, flexible jacketing for routing, quality connectors with lower contact resistance, shielding for analog interconnects in high-impedance circuits, and manufacturer warranties. These benefits relate to longevity and noise immunity — not to sonic character differences between cable brands of equivalent gauge and geometry.

> **Note on balanced vs. unbalanced topology:** Kunchur (2021) published research in JAES suggesting that cable pathways can affect perceived sound quality, but this work compared fundamentally different connection architectures (balanced XLR vs. unbalanced RCA), not expensive vs. inexpensive cables of the same type. The balanced topology's common-mode noise rejection, not the cable itself, is the operative factor.

### Key References

- Clark, D. L. (1991). Ten years of A/B/X testing [Convention paper 3167]. *91st AES Convention*, New York, NY.
- Davis, F. E. (1991). Effects of cable, loudspeaker, and amplifier interactions. *Journal of the Audio Engineering Society*, *39*(6), 461–468.
- Kunchur, M. N. (2021). Cable pathways between audio components can affect perceived sound quality. *Journal of the Audio Engineering Society*, *69*(6), 398–409.
- Russell, R. (n.d.). *Speaker wire: A history*. http://www.roger-russell.com/wire/wire.htm