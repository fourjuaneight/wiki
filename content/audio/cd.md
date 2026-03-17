---
title: CDs
draft: false
---

CDs are a digital storage medium that uses a thin, circular disc to store data such as music, photos, or files. The disc is made of a shiny, reflective material — typically polycarbonate plastic approximately 1.2 mm thick (within a tolerance of ±0.1 mm), coated with a thin layer of aluminum. A UV-cured lacquer layer is then applied over the aluminum to protect it, and the label is printed on top (ECMA International, 1996). The disc measures 120 mm in diameter with a 15 mm center hole, and the data track runs from the inside outward in a single continuous spiral approximately 5.4 km long with a track pitch of 1.6 µm.

Here's how it works:

- **Data Encoding**: Information is stored on the CD as a series of tiny bumps and flat areas called "pits" and "lands." These microscopic features are impressed onto the plastic, forming a single, continuous, extremely long spiral track. Importantly, it is the *transitions* between pits and lands — not the pits themselves — that represent binary 1s, while unchanged regions (flat pit or flat land) represent binary 0s. This is called Non-Return-to-Zero Inverted (NRZI) encoding. The data is also processed through Eight-to-Fourteen Modulation (EFM) before writing, which converts each 8-bit byte into a 14-bit channel pattern to keep pit and land lengths within readable bounds (ECMA International, 1996, §19.4).
- **Reading the CD**: A CD drive uses a laser (780 nm wavelength) to read the disc. The laser shines on the disc, and the way the light reflects off the pits and lands is detected by a sensor. Changes in reflectivity at transitions are decoded back into binary data, which is then converted into the music you hear or the files you see.
- **Writing to a CD**: In writable CDs, the reflective layer can be altered by a more powerful laser. This laser changes the optical properties of specific areas — typically by permanently altering an organic dye layer — creating a pattern of transitions that corresponds to the data being stored.
- **Error Correction**: CDs employ Cross-Interleaved Reed-Solomon Coding (CIRC), a two-layer error correction system. CIRC can fully correct burst errors up to approximately 4,000 bits (2.5 mm on the disc surface) and conceal errors through interpolation for bursts up to 12,000 bits (8.5 mm), making playback resilient to minor scratches and dust (Vries & Odaka, 1982; Hoeve et al., 1982).

## Audio Quality

- **Sampling Rate**: CDs use a sampling rate of **44.1 kHz**, meaning that the audio is sampled 44,100 times per second. This rate satisfies the Nyquist theorem for human hearing, which extends to approximately 20 kHz. The specific value of 44,100 Hz was not arbitrary — it originated with early PCM digital audio recorders that stored samples on videotape. Both NTSC (60 fields/sec × 245 lines × 3 samples) and PAL (50 fields/sec × 294 lines × 3 samples) video formats converge on exactly 44,100 samples per second, making it the dominant mastering rate when the CD standard was finalized (Watkinson, 1994; Doi et al., 1978).
- **Bit Depth**: CDs have a **16-bit** depth, which means that each sample can represent 65,536 different levels of amplitude (2¹⁶ = 65,536). This yields a theoretical dynamic range of approximately 96–98 dB, sufficient to capture both very quiet and very loud sounds without distortion. The choice of 16 bits — over Philips' initial preference for 14 bits — was driven by Sony during the CD standardization process (Immink, 1998).
- **Bit Rate**: The bit rate of CDs is set at **1,411.2 kbps** for stereo audio, calculated as: 44,100 samples/sec × 16 bits/sample × 2 channels = 1,411,200 bits/sec.
- **No Compression**: CD audio uses Linear Pulse Code Modulation (LPCM) — an uncompressed format. No information is discarded, preserving the full resolution of the original recording (IEC, 1999).
- **Error Correction**: The CIRC error correction system detects and corrects small errors during playback, ensuring a consistent and high-quality listening experience even in the presence of minor surface defects (Vries & Odaka, 1982).

## Longevity

CDs were once thought to be nearly indestructible, but research has shown that they can be susceptible to a phenomenon known as "disc rot." **Disc rot manifests as discolorations, tiny pinholes, or a change in color on the surface of the CD.** The underlying causes include oxidation and hydrolysis of the aluminum reflective layer, dye degradation in recordable discs, and chemical contamination from packaging materials (Library of Congress, n.d.; Byers, 2003). In some cases, sulfur compounds from inlays or the environment can penetrate the lacquer and react with the reflective layer — a well-documented cause of "CD bronzing," in which silver-containing reflective layers corrode on contact with sulfur, turning the disc bronze-colored (Byers, 2003). Once the reflective layer is compromised, data loss is irreversible.

