---
title: "Domain Name System"
date: 2026-03-19
updated: 2026-03-19
draft: false
tags:
  - infrastructure
  - networking
  - security
---

The **Domain Name System** (DNS) is the globally distributed, hierarchical naming database that translates human-readable domain names into machine-routable IP addresses. It underpins virtually every internet interaction: when a browser fetches `www.example.com`, DNS is responsible for resolving that label into the numerical address the network stack actually uses. Without it, users would need to memorize addresses like `93.184.216.34` to reach any destination[^mockapetris1987a].

DNS is far more than a lookup table. It is a fault-tolerant, administratively decentralized architecture designed in 1983 to replace an unscalable flat file, and it has since evolved into one of the most critical — and most attacked — components of internet infrastructure. Understanding it fully means understanding its hierarchical structure, its resolution mechanics, its record types, its caching behavior, and the layered security mechanisms built to defend it.

## History and origin

DNS exists because its predecessor failed. In the early ARPANET era, a single file called `HOSTS.TXT` — maintained by SRI International's Network Information Center — mapped every hostname to its IP address. Administrators emailed changes to SRI and periodically downloaded the updated file via FTP. By the early 1980s, with hundreds of hosts and the network's transition to TCP/IP, this centralized approach collapsed: bandwidth to SRI-NIC was overwhelmed, name collisions became unmanageable in the flat namespace, and the file was perpetually out of date[^mockapetris1987a].

Paul Mockapetris, working at USC's Information Sciences Institute, designed DNS as the solution. His original specifications — RFC 882 and RFC 883 (November 1983), later refined into RFC 1034 and RFC 1035 (November 1987) — introduced three transformative concepts: a hierarchical namespace structured as an inverted tree, delegation of administrative authority at each level, and caching with time-based expiration[^historyOfDomains]. Mockapetris also wrote the first implementation, called "Jeeves," for the TOPS-20 operating system. In 1984, four UC Berkeley students created BIND (Berkeley Internet Name Domain), which became the dominant DNS server software. On March 15, 1985, `symbolics.com` became the first registered `.com` domain[^internetSociety2013].

The DNS namespace is a tree rooted at `.` (the root). Each node carries a label up to 63 characters long, and fully qualified domain names (FQDNs) cannot exceed 253 characters. The tree branches into top-level domains (TLDs), second-level domains, subdomains, and so on — each level capable of independent administration.

## Architecture and hierarchy

DNS resolution depends on a strict delegation chain involving three tiers of nameservers, each responsible for progressively more specific portions of the namespace.

**Root nameservers** sit at the apex. There are 13 named root server identities (`a.root-servers.net` through `m.root-servers.net`) — a number originally dictated by the 512-byte UDP packet limit in RFC 1035, which could fit exactly 13 IPv4 address records. These 13 identities are operated by 12 independent organizations, including Verisign (which operates two: A and J), NASA, the U.S. Army Research Lab, ICANN, RIPE NCC, and Japan's WIDE Project. Through anycast routing, these 13 logical addresses map to over 2,000 physical server instances distributed across six continents[^iana].

**TLD nameservers** handle the next level of delegation. IANA manages over 1,500 TLDs, categorized as generic TLDs (`.com`, `.org`, `.net`), country-code TLDs (`.uk`, `.de`, `.jp`), and infrastructure domains (`.arpa`, used for reverse DNS). When queried, TLD servers respond with referrals to the authoritative nameservers for a specific second-level domain.

**Authoritative nameservers** are the final authority. They hold the actual DNS zone data — A, AAAA, MX, and other records — for a domain and return definitive answers from their local zone files without querying other servers. Delegation flows downward through NS records: the root zone delegates `.com` to Verisign's TLD servers; the `.com` TLD delegates `example.com` to that domain's authoritative servers; domain owners can further delegate subdomains. This chain is what makes DNS both scalable and administratively decentralized.

## The resolution process

When a user types `www.example.com` into a browser, the resolution process involves multiple actors and up to eight distinct steps, though caching typically short-circuits most of them.

The process begins at the **stub resolver** — a lightweight DNS client embedded in the operating system (such as `glibc` on Linux or the Windows DNS Client). The stub resolver first checks the browser's internal DNS cache, then the OS-level cache and local hosts file (`/etc/hosts` on Unix, `C:\Windows\System32\drivers\etc\hosts` on Windows). On a cache miss, it sends a *recursive query* to a configured recursive resolver — the user's ISP resolver by default, or a public resolver like Google's `8.8.8.8` or Cloudflare's `1.1.1.1`.

