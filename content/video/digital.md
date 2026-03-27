---
title: "Digital Video"
date: 2023-09-26
updated: 2026-03-15
draft: false
tags:
  - encoding
  - video
---

Unlike analog video, which records data continuously, **digital video** encodes visual and audio information into discrete packets of data. This allows for higher quality, easier editing, and more efficient storage and distribution.

## Encoding

Digital video encoding is a complex process that involves converting raw video files into a digital format, compressing them to reduce file size, and ensuring that they can be played back on various devices and platforms. During the encoding process, video is compressed to consume less space. It's a lossy process, meaning some information is discarded, and the more compression applied, the more the quality may degrade. Various techniques are used to compress video content intelligently. These include image resizing (reducing resolution), interframe compression (removing redundant information between frames), chroma subsampling (discarding some color information), and altering frame rates.

Chroma subsampling exploits the human visual system's lower sensitivity to color detail relative to brightness. In the dominant 4:2:0 scheme — used across MPEG-2, H.264, H.265, and AV1 — chrominance data is reduced by 75% compared to 4:4:4 with minimal perceptible quality loss.[^itu-bt601][^poynton2012] Interframe compression relies on three picture types — I-frames (full reference frames), P-frames (forward-predicted), and B-frames (bi-directionally predicted) — first formally defined in ISO/IEC 11172-2 (MPEG-1 Video, 1993) and refined through successive standards.[^iso-11172-2]

Standard frame rates include 24 fps (film), 25 fps (PAL/SECAM), 29.97/30 fps (NTSC), and 60 fps.[^itu-bt709] Frame rates up to 120 fps for UHD content are specified in SMPTE ST 2036-1:2014 and ITU-R BT.2020.[^smpte-st2036][^itu-bt2020]

---

## Codecs

Video **codecs** (compressor-decompressor) are algorithms used to compress (encode) and decompress (decode) digital video files. They transform raw video data into a format that is more manageable for storage, transmission, and playback.

### 1. [H.264](https://www.loc.gov/preservation/digital/formats/fdd/fdd000081.shtml) (AVC)

- Widely used and supported
- Good quality at lower bit rates
- Common in online streaming and Blu-ray discs
- First completed in May 2003; jointly defined as ISO/IEC 14496-10 and ITU-T H.264[^loc-h264][^itu-h264][^iso-14496-10]

### 2. [H.265](https://www.loc.gov/preservation/digital/formats/fdd/fdd000530.shtml) (HEVC)

- Offers 25–50% better compression than H.264 at equivalent quality
- Preserves quality while reducing file size
- Suitable for 4K video and HDR content
- Jointly defined as ISO/IEC 23008-2 and ITU-T H.265; first published in 2013[^loc-h265][^itu-h265][^iso-23008-2]

### 3. [AV1](https://www.loc.gov/preservation/digital/formats/fdd/fdd000541.shtml?loclr=blogsig)

- Open-source and royalty-free, developed by the Alliance for Open Media (AOM), founded in 2015 by Amazon, Cisco, Google, Intel, Microsoft, Mozilla, and Netflix[^aom2019]
- Designed for better compression efficiency than H.265 and VP9[^akyazi2018][^han2021]
- Supported by major tech companies and browsers
- Note: Sisvel International announced a third-party patent pool in 2019 disputing AOM's royalty-free claim; the European Commission opened a related antitrust investigation in 2022[^loc-av1]

### 4. [MPEG-2](https://www.loc.gov/preservation/digital/formats/fdd/fdd000028.shtml)

- Older standard used in DVDs and still used in broadcast television (ATSC 1.0 and DVB)
- Less efficient than modern codecs
- Defined in ISO/IEC 13818-2 / ITU-T H.262[^loc-mpeg2][^iso-13818-2]

### 5. [MPEG-4 Part 2](https://www.loc.gov/preservation/digital/formats/fdd/fdd000080.shtml)

