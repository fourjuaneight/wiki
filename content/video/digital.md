---
title: Digital Video
draft: false
---

Unlike analog video, which records data continuously, digital video encodes visual and audio information into discrete packets of data. This allows for higher quality, easier editing, and more efficient storage and distribution.

## Encoding

Digital video encoding is a complex process that involves converting raw video files into a digital format, compressing them to reduce file size, and ensuring that they can be played back on various devices and platforms. During the encoding process, video is compresses to consume less space. It's a lossy process, meaning some information is discarded, and the more compression applied, the more the quality may degrade. Various techniques are used to compress video content intelligently. These include image resizing (reducing resolution), interframe compression (removing redundant information between frames), chroma subsampling (discarding some color information), and altering frame rates.

## Codecs

Video codecs (compressor-decompressor) are algorithms used to compress (encode) and decompress (decode) digital video files. They transform raw video data into a format that is more manageable for storage, transmission, and playback.

1. **H.264 (AVC)**
  - Widely used and supported
  - Good quality at lower bit rates
  - Common in online streaming and Blu-ray discs

2. **H.265 (HEVC)**
  - Improved compression over H.264
  - Preserves quality while reducing file size
  - Suitable for 4K video and HDR content

3. **AV1**
  - Newer, open-source, and royalty-free
  - Designed for better efficiency than H.265 and VP9
  - Supported by major tech companies and browsers

5. **MPEG-2**
  - Older standard used in DVDs
  - Less efficient than modern codecs
  - Still used in some broadcasting

6. **MPEG-4 Part 2**
  - Predecessor to H.264
  - Used in early online video and mobile devices
  - Largely replaced by newer codecs

7. **ProRes**
  - Developed by Apple
  - Used for high-quality video editing
  - Supports various resolutions and quality levels

## HDR

HDR stands for "High Dynamic Range", and it's a technology that significantly enhances the quality of an image by increasing the contrast between the lightest and darkest areas. In simpler terms, HDR makes bright areas brighter, dark areas darker, and reveals more detail in both. This results in a more lifelike, vibrant, and dynamic picture that closely mimics how our eyes perceive the real world.

### HDR10
- **Benefits**: Supported by almost all devices, better image quality than Standard Dynamic Range (SDR), free to use for manufacturers.
- **Drawbacks**: Uses static metadata, meaning one HDR "look" for the entire content, which limits scene-by-scene optimization.
- **Popularity**: Most common and popular; used by Netflix, Disney+, Apple TV+, etc.
- **Compatibility**: Can be decoded by any HDR TV and streamed by any HDR streamer.

### HDR10+
- **Benefits**: Dynamic metadata allows for scene-by-scene optimization, potentially better image quality than HDR10.
- **Drawbacks**: Not as widely supported, championed by Samsung which could limit its adoption.
- **Popularity**: Growing but not as prevalent as HDR10 or Dolby Vision.
- **Compatibility**: Many TV manufacturers support it, but content and other devices are not as prevalent.

### Dolby Vision
- **Benefits**: Offers the best image quality, supports 12-bit color, and a theoretical maximum brightness of 10,000 nits.
- **Drawbacks**: Less content available than HDR10, licensing fees for manufacturers.
- **Popularity**: Widely supported and making a big push in the HDR market.
- **Compatibility**: Requires licensing, but many companies are willing to pay for the superior quality.

### HLG (Hybrid Log-Gamma)
- **Benefits**: Free to use, broadcast-friendly, backward-compatible with SDR TVs.
- **Drawbacks**: Limited content, not as good at rendering black levels, less detail in shadows and night scenes.
- **Popularity**: Still in its infancy.
- **Compatibility**: Created by BBC and NHK, not as widely adopted yet.

## Audio

Audio encoding in videos refers to the process of converting and compressing raw audio data into a digital format that can be stored, transmitted, and played back along with the video. MP3, AAC, FLAC, WAV, and AC3 are popular audio codecs used in video encoding.

Surround sound audio codecs are designed to deliver a more immersive audio experience by using multiple channels to distribute sound across a room. Here are some common surround sound audio codecs used in video:

