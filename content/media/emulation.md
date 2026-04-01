---
title: "Emulation"
date: 2026-03-28
draft: false
tags:
- gaming
- hardware
- preservation
---

**Emulation** is the practice of using software to replicate the behavior of one computing system on another, allowing unmodified programs designed for a specific machine to run as though they were executing on the original hardware.[^imaginationND] The emulating machine is referred to as the *host*, and the system being reproduced is called the *guest*. By reconstructing a guest’s processor logic, memory architecture, and peripheral behavior entirely in software, an emulator achieves byte-level compatibility — executing the same binary code, in the same sequence, producing the same outputs as the original hardware would. This distinguishes emulation from *simulation*, which models only the functional responses of a system rather than reproducing its internal behavior.[^lenovoND]

Emulation spans several domains. Logic simulation replicates digital circuits before they are physically manufactured. Functional emulation traces assembly-level code for debugging. And video game emulation — the most publicly visible form — enables software written for discontinued hardware to run on modern machines, making it the primary technical mechanism for preserving interactive media.[^imaginationND] A 2023 study by the Video Game History Foundation found that 87% of video games released in the United States before 2010 are commercially unavailable, accessible only through emulation or increasingly rare original hardware.[^salvador2023]

## How emulators work

Every emulator must bridge a fundamental gap: the host machine has a different processor architecture, memory layout, and peripheral set than the guest. To do this, the emulator allocates a data structure in host memory where all of the guest CPU’s registers, flags, and internal state are stored. It establishes a parallel memory space mapping guest addresses to host memory regions, intercepts memory-mapped I/O to route reads and writes to software models of guest peripherals, and synchronizes the virtual clocks of all emulated components relative to one another.[^hong2013]

### CPU emulation strategies

The CPU core is the central challenge of emulator design. Two primary strategies exist for implementing it.

**Interpretation** is the more straightforward approach: the emulator fetches each guest instruction, decodes it, executes a corresponding function on the host, and advances to the next instruction. Interpreters are portable, simple to build, and faithful to the original hardware’s logic, but they are slow. Because the host CPU must execute many of its own instructions to process each single guest instruction, interpretation is only practical for older systems with processors running at a few megahertz — such as the Zilog Z80 or Motorola 68000.[^mame2008]

**Dynamic recompilation**, also called just-in-time (JIT) compilation, addresses this bottleneck. Rather than interpreting one instruction at a time, a JIT compiler translates entire blocks of guest code into native host machine code at runtime, caches the result, and executes it directly. When the same code block runs again, the cached translation is reused without retranslation. Advanced JIT engines apply compiler optimizations — register allocation, constant propagation, dead code elimination, and lazy flag evaluation — to produce highly efficient native output. Dolphin, the GameCube and Wii emulator, uses JIT recompilation of PowerPC 750 instructions as its default execution mode; its interpreter mode exists solely for debugging, as it is far too slow for interactive use.[^dolphinND] The trade-off is significantly greater implementation complexity: JIT compilers must correctly handle self-modifying code, indirect jumps, and cache invalidation when the guest modifies its own program in memory.[^heislerND]

### Memory, graphics, and audio

Beyond the CPU, emulators must replicate several additional hardware subsystems. The **memory management unit** defines which address ranges correspond to RAM, ROM, I/O registers, or unmapped space, and dispatches accesses accordingly.[^retroND] The graphics subsystem can be emulated at varying levels of fidelity. Scanline-based rendering processes one horizontal line of pixels at a time — a common middle-ground approach. Cycle-based rendering processes pixels in lockstep with the CPU clock, capturing even rare mid-scanline visual effects at much greater computational cost. **High-level emulation (HLE)** takes a different approach entirely, intercepting graphics API calls at the software level rather than modeling hardware registers directly; this trades some accuracy for significant performance gains. The audio subsystem follows a similar spectrum — Dolphin, for example, offers both DSP-HLE, which intercepts known audio processing routines and replaces them with optimized equivalents, and DSP-LLE, which emulates the digital signal processor instruction by instruction.[^dolphinND]

## Binary translation and instruction set differences

