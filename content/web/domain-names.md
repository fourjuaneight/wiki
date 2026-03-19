---
title: "Domain Names"
date: 2026-03-19
draft: false
tags:
  - infrastructure
  - networking
---

A **domain name** is a human-readable address that maps to a numerical IP address on the Internet, allowing users to locate servers and services without memorizing long numeric strings. Every device connected to the Internet is reachable via a unique IP address — for example, `192.0.2.172` in IPv4 — but such addresses are impractical for everyday use. The Domain Name System (DNS) solves this by maintaining a globally distributed directory that translates memorable names like `mozilla.org` into their underlying addresses (Mozilla, n.d.).

The design is deliberately flexible: a domain name is not permanently bound to a single IP address. Because the mapping is stored in DNS records rather than hardcoded anywhere, it can be updated quickly and propagated across the Internet's infrastructure within roughly 48 hours (ICANN, n.d.-b). This decoupling of name from address is what makes things like load balancing, server migrations, and redundant hosting possible.

## Structure and hierarchy

Domain names are hierarchical, read from right to left, with each component separated by a dot. The domain `developer.mozilla.org` has three levels: `org` is the top-level, `mozilla` is the second-level, and `developer` is the third-level (ICANN, n.d.-a).

The rightmost component is the **Top-Level Domain** (TLD). Generic TLDs like `.com`, `.org`, and `.net` carry no mandatory criteria, but others are restricted by policy. Country-code TLDs such as `.us` or `.fr` typically require a connection to that region; `.gov` is reserved exclusively for government bodies; `.edu` is limited to accredited academic institutions (Mozilla, n.d.). The full authoritative list of TLDs is maintained by ICANN.

The label immediately to the left of the TLD is the **Second-Level Domain** (SLD) — the name a registrant actually registers and owns the right to use. Labels throughout the hierarchy follow the LDH rule: letters A–Z, digits 0–9, and hyphens, between one and sixty-three characters in length, with hyphens disallowed as the first or last character (Wikipedia, n.d.).

**Subdomains** extend a registered domain further to the left. An organization that controls `google.com` can freely create `mail.google.com`, `docs.google.com`, or any other prefix it chooses, without registering anything new (Google, 2026). Each such label delegates a new zone of authority within the parent domain.

## The Domain Name System

The DNS is the distributed infrastructure that performs the translation from name to address. It operates as a client–server database with a strict hierarchy of authority. At the top sit the **root name servers** — thirteen IP addresses, each potentially served by dozens of geographically distributed machines, all holding identical copies of the root zone file that indexes every TLD (ICANN, n.d.-b). Below them, each TLD is administered by a dedicated **registry** that maintains records for all second-level domains registered under it (ICANN, n.d.-c).

Each registered domain must have at least one **authoritative name server** — the definitive source of DNS records for that domain. Records stored there include the A record (IPv4 address), AAAA record (IPv6 address), MX records (mail routing), CNAME records (aliases), and TXT records (verification and policy data), among others (Google, 2026).

### Resolution process

When a browser needs to resolve a domain, the process follows a recursive path:

1. The operating system checks its **local DNS cache**. If a valid cached record exists, resolution completes immediately.
2. If not cached, the query goes to a **recursive resolver** — typically operated by the user's ISP or a public service like `8.8.8.8`.
3. The resolver, if it lacks a cached answer, queries a root name server to find the authoritative server for the relevant TLD.
4. It then queries the TLD's name server to find the authoritative server for the specific domain.
5. Finally, it queries that authoritative server, which returns the IP address.
6. The resolver caches the result for the duration specified by the record's **TTL** (Time To Live) and returns it to the browser (Mozilla, n.d.).

This chain of queries typically completes in milliseconds. DNS records are cached at multiple levels, so repeated lookups for the same domain skip most of the chain.

## Governance and registration

ICANN — the **Internet Corporation for Assigned Names and Numbers** — is the nonprofit body responsible for coordinating the DNS at a global level. It maintains the root zone, accredits registrars, sets policy for new TLDs, and manages IP address allocation in parallel (ICANN, n.d.-c). ICANN does not itself sell domain names; instead, it contracts with registries (one per TLD) and accredits hundreds of competing **registrars** that sell registrations to the public.

Registrants do not purchase domain names outright — they license the right to use a name for a period of one or more years, with renewal priority over new applicants (Mozilla, n.d.). The registrar stores contact and technical information and submits records to the relevant registry, which in turn makes them available via the WHOIS protocol. WHOIS is a public directory mapping domain names to their registrant details, though privacy services can mask personal information from public view (Google, 2026).

> "ICANN coordinates these unique identifiers across the world. Without that coordination we wouldn't have one global Internet."
> — ICANN (n.d.-b)

## Internationalized Domain Names

The original DNS specification restricted labels to ASCII characters, effectively excluding the native scripts of the majority of the world's Internet users. To address this, ICANN approved the **Internationalized Domain Names in Applications** (IDNA) system, which encodes Unicode strings into ASCII-compatible form using Punycode before submitting them to DNS (Wikipedia, n.d.). A label in Devanagari script, for instance, is stored internally as an A-label prefixed with `xn--`, while browsers display the Unicode form (the U-label) to users (ICANN, n.d.-d). Country-code TLDs in Arabic, Chinese, Cyrillic, and other scripts became available beginning in 2009.

## Domain names vs. URLs and websites

A domain name is not the same thing as a URL or a website. A URL such as `https://example.com/about` includes the scheme (`https`), the domain (`example.com`), and a path (`/about`). The domain name is only one component. Registering a domain name also does not automatically create a website: DNS records must be configured to point to a server, and that server must be provisioned with hosting, web software, and content before anything is accessible (ICANN, n.d.-a). The analogy is apt — a domain name is a postal address, but there still needs to be a building at that address.

## References

- Google. (2026, March 16). *Domain name basics*. Google Workspace Help. https://knowledge.workspace.google.com/admin/domains/domain-name-basics
- Internet Corporation for Assigned Names and Numbers. (n.d.-a). *About domain names*. ICANN. https://www.icann.org/resources/pages/about-domain-names-2018-08-30-en
- Internet Corporation for Assigned Names and Numbers. (n.d.-b). *What does ICANN do?* ICANN. https://www.icann.org/resources/pages/what-2012-02-25-en
- Internet Corporation for Assigned Names and Numbers. (n.d.-c). *FAQs*. ICANN. https://www.icann.org/resources/pages/faqs-2014-01-21-en
- Internet Corporation for Assigned Names and Numbers. (n.d.-d). *The Domain Name System*. ICANN. https://www.icann.org/resources/pages/dns-2022-09-13-en
- Mozilla. (n.d.). *What is a domain name?* MDN Web Docs. https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_domain_name
- Wikipedia. (n.d.). *Domain Name System*. https://en.wikipedia.org/wiki/Domain_Name_System