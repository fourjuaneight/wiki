-----
title: "ROMs"
date: 2026-03-28
draft: false
tags:
- emulation
- gaming
- hardware
- preservation
-----

A **ROM** — Read-Only Memory — is simultaneously a physical semiconductor chip and, in modern usage, a binary file containing an exact copy of that chip’s data. In the context of video games, ROM chips are the medium on which all cartridge-based game data lives: program code, graphics tiles, sound samples, and lookup tables are all burned into ROM chips soldered to the cartridge’s circuit board. When players or preservation communities speak of “a ROM,” they almost always mean the digital file — a byte-for-byte dump of one of those chips — but understanding what it contains, and why it matters, requires understanding the hardware it came from.[^wikiaROM]

ROMs sit at the heart of video game preservation and emulation. A ROM file is the raw material that an emulator loads to reconstruct a game; it is also the artifact that preservation organizations like No-Intro, Redump, and the Video Game History Foundation dedicate enormous effort to authenticating and safeguarding. With 87% of pre-2010 US games commercially unavailable, the digital ROM file is often the only form in which a game still exists at all.[^salvador2023] What follows traces the full arc of ROMs: from the physics of how a transistor traps electrons for decades, through the anatomy of a game cartridge and the mechanics of extracting its data, to how emulators load and map that data, and finally to the cultural history of the communities who have preserved it.

## How a ROM chip stores data

All ROM chips belong to the broader category of non-volatile semiconductor memory — meaning they retain their contents without a continuous power supply. This distinguishes them fundamentally from RAM, which loses data the instant power is cut. The specific mechanism by which data is stored varies by ROM type, and game hardware used several different variants across its history.

### Mask ROM

The simplest and most widely used type in commercial game cartridges is **mask ROM**. During semiconductor fabrication, a photolithographic mask defines which transistors in the memory array are electrically connected and which are not. A conducting transistor encodes one binary state; a non-conducting transistor encodes the other. Because the data pattern is literally etched into the silicon during manufacturing, mask ROM is extraordinarily reliable and inexpensive at scale — requiring only one transistor per bit and yielding the smallest cell sizes of any memory technology. Every commercially released NES, SNES, Genesis, Game Boy, and Nintendo 64 cartridge used mask ROM for its game data.[^wikiROM] The trade-off is complete inflexibility: once fabricated, the data cannot be changed.

### EPROM and the floating-gate transistor

The programmable alternatives all rely on a structure called the **floating-gate transistor**, invented in the early 1970s. A floating-gate MOSFET contains an electrically isolated polysilicon gate embedded within insulating silicon dioxide, sandwiched between a control gate and the transistor’s channel. When electrons are injected onto this floating gate, they shift the transistor’s threshold voltage — typically from around 1 volt to 7–8 volts — allowing a simple voltage test to distinguish a programmed cell from an erased one. The electrons remain trapped for decades because the surrounding oxide presents an energy barrier they cannot naturally overcome.[^umich2010]

**EPROM** (Erasable Programmable ROM) uses hot carrier injection to program cells: a high voltage of approximately 12.5 volts between the drain, source, and control gate accelerates channel electrons to sufficient energy to punch through the thin tunnel oxide and lodge on the floating gate. Erasure requires exposing the chip to intense ultraviolet light at 253.7 nanometers through a distinctive fused quartz window in the chip package, which ionizes the oxide and allows trapped charge to dissipate — a process taking ten to twenty minutes. Dov Frohman of Intel invented EPROM in 1971, and it became a staple of game development prototyping and arcade board production.[^wikiEPROM]

**EEPROM** (Electrically Erasable Programmable ROM) replaced UV erasure with Fowler-Nordheim tunneling: a large electric field across the thin oxide enables quantum-mechanical tunneling of electrons through the barrier, allowing individual bytes to be erased and reprogrammed electrically without removing the chip from its circuit. Game Boy Advance cartridges used small serial EEPROMs for save data, and some Nintendo 64 cartridges employed 4-kilobit or 16-kilobit EEPROMs.[^wikiEPROM]

