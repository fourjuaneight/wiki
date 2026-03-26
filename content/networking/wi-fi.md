---
title: "Wi-Fi"
date: 2026-03-22
draft: false
tags:
  - networking
  - standards
  - wireless
---

**Wi-Fi** is a family of wireless networking technologies that use radio waves to provide high-speed local area network connectivity. The name is not an acronym — it is a trademark coined by the branding firm Interbrand in 1999 and managed by the **Wi-Fi Alliance**, the industry body that certifies devices for interoperability.[^cisco] Technically, Wi-Fi refers to any wireless LAN that conforms to the **IEEE 802.11** standard, which defines a shared medium access control (MAC) layer and multiple physical layer (PHY) specifications for transmitting data over radio frequencies.[^ieee2024]

The technology's conceptual roots trace to 1971, when ALOHAnet — a UHF packet radio network at the University of Hawaii — first demonstrated that data could move reliably over radio links without dedicated wiring. Two decades later, NCR Corporation and AT&T developed WaveLAN, a set of wireless protocols that directly informed the first IEEE 802.11 standard published in 1997.[^watech] Since then, successive amendments have pushed theoretical throughput from 2 Mbps to beyond 30 Gbps, turning Wi-Fi into the dominant last-meter connectivity technology worldwide. By 2026, cumulative Wi-Fi device shipments are projected to reach 53 billion units, and the technology's global economic contribution is estimated at $4.9 trillion.[^wifialliance]

## How it works

A Wi-Fi network begins with a **wireless router** or **access point** (AP) that is connected to the wider Internet through a wired backhaul — typically cable, fiber, or DSL. The router takes inbound digital data, modulates it onto a radio carrier frequency, and broadcasts the resulting signal. Client devices equipped with wireless adapters receive these radio waves, demodulate them back into digital data, and transmit their own frames back to the AP over the same radio channel. Before any payload data is exchanged, the client and AP perform an authentication handshake and negotiate encryption parameters to secure the link.[^cisco]

### Frequency bands

Wi-Fi operates in unlicensed spectrum allocated by national regulators (the FCC in the United States, ETSI in Europe). Each band presents a different trade-off between range, throughput, and congestion.

| Band | Characteristics | First used in |
|---|---|---|
| 2.4 GHz | Longest range, best wall penetration; only three non-overlapping channels; crowded by Bluetooth, microwaves, and other ISM-band devices | 802.11b (1999) |
| 5 GHz | Shorter range, significantly more non-overlapping channels; less ambient interference | 802.11a (1999) |
| 6 GHz | Widest channels (up to 320 MHz); lowest congestion; requires Wi-Fi 6E or newer hardware | 802.11ax (2021) |
| 60 GHz | Very short range, multi-gigabit speeds; used for line-of-sight links such as wireless docking | 802.11ad (2012) |

Lower frequencies propagate further and penetrate obstacles more easily because their longer wavelengths diffract around barriers, but they offer less bandwidth. Higher frequencies deliver more throughput at the cost of range and obstruction sensitivity. Most modern routers operate simultaneously on 2.4, 5, and — increasingly — 6 GHz, steering clients to the optimal band automatically.[^ieee2024] [^wifialliance]

### Modulation and multiplexing

The physical layer converts digital bits into radio signals through several layered techniques.

**OFDM** (Orthogonal Frequency-Division Multiplexing), introduced with 802.11a, splits a wide radio channel into many narrow, mathematically orthogonal sub-carriers. Each sub-carrier transmits a low-rate data stream in parallel with the others. Because the sub-carriers are orthogonal, they do not interfere with one another even though they overlap in frequency, which makes efficient use of the available spectrum and improves resilience to multipath fading.[^ieee2024]

**OFDMA** (Orthogonal Frequency-Division Multiple Access), added in Wi-Fi 6, takes this a step further by allowing the AP to partition sub-carriers across multiple clients within a single transmission opportunity. Instead of one device occupying the entire channel width while others wait, several devices can transmit or receive simultaneously on their assigned sub-carrier groups. This dramatically reduces latency in dense environments such as stadiums or apartment buildings.[^wifialliance]

**QAM** (Quadrature Amplitude Modulation) determines how many bits each sub-carrier encodes per symbol by varying both the amplitude and phase of the signal. Higher-order QAM — 256-QAM in Wi-Fi 5, 1024-QAM in Wi-Fi 6, 4096-QAM (4K-QAM) in Wi-Fi 7 — packs progressively more data into each symbol but requires a cleaner signal-to-noise ratio to decode reliably.[^wifialliance]

### MIMO and beamforming

**MIMO** (Multiple Input, Multiple Output) uses multiple antennas at both the AP and the client to send and receive several independent data streams — called *spatial streams* — simultaneously over the same frequency. A 4x4 MIMO configuration, for example, can theoretically quadruple throughput compared to a single-antenna link. **MU-MIMO** (Multi-User MIMO), introduced with Wi-Fi 5, extends this concept by directing different spatial streams to different clients at the same time, rather than serving them one after another.[^cisco] [^wifialliance]

**Beamforming** complements MIMO by using phase adjustments across the antenna array to concentrate the transmitted signal toward a specific client rather than radiating energy uniformly in all directions. The AP measures the channel characteristics to each client and computes a steering matrix that shapes the wavefront. The result is a stronger signal at the target device and less wasted energy elsewhere.

## Standards and generations

The IEEE 802.11 working group has published dozens of amendments since 1997, each addressing new frequency bands, higher throughput, improved efficiency, or specialized use cases. In 2018 the Wi-Fi Alliance introduced a consumer-friendly generational naming scheme, retroactively labeling 802.11n as Wi-Fi 4.[^wifialliance]

