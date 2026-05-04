---
title: "Solid State Drives"
date: 2026-04-24
draft: false
tags:
  - flash-memory
  - hardware
  - nand
---

A **solid-state drive (SSD)** is a persistent-storage device that uses non-volatile semiconductor memory — almost always NAND flash — and contains no moving parts. Unlike a hard disk drive, which encodes data as magnetic domains on rotating platters, an SSD stores information as trapped electrical charge on microscopic transistors. That physical difference collapses random-access latency from the millisecond range of spinning media down to tens of microseconds, while also eliminating the mechanical failure modes of bearings, heads, and actuators.[^snia2024]

The underlying innovation traces to Fujio Masuoka at Toshiba in 1980, who demonstrated a floating-gate cell that could be erased in a single bulk operation — "flashing" the array — giving the technology its name. Commercial NAND flash storage reached consumers with SanDisk's 20 MB SSD in 1991 and hit mainstream adoption when Samsung introduced TLC-based consumer drives in 2012 and the first commercial 3D V-NAND in 2013.[^samsung2013]

## How NAND flash stores a bit

A NAND cell is a modified MOSFET transistor with a second, electrically isolated gate — the **floating gate** — sandwiched between the control gate above and the semiconductor channel below, separated by a ~7–10 nm layer of silicon dioxide called the tunnel oxide. In modern 3D NAND, a silicon-nitride **charge-trap layer (CTL)** replaces the floating gate, but the operating principle is the same: electrons placed on this isolated structure shift the transistor's threshold voltage, and that voltage shift is what encodes data.[^stanford1999]

Programming a cell requires **Fowler–Nordheim tunneling**: a high voltage pulse (~15–20 V) on the control gate creates an electric field intense enough across the tunnel oxide to force electrons through it quantum-mechanically. Reading the cell means applying a reference voltage to the control gate and sensing whether the channel conducts — the cell either does or does not, depending on how many electrons are trapped. Erasing does the reverse, driving electrons back out by biasing the substrate.

The critical architectural consequence of this design is an asymmetry in granularity. Cells are wired in series into **strings**, strings are organized into **pages** (typically 16 KB), pages into **blocks** (hundreds of pages), and blocks into **planes** and **dies**. Reads and writes happen at page granularity, but erase must happen at block granularity, because the erase operation biases the entire shared substrate simultaneously. This means an SSD can never overwrite data in place — it writes new data to a fresh page and reclaims the old block later through a background process called **garbage collection**.[^flashdba2014]

## Cell types: SLC, MLC, TLC, and QLC

The number of bits stored per cell is determined by how many distinct threshold voltage levels the cell is programmed to hold. A **single-level cell (SLC)** uses two levels (one bit), while **multi-level cell (MLC)**, **triple-level cell (TLC)**, and **quad-level cell (QLC)** pack two, three, and four bits per cell respectively by subdividing the programming window into four, eight, and sixteen increasingly narrow voltage distributions.[^kingston2023]

| Cell type | Bits/cell | Typical P/E cycles | Primary use |
|---|---|---|---|
| SLC | 1 | 50,000–100,000 | Industrial, caching |
| MLC | 2 | 3,000–10,000 | Legacy enterprise |
| TLC | 3 | 1,000–5,000 | Mainstream consumer/enterprise |
| QLC | 4 | 100–1,000 | Read-heavy, archival |

Packing more bits into narrower voltage bands reduces the margin for error and accelerates wear, which is why SLC endures far more program/erase cycles than QLC. To recover write performance and extend longevity on TLC and QLC drives, controllers operate a region of cells in **pseudo-SLC (pSLC)** mode — using only two voltage levels per cell — as a fast write cache. Data is later folded into native multi-level mode during idle periods, at the cost of some additional internal writes.[^arxiv2024]

## Controller and firmware: the Flash Translation Layer

The **SSD controller** is a purpose-built ASIC responsible for everything the host does not see: translating logical block addresses to physical NAND locations, managing wear, handling errors, and maintaining internal consistency. Its most important function is implementing the **Flash Translation Layer (FTL)**, a firmware subsystem that maps every logical page number (LPN) to a physical page number (PPN) and abstracts away the block-erase constraint from the host.[^mdpi2024a]

