---
title: "Ethernet"
date: 2026-03-18
updated: 2026-03-19
draft: false
tags:
  - hardware
  - networking
  - protocols
---

**Ethernet** is the dominant wired local area network technology, defining how devices format, transmit, and receive data over physical cables using a system of framed packets, unique hardware addresses, and media-access protocols. Formally standardized as **IEEE 802.3** in 1983, the technology operates across the Physical Layer (Layer 1) and Data Link Layer (Layer 2) of the OSI reference model, meaning it governs both the electrical signals on the wire and the logical rules for addressing and framing data. What began in 1973 as a 2.94 Mbps experiment linking Alto workstations at Xerox PARC has evolved into a family of standards spanning 1 Mbps to 800 Gbps — with 1.6 Terabit Ethernet already under active standardization — making it the indispensable backbone of data centers, enterprise networks, and the internet itself[^ieeeStdAssoc2023][^metcalfeBoggs1976].

Ethernet's endurance over five decades is not accidental. It stems from three structural advantages: open standardization through the IEEE that discouraged proprietary lock-in, a frame format flexible enough to carry virtually any network-layer protocol, and a physical-layer design that has scaled from coaxial cable to twisted pair to fiber optics while preserving backward compatibility at the software layer. Every competing LAN technology — Token Ring, ARCnet, FDDI — has been retired, while Ethernet has simply kept raising the speed bar.

## Origins: from ALOHAnet to Xerox PARC

Ethernet's conceptual roots lie in **ALOHAnet**, built by Norman Abramson at the University of Hawaii in the late 1960s to connect the Hawaiian Islands to a central computer via packet radio. ALOHAnet used a simple rule: transmit when ready and retransmit at a random interval if a collision was detected. Robert Metcalfe, then completing his doctoral dissertation at Harvard, studied Abramson's mathematical model, identified flaws in its collision probability analysis, and corrected them — work that seeded the core insight behind CSMA/CD.

In 1972, Metcalfe joined Xerox PARC, where he was assigned to network the revolutionary Xerox Alto personal computers to each other and to laser printers. Working with David Boggs, a Stanford graduate student and amateur radio operator, Metcalfe built the first experimental Ethernet. On May 22, 1973, he circulated an internal memo titled "Ether Acquisition," a date now recognized as Ethernet's birthday[^metcalfeBoggs1976]. The name "Ethernet" evoked the 19th-century concept of the *luminiferous ether* — the hypothetical medium once believed to propagate electromagnetic waves — since the coaxial cable carried bits to all attached stations in an analogous broadcast fashion. By 1975, the network had grown to over 100 nodes spanning a kilometer of cable[^ieeeStdAssoc2023].

> "The Ethernet is a system for connecting computers within a building using standard, off-the-shelf coaxial cable... Each computer is directly connected to the Ether and in principle can communicate with any other computer."
> — Metcalfe & Boggs (1976)

Commercialization required industry collaboration. Metcalfe persuaded Digital Equipment Corporation, Intel, and Xerox to form the **DIX consortium**, which published the Ethernet Version 1.0 specification on September 30, 1980, defining 10 Mbps Ethernet over thick coaxial cable. Version 2.0 followed in 1982. Xerox then donated all its Ethernet patents to the IEEE, enabling the open standard that drives adoption today. The IEEE Computer Society's Project 802 formally adopted the technology as IEEE 802.3, approving it in June 1983 and publishing it as ANSI/IEEE Std 802.3-1985. Metcalfe ultimately received the 2023 ACM A.M. Turing Award for the invention, standardization, and commercialization of Ethernet[^acm2023].

## Frame structure and MAC addressing

Ethernet's fundamental unit of transmission is the **frame** — a structured sequence of bytes that encapsulates a payload alongside addressing, type, and error-detection information. The Ethernet II frame, dominant on modern networks, is organized as follows.

