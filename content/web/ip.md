---
title: "Internet Protocol"
date: 2026-03-18
draft: false
tags:
- infrastructure
- networking
- routing
---

An **Internet Protocol address** (IP address) is a numerical label assigned to every device participating in a network that uses the Internet Protocol for communication. It serves two inseparable functions: identifying the host or network interface, and providing the location information that routers need to forward packets toward their destination. Think of it as the postal system of the internet — without a source and destination address on each envelope, no packet would know where to go or how to get back. The protocol governing this system was originally specified in RFC 791 (Postel, 1981) and has operated, with modifications, as the internet's fundamental addressing mechanism ever since.

Two versions exist in active deployment. **IPv4**, the original 32-bit protocol first deployed on SATNET in 1982, remains the dominant form of traffic on most networks today. **IPv6**, its 128-bit successor standardized in RFC 8200 (Deering & Hinden, 2017), was designed to replace IPv4 after the exhaustion of its address space became inevitable. Understanding how both versions work — and why the transition between them has taken decades — requires tracing a path through address structure, routing mechanics, allocation governance, and the translation technologies that have held IPv4's operational life well beyond its original design horizon.

## IPv4: structure and header mechanics

IPv4 uses a 32-bit address space, yielding exactly 4,294,967,296 unique addresses. Each address is expressed in **dotted-decimal notation** as four decimal numbers (octets) separated by periods, for example `192.168.1.1`. Each octet represents 8 bits and ranges from 0 to 255. The entire address is divided conceptually into a *network portion* and a *host portion*, with the boundary determined by the subnet mask or prefix length accompanying the address (Postel, 1981).

Every packet traveling an IPv4 network carries a **packet header** — a structured prefix of 20 to 60 bytes that precedes the payload. Its most operationally significant fields are the 32-bit source and destination addresses; the **Time to Live** (TTL) counter, which each router decrements by one and which causes the packet to be discarded when it reaches zero, preventing infinite routing loops; the protocol field identifying the encapsulated upper-layer protocol (6 for TCP, 17 for UDP, 1 for ICMP); and a header checksum recalculated at every hop. A 4-bit version field and a 4-bit Internet Header Length (IHL) field, measured in 32-bit words, complete the fixed portion. Options may extend the header to 60 bytes, though they are rarely used in practice (Baker, 1995; Postel, 1981).

### Classful addressing and its failure

IPv4 originally organized addresses into five classes defined by the leading bits of the first octet. The system worked reasonably well in the early internet but proved catastrophically wasteful at scale.

|Class|First octet range|Default prefix|Hosts per network|Intended use          |
|-----|-----------------|--------------|-----------------|----------------------|
|A    |1–126            |/8            |~16.7 million    |Large organizations   |
|B    |128–191          |/16           |65,534           |Mid-size organizations|
|C    |192–223          |/24           |254              |Small organizations   |
|D    |224–239          |—             |—                |Multicast             |
|E    |240–255          |—             |—                |Reserved/experimental |

The structural problem was that the boundaries were fixed. An organization needing 300 addresses had to receive an entire Class B block of 65,534, leaving tens of thousands of addresses stranded and unroutable. By the early 1990s, this inefficiency threatened to exhaust the address pool within years and was already causing global routing tables to grow at an unsustainable rate (Fuller & Li, 2006).

### CIDR and subnetting

**Classless Inter-Domain Routing** (CIDR), introduced in 1993 and formalized in RFC 4632 (Fuller & Li, 2006), replaced classful boundaries with variable-length prefix notation. An address is now written with a slash and a decimal number indicating how many leading bits designate the network: `192.168.1.0/24` means the first 24 bits identify the network and the remaining 8 bits address hosts within it, for 256 total addresses (254 usable, after reserving the network address and the broadcast address).

A **subnet mask** expresses the same boundary as a contiguous string of 1-bits: `/24` corresponds to `255.255.255.0` in dotted decimal. Subnetting lets a single allocated block be divided into smaller segments — a `/26` carved from a `/24` gives four subnets of 64 addresses each. **Variable-Length Subnet Masking** (VLSM) extends this further, allowing subnets of different sizes within the same address space, maximizing efficiency. On the routing side, CIDR enabled **route aggregation**: a set of contiguous networks can be advertised as a single prefix, dramatically compressing global routing tables and buying the internet years of breathing room (Fuller & Li, 2006; RIPE NCC, n.d.).

