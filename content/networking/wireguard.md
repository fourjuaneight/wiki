---
title: "WireGuard"
date: 2026-03-22
draft: false
tags:
  - encryption
  - networking
  - security
---

**WireGuard** is a free, open-source VPN protocol and software implementation that creates encrypted point-to-point tunnels at Layer 3 of the network stack. It was designed by Jason A. Donenfeld and first presented at the Network and Distributed System Security Symposium in 2017, with the explicit goal of replacing both IPsec and user-space VPN solutions like OpenVPN through a radically smaller codebase, modern cryptography, and kernel-level performance.[^donenfeld2017] The entire Linux kernel implementation is roughly 4,000 lines of code — small enough, its author argues, to be comprehensively audited by a single person — compared to 100,000–600,000 lines for competing implementations.[^ionos] Since March 2020, WireGuard has shipped in the mainline Linux kernel (version 5.6 onward) and is also available on Windows, macOS, BSD, iOS, and Android.[^wireguard]

Rather than negotiating cryptographic parameters at connection time the way IPsec and OpenVPN do (an approach known as *cipher agility*), WireGuard bundles its cryptographic functions into a single versioned suite. If a vulnerability is discovered in any primitive, the entire protocol version is replaced rather than individual components being swapped. This keeps the handshake logic simple and eliminates a large class of downgrade attacks.[^ionos]

> "WireGuard ... is, I think, perhaps the most significant advancement in VPN technology in a decade ... a work of art compared to the horrors that are OpenVPN and IPsec."
> — Linus Torvalds (2018)

## Cryptographic suite

WireGuard's fixed set of primitives is drawn from well-studied, high-speed constructions:[^donenfeld2017][^wireguardprotocol]

| Function | Primitive | Role |
|---|---|---|
| Handshake framework | Noise protocol framework (`Noise_IKpsk2`) | Structures the authenticated key exchange |
| Key agreement | Curve25519 | Elliptic-curve Diffie–Hellman for deriving shared secrets |
| Authenticated encryption | ChaCha20-Poly1305 (RFC 7539) | Encrypts and authenticates tunnel traffic |
| Hashing | BLAKE2s (RFC 7693) | Cryptographic hashing and keyed MAC |
| Key derivation | HKDF (RFC 5869) | Derives session keys from shared secrets |
| Hashtable keying | SipHash24 | Internal data-structure key generation |
| Cookie encryption | XChaCha20-Poly1305 | Encrypts DoS-mitigation cookies |

An optional **pre-shared key** (PSK) can be mixed into the handshake alongside the Curve25519 exchange. Because the PSK is a symmetric secret, it provides a hedge against a future quantum computer capable of breaking elliptic-curve Diffie–Hellman — a lightweight form of post-quantum resistance.[^wireguardprotocol]

## How WireGuard works

### Interface model

WireGuard operates by creating virtual network interfaces — `wg0`, `wg1`, and so on — that behave like any other interface such as `eth0`. Standard system tools (`ip address`, `ip route`) handle addressing and routing, while WireGuard-specific attributes (keys, peers, listening ports) are managed through the `wg` utility or its higher-level wrapper `wg-quick`.[^canonical][^wireguard] All encrypted traffic is transported over UDP; there is no persistent connection and no TCP fallback.[^canonical]

### Cryptokey routing

The central design concept is **cryptokey routing**, which binds each peer's public key to a set of allowed tunnel IP addresses. Every WireGuard interface holds a private key and a list of peers, where each peer is defined by three attributes: a public key, an optional endpoint address, and an `AllowedIPs` range. This single data structure serves two purposes simultaneously:[^donenfeld2017][^canonical]

- **Outbound (routing table).** When the interface needs to send a packet, it looks up the destination IP in the `AllowedIPs` of each peer. The matching peer's public key encrypts the packet, and the ciphertext is sent via UDP to that peer's most recent known endpoint.
- **Inbound (access control list).** When a UDP packet arrives, it is decrypted and the sender is authenticated by public key. The decrypted packet's source IP is then checked against that peer's `AllowedIPs`. If the source IP falls within the permitted range, the packet is accepted; otherwise it is silently dropped.

This dual-purpose mechanism replaces what would typically require separate routing tables and firewall rules.

### The handshake

WireGuard uses a **1-RTT (single round-trip) handshake** built on the Noise IK pattern. Two messages are exchanged:[^donenfeld2017][^wireguardprotocol]

