---
title: "Random Access Memory"
date: 2026-04-28
draft: false
tags:
  - dram
  - hardware
  - memory
---

**Random access memory (RAM)** is a computer's primary working memory — the space where the processor keeps the instructions and data of running programs. Unlike secondary storage, RAM is directly addressable by load and store instructions, so the CPU can reach any location in roughly the same time regardless of its address. It is also **volatile**: all contents are lost when power is removed, which is the fundamental distinction between RAM and non-volatile storage like SSDs or flash.

In a running system, RAM holds the OS kernel, active user processes, and the file-system buffer cache. Its capacity and bandwidth directly bound how many programs can run concurrently and how quickly large data sets can be processed.

## How DRAM cells work

Virtually all main memory today is **dynamic RAM (DRAM)**, built from a **1-transistor / 1-capacitor (1T1C) cell**. Each bit is a tiny capacitor storing charge — roughly VDD for a logical 1, near ground for a 0. An NMOS access transistor connects the capacitor to a vertical **bit line** when the row's horizontal **word line** is asserted.

Reads are destructive: the bit line is precharged to VDD/2, then the word line raises and the capacitor shares its charge with the larger bit-line capacitance, deflecting it by a few tens of millivolts. A differential **sense amplifier** at the column's end detects and amplifies the deflection to a full logic level, then rewrites the cell. Because charge leaks through the access transistor's subthreshold current, every row must be periodically re-energised. JEDEC mandates a **refresh** cycle within 64 ms for DDR4 and 32 ms for DDR5 (halved again above 85 °C). In DDR5, a per-bank *REFsb* command allows other banks to keep serving traffic while one refreshes.[^jedec2020]

## DRAM vs. SRAM

**Static RAM (SRAM)** stores a bit in a **6-transistor (6T) bistable latch** — two cross-coupled CMOS inverters, each node accessible through an access transistor. The latch is self-sustaining while power is applied; no refresh is needed and reads are non-destructive. SRAM access times are below 1 ns for L1 caches, roughly five to ten times faster than DRAM.

The trade-off is area: a 6T SRAM cell occupies roughly four to six times the footprint of a 1T1C DRAM cell at the same node. This makes SRAM uneconomical for gigabyte-scale arrays but ideal for CPU caches and small on-chip buffers. DRAM dominates main memory precisely because its extraordinary density keeps cost per gigabyte low.

## Array organisation and addressing

A DRAM die is a hierarchy. At the bottom is the **cell**; above it is a **bank**, a 2-D array of rows and columns with one row of sense amplifiers — the **row buffer** — that can hold one open row. Banks are grouped into **bank groups** (DDR5: 8 groups × 4 banks = 32 banks per chip). A **rank** is a set of chips activated together to produce a full 64-bit (or 72-bit ECC) word. One or more ranks populate a **channel**, which is an independent port on the CPU's integrated memory controller.

Every access is a (channel, rank, bank-group, bank, row, column) lookup resolved by three commands: *ACTIVATE* opens a row into the row buffer; *READ/WRITE* targets a column within it; *PRECHARGE* closes the row. An access that hits the already-open row ("page hit") skips the activate step and is significantly faster than a row conflict, which must precharge and activate before the column command can issue.[^wiscsinclair2020]

## DDR4 and DDR5 standards

**Synchronous DRAM (SDRAM)** clocks all operations to a reference signal; **double data rate (DDR)** transfers data on both the rising and falling edges of that clock, doubling throughput without raising the core frequency.[^jedec2020] Each DDR generation also widened an internal **prefetch buffer** to pipeline more data per clock cycle: DDR4 uses an 8-bit prefetch, while DDR5 uses 16-beat bursts across two independent 32-bit subchannels per DIMM, preserving the 64-byte cache-line granularity that the CPU expects.[^kingston2021]

DDR5 (JEDEC JESD79-5, 2020; extended to 8,800 MT/s in JESD79-5C) introduced several structural changes beyond raw speed: operating voltage dropped to 1.1 V; each module gained an on-DIMM **power management IC (PMIC)** to regulate supply rails locally; bank count doubled to 32; and **on-die ECC** became mandatory in every chip, correcting single-bit errors before data leaves the die.[^micron2022] The JEDEC specification was later extended to cover speeds from 4,800 to 8,800 MT/s.[^anandtech2024]