**1. Dolby Digital (AC-3)**
- **Channels**: Up to 5.1 (Front Left, Front Center, Front Right, Rear Left, Rear Right, Subwoofer)
- **Usage**: Widely used in DVDs, Blu-ray discs, and streaming services.

**2. Dolby Digital Plus (E-AC-3)**
- **Channels**: Up to 7.1
- **Usage**: Enhanced version of Dolby Digital, used in streaming services and some Blu-ray discs.

**3. Dolby TrueHD**
- **Channels**: Up to 7.1
- **Usage**: Lossless codec used in high-definition Blu-ray discs.

**4. DTS (Digital Theater Systems)**
- **Channels**: Up to 5.1
- **Usage**: Commonly found in DVDs and some streaming services.

**5. DTS-HD Master Audio**
- **Channels**: Up to 7.1
- **Usage**: Lossless codec used in Blu-ray discs.

**6. DTS:X**
- **Channels**: Object-based, scalable up to 32 channels
- **Usage**: Used in premium home theater systems, offers a 3D audio experience.

**7. Auro-3D**
- **Channels**: Up to 13.1
- **Usage**: Used in premium home theater systems and some Blu-ray releases.

**8. MPEG-H 3D Audio**
- **Channels**: Object-based, scalable
- **Usage**: Emerging standard, used in some 4K UHD Blu-ray discs.

**9. PCM (Pulse-Code Modulation)**
- **Channels**: Up to 7.1
- **Usage**: Uncompressed audio, often used in professional settings.

**10. AAC (Advanced Audio Codec)**
- **Channels**: Up to 7.1
- **Usage**: Common in streaming services, offers good quality at lower bit rates.

Each of these codecs has its own set of features, compatibility issues, and usage scenarios. Some are better suited for high-quality home theater setups, while others are optimized for streaming or compatibility with older systems.

## Bitrate

Bitrate refers to the amount of data processed per unit of time in the video file. Higher bitrates generally mean higher quality but lead to larger file sizes. Codecs can be used to adjust the bitrate to balance quality and size.

## Resolution

Video resolution refers to the number of distinct pixels that could be displayed in each dimension of a video. It's usually denoted as WidthxHeight, for example, 1920x1080 for Full HD.

- **SD (Standard Definition):** 720x480
- **HD (High Definition):** 1280x720
- **Full HD:** 1920x1080
- **4K UHD (Ultra High Definition):** 3840x2160
- **8K UHD:** 7680x4320

## Containers

A video container is a file format that houses one or more streams of video, audio, and other media types. It doesn't just store the media content but also manages how these different elements interact during playback.

1. **MP4 (MPEG-4 Part 14)**
  -**Formats**: Commonly holds H.264 video and AAC audio.
  -**Compression**: Lossy for both video and audio.
  -**Benefits**: Widely supported, good for streaming, and offers a balance between quality and file size.

2. **MKV (Matroska)**
  -**Formats**: Can hold almost any audio and video format.
  -**Compression**: Both lossy and lossless.
  -**Benefits**: Highly flexible, supports multiple audio tracks and subtitles, but less universally supported than MP4.

3. **AVI (Audio Video Interleave)**
  -**Formats**: Often contains DivX or XviD video and MP3 or PCM audio.
  -**Compression**: Typically lossy.
  -**Benefits**: Older format, good compatibility but larger file sizes.

4. **MOV (QuickTime File Format)**
  -**Formats**: Often holds H.264 or H.265 video and AAC or MP3 audio.
  -**Compression**: Typically lossy.
  -**Benefits**: Developed by Apple, optimized for QuickTime Player, but widely supported.

5. **WMV (Windows Media Video)**
  -**Formats**: Contains WMV video and WMA audio.
  -**Compression**: Lossy.
  -**Benefits**: Optimized for Windows Media Player, not as universally supported.

6. **FLV (Flash Video Format)**
  -**Formats**: Contains Adobe Flash video and audio.
  -**Compression**: Lossy.
  -**Benefits**: Once popular for web video, but largely obsolete due to the decline of Adobe Flash.

7. **WebM**
  -**Formats**: Contains VP8 or VP9 video and Vorbis or Opus audio.
  -**Compression**: Both lossy and lossless for video, lossy for audio.
  -**Benefits**: Open standard, good for web use, supported by HTML5.