| Field | Size | Purpose |
|---|---|---|
| Preamble | 7 bytes | Alternating 1s/0s for receiver clock synchronization |
| Start Frame Delimiter | 1 byte | Signals start of frame data (10101011) |
| Destination MAC | 6 bytes | Hardware address of the intended recipient |
| Source MAC | 6 bytes | Hardware address of the sender |
| EtherType | 2 bytes | Identifies the encapsulated protocol (e.g., 0x0800 = IPv4) |
| Payload | 46–1,500 bytes | Data from the network layer |
| Frame Check Sequence | 4 bytes | CRC-32 checksum for error detection |

The 64-byte minimum frame size is not cosmetic — it encodes a fundamental timing constraint. A transmitting station on a 10 Mbps shared segment must take at least 51.2 microseconds to send 64 bytes, which is just long enough to detect a collision at the far end of a 500-meter collision domain before finishing transmission. This coupling between frame size, data rate, and maximum segment length is a deliberate feature of the original design[^unhIOL].

**MAC addresses** are 48-bit (6-byte) identifiers permanently assigned to each network interface controller by its manufacturer. The first three bytes constitute the *Organizationally Unique Identifier* (OUI), assigned by the IEEE to manufacturers; the remaining three bytes are assigned by the manufacturer, yielding up to 16.7 million addresses per OUI. Two bit flags within the first octet carry special meaning: the I/G bit distinguishes unicast (0) from multicast (1) frames, and the U/L bit distinguishes globally unique (0) from locally administered (1) addresses. The all-ones broadcast address `FF:FF:FF:FF:FF:FF` is delivered to every device on the local segment and is relied upon by ARP and DHCP for initial address resolution. Switches maintain a *MAC address table* (also called a CAM table) mapping learned addresses to ports, with entries expiring after a default of 300 seconds of inactivity.

## CSMA/CD: arbitrating the shared medium

**Carrier Sense Multiple Access with Collision Detection** (CSMA/CD) was the access-control mechanism that made shared-medium Ethernet practical. On early bus-topology networks where dozens of devices shared a single coaxial cable, simultaneous transmissions would corrupt each other's data. CSMA/CD resolved this through a disciplined sequence.

A device wishing to transmit first listens to the medium; if the channel is busy, it waits until idle. Once it begins transmitting, it simultaneously monitors the wire for collision signatures — voltage anomalies caused by overlapping signals. If a collision is detected, the device immediately stops sending data and broadcasts a 32-bit jam signal to ensure all stations recognize the event. Each colliding station then applies *binary exponential backoff*: after the *c*-th consecutive collision, it randomly selects an integer *k* from the range `[0, 2^c − 1]` and waits `k × 51.2 µs` before retrying. The exponent caps at 10, and after 16 consecutive failures the device aborts and reports an error upward. The elegance of the scheme is that under light load, collisions are rare and latency is minimal; under heavy load, backoff naturally spaces retransmissions across time, preventing a thundering-herd collapse[^wikipedia2024a].

CSMA/CD must be contrasted with **CSMA/CA** (Collision Avoidance), used by Wi-Fi (IEEE 802.11). Wireless stations cannot reliably detect collisions while transmitting — their own signal drowns out incoming signals — so Wi-Fi *avoids* collisions proactively through random backoff timers, optional RTS/CTS handshakes that address the hidden-node problem, and mandatory per-frame acknowledgments from the receiver. CSMA/CD detects and recovers; CSMA/CA defers and avoids. This architectural difference stems directly from the physical medium: electrical signals on copper are easily monitored during transmission, while radio signals are not.

The widespread deployment of Ethernet switches in the 1990s rendered CSMA/CD largely obsolete. Switches provide *microsegmentation* — each port is its own isolated collision domain — and enable full-duplex operation where transmit and receive paths are physically separate. Collisions become impossible. The IEEE formally acknowledged this transition by renaming the standard from "CSMA/CD Access Method" to simply "IEEE Standard for Ethernet" in 2008, and by deprecating hub (repeater) standards entirely in 2011[^ieeeStdAssoc2023].