The **recursive resolver** takes full responsibility for finding the answer. On its own cache miss, it begins a series of *iterative queries*:

1. Query a root server: receives a referral to the `.com` TLD servers.
2. Query a TLD server: receives a referral to `example.com`'s authoritative nameservers.
3. Query the authoritative nameserver: receives the definitive A record (e.g., `93.184.216.34`).

The recursive resolver caches the result — along with all intermediate referrals — and returns the IP address to the stub resolver. The entire chain typically completes in under 100 milliseconds[^cloudflareA].

The distinction between recursive and iterative queries is fundamental. In a *recursive query*, the client demands a complete answer — the server must either resolve it fully or return an error. In an *iterative query*, the server returns the best it has, often a referral, and the querying party follows up. Stub resolvers make recursive queries; recursive resolvers make iterative queries upstream[^cbtNuggets].

A subtle but important mechanism here is the **glue record**. When a domain's nameservers are hosted within the domain itself (e.g., `ns1.example.com` is authoritative for `example.com`), a circular dependency arises — finding `ns1.example.com` requires querying the server whose address is unknown. Glue records — A/AAAA records placed in the parent zone's additional section — break this cycle by providing the nameserver's IP address directly, without a separate lookup[^lucianSystems].

DNS primarily uses UDP on port 53 for speed. If a response exceeds 512 bytes, the server sets the TC (Truncation) bit and the client retries over TCP. EDNS0 (RFC 6891) extends UDP payload capacity to typically 4,096 bytes, though 1,232 bytes is now recommended to avoid IP fragmentation. TCP is also used for zone transfers (AXFR/IXFR) between primary and secondary authoritative servers.

## Resource record types

DNS records — formally called **Resource Records** (RRs) — are stored in zone files with a consistent format: Name, TTL, Class (almost always `IN` for Internet), Type, and RDATA. While approximately 90 record types exist, eight are fundamental to daily operations[^cloudflareB].

| Record | Type # | Purpose |
|--------|--------|---------|
| A | 1 | Maps a name to an IPv4 address |
| AAAA | 28 | Maps a name to an IPv6 address |
| CNAME | 5 | Aliases one name to another canonical name |
| MX | 15 | Directs email delivery to a mail server |
| NS | 2 | Declares authoritative nameservers for a zone |
| SOA | 6 | Stores zone administrative metadata |
| TXT | 16 | Stores arbitrary text (SPF, DKIM, DMARC, etc.) |
| PTR | 12 | Reverse DNS: maps IP addresses to names |

**A records** map a domain to a 32-bit IPv4 address; multiple A records on the same name enable round-robin load balancing. **AAAA records** serve the same function for 128-bit IPv6 addresses — the name reflects that IPv6 addresses are four times the size of IPv4.

**CNAME records** create aliases, pointing one name to another "canonical" name. The resolver follows the chain until it reaches an A or AAAA record. CNAMEs carry two critical restrictions: they cannot coexist with other record types at the same name, and they cannot be placed at the zone apex. Non-standard ALIAS/ANAME records work around the apex limitation.

**MX records** direct email delivery with priority values — lower numbers indicate higher priority, providing an ordered fallback chain if a primary mail server is unreachable. MX records must point to hostnames with valid A records, never directly to IP addresses.

**SOA records** store administrative metadata: the primary nameserver (MNAME), administrator email (RNAME, with `@` replaced by a dot), a serial number incremented on every zone change, and four timing fields — Refresh, Retry, Expire, and Minimum TTL (which per RFC 2308 governs negative caching duration). Every zone has exactly one SOA record[^wikipediaSOA].

**TXT records** have become the backbone of email authentication: SPF records specify authorized sending servers, DKIM records store public keys for email signature verification, and DMARC records define policies for handling authentication failures — all encoded as TXT entries in the zone.

**PTR records** perform reverse DNS, mapping IP addresses back to domain names within the special `in-addr.arpa` domain. The IP address is reversed — `93.184.216.34` becomes `34.216.184.93.in-addr.arpa`. PTR records are essential for email deliverability, as many mail servers reject messages from IPs without valid reverse DNS.

## Caching and TTL