**Flash memory**, invented by Fujio Masuoka at Toshiba in 1984, trades EEPROM’s byte-level erasability for block-level erasure at dramatically higher density and speed. Flash ROM powers modern reproduction cartridges, flashcarts like the EverDrive series, and some official GBA cartridges that used 512 KB to 1 MB of flash for save storage.

## The physical anatomy of a game cartridge

Opening a game cartridge reveals a small printed circuit board populated with an elegant arrangement of chips working in concert. The NES cartridge connects to the console through a 72-pin edge connector carrying an address bus, a bidirectional data bus, power lines, and control signals including the clock signal M2 running at approximately 1.79 MHz. The simplest NES configuration — designated NROM — contains just two chips: one PRG-ROM holding up to 32 KB of program code and one CHR-ROM holding 8 KB of graphics data, with no additional logic required because the console’s own address decoding places the ROM neatly into the CPU’s memory map.[^nesdevCPU]

More complex games demanded more ROM than 32 KB could provide, and this drove the development of **mapper chips** — custom integrated circuits on the cartridge that intercept CPU writes to the ROM address range and use them as commands to switch which bank of ROM is visible in the CPU’s address window at any given time. Nintendo’s MMC1 handled up to 256 KB of PRG-ROM and introduced configurable mirroring and battery-backed RAM. The MMC3 supported 512 KB with fine-grained bank switching and a scanline counter that generated interrupt signals — enabling the split-screen status bars in games like *Super Mario Bros. 3*. The formidable MMC5, used in only a handful of titles, supported 1 MB of PRG-ROM, an on-chip hardware multiplier, and extra sound channels.[^nesdevMapper]

SNES cartridges used a 62-pin connector and a 24-bit address bus capable of addressing 16 megabytes. A typical SNES cartridge contained a mask ROM, an SRAM chip for save data, a memory address decoder, a CIC security chip, and a coin cell battery. ROM sizes ranged from 256 KB for early titles to 6 MB for *Star Ocean* and *Tales of Phantasia*. Thirteen different **enhancement chips** powered 72 SNES games: the Super FX RISC processor rendered the polygons in *Star Fox*, while the SA-1 — a second 65C816 CPU running at 10.74 MHz, triple the speed of the main SNES processor — accelerated *Super Mario RPG* and *Kirby Super Star*.[^sanglard]

Game Boy cartridges connected via a 32-pin edge connector and relied on Memory Bank Controllers to extend the handheld’s 16-bit address space beyond its 64 KB limit. The MBC5, the most common later controller, supported up to 8 MB of ROM across 512 banks.[^epilogue]

Save data across all cartridge platforms relied on **battery-backed SRAM**. A static RAM chip, volatile by nature, was kept alive by a coin cell battery when the console was powered off. A battery management IC handled the switchover between console power and battery power. SRAM in standby draws only 0.3–0.4 microamps, allowing a CR2032 battery to sustain save data for decades — until these batteries eventually die, taking save data with them.[^gamingshift]

Security was another function of cartridge hardware. The NES employed the **10NES CIC lockout system**, a pair of Sharp SM590 4-bit microcontrollers — one in the console and one in the cartridge — that performed a continuous challenge-response handshake. A failed authentication generated a reset signal to the CPU, preventing the game from running. Regional variants enforced region locking, and the system was eventually defeated through methods including voltage spikes and Tengen’s reverse-engineered clone chip.[^consolemods]

## How the console CPU reads cartridge data

The fundamental read cycle is elegantly simple. The CPU places a target address on the address bus, asserts the read line, and waits. Address decoding logic activates the appropriate chip’s enable pin. After the ROM’s access time — typically 100 to 200 nanoseconds — valid data appears on the data bus, and the CPU latches it on the appropriate clock edge.

