---
title: "LAN, WAN, and VLAN"
date: 2026-04-09
draft: false
tags:
  - ethernet
  - protocols
---

A **Local Area Network (LAN)** is a group of devices connected within a geographically limited area — typically a single building or campus — sharing a common Layer 2 broadcast domain over Ethernet. A **Wide Area Network (WAN)** extends connectivity across metropolitan, regional, or global distances by linking separate LANs through carrier-managed, routed infrastructure. A **Virtual Local Area Network (VLAN)** logically partitions a physical LAN into multiple isolated broadcast domains using IEEE 802.1Q frame tagging, without requiring separate physical hardware.[^nistLAN][^nistVLAN] These three constructs operate at different layers of the OSI model and at different scales, yet they interconnect to form the backbone of modern enterprise networking.

Understanding them requires tracing network traffic through its actual mechanisms: how an Ethernet switch learns and forwards frames using MAC addresses, how a WAN router encapsulates packets for transport across a provider backbone, and how a four-byte tag embedded in a standard Ethernet frame creates the boundary between broadcast domains. The relationship between LAN and WAN is fundamentally a boundary between Layer 2 switching and Layer 3 routing; VLANs exist at that same boundary, demanding a router or Layer 3 switch every time traffic must cross from one logical segment to another.

---

## Local Area Networks

### Ethernet framing and the IEEE 802.3 standard

LAN operation is governed by the **IEEE 802.3** standard, which covers Ethernet for speeds from 1 Mb/s to 400 Gb/s under a common **Media Access Control (MAC)** specification.[^ieee2022] Every frame on a LAN follows the same structure. The **preamble** is seven bytes of alternating 0s and 1s (each byte `0xAA`) that allow the receiver to synchronize its clock. The **Start Frame Delimiter (SFD)**, valued at `0xAB`, breaks the preamble pattern and marks the frame's start. The **destination MAC address** and **source MAC address** each occupy six bytes. The **EtherType/Length field** is two bytes: values at or below 1500 (`0x05DC`) indicate payload length in IEEE 802.3 framing; values at or above 1536 (`0x0600`) identify the upper-layer protocol — `0x0800` for IPv4, `0x0806` for ARP, `0x86DD` for IPv6 — in Ethernet II framing. The **payload** ranges from 46 to 1,500 bytes, padded to a 46-byte minimum to satisfy the minimum frame size requirement. The **Frame Check Sequence (FCS)** is a 32-bit CRC computed across the destination, source, type/length, and data fields for error detection.[^ieee2022] The maximum standard frame size is 1,518 bytes excluding preamble and SFD, extending to 1,522 bytes with an 802.1Q VLAN tag.

### MAC addressing

MAC addresses are 48-bit identifiers formally designated **EUI-48** by the IEEE Registration Authority. The first three octets form the **Organizationally Unique Identifier (OUI)**, a globally assigned prefix identifying the manufacturer. The remaining three octets are assigned by the OUI holder, yielding up to 16,777,216 unique addresses per OUI. Two bits in the first octet carry special significance: bit 0 (**I/G**) distinguishes unicast (`0`) from multicast (`1`) addresses, and bit 1 (**U/L**) distinguishes universally administered (`0`) from locally administered (`1`) addresses.[^eastlake2024] The IEEE also assigns smaller blocks — MA-M (28-bit prefix) and MA-S (36-bit prefix) — for organizations with modest address needs. The broadcast address `FF:FF:FF:FF:FF:FF` is delivered to all devices in a broadcast domain.

### Collision domains, broadcast domains, and switching

In half-duplex Ethernet, **Carrier Sense Multiple Access with Collision Detection (CSMA/CD)** governs shared-medium access: a station listens before transmitting; if two stations transmit simultaneously, both detect the collision, cease transmission, emit a 32-bit jam signal, and wait a random backoff period before retrying.[^ieee2022] The 64-byte minimum frame size is a direct consequence of this mechanism — the transmitting station must still be on the wire when a collision propagates back from the farthest endpoint, enforcing the slot-time constraint. Modern full-duplex switched networks eliminate collisions entirely by separating transmit and receive paths.

