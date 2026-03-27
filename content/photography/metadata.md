---
title: "Metadata"
date: 2025-03-24
updated: 2026-03-24
draft: false
tags:
  - exif
  - privacy
---

**Exchangeable Image File Format ([EXIF](https://en.wikipedia.org/wiki/Exif))** is a standard that specifies the formats for images, sound, and ancillary tags used by digital cameras and other systems. EXIF data is embedded into the image file itself and typically includes a wealth of information about the photo. It is maintained by [CIPA](https://www.cipa.jp/e/std/std-sec.html) (Camera & Imaging Products Association) and JEITA; the current version is **Exif 3.1** (January 2026).[^cipa2026]

This data serves as a digital fingerprint of a photograph, providing detailed insights into the conditions and equipment used to capture the image.

## Key Aspects

- **Camera Details**: EXIF data records the camera model, settings, lens used, and whether a flash was fired.
- **Photographic Information**: It includes specifics like exposure time, aperture, focal length, and ISO speed.
- **Date and Time**: The exact date and time when the photo was taken.
- **Location Information**: If enabled, GPS data can show the precise location where the photo was captured.
- **Editing Information**: Records if the image was altered, including the software used for editing.

## Metadata Standards

Modern image files often carry multiple, complementary metadata formats simultaneously.

### XMP
**Extensible Metadata Platform (XMP)** was created by Adobe and is now standardized as ISO 16684.[^iso16684] Unlike EXIF's compact binary structure, XMP uses human-readable XML/RDF syntax and is designed to be safely written and edited by software. For RAW file formats (CR2, NEF, ARW, etc.) that cannot embed metadata directly, XMP is stored in a companion **.xmp sidecar file** alongside the image — the standard practice in Lightroom and other DAM workflows. XMP is also the preferred format for descriptive and rights metadata, and supports custom namespaces for emerging uses like AI provenance.

### IPTC
**IPTC Photo Metadata** is maintained by the International Press Telecommunications Council and is the most widely used standard for describing and administering photos in professional contexts.[^iptc2025] It is structured in two schemas:

- **IPTC Core**: Essential fields — caption, keywords, creator, copyright notice, credit line, and depicted location.
- **IPTC Extension**: Rights management, model/property releases, structured person/organization details, accessibility alt-text, and (as of 2025.1) AI-generated image properties.

IPTC fields are encoded via XMP (preferred) and/or the legacy binary IIM format. Where EXIF records *how* a photo was taken, IPTC records *what* is depicted and *who owns it* — making it essential for editorial and stock photography workflows.

## Tools

- **[ExifTool](https://exiftool.org/)** (Phil Harvey, open source) — the most comprehensive tool available, supporting read/write/edit of metadata across 300+ file formats including EXIF, XMP, IPTC, and manufacturer-specific maker notes. Available on Windows, macOS, and Linux.[^harvey]
- **Windows**: File Explorer → right-click → Properties → Details tab; includes a "Remove Properties and Personal Information" option to strip GPS and other fields without third-party software.
- **macOS**: Preview (Tools → Show Inspector) displays EXIF. The Photos app allows sharing "without location data" via the Share sheet.
- **MAT2** (Metadata Anonymisation Toolkit 2) — recommended by privacy-focused communities for stripping metadata from images, PDFs, and audio files.

## Privacy Considerations

- **Personal Data**: Location and time stamps can reveal sensitive information. Precise GPS coordinates can expose a home address, routine, or workplace — posing risks for domestic violence survivors, journalists, and activists.
- **The Thumbnail Trap**: EXIF embeds a small thumbnail of the *original* image. If a photo is cropped to remove a sensitive detail (a face, a location in the background), the EXIF thumbnail may still contain the uncropped original.
- **Device Fingerprinting**: Some cameras embed a serial number in maker notes, which can link multiple photos to the same device across different contexts.
- **Platform Stripping**: Major platforms (Instagram, Facebook, X/Twitter) transcode uploaded images server-side, which strips embedded EXIF from the publicly served file. However, platforms may still *collect* location and device data at upload time for internal use before scrubbing it from the output — stripping from the public file does not mean the data was not harvested.
- **Manual Stripping**: Many photographers strip EXIF before publishing online using ExifTool, OS-native tools, or export settings in Lightroom/Photoshop.

[^cipa2026]: CIPA & JEITA. (2026, January). [*Exchangeable image file format for digital still cameras: Exif Version 3.1* (CIPA DC-008-Translation-2026)](https://www.cipa.jp/e/std/std-sec.html). Camera & Imaging Products Association.
[^harvey]: Harvey, P. [*ExifTool by Phil Harvey*](https://exiftool.org/). ExifTool.
[^iptc2025]: IPTC. (2025). [*IPTC Photo Metadata Standard 2025.1*](https://www.iptc.org/standards/photo-metadata/iptc-standard/). International Press Telecommunications Council.
[^iso16684]: ISO. (2012). [*Extensible Metadata Platform (XMP)* (ISO 16684)](https://en.wikipedia.org/wiki/Extensible_Metadata_Platform). International Organization for Standardization.
