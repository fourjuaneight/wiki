---
title: "User Datagram Protocol"
date: 2026-03-21
updated: 2026-03-19
draft: false
tags:
  - networking
  - protocols
---

**User Datagram Protocol** (UDP) is a connectionless transport-layer protocol that delivers datagrams between processes on networked hosts with no handshake, no delivery guarantee, and no retransmission. Defined in a three-page specification by Jon Postel at the Information Sciences Institute, RFC 768[^postel1980] has remained syntactically unchanged since August 1980 — a testament to the completeness of its original design. UDP occupies Layer 4 of the OSI model alongside TCP, but where TCP offers a reliable, ordered byte stream, UDP provides a minimal dispatch mechanism and trusts the application layer to handle whatever error tolerance, ordering, or recovery its use case demands.

The protocol's enduring relevance stems from a straightforward observation: for a significant class of network communication — DNS lookups, live media, real-time telemetry, interactive games — a retransmitted packet that arrives late is less useful than no packet at all. UDP eliminates the machinery designed to prevent that situation, trading correctness guarantees for the lowest achievable latency and overhead. That trade-off has proven so architecturally sound that QUIC, the transport protocol underpinning HTTP/3, is built entirely on top of UDP, layering back selective reliability and encryption at the application layer rather than modifying the protocol itself[^langley2017].

## Origins and standardization

UDP emerged from the same period of intense protocol consolidation that produced IP, ICMP, and TCP between 1979 and 1981. The core mechanics are attributed to David P. Reed, with Postel serving as editor and publisher. An earlier draft had circulated as Internet Experiment Note 88 (IEN-88) in May 1979; the final specification was published in August 1980 as RFC 768 and designated Internet Standard 6, assigned IP protocol number 17[^postel1980].

The motivation was explicit from the first line of the RFC. TCP's connection-oriented design imposed overhead that was unnecessary for stateless, transaction-oriented communication. The two application protocols RFC 768 named as intended users — the Internet Name Server and the Trivial File Transfer Protocol — remain UDP-based today, which illustrates how accurately Postel identified the protocol's natural fit. Postel's broader design philosophy, often called Postel's Law ("be liberal in what you accept, and conservative in what you send"), is embedded in UDP's tolerant, minimal architecture: the protocol accepts whatever the application sends, adds the smallest possible header, and forwards without judgment.

> "This User Datagram Protocol (UDP) is defined to make available a datagram mode of packet-switched computer communication… This protocol provides a procedure for application programs to send messages to other programs with a minimum of protocol mechanism."
> — Postel[^postel1980] (1980, p. 1)

## Datagram structure

A UDP datagram consists of a fixed 8-byte header followed by the payload. The header is divided into four 16-bit fields:

```
  0              15 16             31
 +-----------------+-----------------+
 |   Source Port   | Destination Port|
 +-----------------+-----------------+
 |     Length      |    Checksum     |
 +-----------------+-----------------+
 |         Data octets ...           |
 +-----------------------------------+
```

The **source port** identifies the sending process and serves as the return address. RFC 768 designates it optional: a value of zero indicates it is unused. The **destination port** identifies the target process on the receiving host. Both fields span 0–65,535; well-known ports below 1,024 are reserved for standardized services such as DNS (port 53), DHCP (ports 67/68), and NTP (port 123), while ephemeral ports (49,152–65,535) are assigned dynamically to client-side processes[^postel1980].

The **length** field specifies the total datagram size in octets, including header and payload. Its minimum is 8 (a header with no data); its theoretical maximum under IPv4 is 65,507 bytes after accounting for the encapsulating IP header, while IPv6 permits up to 65,527 bytes in standard mode. The **checksum** is computed using a one's complement sum that covers not just the UDP header and data but also a pseudo-header derived from the IP source address, destination address, protocol number, and UDP length — a design that guards against misrouted datagrams without embedding routing state in the UDP layer itself[^postel1980]. Under IPv4 the checksum is optional; under IPv6 it is mandatory, compensating for IPv6's removal of the IP-level header checksum[^eggert2017].

The practical consequence of this structure is a 60–87% reduction in per-packet header overhead compared to TCP, whose headers range from 20 to 60 bytes and must accommodate sequence numbers, acknowledgment fields, window sizes, control flags, and variable-length options.

## Operational mechanics

UDP's processing path is short by design. A sending application passes data to the UDP module along with source and destination port numbers; UDP prepends the 8-byte header, hands the datagram to the IP layer, and terminates its involvement. No connection is established, no state is maintained between transactions, and each datagram is independent — it may be delivered, dropped, duplicated, or reordered, and UDP will not detect or correct any of these outcomes[^cloudflare].