## Speed evolution: from 10 Mbps to 800 Gbps

Ethernet's rated speed has increased by more than five orders of magnitude, with each generation defined by a distinct IEEE 802.3 amendment, encoding scheme, and physical medium.

**10 Mbps Ethernet** arrived in three variants. The original *10BASE5* (802.3, 1983) used thick coaxial cable with "vampire tap" connections for up to 500-meter segments. *10BASE2* (802.3a, 1985) used thinner RG-58 coax at 185 meters. Both employed bus topology and Manchester encoding, where each bit period contains a mid-bit voltage transition that serves double duty as both clock and data signal. The pivotal shift came with *10BASE-T* (802.3i, 1990), which introduced unshielded twisted-pair (UTP) cable, RJ45 connectors, and star topology — the physical architecture that all modern Ethernet inherits.

**Fast Ethernet at 100 Mbps** (802.3u, 1995) delivered a tenfold speed increase. The dominant variant, *100BASE-TX*, runs over Cat5 cable using two of four pairs, employing 4B/5B block coding at 125 Mbaud combined with MLT-3 three-level signaling. This combination fits within Cat5's 100 MHz bandwidth — far more efficient than Manchester encoding, which would have required 200 MHz for the same data rate.

**Gigabit Ethernet** arrived in two waves. *1000BASE-X* (802.3z, 1998) covered fiber and short copper using 8B/10B encoding at 1.25 Gbaud. *1000BASE-T* (802.3ab, 1999) brought Gigabit speed to Cat5e copper via *4D-PAM5* encoding, which transmits simultaneously across all four twisted pairs in both directions using five voltage levels and sophisticated echo cancellation at just 125 Mbaud per pair — keeping the signal spectrum below 62.5 MHz[^techtarget2023].

**10 Gigabit Ethernet** (802.3ae, 2002 for fiber; 802.3an, 2006 for copper) was the first standard to support *only* full-duplex operation, formally eliminating CSMA/CD from the specification. Its 64B/66B encoding carries just 3.125% overhead compared to 8B/10B's 25%, a significant efficiency gain at higher speeds. The copper variant, *10GBASE-T*, requires Cat6a cable for the full 100-meter specification[^wikipedia2024b].

Subsequent generations accelerated rapidly. IEEE 802.3bz (2016) introduced 2.5 and 5 Gbps *Multi-Gigabit Ethernet* over existing Cat5e/Cat6 cabling — a pragmatic bridge standard for the installed base. 40 and 100 Gbps were standardized together in 802.3ba (2010), 200 and 400 Gbps in 802.3bs (2017), and **800 Gbps** in 802.3df (approved February 16, 2024). All high-speed variants use PAM4 modulation and forward error correction. The IEEE P802.3dj task force is actively developing *1.6 Terabit Ethernet*, driven primarily by AI and machine-learning data center demands, with completion targeted for approximately July 2026[^ieeeCS2024][^ieeeStdAssoc2023].

## Ethernet cable categories

The twisted-pair copper cable is Ethernet's most tangible physical component, and cable categories encode a precise set of bandwidth, crosstalk, and distance specifications.

| Category | Bandwidth | Max Speed | Max Distance | Notes |
|---|---|---|---|---|
| Cat5 | 100 MHz | 100 Mbps | 100 m | Obsolete; superseded by Cat5e |
| Cat5e | 100 MHz | 1 Gbps | 100 m | Most widely deployed globally |
| Cat6 | 250 MHz | 10 Gbps | 37–55 m | 10G only at short runs |
| Cat6a | 500 MHz | 10 Gbps | 100 m | First to support full 10GBASE-T reach |
| Cat7 | 600 MHz | 10 Gbps | 100 m | Not IEEE/TIA endorsed; proprietary connectors |
| Cat8 | 2,000 MHz | 25/40 Gbps | 30 m | Data center switch interconnects only |