A **collision domain** is the network segment where simultaneous transmissions can collide. Each port on a switch forms its own collision domain. A **broadcast domain** encompasses all devices that receive a Layer 2 broadcast frame; Layer 3 routers form its boundary, blocking broadcast propagation between interfaces.[^omnisecu] Because protocols like ARP and DHCP rely on broadcasts, oversized broadcast domains generate proportionally more overhead, and unconstrained broadcast storms can saturate bandwidth.

A **switch** operates by maintaining a **MAC address table** (CAM table). When a frame arrives, the switch records the source MAC address and ingress port, refreshing the entry on each subsequent observation with a default aging timer of 300 seconds on Cisco platforms. For forwarding, a known unicast destination is sent only to its mapped port; an unknown unicast is flooded to all ports in the VLAN except the ingress port; broadcasts are flooded to all VLAN ports.[^ciscoCAM] Switches support two forwarding methods. **Store-and-forward** receives the complete frame, verifies the CRC, and discards corrupted, runt, or giant frames before forwarding — the default on Cisco Catalyst platforms. **Cut-through** begins forwarding after reading the destination MAC address (the first six bytes of the frame body), reducing latency at the cost of potentially forwarding corrupted frames, and is common on Cisco Nexus data-center switches where microsecond latency matters.[^wilkins2015]

### Spanning Tree Protocol

Because a switch is functionally a multiport bridge, redundant physical paths in a switched LAN create broadcast loops without a mechanism to suppress them. The **Spanning Tree Protocol (STP)**, defined in IEEE 802.1D, solves this by electing a root bridge — the switch with the lowest Bridge ID (a composite of configurable priority and MAC address) — and then pruning the topology to a loop-free tree. Each non-root switch selects a root port toward the root and each segment selects a designated port; all remaining ports enter a blocking state. Default convergence takes approximately 30 seconds (15 seconds listening, 15 seconds learning). **Rapid STP (IEEE 802.1w)** achieves sub-second convergence through active negotiation with neighbors. **Multiple STP (IEEE 802.1s)** supports distinct spanning trees per VLAN group, preventing one VLAN's topology from constraining another's path choices.[^ciscostp]

---

## Wide Area Networks

### Defining characteristics of a WAN

A WAN interconnects geographically separated networks across metropolitan, regional, national, or global distances using telecommunications carrier infrastructure. Three characteristics technically define a WAN: it connects networks across wide geographic areas; it relies on service provider-owned and -managed transport; and it uses serial or broadband connections between customer premises equipment (CPE) and the provider network.[^ciscowanv6] The enterprise owns and manages the CPE — routers, CSU/DSUs, SD-WAN edge appliances — while the provider manages transmission links, switching infrastructure, and service delivery under a service level agreement. WAN latency ranges from 10 to over 200 milliseconds depending on distance and transport type, compared to sub-millisecond latency typical within a switched LAN.

### WAN link technologies

**Leased lines** are dedicated point-to-point connections provisioned via Time Division Multiplexing. The fundamental unit is the DS0 channel at 64 Kbps. A T1 (DS1) multiplexes 24 DS0 channels for 1.544 Mbps; a T3 (DS3) aggregates 28 T1s for 44.736 Mbps. European equivalents are E1 (2.048 Mbps) and E3 (34.368 Mbps). Layer 2 encapsulation over serial links is typically either **PPP** or Cisco's proprietary HDLC. PPP, specified in RFC 1661, defines a Link Control Protocol for connection establishment, optional authentication via PAP or CHAP, and Network Control Protocols for upper-layer protocol negotiation.[^simpson1994] Cisco's HDLC extends ISO HDLC with a proprietary protocol-type field, making it the default on Cisco serial interfaces but incompatible with non-Cisco equipment.

**Multiprotocol Label Switching (MPLS)**, specified in RFC 3031, makes forwarding decisions based on short fixed-length labels rather than IP addresses.[^rosen2001] When a packet enters the MPLS domain, the ingress **Label Edge Router (LER)** classifies it into a **Forwarding Equivalence Class (FEC)** and imposes a label in a shim header between the Layer 2 and Layer 3 headers. Interior **Label Switch Routers (LSRs)** perform only label swapping — replacing the incoming label with an outgoing label without inspecting the IP header — which is computationally simpler than longest-prefix-match IP lookups. The unidirectional path a labeled packet follows is a **Label Switched Path (LSP)**. Labels are distributed via the **Label Distribution Protocol (LDP)** or, for traffic-engineered paths with bandwidth reservations, RSVP-TE. **Penultimate Hop Popping (PHP)** has the second-to-last router strip the outermost label so the egress LER avoids a redundant lookup. Provider Edge routers maintain separate **VPN Routing and Forwarding (VRF)** tables per customer to isolate traffic across the shared backbone.[^juniperMPLS]