## IPv6: a 128-bit redesign

IPv6 was created to solve a straightforward arithmetic problem — 32 bits cannot accommodate a world of billions of devices — but its designers used the opportunity to also correct several structural limitations of IPv4. The core specification, now RFC 8200 (Deering & Hinden, 2017), defines a 128-bit address space producing approximately `3.4 × 10³⁸` unique addresses, a number large enough to assign billions of addresses to every atom on the surface of the Earth.

IPv6 addresses are written as eight groups of four hexadecimal digits separated by colons: `2001:0DB8:0000:0000:0000:0000:0000:0001`. Two shorthand rules simplify notation: leading zeros within any group may be omitted, and one contiguous run of all-zero groups may be collapsed to `::`. The example above therefore becomes `2001:DB8::1`. The `::` abbreviation may appear only once per address to avoid ambiguity (Hinden & Deering, 2006).

### Header simplification

The IPv6 base header is fixed at 40 bytes and contains only eight fields, down from IPv4's 14. The header checksum was removed entirely — upper-layer protocols are responsible for their own integrity. Fragmentation, which in IPv4 could occur at any intermediate router, was moved to an extension header and restricted to the source host only. A **Flow Label** field was added to allow routers to identify and consistently handle packets belonging to the same traffic flow without inspecting the full payload. These changes reduce per-hop processing overhead significantly (Deering & Hinden, 2017).

### Address types

IPv6 defines three fundamental address types. **Unicast** addresses identify a single interface. Global unicast addresses (prefix `2000::/3`) are the public-internet equivalent; link-local addresses (`FE80::/10`) are mandatory on every IPv6 interface and used only for communication within a single network segment; unique local addresses (`FC00::/7`, in practice `FD00::/8`) are the private-address equivalent, routable within an organization but not on the global internet (Hinden & Haberman, 2005). **Multicast** addresses (`FF00::/8`) replace IPv4's broadcast mechanism — IPv6 has no broadcast addresses at all. **Anycast** addresses are syntactically indistinguishable from unicast but are assigned to multiple interfaces; a packet sent to an anycast address is delivered to the topologically nearest one, a property exploited by DNS root servers and CDN infrastructure for load distribution (Hinden & Deering, 2006).

As of early 2026, roughly 45–49% of users reaching Google's services do so over IPv6, with leading adoption in France (~86%), India (~68%), and Germany (~68%) (Google, n.d.). The transition is real but slow — most networks run both protocols simultaneously under a **dual-stack** configuration.

## Public addresses, private addresses, and reserved ranges

Not all IP addresses are globally routable. **Public IP addresses** are unique across the entire internet and assigned through the allocation hierarchy described below. **Private IP addresses**, defined in RFC 1918 (Rekhter et al., 1996), are reserved for use within local networks and are blocked from traversing the public internet by convention — any router on the global routing system will discard packets bearing these addresses as source or destination.

RFC 1918 reserved three blocks for private use:

|Block      |Prefix|Total addresses|
|-----------|------|---------------|
|10.0.0.0   |/8    |16,777,216     |
|172.16.0.0 |/12   |1,048,576      |
|192.168.0.0|/16   |65,536         |

Several other ranges serve special purposes. The loopback range `127.0.0.0/8` is reserved for a device communicating with itself; `127.0.0.1` is the canonical loopback address. The `169.254.0.0/16` range, defined in RFC 3927, is used for Automatic Private IP Addressing (APIPA) when a device fails to obtain an address from a DHCP server. The `100.64.0.0/10` range (RFC 6598) is allocated for Carrier-Grade NAT. Three documentation prefixes — `192.0.2.0/24`, `198.51.100.0/24`, and `203.0.113.0/24` (RFC 5737) — are reserved for examples and test cases and must never appear in operational traffic. In IPv6, the unique local address prefix `FD00::/8` provides the equivalent of RFC 1918 private space (Hinden & Haberman, 2005; Rekhter et al., 1996).

## Routing: how packets cross the internet