- Defined in ISO/IEC 14496-2; a predecessor to H.264 within the broader MPEG-4 standard family[^loc-mpeg4p2][^iso-14496-2]
- Used in early online video and mobile devices; spawned widely used implementations including DivX and Xvid
- Largely replaced by newer codecs

### 6. [ProRes](https://www.loc.gov/preservation/digital/formats/fdd/fdd000389.shtml)

- Developed by Apple; a family of proprietary, lossy-compressed, high-quality intermediate codecs primarily used with Final Cut Pro
- Formally documented in SMPTE RDD 36:2015[^loc-prores][^smpte-rdd36]
- Supports various resolutions and quality levels; variants include ProRes 422, ProRes 4444, and ProRes RAW

---

## HDR

**HDR** (High Dynamic Range) is a technology that enhances image quality by increasing the contrast between the lightest and darkest areas. HDR makes bright areas brighter, dark areas darker, and reveals more detail in both, producing a more lifelike picture. HDR10 is the mandatory baseline format on Ultra HD Blu-ray, with all other formats building upon it. All major HDR formats use the Rec. 2020 (ITU-R BT.2020) wide color gamut[^itu-bt2020] and the Perceptual Quantizer (PQ)[^smpte-st2084] or Hybrid Log-Gamma (HLG) transfer functions defined in ITU-R BT.2100.[^itu-bt2100]

### [HDR10](https://www.loc.gov/preservation/digital/formats/fdd/fdd000579.shtml)

- **Benefits:** Supported by almost all devices, better image quality than Standard Dynamic Range (SDR), free to use for manufacturers. Mandatory on Ultra HD Blu-ray.
- **Drawbacks:** Uses static metadata (SMPTE ST 2086 / CTA-861.3),[^smpte-st2086][^cta2015] meaning one HDR "look" for the entire content, which limits scene-by-scene optimization.
- **Popularity:** Most common and popular; used by Netflix, Disney+, Apple TV+, etc.
- **Compatibility:** Can be decoded by any HDR TV and streamed by any HDR streamer.

### [HDR10+](https://www.loc.gov/preservation/digital/formats/fdd/fdd000579.shtml)

- **Benefits:** Dynamic metadata (SMPTE ST 2094-40)[^smpte-st2094-40] allows for scene-by-scene optimization, potentially better image quality than HDR10. Royalty-free.
- **Drawbacks:** Not as widely supported; HDR10+ Technologies LLC was created by Samsung, Amazon, and 20th Century Fox in 2017, which may limit broader adoption.
- **Popularity:** Growing but not as prevalent as HDR10 or Dolby Vision.
- **Compatibility:** Many TV manufacturers support it, but content and device coverage is not as widespread.

### [Dolby Vision](https://professional.dolby.com/siteassets/pdfs/dolby-vision-whitepaper_an-introduction-to-dolby-vision_0916.pdf)

- **Benefits:** Offers the best image quality per specification; supports 12-bit color depth and a theoretical maximum brightness of 10,000 nits. Uses dynamic metadata per SMPTE ST 2094-10.[^smpte-st2094-10]
- **Drawbacks:** Current streaming implementations (Profiles 5, 8.1, 8.4) use 10-bit HEVC base layers; true 12-bit is available only via dual-layer encoding (Profile 7) on UHD Blu-ray. No consumer display currently reaches 10,000 nits — content is typically mastered at 1,000–4,000 nits. Licensing fees apply for manufacturers.
- **Popularity:** Widely supported and making a big push in the HDR market.
- **Compatibility:** Requires licensing, but many companies are willing to pay for the superior quality.

### [HLG](https://en.wikipedia.org/wiki/Hybrid_log%E2%80%93gamma) (Hybrid Log-Gamma)

- **Benefits:** Free to use, broadcast-friendly, backward-compatible with SDR TVs. Requires no metadata.
- **Drawbacks:** Limited content; not as strong at rendering black levels; less detail in shadows and night scenes.
- **Popularity:** Still in its infancy.
- **Compatibility:** Jointly developed by BBC and NHK; first published as ARIB STD-B67 in July 2015 and incorporated into ITU-R BT.2100 in July 2016.[^arib2015][^itu-bt2100]

