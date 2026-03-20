---
title: "Web Encryption"
date: 2026-03-20
updated: 2026-03-19
draft: false
tags:
  - networking
  - security
  - ssl
  - tls
---

**Transport Layer Security** (TLS) and its predecessor, **Secure Sockets Layer** (SSL), are the cryptographic protocols that secure the vast majority of internet traffic. Together they ensure that data exchanged between a browser and a web server is confidential, tamper-evident, and authenticated — the three properties that make HTTPS meaningful. Originally developed at Netscape in 1995 to protect e-commerce transactions that would otherwise travel in plaintext, SSL was succeeded by TLS under the Internet Engineering Task Force (IETF). Today, TLS 1.3, standardized as RFC 8446 in August 2018, is the recommended version, having eliminated an entire generation of cryptographic weaknesses through a near-complete redesign[^rescorla2018].

Despite the name change, "SSL" persists as colloquial shorthand — SSL certificates, SSL inspection, SSL termination — even though every protocol version labelled SSL is now formally deprecated[^awsB]. Understanding why requires tracing both the history of the protocols and the attacks that forced each revision, since TLS 1.3's design choices are largely unintelligible without that context.

## History and version evolution

SSL 1.0 was never publicly released; internal review at Netscape found critical flaws before it shipped. SSL 2.0 became the first public version in 1995, followed by SSL 3.0 in 1996 with significant architectural improvements[^awsB]. Ownership of the protocol then transferred to the IETF, which published TLS 1.0 as RFC 2246 in 1999. The change in name signalled the change in stewardship; the technical differences from SSL 3.0 were real but not sweeping — most notably, TLS 1.0 replaced SSL's MD5-based message authentication with HMAC and introduced a more rigorous key derivation function[^awsB]. TLS 1.1 (RFC 4346, 2006) added explicit initialization vectors to close a CBC padding vulnerability. TLS 1.2 (RFC 5246, 2008) made the largest pre-1.3 leap: it introduced support for AEAD cipher suites, made SHA-256 the default hash, and allowed flexible cipher suite negotiation.

The deprecation timeline reflects the community's response to a decade of attacks. SSL 3.0 was formally deprecated by RFC 7568 in June 2015 after the POODLE attack exposed fundamental weaknesses in its CBC padding scheme. TLS 1.0 and TLS 1.1 were deprecated by RFC 8996 in March 2021, and all major browser vendors had already removed support by early 2020[^mcKayCooper2019]. TLS 1.2 remains acceptable but only with a carefully restricted set of cipher suites; TLS 1.3 is the recommended baseline for any new deployment.

## Symmetric and asymmetric cryptography

TLS operates as a hybrid cryptosystem, deliberately combining asymmetric and symmetric encryption to balance security guarantees with computational cost[^cloudflareB].

**Asymmetric cryptography** uses mathematically linked key pairs: data encrypted with the public key can only be decrypted with the corresponding private key. RSA and Elliptic Curve Cryptography (ECC) are the dominant asymmetric algorithms in TLS. The Internet Society[^internetSociety] (n.d.) recommends a minimum RSA key length of 2048 bits, noting that 2048-bit RSA provides roughly the same strength as a 112-bit symmetric key. The trade-off is speed: asymmetric operations are up to a thousand times more computationally expensive than symmetric equivalents, making them impractical for bulk data encryption.

**Symmetric cryptography** uses a single shared key for both encryption and decryption. AES (Advanced Encryption Standard) with 128- or 256-bit keys is the standard choice — fast enough to operate at line rate even on modest hardware. The classic problem with symmetric encryption is distributing the shared key securely over an untrusted network, which is precisely what the asymmetric phase of TLS solves. During the handshake, the two parties use asymmetric mechanisms to agree on a shared secret; all application data is then protected with symmetric session keys derived from that secret. Once the session ends, the session keys are discarded[^cloudflareA].

## The TLS handshake

The handshake is the negotiation phase that precedes any application data. Its goals are mutual or one-sided authentication, cipher suite agreement, and session key derivation. The mechanics differ substantially between TLS 1.2 and TLS 1.3.

### TLS 1.2 handshake (2-RTT)