All categories use twisted-pair construction, a technique dating to Alexander Graham Bell's 1881 patent, where twisting adjacent wire pairs reduces electromagnetic crosstalk. Cat5e introduced tighter twist rates and enhanced crosstalk specifications (improved NEXT, ELFEXT, and return loss) over basic Cat5, enabling 1000BASE-T while using the same 100 MHz bandwidth. Cat6 adds an internal plastic spline separator to increase pair isolation and doubles bandwidth to 250 MHz, supporting 10 Gbps at short distances. Cat6a provides alien-crosstalk suppression sufficient for *10GBASE-T at the full 100-meter specification* — the minimum category for new commercial installations in most enterprise guidance[^eaton][^networkInstallers2025].

Cat7 and Cat7a are ISO/IEC standards using mandatory shielded twisted-pair construction (S/FTP), but they require proprietary GG45 or TERA connectors that are incompatible with standard RJ45 infrastructure, limiting their real-world adoption — particularly in North America. Cat8 reaches 2 GHz bandwidth and supports 25 or 40 Gbps, but its 30-meter maximum distance confines it to top-of-rack switch interconnects and patch panels in data centers. The universal connector for copper Ethernet across all practical categories is the 8P8C modular plug, commonly called the *RJ45* connector[^eaton].

## Topology: from bus to switched star

Ethernet's physical architecture has undergone two transformations, each dramatically improving reliability and performance.

The original **bus topology** of 10BASE5 and 10BASE2 connected all devices to a single shared coaxial backbone terminated at both ends with 50-ohm resistors to prevent signal reflection. The design was simple but fragile: a cable break or improperly installed tap could take down the entire network segment. Every device shared a single collision domain, meaning CSMA/CD governed all transmissions.

The introduction of 10BASE-T in 1990 brought the **star topology**, where each device connects to a central hub via its own dedicated cable. This transformed failure isolation — a broken cable now affected only one device. However, hubs are Layer 1 repeaters that blindly copy incoming signals to all ports, so the network remained a single collision domain logically even as it became a physical star. The analogy is a conversation room where only one person may speak at a time; separate seating doesn't help if everyone still shares a single microphone.

**Ethernet switches** resolved this entirely. Operating at Layer 2, a switch reads the destination MAC address of each incoming frame, consults its MAC address table, and forwards the frame exclusively to the correct port — a process called *store-and-forward* switching. This microsegmentation gives each port its own collision domain and enables full-duplex operation, meaning every connected device receives dedicated, uncontested bandwidth[^ciscoA]. Modern networks are overwhelmingly switched star architectures, and the IEEE deprecated hub standards in 2011.

Redundant switched topologies require loop prevention. **Spanning Tree Protocol** (IEEE 802.1D), invented by Radia Perlman at DEC in 1985, prevents broadcast storms by electing a root bridge and logically blocking redundant paths. Its modern successor, *Rapid Spanning Tree Protocol* (IEEE 802.1w), converges in seconds rather than STP's original 30–50 seconds — a critical improvement for production networks. **IEEE 802.1Q** VLAN tagging, which inserts a 4-byte tag into the Ethernet frame, allows a single physical switch infrastructure to carry multiple logically isolated network segments[^wikipedia2024c].

## Half-duplex versus full-duplex operation

In **half-duplex** mode — the only option on shared media and hubs — a device can either transmit or receive at any instant, never both. CSMA/CD must arbitrate channel access, and collisions impose a real but variable throughput tax. Effective throughput on a heavily loaded 10 Mbps half-duplex segment could fall well below the rated speed.

**Full-duplex** Ethernet, enabled by point-to-point switched connections, uses separate wire pairs for transmit and receive, allowing simultaneous bidirectional communication. A 100 Mbps full-duplex link provides 100 Mbps in each direction concurrently, yielding 200 Mbps of aggregate throughput. Collisions are physically impossible because the transmit and receive paths never share a medium. IEEE 802.3u introduced *auto-negotiation* to handle the transition gracefully: connected devices exchange speed and duplex capabilities using Fast Link Pulses and select the highest mutually supported mode automatically[^scienceDirect].