---

## Audio

Audio encoding in videos refers to the process of converting and compressing raw audio data into a digital format that can be stored, transmitted, and played back alongside the video. MP3, AAC, FLAC, WAV, and AC3 are popular audio codecs used in video encoding.

Surround sound audio codecs are designed to deliver a more immersive audio experience by distributing sound across multiple channels. The specifications for many codecs support far more channels than their common implementations suggest: for example, Dolby Digital Plus supports up to 15.1 channels and Dolby TrueHD up to 16 discrete channels per their respective specifications, though practical Blu-ray implementations are typically limited to 7.1.

### 1. [Dolby Digital](https://www.loc.gov/preservation/digital/formats/fdd/fdd000209.shtml) (AC-3)

- **Channels:** Up to 5.1 (Front Left, Front Center, Front Right, Rear Left, Rear Right, Subwoofer)
- **Usage:** Widely used in DVDs, Blu-ray discs, and streaming services. Maximum coded bitrate: 640 kbit/s. Formally specified in ATSC A/52 and ETSI TS 102 366.[^loc-ac3][^atsc2018][^etsi-ts102-366]

### 2. [Dolby Digital Plus](https://www.loc.gov/preservation/digital/formats/fdd/fdd000209.shtml) (E-AC-3)

- **Channels:** Up to 7.1 in typical implementations (up to 15.1 per specification, via up to 8 independent substreams)
- **Usage:** Enhanced version of Dolby Digital; used in streaming services and some Blu-ray discs. Maximum bitrate: 6.144 Mbit/s. Specified in ATSC A/52:2018 Annex E.[^atsc2018]

### 3. [Dolby TrueHD](https://professional.dolby.com/tv/dolby-truehd/)

- **Channels:** Up to 7.1 on Blu-ray (up to 16 discrete channels per specification at up to 192 kHz/24-bit). The carrier format for Dolby Atmos on Blu-ray. Uses Meridian Lossless Packing (MLP).
- **Usage:** Lossless codec used in high-definition Blu-ray discs; bit-for-bit identical to the studio master.

### 4. [DTS](https://www.loc.gov/preservation/digital/formats/fdd/fdd000232.shtml) (Digital Theater Systems)

- **Channels:** Up to 5.1
- **Usage:** Commonly found in DVDs and some streaming services. Standardized in ETSI TS 102 114.[^loc-dts][^etsi-ts102-114]

### 5. [DTS-HD](https://www.loc.gov/preservation/digital/formats/fdd/fdd000232.shtml) Master Audio

- **Channels:** Up to 7.1 at 96 kHz/24-bit; backward-compatible with DTS core decoders
- **Usage:** Lossless codec used in Blu-ray discs.[^loc-dts]

### 6. [DTS:X](https://www.loc.gov/preservation/digital/formats/fdd/fdd000232.shtml)

- **Channels:** Object-based, encoded within DTS-HD Master Audio bitstreams; supports up to 7.1 channel beds plus 9 simultaneous sound objects. Standardized in ETSI TS 103 491.[^etsi-ts103-491]
- **Usage:** Used in premium home theater systems; offers a 3D audio experience.

### 7. [Auro-3D](https://en.wikipedia.org/wiki/Auro-3D)

- **Channels:** Up to 13.1
- **Usage:** Used in premium home theater systems and some Blu-ray releases.

### 8. [MPEG-H 3D Audio](https://en.wikipedia.org/wiki/MPEG-H_3D_Audio)

- **Channels:** Object-based, scalable
- **Usage:** Emerging standard, used in some 4K UHD Blu-ray discs.

### 9. [PCM](https://www.loc.gov/preservation/digital/formats/fdd/fdd000016.shtml) (Linear Pulse-Code Modulation)