When the guest and host systems use different processor instruction set architectures — as when emulating an ARM-based handheld on an x86 desktop — the emulator must perform **binary translation**: converting the guest’s machine instructions into instructions the host can execute. **Static binary translation** does this ahead of time, translating an entire program before execution begins. It can produce fast output but struggles with self-modifying code and indirect jumps whose targets are only known at runtime, making purely static translators rare in practice.[^wikiaBT]

**Dynamic binary translation** works at runtime, translating one basic block of code at a time and caching the result. QEMU, the open-source machine emulator widely used in virtualization and systems research, is the canonical example. Its Tiny Code Generator (TCG) operates as a two-stage JIT compiler: a frontend converts guest instructions into an architecture-independent intermediate representation (IR) comprising roughly 142 operation codes; optimization passes then perform register liveness analysis, dead code elimination, and constant folding; a backend converts the IR into native host machine code. Guest code is divided into *Translation Blocks* — basic blocks ending at branch points — which are cached and linked together so that execution can flow directly between blocks without returning to the main dispatch loop.[^bellard2005] The IR imposes a performance cost — a 2025 study found that a direct binary translator for a specific architecture pair could run up to 35 times faster than QEMU’s TCG approach[^arxiv2025] — but the IR design provides exceptional portability: any supported guest ISA can run on any supported host ISA with minimal additional engineering.

An alternative to software emulation is **FPGA-based hardware emulation**, exemplified by the MiSTer project. Field-programmable gate arrays physically reconstruct original console circuits in reconfigurable silicon, achieving cycle-accurate reproduction with near-zero latency and no software processing overhead.[^wikiaFPGA]

## Accuracy and performance trade-offs

One of the deepest tensions in emulator design is the relationship between accuracy and performance. This was illustrated most clearly by Near (formerly byuu), the developer of *bsnes*, the first SNES emulator to achieve 100% compatibility with the commercial SNES software library. Near began the project in 2004 after discovering that existing emulators like ZSNES introduced subtle timing bugs — bugs that did not appear on real hardware — because they synchronized the CPU and graphics processor only once per scanline or frame rather than cycle by cycle.[^near2011]

Near’s solution was cycle-accurate emulation, replicating SNES hardware at the level of individual oscillator ticks: 21.47 MHz for the main CPU and 24.58 MHz for the audio processor, requiring the emulator to synchronize its virtual components thousands of times per frame. The result was complete fidelity to the original hardware, but at a cost: bsnes demanded 2–3 GHz of host processing power compared to roughly 300 MHz for ZSNES.[^near2011] Near described the design philosophy as a rejection of “whack-a-mole emulation” — applying game-specific patches that fix one title while breaking another — in favor of understanding how the original silicon behaved and replicating that behavior universally.

The relationship between accuracy and computational cost is roughly exponential. Achieving 95–99% game compatibility requires moderate resources, but closing the gap from 99% to 99.99% may demand an order of magnitude more processing power, since the remaining edge cases involve exotic timing interactions triggered by only a handful of titles. Projects like higan and ares pursue full cycle accuracy across multiple systems. Emulators like Snes9x and ZSNES historically prioritized performance, accepting minor inaccuracies that most players would never encounter. The Emulation General Wiki maintains a taxonomy of accuracy tiers, recognizing emulators such as Mesen (NES), BlastEm (Genesis), and NanoBoyAdvance (GBA) for their commitment to cycle-level fidelity.[^emuwikiND]

## History of gaming emulation

The first known gaming emulator was created in 1990 by Haruhisa Udagawa for the FM Towns computer, capable of running basic NES software. Emulation did not reach the mainstream, however, until February 5, 1997, when Nicola Salmoria released MAME version 0.1, supporting a small set of arcade titles including *Pac-Man* on MS-DOS. Salmoria’s stated purpose was documentation and historical preservation; playability was, as the project’s own philosophy described it, “a nice side effect.” As of 2026, MAME documents over 32,000 systems with more than 10,000 working titles and has drawn contributions from over 200 developers across its nearly three-decade history.[^wikiaMAME]