For recordable discs (CD-R), dye stability is a key variable. A peer-reviewed NIST study found that phthalocyanine dye with a gold-silver alloy layer was the most stable formulation tested, while azo and cyanine dyes showed greater vulnerability to temperature, humidity, and light exposure (Slattery et al., 2004).

The Library of Congress and NIST note that a well-made pressed compact disc stored under recommended conditions can last for many decades. However, real-world lifespans vary considerably: an LOC pilot study of 125 discs from its own collection found that 10% of discs had estimated life expectancies below 25 years, while another 16% showed essentially indefinite stability (Shahani et al., n.d.). Manufacturer claims range from 100 to 200 years under optimal conditions, but manufacturing quality is ultimately as decisive as storage environment (Canadian Conservation Institute, 2020).

## Storage

Storing CDs properly is essential for preserving their quality and longevity. The following guidelines are drawn from the National Archives, NIST, and the Library of Congress:

- **Environment**: Store CDs in an area with stable, low temperature and low relative humidity. The National Archives recommends **55–70°F (13–21°C)** and **30–55% RH** for home storage (NARA, 2023). For archival or long-term institutional preservation, NIST and ISO 18925 recommend a stricter ceiling of **50% RH** with an ideal of 40% RH at 18°C (Byers, 2003; ISO, 2013). Avoid unregulated environments such as attics and garages. Basements can be suitable if humidity is controlled.
- **Placement**: Store CDs vertically in their plastic cases. Keep them away from sunlight and UV light sources — recordable discs with organic dye layers are especially sensitive to UV degradation. Do not store discs on the floor, where they risk water damage, insects, or rodents (NARA, 2023).
- **Handling**: Do not apply adhesive labels or use solvent-based markers on discs. Adhesive labels can cause imbalance during playback and may chemically interact with the disc surface; solvents can dissolve the polycarbonate substrate (Byers, 2003, §5.1.4, §5.2.7). Markers specifically designed for archiving optical discs are available and should be used if labeling is necessary.

-----

## References

Byers, F. R. (2003). *Care and handling of CDs and DVDs: A guide for librarians and archivists* (NIST Special Publication 500-252). National Institute of Standards and Technology & Council on Library and Information Resources. https://www.clir.org/pubs/reports/pub121/

Canadian Conservation Institute. (2020). *Longevity of recordable CDs, DVDs and Blu-rays* (CCI Notes 19/1). Government of Canada. https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/longevity-recordable-cds-dvds.html

Doi, T., Tsuchiya, Y., & Iga, A. (1978). On several standards for converting PCM signals into video signals. *Journal of the Audio Engineering Society*, *26*, 641–649.

ECMA International. (1996). *Standard ECMA-130: Data interchange on read-only 120 mm optical data discs (CD-ROM)* (2nd ed.). https://ecma-international.org/publications-and-standards/standards/ecma-130/

Hoeve, H., Timmermans, J., & Vries, L. B. (1982). Error correction and concealment in the compact disc system. *Philips Technical Review*, *40*, 166–172.

Immink, K. A. S. (1998). Compact disc story. *Journal of the Audio Engineering Society*, *46*(5), 458–460.

International Electrotechnical Commission. (1999). *IEC 60908: Audio recording — Compact disc digital audio system* (2nd ed.). IEC.

International Organization for Standardization. (2013). *Imaging materials — Optical disc media — Storage practices* (ISO 18925:2013). ISO.

Library of Congress. (n.d.). *CD-ROM longevity research*. Preservation Science Research. https://www.loc.gov/preservation/scientists/projects/cd_longevity.html

National Archives and Records Administration. (2023, November 30). *Audio guidance: Condition of materials and storage*. https://www.archives.gov/preservation/formats/audio-storage.html

Shahani, C. J., Youket, M. H., Weberg, N., & Murray, W. P. (n.d.). *Compact disc service life* (Preservation Research and Testing Series No. 10). Library of Congress. https://www.loc.gov/preservation/resources/rt/CDservicelife_rev.pdf

Slattery, O., Lu, R., Zheng, J., Byers, F., & Tang, X. (2004). Stability comparison of recordable optical discs — A study of error rates in harsh conditions. *Journal of Research of the National Institute of Standards and Technology*, *109*(5), 517–524. https://doi.org/10.6028/jres.109.038

Slattery, O., & Zheng, J. (2005). *NIST/Library of Congress optical media longevity study* (NIST Special Publication 500-263). National Institute of Standards and Technology. https://www.loc.gov/preservation/resources/rt/NIST_LC_OpticalDiscLongevity.pdf

Vries, L. B., & Odaka, K. (1982). CIRC — The error-correcting code for the compact disc digital audio system. In *Digital audio: Collected papers from the AES Premiere Conference* (pp. 178–186). Audio Engineering Society.

Watkinson, J. (1994). *The art of digital audio* (2nd ed.). Focal Press.