- **Channels:** Up to 7.1 on Blu-ray (specification supports up to 8 channels)
- **Usage:** Uncompressed linear audio, often used in professional settings and on Blu-ray. Note: Linear PCM (LPCM) should be distinguished from companded PCM variants such as ITU-T G.711 (used in telephony), which apply logarithmic compression and are not uncompressed.[^loc-pcm]

### 10. [AAC](https://www.loc.gov/preservation/digital/formats/fdd/fdd000114.shtml) (Advanced Audio Codec)

- **Channels:** Up to 48 full-bandwidth audio channels per ISO/IEC 14496-3 specification;[^loc-aac][^iso-14496-3] commonly implemented in stereo, 5.1, and 7.1 configurations for consumer streaming
- **Usage:** Common in streaming services; offers good quality at lower bit rates.

---

## Bitrate

**Bitrate** refers to the amount of data processed per unit of time in the video file. Higher bitrates generally mean higher quality but lead to larger file sizes. Codecs can be used to adjust the bitrate to balance quality and size.

Modern rate-control methods such as CRF (Constant Rate Factor) allocate bits based on scene complexity rather than enforcing a fixed rate, achieving better perceptual quality per byte than traditional constant bitrate (CBR) encoding. This approach is fundamental to adaptive bitrate streaming (ABR) protocols such as HLS and DASH.[^iso-13818-1]

---

## Resolution

Video **resolution** refers to the number of distinct pixels that could be displayed in each dimension of a video. It is usually denoted as Width × Height, for example, 1920×1080 for Full HD. Consumer "4K" (UHD-1, 3840×2160) should be distinguished from DCI 4K (4096×2160), which is the digital cinema standard defined in SMPTE 428-1.

| Format | Resolution | Standard |
|---|---|---|
| SD (Standard Definition) | 720×480 | ITU-R BT.601-7[^itu-bt601] |
| HD (High Definition) | 1280×720 | SMPTE 296M-2001[^smpte-296m] |
| Full HD | 1920×1080 | SMPTE 274M-2008 / ITU-R BT.709-6[^smpte-274m][^itu-bt709] |
| 4K UHD (Ultra High Definition) | 3840×2160 | ITU-R BT.2020 / SMPTE ST 2036-1[^itu-bt2020][^smpte-st2036] |
| 8K UHD | 7680×4320 | ITU-R BT.2020 / SMPTE ST 2036-1[^itu-bt2020][^smpte-st2036] |

---

## Containers

A video **container** is a file format that houses one or more streams of video, audio, and other media types. It doesn't just store the media content but also manages how these different elements interact during playback.

### 1. [MP4](https://www.loc.gov/preservation/digital/formats/fdd/fdd000155.shtml) (MPEG-4 Part 14)

- **Formats:** Commonly holds H.264 video and AAC audio; also supports H.265, AV1, and other codecs.
- **Compression:** Lossy for both video and audio.
- **Benefits:** Widely supported, good for streaming, and offers a balance between quality and file size. Based on the ISO Base Media File Format (ISO/IEC 14496-12), which was derived from Apple's QuickTime format — making MP4 and MOV structurally similar and often interchangeable at the container level.[^loc-mp4][^iso-14496-14]

### 2. [MKV](https://www.loc.gov/preservation/digital/formats/fdd/fdd000342.shtml) (Matroska)

- **Formats:** Can hold almost any audio and video format.
- **Compression:** Both lossy and lossless.
- **Benefits:** Highly flexible; supports multiple audio tracks and subtitles. Formally specified in IETF RFC 9559 (2024).[^ietf2024] The Library of Congress elevated FFV1 in Matroska to "Preferred Format" status in its 2023 Recommended Formats Statement, making it a strong choice for digital preservation.[^loc-mkv]

### 3. [AVI](https://www.loc.gov/preservation/digital/formats/fdd/fdd000059.shtml) (Audio Video Interleave)