Two months after MAME’s debut, NESticle — released on April 3, 1997 by Icer Addis of Bloodlust Software — ignited the home console emulation movement. Written in C++ and assembly for 486-class processors and distributed free of charge, NESticle introduced features that became standard across the field: save states, screenshot capture, gameplay recording, and cheat code support. It was followed rapidly by Genecyst for the Sega Genesis and Snes9x and ZSNES for the Super Nintendo, launching a wave that permanently changed the relationship between gamers and gaming history.[^smith2017]

The generations that followed produced increasingly ambitious projects. PCSX2, which began in 2001 and first booted PlayStation 2 software in December 2002, spent years maturing its dynamic recompiler before achieving consistent playable performance around 2007; as of 2025, 99% of the PS2 library is considered playable, and the emulator has been downloaded over 100 million times.[^pcsx2ND] Dolphin, first released in September 2003 as the first GameCube emulator capable of running commercial titles, went open source in 2008 and has since become a landmark of emulation engineering — notably implementing *ubershaders* in 2017 to eliminate shader compilation stuttering, a problem the team described as “a ridiculous solution to an impossible problem.”[^jmc2017] RPCS3, which targets the Cell Broadband Engine of the PlayStation 3, has brought nearly 70% of the PS3 library to playable status through JIT compilation of the Cell’s Synergistic Processing Elements.[^wikiaRPCS3] RetroArch, built on the libretro API, unifies over 200 individual emulator cores behind a single interface with features including real-time rewind, run-ahead input latency reduction, and rollback-based netplay, running on platforms ranging from Windows and Linux to PlayStation 3 and Raspberry Pi.[^wikiaRA]

## Emulation as a preservation tool

> “There is no alternative but piracy for, like, 99 percent of video game history.”
> — Frank Cifaldi, Video Game History Foundation (2023)

Original gaming hardware has a finite lifespan. Capacitors degrade, ROM chips suffer bit rot, CRT displays fail, and magnetic media such as floppy disks have estimated functional lifespans of only 10 to 30 years. When hardware fails and no emulator exists, the software that depended on it becomes inaccessible. The situation parallels film preservation: The Film Foundation estimates that at least 50% of American films made before 1950 are irrecoverably lost, and the Video Game History Foundation was modeled explicitly on The Film Foundation to prevent interactive media from suffering the same fate.[^wikiaVGP]

The VGHF, founded by Frank Cifaldi in 2017, published a landmark 2023 study documenting that only 13.27% of classic American games remain commercially available.[^salvador2023] The Internet Archive addresses this through the *Emularity*, an open-source framework developed by Jason Scott and Daniel Brooks that embeds MAME-based emulation directly in web browsers, making thousands of arcade games, console titles, and legacy software playable without installation.[^scott2018] The Council on Library and Information Resources published a comprehensive 2025 report surveying emulation as a preservation methodology across browser-based, cloud-based, FPGA-based, and institutional workflows.[^kaltman2025] Commercial platforms have pursued preservation in parallel: GOG.com launched its Preservation Program in November 2024, retrofitting hundreds of classic PC games for modern compatibility distributed DRM-free with offline installers,[^gog2024] while Sony, Nintendo, and Microsoft deploy emulation internally to power legacy title access through PlayStation Plus, Nintendo Switch Online, and Xbox backward compatibility respectively.

[^arxiv2025]: arXiv. (2025). *Boosting cross-architectural emulation performance by foregoing the intermediate representation model* (arXiv:2501.03427v1). https://arxiv.org/abs/2501.03427

[^airbus]: Airbus Security Lab. (n.d.). *A deep dive into QEMU: The Tiny Code Generator (TCG), part 1*. https://airbus-seclab.github.io/qemu_blog/tcg_p1.html

[^bellard2005]: Bellard, F. (2005). QEMU, a fast and portable dynamic translator. In *Proceedings of the FREENIX Track: 2005 USENIX Annual Technical Conference* (pp. 41–46). USENIX Association. https://www.usenix.org/conference/2005-usenix-annual-technical-conference/qemu-fast-and-portable-dynamic-translator

[^dolphinND]: Dolphin Emulator Project. (n.d.). *Performance guide*. https://dolphin-emu.org/docs/guides/performance-guide/

