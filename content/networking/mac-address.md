---
title: "MAC Address"
date: 2026-03-21
updated: 2026-03-19
draft: false
tags:
  - hardware
  - networking
---

A **Media Access Control (MAC) address** is a 48-bit hardware identifier assigned to a network interface controller (NIC) that enables device-to-device communication within a local network segment. Standardized by the IEEE under the 802 family of specifications and formally designated as an **EUI-48** (Extended Unique Identifier, 48-bit) identifier, a MAC address serves as the Layer 2 (data link) address used by Ethernet, Wi-Fi, and Bluetooth hardware[^ieeeRA]. While IP addresses handle end-to-end routing across the internet, MAC addresses handle the final hop — delivering a frame to the correct physical or logical device on the same broadcast domain[^pittIT].

The distinction matters because the two addressing schemes operate at fundamentally different layers of the OSI model. An IP address changes depending on the network a device joins; a MAC address is typically burned into the NIC's firmware at the factory and persists across reboots and operating system reinstalls. Every device with multiple network interfaces — say, one Ethernet port and one Wi-Fi adapter — carries a separate MAC address for each, because each interface is a distinct point of attachment to the network[^netgear].

## Architecture and structure

A MAC address consists of six bytes (48 bits), rendered as twelve hexadecimal digits. Three notation formats are in common use, all representing the same underlying value:

| Format | Example | Common context |
|---|---|---|
| Colon-separated | `00:1A:2B:3C:4D:5E` | Linux, macOS, most documentation |
| Hyphen-separated | `00-1A-2B-3C-4D-5E` | Windows, IEEE official notation |
| Dot-separated (groups of four) | `001A.2B3C.4D5E` | Cisco IOS |

The six bytes split into two equal halves. The first three bytes form the **Organizationally Unique Identifier (OUI)**, assigned by the IEEE Registration Authority to a specific hardware manufacturer — for example, the OUI `00:60:2F` belongs to Cisco. The second three bytes are the **NIC-specific extension**, assigned by the manufacturer to uniquely identify an individual device. Because three bytes can encode 2²⁴ (16,777,216) distinct values, each OUI holder can produce up to roughly 16.7 million uniquely addressed devices per block[^ieeeRA].

Two bits within the first octet carry special semantic weight. The least significant bit — called the **I/G bit** (Individual/Group) — distinguishes unicast addresses (0) from multicast addresses (1). The second least significant bit — the **U/L bit** (Universal/Local) — signals whether the address is globally unique as assigned by the IEEE (0) or locally administered by software (1). All manufacturer-assigned OUIs have both bits set to zero. When an operating system generates a randomized MAC address for privacy purposes, it sets the U/L bit to 1 to signal that the address is not an IEEE-assigned value[^ieeeRA].

The IEEE Registration Authority now issues MAC address blocks in three tiers. The traditional **MA-L** block (the OUI) provides approximately 16 million addresses; **MA-M** provides roughly 1 million addresses using a 28-bit prefix; and **MA-S** provides 4,096 addresses using a 36-bit prefix. Organizations must demonstrate 95% utilization of an existing block before receiving an additional allocation. At current consumption rates, the IEEE projects the EUI-48 space will remain sufficient until approximately 2080.

A 64-bit variant, **EUI-64**, extends the format for use in IEEE 802.15.4 and IPv6 stateless address autoconfiguration (SLAAC). An EUI-48 address maps to EUI-64 by inserting the 16-bit value `0xFFFE` between the OUI and the extension identifier. IPv6's modified EUI-64, specified in RFC 4291, also inverts the U/L bit — a convention that simplifies manual entry of link-local addresses[^catchpoint].

## MAC addresses versus IP addresses

The clearest way to understand MAC addresses is to contrast them with IP addresses across the OSI stack.

| Characteristic | MAC address | IP address |
|---|---|---|
| OSI layer | Layer 2 (Data Link) | Layer 3 (Network) |
| Length | 48 bits (EUI-48) | 32 bits (IPv4) or 128 bits (IPv6) |
| Assignment | Burned in by manufacturer | Assigned via DHCP or static config |
| Scope | Local broadcast domain only | Globally routable |
| Persistence | Generally permanent (absent spoofing) | Changes with network or location |
| Primary function | Identifies the next-hop device on the local link | Identifies end-to-end source and destination |

The critical operational difference is that IP addresses remain constant from source to destination across the internet (barring NAT), while MAC addresses are rewritten at every router hop. When a packet travels from Host A to Host B through three routers, the IP header always reads "from A to B," but the Ethernet frame header is rebuilt at each router — first addressed to Router 1's MAC, then Router 2's, then ultimately Host B's[^pittIT]. The analogy is instructive: an IP address behaves like a postal destination that stays the same throughout a letter's journey, while a MAC address behaves like the hand-off tag attached by each courier responsible for the next physical leg of delivery.