On the receiving side, UDP's connectionlessness creates an important programming distinction from TCP. A TCP server calls `accept()` to produce a new, dedicated socket per client connection. UDP has no equivalent mechanism: a server binds to a port and receives all incoming datagrams through a single socket regardless of source. This means graceful restart — trivial with TCP, where in-flight connections can drain naturally — requires explicit application-level coordination with UDP. Servers must also handle concerns that TCP manages transparently, including IP fragmentation of datagrams that exceed the path MTU, empty payloads, and inbound ICMP error messages generated when a datagram reaches an unreachable port[^majkowski2021].

The absence of congestion control is operationally significant at the network level. TCP's algorithms — Reno, CUBIC, BBR — dynamically reduce transmission rates when packet loss signals congestion, preserving fairness across competing flows. UDP sends at whatever rate the application specifies. RFC 8085 classifies this as a systemic risk and requires that applications using UDP implement their own congestion-response behavior to avoid crowding out TCP flows that cooperatively back off[^eggert2017].

## UDP versus TCP

The choice between UDP and TCP is not a quality judgment but a fit question. The two protocols occupy complementary regions of the reliability-latency design space, and understanding what each sacrifices clarifies why both have survived for over four decades.

| Property | UDP | TCP |
|---|---|---|
| Connection setup | None | Three-way handshake (≥1 RTT) |
| Header size | 8 bytes (fixed) | 20–60 bytes (variable) |
| Delivery guarantee | None | Yes (retransmission) |
| Ordering | None | Yes (sequence numbers) |
| Flow control | None | Sliding window |
| Congestion control | None (app responsibility) | Built-in (CUBIC, BBR, etc.) |
| Broadcast / multicast | Supported | Not supported |
| Latency profile | Minimal | Higher due to reliability overhead |

Simulation studies illustrate the extremes of this trade-off. In network conditions with varied packet sizes and loss, TCP achieved a 95.7% packet delivery ratio versus approximately 3% for UDP under the same conditions — a demonstration of TCP's reliability machinery earning its overhead[^alDhief2018]. In real-time audio scenarios over wireless IEEE 802.11 ad-hoc networks, however, the same conditions that impair TCP's throughput make UDP the superior carrier, because the retransmission delays inherent to TCP produce worse perceptual quality than the occasional frame drop that UDP leaves to the codec[^ieee2003]. Early kernel-level optimization research by Partridge and Pink[^partridgePink1993] (1993) achieved 25–35% UDP throughput gains in 4.3 BSD Unix — improvements tractable precisely because UDP's simplicity leaves implementation headroom that TCP's complexity forecloses.

## Common use cases

UDP's fit is best understood through the applications that have relied on it since the protocol's inception and through newer ones that have deliberately chosen it.

DNS uses UDP on port 53 for queries because a resolution is a single-round-trip transaction: a small request, a small response, done. Introducing a TCP handshake would double or triple the latency of what should be a sub-millisecond lookup. DNS falls back to TCP only when a response exceeds 512 bytes (or 4,096 bytes with EDNS0 extensions) or when zone transfers are needed between authoritative servers. VoIP and video conferencing carry media streams over UDP through the Real-Time Transport Protocol (RTP): a retransmitted audio packet that arrives 200 milliseconds late arrives after the conversation has moved on, so RTP adds its own sequence numbers and timestamps for media synchronization while deliberately omitting retransmission logic[^fortinet]. Online multiplayer games follow the same reasoning — a stale position update is superseded by the next update, making loss tolerable and latency paramount. DHCP requires UDP specifically because a bootstrapping device has no IP address yet, making TCP's connection-oriented handshake impossible. IoT sensors and constrained devices benefit from UDP's 8-byte header and stateless operation through protocols like CoAP, where a temperature reading broadcast every 30 seconds can tolerate occasional loss because the next reading provides fresh data.

The most significant modern endorsement of UDP's architecture is QUIC, standardized in RFC 9000 (2021) and powering HTTP/3. QUIC rebuilds reliable, encrypted, multiplexed transport on top of UDP, achieving 1-RTT connection establishment for new connections and 0-RTT for resumed ones — compared to TCP+TLS requiring three or more round trips. Langley et al.[^langley2017] (2017) reported that QUIC reduced YouTube video rebuffers by 15–18% and Google Search latency by 3.6–8% in large-scale deployment. By 2024, HTTP/3 support had reached approximately 34% of the top 10 million websites. QUIC's design choice reflects a broader conclusion: UDP is not a deficient TCP but a deliberate substrate — a clean transport primitive on which higher-level protocols can build exactly the reliability semantics their use case requires, nothing more.

## Security considerations

UDP's lack of connection verification creates an attack surface that TCP's handshake forecloses. Because no handshake verifies a sender's identity, the source IP address in a UDP datagram can be trivially spoofed. This single property enables two of the most disruptive classes of denial-of-service attack on the Internet.