Because every read must first consult this mapping table, the FTL index must reside in low-latency memory. At 4 KB mapping granularity the table consumes approximately 1 MB per 1 GB of NAND, so a 2 TB drive requires ~2 GB of DRAM just for the map. The controller also runs **wear leveling**, periodically migrating cold data out of low-erase-count blocks to distribute P/E cycles evenly across the array. Aggressive wear leveling improves endurance, but it also generates additional internal writes — a ratio quantified as the **write amplification factor (WAF)**, the number of bytes physically written to NAND per byte sent by the host. A WAF near 1.0 is ideal; random 4 KB workloads on a nearly full drive can push WAF into the double digits, accelerating wear proportionally.[^jiao2022]

**Over-provisioning** — reserving NAND capacity invisible to the host — gives the controller space for garbage collection and wear leveling operations. Consumer drives typically ship with ~7% over-provisioning (the gap between binary and decimal gigabyte definitions); enterprise write-intensive drives use 20–28% or more. The **TRIM** command (ATA) and its NVMe equivalents allow the host OS to notify the drive which logical blocks are unused, sparing the controller from copying stale data during garbage collection.

## DRAM cache and Host Memory Buffer

Drives with an on-board DRAM package use it almost entirely to cache the FTL's logical-to-physical map, not user data. This distinction matters: without DRAM, a random read requires two NAND accesses — one to fetch the map entry, one to fetch the data — rather than one.[^kim2020] DRAM-less designs reduce cost and board area, which is why they appear in ultrabooks, handhelds, and compact M.2 2230 form factors.

**Host Memory Buffer (HMB)**, introduced in NVMe 1.2 (2014), partially closes this performance gap for DRAM-less drives. The controller allocates a region of host system RAM — typically 32–64 MB — over the PCIe bus and caches map entries there. For light and bursty workloads HMB recovers most of the performance delta, but under sustained random I/O with large working sets its limited size causes map misses and NAND lookups, and performance drops sharply.[^nvmexpress2014]

## Interfaces: bus and protocol

The physical bus and the logical command protocol are independent layers that compose freely. Understanding their separation prevents the common confusion between an M.2 slot (a physical connector) and NVMe (a software protocol).

**SATA Revision 3.0** (2009) caps signaling at 6 Gb/s, or roughly 600 MB/s after encoding overhead — a ceiling inherited from an interface designed for spinning disks. **PCIe** doubles per-lane bandwidth each generation: ~1 GB/s at Gen 3, ~2 GB/s at Gen 4, ~3.94 GB/s at Gen 5, and ~7.88 GB/s at Gen 6. An NVMe SSD on a PCIe 5.0 ×4 link therefore reaches up to ~15.75 GB/s.[^logicfruit2023] **SAS-4** (INCITS 534-2019) tops 22.5 Gb/s and supports dual-port operation for enterprise multipath redundancy.

On the protocol side, **Advanced Host Controller Interface (AHCI)**, Intel's 2004 standard, supports a single command queue 32 entries deep — adequate for HDDs, but a bottleneck for NAND arrays capable of serving hundreds of parallel operations. **NVMe (Non-Volatile Memory Express)**, first ratified in March 2011 and currently at revision 2.1 (August 2024), was designed for flash from the ground up: up to 65,535 I/O queues with 65,535 commands each, memory-mapped doorbell registers, and sub-10 µs command processing overhead.[^nvmexpress2024] NVMe 2.0 restructured the spec into a transport-agnostic base plus separate Command Set and Transport documents; NVMe 2.1 added Live Migration, Key-Per-I/O encryption, and TLS 1.3 support.

## Form factors

The physical packaging of SSDs has fragmented as PCIe bandwidth demands and use-case diversity have diverged from the 2.5-inch SATA chassis originally borrowed from HDDs.