| Generation | IEEE standard | Year | Max throughput | Headline features |
|---|---|---|---|---|
| — | 802.11 | 1997 | 2 Mbps | Original WLAN specification |
| — | 802.11b | 1999 | 11 Mbps | 2.4 GHz; first mass-market adoption |
| — | 802.11a | 1999 | 54 Mbps | 5 GHz OFDM |
| — | 802.11g | 2003 | 54 Mbps | OFDM brought to the 2.4 GHz band |
| Wi-Fi 4 | 802.11n | 2009 | ~600 Mbps | MIMO; dual-band operation |
| Wi-Fi 5 | 802.11ac | 2013 | ~3.5 Gbps | MU-MIMO; 80/160 MHz channels |
| Wi-Fi 6 / 6E | 802.11ax | 2021 | ~9.6 Gbps | OFDMA; Target Wake Time; 1024-QAM; 6 GHz band |
| Wi-Fi 7 | 802.11be | 2024 | ~30+ Gbps | 320 MHz channels; 4K-QAM; Multi-Link Operation |

Wi-Fi 7's **Multi-Link Operation** (MLO) is particularly notable: it allows a single device to transmit and receive across multiple bands simultaneously, bonding them for higher aggregate throughput and seamlessly shifting traffic away from a band that encounters interference. This represents a fundamental architectural shift from the single-link model that characterized every prior generation.[^ieee2024] [^wifialliance]

Development continues beyond Wi-Fi 7. Active IEEE projects include P802.11bn (Ultra High Reliability, a likely foundation for Wi-Fi 8), P802.11bp (ambient power communication for energy-harvesting IoT devices), and P802.11bt (post-quantum cryptography extensions for authentication and key management).[^ieee2024]

## Security

Early Wi-Fi security was notoriously weak. **WEP** (Wired Equivalent Privacy), the original 1999 encryption scheme, used static RC4 keys with a short initialization vector, making it trivially breakable with passive traffic capture. The Wi-Fi Alliance introduced **WPA** in 2003 as a stopgap, replacing WEP's static keys with TKIP (Temporal Key Integrity Protocol) and per-packet key mixing.

The real fix came with the IEEE 802.11i-2004 amendment, commercialized as **WPA2**. It mandated AES-CCMP encryption, formalized the four-way handshake for key negotiation, and integrated IEEE 802.1X port-based authentication for enterprise networks.[^ieee2024] WPA2 remains the most widely deployed security protocol.

**WPA3**, certified by the Wi-Fi Alliance in 2018, addresses WPA2's remaining weaknesses. Its personal mode replaces the pre-shared key exchange with Simultaneous Authentication of Equals (SAE), a protocol based on Dragonfly key exchange that resists offline dictionary attacks even if the password is weak. Its enterprise mode raises the minimum cryptographic strength to 192-bit equivalent, and a companion feature called Opportunistic Wireless Encryption (OWE) provides individualized encryption on open networks that previously transmitted data in cleartext.[^wifialliance]

## Hardware

A typical Wi-Fi deployment involves a small set of hardware roles:

- **Wireless router:** Combines IP routing, NAT, DHCP, and wireless AP functions in a single appliance. In residential settings, the router is usually the sole piece of Wi-Fi infrastructure and connects upstream to an ISP-provided modem or fiber ONT.[^cisco]
- **Access point:** A dedicated radio that associates with an existing wired network. Enterprise deployments use many APs managed by a central controller or cloud dashboard to provide seamless coverage across large facilities.[^cisco]
- **Mesh node:** A variant of the access point that uses a wireless backhaul link to other mesh nodes rather than requiring a wired Ethernet drop at every location. Mesh systems simplify coverage in homes or buildings where running cable is impractical.
- **Wireless adapter:** The client-side radio, typically integrated into the device's motherboard (laptops, phones) or added via USB or PCIe (desktops). The adapter handles modulation, demodulation, and MAC-layer framing.

## Deployment architectures

How APs are coordinated depends on the scale and operational requirements of the network.

In a **centralized deployment**, all APs are managed by an on-premises wireless LAN controller (WLC). The controller handles roaming, RF management, policy enforcement, and firmware updates. This model is common on university campuses and corporate offices where dozens or hundreds of APs must behave as a unified network.[^cisco]

A **converged deployment** collapses the controller function into the access switch itself, reducing the number of dedicated appliances. This suits branch offices and small campuses where a full standalone controller would be overkill.[^cisco]

**Cloud-managed deployments** move the control plane to a vendor-hosted platform, allowing administrators to configure, monitor, and troubleshoot APs across geographically dispersed sites from a single dashboard. The APs maintain a persistent outbound tunnel to the cloud service and apply configuration updates automatically.[^cisco]

[^cisco]: Cisco. (n.d.). [*What is Wi-Fi?*](https://www.cisco.com/site/us/en/learn/topics/networking/what-is-wi-fi.html). Cisco.
[^ieee2024]: IEEE Standards Association. (2024). [*IEEE 802.11-2024 — IEEE standard for information technology — Telecommunications and information exchange between systems — Local and metropolitan area networks — Specific requirements — Part 11: Wireless LAN medium access control (MAC) and physical layer (PHY) specifications*](https://standards.ieee.org/ieee/802.11/7028/). IEEE.
[^watech]: Washington State Department of Enterprise Services. (n.d.). [*WiFi definition and meaning*](https://watech.wa.gov/wifi-definition-and-meaning). WaTech.
[^wifialliance]: Wi-Fi Alliance. (n.d.). [*Discover Wi-Fi*](https://www.wi-fi.org/discover-wi-fi). Wi-Fi Alliance.