The TLS 1.2 handshake requires two full round trips. The client opens with a *ClientHello* carrying its supported protocol versions, a list of cipher suites it accepts, and a random nonce (the "client random"). The server responds with a *ServerHello* selecting a cipher suite, its own random nonce, and its certificate. The client validates this certificate against its trust store; if it passes, the client either encrypts a random *premaster secret* with the server's public key (RSA key exchange) or completes a Diffie-Hellman exchange. Both sides independently derive identical session keys by combining the premaster secret with the two random values using a pseudorandom function. Finally, both sides exchange *Finished* messages encrypted with the new session keys to confirm that the handshake succeeded and that no tampering occurred in transit[^cloudflareB].

### TLS 1.3 handshake (1-RTT)

TLS 1.3 collapses the handshake to a single round trip by restricting key exchange to ephemeral Diffie-Hellman variants and using a small, known set of named groups (such as X25519 and P-256). Because the client can predict which groups the server supports, it speculatively includes Diffie-Hellman key shares in its *ClientHello* — skipping the negotiation step that TLS 1.2 requires. The server selects a compatible share, derives the session key, and immediately returns its own key share, encrypted certificate, a digital signature over the entire handshake transcript, and its *Finished* message — all in one flight. The client verifies, sends its own *Finished*, and encrypted data flows[^rescorla2018].

TLS 1.3 also supports **0-RTT resumption** for returning clients. A resumption master secret from a prior session (stored as a session ticket) allows the client to send application data in its very first message, eliminating connection latency entirely for repeat visitors. The trade-off is that 0-RTT data is not forward-secret against session-ticket compromise and is susceptible to replay attacks; RFC 8446 recommends restricting 0-RTT to idempotent requests and implementing server-side anti-replay mechanisms[^rescorla2018].

## Digital certificates and the chain of trust

Encryption without authentication only provides privacy, not security — a client needs assurance that the server it is encrypting data to is genuinely who it claims to be. This assurance comes from **digital certificates** conforming to the ITU-T X.509 standard.

An X.509 certificate is a signed data structure that binds a public key to an identity, typically a domain name. It carries the domain, the issuing **Certificate Authority** (CA), the CA's cryptographic signature, validity dates, the server's public key, and applicable key usage flags[^awsA]. The CA's signature is what makes the certificate verifiable by third parties: a client can validate it against its pre-installed set of trusted root certificates without having any prior relationship with the server.

CAs form a hierarchy. Root CAs, whose certificates ship with operating systems and browsers, sign intermediate CA certificates, which in turn sign end-entity server certificates. This chain structure protects the root's private key: an intermediate certificate can be revoked without invalidating the entire hierarchy[^internetSociety]. Roughly fifty publicly trusted root CAs exist today; most must pass periodic audits such as WebTrust or ETSI EN 319 411-3 to maintain their trusted status.

Three validation levels govern how thoroughly an applicant is vetted before issuance. *Domain Validated* (DV) certificates require only proof of domain control — a DNS record or a file placed at a well-known URL — and can be issued in seconds. *Organization Validated* (OV) certificates additionally verify the organization's name and address against public records. *Extended Validation* (EV) certificates require the most rigorous vetting, including legal existence, physical location, and authorized representative checks[^internetSociety]. Certificate lifespans have been steadily shortened to limit the exposure window from a compromised private key; maximum validity reached 200 days in March 2026, continuing a long-running trend from the earlier 398-day and 825-day limits[^sslcomB].

## Known vulnerabilities and their impact on protocol design

TLS 1.3's design is best understood as a direct response to a decade of attacks against SSL and TLS 1.2. Each vulnerability exposed not just a specific bug but a category of design decision that proved untenable.

**Heartbleed** (CVE-2014-0160, disclosed April 2014) was a buffer over-read in OpenSSL's Heartbeat extension. An attacker could extract up to 64 kilobytes of server memory per request, potentially recovering private keys, session cookies, and passwords. At disclosure, approximately 66% of active HTTPS servers were running vulnerable OpenSSL versions, prompting mass key rotations and spawning both Google's BoringSSL and OpenBSD's LibreSSL forks. Heartbleed was an implementation bug, not a protocol flaw, but its scale accelerated the push to modernize TLS[^nvd2014].

**POODLE** (CVE-2014-3566) was a protocol flaw in SSL 3.0's CBC padding validation. A man-in-the-middle attacker who could force a protocol downgrade from TLS to SSL 3.0 could use a padding oracle to decrypt roughly one byte of session cookie per 256 requests. POODLE finalized SSL 3.0's deprecation and produced RFC 7507, which introduced TLS_FALLBACK_SCSV — a signaling cipher suite that allows servers to detect and reject forced downgrade attempts[^sheffer2015].