**2.5-inch SATA** drives remain common for laptop and desktop retrofits, constrained to the SATA 6 Gb/s ceiling. **M.2** (PCI-SIG specification) replaced mSATA with a compact edge-connector card. M-key (Socket 3) slots carry PCIe ×4 or SATA; the 2280 length (22 mm × 80 mm) dominates consumer PCs, while 2230 is standard in ultrabooks and handheld gaming devices.[^wikipedia_m2] **U.2 (SFF-TA-8639)** packages PCIe ×4 or SAS in a hot-pluggable 2.5-inch form factor for enterprise backplanes; its successor **U.3 (SFF-TA-1001)** reuses the same connector with tri-mode support for SATA, SAS, or NVMe on a single backplane.[^storagereview2020]

The **Enterprise and Datacenter Standard Form Factor (EDSFF)** family, standardized by SNIA's SFF Technical Affiliate, was purpose-built for hyperscale servers. **E1.S** (SFF-TA-1006) is a short, front-loading "ruler" that replaces M.2 in dense 1U deployments; **E3.S** (SFF-TA-1008) is the 2U successor to U.2/U.3, supporting PCIe 5.0 and 6.0 at up to ~70 W with direct liquid cooling options.[^snia2021] The shared EDSFF connector (SFF-TA-1002) targets PCIe 6.0 in its latest revision. **BGA SSDs** are soldered directly to mainboards in ultrabooks, tablets, and automotive systems, presenting NVMe, eMMC, or UFS interfaces from a 16×20 mm package.

## 3D NAND

Planar NAND scaling stalled around 15–16 nm (2014–2015) when cells contained so few electrons that single-particle loss became catastrophic and inter-cell interference made tight voltage distributions impossible. **3D NAND** relaxed lateral design rules back to ~50 nm and scaled vertically instead, stacking word-line layers as horizontal sheets pierced by vertical polysilicon channel pillars, achieving gate-all-around geometry for each cell.[^parat2015]

Samsung's first commercial **V-NAND** (August 2013) stacked 24 active layers using a tungsten replacement gate and charge-trap flash. Layer counts have climbed rapidly since: SK hynix began mass production of **321-layer TLC NAND** in November 2024; Kioxia and Western Digital's **BiCS 8 (218 layers)** introduced direct CMOS-bonded-to-array (CBA) hybrid bonding that lifts I/O speed to 3.2 GT/s; YMTC's **Xtacking 3.0 (232 layers)** manufactures the NAND array and peripheral logic on separate wafers at their respective optimal process nodes and bonds them at sub-micron pad pitch.[^skhynix2024] At these densities, single-die capacities reach 1–2 Tb, enabling the 61 TB and 122 TB QLC SSDs now available from SK hynix and Samsung.

## Endurance and retention

Because every P/E cycle degrades the tunnel oxide, manufacturers express guaranteed endurance as **Terabytes Written (TBW)** and **Drive Writes Per Day (DWPD)**. DWPD normalizes TBW to capacity and warranty period, making cross-drive comparison direct. Consumer client drives typically target 0.1–0.3 DWPD; mixed-use enterprise 1–3 DWPD; write-intensive enterprise 3–10+ DWPD.[^westerndigital2021]

**JEDEC JESD218B** (June 2022) defines two application classes: *Client* (8 hr/day at 40 °C, 1-year retention at 30 °C after end of life) and *Enterprise* (24 hr/day at 55 °C, 3-month retention at 40 °C). The apparently shorter enterprise retention reflects that enterprise drives are almost never powered off; the classes encode expected duty cycle, not absolute reliability. The standard caps uncorrectable bit error rate at 10⁻¹⁵ per bit for client and 10⁻¹⁶ for enterprise across device life.[^jedec2022]

Charge retention follows an Arrhenius relationship: retention roughly halves for every 5–10 °C rise, governed by trap-assisted tunneling through oxide defects — the dominant leakage mechanism in worn cells. In practice, a heavily worn QLC drive stored at room temperature may retain data for over a year, while the same device kept at elevated temperature can lose data in weeks.

NVMe drives expose real-time health via **SMART / Health Information Log (Log ID 02h)**, which reports Percentage Used, Available Spare, Available Spare Threshold, cumulative Data Units Read/Written, and a Critical Warning bitfield. Well-designed controllers transition the drive to read-only mode when spare blocks are exhausted; controllers without this behavior may fail catastrophically, losing FTL metadata along with user data.

