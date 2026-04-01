---
title: "Firewall"
date: 2026-03-26
updated: 2026-03-27
draft: false
tags:
  - protocols
  - security
---

A **firewall** is a network security device or program that monitors, filters, and controls traffic between networks of differing trust levels according to a predetermined set of security rules. The IETF defines it as "an agent which screens network traffic in some way, blocking traffic it believes to be inappropriate, dangerous, or both."[^freed2000] NIST refines this further as a device or program that "controls the flow of network traffic between networks or hosts that employ differing security postures."[^scarfone2009] The term is borrowed from building construction, where a firewall is a physical barrier designed to prevent fire from spreading between compartments — an apt analogy for a system designed to contain threats at a network boundary.

Firewalls have been a foundational element of network security architecture since the late 1980s. Their development was catalyzed by the Morris Worm of November 2, 1988, which exploited vulnerabilities in BSD Unix to infect approximately 6,000 of the 60,000 computers then connected to the Internet.[^spafford1989] The incident spurred urgent research into network access controls. Jeffrey Mogul at Digital Equipment Corporation published the first work on packet filtering in 1989, describing mechanisms to screen datagrams flowing through a Unix-based gateway.[^mogul1989] Bill Cheswick at AT&T Bell Labs was simultaneously building application-level defenses for AT&T's Internet gateway, and the first commercial firewall — DEC's SEAL — was sold in 1991. The paradigm shifted again when Check Point Software filed a patent on stateful inspection in 1993 and released FireWall-1 in 1994, capturing 40% of the worldwide firewall market within two years. The theoretical foundation for all of this work was consolidated in Cheswick and Bellovin's *Firewalls and Internet Security: Repelling the Wily Hacker* (1994), which defined the three properties a firewall must satisfy: all traffic must pass through it, only authorized traffic may pass, and the firewall itself must be immune to penetration.[^cheswick1994]

## Rulesets and default policy

Every firewall evaluates packets against an ordered set of rules — variously called a **ruleset** or **access control list** (ACL) — where each rule specifies matching criteria and an action. Matching criteria typically include source and destination IP address, transport-layer protocol (TCP, UDP, ICMP), port numbers, and interface direction. The action is one of: allow, deny (drop silently), or reject (drop and notify). Rules are evaluated top-to-bottom in sequence, and the first matching rule determines the packet's fate; if no rule matches, a terminal default policy applies.[^bellovin1994][^scarfone2009] This first-match evaluation model has linear per-packet complexity in the worst case, and considerable academic effort has gone into optimization through statistical search trees, trie-based representations, and decision-diagram structures.[^hamed2006]

The most consequential policy decision is the choice between **default-deny** and default-allow postures. NIST is explicit: "Generally, firewalls should block all inbound and outbound traffic that has not been expressly permitted by the firewall policy... this practice, known as deny by default, decreases the risk of attack."[^scarfone2009] Bellovin and Cheswick frame it as an epistemological position:

> "Everything is guilty until proven innocent... we configure our firewalls to reject everything, unless we have explicitly made the choice — and accepted the risk — to permit it."
> — Bellovin & Cheswick (1994)[^cheswick1994]

RFC 6092 codifies default-deny for residential IPv6 gateways, specifying that transport-layer traffic must not be forwarded into the interior network unless explicitly solicited by an interior endpoint or covered by an administrator-configured exception.[^woodyatt2011] Misconfiguration is the dominant operational risk: Gartner estimated that 99% of firewall breaches are caused not by firewall technology failures but by misconfigured rulesets.[^fortinet2024]

## Types and generations

### Packet-filtering (stateless)

**Packet-filtering firewalls** examine individual packets at the network and transport layers (OSI Layers 3–4) against predefined rules, making independent decisions for each packet with no awareness of connection state or session context. They inspect IP header fields — source and destination addresses, protocol number, IP options — alongside transport-layer headers including TCP/UDP source and destination ports. For TCP, the ACK flag bit allows the filter to distinguish connection-establishment packets (SYN without ACK) from packets belonging to existing sessions (ACK set), enabling policies that block inbound connection initiation while permitting return traffic.[^bellovin1994] For UDP, no equivalent mechanism exists, making fine-grained UDP filtering impractical because there is no header-level way to distinguish a request from a response.