**CAS latency (CL)** is the number of clock cycles between a READ command and the first data beat. Because the cycle time shrinks as data rate rises, the absolute first-word latency in nanoseconds is what matters: \(\text{latency (ns)} = (CL \times 2000) \div \text{data-rate (MT/s)}\). DDR4-3200 CL16 and DDR5-6400 CL36 both deliver roughly 10–11 ns, reflecting the physical ceiling imposed by DRAM cell behaviour.[^anandtechddr5]

## CPU interface and cache hierarchy

The **integrated memory controller (IMC)**, located on the CPU die in all modern processors, translates core memory transactions into ACTIVATE/READ/WRITE/PRECHARGE/REFRESH sequences. Each channel exposes a unidirectional **command/address bus** and a bidirectional **64-bit data bus** (72-bit with ECC) strobed by the differential DQS signal.

**Multi-channel** configurations multiply peak bandwidth: dual-channel doubles it (≈51.2 GB/s for DDR4-3200), quad-channel quadruples it, and server sockets reach 8–12 channels. DDR5's two 32-bit subchannels per DIMM mean even a single installed module already exposes two independent command paths to the IMC.[^memorysystems]

Because DRAM's first-word latency (~100 CPU cycles) would stall a multi-GHz pipeline, every core sits behind a hierarchy of on-die **SRAM caches**: L1 (~32–64 KB, 3–5 cycles), L2 (256 KB–2 MB, 10–20 cycles), and a shared L3 (8 MB–96 MB+, 30–70 cycles). Only an L3 miss reaches the IMC and DRAM. The 64-byte **cache line** is the unit of transfer between RAM and cache — which is why DDR5's burst length of 16 beats across a 32-bit subchannel was chosen to preserve exactly that granularity.[^uvmcafiero]

## Modules and form factors

**DIMMs (Dual In-line Memory Modules)** are the standard physical package. The primary variants are full-size DIMMs (288 pins for DDR4/5) and **SO-DIMMs** (260/262 pins), used in laptops and mini-PCs. Module types include **UDIMMs** (unbuffered, lowest latency, client systems), **RDIMMs** (registered, buffered command bus, servers), and **LRDIMMs** (load-reduced, buffered data bus, highest density). A **rank** is the set of chips sharing a chip-select; dual-rank modules allow the controller to interleave commands — one rank precharging while the other is being read — improving effective bandwidth.[^atpelectronics]

DDR5 raises the per-DIMM capacity ceiling to 512 GB (through 8-high die stacks and 32 Gb monolithic die). Every DIMM also contains an **SPD hub** EEPROM that advertises geometry, JEDEC timings, and optional XMP/EXPO overclock profiles to the BIOS at boot.

## ECC

**Error-correcting code (ECC) memory** adds redundant check bits to detect and correct bit flips caused by alpha particles, cosmic-ray neutrons, and process-level defects. The standard scheme is a **(72,64) SECDED Hamming/Hsiao code**: 8 parity bits per 64-bit word, computed so that a non-zero syndrome uniquely identifies a single flipped bit (corrected transparently) or signals an uncorrectable double-bit error. The Hsiao variant minimises XOR-tree depth and is the most widely deployed implementation in server memory controllers.[^eccwiki]

**Chipkill / SDDC** extends correction to tolerate the complete failure of one DRAM chip per rank, achieved via wider symbol codes aligned to chip boundaries. DDR5 introduces a second, independent layer: per-chip on-die ECC operates at 128-bit granularity inside every device before data reaches the bus, compensating for higher raw error rates at sub-15 nm nodes. The two layers are independent; careful system-level design is needed to prevent on-die ECC from masking patterns that external ECC would otherwise detect.[^uclacomet]

## Virtual memory

The OS prevents programs from addressing physical RAM directly, instead giving each process a private **virtual address space** mapped to physical frames through a **page table**. On x86-64, the page table is a four- or five-level radix tree; each leaf entry holds the physical frame number plus permission, dirty, and present bits. A **TLB (Translation Lookaside Buffer)** caches recent translations inside the MMU so that the common case — a TLB hit — resolves in a single cycle rather than requiring a multi-level tree walk.[^uicsbell]

When a process accesses a virtual page whose *present* bit is cleared, the MMU raises a **page fault**. The OS handler allocates a physical frame (evicting another page if RAM is full), reads the page from its backing store — either a **swap partition** on disk or a memory-mapped file — updates the page-table entry, and restarts the faulting instruction. Sustained heavy paging (*thrashing*) is catastrophic for performance because accessing swap is orders of magnitude slower than DRAM.[^ucsdpaging]