## Address Resolution Protocol (ARP) and frame delivery

Because a device cannot construct an Ethernet frame without knowing the destination's MAC address, and cannot know that MAC address from an IP address alone, a resolution step is required. The **Address Resolution Protocol (ARP)**, defined in RFC 826, bridges this gap[^plummer1982]. ARP is triggered whenever a device needs to send an IP packet to another device on the same subnet but has no cached MAC-to-IP mapping.

The exchange proceeds as follows:

1. The source device checks its local ARP cache for an existing IP-to-MAC mapping.
2. If none exists, it broadcasts an ARP Request packet — destination MAC `FF:FF:FF:FF:FF:FF`, EtherType `0x0806` — asking "who has IP address X.X.X.X?"
3. Every device on the segment receives the broadcast. Only the device with the matching IP address replies with a unicast ARP Reply containing its MAC address.
4. The source device caches the mapping (typically for 2–20 minutes depending on the OS) and constructs the Ethernet frame.
5. Other devices that receive the broadcast passively update their own caches with the sender's IP-to-MAC mapping, reducing future broadcast traffic.

The ARP packet itself is 28 bytes for IPv4-over-Ethernet, carrying fields for hardware type (`0x0001` for Ethernet), protocol type (`0x0800` for IPv4), address lengths, opcode (1 for request, 2 for reply), and four address fields: sender hardware address (SHA), sender protocol address (SPA), target hardware address (THA), and target protocol address (TPA)[^netgearDocs].

Ethernet II frames wrap this process. Each frame carries a 6-byte destination MAC, 6-byte source MAC, 2-byte EtherType, a payload of 46–1,500 bytes, and a 4-byte frame check sequence (CRC-32). Frames shorter than 64 bytes are "runts" and discarded by receiving NICs.

Layer 2 switches make forwarding decisions using a **MAC address table** (also called a CAM table, for Content Addressable Memory). Switches learn dynamically: when a frame arrives, the switch records the source MAC and the port it arrived on. When the destination MAC matches a table entry, the switch forwards the frame only to that port — conserving bandwidth compared to a hub. Unknown unicast destinations trigger flooding to all ports except the ingress. Broadcast frames are always flooded. MAC address table entries age out after 5 minutes by default on Cisco Catalyst switches[^cisco].

For IPv6, **Neighbor Discovery Protocol (NDP)** replaces ARP entirely. Defined in RFC 4861, NDP uses ICMPv6 Neighbor Solicitation and Neighbor Advertisement messages addressed to solicited-node multicast addresses rather than broadcast, making it more efficient than ARP's segment-wide broadcasts[^narten2007]. NDP also consolidates router discovery, duplicate address detection, and neighbor unreachability detection into a single protocol.

## Unicast, multicast, and broadcast

The I/G bit in the first octet determines delivery semantics for any given MAC address.

**Unicast** addresses (I/G = 0) identify a single interface. The overwhelming majority of network traffic uses unicast: one sender, one receiver, one path through the switch fabric.

**Multicast** addresses (I/G = 1) target a group. IEEE reserves the OUI `01:00:5E` for IPv4 multicast, mapping the lower 23 bits of the IPv4 multicast group address into the range `01:00:5E:00:00:00`–`01:00:5E:7F:FF:FF`. IPv6 multicast uses the prefix `33:33`, with the final 32 bits derived from the IPv6 multicast address. Without IGMP snooping, switches flood multicast frames to every port in the VLAN.

The **broadcast address** `FF:FF:FF:FF:FF:FF` — all bits set — is technically a multicast address where every device is a member. ARP requests, DHCP discovery messages, and other network-critical protocols rely on it. Routers do not forward broadcasts, which is why a broadcast domain is bounded by the router's interfaces and not the physical network's extent.

## Spoofing, security, and privacy

MAC address spoofing — substituting a software-defined value for the burned-in address — is trivially easy on every major operating system. On Linux, the interface address can be changed with a single command:

```bash
ip link set dev eth0 address 00:11:22:33:44:55
```

On Windows, the same result is achievable through the Network Adapter Properties dialog or via a registry edit. The hardware BIA is unchanged; only the address presented to the network is overridden.

Legitimate uses include privacy protection on untrusted networks, network testing, and hot-failover configurations where a standby device must assume the primary device's MAC address without requiring upstream switches to relearn topology. Malicious uses are well-documented: attackers spoof MAC addresses to bypass MAC-based access controls, execute man-in-the-middle attacks via ARP cache poisoning, and impersonate legitimate devices.

Countermeasures exist at the switch level. Cisco's Dynamic ARP Inspection (DAI) validates ARP packets against a trusted DHCP snooping binding table. Port security features limit which MAC addresses — and how many — may appear on a given switch port[^cisco]. IEEE 802.1X port-based network access control provides a stronger authentication layer, requiring cryptographic credentials rather than relying on MAC addresses alone.

