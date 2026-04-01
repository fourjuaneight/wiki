---
title: "Transmission Control Protocol"
date: 2026-03-21
updated: 2026-03-19
draft: false
tags:
  - networking
  - protocols
---

**Transmission Control Protocol** (TCP) is the Internet's primary mechanism for guaranteeing that data arrives complete, correct, and in order between two networked hosts. Defined originally in RFC 793 and modernized in RFC 9293, TCP operates at the transport layer of the TCP/IP model, providing a reliable, connection-oriented, byte-stream service atop the best-effort delivery of the Internet Protocol[^postel1981][^eddy2022]. Without TCP, the fundamental activities of the modern Internet — web browsing, email, file transfer, financial transactions — would be fragile or impossible.

TCP achieves its reliability through an interlocking set of mechanisms: sequence numbering, cumulative acknowledgments, retransmission, flow control via a sliding window, and congestion control algorithms that protect the network itself from overload. Its design has proven durable enough to remain foundational for over four decades, evolving incrementally through IETF standards without breaking backward compatibility. Understanding TCP means understanding not just *what* these mechanisms do, but *why* each one exists as a response to a specific failure mode of packet-switched networks.

## Role in the TCP/IP architecture

TCP sits at the **transport layer** of the four-layer TCP/IP model, positioned between the application layer above and the internet layer below. The internet layer — governed by IP — handles addressing and routing but offers only best-effort packet delivery, with no guarantees about ordering, completeness, or integrity. TCP fills this gap entirely[^fortinet]. Cloudflare's documentation offers a useful analogy: IP is the postal system that delivers puzzle pieces to the right address, while TCP is the assembler on the other side who puts them in order, requests any missing pieces, and confirms the puzzle is complete[^cloudflare].

A TCP connection is identified by a four-tuple: source IP address, source port, destination IP address, and destination port. Port numbers enable **multiplexing** — multiple distinct flows between the same pair of hosts can coexist simultaneously, each distinguished by its port pair. TCP supports full-duplex communication, meaning data flows in both directions over a single connection without either side waiting for the other to finish.

## Connection establishment: the three-way handshake

Before any data flows, TCP requires both endpoints to establish a shared state through the **three-way handshake**. This procedure synchronizes the Initial Sequence Numbers (ISNs) that will track every byte exchanged, ensuring both sides agree on where the byte stream begins.

The handshake proceeds in three steps:

1. The client sends a segment with the **SYN** flag set, advertising its own ISN (call it *X*), and enters the SYN-SENT state.
2. The server replies with both the **SYN** and **ACK** flags set — its own ISN (*Y*) and an acknowledgment number of *X+1*, confirming receipt of the client's SYN. The server enters the SYN-RECEIVED state.
3. The client sends an **ACK** with sequence number *X+1* and acknowledgment number *Y+1*. Both sides enter the ESTABLISHED state and data transfer begins.

RFC 793 noted that because steps 2 and 3 can be combined in a single message, the procedure requires only three messages rather than four[^postel1981]. A significant security improvement in RFC 9293 concerns ISN generation: the original specification used a clock-based generator vulnerable to sequence number prediction attacks. RFC 9293 mandates pseudo-random ISN generation per RFC 6528, closing the door on connection-hijacking attacks that exploited predictable sequence numbers[^eddy2022].

## Connection termination: the four-way close

Because a TCP connection is full-duplex, each direction must be closed independently. This produces a **four-way handshake** for graceful connection termination:

1. The initiating side sends a **FIN** segment, signaling it has no more data to send, and enters FIN-WAIT-1.
2. The remote side acknowledges with an **ACK** (entering CLOSE-WAIT); the initiator advances to FIN-WAIT-2. The remote side may continue sending data during this interval — this is called a *half-closed* connection.
3. When the remote side is also finished, it sends its own **FIN** and enters LAST-ACK.
4. The initiator sends a final **ACK** and enters the **TIME-WAIT** state, where it waits for twice the Maximum Segment Lifetime (2 × MSL, typically four minutes) before moving to CLOSED.