- **Formats:** Often contains DivX or XviD video and MP3 or PCM audio.
- **Compression:** Typically lossy.
- **Benefits:** Introduced by Microsoft in November 1992 as part of Video for Windows; good compatibility, but notable 2 GB and 4 GB file-size limitations due to its RIFF-based structure.[^loc-avi]

### 4. [MOV](https://www.loc.gov/preservation/digital/formats/fdd/fdd000052.shtml) (QuickTime File Format)

- **Formats:** Often holds H.264 or H.265 video and AAC or MP3 audio.
- **Compression:** Typically lossy.
- **Benefits:** Developed by Apple (released 1991); optimized for QuickTime Player, but widely supported. The ISO Base Media File Format underpinning MP4 was derived directly from this format.[^loc-mov]

### 5. [WMV](https://www.loc.gov/preservation/digital/formats/fdd/fdd000091.shtml) (Windows Media Video)

- **Formats:** Contains WMV video and WMA audio.
- **Compression:** Lossy.
- **Benefits:** Based on Microsoft's Advanced Systems Format (ASF); WMV9 was standardized as SMPTE 421M (VC-1) in 2006. Optimized for Windows Media Player; not as universally supported as MP4.[^loc-wmv]

### 6. [FLV](https://www.loc.gov/preservation/digital/formats/fdd/fdd000131.shtml) (Flash Video Format)

- **Formats:** Contains Adobe Flash video and audio.
- **Compression:** Lossy.
- **Benefits:** Once dominant for web video (including early YouTube) following its introduction in 2002; rendered largely obsolete by Adobe's discontinuation of Flash Player at the end of 2020.

### 7. [WebM](https://www.loc.gov/preservation/digital/formats/fdd/fdd000518.shtml)

- **Formats:** Contains VP8, VP9, or AV1 video and Vorbis or Opus audio.
- **Compression:** Both lossy and lossless for video; lossy for audio.
- **Benefits:** Open, non-proprietary, royalty-free format developed by Google; based on the Matroska container structure. Supported by HTML5.[^loc-webm]

---

[^akyazi2018]: Akyazi, P., & Ebrahimi, T. (2018). Comparison of compression efficiency between HEVC/H.265, VP9 and AV1 based on subjective quality assessments. *2018 Tenth International Conference on Quality of Multimedia Experience (QoMEX)*, 1–6. https://ieeexplore.ieee.org/document/8463294

