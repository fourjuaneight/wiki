---
title: "Routers"
date: 2026-03-22
draft: false
tags:
  - hardware
  - networking
  - protocols
  - security
---

A **router** is a networking device that forwards data packets between computer networks by inspecting destination IP addresses and selecting optimal transmission paths. Operating at Layer 3 (the Network Layer) of the OSI model, routers make forwarding decisions based on logical addressing rather than the physical MAC addresses used by switches at Layer 2. Every time data crosses a network boundary — from a home LAN to an ISP, from one corporate campus to another, or between autonomous systems on the public internet — a router is making the decision about where that data goes next.[^cisco-what]

Routers are distinct from the simpler devices they are often confused with. A **modem** modulates and demodulates signals to connect a local network to an ISP's infrastructure. A **switch** forwards frames within a single broadcast domain using MAC addresses. A router connects these separate domains together, translating between them and enforcing boundaries. Many consumer "routers" are actually combination devices that bundle a modem, router, switch, wireless access point, and firewall into a single chassis, which blurs the distinctions but does not eliminate them.

## How routers work

### Packet forwarding

When a router receives a packet on one of its interfaces, it reads the destination IP address from the packet header and searches its **routing table** — a lookup database of known network paths stored in memory. Each entry in the table maps a destination network prefix to a next-hop address or outgoing interface. If multiple routes to the same destination exist, the router selects the one with the lowest **metric value**, a numerical score that reflects path cost based on factors like hop count, bandwidth, or delay.[^cisco-how]

Think of a router as a postal sorting facility. Each incoming letter (packet) has a destination address. The facility does not deliver the letter itself; it determines which truck (next hop) gets it closest to the final address, then hands it off. This process repeats at each facility along the way until the letter arrives.

### Routing tables

Routing tables can be populated in three ways. **Static routes** are manually configured by an administrator and do not change unless explicitly modified — useful for small, predictable topologies. **Dynamic routes** are learned automatically through routing protocols (see below), which allow routers to adapt to topology changes such as link failures. **Default routes** serve as catch-all entries that handle traffic when no more specific match exists, typically pointing toward an upstream gateway or the internet.

### Control plane and data plane

Internally, a router's work divides into two logical planes. The **control plane** runs routing protocols, exchanges topology information with neighboring routers, and builds the routing table. It operates in software and is concerned with *deciding* where packets should go. The **data plane** (or forwarding plane) handles the high-speed, per-packet work of actually moving data from an ingress interface to an egress interface based on the decisions the control plane has already made. In modern routers, the data plane is often implemented in specialized hardware (ASICs or network processors) to achieve line-rate forwarding.[^rfc7426]

### Built-in network services

Beyond forwarding, routers typically provide several services that are essential for network operation:

- **NAT (Network Address Translation)** maps private internal addresses to one or more public addresses, allowing an entire LAN to share a single public IP.
- **DHCP (Dynamic Host Configuration Protocol)** automatically assigns IP addresses, subnet masks, and gateway information to devices joining the network.
- **Quality of Service (QoS)** classifies and prioritizes traffic so that latency-sensitive applications like voice and video are not starved by bulk data transfers.
- **Access Control Lists (ACLs)** filter packets by source/destination address, port, or protocol, serving as a first line of defense at the network perimeter.

## Types of routers

| Type | Description | Typical deployment |
|------|-------------|-------------------|
| Core | Backbone routers designed for maximum throughput; forward traffic between large network segments without direct end-user connections | ISPs, cloud data centers |
| Edge | Sit at the boundary of a network, connecting an organization's internal infrastructure to external networks or the internet | Enterprise WAN links |
| Distribution | Receive traffic from edge routers and fan it out to access-layer switches or wireless access points | Campus mid-layer |
| Wireless | Integrate routing, switching, and Wi-Fi access point functions into a single device | Homes, small offices |
| Virtual | Software instances that perform routing without dedicated hardware; provisioned on demand via cloud APIs | Cloud VPCs, NFV environments |