**BEAST** (CVE-2011-3389) exploited TLS 1.0's use of predictable CBC initialization vectors. Combined with a chosen-plaintext oracle, an attacker adjacent to the victim could decrypt HTTP session cookies. The fix was upgrading to TLS 1.1 or later, which introduced per-record random IVs, or applying the 1/n-1 record-splitting workaround[^sheffer2015].

**DROWN** (CVE-2016-0800) was a cross-protocol attack that used a live SSLv2 server as a Bleichenbacher oracle to decrypt TLS sessions from other connections — including TLS 1.2 sessions — as long as both shared the same RSA private key. The general DROWN attack cost around $440 in cloud compute and under eight hours; a variant exploiting an OpenSSL bug completed in under a minute on a single core. At disclosure, 33% of all HTTPS servers were vulnerable[^drownAttack2016].

**FREAK** (CVE-2015-0204) and **Logjam** (CVE-2015-4000) were both legacies of 1990s US export regulations mandating artificially weakened cipher suites — 512-bit RSA for FREAK, 512-bit Diffie-Hellman for Logjam. Logjam's authors further demonstrated that precomputation against the most commonly reused 1024-bit DH primes — deployed by 17.9% of the top one million websites — could plausibly enable state-level passive decryption[^adrian2015]. TLS 1.3 eliminates export ciphers entirely and restricts Diffie-Hellman to curated named groups with safe parameters.

**CRIME** (CVE-2012-4929) and **BREACH** (CVE-2013-3587) exploited compression — at the TLS and HTTP layers respectively — to infer plaintext content from ciphertext length variations. TLS 1.3 removes TLS-level compression entirely. BREACH remains an application-layer concern requiring mitigations such as CSRF token randomization[^sheffer2015].

## TLS 1.3 as a redesigned protocol

TLS 1.3 is not an incremental patch on TLS 1.2 — it was developed over five years, went through 28 draft revisions, and included formal verification using the TLS13Tamarin prover, an unusually rigorous process for an IETF standard[^cloudflare2018]. The result is a protocol defined as much by what it removed as by what it added.

The removal list is comprehensive. TLS 1.3 eliminates static RSA key exchange (which provides no forward secrecy), all CBC-mode ciphers (the source of BEAST, Lucky13, and POODLE), RC4 (broken by statistical bias attacks), MD5 and SHA-1 for handshake integrity, PKCS#1 v1.5 signature padding (vulnerable to Bleichenbacher-style timing attacks), export cipher suites, TLS compression, renegotiation, and the MAC-then-encrypt construction — replacing all of the above with AEAD exclusively[^rescorla2018].

What remains is a stripped-down protocol built on well-analyzed primitives. Key exchange uses only ephemeral (EC)DHE, making **perfect forward secrecy** mandatory for every connection — past sessions remain secure even if the server's long-term private key is later compromised. Record protection uses exclusively AEAD ciphers, with AES-GCM and ChaCha20-Poly1305 as the standard choices. HKDF (HMAC-based Extract-and-Expand Key Derivation Function) replaces the older PRF for key derivation. The server signs the entire handshake transcript rather than selected fields, directly preventing the unsigned-negotiation exploits behind FREAK, Logjam, and CurveSwap. All post-ServerHello handshake messages — including the server certificate — are encrypted, preventing passive observers from learning which domain a client is connecting to[^rescorla2018].

NIST Special Publication 800-52 Revision 2 required all US federal systems to support TLS 1.3 by January 1, 2024, and explicitly deprecated TLS 1.0 and 1.1 for federal use[^mcKayCooper2019].

## Deployment best practices

Correct TLS deployment in 2026 involves more than enabling the latest version. NIST, Mozilla, and OWASP converge on a consistent set of guidance across protocol configuration, cipher selection, certificate management, and application-layer hardening.

**Protocol version** configuration should offer TLS 1.3 as the default, with TLS 1.2 available only for backward compatibility. TLS 1.0, TLS 1.1, and all SSL versions must be disabled entirely[^mcKayCooper2019]. Mozilla's "Intermediate" server profile — the recommended baseline for most servers — permits TLS 1.2 and 1.3 and restricts TLS 1.2 cipher suites to ECDHE-based AEAD options such as `ECDHE-ECDSA-AES128-GCM-SHA256` and `ECDHE-RSA-CHACHA20-POLY1305`. The "Modern" profile restricts connections to TLS 1.3 only, appropriate where all clients can be expected to be current[^mozilla].