[^aom2019]: Alliance for Open Media. (2019). [*AV1 Bitstream & Decoding Process Specification v1.0.0-errata1*](https://aomediacodec.github.io/av1-spec/av1-spec.pdf). AOM.

[^arib2015]: Association of Radio Industries and Businesses. (2015). *ARIB STD-B67: Essential parameter values for the extended image dynamic range television (EIDRTV) system for programme production*. ARIB.

[^atsc2018]: Advanced Television Systems Committee. (2018). *ATSC A/52:2018: Digital audio compression (AC-3) (E-AC-3) standard*. ATSC.

[^cta2015]: Consumer Technology Association. (2015). *CTA-861.3: HDR static metadata extensions*. CTA.

[^etsi-ts102-114]: European Telecommunications Standards Institute. (n.d.). *ETSI TS 102 114: DTS Coherent Acoustics; Core and extensions*. ETSI.

[^etsi-ts102-366]: European Telecommunications Standards Institute. (2017). *ETSI TS 102 366 V1.4.1: Digital audio compression (AC-3, Enhanced AC-3) standard*. ETSI.

[^etsi-ts103-491]: European Telecommunications Standards Institute. (n.d.). *ETSI TS 103 491: DTS-UHD Audio Format*. ETSI.

[^han2021]: Han, J., Li, B., Mukherjee, D., et al. (2021). A technical overview of AV1. *Proceedings of the IEEE, 109*(9), 1435–1462. https://doi.org/10.1109/JPROC.2021.3058technical

[^ietf2024]: Internet Engineering Task Force. (2024). [*RFC 9559: Matroska Media Container Format Specification*](https://datatracker.ietf.org/doc/rfc9559/). IETF.

[^iso-11172-2]: International Organization for Standardization. (1993). *ISO/IEC 11172-2: Coding of moving pictures and associated audio for digital storage media at up to about 1.5 Mbit/s — Part 2: Video*. ISO.

[^iso-13818-1]: International Organization for Standardization. (2023). *ISO/IEC 13818-1: Generic coding of moving pictures and associated audio information — Part 1: Systems*. ISO.

[^iso-13818-2]: International Organization for Standardization. (2013). *ISO/IEC 13818-2: Generic coding of moving pictures and associated audio information — Part 2: Video*. ISO.

[^iso-14496-2]: International Organization for Standardization. (2004). *ISO/IEC 14496-2: Coding of audio-visual objects — Part 2: Visual*. ISO.

[^iso-14496-3]: International Organization for Standardization. (2019). *ISO/IEC 14496-3: Information technology — Coding of audio-visual objects — Part 3: Audio*. ISO.

[^iso-14496-10]: International Organization for Standardization. (2014). *ISO/IEC 14496-10: Advanced video coding*. ISO.

[^iso-14496-14]: International Organization for Standardization. (2020). *ISO/IEC 14496-14:2020: MP4 file format*. ISO.

[^iso-23008-2]: International Organization for Standardization. (2020). *ISO/IEC 23008-2:2020: High efficiency video coding*. ISO.

[^itu-bt601]: International Telecommunication Union. (2011). *Recommendation ITU-R BT.601-7: Studio encoding parameters of digital television for standard 4:3 and wide screen 16:9 aspect ratios*. ITU.

[^itu-bt709]: International Telecommunication Union. (2015). *Recommendation ITU-R BT.709-6: Parameter values for the HDTV standards for production and international programme exchange*. ITU.

[^itu-bt2020]: International Telecommunication Union. (2015). *Recommendation ITU-R BT.2020-2: Parameter values for ultra-high definition television systems for production and international programme exchange*. ITU.

[^itu-bt2100]: International Telecommunication Union. (2016). *Recommendation ITU-R BT.2100: Image parameter values for high dynamic range television for use in production and international programme exchange*. ITU.

[^itu-h264]: International Telecommunication Union. (2017). *Recommendation ITU-T H.264: Advanced video coding for generic audiovisual services* (V12). ITU.

[^itu-h265]: International Telecommunication Union. (2019). *Recommendation ITU-T H.265: High efficiency video coding* (V7). ITU.

[^loc-aac]: Library of Congress. (2022). [*Advanced Audio Coding (MPEG-4)*](https://www.loc.gov/preservation/digital/formats/fdd/fdd000114.shtml) (FDD fdd000114). Library of Congress.

[^loc-ac3]: Library of Congress. (2011). [*AC-3 Compressed Audio (Dolby Digital), Revision A*](https://www.loc.gov/preservation/digital/formats/fdd/fdd000209.shtml) (FDD fdd000209). Library of Congress.

[^loc-av1]: Library of Congress. (n.d.). [*AV1 Video Encoding (AOMedia Video 1)*](https://www.loc.gov/preservation/digital/formats/fdd/fdd000541.shtml) (FDD fdd000541). Library of Congress.

[^loc-avi]: Library of Congress. (2016). [*AVI (Audio Video Interleaved) File Format*](https://www.loc.gov/preservation/digital/formats/fdd/fdd000059.shtml) (FDD fdd000059). Library of Congress.

[^loc-dts]: Library of Congress. (2011). [*Digital Theater Systems Audio Formats*](https://www.loc.gov/preservation/digital/formats/fdd/fdd000232.shtml) (FDD fdd000232). Library of Congress.

[^loc-h264]: Library of Congress. (2011). [*MPEG-4, Advanced Video Coding (Part 10) (H.264)*](https://www.loc.gov/preservation/digital/formats/fdd/fdd000081.shtml) (FDD fdd000081). Library of Congress.

[^loc-h265]: Library of Congress. (2020). [*High Efficiency Video Coding (HEVC) Family, H.265, MPEG-H Part 2*](https://www.loc.gov/preservation/digital/formats/fdd/fdd000530.shtml) (FDD fdd000530). Library of Congress.

[^loc-mkv]: Library of Congress. (2025). [*Matroska Multimedia Container*](https://www.loc.gov/preservation/digital/formats/fdd/fdd000342.shtml) (FDD fdd000342). Library of Congress.

[^loc-mov]: Library of Congress. (2024). [*QuickTime File Format*](https://www.loc.gov/preservation/digital/formats/fdd/fdd000052.shtml) (FDD fdd000052). Library of Congress.

[^loc-mp4]: Library of Congress. (2025). [*MPEG-4 File Format, Version 2*](https://www.loc.gov/preservation/digital/formats/fdd/fdd000155.shtml) (FDD fdd000155). Library of Congress.

[^loc-mpeg2]: Library of Congress. (2011). [*MPEG-2 Video Encoding (H.262)*](https://www.loc.gov/preservation/digital/formats/fdd/fdd000028.shtml) (FDD fdd000028). Library of Congress.

[^loc-mpeg4p2]: Library of Congress. (2011). [*MPEG-4, Visual Coding (Part 2)*](https://www.loc.gov/preservation/digital/formats/fdd/fdd000080.shtml) (FDD fdd000080). Library of Congress.

[^loc-pcm]: Library of Congress. (n.d.). [*Linear Pulse Code Modulated Audio (LPCM)*](https://www.loc.gov/preservation/digital/formats/fdd/fdd000011.shtml) (FDD fdd000011). Library of Congress.

[^loc-prores]: Library of Congress. (2024). [*Apple ProRes 422 Codec Family*](https://www.loc.gov/preservation/digital/formats/fdd/fdd000389.shtml) (FDD fdd000389). Library of Congress.

[^loc-webm]: Library of Congress. (2023). [*WebM*](https://www.loc.gov/preservation/digital/formats/fdd/fdd000518.shtml) (FDD fdd000518). Library of Congress.

[^loc-wmv]: Library of Congress. (2023). [*WMV (Windows Media Video) File Format*](https://www.loc.gov/preservation/digital/formats/fdd/fdd000091.shtml) (FDD fdd000091). Library of Congress.

[^poynton2012]: Poynton, C. (2012). *Digital video and HD: Algorithms and interfaces* (2nd ed.). Morgan Kaufmann.

[^smpte-274m]: Society of Motion Picture and Television Engineers. (2008). *SMPTE 274M-2008: 1920 × 1080 image sample structure*. SMPTE.

[^smpte-296m]: Society of Motion Picture and Television Engineers. (2001). *SMPTE 296M-2001: 1280 × 720 progressive image sample structure*. SMPTE.

[^smpte-rdd36]: Society of Motion Picture and Television Engineers. (2015). *SMPTE RDD 36:2015: Apple ProRes Bitstream Syntax and Decoding Process*. SMPTE.

[^smpte-st2036]: Society of Motion Picture and Television Engineers. (2014). *SMPTE ST 2036-1:2014: Ultra high definition television — Image parameter values for program production*. SMPTE.

[^smpte-st2084]: Society of Motion Picture and Television Engineers. (2014). *SMPTE ST 2084: High dynamic range electro-optical transfer function of mastering reference displays*. SMPTE.

[^smpte-st2086]: Society of Motion Picture and Television Engineers. (2014). *SMPTE ST 2086: Mastering display color volume metadata supporting high luminance and wide color gamut images*. SMPTE.

[^smpte-st2094-10]: Society of Motion Picture and Television Engineers. (2016). *SMPTE ST 2094-10: Dynamic metadata for color volume transform — Application #1*. SMPTE.

[^smpte-st2094-40]: Society of Motion Picture and Television Engineers. (2016). *SMPTE ST 2094-40: Dynamic metadata for color volume transform — Application #4*. SMPTE.