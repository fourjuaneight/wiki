---
title: "Switches"
date: 2026-03-22
draft: false
tags:
  - hardware
  - networking
  - security
---

A **network switch** is a hardware device that connects multiple devices within a local area network (LAN) and forwards data frames between them based on hardware addresses. Unlike a router, which operates between networks, a switch operates *within* a network — its job is to move frames from one port to another as efficiently and accurately as possible. Switches replaced the older hub as the dominant LAN interconnect device because hubs broadcast every incoming frame to all ports regardless of destination, wasting bandwidth and creating collision domains that degrade sharply as the network grows. A switch eliminates this by learning which device lives on which port and forwarding frames only where they need to go.[^tanenbaum2011]

The transition from hubs to switches in the 1990s was one of the more consequential infrastructure shifts in LAN design. It moved Ethernet from a shared-medium model — where all devices competed for the same wire — to a switched model where each port gets a dedicated, full-duplex link. This change effectively made collisions a non-issue on modern wired networks and allowed bandwidth to scale linearly with the number of ports rather than being divided among them.

## Frame forwarding and the MAC address table

The mechanism at the heart of every Layer 2 switch is the **MAC address table**, sometimes called the Content Addressable Memory (CAM) table. When a frame arrives on a port, the switch reads the source MAC address and records it alongside the incoming port number. This is the *learning* phase. The switch then looks up the destination MAC address in the same table:

- If the destination is known, the frame is forwarded only to the matching port — this is called *unicast forwarding*.
- If the destination is unknown, the frame is flooded to all ports except the one it arrived on, and the switch waits to learn the destination's location from a future reply.
- If the destination port matches the source port, the frame is discarded — *filtering* — since the destination is already reachable on the same segment.

Entries in the MAC address table expire after an idle timeout (typically 300 seconds) to accommodate devices that move between ports or leave the network.[^cisco_nd] This process — learn, lookup, forward/flood/filter — happens entirely in hardware on modern switches at wire speed, with forwarding decisions measured in microseconds.

## Switching methods

Three forwarding modes trade latency against error detection:

| Method | When forwarding begins | CRC error check |
|---|---|---|
| **Store-and-forward** | After the entire frame is received | Yes — frames with errors are dropped |
| **Cut-through** | After reading only the destination MAC (first 14 bytes) | No |
| **Fragment-free** | After reading the first 64 bytes | Partial — catches most collision fragments |

Store-and-forward is the safest and most common mode in enterprise switches because it prevents corrupt frames from propagating through the network. Cut-through minimizes latency and is common in high-frequency trading and other latency-sensitive environments where the upstream link quality is trusted. Fragment-free is a historical compromise that targets the most common error type on older half-duplex Ethernet.[^forouzan2012]

## Layer 2 vs. Layer 3 switches

Standard switches operate at **Layer 2** of the OSI model and are concerned only with MAC addresses. They are unaware of IP addresses or routing tables; every forwarding decision is made on hardware addresses alone. A **Layer 3 switch** — also called a multilayer switch — adds IP routing capabilities to the same hardware. It can forward packets between different subnets without requiring a separate router, which is common in campus networks where inter-VLAN routing needs to happen at high throughput. The practical distinction is that Layer 3 switches perform routing in dedicated silicon (ASICs), making them significantly faster than a general-purpose software router for traffic that stays within the same campus infrastructure.[^tanenbaum2011]

## Switch types and management

Switches are commonly categorized by how much control they expose to an administrator:

- **Unmanaged switches** operate entirely plug-and-play. No configuration is possible; they simply forward frames using their default behavior. Suitable for small offices or extending desktop connectivity.
- **Smart switches** (also called web-managed or lightly managed) expose a subset of features — typically VLAN configuration and port monitoring — through a web interface. They occupy a practical middle ground for smaller deployments that need some segmentation without the operational overhead of a fully managed device.
- **Managed switches** provide complete control via CLI, SNMP, and/or a web interface. They support the full feature set described below and are standard in any enterprise or data center environment.[^cloudflare_nd]

## Key capabilities

### VLANs

A **VLAN** (Virtual LAN) partitions a switch's ports into isolated broadcast domains without requiring physical separation. Traffic within a VLAN is kept separate from other VLANs at Layer 2; inter-VLAN communication requires routing (either through a router or a Layer 3 switch). VLANs are the primary tool for network segmentation — separating guest wireless traffic from corporate traffic, isolating voice from data, or confining IoT devices to their own segment.

### Spanning Tree Protocol

In any loop-free topology, a single switch failure can sever network segments. Network engineers therefore introduce redundant physical links, which creates switching loops: because switches flood unknown frames to all ports, a frame can circulate indefinitely between switches that share multiple paths. **Spanning Tree Protocol** (STP), defined in IEEE 802.1D, solves this by electing a root bridge and logically blocking redundant links so the active topology is loop-free. Blocked links are ready to activate automatically if an active path fails. Rapid STP (IEEE 802.1w) reduces reconvergence time from tens of seconds to under a second for most topologies.

### Power over Ethernet

**Power over Ethernet** (PoE), defined in IEEE 802.3af/at/bt, allows a switch to deliver DC power over standard Ethernet cabling to connected devices — IP phones, wireless access points, security cameras, and similar equipment. This eliminates the need for a separate power supply at each endpoint and is standard in modern managed switch deployments.

### Link aggregation

**Link aggregation** (IEEE 802.3ad / LACP) combines multiple physical ports into a single logical bundle between two devices. The result is both increased aggregate bandwidth and redundancy: if one physical link fails, traffic redistributes across the remaining links without loss of connectivity. It is commonly used between access and distribution switches, or between a switch and a server with multiple NICs.

## Switches in network topology

In hierarchical enterprise design, switches are arranged in three tiers: *access* switches where end devices connect, *distribution* switches that aggregate access-layer uplinks and enforce policy, and *core* switches that provide high-speed backbone interconnect. In smaller environments this collapses to two tiers or even a single flat layer. Data center networks increasingly use **spine-leaf** topologies, where every leaf switch has a direct link to every spine switch, providing predictable latency and east-west traffic scalability that three-tier hierarchies cannot easily offer.

[^cisco_nd]: Cisco. (n.d.). [*How does a network switch work?*](https://www.cisco.com/site/us/en/learn/topics/small-business/network-switch-how.html) Cisco Systems, Inc.

[^cloudflare_nd]: Cloudflare. (n.d.). [*What is a network switch?*](https://www.cloudflare.com/learning/network-layer/what-is-a-network-switch/) Cloudflare, Inc.

[^forouzan2012]: Forouzan, B. A. (2012). *Data communications and networking* (5th ed.). McGraw-Hill.

[^tanenbaum2011]: Tanenbaum, A. S., & Wetherall, D. J. (2011). *Computer networks* (5th ed.). Pearson Education.