On the certificate side, NIST requires a minimum RSA key length of 2048 bits, with ECDSA P-256 increasingly preferred for smaller key sizes and faster operations[^mcKayCooper2019]. Automated certificate issuance and renewal via the ACME protocol — as implemented by Let's Encrypt — is strongly encouraged given the shortening validity windows. OCSP stapling should be enabled so servers proactively deliver revocation status to clients, eliminating client-initiated CA lookups that degrade performance and privacy. DNS CAA records should restrict certificate issuance to approved CAs to reduce the risk of misissuance[^internetSociety].

**HTTP Strict Transport Security** (HSTS) is an essential application-layer complement to TLS. An HSTS response header instructs browsers to enforce HTTPS-only connections to a domain for a specified duration, preventing downgrade attacks and accidental plaintext requests. Mozilla's guidance recommends a `max-age` of at least 63,072,000 seconds (two years) with the `includeSubDomains` and `preload` directives set[^mdn]. All cookies should carry the `Secure` attribute to prevent transmission over unencrypted connections.

Configuration drift is an ongoing risk. Tools such as Qualys SSL Labs Server Test, Mozilla Observatory, and the open-source `testssl.sh` provide comprehensive automated assessments that flag weak ciphers, missing security headers, certificate chain issues, and known vulnerabilities[^owasp].

[^adrian2015]: Adrian, D., Bhargavan, K., Durumeric, Z., Gaudry, P., Green, M., Halderman, J. A., Heninger, N., Springall, D., Thomé, E., Valenta, L., VanderSloot, B., Wustrow, E., Zanella-Béguelin, S., & Zimmermann, P. (2015). Imperfect forward secrecy: How Diffie-Hellman fails in practice. In *Proceedings of the 22nd ACM SIGSAC Conference on Computer and Communications Security* (pp. 5–17). ACM. https://weakdh.org/

[^awsA]: Amazon Web Services. (n.d.). *What is an SSL certificate?* AWS. https://aws.amazon.com/what-is/ssl-certificate/

[^awsB]: Amazon Web Services. (n.d.). *The difference between SSL and TLS*. AWS. https://aws.amazon.com/compare/the-difference-between-ssl-and-tls/

[^cloudflareA]: Cloudflare. (n.d.). *What is SSL?* Cloudflare Learning Center. https://www.cloudflare.com/learning/ssl/what-is-ssl/

[^cloudflareB]: Cloudflare. (n.d.). *What is Transport Layer Security (TLS)?* Cloudflare Learning Center. https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/

[^cloudflare2018]: Cloudflare. (2018, August 10). RFC 8446 (a.k.a. TLS 1.3). *The Cloudflare Blog*. https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/

[^drownAttack2016]: DROWN Attack. (2016). *DROWN: Decrypting RSA with obsolete and weakened eNcryption*. https://drownattack.com/

[^internetSociety]: Internet Society. (n.d.). *TLS basics*. Deploy360. https://www.internetsociety.org/deploy360/tls/basics/

[^mcKayCooper2019]: McKay, K. A., & Cooper, D. A. (2019). *Guidelines for the selection, configuration, and use of Transport Layer Security (TLS) implementations* (NIST Special Publication 800-52 Rev. 2). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.SP.800-52r2

[^mdn]: Mozilla Developer Network. (n.d.). *Transport Layer Security (TLS)*. MDN Web Docs. https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security

[^mozilla]: Mozilla. (n.d.). *Security/Server side TLS*. Mozilla Wiki. https://wiki.mozilla.org/Security/Server_Side_TLS

[^nvd2014]: National Vulnerability Database. (2014). *CVE-2014-0160 detail*. NIST. https://nvd.nist.gov/vuln/detail/CVE-2014-0160

[^owasp]: OWASP. (n.d.). *Transport Layer Security cheat sheet*. OWASP Cheat Sheet Series. https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html

[^rescorla2018]: Rescorla, E. (2018). *The Transport Layer Security (TLS) protocol version 1.3* (RFC 8446). Internet Engineering Task Force. https://datatracker.ietf.org/doc/html/rfc8446

[^sheffer2015]: Sheffer, Y., Holz, R., & Saint-Andre, P. (2015). *Summarizing known attacks on Transport Layer Security (TLS) and Datagram TLS (DTLS)* (RFC 7457). Internet Engineering Task Force. https://datatracker.ietf.org/doc/html/rfc7457

[^sslcomB]: SSL.com. (n.d.). *TLS 1.3 is here to stay*. https://www.ssl.com/article/tls-1-3-is-here-to-stay/