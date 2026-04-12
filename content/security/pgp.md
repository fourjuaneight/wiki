---
title: "PGP and GPG"
date: 2026-04-02
draft: false
tags:
  - cryptography
  - encryption
---

**Pretty Good Privacy (PGP)** is an encryption system that protects data through a combination of symmetric and asymmetric cryptography, digital signing, and a decentralized trust model. Rather than a single piece of software, PGP today refers to the **OpenPGP** standard — an open interoperability specification maintained by the Internet Engineering Task Force (IETF) — and a family of compatible implementations that share the same message format and cryptographic procedures. The standard was originally codified in RFC 2440, replaced by RFC 4880 in 2007, and most recently updated by RFC 9580 in July 2024.[^callas2007][^wouters2024]

**GNU Privacy Guard (GPG)**, also known as GnuPG, is the dominant open-source implementation of OpenPGP, providing the `gpg` command-line binary and a supporting agent daemon. Where the original PGP software relied on patented algorithms, GPG was built entirely from freely available cryptographic primitives. Other interoperable implementations include Sequoia PGP (Rust), OpenPGP.js (JavaScript), GopenPGP (Go), and Bouncy Castle (Java/C#); all speak the same wire format and can exchange messages with one another.[^gnupg2024]

## The hybrid cryptosystem

The central design insight of PGP is its **hybrid cipher architecture**, which solves two problems that neither symmetric nor asymmetric cryptography can solve alone. Symmetric ciphers — such as AES — are fast, processing gigabytes per second on modern hardware, but they require both parties to share a secret key in advance, creating a key-distribution problem. Asymmetric (public-key) ciphers — such as RSA or X25519 — solve key distribution elegantly: anyone can encrypt to a recipient's public key, and only the holder of the corresponding private key can decrypt. The drawback is that asymmetric ciphers are orders of magnitude slower than symmetric ones and are constrained by key size in the amount of data they can directly encrypt.[^perrin2004]

PGP resolves this tension by using each cipher for what it does best. When encrypting a message, GPG first generates a random **session key** — for example, 256 random bits for AES-256 — unique to that message. The plaintext is encrypted once with this session key using a fast symmetric cipher. The session key itself, a small piece of data, is then encrypted separately with the recipient's asymmetric public key. The result is a compact encrypted bundle: the recipient uses their private key to recover the session key, then uses the session key to decrypt the payload. Compromising a single session key exposes only that one message, not the recipient's entire history.[^perrin2004][^callas2007]

### Supported algorithms

The OpenPGP standard defines numeric identifiers for every supported algorithm, allowing implementations to negotiate which combination to use. RFC 4880 and its successor RFC 9580 together define the following algorithm families.[^callas2007][^wouters2024]

For **public-key operations**, GPG supports RSA (2048–4096 bits, for both signing and encryption), DSA (signing only), and ElGamal (encryption only). Modern configurations increasingly favor elliptic-curve algorithms: **Ed25519** for signing and **X25519** for encryption via ECDH key exchange. These Curve25519-based algorithms offer approximately 128-bit security with only 32-byte keys — equivalent to RSA-3072 — and carry significant operational advantages. Ed25519 signatures are deterministic, requiring no per-signature random nonce, which eliminates the catastrophic failure mode where nonce reuse in DSA or ECDSA leaks the private key outright. RFC 9580 also specifies Ed448/X448 for higher security margins and the NIST P-256/P-384/P-521 curves for environments that require them.[^wouters2024]

For **symmetric encryption** of the message payload, RFC 4880 mandated TripleDES as its baseline and recommended AES-128, while the full roster included CAST5, Blowfish, AES-192, AES-256, and Twofish. Modern GPG defaults to AES-256. RFC 9580 deprecates IDEA, TripleDES, and CAST5 for new message generation and sets AES-128 as the minimum for v6 messages.[^wouters2024]

**Hash algorithms** underpin both digital signatures and key fingerprints. RFC 4880 mandated SHA-1 and recommended SHA-256, with the full set including MD5, RIPEMD-160, and the SHA-2 family. RFC 9580 mandates SHA-256 as the minimum, deprecates MD5, SHA-1, and RIPEMD-160 for new generation, and uses SHA-256 for v6 key fingerprints in place of the now-weakened SHA-1.[^wouters2024]

## Key anatomy

What users loosely call "a PGP key" is a structured collection of OpenPGP packets called a **Transferable Public Key**. It contains a primary key, one or more user identity strings, self-signatures binding everything together, and optionally one or more subkeys.

The **primary key** is the identity anchor of the entire structure. Its most important role is *certification* — signing other people's keys to extend the Web of Trust, and signing its own subkeys and user IDs to bind them together. In GnuPG output, it appears as `pub` (public) or `sec` (secret). Each key carries flags indicating its permitted uses: certify (C), sign (S), encrypt (E), and authenticate (A).[^gnupg2024]

**Subkeys** are separate key pairs cryptographically bound to the primary key through a *binding signature* (OpenPGP signature type 0x18) issued by the primary key. For signing subkeys, the specification also requires a *back-signature* (type 0x19) from the subkey itself, proving it consents to the binding. The operational value of subkeys is significant: they can be rotated independently. If an encryption subkey is compromised, only messages encrypted to that subkey are exposed; the primary key's certifications remain valid, and a replacement subkey can be issued without collecting new third-party signatures.[^callas2007]

**User IDs** follow the conventional format `Real Name (Comment) <email@address>`. A single key may carry multiple user IDs — for example, separate work and personal addresses — and each independently accumulates third-party certifications. An unwanted user ID cannot be deleted but can have its self-signature revoked, effectively withdrawing it from active use.

### Fingerprints, key IDs, and revocation

A **fingerprint** is a deterministic hash of the public key packet used to uniquely identify a key. For v4 keys (RFC 4880), this is a 20-byte SHA-1 hash, conventionally displayed as ten groups of four hexadecimal characters. For v6 keys (RFC 9580), it is a 32-byte SHA-256 hash, eliminating the reliance on a hash function for which chosen-prefix collision attacks are now feasible.[^wouters2024]

The **key ID** is derived from the fingerprint: for v4 keys, it is the last 8 bytes; for v6, the first 8 bytes. Short key IDs (4 bytes) were once common in command-line output but are insecure because collisions can be deliberately engineered. Fingerprints should always be used for identity verification, confirmed through an out-of-band channel such as a phone call or in-person meeting.[^gnupg2024]

**Revocation certificates** allow a key owner to invalidate their key before its expiration date. GPG 2.1 and later generate a revocation certificate automatically at key creation, storing it in `~/.gnupg/openpgp-revocs.d/`. A revoked key can still verify previously made signatures and decrypt previously encrypted data, but it can no longer be used to encrypt new messages. Revocation is communicated by uploading the revocation signature to key servers.

## The encryption process

When GPG encrypts a message for a recipient, it produces a structured sequence of OpenPGP binary packets.

**Compression** comes first. GPG compresses the plaintext using ZIP, ZLIB, or BZip2 before encryption. This serves two purposes: it reduces size for transmission, and more importantly, it destroys statistical regularities in the plaintext that cryptanalysis might otherwise exploit. The result is wrapped in a Compressed Data packet (Tag 8).[^perrin2004]

**Session key generation** produces the symmetric key for this message alone. GPG draws from the operating system's entropy pool — `/dev/urandom` on Linux — to generate cryptographically random bits, for example 256 bits for AES-256. Adequate system entropy is a prerequisite for the security of this step.[^redhat2023]

**Symmetric encryption of the payload** wraps the compressed data. In v4 messages (RFC 4880), GPG produces a Symmetrically Encrypted Integrity Protected Data (SEIPD) v1 packet (Tag 18), which uses a modified CFB mode with a random prefix block. A Modification Detection Code — a SHA-1 hash of all plaintext prepended before encryption — is appended to detect tampering. In v6 messages (RFC 9580), a SEIPD v2 packet replaces CFB+MDC with **authenticated encryption (AEAD)**: the session key is first passed through HKDF-SHA256 with a random 32-byte salt to derive a message key, and the data is then encrypted in chunks using OCB, GCM, or EAX mode, each chunk carrying its own authentication tag. AEAD simultaneously provides confidentiality and integrity, making the separate MDC mechanism unnecessary.[^wouters2024]

**Asymmetric encryption of the session key** produces a Public-Key Encrypted Session Key (PKESK) packet (Tag 1) for each recipient. The encryption method depends on the recipient's algorithm. For RSA, the session key is padded with EME-PKCS1-v1.5 and raised to the recipient's public exponent modulo their modulus. For X25519 (the modern default), GPG generates an ephemeral X25519 keypair, performs a Diffie-Hellman exchange with the recipient's static public key, derives a wrapping key via HKDF-SHA256, and wraps the session key using AES Key Wrap (RFC 3394). The ephemeral public key (32 bytes) and wrapped key are stored in the PKESK packet. When multiple recipients are specified with multiple `--recipient` flags, each receives their own PKESK packet wrapping the same session key, but the message body is encrypted only once.[^callas2007][^wouters2024]

The assembled OpenPGP message consists of the PKESK packet(s) followed by the SEIPD packet. On decryption, GPG locates the PKESK matching the recipient's key, uses their private key to recover the session key, and uses the session key to decrypt and decompress the payload.

## The signing process

Digital signing uses the sender's *private* key rather than the recipient's public key, and its purpose is authentication and integrity rather than confidentiality.

**Hashing** begins the process. GPG computes a cryptographic hash — SHA-256, SHA-512, or another algorithm specified by the signer's preferences — of the message content, producing a fixed-length digest. This digest is a unique fingerprint of the content: any modification, even a single flipped bit, produces a completely different hash value, and it is computationally infeasible to find two different messages that produce the same hash.[^perrin2004]

**Signature metadata** is incorporated before the final hash is computed. OpenPGP appends the signature version, type, algorithm identifiers, and all hashed subpackets (including the creation timestamp) to the hash input, then a fixed trailer. For v6 signatures (RFC 9580), a 16-byte random cryptographic salt is prepended to the hash input — a defense against chosen-prefix collision attacks against the hash function.[^wouters2024]

**Private key signing** produces the signature over the final hash. For RSA, this applies PKCS#1 v1.5 padding and computes s = m^d mod n. For DSA, it produces two values (r, s) derived from the hash and a random per-signature nonce. For Ed25519, the signature consists of two 32-byte values (R, S) computed deterministically from the private key and message — no random nonce is needed, eliminating the failure mode where nonce reuse leaks the private key.[^wouters2024]

GPG provides three output modes for signed data. `--sign` produces a binary OpenPGP message containing both the content and the signature. `--clearsign` wraps the original plaintext in an ASCII-armored block with the signature appended, making it human-readable without GPG. `--detach-sig` produces a standalone signature file that travels separately from the document it signs.

**Verification** inverts the process: GPG recomputes the hash of the received document with the same metadata and trailer, then uses the signer's *public* key to check the signature mathematically. If the hashes match, the message is authenticated (it was produced by the private key holder), unaltered (any modification would change the hash), and non-repudiable (the signer cannot credibly deny having signed it).

## ASCII Armor

OpenPGP messages, keys, and signatures are natively binary data — sequences of typed, length-prefixed packets. Many transmission channels (email bodies, chat, web forms, source code commits) are designed for text and may corrupt binary data by mangling line endings, stripping high bytes, or truncating null characters. **ASCII Armor** solves this by encoding binary OpenPGP data into printable ASCII characters using Radix-64 (standard Base64) encoding, delimited by recognizable header and footer lines.[^callas2007]

An armored PGP message follows this structure: a header line (e.g., `-----BEGIN PGP MESSAGE-----`), optional metadata headers (`Version:`, `Comment:`), a blank line, the Base64-encoded data wrapped at 76 characters per line, a CRC-24 checksum encoded as `=` followed by four Base64 characters, and a footer line (`-----END PGP MESSAGE-----`). Different content types use different armor labels: `PGP PUBLIC KEY BLOCK`, `PGP PRIVATE KEY BLOCK`, `PGP SIGNATURE`, and `PGP MESSAGE`. In GPG, the `--armor` (or `-a`) flag activates armored output for any operation. Without it, GPG produces compact binary packets suitable for storage or programmatic use but not for copy-pasting into a text field.

## The Web of Trust

The Web of Trust (WoT) is OpenPGP's decentralized answer to a fundamental problem: when a stranger sends you their public key, how do you know it genuinely belongs to them and not to an impersonator? The X.509/PKI model used by TLS addresses this through a hierarchy of Certificate Authorities (CAs) whose root certificates are pre-installed by operating system and browser vendors. The WoT inverts this: there are no central authorities, and **any user can certify any other user's key**.[^giac2001]

When Alice verifies Bob's identity — typically through an in-person meeting where they compare key fingerprints — she signs Bob's public key with her own private key, creating a third-party certification (OpenPGP signature types 0x10 through 0x13, ranging from "generic" to "positive" identity verification). This signature is attached to Bob's key and can be distributed to others. If Carol trusts Alice's judgment, she can use Alice's certification as evidence that Bob's key is legitimate, even without ever meeting Bob directly.

### Trust levels and validity calculations

GnuPG distinguishes two concepts that are easy to conflate: *validity* (whether a key genuinely belongs to its claimed owner) and *owner trust* (how much confidence you place in someone's ability to correctly verify other people's keys). You validate keys; you assign trust to people.

Owner trust is assigned manually from four levels. **None** means the holder is known to sign keys improperly. **Marginal** means reasonable but imperfect judgment. **Full** means excellent judgment. **Ultimate** is reserved for the user's own keys and functions as the trust anchor from which all other validity decisions propagate.[^perrin2004]

GnuPG's classic trust model calculates key validity using a configurable threshold: a key is considered valid if it carries one signature from a fully trusted key, or three signatures from marginally trusted keys (the defaults, adjustable via `--completes-needed` and `--marginals-needed`). The maximum certification chain depth defaults to five hops, controlled by `--max-cert-depth`. The WoT differs from PKI in that trust roots are personally chosen rather than globally imposed, trust is graduated rather than binary, and compromise of one node has limited blast radius. Its weakness is the bootstrap problem: new keys with no certifications are difficult to validate, and the model demands active human participation at scale.[^giac2001]

## Key servers

PGP key servers are network-accessible databases for storing and distributing public keys. The standard interaction protocol is **HKP (HTTP Keyserver Protocol)**, operating on port 11371 (or HKPS over TLS), supporting key retrieval by fingerprint or email, search, and submission.

The **SKS (Synchronizing Key Server)** system dominated PGP key infrastructure for years. Each SKS instance ran two processes: one handling HKP queries and one handling peer synchronization on port 11370 using a set-reconciliation algorithm based on exchanging prefix-tree hashes to identify differences between databases. A critical property of SKS was that it was **append-only**: servers could add signatures and user IDs to keys but could never delete anything. This design resisted censorship but proved catastrophic in June 2019, when attackers appended approximately 150,000 bogus third-party signatures to the keys of prominent OpenPGP developers. Importing these poisoned certificates caused GnuPG to hang or crash during validation. The SKS pool service shut down in June 2021.[^redhatcve2019]

**keys.openpgp.org**, powered by the Hagrid server built in Rust on Sequoia PGP, represents a fundamentally different model: a **verifying key server**. Non-identity key material is freely distributed after cryptographic integrity verification, but user ID information (names and email addresses) is only published after the key owner confirms each email address through a verification link. Third-party signatures are stripped entirely, preventing certificate poisoning but effectively disabling the Web of Trust for keys distributed through this server. Unlike SKS, Hagrid supports key deletion (enabling GDPR compliance), restricts search to exact email matches, and operates as a centralized service rather than a federated mesh. GnuPG now recommends `hkps://keys.openpgp.org` as the default key server.[^keysopenpgp2024]

## GPG command-line usage

GPG provides a complete command-line interface for all OpenPGP operations. Key generation offers three entry points suited to different levels of automation: `--quick-generate-key` accepts algorithm and usage parameters directly on the command line, `--generate-key` prompts for name and email with sensible defaults, and `--full-generate-key` provides interactive algorithm selection, key size, expiration, and user ID construction.

```bash
# Generate an Ed25519/X25519 keypair with a 2-year expiration
gpg --quick-generate-key "Miguel <miguel@example.com>" ed25519 cert 2y
gpg --quick-add-key <fingerprint> ed25519 sign 2y
gpg --quick-add-key <fingerprint> cv25519 encr 2y

# Export the public key in ASCII-armored format
gpg --armor --export miguel@example.com > miguel-public.asc

# Import a received public key, then verify and certify it
gpg --import alice-public.asc
gpg --fingerprint alice@example.com    # compare fingerprint out-of-band
gpg --lsign-key alice@example.com      # local-only certification (won't be exported)

# Encrypt a file to Alice; add --armor for text-safe output
gpg --encrypt --recipient alice@example.com --armor message.txt

# Decrypt
gpg --decrypt message.txt.asc

# Sign a document (binary, clearsigned, and detached variants)
gpg --sign document.txt
gpg --clearsign document.txt
gpg --detach-sig document.txt

# Verify a signature
gpg --verify document.txt.sig document.txt
```

### The gpg-agent daemon

Since GnuPG 2.0, all private-key operations are routed through **gpg-agent**, a mandatory background daemon that manages secret keys, handles passphrase prompting, and provides caching. When GPG needs to sign or decrypt, it communicates with gpg-agent over a Unix domain socket. If the required private key is not cached, gpg-agent launches a **Pinentry** program — graphical or terminal-based, depending on configuration — to prompt for the passphrase, decrypts the private key from disk using S2K (String-to-Key) derivation, and caches the result in locked memory (`mlock` prevents the key from being swapped to disk).[^gnupg2024]

Cache lifetimes are configurable in `~/.gnupg/gpg-agent.conf`. The `default-cache-ttl` (default 600 seconds) is a sliding window that resets on each use; `max-cache-ttl` (default 7,200 seconds) is an absolute ceiling regardless of activity. The agent also doubles as an SSH agent replacement: Ed25519 authentication subkeys can be used for SSH login via the `--enable-ssh-support` option, consolidating OpenPGP and SSH key management into a single daemon. The `gpgconf --kill gpg-agent` command terminates the daemon cleanly; it restarts automatically on next use.

## The OpenPGP standard: RFC 4880 and RFC 9580

**RFC 4880** (November 2007) codified the OpenPGP message format that has been in production use for nearly two decades. It specifies the packet-based binary format, v4 key and signature structures, the algorithm registry, ASCII Armor encoding, the CFB encryption mode with Modification Detection Code (MDC) integrity protection, and the trust signature framework. Its mandatory-to-implement algorithms — TripleDES, SHA-1, and DSA — reflected the cryptographic consensus of the early 2000s.[^callas2007]

**RFC 9580** (July 2024), titled simply "OpenPGP," obsoletes RFC 4880 and two subsequent extension RFCs simultaneously. Its most significant changes affect v6 keys and signatures. V6 fingerprints use SHA-256 instead of SHA-1, producing 32-byte identifiers resistant to collision attacks. V6 signatures include a 16-byte random salt prepended to the hash input, defending against chosen-prefix collision attacks. V6 PKESK packets use full fingerprints rather than 8-byte key IDs to identify recipients. The v2 SEIPD packet replaces CFB+MDC with mandatory AEAD encryption — OCB with AES-128 is the mandatory-to-implement combination, with GCM and EAX also specified — using HKDF-derived keys and chunked authenticated encryption.[^wouters2024]

RFC 9580 also introduces **Argon2id** as the recommended S2K method for passphrase-based key protection, replacing the iterated SHA-based approach with a memory-hard function that resists GPU and ASIC brute-force attacks. Post-quantum preparations appear in a companion draft (`draft-ietf-openpgp-pqc`), proposing composite algorithms pairing ML-KEM (formerly CRYSTALS-Kyber) with X25519 for encryption and ML-DSA (formerly CRYSTALS-Dilithium) with Ed25519 for signatures.[^proton2024]

It is worth noting a **standards schism**: GnuPG's lead developer has proposed a competing **LibrePGP** specification using v5 key formats rather than v6. Most other implementations — OpenPGP.js, Sequoia PGP, GopenPGP, RNP, Bouncy Castle, and PGPainless — have aligned with RFC 9580. The practical impact of this divergence on interoperability remains to be seen as adoption of v6 grows.[^librepgp2024]

[^callas2007]: Callas, J., Donnerhacke, L., Finney, H., Shaw, D., & Thayer, R. (2007, November). *OpenPGP message format* (RFC 4880). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc4880
[^giac2001]: Rodofile, N. (2001). *Trust model in PGP and X.509 standard PKI*. GIAC Security Essentials. https://www.giac.org/paper/gsec/625/trust-model-pgp-x509-standard-pki/101441
[^gnupg2024]: The GnuPG Project. (2024). *The GNU privacy handbook*. GnuPG. https://www.gnupg.org/gph/en/manual.html
[^keysopenpgp2024]: keys.openpgp.org. (2024). *About keys.openpgp.org*. OpenPGP. https://keys.openpgp.org/about/
[^librepgp2024]: LibrePGP. (2024). *LibrePGP specification*. https://librepgp.org/
[^perrin2004]: Perrin, C. (2004). *The basics of PGP cryptography*. Carnegie Mellon University, Department of Electrical and Computer Engineering. https://users.ece.cmu.edu/~adrian/630-f04/PGP-intro.html
[^proton2024]: Proton. (2024, July). *Modernizing and improving PGP security: The OpenPGP crypto refresh*. Proton Blog. https://proton.me/blog/openpgp-crypto-refresh
[^redhat2023]: Red Hat. (2023). *Getting started with GPG*. Red Hat Blog. https://www.redhat.com/en/blog/getting-started-gpg
[^redhatcve2019]: Red Hat Product Security. (2019). *CVE-2019-13050: Certificate spamming attack against SKS key servers and GnuPG*. Red Hat Customer Portal. https://access.redhat.com/articles/4264021
[^wouters2024]: Wouters, P., Huigens, D., Winter, J., & Yutaka, N. (2024, July). *OpenPGP* (RFC 9580). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc9580