On the NES, the master clock of 21.477 MHz is divided internally to produce a CPU clock of approximately 1.79 MHz, giving each cycle about 559 nanoseconds. During the first half of each cycle (when M2 is low), the CPU places the next address on the address lines and sets the read/write signal. During the second half (when M2 is high), external devices respond. If address line A15 is high — meaning the address falls in the range reserved for cartridge ROM — the /ROMSEL signal drops low, enabling the ROM chip, which then outputs the requested byte onto the data bus.[^nesdevCPU]

The SNES extended this model with a 24-bit address bus and multiple access speed tiers: fast access at 6 master cycles, slow access at 8 cycles, and extra-slow peripherals at 12 cycles. A cartridge’s address decoder arbitrated access between ROM and SRAM based on the incoming address.[^superfamicom]

The Nintendo 64 broke from the direct-access model entirely. Its Reality Coprocessor mediated all bus activity through a Parallel Interface using a multiplexed 16-bit bus. Rather than executing code directly from the cartridge, the N64 used DMA to copy data into its main RAM, then executed from cache — a fundamental architectural shift that presaged modern loading-based game design.[^n64brew]

## From physical chip to digital file: the ROM image

A ROM file is a binary copy of the data stored on a physical ROM chip, created by reading every address sequentially and writing the resulting bytes to disk. The file contains raw data in linear order, sometimes with a metadata header prepended. For NES ROMs, the 16-byte **iNES header** specifies the mapper type, PRG-ROM and CHR-ROM sizes, mirroring arrangement, and whether battery-backed RAM is present.[^nesdevINES] SNES ROMs sometimes carry a 512-byte copier header from the device that originally dumped them, though the headerless `.sfc` format is preferred by modern preservation practice. N64 ROMs exist in three byte orderings — big-endian (`.z64`), byte-swapped (`.v64`), and little-endian (`.n64`) — all containing identical data rearranged differently.[^n64dev]

The linguistic shift embedded in everyday usage is worth noting. “ROM” originally referred exclusively to the physical semiconductor chip. In the 1990s, as the emulation community began extracting cartridge data, people called the resulting files “ROM images,” analogous to disk images. Casual usage shortened this to simply “ROMs,” and today the word overwhelmingly refers to a digital file rather than a hardware component.[^grokiROM]

## ROM dumping: extracting game data from hardware

ROM dumping is the process of reading every byte from a physical game medium and writing it to a computer file. For cartridges, a dumping device interfaces with the edge connector — the same connector the console uses — applies the correct voltage, and sweeps through every address on the address bus, reading the data bus at each step. The critical complication is bank switching: because mapper chips control which portion of a larger ROM is visible in the CPU’s address window at any given time, the dumper must know which mapper the game uses and write appropriate values to the mapper’s control registers to cycle through every bank.[^mameWikiDump]

Several dedicated hardware tools serve the dumping community. The **Retrode**, created by Matthias Hullin in 2009, uses an AVR microcontroller to present cartridge contents as files on a virtual USB mass storage device — no special drivers required — with native support for SNES and Genesis cartridges and plug-in adapters for other systems.[^wikiaRetroDE] The **INLretro Dumper-Programmer** is a fully open-source device supporting NES, SNES, Genesis, N64, and Game Boy cartridges, using Lua scripts to handle different mapper configurations. The **GB Operator** by Epilogue offers plug-and-play USB-C dumping with built-in emulator integration and counterfeit detection for Game Boy cartridges.

Optical disc dumping presents a different set of challenges. The **Redump project** has established rigorous standards using tools like DiscImageCreator and redumper. Disc preservation must account for **subchannel data** — additional information interleaved with the main track data that is critical for copy protection schemes — and requires specific approved drive models for accurate extraction. GameCube and Wii discs use proprietary formats unreadable by standard drives, requiring modified firmware or homebrew software.[^redumpWiki]