A common operational hazard is a **duplex mismatch**, where one end of a link is hard-coded to full-duplex while the other auto-negotiates and defaults to half-duplex. The resulting asymmetry — the full-duplex end transmits freely while the half-duplex end applies CSMA/CD — produces high CRC error rates and dramatically degraded throughput without triggering an obvious alert. Best practice is to leave auto-negotiation enabled on all ports unless a specific interoperability reason requires otherwise. All Ethernet standards at 10 Gbps and above are full-duplex only; half-duplex operation is not defined at those speeds[^broadcom].

## Power over Ethernet

**Power over Ethernet** (PoE) enables a single twisted-pair cable to deliver both network data and DC electrical power to a connected device, eliminating separate AC power outlets for devices like IP cameras, VoIP phones, and wireless access points. PoE works by superimposing low-voltage DC (44–57 V) as a common-mode signal over the differential data pairs using transformer center-taps, a technique that coexists with data transmission without interference.

The IEEE has defined four progressively capable standards. *IEEE 802.3af* (2003) delivers up to 15.4 W per port. *IEEE 802.3at* (PoE+, 2009) doubles this to 30 W, sufficient for dual-band access points and PTZ cameras. *IEEE 802.3bt* (PoE++, 2018) introduced two additional tiers: Type 3 at 60 W for high-performance Wi-Fi 6E access points and LED lighting systems, and Type 4 at 90 W for laptops and 4K displays. All standards are backward compatible — a Type 4 Power Sourcing Equipment (PSE) gracefully downgrades when connected to a lower-class Powered Device (PD)[^wikipedia2024d].

Before delivering power, the PSE probes the cable with a current-limited voltage, looking for a 25 kΩ signature resistor in the PD. This detection-and-classification handshake — supplemented by LLDP-based negotiation for fine-grained power management — prevents damage to non-PoE equipment. The practical advantages are substantial: a single cable run to a ceiling-mounted access point provides both connectivity and power, reducing installation time, complexity, and cost while enabling centralized power management and remote device reboots from the switch interface[^fsCom2022].

## Ethernet and Wi-Fi as complementary layers

Ethernet (IEEE 802.3) and Wi-Fi (IEEE 802.11) are often positioned as rivals, but the relationship is better described as complementary layers of the same network fabric. Ethernet delivers sub-millisecond latency (typically 0.2–0.3 ms on a local segment) versus Wi-Fi's 3–30+ ms depending on congestion. Ethernet provides consistent, dedicated bandwidth per port — a Gigabit link reliably sustains ~940 Mbps — while Wi-Fi throughput fluctuates with distance, interference, and the number of stations sharing an access point's airtime. Wi-Fi operates in half-duplex at the radio level, and collisions (or more precisely, contention delays under CSMA/CA) further reduce effective throughput relative to its rated speed.

For latency-sensitive workloads — financial trading, industrial controls, competitive gaming — and for high-throughput infrastructure — data center fabrics at 400–800 Gbps, NAS storage, video production — Ethernet has no wireless equivalent. Wi-Fi dominates where mobility matters: smartphones, tablets, IoT sensors, and laptops depend on wireless connectivity. The key architectural insight is that every Wi-Fi access point connects back to the network via an Ethernet cable, making wired infrastructure the invisible backbone of the wireless world[^ciscoB][^tachus2023].

[^acm2023]: ACM. (2023). *Robert Melancton Metcalfe — ACM A.M. Turing Award laureate*. Association for Computing Machinery. https://awards.acm.org/award-recipients/metcalfe_3968158

[^broadcom]: Broadcom. (n.d.). *Why duplex conflicts occur*. CA Technologies / AppNeta documentation. https://techdocs.broadcom.com/us/en/ca-enterprise-software/it-operations-management/appneta/GA/analyze-results/network-performance-monitoring-delivery/delivery-results/delivery-diagnostics-messages/why-duplex-conflicts-occur.html