[^arxiv2024]: Zhang, Y., et al. (2024). *In-place switch: Reprogramming based SLC cache design for hybrid 3D SSDs*. arXiv. https://arxiv.org/abs/2409.14360
[^flashdba2014]: Callaghan, M. (2014, June 20). *Understanding flash: Blocks, pages and program/erases*. FlashDBA. https://flashdba.com/2014/06/20/understanding-flash-blocks-pages-and-program-erases/
[^jedec2022]: JEDEC Solid State Technology Association. (2022, June). *Solid-state drive (SSD) requirements and endurance test method* (JESD218B.02). https://www.jedec.org/standards-documents/docs/jesd218b02
[^jiao2022]: Jiao, Z., et al. (2022). Wear leveling in SSDs considered harmful: A case for capacity variance. In *Proceedings of the 2022 ACM SIGOPS Workshop* (pp. 1–7). ACM. https://dl.acm.org/doi/10.1145/3538643.3539750
[^kim2020]: Kim, B., et al. (2020). *Revisiting the DRAM-less SSD and the role of host memory buffer*. USENIX FAST.
[^kingston2023]: Kingston Technology. (2023). *2D vs. 3D NAND: Differences between SLC, MLC, TLC and QLC flash storage*. https://www.kingston.com/en/blog/pc-performance/difference-between-slc-mlc-tlc-3d-nand
[^logicfruit2023]: Logic Fruit Technologies. (2023). *PCIe 6.0: All you need to know*. https://www.logic-fruit.com/blog/pcie/pcie-6/
[^mdpi2024a]: Chen, Y., & Lin, W. (2024). Leveraging static and dynamic wear leveling to prolong the lifespan of solid-state drives. *Applied Sciences, 14*(18), 8186. https://doi.org/10.3390/app14188186
[^nvmexpress2014]: NVM Express, Inc. (2014, November 3). *NVM Express releases 1.2 specification*. https://nvmexpress.org/nvm-express-releases-1-2-specification/
[^nvmexpress2024]: NVM Express, Inc. (2024, August 5). *NVM Express® revision 2.1 base specification*. https://nvmexpress.org/specification/changes-in-nvm-express-revision-2-1/
[^parat2015]: Parat, K., & Goda, A. (2015). Scaling trends in NAND flash. In *2015 IEEE International Electron Devices Meeting* (pp. 2.1.1–2.1.4). IEEE. https://doi.org/10.1109/IEDM.2015.7409608
[^samsung2013]: Samsung Semiconductor. (2013). *Samsung Electronics pioneers the era of consumer SSDs*. https://semiconductor.samsung.com/consumer-storage/world-no1-flash-memory-episode2/
[^skhynix2024]: SK hynix. (2024). *One-team spirit: SK hynix's 321-layer NAND*. https://news.skhynix.com/one-team-spirit-the-miracle-of-321-layers/
[^snia2021]: Storage Networking Industry Association. (2021). *EDSFF for storage, memory and acceleration* (SFF-TA-1008). https://www.snia.org/sites/default/files/SDCEMEA/2021/snia-edsff.pdf
[^snia2024]: Storage Networking Industry Association. (2024). *Solid state storage standards explained*. https://www.snia.org/forums/sssi/knowledge/standards
[^stanford1999]: Bez, R., et al. (1999). *Reliability issues of flash memory cells*. Stanford Linear Accelerator Center. https://www.slac.stanford.edu/exp/npa/misc/00220908.pdf
[^storagereview2020]: StorageReview. (2020). *Evolving storage with SFF-TA-1001 (U.3) universal drive bays*. https://www.storagereview.com/news/evolving-storage-with-sff-ta-1001-u-3-universal-drive-bays
[^westerndigital2021]: Western Digital. (2021). *SSD endurance and HDD workloads* [White paper]. https://documents.westerndigital.com/content/dam/doc-library/en_us/assets/public/western-digital/collateral/white-paper/white-paper-ssd-endurance-and-hdd-workloads.pdf
[^wikipedia_m2]: Wikipedia. (2024). *M.2*. https://en.wikipedia.org/wiki/M.2