Arcade board dumping is the most physically demanding form of ROM preservation. Individual ROM chips — often EPROMs — must be removed from the board, either pulled from sockets or desoldered with hot-air rework equipment, then inserted into an EPROM programmer and read chip by chip. Programmable logic devices on arcade boards present an additional challenge: 95% of PLDs have their read-protect fuse activated by the manufacturer, making their contents inaccessible to standard readers and sometimes requiring physical decapping of the chip package.[^mameWikiDump]

## File formats, naming conventions, and cryptographic verification

The iNES header format, created by emulator author Marat Fayzullin, established the standard for NES ROM distribution. A historical quirk plagues it: early ROM management tools wrote junk data into header bytes 7 through 15 — including the string “DiskDude!” — which corrupts the mapper number. The **NES 2.0** extension, created by kevtris, expanded mapper support to 4,096 possible values, added explicit RAM size fields, and specified CPU and PPU timing variants.[^nesdev20]

Two naming conventions have shaped how ROM files are organized. The **GoodTools** system, created by “Cowering,” used bracket codes to encode dump status: `[!]` for verified good dump, `[b]` for bad dump, `[h]` for hack, `[t]` for trainer, and `[f]` for fixed, with country codes like `(U)` for USA and `(J)` for Japan.[^grokiGood] The **No-Intro naming convention** replaced it with a cleaner, more systematic format using full country names and ISO 639-1 language codes — for example, `Diddy Kong Racing (USA) (En,Fr) (Rev 1)`.[^noIntroNaming]

Verification is the bedrock of ROM preservation. No-Intro and Redump maintain databases of **CRC32, MD5, and SHA-1 hashes** for every verified clean dump. CRC32 is fast to compute and sufficient for quick identification; MD5 provides stronger collision resistance; SHA-1 serves as the definitive checksum. These hashes are distributed in DAT files using the Logiqx XML format, which ROM management tools like **clrmamepro** consume to scan, verify, rename, and organize ROM collections.[^clrmame] The workflow is direct: load the appropriate DAT file, point the scanner at a ROM directory, and the tool computes checksums and reports which files are verified matches, which are incorrect, and which are missing.

## How emulators load and run ROM files

When an emulator opens a ROM file, it reads the entire binary into a buffer in the host system’s RAM, parses any header to extract configuration information — mapper type, ROM size, save RAM presence — and maps the ROM data into a virtual representation of the console’s address space. This mapping uses either a **page table** system, where the address space is divided into small pages with read and write pointers for each, or a **handler table**, where arrays of function pointers indexed by address region dispatch reads and writes to appropriate subsystems. MAME’s architecture uses dedicated memory regions for ROM (read-only zones), memory shares for RAM, and memory banks that provide efficient runtime indirection for bank switching.[^mameMem]

During execution, every time the emulated CPU needs to fetch an instruction or read data, the emulator performs an address lookup through its virtual memory map. In an interpreter-based emulator, this means a continuous fetch-decode-execute loop: read the opcode at the program counter, decode it, execute the corresponding operation on virtual registers, and repeat. In a JIT-compiled emulator, blocks of guest code are translated into native host machine code at runtime, cached, and executed directly — eliminating decode overhead on subsequent passes. Dolphin, PCSX2, and RPCS3 all rely on JIT compilation for adequate performance with more powerful guest CPUs.[^retrorev]

Mapper and enhancement chip emulation is where accuracy becomes critical. An emulator must replicate the behavior of every mapper a game might use, or that game will not function. Incorrect PRG bank switching causes the CPU to execute garbage data and crash; wrong CHR bank selection produces garbled graphics; missing scanline counter emulation breaks status bars in hundreds of NES games. For the SNES, accurate emulation of the Super FX chip requires simulating a complete 16-bit RISC processor, while the SA-1 demands a second 65C816 CPU with its own DMA controller and math hardware — both running alongside the main CPU.[^sanglard]