IP routing is the process by which packets traverse a chain of routers from source to destination. When a router receives a packet, it examines the destination IP address and looks up the best match in its **routing table** — a data structure mapping destination prefixes to next-hop addresses and outgoing interfaces. Selection follows **longest prefix matching**: among all entries that match the destination, the one with the most specific (longest) prefix wins. The router then decrements the TTL, recomputes the header checksum, rewrites the Layer 2 frame header, and forwards the packet to the next hop (Baker, 1995).

Routing tables are populated three ways: directly connected networks are added automatically when an interface is configured; static routes are entered manually by an administrator; and dynamic routes are learned from neighboring routers through routing protocols. Two protocol families govern this. **Interior Gateway Protocols** (IGPs) operate within a single **Autonomous System** (AS) — a network under unified administrative control. OSPF (RFC 2328) is the dominant IGP; it is a link-state protocol in which every router maintains a complete map of the network topology and computes shortest paths using Dijkstra's algorithm. **Exterior Gateway Protocols** connect Autonomous Systems to each other. **BGP version 4** (RFC 4271), operating over TCP port 179, is the sole EGP in global use. It is a path-vector protocol that makes forwarding decisions based on AS-path attributes, local policy, and operator-configured preferences rather than pure metric. The global internet is a mesh of over 70,000 Autonomous Systems, each announcing its address prefixes to its BGP neighbors and relying on this distributed exchange to construct a coherent forwarding topology (Rekhter et al., 2006).

## DHCP: automating address assignment

**Dynamic Host Configuration Protocol** (DHCP), defined in RFC 2131 (Droms, 1997), automates the assignment of IP addresses and associated configuration parameters (subnet mask, default gateway, DNS servers, lease duration) using a client-server model over UDP ports 67 (server) and 68 (client). Dynamic allocation is the most common mode: a client receives a temporary lease on an address, which must be renewed periodically or the address returns to the pool.

Assignment follows the four-step DORA handshake:

1. **Discover** — the client broadcasts a request from source `0.0.0.0` to destination `255.255.255.255`, since it has no address yet.
1. **Offer** — one or more DHCP servers respond with a proposed address and configuration.
1. **Request** — the client broadcasts acceptance of one offer, implicitly informing other servers to withdraw theirs.
1. **Acknowledge** — the chosen server confirms the lease; the client configures its interface.

At 50% of the lease duration (the T1 timer), the client attempts unicast renewal with its original server. At 87.5% (the T2 timer), it broadcasts a rebind request to any available server. This two-stage renewal mechanism ensures graceful address reclamation when devices leave the network (Droms, 1997). When a client and server reside on different broadcast domains, a **DHCP Relay Agent** on an intermediary router forwards discovery messages as unicast, allowing a single server to serve multiple subnets without a server in each one.

Static addresses, configured manually or delivered as DHCP reservations tied to a device's MAC address, remain essential for servers, routers, and any host requiring a predictable, permanent address.

## NAT: sharing addresses across the exhaustion boundary

**Network Address Translation** (NAT), specified in RFC 3022 (Srisuresh & Egevang, 2001), allows multiple devices with private IPv4 addresses to share one or more public addresses by rewriting IP headers at the network boundary. A NAT device maintains a translation table that maps outgoing private-address/port pairs to public-address/port pairs, applying the reverse mapping to return traffic. The dominant variant, **NAPT** (Network Address Port Translation, also called PAT or "masquerade"), maps an entire private network to a single public IP address differentiated by port number — the mechanism that lets every device in a home share one ISP-assigned address.

NAT's conservation benefit is real and historically important: it deferred widespread IPv4 address exhaustion by allowing the RFC 1918 ranges to be reused independently across millions of private networks. The cost is equally real. NAT breaks **end-to-end connectivity** — a host behind NAT cannot be directly addressed from the public internet without explicit port-forwarding configuration. It also disrupts protocols that embed IP addresses in their payload, requires stateful tracking of all active sessions, and complicates IPsec's Authentication Header, which validates the integrity of fields that NAT modifies. Peer-to-peer applications handle this through traversal techniques: STUN (RFC 5389) discovers a client's public address, TURN (RFC 5766) relays traffic through a public server when direct paths fail, and ICE (RFC 8445) orchestrates both to select an optimal path. At ISP scale, **Carrier-Grade NAT** (CGN) adds a second layer of translation using the `100.64.0.0/10` shared address space, allowing ISPs to serve many customers from a small public prefix (Srisuresh & Egevang, 2001).

## Address allocation: from IANA to end users