DNS would be unusably slow without caching. Every Resource Record carries a **TTL (Time to Live)** — a 32-bit unsigned integer specifying the maximum seconds a resolver may cache it before discarding. TTL values represent a direct tradeoff: longer TTLs reduce query load and improve resilience but delay propagation of changes; shorter TTLs enable rapid failover but increase query volume and authoritative server load.

Common TTL ranges:

- **60–300 seconds**: Volatile records, dynamic load balancing, pre-migration windows.
- **3,600 seconds (1 hour)**: Moderate-change environments; a common default.
- **86,400 seconds (24 hours)**: Stable infrastructure such as MX or NS records.

Per RFC 2181, the maximum valid TTL is `2,147,483,647` seconds (2³¹ − 1); if the high-order bit is set, implementations treat the value as zero[^elzBush1997].

Caching operates at multiple layers. Browser caches (viewable in Chrome at `chrome://net-internals/#dns`) are the fastest but shortest-lived. OS caches (managed by services like `systemd-resolved` on Linux) persist longer. Recursive resolver caches are the most impactful — serving potentially millions of users, a single cache hit eliminates load on the entire authoritative chain.

As a record moves through the caching hierarchy, its TTL decrements in real time. If an authoritative server returns a record with TTL 3,600 and a recursive resolver serves it 600 seconds later, the client receives TTL 3,000. RFC 8767 (March 2020) introduced *serve-stale* behavior, allowing resolvers to return expired records when authoritative servers are temporarily unreachable, improving resilience during outages[^lawrenceKumari2020].

**Negative caching**, formalized in RFC 2308, covers the equally important case where a domain does not exist (NXDOMAIN) or has no records of the requested type (NODATA). The authoritative server includes its SOA record in the response; the negative cache TTL is the minimum of the SOA's own TTL and its MINIMUM field, capped at 86,400 seconds. This prevents resolvers from repeatedly querying for non-existent names, which would otherwise impose severe load on authoritative infrastructure[^andrews1998].

Best practice for planned DNS migrations: lower TTLs 24–48 hours before the change to flush stale long-TTL records from remote caches, execute the change, then raise TTLs back to normal.

## Encrypted DNS: DoH and DoT

Traditional DNS sends queries and responses in plaintext over UDP port 53, exposing every domain lookup to anyone on the network path — ISPs, network operators, or surveillance infrastructure. Two complementary protocols now encrypt this traffic.

**DNS over TLS** (DoT), specified in RFC 7858, wraps standard DNS wire-format messages in TLS on a dedicated port 853. The client establishes a TCP connection, completes a TLS handshake, and transmits queries within the encrypted session. Multiple queries can be pipelined on a single connection to amortize handshake cost. DoT supports two modes: *opportunistic* (falls back to plaintext if TLS fails) and *strict* (fails entirely if TLS authentication cannot be verified). Android 9 and later support DoT natively[^hu2016].

**DNS over HTTPS** (DoH), specified in RFC 8484, encapsulates DNS messages within standard HTTPS requests on port 443. Because DoH traffic is indistinguishable from normal HTTPS at the transport level, it is far more resistant to network-level blocking. Firefox enabled DoH by default for U.S. users in February 2020; Chrome followed in May 2020[^hoffmanMcManus2018].

The key practical difference between the two: DoT uses a dedicated port and is trivially identifiable — and blockable — by network administrators, while DoH blends into HTTPS traffic. This makes DoT preferable for enterprise environments that need to maintain DNS monitoring, and DoH preferable for users prioritizing privacy against network-level surveillance. Both protocols encrypt only the hop between client and recursive resolver; the resolver still queries authoritative servers using traditional unencrypted DNS.

A more recent innovation, **Oblivious DoH** (ODoH), defined in RFC 9230 (June 2022), adds a proxy layer so that no single entity knows both the client's identity and their query content — addressing the privacy limitation inherent in trusting a single resolver.

## Security vulnerabilities

DNS was designed for resilience, not security. Its reliance on unsigned, unauthenticated UDP creates an attack surface that adversaries have exploited in increasingly sophisticated ways.

### Cache poisoning and the Kaminsky attack

**DNS cache poisoning** (also called DNS spoofing) involves injecting forged records into a resolver's cache by racing to send a spoofed response before the legitimate one arrives. The landmark **Kaminsky attack** (2008) made this devastatingly practical. Dan Kaminsky discovered that by querying for random, non-existent subdomains — guaranteed cache misses — an attacker could make unlimited attempts without waiting for TTL expiry. Crucially, he targeted the Authority section to inject rogue NS records, hijacking resolution for an entire domain rather than just a single hostname[^unixwiz].

