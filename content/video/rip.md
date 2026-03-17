---
title: Ripping Video
date: 2023-09-26
update: 2026-03-17
draft: false
tags:
  - copyright
  - decoding
  - video
---

Ripping is the process of extracting audio or video content from a physical medium — such as a CD, DVD, or Blu-ray disc — and saving it as a digital file on a computer. This allows users to create digital copies for personal use, archiving, or playback on devices that do not support the original format. However, the legality of ripping varies significantly by jurisdiction and media type. In the United States, ripping video from commercial discs occupies a legally contested space, owing in large part to digital rights management (DRM) protections and the anti-circumvention provisions of the Digital Millennium Copyright Act (U.S. Copyright Office, 2018).

## DRM and Disc Encryption

Most commercial DVDs and Blu-ray discs are protected by encryption systems designed to prevent unauthorized access and copying. DVDs use the **Content Scramble System (CSS)**, a DRM scheme developed jointly by electronics manufacturers and motion picture studios in 1996. Blu-ray discs use the more robust **Advanced Access Content System (AACS)**. These systems ensure that disc content can only be played on licensed, authorized hardware and software (University of Michigan Library, 2024).

Because ripping inherently requires bypassing these protections, it falls under scrutiny of laws governing DRM circumvention — regardless of the user's intent.

## Software and Format Options

Ripping software typically includes an encoder to compress source media and optimize file size. Many tools also incorporate a converter, enabling users to change the output file format. For example, a DVD's native VOB container can be transcoded to more portable formats such as MP4 or MKV.

### Popular Software