Packet filters are fast and computationally inexpensive. Their limitations are significant: they have no visibility into packet sequences, cannot examine payloads, and are vulnerable to IP spoofing, fragmentation attacks, and TCP/IP stack exploits.[^scarfone2009] Protocols that negotiate port numbers dynamically — FTP data channels, RPC, X11 — cannot be handled correctly by a stateless filter without hardcoding secondary port ranges.

### Stateful inspection

**Stateful inspection** firewalls maintain a dynamic **state table** that records the status of every active network connection traversing the device. Where a stateless filter evaluates each packet in isolation, a stateful firewall evaluates packets against their session context, rejecting packets that do not belong to an established or expected connection.[^scarfone2009] Check Point's original INSPECT Engine, described in US Patent 5,606,668, was loaded into the OS kernel between the Data Link and Network layers, intercepting all packets on all interfaces before any protocol stack processing. It tracked communication-derived state (e.g., saving the IP and port from an FTP PORT command to validate the subsequent data connection), application-derived state (e.g., cached authentication credentials), and virtual session state for connectionless protocols like UDP.[^checkpoint1994]

For TCP, the state table tracks three phases: connection establishment (the three-way handshake), the established data-transfer phase, and termination via FIN or RST. For UDP, the firewall creates virtual session records keyed on source/destination IP and port pairs, expiring them after a configurable idle timeout — RFC 6092 specifies a minimum of 2 minutes idle, with a default of 5 minutes, while established TCP state should be maintained for at least 2 hours 4 minutes per RFC 5382.[^woodyatt2011] The state table is maintained in a hash-indexed data structure for O(1) average-case lookup. The principal vulnerability is session table exhaustion: an attacker flooding the firewall with half-open TCP connections can fill the state table and trigger denial of service.

### Application-layer and proxy firewalls

**Application-layer firewalls**, commonly implemented as proxy firewalls, operate at OSI Layer 7 with full protocol awareness of HTTP, FTP, SMTP, DNS, and other application protocols. Rather than passing packets through, a proxy firewall terminates each inbound connection and establishes a second, independent connection to the destination. No direct network path exists between communicating endpoints; every exchange results in two distinct connections — client-to-proxy and proxy-to-destination.[^cheswick1994] This architecture allows the proxy to authenticate individual users, enforce content policies, rewrite headers, and log all transactions at the application level, but introduces latency and requires a dedicated proxy process per supported protocol.

**Deep packet inspection** (DPI) extends application-layer analysis by examining full packet payloads against signature databases, using pattern-matching techniques ranging from exact string matching and regular expression evaluation via deterministic finite automata (DFA) to behavioral heuristics. DPI enables detection of protocol misuse, tunneling, and known exploit signatures regardless of port number, but is computationally intensive — DPI in firewall clusters can reduce throughput by more than 10% and introduces additional latency.[^bujlow2015] NIST characterizes stateful protocol analysis (a form of application inspection) as comparing observed traffic against vendor-developed profiles of benign protocol behavior to detect anomalies, unauthorized applications on standard ports, and input validation failures.[^scarfone2009]

### Next-generation firewalls

**Next-generation firewalls** (NGFWs) combine stateful inspection with application awareness, integrated intrusion prevention, SSL/TLS decryption, threat intelligence feeds, and user-identity integration in a single platform. Gartner coined the term in 2009, though Palo Alto Networks delivered the industry's first NGFW in 2008. Gartner's definition requires NGFWs to include DPI beyond port/protocol inspection, full-stack application visibility, inline IPS, external threat intelligence integration, and upgrade paths for future information feeds.[^cloudflare2025ngfw]

The central advancement over prior generations is application identification — classifying traffic by the actual application rather than by port, using protocol decoding, signature matching, and behavioral analysis. This breaks the long-standing evasion technique of tunneling malicious traffic over allowed ports (80/443). An NGFW can differentiate a legitimate web browsing session from a command-and-control channel operating over the same port, and enforce policy per application, per user, and per session.[^paloalto2025] SSL/TLS inspection is a required NGFW capability given that the majority of web traffic is now encrypted: the NGFW decrypts each TLS session, inspects the plaintext, then re-encrypts and forwards — a process that is computationally intensive but necessary to prevent encrypted channels from becoming blind spots. NGFWs with single-pass architectures process each packet once across all security functions (IPS, DPI, application control, URL filtering) to minimize this overhead.[^paloalto2025]