**SD-WAN** applies software-defined networking principles to the wide area, creating a transport-independent overlay across MPLS, broadband, LTE/5G, or satellite links simultaneously. The control plane is centralized in software controllers that manage routing policy and security; WAN edge routers form encrypted **IPsec tunnels** identified by Transport Locators (TLOCs). The **Overlay Management Protocol (OMP)** distributes routing and policy state across the control plane. Traffic steering is application-aware: real-time quality metrics — latency, jitter, and packet loss — are continuously measured per-path, and voice or video traffic is directed to the lowest-latency path while bulk transfers use higher-bandwidth alternatives.[^ciscoswan2024a]

**Broadband WAN** technologies — DSL over copper, cable via DOCSIS (supporting over 1 Gbps on DOCSIS 3.1), and fiber via passive optical networks at symmetrical gigabit speeds — deliver an Ethernet handoff to the CPE router, which establishes WAN connectivity through IPsec VPN tunnels or SD-WAN overlays. NIST SP 800-77 Rev. 1 recommends IPsec VPNs as a cost-effective mechanism for securing data traversing broadband WAN connections as an alternative to private dedicated links.[^barker2020]

### Routing at the WAN edge

Routers connect networks at Layer 3, de-encapsulating frames from one data-link protocol and re-encapsulating for another at each interface. Two routing protocols dominate WAN environments. **BGP (RFC 4271)** is a path-vector protocol that exchanges Network Layer Reachability Information between autonomous systems, making decisions primarily on the **AS_PATH** attribute — the sequence of autonomous systems a route traverses — enabling policy-based routing and loop prevention.[^rekhter2006] **OSPF (RFC 2328)** is a link-state Interior Gateway Protocol where each router maintains an identical link-state database and computes loop-free shortest-path trees via Dijkstra's algorithm; OSPF commonly runs between MPLS PE and P routers to establish paths toward BGP next-hops.[^moy1998]

The WAN edge router also performs Network Address Translation (NAT), translating RFC 1918 private addresses to public routable addresses, enforces access control lists and firewall policy, and applies QoS markings to prioritize traffic as it exits the LAN onto the WAN link.

---

## Virtual Local Area Networks

### How VLANs work

A VLAN is a logical partition of a physical LAN that creates an independent broadcast domain without requiring separate physical infrastructure. Frames originating and destined within the same VLAN are forwarded entirely within that VLAN; traffic destined for another VLAN must be explicitly routed at Layer 3.[^juniperVLAN] This decouples logical topology from physical location, enabling devices to be grouped by function or department regardless of which switch port or building they occupy. Broadcast traffic is confined to the VLAN boundary, reducing aggregate broadcast load; security is improved by preventing devices in separate VLANs from communicating without passing through a firewall or router.

### IEEE 802.1Q tagging

The mechanism underpinning VLANs is **IEEE 802.1Q**, which inserts a four-byte tag between the source MAC address and the EtherType/Length field of a standard Ethernet frame. The tag has two components. The **Tag Protocol Identifier (TPID)** is a fixed 16-bit value of `0x8100` that identifies the frame as 802.1Q-tagged; it occupies the same byte position as EtherType in untagged frames, allowing switches to distinguish tagged from untagged traffic at a glance. The **Tag Control Information (TCI)** fills the remaining 16 bits and contains three sub-fields: the **Priority Code Point (PCP)** (3 bits, mapping to IEEE 802.1p QoS priority levels 0–7), the **Drop Eligible Indicator (DEI)** (1 bit, signaling whether the frame may be discarded under congestion), and the **VLAN Identifier (VID)** (12 bits, specifying the VLAN). The 12-bit VID provides values 0–4095, but VID 0 designates a priority-only tag and VID 4095 is reserved, leaving a usable range of **1–4,094 distinct VLANs**. Because the tag modifies the frame, the FCS is recalculated, and the IEEE 802.3ac amendment increased the maximum Ethernet frame size from 1,518 to 1,522 bytes to accommodate it.[^ciscoMeraki]