The TIME-WAIT period exists to guarantee the final ACK reaches the remote side and to ensure any delayed segments from the old connection have expired before the same port pair can be reused. TCP's full state machine defines 11 states: CLOSED, LISTEN, SYN-SENT, SYN-RECEIVED, ESTABLISHED, FIN-WAIT-1, FIN-WAIT-2, CLOSE-WAIT, CLOSING, LAST-ACK, and TIME-WAIT[^eddy2022].

## Segment structure

Every TCP segment consists of a header followed by an optional data payload. The header is a minimum of **20 bytes** (160 bits), expanded when TCP options are present. RFC 9293 defines the following fields:

| Field | Size | Purpose |
|---|---|---|
| Source Port | 16 bits | Identifies the sending application process |
| Destination Port | 16 bits | Identifies the receiving application process |
| Sequence Number | 32 bits | Byte-stream position of the first data octet in this segment |
| Acknowledgment Number | 32 bits | Next sequence number the sender expects to receive |
| Data Offset | 4 bits | Header length in 32-bit words; locates where data begins |
| Reserved | 4 bits | Must be zero (reduced from 6 bits in RFC 793) |
| Control Flags | 8 bits | CWR, ECE, URG, ACK, PSH, RST, SYN, FIN |
| Window | 16 bits | Receiver's advertised buffer capacity in bytes |
| Checksum | 16 bits | Integrity check over header, data, and a pseudo-header |
| Urgent Pointer | 16 bits | Offset to end of urgent data (valid only when URG is set) |
| Options | Variable | Includes MSS, window scaling, timestamps, SACK |

Two of the flags — **CWR** (Congestion Window Reduced) and **ECE** (ECN-Echo) — were added in RFC 9293 to support Explicit Congestion Notification, reducing the reserved field from 6 bits to 4[^eddy2022]. The checksum computation spans a pseudo-header containing source and destination IP addresses, the protocol number (6 for TCP), and the TCP segment length. RFC 9293 extends this to support IPv6's 128-bit addresses. Notably, the checksum is never optional: the sender must generate it and the receiver must verify it.

## Reliability: sequence numbers, acknowledgments, and retransmission

TCP's reliability rests on three interlocking mechanisms that together ensure every byte arrives exactly once and in order. First, **every octet** of transmitted data is assigned a unique 32-bit sequence number from a space of 0 to 4,294,967,295, with arithmetic performed modulo 2³². SYN and FIN control flags each consume one sequence number, as they represent logical events in the byte stream[^postel1981]. This numbering allows the receiver to reorder out-of-sequence segments and discard duplicates.

Second, TCP uses **cumulative acknowledgments**: an ACK carrying acknowledgment number *X* confirms that all bytes up to *X−1* have been received. Once a connection is established, every segment carries a valid ACK field, allowing acknowledgments to piggyback on data flowing in the opposite direction. IBM's documentation captures the mechanism precisely: TCP assigns a sequence number to each transmitted octet and requires a positive acknowledgment from the receiving end, retransmitting any data not acknowledged within a timeout period[^ibm].

Third, **retransmission** handles loss. When a segment is sent, a copy is held in a retransmission queue and a timer is started. If no ACK arrives before the timer expires, the segment is resent. The retransmission timeout (RTO) is not static but computed dynamically from measured round-trip times using the Jacobson/Karels algorithm (RFC 6298), which tracks a smoothed RTT estimate and an RTT variance to adapt gracefully to changing network conditions[^eddy2022]. **Selective Acknowledgment** (SACK), standardized in RFC 2018, extends this further: the receiver can report non-contiguous blocks of received data, enabling the sender to retransmit only the specific missing segments rather than everything from the first gap onward[^mathis1996].

## Flow control: the sliding window