Save data handling in emulators mirrors the physical cartridge’s battery-backed SRAM through a simple mechanism: the emulator allocates a RAM buffer matching the cartridge’s SRAM size, loads any existing `.srm` file into it at startup, directs all reads and writes during gameplay to this buffer, and writes the buffer back to disk on exit. Because the `.srm` file is a raw binary dump with no header or metadata, it is cross-compatible between different emulators and even real hardware via flashcarts. **Save states**, by contrast, capture the entire emulated system’s state — CPU registers, all RAM contents, video and audio state, mapper register values — enabling restoration to an exact moment in time. Save state formats are emulator-specific and typically fragile across emulator version updates.[^techsensi]

Some emulators require **BIOS files** — dumps of the firmware ROM from the original console’s motherboard. The PlayStation’s BIOS handles CD-ROM reading, memory card management, and provides kernel functions that games call directly; without it, many games cannot boot correctly. Emulators like DuckStation and Mednafen require the real BIOS for full accuracy, while others offer High-Level Emulation that intercepts BIOS calls and executes equivalent code natively — faster to boot but potentially incomplete for games that rely on undocumented BIOS behavior. BIOS files are region-specific, and using a mismatched region BIOS can cause boot failures or incorrect video timing.

## ROM hacking and binary patching

ROM hacking — modifying a game’s binary data to alter text, graphics, levels, or gameplay — relies on patch file formats that encode only the differences between the original and modified ROM. The oldest and most widely used format is **IPS** (International Patching System), which stores a series of records each containing a 3-byte offset, a 2-byte length, and the replacement data. Its limitations are significant: the 3-byte offset field caps addressable files at 16 megabytes, and it includes no checksums, meaning a patch can be silently applied to the wrong ROM.

The **BPS** (Beat Patching System) format, created by byuu (developer of bsnes), modernized the practice with variable-length encoding for unlimited file sizes, CRC32 checksums for both source and target files, delta encoding for relocated data, and optional metadata. BPS patches of equivalent modifications are typically about half the size of IPS counterparts. Some emulators support **soft-patching**, automatically applying a patch file with the same filename as the ROM at load time without modifying the original file — a workflow that keeps original and modified data cleanly separated.

The ROM hacking community has produced substantial works of translation and modification. The fan translation of *Mother 3* for GBA, led by Clyde “Tomato” Mandelin, made a beloved Japanese-exclusive game accessible to English speakers without any official localization. Vitor Vilela’s SA-1 patch for *Gradius III* demonstrates a different application: by shifting the game’s processing to the SA-1 coprocessor, it eliminates the crippling slowdown that plagued the original SNES release — effectively improving on the original hardware’s performance.

## The cultural history of ROM preservation

The ROM dumping scene traces its origins to the software cracking and demo communities of the late 1980s. European crackers on the Commodore 64 and Amiga would add animated “cracktros” to software they had defeated the copy protection of, and these intros gradually evolved into standalone demonstrations of programming artistry — the demoscene. Distribution relied on physical mail-swapping of floppy disks in Europe and dial-up BBS systems in the United States.[^filfre2016]

Console ROM dumping emerged in the mid-1990s, enabled by hardware copier devices manufactured primarily in Hong Kong — the Doctor V64, Super Wild Card, and Mr. Backup Z64 — that could dump cartridge ROMs to floppy disks. Scene groups began acquiring and dumping console games, often adding group intros or trainers to their releases. The emulation explosion of April 1997, when Bloodlust Software released NESticle version 0.2, catalyzed the broader scene: NESticle’s ease of use and unprecedented compatibility demonstrated that console games could run convincingly on personal computers, and SNES and Genesis emulators followed rapidly.

ROM download sites proliferated through the late 1990s and early 2000s. EmuParadise, founded in 2000, operated for eighteen years before removing its ROM library in August 2018. The concept of **abandonware** — the idea that software no longer commercially available should be freely distributable — emerged in 1997 when Peter Ringering formed the Abandonware Ring, a webring of classic game download sites. When the Interactive Digital Software Association sent cease-and-desist letters to ring members, the unintended consequence was spurring the creation of far more abandonware sites than had previously existed.[^wikiAban]