[^ciscoA]: Cisco. (n.d.). *What is an Ethernet switch?* Cisco Learning Network. https://www.cisco.com/site/us/en/learn/topics/networking/what-is-an-ethernet-switch.html

[^ciscoB]: Cisco. (n.d.). *What is Ethernet?* Cisco Learning Network. https://www.cisco.com/site/us/en/learn/topics/networking/what-is-ethernet.html

[^eaton]: Eaton. (n.d.). *Ethernet cables explained*. Eaton Tripp Lite Series. https://www.eaton.com/us/en-us/products/backup-power-ups-surge-it-power-distribution/network-connectivity/ethernet-cables-explained.html

[^forouzan2022]: Forouzan, B. A. (2022). *Data communications and networking* (6th ed.). McGraw-Hill.

[^fsCom2022]: FS.com. (2022). *Power over Ethernet (PoE) explained: PoE standards and wattage*. FS Community. https://www.fs.com/blog/understanding-poe-standards-and-wattage-21.html

[^ieeeCS2024]: IEEE Computer Society. (2024). *The journey to 800GbE and 1.6TbE*. IEEE Computer Society Tech News. https://www.computer.org/publications/tech-news/insider-membership-news/the-journey-to-800gbe-and-more

[^ieeeStdAssoc2023]: IEEE Standards Association. (2023). *Ethernet through the years: Celebrating the technology's 50th year of innovation*. IEEE SA. https://standards.ieee.org/beyond-standards/ethernet-50th-anniversary/

[^metcalfeBoggs1976]: Metcalfe, R. M., & Boggs, D. R. (1976). Ethernet: Distributed packet switching for local computer networks. *Communications of the ACM, 19*(7), 395–404. https://doi.org/10.1145/360248.360253

[^netgear]: NETGEAR. (n.d.). *What is Ethernet?* NETGEAR Knowledge Base (KB064600). https://kb.netgear.com/000064600/What-is-Ethernet

[^networkInstallers2025]: The Network Installers. (2025). *Cat ratings for Ethernet cables: Complete guide*. The Network Installers Blog. https://thenetworkinstallers.com/blog/cat-ratings-for-ethernet/

[^scienceDirect]: ScienceDirect. (n.d.). *Autonegotiation — an overview*. ScienceDirect Topics. https://www.sciencedirect.com/topics/computer-science/autonegotiation

[^tachus2023]: Tachus. (2023). *What is Ethernet?* Tachus Learning Center. https://tachus.com/what-is-ethernet/

[^tanenbaum2011]: Tanenbaum, A. S., & Wetherall, D. J. (2011). *Computer networks* (5th ed.). Prentice Hall.

[^techtarget2023]: TechTarget. (2023). *What is 1000BASE-T (Gigabit Ethernet)?* TechTarget SearchNetworking. https://www.techtarget.com/searchnetworking/definition/1000BASE-T

[^unhIOL]: University of New Hampshire InterOperability Laboratory. (n.d.). *The Ethernet evolution: From 10 Meg to 10 Gig — how it all works*. UNH-IOL. https://www.iol.unh.edu/sites/default/files/knowledgebase/ethernet/ethernet_evolution.pdf

[^wikipedia2024a]: Wikipedia. (2024). *Carrier-sense multiple access with collision detection*. Wikimedia Foundation. https://en.wikipedia.org/wiki/Carrier-sense_multiple_access_with_collision_detection

[^wikipedia2024b]: Wikipedia. (2024). *Ethernet over twisted pair*. Wikimedia Foundation. https://en.wikipedia.org/wiki/Ethernet_over_twisted_pair

[^wikipedia2024c]: Wikipedia. (2024). *IEEE 802.3*. Wikimedia Foundation. https://en.wikipedia.org/wiki/IEEE_802.3

[^wikipedia2024d]: Wikipedia. (2024). *Power over Ethernet*. Wikimedia Foundation. https://en.wikipedia.org/wiki/Power_over_Ethernet