Flow control prevents a fast sender from overwhelming a slow receiver whose buffers are limited. TCP implements this through a **sliding window** protocol. Each ACK the receiver sends includes a *window advertisement* (rwnd) — the number of bytes it can currently accept — computed as its maximum buffer size minus how much data it has received but not yet delivered to the application.

The sender is permitted to have in-flight (sent but unacknowledged) at most `min(cwnd, rwnd)` bytes, where *cwnd* is the congestion window discussed in the next section. As ACKs arrive, the window slides forward, permitting new data to enter the pipeline. This self-clocking property — where the rate of incoming ACKs paces the sender's output — is a fundamental characteristic of TCP's behavior[^postel1981].

When the receiver's buffer fills completely, it advertises a zero window and forces the sender to pause. To prevent deadlock caused by a lost window-update ACK, TCP uses a **persist timer**: the sender periodically transmits small window probe segments to elicit a fresh advertisement. The original 16-bit window field limits advertisements to 65,535 bytes, which is insufficient for high-speed, high-latency paths. RFC 7323 introduced the **Window Scale option**, negotiated during the three-way handshake, which allows effective window sizes up to approximately one gigabyte[^borman2014].

## Congestion control: protecting the network

Flow control protects the receiver; **congestion control** protects the network itself. TCP's original specification included no congestion control, a gap that contributed to the Internet's first congestion collapses in October 1986, when throughput on some paths dropped by a factor of nearly 1,000. Van Jacobson's landmark 1988 paper, "Congestion Avoidance and Control," presented at ACM SIGCOMM, introduced the algorithms that remedied the crisis and remain foundational today[^jacobson1988].

RFC 5681 standardizes four intertwined algorithms[^allman2009]. **Slow start** begins each connection with a small congestion window (cwnd), typically a few segments, and doubles it every round-trip time by increasing it by one segment per ACK — exponential growth that rapidly probes available capacity. When cwnd reaches the **slow start threshold** (ssthresh), the protocol shifts to **congestion avoidance**, which grows cwnd by approximately one segment per RTT — a conservative linear (additive) increase that cautiously searches for additional headroom.

When three duplicate ACKs arrive in succession, signaling that a segment was likely lost without a full timeout, **fast retransmit** immediately resends the missing segment. **Fast recovery** then sets ssthresh to half the current in-flight data and continues from that point rather than resetting cwnd to one segment, avoiding the severe throughput penalty of treating every loss as a catastrophe. TCP NewReno (RFC 6582) refined fast recovery to handle multiple losses within a single window through partial acknowledgment detection[^henderson2012].

Modern congestion control has moved well beyond these foundations. **TCP CUBIC**, the default algorithm in Linux since kernel 2.6.19, replaces linear congestion avoidance with a cubic function of elapsed time since the last loss event, providing far better utilization of high-bandwidth, high-latency paths. **TCP BBR**, developed at Google in 2016, takes a fundamentally different model-based approach: rather than using packet loss as the primary congestion signal, it estimates bottleneck bandwidth and minimum RTT to operate at the theoretical network optimum. Google reported that BBR delivered throughput 2–25× greater than CUBIC on its backbone network[^cardwell2016].

## TCP versus UDP

TCP and UDP are the two primary transport protocols, and their design philosophies diverge sharply. TCP is connection-oriented, reliable, and ordered, with a minimum 20-byte header, flow control, congestion control, and retransmission. **User Datagram Protocol** (UDP) is connectionless, unreliable, and unordered, with a fixed 8-byte header and none of the overhead mechanisms TCP provides[^fortinet].