### Web application firewalls

A **web application firewall** (WAF) is a specialized Layer 7 firewall designed exclusively for HTTP and HTTPS traffic, typically deployed as a reverse proxy between users and a web application. WAFs are not replacements for network firewalls but complements to them.[^cloudflare2025] They operate using two security models: a negative model (blocklist) that blocks requests matching known attack signatures, and a positive model (allowlist) that permits only pre-approved request patterns. The OWASP Core Rule Set implements an anomaly-scoring approach in which each matched rule increments a severity-weighted numeric score, and a request is blocked only when the cumulative score exceeds a configurable threshold — reducing false positives compared to single-rule blocking.[^microsoft2025] WAFs protect against the OWASP Top 10 vulnerability classes, including SQL injection, cross-site scripting, cross-site request forgery, and server-side request forgery.[^owasp2025] PCI DSS 4.0 Requirement 6.4.2 specifically mandates WAFs for continuous monitoring of web applications handling cardholder data.

### Cloud-native firewalls and FWaaS

**Firewall as a Service** (FWaaS) delivers NGFW capabilities — DPI, URL filtering, IPS, DNS security, and threat prevention — through a provider's cloud infrastructure, eliminating hardware procurement and local maintenance. FWaaS is a core component of SASE (Secure Access Service Edge) architectures alongside Zero Trust Network Access, CASB, and Secure Web Gateways.[^cloudflare2025cloud] Each major cloud provider offers native firewall controls: AWS Security Groups are stateful, instance-level virtual firewalls with implicit deny and allow-only rules; Azure Network Security Groups are stateful filters supporting both allow and deny rules with priority-based evaluation; Azure Firewall Premium adds IDPS with over 67,000 signatures and TLS inspection; Google Cloud NGFW provides distributed Layer 3–7 controls with hierarchical policy management. These controls are software-defined, API-driven, and elastically scalable, enforcing rules at the hypervisor or VPC level rather than at a physical chokepoint — but they are platform-specific and do not provide unified governance across multi-cloud or hybrid environments.

## Network placement and architecture

Firewall placement determines the scope and granularity of traffic control. The classic enterprise design uses a **demilitarized zone** (DMZ) to host publicly accessible services — web servers, mail relays, DNS resolvers — in a network segment that is reachable from the Internet but isolated from the internal network. The dual-firewall screened-subnet design positions a front-end firewall between the Internet and the DMZ and a back-end firewall between the DMZ and the internal network, requiring an attacker to compromise both firewalls to reach internal resources. The simpler three-legged design uses one firewall with three interfaces (external, DMZ, internal) and distinct rulesets per zone.[^scarfone2009]

**Perimeter firewalls** guard the network border and handle north-south traffic — traffic between internal networks and external entities. **Internal segmentation firewalls** are deployed between internal zones to control east-west traffic — lateral movement between servers, virtual machines, and containers within the network. This distinction matters because a compromised host inside the perimeter moves laterally without triggering any perimeter-facing rule.

Host-based firewalls provide per-device protection independent of network topology. On Linux, the Netfilter kernel framework is accessed through `iptables` (legacy) or its replacement `nftables`, introduced in 2014, which uses a kernel virtual machine and a unified syntax across IPv4, IPv6, ARP, and bridge protocols. Windows Defender Firewall supports inbound and outbound filtering across Domain, Private, and Public network profiles with application-aware rules. The critical advantage of host-based firewalls over network firewalls is application-level visibility: a host firewall can identify that an unknown executable is attempting outbound communication on port 443, whereas a network firewall sees only generic HTTPS traffic. NIST recommends host-based firewalls on servers for granular protection and advises that personal firewalls on workstations be centrally managed and enforce application-based filtering.[^scarfone2009]

## NAT and firewall interaction