### Access ports, trunk ports, and the native VLAN

An **access port** belongs to a single VLAN and connects end devices such as workstations and servers. The switch internally tags inbound frames with the port's assigned VLAN ID and strips the tag before forwarding frames outbound, so end devices handle only standard untagged Ethernet — they have no awareness of VLANs. A **trunk port** carries tagged traffic for multiple VLANs over a single physical link, preserving 802.1Q tags across switch-to-switch and switch-to-router connections. By default, all VLANs (1–4094) are permitted on a trunk, though the allowed VLAN list is commonly restricted administratively.[^ciscotrunks]

The **native VLAN** is a designated VLAN on an 802.1Q trunk for which frames are transmitted untagged; any untagged frame arriving on the trunk is assigned to the native VLAN. The native VLAN defaults to VLAN 1 and must match on both ends of a trunk link — a mismatch causes traffic to be delivered to the wrong VLAN, and a deliberate mismatch is the basis of the double-tagging VLAN-hopping attack.[^ciscovlantrunk] Best practice is to change the native VLAN to an unused VLAN ID and to statically configure trunk ports while disabling Cisco's Dynamic Trunking Protocol (DTP) with the `nonegotiate` command.

### Inter-VLAN routing

Because each VLAN is an isolated broadcast domain, traffic crossing VLAN boundaries requires Layer 3 routing. The **router-on-a-stick** method uses a single router interface connected to a switch trunk port, with software subinterfaces configured per VLAN using the `encapsulation dot1Q <VID>` command. Tagged traffic arriving at the router is dispatched to the appropriate subinterface, routed, and returned on the destination VLAN's subinterface. This approach is simple but the single physical uplink is a bandwidth bottleneck beyond approximately 50 VLANs.[^ciscointerVLAN]

The standard enterprise approach uses **Layer 3 switches with Switched Virtual Interfaces (SVIs)**. An SVI is a virtual interface created for each VLAN requiring routing, assigned an IP address that serves as the VLAN's default gateway. When a host in VLAN 10 sends a packet to a host in VLAN 20, the Layer 3 switch receives the frame on the VLAN 10 SVI, performs a routing lookup, rewrites the Layer 2 header with the destination's MAC address, and forwards the frame out the VLAN 20 port — all in hardware ASICs at line rate. Juniper Networks implements the equivalent as **Routed VLAN Interfaces (RVIs)** on EX Series switches.[^juniperRVI]

---

## Extending VLANs across provider and data-center networks

### VLAN Trunking Protocol

Cisco's proprietary **VLAN Trunking Protocol (VTP)** maintains VLAN database consistency across a switched domain. In server mode, a switch propagates VLAN configuration changes to client-mode switches via VTP advertisements sent to the multicast address `01:00:0C:CC:CC:CC`. **VTP pruning** restricts broadcast flooding to only those trunk links where a VLAN has active ports, reducing unnecessary broadcast traffic across inter-switch links.[^ciscovtp]

### Q-in-Q (IEEE 802.1ad)

**IEEE 802.1ad**, known as **Q-in-Q**, addresses the problem of carrying customer-tagged VLAN traffic across a service provider network without exposing or conflicting with provider infrastructure VLANs. A provider edge switch adds an outer **Service Tag (S-Tag)** with TPID `0x88A8` to already-tagged customer frames, creating double-tagged frames. Different customers are assigned different S-VLANs, isolating their traffic through the provider backbone. The theoretical address space expands to 4,094 × 4,094 ≈ 16.7 million unique combinations. At the provider egress, the S-Tag is stripped, restoring the original customer frame transparently.

### VXLAN

**Virtual Extensible LAN (VXLAN)**, specified in RFC 7348, encapsulates complete Ethernet frames inside UDP datagrams for transport across IP networks, overcoming the fundamental 4,094-VLAN ceiling of 802.1Q.[^mahalingam2014] VXLAN uses a **24-bit VXLAN Network Identifier (VNI)**, supporting approximately 16 million logical segments — a scale that enables large multi-tenant cloud and data-center environments. The destination UDP port is **4789**. **VXLAN Tunnel Endpoints (VTEPs)** originate and terminate tunnels at the hypervisor or physical switch level; gateways map VLAN IDs to VNIs for interoperability between VXLAN overlays and traditional VLAN-based segments.