These differences drive clear selection criteria. TCP is the right choice when data integrity and completeness are non-negotiable — web browsing, email, file transfer, SSH, and database connections all require that every byte arrive intact. UDP is preferred when speed and low latency matter more than perfect delivery: VoIP, video conferencing, online gaming, DNS lookups, and live streaming all tolerate occasional packet loss more readily than they tolerate the retransmission delays TCP would introduce. The distinction is not a quality judgment but a design trade-off suited to different application requirements. Notably, HTTP/3 and the QUIC protocol represent a hybrid approach — they run over UDP to gain low-latency connection setup, while implementing TCP-like reliability and congestion control at the application layer.

## Real-world applications

TCP underpins the majority of Internet traffic that demands guaranteed delivery. Web browsing relies on TCP (via HTTP/1.1, HTTP/2, and HTTPS) to ensure every resource — HTML, CSS, JavaScript, images — arrives intact; HTTP/2 multiplexes multiple streams over a single TCP connection to reduce overhead. Email delivery via SMTP, retrieval via POP3 and IMAP, and secure remote access via SSH all depend on TCP's byte-stream guarantees. Database connections between applications and systems such as PostgreSQL or MySQL use TCP to ensure query results and transaction confirmations are received accurately — a requirement for maintaining ACID guarantees. Financial systems and online banking rely on TCP because partial or corrupted data could cause monetary errors with no recovery path. Even video-on-demand platforms deliver content over TCP/HTTPS using adaptive bitrate streaming, compensating for TCP's latency overhead through client-side buffering[^linkedIn].

[^allman2009]: Allman, M., Paxson, V., & Blanton, E. (2009). *TCP congestion control* (RFC 5681). Internet Engineering Task Force. https://datatracker.ietf.org/doc/html/rfc5681
[^borman2014]: Borman, D., Braden, B., Jacobson, V., & Scheffenegger, R. (2014). *TCP extensions for high performance* (RFC 7323). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc7323
[^cardwell2016]: Cardwell, N., Cheng, Y., Gunn, C. S., Yeganeh, S. H., & Jacobson, V. (2016). BBR: Congestion-based congestion control. *ACM Queue, 14*(5). https://queue.acm.org/detail.cfm?id=3022184
[^cerf1974]: Cerf, V. G., & Kahn, R. E. (1974). A protocol for packet network intercommunication. *IEEE Transactions on Communications, COM-22*(5), 637–648. https://doi.org/10.1109/TCOM.1974.1092259
[^cloudflare]: Cloudflare. (n.d.). *What is TCP/IP?* Cloudflare Learning Center. https://www.cloudflare.com/learning/ddos/glossary/tcp-ip/
[^eddy2022]: Eddy, W. (Ed.). (2022). *Transmission Control Protocol (TCP)* (RFC 9293). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc9293.html
[^fortinet]: Fortinet. (n.d.). *What is TCP/IP in networking?* Fortinet CyberGlossary. https://www.fortinet.com/resources/cyberglossary/tcp-ip
[^henderson2012]: Henderson, T., Floyd, S., Gurtov, A., & Nishida, Y. (2012). *The NewReno modification to TCP's fast recovery algorithm* (RFC 6582). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc6582.html
[^ibm]: IBM. (n.d.). *Transmission control protocol.* IBM Documentation: AIX 7.2.0. https://www.ibm.com/docs/en/aix/7.2.0?topic=protocols-transmission-control-protocol
[^jacobson1988]: Jacobson, V. (1988). Congestion avoidance and control. In *Proceedings of the ACM SIGCOMM '88 Symposium* (pp. 314–329). ACM. https://doi.org/10.1145/52324.52356
[^linkedIn]: LinkedIn. (n.d.). *What are some common use cases and examples of TCP and UDP protocols?* LinkedIn Collaborative Articles. https://www.linkedin.com/advice/3/what-some-common-use-cases-examples
[^mathis1996]: Mathis, M., Mahdavi, J., Floyd, S., & Romanow, A. (1996). *TCP selective acknowledgment options* (RFC 2018). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc2018
[^postel1981]: Postel, J. (Ed.). (1981). *Transmission Control Protocol* (RFC 793). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc793.html