Core, edge, and distribution routers reflect a three-tier hierarchical network design common in enterprise and service-provider architectures. Wireless routers collapse the edge and distribution tiers into one device, which is why they dominate in small networks where the hierarchy would be unnecessary overhead.[^cisco-what]

## Routing protocols

Routing protocols automate the exchange of reachability information between routers so that routing tables stay current as the network topology changes. They divide broadly into **Interior Gateway Protocols** (IGPs), which operate within a single administrative domain called an autonomous system, and **Exterior Gateway Protocols** (EGPs), which route between autonomous systems.

### OSPF

**Open Shortest Path First** is a link-state IGP standardized in RFC 2328. Every OSPF router maintains an identical copy of the link-state database describing the full topology of its area. From that database, each router independently computes a shortest-path tree using Dijkstra's algorithm, with itself as the root. Because topology changes are flooded immediately as link-state advertisements rather than waiting for periodic timer-based updates, OSPF converges quickly. The protocol supports hierarchical design through **areas**, where intra-area topology is hidden from the rest of the autonomous system to reduce the size of the link-state database and the cost of SPF computation.[^moy1998]

> "Each OSPF router maintains an identical database describing the Autonomous System's topology."
> — Moy (1998)

### RIP

**Routing Information Protocol** Version 2 is a distance-vector IGP that measures route cost purely by **hop count** — the number of routers a packet must traverse. Routers broadcast their entire routing table to neighbors every 30 seconds. RIPv2 improved on the original by adding subnet mask support, authentication, route tagging, and multicast delivery on address 224.0.0.9. Its hard ceiling of 15 hops limits it to small networks, and its slow convergence makes it largely a legacy protocol today, though it remains useful in simple, flat topologies where administrative simplicity outweighs performance.[^malkin1998]

### EIGRP

**Enhanced Interior Gateway Routing Protocol** is a Cisco-developed hybrid protocol that blends distance-vector and link-state characteristics. It uses the Diffusing Update Algorithm (DUAL) to guarantee loop-free paths and maintains a topology table of all routes learned from neighbors, not just the best route. This allows EIGRP to switch to a pre-computed backup path (a *feasible successor*) almost instantly when a primary route fails, giving it very fast convergence.

### BGP

**Border Gateway Protocol** Version 4 is the only EGP in widespread use and is the protocol that holds the global internet together. BGP is a path-vector protocol: each route advertisement carries the full sequence of autonomous systems it has traversed, which allows receiving routers to detect and reject loops. Route selection follows a multi-phase decision process driven by configurable **path attributes** — local preference, AS path length, origin type, multi-exit discriminator, and others — giving network operators fine-grained policy control over how traffic enters and leaves their networks. BGP runs over TCP port 179 and supports Classless Inter-Domain Routing (CIDR) for route aggregation, which is critical for keeping the global routing table to a manageable size.[^rekhter2006]

### Protocol comparison

| Feature | OSPF | RIPv2 | EIGRP | BGP |
|---------|------|-------|-------|-----|
| Algorithm | Link-state (Dijkstra) | Distance-vector | Hybrid (DUAL) | Path-vector |
| Primary metric | Cost (bandwidth-derived) | Hop count (max 15) | Composite (bandwidth, delay, load, reliability) | Path attributes and policy |
| Scope | Intra-AS | Intra-AS | Intra-AS | Inter-AS |
| Convergence speed | Fast | Slow | Very fast | Moderate |
| Scalability | High (area hierarchy) | Low | Medium | Very high (internet-scale) |

## Software-defined networking and virtual routing

The traditional router bundles control plane and data plane into a single box. **Software-Defined Networking** (SDN) breaks that coupling by moving the control plane into a centralized software controller that programs the forwarding behavior of many devices at once. RFC 7426 defines SDN as "the ability of software applications to program individual network devices dynamically," organizing the architecture into distinct forwarding, control, management, and application planes connected through well-defined abstraction layers.[^rfc7426]

