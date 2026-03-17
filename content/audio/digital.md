---
title: Digital Audio
date: 2023-08-09
update: 2026-03-09
draft: false
tags:
  - audio
  - encoding
---

[Lossy and lossless audio compression](https://www.izotope.com/en/learn/whats-the-difference-between-file-formats.html) are two methods used to reduce the size of audio files, each with distinct technical characteristics, tradeoffs, and real-world effects on audio quality (Herre & Dick, 2019).

## How compression works

**Lossy compression** works by discarding audio information the human auditory system is least likely to perceive. This relies on a *psychoacoustic model* — a mathematical representation of how the ear processes sound. Two key phenomena are exploited: *simultaneous masking* (a loud tone at one frequency can make softer tones at nearby frequencies inaudible) and *temporal masking* (loud sounds briefly suppress perception of quieter sounds immediately before and after them). By identifying and discarding these "masked" components, codecs like MP3 and AAC can achieve dramatic reductions in file size with minimal perceived quality loss (Johnston, 1988; Painter & Spanias, 2000).

**Lossless compression** discards no information whatsoever. Instead, it exploits *statistical redundancy* in the audio signal. Formats like FLAC use a multi-stage pipeline: the audio is divided into blocks, a linear predictor models each block's waveform, and the small *residual* errors between the prediction and the actual signal are encoded using Rice entropy coding — a scheme that efficiently represents the Laplacian-distributed residuals with very few bits. The decoded output is mathematically identical to the original, which can be verified via a stored MD5 checksum (van Beurden & Weaver, 2024; Xiph.Org Foundation, n.d.-a).

## Sampling rate and bit depth

Two parameters define the resolution of any digital audio signal, both grounded in information theory.

**Sampling rate** is the number of times per second the amplitude of an audio signal is measured. Shannon's (1949) sampling theorem establishes that a band-limited signal can be perfectly reconstructed provided the sampling rate is at least twice the highest frequency present. CD audio's standard rate of 44.1 kHz therefore captures frequencies up to 22.05 kHz — just above the ~20 kHz upper limit of typical human hearing. Higher rates (88.2 kHz, 96 kHz, 192 kHz) are used in professional and archival contexts.

**Bit depth** determines the number of discrete amplitude levels available at each sample, directly controlling dynamic range. The standard formula for ideal N-bit PCM is approximately DR (dB) ≈ 6.02 × N + 1.76 dB, yielding roughly 96 dB for 16-bit and 144 dB for 24-bit audio. The International Association of Sound and Audiovisual Archives (IASA) recommends a minimum of 24-bit/48 kHz for archival captures of analogue source material (IASA, n.d.).

## Lossy formats

Lossy audio file formats are designed to compress audio data, reducing file size at the cost of some audio information. The following are the most widely used.

- **[MP3](https://www.loc.gov/preservation/digital/formats/fdd/fdd000012.shtml) (MPEG Audio Layer III)**: Standardised as ISO/IEC 11172-3 (1993), MP3 was developed at the Fraunhofer Institute for Integrated Circuits and remains the most widely deployed lossy audio format. It uses a hybrid filterbank and psychoacoustic model to remove perceptually irrelevant data (Brandenburg, 1999; Library of Congress, 2023a).
  - **Sampling rate**: 8 kHz to 48 kHz
  - **Bit rate**: 32 kbps to 320 kbps
- **[AAC](https://www.loc.gov/preservation/digital/formats/fdd/fdd000114.shtml) (Advanced Audio Coding)**: Standardised as ISO/IEC 13818-7 and later ISO/IEC 14496-3, AAC superseded MP3 as the default format for Apple's ecosystem and is broadly used across streaming and mobile platforms. It achieves better sound quality than MP3 at equivalent bit rates through an improved filterbank and more sophisticated entropy coding (ISO, 2006; Library of Congress, 2022a).
  - **Sampling rate**: 8 kHz to 96 kHz
  - **Bit rate**: 16 kbps to 320 kbps
- **[Opus](https://opus-codec.org/)**: Standardised as IETF RFC 6716, Opus was designed for low-latency interactive applications including VoIP, video conferencing, and online gaming. It combines the SILK speech codec with the CELT transform codec and delivers competitive quality at very low bit rates (Valin et al., 2012; Xiph.Org Foundation, 2012).
  - **Sampling rate**: 8 kHz to 48 kHz
  - **Bit rate**: 6 kbps to 510 kbps

## Lossless formats

Lossless audio file formats preserve every bit of the original recording. They are generally preferred for archival, mastering, and high-fidelity playback.

- **[FLAC](https://www.loc.gov/preservation/digital/formats/fdd/fdd000198.shtml) (Free Lossless Audio Codec)**: An open standard formally described in IETF RFC 9639, FLAC is the most widely supported lossless format and is recommended by the Library of Congress for audio preservation. It uses linear prediction and Rice entropy coding, typically achieving 50–60% compression of uncompressed PCM without any loss of data (van Beurden & Weaver, 2024; Library of Congress, 2015).
  - **Sampling rate**: 1 Hz to 655,350 Hz
  - **Bit depth**: 4-bit to 32-bit
  - **Bit rate**: ~100 kbps to ~2,000 kbps (variable)
- **[ALAC](https://github.com/macosforge/alac) (Apple Lossless Audio Codec)**: Developed by Apple and open-sourced in 2011, ALAC is technically similar to FLAC but is specifically optimised for Apple platforms and software. It is the codec used for lossless delivery within the Apple ecosystem, including Apple Music and AirPlay (Apple Inc., 2011).
  - **Sampling rate**: Up to 384 kHz
  - **Bit depth**: Up to 32-bit
  - **Bit rate**: ~250 kbps to ~1,000 kbps (variable)
- **[WAV](https://www.loc.gov/preservation/digital/formats/fdd/fdd000001.shtml) (Waveform Audio File Format)**: Based on Microsoft's RIFF specification, WAV stores audio as uncompressed linear PCM by default, making it the standard format for professional audio workstations and broadcast production. Because it is uncompressed, it produces the largest file sizes of any common format (Library of Congress, 2024a; Library of Congress, 2024b).
  - **Sampling rate**: 8 kHz to 192 kHz
  - **Bit depth**: 16-bit or 32-bit
  - **Bit rate**: Up to ~9,216 kbps (uncompressed 32-bit/192 kHz stereo)

## Perceptual differences

For most casual listeners, a well-encoded lossy file at 256–320 kbps is indistinguishable from a lossless one under normal listening conditions. Meyer & Moran (2007) conducted a year-long double-blind ABX study with professional engineers and audiophiles and found that CD-standard 16-bit/44.1 kHz processing was undetectable on high-end playback systems. A subsequent meta-analysis by Reiss (2016), however, found a "small but statistically significant ability" to discriminate high-resolution content — an effect that increased substantially with listener training. The practical implication is that the difference is real but requires trained ears, controlled conditions, and revealing source material to detect reliably.

## Streaming services

Several major streaming platforms offer lossless audio, though their implementations and maximum quality levels differ (Apple Inc., 2021; Tidal Support, 2024; Amazon, n.d.; Deezer Support, n.d.).

|Service               |Codec|CD Quality (16-bit/44.1 kHz)|Hi-Res (up to 24-bit/192 kHz)|
|----------------------|-----|:--------------------------:|:---------------------------:|
|Apple Music           |ALAC |✓                           |✓                            |
|Tidal                 |FLAC |✓                           |✓                            |
|Amazon Music Unlimited|FLAC |✓                           |✓                            |
|Deezer HiFi           |FLAC |✓                           |✗                            |

Note: Tidal dropped support for MQA in July 2024 and now delivers lossless content exclusively as standard FLAC (Tidal Support, 2024). Deezer's HiFi tier is capped at CD quality (16-bit/44.1 kHz) and does not offer hi-res streaming above that standard.

## Bluetooth

Regardless of the source file's quality, all standard Bluetooth audio codecs — including SBC, AAC, aptX, aptX HD, and LDAC — are lossy. LDAC at its maximum 990 kbps setting is the closest to transparent, but is still technically lossy (Bluetooth SIG, 2020). Qualcomm's [aptX Lossless](https://www.aptx.com/aptx-adaptive) claims true lossless CD-quality transmission over Bluetooth but requires compatible Qualcomm chipsets on both the transmitting and receiving device, and falls back to lossy compression under poor radio conditions. It is not widely available.

## AirPlay

Apple's AirPlay protocol uses ALAC for audio transmission and technically supports lossless delivery at up to 24-bit/48 kHz. In practice, however, behaviour varies significantly by context. AirPlay 1 streams as ALAC at 16-bit/44.1 kHz and is genuinely lossless. AirPlay 2, when used to cast Apple Music from an iPhone, typically transcodes the stream to AAC at 256 kbps before transmission, even when the source is flagged as lossless. HomePods connected to Apple Music via their own Wi-Fi connection can stream losslessly without this transcoding step. Local ALAC or FLAC files sent via AirPlay generally maintain lossless quality throughout (Apple Inc., 2021; Darko, 2023). As with Bluetooth, if the original source file is in a lossy format, the transmitted quality is limited to that original format regardless of how it is transmitted.

-----

## References

Amazon. (n.d.). *Amazon Music HD FAQs*. Amazon. https://www.amazon.com/b?ie=UTF8&node=14070322011

Apple Inc. (2011). *Apple Lossless Audio Codec* [Open-source project]. https://macosforge.github.io/alac/

Apple Inc. (2021). *About lossless audio in Apple Music*. Apple Support. https://support.apple.com/en-us/118295

Bluetooth Special Interest Group. (2020). *Low Complexity Communication Codec 1.0* [Specification]. https://www.bluetooth.com/specifications/specs/low-complexity-communication-codec-1-0/

Brandenburg, K. (1999). MP3 and AAC explained. In *Proceedings of the 17th AES International Conference: High-Quality Audio Coding*. Audio Engineering Society. https://www.iis.fraunhofer.de/content/dam/iis/de/doc/ame/conference/AES-17-Conference_mp3-and-AAC-explained_AES17.pdf

Darko, J. (2023, October). *Apple AirPlay isn't always lossless. Sometimes it's lossy — but why?* Darko Audio. https://darko.audio/2023/10/apple-airplay-isnt-always-lossless-sometimes-its-lossy/

Deezer Support. (n.d.). *High Fidelity (HiFi) on Deezer*. https://support.deezer.com/hc/en-gb/articles/115004588345-High-Fidelity-HiFi-on-Deezer

Herre, J., & Dick, S. (2019). Psychoacoustic models for perceptual audio coding — A tutorial review. *Applied Sciences, 9*(14), Article 2854. https://doi.org/10.3390/app9142854

International Association of Sound and Audiovisual Archives. (n.d.). *Key digital principles*. IASA-TC 04: Guidelines on the production and preservation of digital audio objects. https://www.iasa-web.org/tc04/key-digital-principles

International Organization for Standardization. (1993). *Information technology — Coding of moving pictures and associated audio for digital storage media at up to about 1.5 Mbit/s — Part 3: Audio* (ISO/IEC 11172-3:1993). https://www.iso.org/standard/22412.html

International Organization for Standardization. (2006). *Information technology — Generic coding of moving pictures and associated audio information — Part 7: Advanced Audio Coding (AAC)* (ISO/IEC 13818-7:2006). https://www.iso.org/standard/43345.html

Johnston, J. D. (1988). Transform coding of audio signals using perceptual noise criteria. *IEEE Journal on Selected Areas in Communications, 6*(2), 314–323. https://doi.org/10.1109/49.608

Library of Congress. (2015). *FLAC (Free Lossless Audio Codec), Version 1.1.2* (Format Description fdd000198). Sustainability of Digital Formats. https://www.loc.gov/preservation/digital/formats/fdd/fdd000198.shtml

Library of Congress. (2022a). *Advanced Audio Coding (MPEG-4)* (Format Description fdd000114). Sustainability of Digital Formats. https://www.loc.gov/preservation/digital/formats/fdd/fdd000114.shtml

Library of Congress. (2022b). *Advanced Audio Coding (MPEG-2)* (Format Description fdd000036). Sustainability of Digital Formats. https://www.loc.gov/preservation/digital/formats/fdd/fdd000036.shtml

Library of Congress. (2023a). *MP3 (MPEG Layer III Audio Encoding)* (Format Description fdd000012). Sustainability of Digital Formats. https://www.loc.gov/preservation/digital/formats/fdd/fdd000012.shtml

Library of Congress. (2023b). *Ogg Vorbis Audio Format* (Format Description fdd000117). Sustainability of Digital Formats. https://www.loc.gov/preservation/digital/formats/fdd/fdd000117.shtml

Library of Congress. (2024a). *WAVE Audio File Format* (Format Description fdd000001). Sustainability of Digital Formats. https://www.loc.gov/preservation/digital/formats/fdd/fdd000001.shtml

Library of Congress. (2024b). *WAVE Audio File Format with LPCM audio* (Format Description fdd000002). Sustainability of Digital Formats. https://www.loc.gov/preservation/digital/formats/fdd/fdd000002.shtml

Meyer, E. B., & Moran, D. R. (2007). Audibility of a CD-standard A/DA/A loop inserted into high-resolution audio playback. *Journal of the Audio Engineering Society, 55*(9), 775–779. https://www.aes.org/e-lib/browse.cfm?elib=14195

Painter, T., & Spanias, A. (2000). Perceptual coding of digital audio. *Proceedings of the IEEE, 88*(4), 451–515. https://doi.org/10.1109/5.842996

Reiss, J. D. (2016). A meta-analysis of high resolution audio perceptual evaluation. *Journal of the Audio Engineering Society, 64*(6), 364–379. https://doi.org/10.17743/jaes.2016.0015

Shannon, C. E. (1949). Communication in the presence of noise. *Proceedings of the IRE, 37*(1), 10–21. https://doi.org/10.1109/JRPROC.1949.232969

Tidal Support. (2024). *Audio format updates*. https://support.tidal.com/hc/en-us/articles/25876825185425-Audio-Format-Updates

Valin, J.-M., Vos, K., & Terriberry, T. B. (2012). *Definition of the Opus audio codec* (RFC 6716). Internet Engineering Task Force. https://datatracker.ietf.org/doc/html/rfc6716

van Beurden, M. Q. C., & Weaver, A. (2024, December). *Free Lossless Audio Codec (FLAC)* (RFC 9639). Internet Engineering Task Force. https://datatracker.ietf.org/doc/rfc9639/

Xiph.Org Foundation. (n.d.-a). *FLAC — Format overview*. https://xiph.org/flac/documentation_format_overview.html

Xiph.Org Foundation. (2012, September 11). *Opus audio codec is now RFC6716* [Press release]. https://xiph.org/press/2012/rfc-6716/