**Network Address Translation** (NAT) and firewall functions are distinct and neither implies the other, though both are frequently provided by the same device.[^freed2000] NIST is explicit that "the use of NAT should be considered a form of routing, not a type of firewall" and advises organizations not to rely on NAT as a substitute for firewall controls.[^scarfone2009] RFC 3022 defines two NAT mechanisms: **Basic NAT**, which maps internal IP addresses to external addresses one-to-one, and **NAPT** (Network Address Port Translation), which maps many internal IP/port pairs to a single external address/port pair.[^srisuresh2001] NAPT's implicit filtering behavior — only sessions originating from the local network are permitted, as external hosts cannot initiate connections without static mappings — resembles a stateful firewall, but this is an incidental side effect of address translation. NAT also breaks IPsec transport mode because it modifies IP headers, preventing end-to-end network-layer integrity verification.

## Limitations

Firewalls have well-documented blind spots that define the boundary between what they can and cannot protect against. Without SSL/TLS inspection, firewalls cannot examine encrypted payloads, allowing attackers to hide malware delivery, command-and-control traffic, and data exfiltration inside HTTPS sessions. TLS 1.3 exacerbates this by encrypting additional handshake metadata, reducing the metadata available for classification even without full decryption. SSL inspection is computationally expensive and raises privacy and compliance concerns, leading organizations to sometimes disable it selectively — creating the very blind spots they sought to close.[^barracuda2024]

Insider threats are fundamentally outside a firewall's detection capability. Firewalls enforce predefined rules based on network attributes and cannot detect credential misuse, social engineering, or malicious actions by authenticated users operating within their authorized network segments.[^checkpoint2025] Lateral movement from a compromised account or device is invisible to a perimeter firewall entirely. Application-layer evasion also predates NGFWs as a persistent weakness: port-hopping, protocol tunneling over allowed ports, encoding tricks, and the use of legitimate cloud infrastructure for data exfiltration all bypass firewalls that filter only on ports and protocols.[^paloalto2025] RFC 2979 anticipates this tension: "the only perfectly secure network is one that doesn't allow any data through at all... firewalls are being circumvented in ad hoc ways because they don't meet this transparency requirement."[^freed2000]

## Firewalls in the Zero Trust era

NIST SP 800-207 defines **Zero Trust** as "an evolving set of cybersecurity paradigms that move defenses from static, network-based perimeters to focus on users, assets, and resources," with the core assumption that no implicit trust is granted based solely on network location or asset ownership.[^rose2020] Every access request requires continuous authentication and authorization, evaluated through a Policy Engine that weighs identity, device posture, behavioral signals, and threat intelligence, with decisions enforced at Policy Enforcement Points distributed throughout the network.

NIST explicitly acknowledges the perimeter firewall's limitations in modern architectures: perimeter firewalls provide strong Internet gateways but "are less useful for detecting and blocking attacks from inside the network and cannot protect subjects outside of the enterprise perimeter — e.g., remote workers, cloud-based services, edge devices."[^rose2020] Zero Trust identifies three reference implementation models: Enhanced Identity Governance, microsegmentation (using host-based agents or software-defined networking to isolate workloads with per-service access controls), and Software-Defined Perimeters. Firewalls are not eliminated in Zero Trust — they are repositioned. Rather than serving as the primary trust boundary, they become one enforcement mechanism among many, applied at microsegment boundaries, cloud workload interfaces, and identity-verified access points. The convergence of FWaaS, ZTNA, CASB, and SWG into SASE architectures reflects this shift: the firewall function persists, but it is distributed, identity-aware, and cloud-delivered rather than confined to a hardware appliance at the network edge.