This separation has practical consequences for routing. A centralized controller has a global view of the network, so it can compute optimal paths across the entire topology rather than relying on each router's local, partial view. It also enables rapid, programmatic responses to traffic shifts, failures, or security events — capabilities that are difficult to achieve when every router runs its own independent protocol instance.

**Virtual routers** extend this trajectory further. Rather than dedicating physical hardware to routing, a virtual router runs as a software process on commodity servers or within a cloud provider's infrastructure. Cloud platforms like AWS, Azure, and GCP all provide managed virtual routing constructs (VPC route tables, virtual network gateways) that can be provisioned, modified, and torn down through APIs. The trade-off is that virtual routers rely on the underlying hypervisor and physical network for performance, so they rarely match the raw throughput of purpose-built hardware — but for many workloads, the operational flexibility far outweighs that gap.

## Security

Routers occupy a critical position in network defense because all traffic between networks must pass through them. A compromised or misconfigured router can expose an entire organization.

**Access Control Lists** are the most fundamental security mechanism, filtering packets at wire speed based on rules that match source and destination addresses, ports, and protocols. Stateful firewalls, now integrated into most enterprise routers, go further by tracking connection state and only permitting return traffic that corresponds to an established session. **VPN** support — typically via IPsec or SSL/TLS tunnels — allows routers to encrypt traffic between sites or between remote users and the corporate network, ensuring confidentiality over untrusted links.

Routing protocols themselves are attack surfaces. Without authentication, a rogue device can inject false routes and redirect traffic. Both OSPF and RIPv2 support authentication mechanisms — OSPF via cryptographic message digests and RIPv2 via a reserved authentication field in its update messages — to ensure that only trusted peers participate in route exchanges.[^moy1998][^malkin1998] BGP is protected in practice through a combination of MD5 TCP session authentication, prefix filtering, and the Resource Public Key Infrastructure (RPKI), which allows route origin validation.

NIST Special Publication 800-153 provides federal guidelines for securing wireless network infrastructure components, including access points and the routers they connect to, covering the full lifecycle from design through ongoing monitoring.[^souppaya2012]

[^cisco-how]: Cisco. (n.d.). [*How does a router work?*](https://www.cisco.com/site/us/en/learn/topics/small-business/how-does-a-router-work.html). Cisco Systems.

[^cisco-what]: Cisco. (n.d.). [*What is a router?*](https://www.cisco.com/site/us/en/learn/topics/small-business/what-is-a-router.html). Cisco Systems.

[^malkin1998]: Malkin, G. S. (1998). [*RIP Version 2* (RFC 2453; STD 56)](https://datatracker.ietf.org/doc/html/rfc2453). Internet Engineering Task Force.

[^moy1998]: Moy, J. (1998). [*OSPF Version 2* (RFC 2328; STD 54)](https://datatracker.ietf.org/doc/html/rfc2328). Internet Engineering Task Force.

[^rekhter2006]: Rekhter, Y., Li, T., & Hares, S. (2006). [*A Border Gateway Protocol 4 (BGP-4)* (RFC 4271)](https://datatracker.ietf.org/doc/html/rfc4271). Internet Engineering Task Force.

[^rfc7426]: Haleplidis, E., Pentikousis, K., Denazis, S., Salim, J. H., Meyer, D., & Koufopavlou, O. (2015). [*Software-Defined Networking (SDN): Layers and architecture terminology* (RFC 7426)](https://datatracker.ietf.org/doc/html/rfc7426). Internet Research Task Force.

[^souppaya2012]: Souppaya, M. P., & Scarfone, K. (2012). [*Guidelines for securing wireless local area networks (WLANs)* (NIST Special Publication 800-153)](https://doi.org/10.6028/NIST.SP.800-153). National Institute of Standards and Technology.