[^emuwikiND]: Emulation General Wiki. (n.d.). *Emulation accuracy*. https://emulation.gametechwiki.com/index.php/Emulation_Accuracy

[^gog2024]: GOG.com. (2024, November). *The GOG Preservation Program*. https://www.gog.com/blog/the-gog-preservation-program/

[^heislerND]: Heisler, B. (n.d.). *Experiments in NES JIT compilation*. https://bheisler.github.io/post/experiments-in-nes-jit-compilation/

[^hong2013]: Hong, D.-Y. (2013). *Efficient and retargetable dynamic binary translation* [Doctoral dissertation, Academia Sinica]. https://homepage.iis.sinica.edu.tw/papers/dyhong/19657-F.pdf

[^imaginationND]: Imagination Technologies. (n.d.). *Emulation*. Imagination Glossary. https://www.imaginationtech.com/glossary/emulation/

[^jmc2017]: JMC47 & MayImilae. (2017, July 30). Ubershaders: A ridiculous solution to an impossible problem. *Dolphin Emulator Blog*. https://dolphin-emu.org/blog/2017/07/30/ubershaders/

[^kaltman2025]: Kaltman, E., Schwaid-Lindner, W., Jonathan, D., Borman, A., Garnett, A., & Masinter, L. (2025). *An overview of emulation as a preservation method* (CLIR Publication 194). Council on Library and Information Resources. https://www.clir.org/wp-content/uploads/sites/6/2025/07/An_Overview_of_Emulation_as_a_Preservation_Method_CLIRpub194.pdf

[^lenovoND]: Lenovo. (n.d.). *What is emulation technology*. Lenovo Glossary. https://www.lenovo.com/us/en/glossary/emulation-technology/

[^mame2008]: MAME Development Team. (2008, May 12). *Core concepts*. MAMEDEV Wiki. https://wiki.mamedev.org/index.php/Core_Concepts

[^near2011]: Near. (2011, August). Accuracy takes power: One man’s 3GHz quest to build a perfect SNES emulator. *Ars Technica*. https://arstechnica.com/gaming/2011/08/accuracy-takes-power-one-mans-3ghz-quest-to-build-a-perfect-snes-emulator/

[^pcsx2ND]: PCSX2 Project. (n.d.). *About PCSX2*. https://pcsx2.net/

[^retroND]: RetroReversing. (2022, October 9). *How do emulators work?* https://www.retroreversing.com/how-emulators-work

[^salvador2023]: Salvador, P. (2023, July). *Survey of the video game reissue market in the United States*. Video Game History Foundation. https://gamehistory.org/87percent/

[^scott2018]: Scott, J. (2018, February 13). Emulation in the browser adds WebAssembly. *Internet Archive Blogs*. https://blog.archive.org/2018/02/13/emulation-in-the-browser-adds-webassembly/

[^smith2017]: Smith, E. (2017, May). The story of NESticle, the ambitious emulator that redefined retro gaming. *Vice/Motherboard*. https://www.vice.com/en/article/the-story-of-nesticle-the-ambitious-emulator-that-redefined-retro-gaming/

[^wikiaBT]: Wikipedia. (n.d.). Binary translation. In *Wikipedia*. https://en.wikipedia.org/wiki/Binary_translation

[^wikiaFPGA]: Wikipedia. (n.d.). MiSTer. In *Wikipedia*. https://en.wikipedia.org/wiki/MiSTer

[^wikiaMAME]: Wikipedia. (n.d.). MAME. In *Wikipedia*. https://en.wikipedia.org/wiki/MAME

[^wikiaRA]: Wikipedia. (n.d.). RetroArch. In *Wikipedia*. https://en.wikipedia.org/wiki/RetroArch

[^wikiaRPCS3]: Wikipedia. (n.d.). RPCS3. In *Wikipedia*. https://en.wikipedia.org/wiki/RPCS3

[^wikiaVGP]: Wikipedia. (n.d.). Video game preservation. In *Wikipedia*. https://en.wikipedia.org/wiki/Video_game_preservation