IP address space is governed by a strict hierarchy. The **Internet Assigned Numbers Authority** (IANA), operated by PTI (a subsidiary of ICANN), manages the global pool and allocates large blocks to the five **Regional Internet Registries** (RIRs): AFRINIC (Africa), APNIC (Asia-Pacific), ARIN (North America), LACNIC (Latin America and Caribbean), and RIPE NCC (Europe, Middle East, and Central Asia). Each RIR allocates to **Local Internet Registries** (LIRs) and ISPs within its region, which in turn assign addresses to end users and organizations (IANA, n.d.).

This system reached a decisive turning point on February 3, 2011, when IANA allocated its last five `/8` blocks — one to each RIR — exhausting the central IPv4 pool. The RIRs then depleted their own free pools at different rates: APNIC on April 15, 2011; RIPE NCC on September 14, 2012; LACNIC on June 10, 2014; ARIN on September 24, 2015; and AFRINIC in 2017. Today all five operate under scarcity policies, typically capping new allocations at a single `/22` (1,024 addresses) or `/24` (256 addresses) per member. Organizations requiring larger blocks must acquire them through a secondary transfer market, where IPv4 addresses trade as a commodity (Number Resource Organization, n.d.).

For IPv6, IANA allocates large blocks to RIRs, which assign minimum `/32` prefixes to LIRs. ISPs typically assign `/48` prefixes to subscriber sites, allowing 65,536 subnets per customer. Individual LAN segments standardly receive `/64` prefixes, providing each subnet more host addresses than all of IPv4 combined. Address scarcity is not a foreseeable concern for IPv6; the challenge is adoption velocity (RIPE NCC, n.d.).

## References

- Baker, F. (1995). *Requirements for IP version 4 routers* (RFC 1812). IETF. https://datatracker.ietf.org/doc/html/rfc1812
- Deering, S., & Hinden, R. (2017). *Internet Protocol, version 6 (IPv6) specification* (RFC 8200). IETF. https://datatracker.ietf.org/doc/html/rfc8200
- Droms, R. (1997). *Dynamic Host Configuration Protocol* (RFC 2131). IETF. https://datatracker.ietf.org/doc/html/rfc2131
- Fortinet. (n.d.). *What is an IP address? How it works, how to locate it.* https://www.fortinet.com/resources/cyberglossary/what-is-ip-address
- Fuller, V., & Li, T. (2006). *Classless inter-domain routing (CIDR): The internet address assignment and aggregation plan* (RFC 4632). IETF. https://datatracker.ietf.org/doc/html/rfc4632
- Google. (n.d.). *IPv6 adoption statistics.* Google. https://www.google.com/intl/en/ipv6/statistics.html
- Hinden, R., & Deering, S. (2006). *IP version 6 addressing architecture* (RFC 4291). IETF. https://datatracker.ietf.org/doc/html/rfc4291
- Hinden, R., & Haberman, B. (2005). *Unique local IPv6 unicast addresses* (RFC 4193). IETF. https://datatracker.ietf.org/doc/html/rfc4193
- Internet Assigned Numbers Authority. (n.d.). *Number resources.* https://www.iana.org/numbers
- Number Resource Organization. (n.d.). *IPv4 exhaustion FAQs.* https://www.nro.net/about/rirs/internet-number-resources/ipv6/ipv4-exhaustion-faqs/
- Postel, J. (1981). *Internet Protocol* (RFC 791). IETF. https://datatracker.ietf.org/doc/html/rfc791
- Rekhter, Y., Li, T., & Hares, S. (2006). *A border gateway protocol 4 (BGP-4)* (RFC 4271). IETF. https://datatracker.ietf.org/doc/html/rfc4271
- Rekhter, Y., Moskowitz, B., Karrenberg, D., de Groot, G. J., & Lear, E. (1996). *Address allocation for private internets* (RFC 1918). IETF. https://datatracker.ietf.org/doc/html/rfc1918
- RIPE Network Coordination Centre. (n.d.). *Understanding IP addressing and CIDR charts.* https://www.ripe.net/about-us/press-centre/understanding-ip-addressing/
- Srisuresh, P., & Egevang, K. (2001). *Traditional IP network address translator (Traditional NAT)* (RFC 3022). IETF. https://datatracker.ietf.org/doc/html/rfc3022