Pre-Kaminsky resolvers validated responses using only a 16-bit transaction ID (~65,536 possibilities), often with a fixed source port. Emergency patches added source port randomization, expanding entropy to roughly 32 bits (~4.3 billion combinations). The **SAD DNS attack** (2020) later demonstrated that ICMP rate-limit side channels could reveal randomized source ports, reducing effective entropy back to approximately 16 bits[^cloudflare2020].

### DNS amplification DDoS

DNS amplification exploits the asymmetry between small queries and large responses. Attackers send tiny queries with a spoofed source IP (the victim's address) to open recursive resolvers. With EDNS0 enabling responses up to 4,096 bytes, amplification factors reach 54× to 70× — a 60-byte query triggering a 4,000-byte response. DNSSEC-signed zones amplify this further, as cryptographic signatures add 400–800 bytes per response. The 2013 Spamhaus attack reached 300 Gbps using this technique; subsequent attacks have exceeded 1 Tbps[^imperva].

### DNS tunneling and data exfiltration

DNS tunneling exploits the near-universal allowance of DNS traffic through firewalls. Malware encodes exfiltrated data into subdomain labels (e.g., `encoded-data.attacker.com`) and receives commands via A or TXT record responses from attacker-controlled authoritative servers. Research from Palo Alto's Unit 42 found that approximately 80% of malware leverages DNS for command-and-control communications. Detection relies on identifying anomalous patterns: unusually long subdomain names, high query entropy, excessive NXDOMAIN rates, and abnormal TXT record volumes[^infoblox].

## DNSSEC

**DNSSEC** (DNS Security Extensions), defined in RFCs 4033–4035[^arends2005], adds data origin authentication and integrity verification to DNS through a cryptographic chain of trust. It does not encrypt DNS traffic — it signs it, enabling resolvers to verify that responses are genuine and unmodified.

DNSSEC introduces four new record types:

- **RRSIG**: Digital signatures over Resource Record Sets.
- **DNSKEY**: Public keys used to verify those signatures.
- **DS (Delegation Signer)**: A hash of the child zone's key, placed in the parent zone to create the cross-zone trust link.
- **NSEC/NSEC3**: Authenticated denial of existence, proving a queried name genuinely does not exist (NSEC3 uses hashed names to prevent zone enumeration).

The signing architecture uses two key pairs. The **Zone Signing Key** (ZSK) signs all record sets in the zone and is rotated frequently — typically monthly — with smaller key sizes for efficiency. The **Key Signing Key** (KSK) signs only the DNSKEY record set and is rotated infrequently because changing it requires updating the parent zone's DS record. This separation allows routine ZSK rotation without cross-zone coordination[^cloudflareC].

Validation follows the chain upward. A resolver verifies the A record signature using the zone's public ZSK, verifies the ZSK using the KSK, confirms the KSK's hash matches the parent zone's DS record, and continues up through the TLD to the root **trust anchor** — a preconfigured copy of the root zone's public KSK that every validating resolver ships with. The root zone has been DNSSEC-signed since July 15, 2010; `.com` since April 1, 2011[^icann2019]. The first root KSK rollover was completed on October 11, 2018; a new trust anchor generated in 2024 is planned for activation in 2026[^icannKSK].

Despite its security value, DNSSEC adoption remains uneven. Roughly 48% of country-code TLDs are signed, but second-level domain adoption in `.com` sits at approximately 4%. Nordic countries lead: the Netherlands (`.nl`) exceeds 60% adoption, with Sweden, Norway, and Czech Republic above 50%. Global DNSSEC validation rates average approximately 35%, with the EU at about 49% as of late 2025[^euJRC2023]. Barriers include operational complexity, larger response sizes that worsen amplification attacks, and the absence of direct user-facing benefits until deployment reaches critical mass.

## References

[^andrews1998]: Andrews, M. (1998). *Negative caching of DNS queries* (RFC 2308). IETF. https://datatracker.ietf.org/doc/html/rfc2308

[^arends2005]: Arends, R., Austein, R., Larson, M., Massey, D., & Rose, S. (2005). *DNS security introduction and requirements* (RFC 4033). IETF. https://datatracker.ietf.org/doc/html/rfc4033

[^cbtNuggets]: CBT Nuggets. (n.d.). *What is DNS recursive lookup? How does it compare to iterative lookup?* https://www.cbtnuggets.com/blog/technology/networking/dns-recursive-vs-iterative-lookup

[^cloudflareA]: Cloudflare. (n.d.). *What is DNS?* https://www.cloudflare.com/learning/dns/what-is-dns/

[^cloudflareB]: Cloudflare. (n.d.). *What are DNS records?* https://www.cloudflare.com/learning/dns/dns-records/

[^cloudflareC]: Cloudflare. (n.d.). *How does DNSSEC work?* https://www.cloudflare.com/learning/dns/dnssec/how-dnssec-works/

[^cloudflare2020]: Cloudflare. (2020, November 12). *SAD DNS explained*. Cloudflare Blog. https://blog.cloudflare.com/sad-dns-explained/

[^elzBush1997]: Elz, R., & Bush, R. (1997). *Clarifications to the DNS specification* (RFC 2181). IETF. https://datatracker.ietf.org/doc/html/rfc2181

[^euJRC2023]: EU Joint Research Centre. (2023). *Internet standards: Domain Name System Security Extensions (DNSSEC) — an analysis of uptake in the EU*. European Commission. https://publications.jrc.ec.europa.eu/repository/handle/JRC143100

[^historyOfDomains]: History of Domains. (n.d.). *Paul Mockapetris invented the Domain Name System*. https://www.historyofdomains.com/paul-mockapetris/

[^hoffmanMcManus2018]: Hoffman, P., & McManus, P. (2018). *DNS queries over HTTPS (DoH)* (RFC 8484). IETF. https://datatracker.ietf.org/doc/html/rfc8484

[^hu2016]: Hu, Z., Zhu, L., Heidemann, J., Mankin, A., Wessels, D., & Hoffman, P. (2016). *Specification for DNS over Transport Layer Security (TLS)* (RFC 7858). IETF. https://datatracker.ietf.org/doc/html/rfc7858

[^iana]: IANA. (n.d.). *Root servers*. https://www.iana.org/domains/root/servers

[^icannRootSystem]: ICANN. (n.d.). *The root server system*. https://www.icann.org/root-server-system-en

[^icannKSK]: ICANN. (n.d.). *Root zone KSK rollover*. https://www.icann.org/resources/pages/ksk-rollover-2018-en

[^icann2019]: ICANN. (2019, March 5). *DNSSEC — what is it and why is it important?* https://www.icann.org/resources/pages/dnssec-what-is-it-why-important-2019-03-05-en

[^imperva]: Imperva. (n.d.). *What is DNS amplification?* https://www.imperva.com/learn/ddos/dns-amplification/

[^infoblox]: Infoblox. (n.d.). *DNS data exfiltration*. https://www.infoblox.com/dns-security-resource-center/dns-security-issues-threats/dns-security-threats-data-exfiltration/

[^internetSociety2013]: Internet Society. (2013, November). *Celebrating 30 years of the Domain Name System (DNS)*. https://www.internetsociety.org/blog/2013/11/celebrating-30-years-of-the-domain-name-system-dns-this-month/

[^lawrenceKumari2020]: Lawrence, D., & Kumari, W. (2020). *Serving stale data to improve DNS resiliency* (RFC 8767). IETF. https://datatracker.ietf.org/doc/rfc8767/

[^lucianSystems]: Lucian Systems. (n.d.). *Understanding glue records and dedicated DNS*. https://luciansystems.com/understanding-glue-records-and-dedicated-dns/

[^mockapetris1987a]: Mockapetris, P. (1987a). *Domain names — concepts and facilities* (RFC 1034). IETF. https://datatracker.ietf.org/doc/html/rfc1034

[^mockapetris1987b]: Mockapetris, P. (1987b). *Domain names — implementation and specification* (RFC 1035). IETF. https://datatracker.ietf.org/doc/html/rfc1035

[^unixwiz]: Unixwiz. (n.d.). *An illustrated guide to the Kaminsky DNS vulnerability*. http://unixwiz.net/techtips/iguide-kaminsky-dns-vuln.html

[^wikipediaSOA]: Wikipedia. (n.d.). *SOA record*. https://en.wikipedia.org/wiki/SOA_record

[^wikipediaDNSSEC]: Wikipedia. (n.d.). *Domain Name System Security Extensions*. https://en.wikipedia.org/wiki/Domain_Name_System_Security_Extensions