## MAME and the philosophy of preservation through documentation

The Multiple Arcade Machine Emulator began as a project by Italian programmer Nicola Salmoria to preserve *Pac-Man* family games. MAME version 0.1 was publicly released on February 5, 1997, supporting four titles on MS-DOS. The project’s stated philosophy is unambiguous: MAME’s purpose is to preserve decades of software history, and the ability to play games is explicitly described as “a nice side effect.”[^wikiaMAME]

MAME’s ROM set architecture reflects the physical realities of arcade hardware. Non-merged sets make each game archive fully self-contained; split sets keep parent ROMs separate from clone-specific files; merged sets combine a parent game with all its regional variants and bootlegs into a single archive. ROM files within archives are identified by **CRC-32 hash** rather than filename, enabling flexible organization regardless of how the files are named. Today MAME documents over 32,000 individual systems, and its 2016 transition to BSD/GPL licensing opened the project to broader contribution and commercial use for authorized re-releases.[^mameDoc]

## No-Intro, Redump, and the custodians of clean data

**No-Intro**, established in the mid-2000s, takes its name from its founding principle: preserving ROMs without the intros that scene groups had been adding. The organization maintains DAT files containing verified hashes for over 300,000 cartridge and digital game dumps, accepting only ROMs that represent exact copies of original media with no modifications. Submissions require documentation of the dumping tool, hash verification, PCB photographs, and associated metadata.[^noIntroNaming]

**Redump.org** serves the parallel mission for optical disc games, storing verified hash and metadata information for over 100,000 disc dumps across every major optical disc platform. **TOSEC** (The Old School Emulation Center), founded in February 2000, takes a more comprehensive approach, cataloging everything including bad dumps and variants — its database encompasses over 1.2 million software images spanning approximately 195 unique hardware brands.[^redumpWiki]

The distinction between **clean** and **dirty** ROMs is existentially important to these organizations. A clean ROM matches verified hash values and represents an exact copy of the original game data. A dirty ROM has been modified — by scene intros, trainers, region patches, header corruption, or simple extraction errors. Bad dumps result from hardware failures during the dump process: dirty cartridge contacts, failing address lines that produce half-duplicated data, or premature termination that creates underdumped files. Every one of these modifications destroys the hash match that allows a file to be verified as authentic, which is why preservation groups maintain zero tolerance for anything less than bit-perfect fidelity.

The **Video Game History Foundation**, incorporated as a 501(c)(3) in 2017 by game historian Frank Cifaldi, has emerged as the preservation movement’s most prominent institutional advocate. In January 2025 the Foundation launched its Digital Library with over 30,000 curated files, and in December 2025 recovered 147 previously lost Sega Channel ROMs including unreleased games.[^wikiVGHF] Cifaldi’s summary of the stakes is direct: with 87% of classic games commercially unavailable, the ROM file is frequently the only surviving form of a game that still exists.[^salvador2023]

[^clrmame]: InsertMoreCoins. (2025). *ClrMamePro ROM manager guide*. https://www.insertmorecoins.es/en/clrmamepro-rom-manager-guide-2025/

[^consolemods]: ConsoleMods Wiki. (n.d.). *NES: Disabling CIC chip*. https://consolemods.org/wiki/NES:Disabling_CIC_Chip

[^epilogue]: Epilogue. (n.d.). *What are the main components of a Game Boy cartridge?* https://support.epilogue.co/hc/en-us/articles/5977616235676

[^filfre2016]: Maher, J. (2016, January). A pirate’s life for me, part 2: The scene. *The Digital Antiquarian*. https://www.filfre.net/2016/01/a-pirates-life-for-me-part-2-the-scene/

[^gamingshift]: Gaming Shift. (n.d.). *Why do Game Boy cartridges have batteries?* https://gamingshift.com/why-do-gameboy-cartridges-have-batteries/