1. **Initiation.** The initiator generates an ephemeral Curve25519 key pair, performs two Diffie–Hellman operations (ephemeral-to-static and static-to-static) against the responder's known public key, and sends a message containing its encrypted static public key and an encrypted TAI64N timestamp. The timestamp prevents replay: the server tracks the greatest timestamp seen per peer and discards anything older.
2. **Response.** The responder generates its own ephemeral key pair, performs three DH operations (ephemeral-to-ephemeral, ephemeral-to-static, and a PSK mixing step), and returns an AEAD-encrypted empty payload that serves as key confirmation.

After both messages complete, each side derives a pair of symmetric transport keys from the final chaining key using HKDF. All intermediate cryptographic state — chaining keys, ephemeral private keys, hash accumulators — is then zeroed from memory. Sessions are automatically rekeyed every few minutes, ensuring **perfect forward secrecy**: compromise of a long-term key does not reveal past session traffic.[^wireguardprotocol]

### Transport and replay protection

Data packets carry a receiver index, a 64-bit counter used as the AEAD nonce, and the encrypted IP packet (zero-padded to 16-byte boundaries). The counter is monotonically increasing and cannot be wound backward. A sliding window of roughly 2,000 prior counter values accommodates UDP's inherent out-of-order delivery while rejecting replayed packets. The window check occurs only after the authentication tag is verified, so invalid packets never influence replay state.[^wireguardprotocol]

### Roaming

Both sides of a WireGuard tunnel can change IP addresses seamlessly. A client starts with a configured initial endpoint for the server. The server, in turn, discovers and updates client endpoints dynamically by recording the source address of each correctly authenticated packet. Both sides always send to the most recently verified endpoint, so a mobile device that moves from Wi-Fi to cellular — or between networks entirely — continues to communicate without re-establishing the tunnel.[^canonical][^ionos]

### Silence and stealth

WireGuard is not a chatty protocol. When no data is being exchanged, it transmits nothing — no keepalives, no heartbeats, no negotiation chatter. This conserves battery life on mobile devices and, from a network perspective, makes an idle WireGuard endpoint effectively invisible. The server does not respond at all to packets from unauthorized sources; it simply drops them without reply.[^wireguard][^ionos]

## DoS mitigation

Because the first handshake message requires knowledge of the responder's public key, the server never allocates state for unauthenticated packets. Under CPU-exhaustion attacks, the server can defer expensive DH computations by replying with a lightweight **cookie message** instead of completing the handshake. The cookie is a MAC of the sender's IP address, encrypted with XChaCha20-Poly1305, keyed by a server secret that rotates every two minutes. A client that receives a cookie must include it (as `mac2`) in its next handshake initiation, proving IP ownership and enabling rate-limiting per source address.[^donenfeld2017][^wireguardprotocol]

## Formal verification

WireGuard has been formally verified through multiple independent efforts — an unusual level of scrutiny for a VPN protocol:[^wireguardverification]

- **Tamarin prover** (symbolic model, by Donenfeld and Milner) verified correctness, strong key agreement, forward secrecy, identity hiding, and resistance to key-compromise impersonation and unknown key-share attacks.
- **CryptoVerif** (computational proof in the ACCE model, by Lipp) produced a mechanized proof of the entire protocol including transport messages, covering message secrecy, mutual authentication, and replay resistance.
- **Computational proof in the eCK model** (by Dowling and Paterson) analyzed the handshake's security properties under the extended Canetti–Krawczyk framework.
- **ProVerif via Noise Explorer** (by Kobeissi and Bhargavan) verified the underlying Noise IK pattern.
- **HACL\*** and **Fiat-Crypto** provided formally verified C implementations of Curve25519 scalar multiplication, specified in F\* and Coq respectively.

## Performance

Benchmarks on Intel Core i7 hardware with gigabit Ethernet (Linux 4.6.1) illustrate WireGuard's throughput and latency advantages over competing protocols:[^wireguardperf]

| Protocol | Throughput | Latency | CPU headroom |
|---|---|---|---|
| WireGuard (ChaCha20-Poly1305) | 1,011 Mbps | 0.403 ms | Not maxed out |
| IPsec (AES-256-GCM, hardware AES-NI) | 881 Mbps | 0.508 ms | Fully saturated |
| IPsec (ChaCha20-Poly1305) | 825 Mbps | 0.521 ms | Fully saturated |
| OpenVPN (AES-256, UDP mode) | 258 Mbps | 1.541 ms | Fully saturated |

