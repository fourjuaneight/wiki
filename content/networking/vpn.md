---
title: "Virtual Private Networks"
date: 2026-03-22
draft: false
tags:
  - encryption
  - networking
  - privacy
  - security
---

A **Virtual Private Network** (VPN) is an encrypted connection over the public Internet between a device and a remote network. It creates a private communication channel — a "tunnel" — that prevents intermediaries such as Internet service providers, network operators, and potential attackers from inspecting or tampering with the data in transit.[^cisco] The acronym reflects three properties: *virtual* because no dedicated physical link is required, *private* because cryptography hides the content and metadata of the session, and *networked* because the tunnel connects distributed endpoints into a unified logical network.[^azure]

VPNs originated as a cost-effective alternative to leased lines and MPLS circuits for connecting branch offices. As remote work expanded, the same tunneling and encryption techniques were adapted for individual users connecting to corporate resources — and later, for consumer privacy services that route personal traffic through third-party servers. Today the technology spans enterprise site-to-site links, remote-access gateways, mobile clients, and browser-based SSL portals.[^aws]

## How a VPN works

A VPN session rests on three mechanisms — tunneling, encryption, and authentication — working together to secure traffic end to end.

### Tunneling

When a user launches a VPN client, the software negotiates a session with a remote VPN server and establishes an encrypted tunnel. Every packet leaving the device is encapsulated inside this tunnel before it reaches the broader Internet, so that routers along the path see only opaque ciphertext rather than the original payload or destination.[^aws] Think of it as placing a sealed envelope inside the postal system: the carriers can see where the envelope is going, but not what is inside.

### Encryption

Data traversing the tunnel is encrypted with symmetric ciphers — most commonly **AES-256**, the same standard used by financial institutions and defense agencies.[^azure] The IPsec framework, documented in NIST Special Publication 800-77 Rev. 1, provides encryption, digital signatures, message authentication, and key management at the network layer through the **Internet Key Exchange** (IKE) protocol.[^barker2020] TLS-based VPNs (OpenVPN, SSTP) rely on a similar handshake to derive session keys, but operate at the transport layer instead.

### Authentication

Before the tunnel forms, the server must verify the identity of the connecting user or device. Methods include username and password credentials, certificate-based mutual TLS, multi-factor authentication (MFA), and device **posture checks** — automated assessments that confirm an endpoint meets minimum security requirements (e.g., disk encryption enabled, OS fully patched) before granting access.[^cisco][^aws]

### IP address masking

Once connected, the VPN server assigns the client a new IP address, often a shared address that groups many users together. From the perspective of any destination server, traffic appears to originate from the VPN endpoint rather than the user's real location, making individual activity difficult to isolate or geolocate.[^azure]

## Architecture

A VPN deployment has three core components. The **VPN client** is software on the user's device that initiates the connection, encrypts outbound traffic, and handles credential exchange. The **VPN server** is the remote endpoint that terminates the tunnel, decrypts traffic, enforces access policies, and routes packets onward — it effectively becomes the apparent origin of the user's traffic. The **VPN protocol** is the agreed-upon rule set that governs encryption strength, key negotiation, transport mode, and connection reliability between client and server.[^aws]

## Protocols

The choice of protocol determines the trade-off between security, speed, and platform compatibility.

| Protocol | Encryption | Transport | Notes |
|---|---|---|---|
| OpenVPN | AES-256 (OpenSSL) | TCP or UDP, SSL/TLS | Open-source; widely audited; works across all major operating systems.[^azure] |
| IPsec / IKEv2 | AES-256 | UDP | Handles network transitions gracefully — well suited to mobile devices that switch between cellular and Wi-Fi.[^azure][^barker2020] |
| WireGuard | ChaCha20 / AES-256 | UDP | Modern, minimal codebase (~4,000 lines); open-source; faster handshake than OpenVPN in most benchmarks.[^azure] |
| SSTP | AES-256 | TCP, SSL/TLS | Built into Windows; tunnels through port 443, which helps bypass restrictive firewalls.[^azure] |
| L2TP / IPsec | AES-256 | UDP | Easy initial setup, but provider support is declining in favor of newer alternatives.[^azure] |
| PPTP | 128-bit MPPE | TCP | Obsolete — multiple well-documented cryptographic weaknesses make it unsuitable for any security-sensitive use.[^azure] |

## Types of VPNs

### Remote access (client-to-site)

A remote-access VPN connects an individual device to an organization's internal network. The user runs a VPN client — on a laptop, tablet, or smartphone — that authenticates against a gateway and establishes a tunnel back to the corporate environment. This is the most common configuration for remote and hybrid workers, and it can be extended with posture checks and MFA to meet zero-trust requirements.[^cisco][^aws]

### Site-to-site

A site-to-site VPN links two or more entire networks — typically a headquarters and its branch offices — over the public Internet using persistent IPsec tunnels. Routers or firewall appliances at each location handle the encryption transparently, so individual hosts do not need VPN client software. Two subtypes exist: an **intranet** VPN connects sites within the same organization, while an **extranet** VPN connects sites belonging to different organizations (e.g., a company and its supply-chain partner), with access policies scoped to limit what each party can reach.[^cisco][^azure]

### Mobile VPN

Mobile VPNs are designed for smartphones and tablets operating on unreliable or shifting connections. They maintain tunnel state even when the device transitions between Wi-Fi and cellular data or passes through brief connectivity gaps, avoiding the full re-authentication that a standard remote-access VPN would require.[^azure]

### SSL VPN

An SSL VPN provides remote access through a web portal secured with TLS, eliminating the need for dedicated client software. Users authenticate via a browser and gain access to specific internal applications or file shares. This model is cost-effective for organizations with large workforces that may not have company-issued devices.[^aws]

## Limitations

VPNs solve a specific problem — securing data in transit and masking network identity — but they do not constitute a comprehensive security posture. They offer no protection against malware or viruses; endpoint security remains a separate concern. They do not prevent websites from setting or reading cookies, although they do block ISP-level traffic inspection. VPN software itself can contain vulnerabilities, so clients and servers must be kept current with security patches.[^azure]

Provider trustworthiness is another consideration. The VPN server operator can, in principle, observe all decrypted traffic. Less reputable providers — especially free services — may log browsing activity, inject advertisements, or sell user data, effectively shifting the surveillance point from the ISP to the VPN provider. Industry sources broadly recommend paid services with independently audited no-log policies, a kill switch that severs Internet access if the tunnel drops, and support for modern protocols with AES-256 or equivalent encryption.[^aws][^azure]

[^aws]: Amazon Web Services. (n.d.). [*What is VPN?*](https://aws.amazon.com/what-is/vpn/)
[^barker2020]: Barker, E. B., Dang, Q. H., Frankel, S. E., Scarfone, K., & Wouters, P. (2020).
    [*Guide to IPsec VPNs*](https://doi.org/10.6028/NIST.SP.800-77r1) (NIST Special Publication 800-77, Rev. 1).
    National Institute of Standards and Technology.
[^cisco]: Cisco. (n.d.). [*What is a virtual private network (VPN)?*](https://www.cisco.com/site/us/en/learn/topics/security/what-is-a-virtual-private-network-vpn.html)
[^azure]: Microsoft Azure. (n.d.). [*What is VPN?*](https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-vpn)