## LPDDR

**LPDDR (Low Power DDR)** is a JEDEC family derived from DDR and optimised for battery-operated devices: smartphones, tablets, thin laptops, automotive SoCs, and edge-AI hardware. Key functional differences from desktop DDR include lower I/O voltages (LPDDR5 uses 0.5 V **LVSTL** signaling versus DDR5's 1.1 V), narrower 16-bit channels per die, and a separate high-speed **WCK (write clock)** for data alongside the slower command clock. Power-saving features include **partial-array self-refresh (PASR)**, temperature-compensated refresh intervals, and deep power-down states that suspend the internal voltage generators.[^jedeclpddr]

LPDDR5X (JESD209-5C) reaches 8,533 MT/s, with manufacturer extensions reaching 9.6–10.7 Gb/s. Because LPDDR signals are low-voltage and sensitive to trace length, chips are soldered directly to the board (BGA) or stacked on the SoC in a **package-on-package (PoP)** configuration. Emerging **LPCAMM2** modules allow replaceable LPDDR5 memory in laptops while preserving the short-trace electrical advantage.

[^anandtech2024]: Cutress, I. (2024). *JEDEC extends DDR5 memory specification to 8800 MT/s, adds anti-rowhammer features*. AnandTech. https://www.anandtech.com/show/21363/jedec-extends-ddr5-specification-to-8800-mts-adds-anti-rowhammer-features
[^anandtechddr5]: Cutress, I. (2020). *Insights into DDR5 sub-timings and latencies*. AnandTech. https://www.anandtech.com/show/16143/insights-into-ddr5-subtimings-and-latencies
[^atpelectronics]: ATP Electronics. (n.d.). *Computer memory types: DRAM, RAM modules, DIMM/SO-DIMM*. https://www.atpinc.com/de/blog/computer-memory-types-dram-ram-module
[^eccwiki]: Wikipedia contributors. (2024). *ECC memory*. Wikipedia. https://en.wikipedia.org/wiki/ECC_memory
[^jedec2020]: JEDEC Solid State Technology Association. (2020). *DDR5 SDRAM standard* (JESD79-5). https://www.jedec.org/standards-documents/docs/jesd79-5
[^jedeclpddr]: JEDEC Solid State Technology Association. (n.d.). *Mobile memory: LPDDR*. https://www.jedec.org/category/technology-focus-area/mobile-memory-lpddr-wide-io-memory-mcp
[^kingston2021]: Kingston Technology. (2021). *DDR5 memory standard: An introduction to the next generation of DRAM module technology*. https://www.kingston.com/en/blog/pc-performance/ddr5-overview
[^memorysystems]: Memory Systems Authority. (n.d.). *Memory channel configurations: Single, dual, quad-channel explained*. https://memorysystemsauthority.com/memory-channel-configurations
[^micron2022]: Micron Technology. (2022). *Micron DDR5: Client module features* [White paper]. https://assets.micron.com/adobe/assets/urn:aaid:aem:5902f17e-8bde-4246-971c-8d7f274c6b1a/renditions/original/as/ddr5-key-module-features-wp-client.pdf
[^uclacomet]: Nardi, L., et al. (2023). *COMET: On-die and in-controller collaborative memory ECC technique*. UCLA NanoCAD Lab. https://nanocad.ee.ucla.edu/wp-content/papercite-data/pdf/c118.pdf
[^uicsbell]: Bell, J. (n.d.). *Operating systems: Virtual memory*. University of Illinois Chicago. https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/9_VirtualMemory.html
[^ucsdpaging]: UC San Diego CSE. (2017). *Demand paging*. https://cseweb.ucsd.edu/classes/sp17/cse120-a/applications/ln/lecture13.html
[^uvmcafiero]: Cafiero, C. (n.d.). *Memory hierarchy*. University of Vermont. https://www.uvm.edu/~cbcafier/cs2210/content/07_memory_hierarchy/memory_hierarchy.html
[^wiscsinclair2020]: Sinclair, M. (2020). *Main memory and DRAM* [Lecture notes, CS 752]. University of Wisconsin–Madison. https://pages.cs.wisc.edu/~sinclair/courses/cs752/fall2020/handouts/lecture/12-dram.pdf