WireGuard achieved near line-rate throughput with CPU capacity to spare, while all three competitors were CPU-bottlenecked at lower speeds. The project notes that these benchmarks are older and that both WireGuard and IPsec have since improved; WireGuard retains threading advantages, while OpenVPN remains substantially slower.[^wireguardperf]

Two structural properties explain the gap. First, WireGuard runs inside the kernel, avoiding the context switches that penalize user-space VPNs like OpenVPN. Second, its cryptographic primitives — particularly ChaCha20 and Poly1305 — are engineered for high throughput on commodity hardware without requiring dedicated instruction sets like AES-NI.[^wireguard]

## Comparison with IPsec and OpenVPN

| Aspect | WireGuard | IPsec (IKEv2) | OpenVPN |
|---|---|---|---|
| Codebase | ~4,000 lines (kernel) | ~100,000+ lines | ~100,000+ lines (+ OpenSSL) |
| Cipher negotiation | Fixed versioned suite | Agile, per-handshake | Agile, per-handshake |
| Execution context | Kernel space | Kernel space | User space |
| Transport | UDP | ESP (IP protocol 50) | UDP or TCP |
| Handshake | 1 round trip (Noise IK) | Multiple round trips (IKE) | TLS handshake |
| Roaming | Native, seamless | Limited | Limited |
| Idle behavior | Silent | Periodic keepalives | Periodic keepalives |
| Peer model | Symmetric (peer-to-peer) | Typically client/server | Client/server |
| Key distribution | Out-of-band (SSH-style) | Certificates or PSK via IKE | Certificates or static keys |

## Deployment topologies

WireGuard's peer-to-peer model supports several common arrangements:[^canonical]

- **Peer-to-site.** A single device tunnels into a remote network — the typical "road warrior" setup for remote workers.
- **Site-to-site.** Two entire networks are bridged, with a WireGuard endpoint at each location forwarding traffic for the local subnet.
- **Default gateway.** All traffic from a device is routed through the tunnel by setting `AllowedIPs = 0.0.0.0/0, ::/0`, making the remote endpoint the device's Internet exit point.
- **Mesh.** Multiple peers connect directly to one another, each listing every other peer in its configuration.

Because the protocol draws no fundamental distinction between "client" and "server," the difference is largely a matter of which side initiates the first packet and which side has a publicly reachable endpoint. At least one peer must have a known `Endpoint` configured; the other can be discovered dynamically through authenticated traffic.[^canonical]

## Limitations

WireGuard deliberately omits several features that more complex VPN stacks provide. There is no built-in key distribution, certificate authority integration, or PKI — keys must be exchanged out of band, much like SSH public keys.[^wireguard] The protocol uses UDP exclusively, which can be blocked by restrictive firewalls that only permit TCP on ports 80 and 443; there is no TCP fallback or obfuscation layer.[^canonical] The fixed cipher suite, while beneficial for simplicity and auditability, means the entire protocol version must be replaced if any single primitive is compromised.[^ionos] Finally, the server necessarily tracks each peer's most recent source IP address to support roaming, which has privacy implications in contexts where endpoint identity should remain hidden from the VPN gateway.

[^canonical]: Canonical. (n.d.). [*WireGuard VPN*](https://ubuntu.com/server/docs/explanation/intro-to/wireguard-vpn/). Ubuntu Server Documentation.
[^donenfeld2017]: Donenfeld, J. A. (2017). WireGuard: Next generation kernel network tunnel. In *Proceedings of the
    Network and Distributed System Security Symposium (NDSS 2017)*. Internet Society.
    https://www.ndss-symposium.org/ndss2017/ndss-2017-programme/wireguard-next-generation-kernel-network-tunnel/
[^ionos]: IONOS. (2024). [*WireGuard VPN basics*](https://www.ionos.com/digitalguide/server/tools/wireguard-vpn-basics/). IONOS Digital Guide.
[^wireguard]: WireGuard Project. (n.d.). [*WireGuard: Fast, modern, secure VPN tunnel*](https://www.wireguard.com/).
[^wireguardperf]: WireGuard Project. (n.d.). [*Performance*](https://www.wireguard.com/performance/).
[^wireguardprotocol]: WireGuard Project. (n.d.). [*Protocol & cryptography*](https://www.wireguard.com/protocol/).
[^wireguardverification]: WireGuard Project. (n.d.). [*Formal verification*](https://www.wireguard.com/formal-verification/).