- **[MakeMKV](https://www.makemkv.com/)**: Focuses on Blu-ray and DVD content, preserving most of the disc's structure — including audio tracks, subtitles, and chapter markers — without re-encoding or quality loss.
- **[HandBrake](https://handbrake.fr/)**: An open-source tool offering extensive format and compression options across multiple platforms. HandBrake has been cited in legal and technical discussions as an example of software capable of bypassing CSS protections (DevX, 2023).
- **[DVDFab](https://www.dvdfab.cn/)**: A comprehensive commercial tool supporting multiple formats and including built-in decryption capabilities.

### File Formats

- **[ISO Format](https://www.loc.gov/preservation/digital/formats/fdd/fdd000079.shtml)**: Creates a sector-by-sector image of the disc, retaining all original data including menus, extras, and encryption layers. Best suited for full archiving or backup purposes, though it results in large files (Library of Congress, n.d.-a).
- **[MP4](https://www.loc.gov/preservation/digital/formats/fdd/fdd000155.shtml)**: A widely compatible container format well-suited for general viewing across devices and platforms. Supports lossy compression for reduced file sizes (Library of Congress, n.d.-b).
- **[MKV (Matroska)](https://www.loc.gov/preservation/digital/formats/fdd/fdd000342.shtml)**: An open-standard container format capable of holding multiple video streams, audio tracks, and subtitle tracks. Preferred for high-quality archiving and media center use (Library of Congress, n.d.-c).

## Legal Considerations

### United States

The legal landscape for video ripping in the United States is governed primarily by **Section 1201 of the Digital Millennium Copyright Act (DMCA)**, enacted in 1998. Section 1201(a)(1)(A) prohibits any person from circumventing a technological protection measure that "effectively controls access" to a copyrighted work (17 U.S.C. § 1201). This means that bypassing CSS on a DVD or AACS on a Blu-ray disc — even to make a personal backup copy — is potentially unlawful, irrespective of the user's intent (Cornell Law School Legal Information Institute, n.d.).

Critically, **fair use is not a defense against a Section 1201 violation**. As Texas A&M University Libraries notes, even if a use would otherwise qualify as fair use under copyright law, it will still be prohibited by the DMCA if it involves breaking a digital lock without an applicable exemption (Texas A&M University Libraries, n.d.). The Electronic Frontier Foundation (EFF) has documented extensively how this dynamic has led to unintended consequences, including chilling effects on legitimate research and consumer use (EFF, 2013).

#### Key Court Case: *Universal City Studios, Inc. v. Corley* (2001)

The landmark case *Universal City Studios, Inc. v. Corley*, 273 F.3d 429 (2d Cir. 2001), was the first circuit-level judicial test of the DMCA's anti-circumvention provisions. Eight major motion picture studios sued Eric Corley, publisher of *2600: The Hacker Quarterly*, for posting and linking to **DeCSS** — a program written by Norwegian teenager Jon Johansen that circumvented CSS to decrypt DVD content. The U.S. Court of Appeals for the Second Circuit upheld a permanent injunction against Corley, affirming that distributing circumvention tools violated the DMCA's anti-trafficking provisions. The court also rejected Corley's fair use and First Amendment defenses, ruling that the functional nature of the DeCSS code outweighed its expressive qualities (Universal City Studios, Inc. v. Corley, 2001).

#### DMCA Exemptions

To balance the broad prohibition against circumvention with legitimate uses, the DMCA directs the Librarian of Congress — on recommendation of the Register of Copyrights — to review and grant temporary exemptions every three years. The most recent set of exemptions was issued in **2024**. These exemptions permit circumvention for narrow, defined purposes, such as allowing educators and students to extract short clips from DVDs or Blu-rays for criticism, commentary, or media literacy instruction in educational settings. However, different rules apply depending on the institution type, media format, and software used (University of Michigan Library, 2024; Texas A&M University Libraries, n.d.).

Importantly, **no current exemption exists for general personal ripping of commercial Blu-ray discs**, and the motion picture industry continues to maintain that such ripping is unlawful (EFF, 2013).

### International Perspectives

Legal treatment of personal video ripping varies internationally. In the **European Union**, the 2001 Copyright Directive (Directive 2001/29/EC) allows member states to permit private copying, but only where rightholders receive "fair compensation." Even so, circumventing DRM to make private copies may still violate the directive's anti-circumvention provisions. In the **United Kingdom**, a 2014 exception permitting personal format-shifting was struck down by the High Court in 2015, leaving ripping legally uncertain. **Canada** permits copying for private use under its Copyright Act, though the scope of this exception in the context of DRM circumvention remains debated. Jurisdictions vary widely, and users outside the U.S. should consult local copyright law.

## Best Practices

- Always consult local laws before ripping commercial media, particularly DVDs and Blu-rays with DRM protections.
- Avoid distributing or sharing ripped media, as this is likely to constitute copyright infringement regardless of jurisdiction.
- If ripping for educational or critical purposes in the U.S., review the most current DMCA Section 1201 exemptions issued by the Librarian of Congress to determine whether your use qualifies.
- Consider digital storage solutions — such as network-attached storage (NAS) or cloud services — for organization and device accessibility.

## Post-Ripping Options

After ripping and optional re-encoding, digital files can be burned back to recordable DVDs or Blu-rays for playback on traditional players. They may also be stored in cloud services or on local media servers for streaming to compatible devices across a home network.

---

## References

Cornell Law School Legal Information Institute. (n.d.). *17 U.S. Code § 1201 – Circumvention of copyright protection systems*. https://www.law.cornell.edu/uscode/text/17/1201

DevX. (2023). *DMCA 1201*. https://www.devx.com/terms/dmca-1201/

Digital Media Law Project. (n.d.). *Circumventing copyright controls*. http://www.dmlp.org/legal-guide/circumventing-copyright-controls

Electronic Frontier Foundation. (2013). *Unintended consequences: Fifteen years under the DMCA*. https://www.eff.org/pages/unintended-consequences-fifteen-years-under-dmca

Library of Congress. (n.d.-a). *ISO disk image file format*. https://www.loc.gov/preservation/digital/formats/fdd/fdd000079.shtml

Library of Congress. (n.d.-b). *MPEG-4 file format, version 2*. https://www.loc.gov/preservation/digital/formats/fdd/fdd000155.shtml

Library of Congress. (n.d.-c). *Matroska file format with MPEG-4, H.264 (MKV)*. https://www.loc.gov/preservation/digital/formats/fdd/fdd000342.shtml

Texas A&M University Libraries. (n.d.). *The DMCA and digital locks*. https://tamu.libguides.com/c.php?g=401163&p=10833245

Universal City Studios, Inc. v. Corley, 273 F.3d 429 (2d Cir. 2001). https://law.justia.com/cases/federal/appellate-courts/F3/273/429/506315/

University of Michigan Library. (2024). *Anti-circumvention – Copyright and using video*. https://guides.lib.umich.edu/videocopyright/anticircumvention

U.S. Copyright Office. (2018). *Section 1201 of title 17: Frequently asked questions*. https://www.copyright.gov/1201/2018/faqs.html

U.S. Copyright Office. (n.d.). *Copyright law of the United States (Title 17)*. https://copyright.gov/title17/