**UDP flood attacks** saturate a target by sending high volumes of datagrams to arbitrary ports. For each packet arriving at a port with no listening application, the target must inspect the packet, find no match, and generate an ICMP "Destination Unreachable" response — a process that exhausts CPU, memory, and bandwidth at scale[^cloudflare][^fortinet]. Research in software-defined networking environments has explored entropy-based detection as a mitigation approach, treating sudden changes in traffic entropy across source addresses as a flood signature[^muthurajkumar2023][^boro2016].

**Amplification attacks** compound spoofing with the asymmetric query-response sizes of UDP-based services. An attacker sends small queries to open DNS resolvers or NTP servers with the victim's IP as the spoofed source; the server sends a much larger response to the victim. DNS amplification achieves factors of 28×–54×, with extreme cases reaching 179×. The 2013 Spamhaus attack reached 300 Gbps using this technique; the 2018 GitHub attack reached 1.35 Tbps using memcached amplification over UDP. Mitigations include BCP38 source address validation at network ingress, response rate limiting (RRL) for DNS servers, and disabling deprecated NTP commands like `monlist`.

A subtler tension has emerged as QUIC has scaled: countermeasures that block unrecognized UDP flows at firewalls and rate limiters also block legitimate HTTP/3 connections. Research presented at ACM SAC 2024 proposed distinguishing self-regulated QUIC flows from unresponsive attack traffic through dynamic rate limits keyed to expected congestion window behavior, allowing mitigation without collateral disruption to QUIC sessions (ACM, 2024).

NAT traversal adds a further operational complexity. NAT devices maintain stateful UDP mappings that expire quickly — sometimes within 30 seconds without keepalive traffic. Symmetric NATs assign distinct public ports per destination, defeating simple address-discovery mechanisms. The WebRTC stack addresses this through a layered framework: STUN (RFC 8489) for public address discovery, TURN (RFC 8656) as a relay of last resort, and ICE (RFC 8445) coordinating between them. UDP hole-punching succeeds in 82–95% of NAT configurations; the remainder require TURN relays.

[^alDhief2018]: Al-Dhief, F. T., Sabri, N., Fouad, S., Latiff, N. M. A., & Albader, M. A. A. (2018). Performance comparison between TCP and UDP protocols in different simulation scenarios. *International Journal of Engineering & Technology*, *7*(4.36), 172–176.

[^boro2016]: Boro, D., Basumatary, H., Goswami, T., & Bhattacharyya, D. K. (2016). UDP flooding attack detection using information metric measure. In *Proceedings of International Conference on ICT for Sustainable Development* (pp. 147–157). Springer. https://doi.org/10.1007/978-981-10-0129-1_16

[^cloudflare]: Cloudflare. (n.d.). *What is the User Datagram Protocol (UDP/IP)?* https://www.cloudflare.com/learning/ddos/glossary/user-datagram-protocol-udp/

[^eggert2017]: Eggert, L., Fairhurst, G., & Shepherd, G. (2017). *UDP usage guidelines* (RFC 8085). IETF. https://doi.org/10.17487/RFC8085

[^fortinet]: Fortinet. (n.d.). *What is User Datagram Protocol (UDP)?* https://www.fortinet.com/resources/cyberglossary/user-datagram-protocol-udp

[^ieee2003]: IEEE. (2003). Performance of TCP/UDP under ad hoc IEEE 802.11. *IEEE Conference Publication*. https://doi.org/10.1109/ISWCS.2003.1191496

[^langley2017]: Langley, A., Riddoch, A., Wilk, A., Vicente, A., Krasic, C., Zhang, D., & Swett, I. (2017). The QUIC transport protocol: Design and Internet-scale deployment. In *Proceedings of the ACM SIGCOMM Conference* (pp. 183–196). https://doi.org/10.1145/3098822.3098842

[^majkowski2021]: Majkowski, M. (2021, November 25). *Everything you ever wanted to know about UDP sockets but were afraid to ask, part 1*. Cloudflare Blog. https://blog.cloudflare.com/everything-you-ever-wanted-to-know-about-udp-sockets-but-were-afraid-to-ask-part-1/

[^muthurajkumar2023]: Muthurajkumar, S., Geetha, A., Aravind, S., & Meharajnisa, H. B. (2023). UDP flooding attack detection using entropy in software-defined networking. In *Proceedings of International Conference on Communication and Computational Technologies* (pp. 555–564). Springer. https://doi.org/10.1007/978-981-19-3951-8_42

[^partridgePink1993]: Partridge, C., & Pink, S. (1993). A faster UDP. *IEEE/ACM Transactions on Networking*, *1*(4), 429–440. https://doi.org/10.1109/90.251895

[^postel1980]: Postel, J. (1980). *User Datagram Protocol* (RFC 768). IETF. https://doi.org/10.17487/RFC0768