---

## OSI layer relationships and architectural summary

The three constructs map cleanly to the OSI model. A LAN is a Layer 2 construct — a single broadcast domain where Ethernet switches forward frames based on MAC addresses. A WAN is a Layer 3 construct — routers exchange IP prefixes via BGP and OSPF and forward packets across provider-managed MPLS or SD-WAN overlays. A VLAN spans the Layer 2/Layer 3 boundary — it is created by Layer 2 switching but requires Layer 3 routing via SVIs or router subinterfaces for inter-VLAN communication.

| | LAN | WAN | VLAN |
|---|---|---|---|
| **OSI layer** | Layer 2 (data link) | Layer 3 (network) | Layer 2, with Layer 3 for routing |
| **Addressing** | MAC (48-bit EUI-48) | IP (32-bit or 128-bit) | VID (12-bit, within MAC frame) |
| **Forwarding device** | Switch / bridge | Router | Switch + Layer 3 SVI or router |
| **Scope** | Building / campus | Geographic / global | Logical, hardware-independent |
| **Broadcast boundary** | All switch ports (same VLAN) | Blocked at router | Per VLAN |
| **Max segments** | 1 per physical domain | Unlimited (routed) | 4,094 (802.1Q); ~16M (VXLAN) |

The WAN edge router and the inter-VLAN routing function share the same essential role: they are the controlled crossing points where Layer 2 broadcast domains end and Layer 3 routing begins. VXLAN's 24-bit VNI and SD-WAN's application-aware overlay model both represent the same underlying trajectory — decoupling logical network segments from physical topology and scaling beyond the constraints of any single hardware-based addressing scheme.