[^barracuda2024]: Barracuda Networks. (2024, June 27). [*Securing your network: The crucial role of SSL inspection on firewalls*](https://blog.barracuda.com/2024/06/27/the-crucial-role-of-SSL-inspection-on-firewalls). Barracuda Networks Blog.

[^bellovin1994]: Bellovin, S. M., & Cheswick, W. R. (1994). Network firewalls. *IEEE Communications Magazine, 32*(9), 50–57. https://doi.org/10.1109/35.312843

[^bujlow2015]: Bujlow, T., Carela-Español, V., Solé-Pareta, J., & Barlet-Ros, P. (2015). A survey on web tracking: Mechanisms, implications, and defenses. *Proceedings of the IEEE, 105*(8), 1476–1510.

[^checkpoint1994]: Check Point Software Technologies. (1994). [*Stateful inspection technology*](https://community.checkpoint.com/fyrhh23835/attachments/fyrhh23835/appliances-and-gaia/4996/1/Stateful_Inspection.pdf). Check Point.

[^checkpoint2025]: Check Point Software. (2025). [*6 main firewall threats and vulnerabilities, and how to mitigate them*](https://www.checkpoint.com/cyber-hub/network-security/what-is-firewall/6-main-firewall-threats-vulnerabilities-and-how-to-mitigate-them/). Check Point.

[^cheswick1994]: Cheswick, W. R., & Bellovin, S. M. (1994). *Firewalls and internet security: Repelling the wily hacker*. Addison-Wesley.

[^cloudflare2025]: Cloudflare. (2025). [*What is a firewall?*](https://www.cloudflare.com/learning/security/what-is-a-firewall/). Cloudflare.

[^cloudflare2025cloud]: Cloudflare. (2025). [*What is a cloud firewall? What is firewall-as-a-service (FWaaS)?*](https://www.cloudflare.com/learning/cloud/what-is-a-cloud-firewall/). Cloudflare.

[^cloudflare2025ngfw]: Cloudflare. (2025). [*What is a next-generation firewall (NGFW)?*](https://www.cloudflare.com/learning/security/what-is-next-generation-firewall-ngfw/). Cloudflare.

[^fortinet2024]: Fortinet. (2024). [*What is a firewall? Definition and types of firewall*](https://www.fortinet.com/resources/cyberglossary/firewall). Fortinet.

[^freed2000]: Freed, N. (2000). [*Behavior of and requirements for Internet firewalls* (RFC 2979)](https://www.rfc-editor.org/rfc/rfc2979). IETF.

[^hamed2006]: Hamed, H., Al-Shaer, E., & Marrero, W. (2006). Modeling and verification of IPSec and VPN security policies. *Proceedings of the 13th IEEE International Conference on Network Protocols (ICNP)*. https://doi.org/10.1109/ICNP.2005.25

[^microsoft2025]: Microsoft. (2025). [*Azure Web Application Firewall on Azure Application Gateway*](https://learn.microsoft.com/en-us/azure/web-application-firewall/ag/ag-overview). Microsoft Learn.

[^mogul1989]: Mogul, J. C. (1989). Simple and flexible datagram access controls for Unix-based gateways. *USENIX Conference Proceedings*, 203–221.

[^owasp2025]: OWASP Foundation. (2025). [*OWASP Top Ten*](https://owasp.org/www-project-top-ten/). OWASP.

[^paloalto2025]: Palo Alto Networks. (2025). [*What is a next-generation firewall (NGFW)? A complete guide*](https://www.paloaltonetworks.com/cyberpedia/what-is-a-next-generation-firewall-ngfw). Palo Alto Networks.

[^rose2020]: Rose, S., Borchert, O., Mitchell, S., & Connelly, S. (2020). [*Zero trust architecture* (NIST SP 800-207)](https://doi.org/10.6028/NIST.SP.800-207). National Institute of Standards and Technology.

[^scarfone2009]: Scarfone, K., & Hoffman, P. (2009). [*Guidelines on firewalls and firewall policy* (NIST SP 800-41 Rev. 1)](https://doi.org/10.6028/NIST.SP.800-41r1). National Institute of Standards and Technology.

[^spafford1989]: Spafford, E. H. (1989). The Internet worm program: An analysis. *ACM SIGCOMM Computer Communication Review, 19*(1), 17–57. https://doi.org/10.1145/66093.66095

[^srisuresh2001]: Srisuresh, P., & Egevang, K. (2001). [*Traditional IP network address translator (Traditional NAT)* (RFC 3022)](https://www.rfc-editor.org/rfc/rfc3022). IETF.

[^woodyatt2011]: Woodyatt, J. (2011). [*Recommended simple security capabilities in customer premises equipment (CPE) for providing residential IPv6 Internet service* (RFC 6092)](https://www.rfc-editor.org/rfc/rfc6092). IETF.