[^grokiGood]: Data Crystal. (n.d.). *GoodTools*. https://datacrystal.tcrf.net/wiki/GoodTools

[^grokiROM]: Wikipedia contributors. (n.d.). ROM image. In *Wikipedia*. https://en.wikipedia.org/wiki/ROM_image

[^mameDoc]: MAME Development Team. (n.d.). *About ROM sets*. MAME Documentation. https://docs.mamedev.org/usingmame/aboutromsets.html

[^mameMem]: MAME Development Team. (n.d.). *Emulated system memory and address spaces management*. MAME Documentation. https://docs.mamedev.org/techspecs/memory.html

[^mameWikiDump]: MAME Development Team. (n.d.). *Dumping ROMs*. MAMEDEV Wiki. https://wiki.mamedev.org/index.php/Dumping_roms

[^n64brew]: N64brew Wiki. (n.d.). *Memory map*. https://n64brew.dev/wiki/Memory_map

[^n64dev]: n64dev.org. (n.d.). *N64 ROM formats*. http://n64dev.org/romformats.html

[^nesdev20]: NESDev Community. (n.d.). *NES 2.0*. NESDev Wiki. https://www.nesdev.org/wiki/NES_2.0

[^nesdevCPU]: NESDev Community. (n.d.). *CPU memory map*. NESDev Wiki. https://www.nesdev.org/wiki/CPU_memory_map

[^nesdevINES]: NESDev Community. (n.d.). *iNES format*. NESDev Wiki. https://www.nesdev.org/wiki/INES

[^nesdevMapper]: NESDev Community. (n.d.). *Mapper*. NESDev Wiki. https://www.nesdev.org/wiki/Mapper

[^noIntroNaming]: No-Intro. (n.d.). *Naming convention*. No-Intro Wiki. https://wiki.no-intro.org/index.php?title=Naming_Convention

[^redumpWiki]: Redump.org. (n.d.). *Redump: A disc preservation database*. http://wiki.redump.org/index.php?title=Redump.org

[^retrorev]: RetroReversing. (2022, October 9). *How do emulators work?* https://www.retroreversing.com/how-emulators-work

[^salvador2023]: Salvador, P. (2023, July). *Survey of the video game reissue market in the United States*. Video Game History Foundation. https://gamehistory.org/87percent/

[^sanglard]: Sanglard, F. (n.d.). *Inside the Super Nintendo cartridges*. https://fabiensanglard.net/snes_carts/

[^superfamicom]: Super Famicom Development Wiki. (n.d.). *Memory mapping*. https://wiki.superfamicom.org/memory-mapping

[^techsensi]: TechSensi. (n.d.). *How save states work explained*. https://techsensi.com/how-save-states-work-explained/

[^umich2010]: University of Michigan EECS. (2010). *ROM, EPROM, and EEPROM technology* [Course reading, EECS 373]. https://web.eecs.umich.edu/~prabal/teaching/eecs373-f10/readings/rom-eprom-eeprom-technology.pdf

[^wikiAban]: Wikipedia contributors. (n.d.). Abandonware. In *Wikipedia*. https://en.wikipedia.org/wiki/Abandonware

[^wikiaMAME]: Wikipedia contributors. (n.d.). MAME. In *Wikipedia*. https://en.wikipedia.org/wiki/MAME

[^wikiaRetroDE]: Wikipedia contributors. (n.d.). Retrode. In *Wikipedia*. https://en.wikipedia.org/wiki/Retrode

[^wikiEPROM]: Wikipedia contributors. (n.d.). EPROM. In *Wikipedia*. https://en.wikipedia.org/wiki/EPROM

[^wikiROM]: Wikipedia contributors. (n.d.). Read-only memory. In *Wikipedia*. https://en.wikipedia.org/wiki/Read-only_memory

[^wikiVGHF]: Wikipedia contributors. (n.d.). Video Game History Foundation. In *Wikipedia*. https://en.wikipedia.org/wiki/Video_Game_History_Foundation