**MAC address randomization** has emerged as the primary privacy response to passive tracking. When Wi-Fi is enabled, devices broadcast probe requests containing their real MAC address even before associating with any network, enabling tracking of individuals through retail spaces and public areas. Apple introduced probe-request randomization in iOS 8 (2014) and expanded to per-network randomized addresses enabled by default in iOS 14 (2020). Android 10 (2019) enabled per-SSID randomization by default. Windows 10 and 11 offer an optional random hardware address feature, using a hash of a secret key, the SSID, and a connection identifier to generate stable-but-private addresses.

When the operating system generates these randomized addresses, it sets the U/L bit to 1, identifying the address as locally administered. IEEE 802c-2017 introduced the **Structured Local Address Plan (SLAP)**, which organizes the locally administered address space into four quadrants to bring order to the proliferating use of software-assigned addresses.

The IETF's MADINAS working group coordinates the broader technical response across the IEEE and IETF. RFC 9724 (2025) provides a comprehensive survey of randomized and changing MAC address practices, while RFC 9797 examines the impact on network services such as DHCP lease management and captive portal detection[^huitema2025]. The working group acknowledges that even persistent MAC randomization is insufficient to prevent fingerprinting by sophisticated adversaries who can correlate traffic patterns, packet timing, and other observable characteristics.

## Relevant standards

MAC addressing rests on a layered foundation of IEEE and IETF standards. The IEEE 802 family governs local and metropolitan area networks, with **IEEE 802.3** specifying Ethernet frame format and MAC behavior, and **IEEE 802.11** governing wireless LANs. The IEEE Registration Authority administers the global OUI and MAC address block assignments under these standards.

On the IETF side, **RFC 826** (1982) defines ARP; **RFC 4861** (2007) defines IPv6 Neighbor Discovery; **RFC 5227** (2008) covers IPv4 address conflict detection via ARP; and **RFC 9542** (2024) is the current Best Current Practice document governing IANA considerations for IEEE 802 parameters, obsoleting RFC 7042[^eastlakeAbley2024]. For privacy, **IEEE 802E-2020** establishes a privacy threat model for 802 technologies, and active projects **IEEE P802.11bh** and **P802.11bi** address the operational implications of MAC randomization in Wi-Fi networks. **IEEE 802.1AEdk-2023** extends MACsec with MAC Privacy Protection, reducing external observers' ability to correlate encrypted traffic with specific devices at the hardware level.

[^catchpoint]: Catchpoint. (n.d.). *How EUI-64 works in IPv6*. https://www.catchpoint.com/benefits-of-ipv6/eui-64

[^cisco]: Cisco. (n.d.). *Configuring MAC address tables*. https://www.cisco.com/c/en/us/td/docs/switches/datacenter/nexus3548/sw/layer_2_switching/60x/b_Cisco_N3548_Layer_2_Switching_Config_602_A1_1/b_Cisco_N3548_Layer_2_Switching_Config_602_A1_1_chapter_01001.pdf

[^eastlakeAbley2024]: Eastlake, D., & Abley, J. (2024). *IANA considerations and IETF protocol and documentation usage for IEEE 802 parameters* (RFC 9542). IETF. https://datatracker.ietf.org/doc/rfc9542/

[^huitema2025]: Huitema, C., Bernardos, C. J., Voyer, D., Krishnan, S., & Arkko, J. (2025). *State of affairs for randomized and changing media access control (MAC) addresses* (RFC 9724). IETF. https://datatracker.ietf.org/doc/rfc9724/

[^ieeeRA]: IEEE Registration Authority. (n.d.). *IEEE RA guidelines for use of EUI, OUI, and CID*. IEEE. https://standards.ieee.org/wp-content/uploads/import/documents/tutorials/eui.pdf

[^narten2007]: Narten, T., Nordmark, E., Simpson, W., & Soliman, H. (2007). *Neighbor discovery for IP version 6 (IPv6)* (RFC 4861). IETF. https://datatracker.ietf.org/doc/html/rfc4861

[^netgear]: NETGEAR. (n.d.). *MAC address guide: How to identify devices on your network*. https://www.netgear.com/hub/network/what-is-mac-address/

[^netgearDocs]: Netgear Documentation. (n.d.). *Media Access Control (MAC) addresses and Address Resolution Protocol*. http://documentation.netgear.com/reference/esp/tcpip/TCPIPBasics-3-11.html

[^pittIT]: University of Pittsburgh IT. (n.d.). *Understanding MAC addresses: A beginner's guide*. University of Pittsburgh. https://services.pitt.edu/TDClient/33/Portal/KB/ArticleDet?ID=1773

[^plummer1982]: Plummer, D. C. (1982). *An Ethernet address resolution protocol: Or converting network protocol addresses to 48.bit Ethernet address for transmission on Ethernet hardware* (RFC 826). IETF. https://datatracker.ietf.org/doc/html/rfc826