[^barker2020]: Barker, E., Dang, Q., Frankel, S., Scarfone, K., & Wouters, P. (2020). [*Guide to IPsec VPNs*](https://csrc.nist.gov/pubs/sp/800/77/r1/final) (NIST Special Publication 800-77, Revision 1). National Institute of Standards and Technology.
[^ciscoswan2024a]: Cisco Systems. (2024, December 19). [*Cisco Catalyst SD-WAN getting started guide: The Cisco Catalyst SD-WAN solution*](https://www.cisco.com/c/en/us/td/docs/routers/sdwan/configuration/sdwan-xe-gs-book/system-overview.html). Cisco Systems.
[^ciscoCAM]: Cisco Networking Academy. (2020). The MAC address table. In *Introduction to networks companion guide (CCNAv7)*. [Cisco Press](https://www.ciscopress.com/articles/article.asp?p=3089352&seqNum=6).
[^ciscointerVLAN]: Cisco Networking Academy. (2020). Inter-VLAN routing using Layer 3 switches. In *Switching, routing, and wireless essentials companion guide (CCNAv7)*. [Cisco Press](https://www.ciscopress.com/articles/article.asp?p=3089357&seqNum=6).
[^ciscoMeraki]: Cisco Meraki. (n.d.). [*Fundamentals of 802.1Q VLAN tagging*](https://documentation.meraki.com/Platform_Management/Dashboard_Administration/Design_and_Configure/Configuration_Guides/Routing_and_Firewall/Fundamentals_of_802.1Q_VLAN_Tagging). Cisco Meraki Documentation.
[^ciscostp]: Cisco Systems. (n.d.). [*Configuring Spanning Tree Protocol*](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9200/software/release/16-12/configuration_guide/lyr2/b_1612_lyr2_9200_cg/configuring_spanning_tree_protocol.html). Layer 2 configuration guide, IOS XE Gibraltar 16.12.x (Catalyst 9200). Cisco Systems.
[^ciscotrunks]: Cisco Systems. (n.d.). [*Configuring access and trunk interfaces*](https://www.cisco.com/en/US/docs/switches/datacenter/nexus5000/sw/configuration/nxos/Cisco_Nexus_5000_Series_NX-OS_Software_Configuration_Guide_chapter9.pdf). Cisco Nexus 5000 Series NX-OS software configuration guide. Cisco Systems.
[^ciscovlantrunk]: Cisco Systems. (n.d.). [*Configuring VLAN trunks*](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst3850/software/release/3se/vlan/configuration_guide/b_vlan_3se_3850_cg/b_vlan_3se_3850_cg_chapter_0110.html). VLAN configuration guide, Cisco IOS XE Release 3SE (Catalyst 3850). Cisco Systems.
[^ciscovtp]: Cisco Systems. (2025, April 2). [*Understand VLAN Trunk Protocol (VTP)*](https://www.cisco.com/c/en/us/support/docs/lan-switching/vtp/10558-21.html). Cisco Systems.
[^ciscowanv6]: Cisco Networking Academy. (2017). WAN concepts. In *Connecting networks v6 companion guide*. [Cisco Press](https://www.ciscopress.com/articles/article.asp?p=2832405&seqNum=4).
[^eastlake2024]: Eastlake, D., III, Abley, J., & Li, Y. (2024). [*IANA considerations and IETF protocol and documentation usage for IEEE 802 parameters*](https://www.rfc-editor.org/rfc/rfc9542.html) (RFC 9542, BCP 141). Internet Engineering Task Force.
[^ieee2022]: IEEE. (2022). *IEEE 802.3-2022 — IEEE standard for Ethernet*. [IEEE Standards Association](https://ieeexplore.ieee.org/document/9844436).
[^juniperMPLS]: Juniper Networks. (n.d.). [*MPLS overview*](https://www.juniper.net/documentation/us/en/software/junos/mpls/topics/topic-map/mpls-overview.html). Junos OS documentation. Juniper Networks.
[^juniperRVI]: Juniper Networks. (n.d.). [*Configuring routed VLAN interfaces (CLI procedure)*](https://www.juniper.net/documentation/en_US/junos12.2/topics/task/configuration/bridging-routed-vlan-interfaces-ex-series-cli.html). EX Series technical documentation. Juniper Networks.
[^juniperVLAN]: Juniper Networks. (n.d.). [*Understanding VLANs*](https://www.juniper.net/documentation/en_US/junos12.1x46/topics/concept/layer-2-vlan-security-understanding.html). Junos OS technical documentation. Juniper Networks.
[^mahalingam2014]: Mahalingam, M., Dutt, D., Duda, K., Agarwal, P., Kreeger, L., Sridhar, T., Bursell, M., & Wright, C. (2014). [*Virtual eXtensible Local Area Network (VXLAN): A framework for overlaying virtualized Layer 2 networks over Layer 3 networks*](https://www.rfc-editor.org/rfc/rfc7348) (RFC 7348). Internet Engineering Task Force.
[^moy1998]: Moy, J. (1998). [*OSPF version 2*](https://datatracker.ietf.org/doc/html/rfc2328) (RFC 2328, STD 54). Internet Engineering Task Force.
[^nistLAN]: National Institute of Standards and Technology. (n.d.). [*Local area network (LAN)*](https://csrc.nist.gov/glossary/term/Local_Area_Network). NIST Computer Security Resource Center Glossary.
[^nistVLAN]: National Institute of Standards and Technology. (n.d.). [*Virtual local area network*](https://csrc.nist.gov/glossary/term/virtual_local_area_network). NIST Computer Security Resource Center Glossary.
[^omnisecu]: OmniSecu. (n.d.). [*What are collision domain and broadcast domain*](https://www.omnisecu.com/cisco-certified-network-associate-ccna/what-are-collision-domain-and-broadcast-domain.php). OmniSecu Networking.
[^rekhter2006]: Rekhter, Y., Li, T., & Hares, S. (Eds.). (2006). [*A Border Gateway Protocol 4 (BGP-4)*](https://datatracker.ietf.org/doc/html/rfc4271) (RFC 4271). Internet Engineering Task Force.
[^rosen2001]: Rosen, E., Viswanathan, A., & Callon, R. (2001). [*Multiprotocol Label Switching architecture*](https://datatracker.ietf.org/doc/html/rfc3031) (RFC 3031). Internet Engineering Task Force.
[^simpson1994]: Simpson, W. (Ed.). (1994). [*The Point-to-Point Protocol (PPP)*](https://www.rfc-editor.org/rfc/rfc1661.html) (RFC 1661, STD 51). Internet Engineering Task Force.
[^wilkins2015]: Wilkins, S. (2015, July 28). [Network switching methods: Store-and-forward versus cut-through](https://www.ciscopress.com/articles/article.asp?p=2420611). *Cisco Press*.
