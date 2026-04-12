---
title: "Passwords"
date: 2026-04-11
draft: false
tags:
  - authentication
  - cryptography
---

**Passwords** are the most widely deployed form of knowledge-based authentication, used to verify that a person presenting a claimed identity is who they say they are. In modern systems, passwords never travel or rest in plaintext; they are protected at every stage by a combination of transport encryption, one-way cryptographic hashing, and randomized salts. The security of a password system is therefore not simply a matter of how long or complex a user's chosen secret is, but of the entire pipeline from keystroke to session token — and of the policies that govern how credentials are stored, reset, and eventually superseded by stronger factors.

Understanding how passwords work requires moving through several distinct layers: the transmission protocol that carries credentials from browser to server, the key derivation functions that make stored hashes resistant to brute force, the entropy principles that determine how hard a password is to guess, and the attack techniques that drive every design decision in the stack. Each layer has a body of authoritative guidance — primarily NIST SP 800-63B, the OWASP Cheat Sheet Series, and a set of IETF RFCs — that has shifted considerably over the past decade away from complexity rules and toward length, randomness, and layered authentication factors.

## Authentication pipeline

When a user submits a password, the browser packages the credentials into an HTTPS POST request. TLS 1.3, defined in RFC 8446, encrypts the payload before it leaves the device, providing confidentiality, integrity, and forward secrecy for all traffic between client and server.[^ietf2018tls] OWASP's Authentication Cheat Sheet requires that login forms and all subsequent authenticated pages be served exclusively over TLS, because a form served over HTTP allows an attacker to modify the action URL and redirect credentials to an arbitrary endpoint.[^owasp2024auth]

On the server side, the submitted password is never compared directly to a stored copy. The server retrieves the stored hash, salt, and algorithm parameters for the given account, applies the same hashing function to the submission, and grants access only if the outputs match. On success, the server issues a **session token** — a cryptographically random value delivered as an HTTP cookie or a JSON Web Token — that establishes continuity of the authenticated session without requiring repeated credential entry. NIST SP 800-63B refers to this token as a "session secret."[^nist2024]

More sophisticated protocols avoid transmitting the password at all. **SCRAM (Salted Challenge Response Authentication Mechanism)**, defined in RFC 5802, is the default authentication protocol for both MongoDB and PostgreSQL.[^mongodb2024scram] In SCRAM, the server sends the client a salt and iteration count; the client derives a salted hash locally and transmits only a cryptographic proof of knowledge. The server verifies this proof against its stored verifier without ever receiving the plaintext password. The protocol also provides mutual authentication and supports TLS channel binding to prevent man-in-the-middle attacks.[^wiki2024scram] The **Secure Remote Password** (SRP) protocol, defined in RFC 2945, offers analogous zero-knowledge properties, allowing both parties to verify each other's identity without transmitting the secret across the network.

## Password storage and hashing

General-purpose hash functions like SHA-256 are designed to be fast, which makes them unsuitable for password storage: hardware capable of computing billions of hashes per second can exhaust a large portion of guessable passwords in minutes. Password storage requires functions that are deliberately slow and resource-intensive, so that each guess costs the attacker meaningful time and money.

The four major password hashing algorithms in current use are, in OWASP's recommended priority order: **Argon2id**, **scrypt**, **bcrypt**, and **PBKDF2**.[^owasp2024storage]

**Argon2id** won the Password Hashing Competition in 2015 and is standardized as RFC 9106. It is a memory-hard function: it requires a configurable amount of RAM that cannot be traded away for more computation. Argon2id is a hybrid variant that combines data-independent memory access for the first half of its first pass (protecting against side-channel attacks) with data-dependent access thereafter (maximizing brute-force resistance). RFC 9106 recommends a minimum of one iteration and 2 GiB of memory for standard deployments, or three iterations with 64 MiB for memory-constrained environments.[^biryukov2021] OWASP's current minimum is 19 MiB, two iterations, and one degree of parallelism.

**scrypt**, designed by Colin Percival and standardized as RFC 7914, was the first widely adopted memory-hard key derivation function. It internally uses PBKDF2 to generate a pseudorandom memory array and then performs random reads from it through a function called ROMix, making it difficult to parallelize on custom hardware.[^percival2016] Percival estimated the cost of a hardware brute-force attack against scrypt to be roughly 4,000 times greater than against bcrypt. Its parameters — *N* (CPU/memory cost, a power of 2), *r* (block size), and *p* (parallelization) — determine resource consumption, with memory usage approximating 128 × N × r bytes.[^ietf2016scrypt]

**bcrypt**, introduced by Provos and Mazières in 1999, uses a modified Blowfish key schedule called Eksblowfish that runs 2^cost iterations, alternating incorporation of the password and a 128-bit salt, then encrypts a fixed string sixty-four times. Its primary limitation is a 72-byte input cap, above which most implementations silently truncate the password, and its approximately 4 KB RAM footprint offers limited resistance to modern GPU attacks compared to memory-hard alternatives.[^wiki2024bcrypt]

**PBKDF2**, defined in RFC 8018, applies HMAC iteratively to the password and salt for a configurable number of rounds.[^ietf2017pbkdf2] It remains the only NIST-recommended algorithm with FIPS-140 validated implementations, making it the required choice in regulated environments. Its lack of memory hardness, however, makes it more amenable to GPU-based brute-force attacks; OWASP currently recommends 600,000 iterations with HMAC-SHA-256 to compensate.

The table below summarizes the key properties of each algorithm.

| Algorithm | Memory-hard | Input limit | FIPS validated | OWASP priority |
|-----------|-------------|-------------|----------------|----------------|
| Argon2id  | Yes         | None        | No             | 1st            |
| scrypt    | Yes         | None        | No             | 2nd            |
| bcrypt    | No (4 KB)   | 72 bytes    | No             | 3rd            |
| PBKDF2    | No          | None        | Yes            | 4th            |

### Salts and peppers

A **salt** is a unique, randomly generated value that is combined with the password before hashing. Because every account has a distinct salt, two users with identical passwords produce different hash values, and an attacker who obtains a database of hashes cannot use a single precomputed lookup table to crack all of them at once. RFC 8018 notes that a 64-bit salt creates up to 2^64 distinct keys for each password, and RFC 9106 recommends 128-bit (16-byte) salts for Argon2 deployments.[^ietf2017pbkdf2] bcrypt generates its own 128-bit salts internally. Modern hashing libraries handle salt generation automatically and embed the salt alongside algorithm parameters in the hash output string, so no separate storage is required.

A **pepper** adds a second layer of defense. Unlike a salt, a pepper is a secret value shared across all hashes and stored separately from the database — ideally in a hardware security module or dedicated secrets vault. If an attacker gains access only to the database, they cannot crack any hashes because they lack the pepper. OWASP describes two implementation strategies: pre-hashing, in which the pepper is incorporated via HMAC before the password hash function runs, and post-hashing, in which the completed hash is processed through HMAC keyed with the pepper.[^owasp2024storage] NIST SP 800-63B supports this approach, recommending that verifiers "perform an additional iteration of a keyed hashing or encryption operation using a secret key" stored separately from the password database.[^nist2024]

## Password strength and entropy

Password strength is quantified in bits of entropy, calculated as \(H = L \times \log_2(N)\), where *L* is the password length and *N* is the size of the character set.[^suried2024] Each additional bit of entropy doubles the number of guesses required for a brute-force attack. An 8-character password drawn randomly from a 62-character alphanumeric set yields approximately 47.6 bits of entropy; at one trillion guesses per second — achievable with modern GPU clusters in an offline attack — that falls in under 19 minutes. Adding four characters to reach 12 pushes entropy to 71.4 bits, requiring roughly 37 years at the same rate.

Length therefore dominates complexity. NIST SP 800-63B explicitly abandoned mandatory composition rules — requirements for uppercase, lowercase, digits, and symbols — after analyses of breached databases showed that users respond with predictable substitutions (such as "P@$$w0rd") that provide negligible security benefit while seriously harming usability.[^nist2024] The current NIST guidance requires a minimum of 8 characters, recommends supporting at least 64, and mandates acceptance of all printing ASCII characters, spaces, and Unicode.

**Passphrases** offer a practical path to high entropy without memorization difficulty. The Diceware method uses physical dice to select words randomly from a 7,776-word list, with each word contributing approximately 12.9 bits of entropy. A six-word Diceware passphrase therefore provides about 77.5 bits, equivalent to a 12-character random full-ASCII password, while being considerably more memorable. The critical requirement is that words be selected through a truly random process; human word selection introduces biases that dramatically reduce effective entropy compared to the theoretical calculation.

## Attack vectors

Attacks on passwords fall into two fundamental categories distinguished by whether the attacker has access to stored hashes. **Online attacks** target live authentication endpoints, where server-side defenses — rate limiting, account lockout, CAPTCHAs, and IP blocking — constrain guessing rates to hundreds or thousands of attempts per second. NIST SP 800-63B requires verifiers to implement effective rate-limiting mechanisms to contain online attacks.[^nist2024] **Offline attacks** occur after an attacker has exfiltrated hashed passwords from a database and can apply unlimited computational resources without any server-imposed delay. This asymmetry is the primary motivation for memory-hard hashing: it forces attackers to pay a meaningful real-world cost per guess even in the offline scenario.

Dictionary attacks refine brute force by prioritizing likely candidates: common passwords, names, words from leaked credential corpora, and rule-based transformations such as leetspeak substitutions, appended numbers, and capitalized first letters. **Rainbow tables** use a different precomputation strategy — chains of reduction functions that map hash values back to plaintexts — introduced by Philippe Oechslin in 2003.[^wiki2024rainbow] Salting defeats rainbow tables entirely, because each unique salt requires a separate table, and a 128-bit salt makes precomputation infeasible.

**Credential stuffing** exploits password reuse by testing breached username-and-password pairs from one service against other services. With a substantial portion of users reusing passwords across sites, success rates of several percent are common. OWASP's Credential Stuffing Prevention Cheat Sheet recommends multi-factor authentication as the primary defense, alongside breach-database screening and device fingerprinting.[^owasp2024credential] NIST SP 800-63B requires verifiers to screen new passwords against lists of known compromised credentials and reject matches.[^nist2024]

Phishing remains the most dangerous vector because it targets the human rather than the cryptography. Modern phishing kits include adversary-in-the-middle proxies that capture both passwords and TOTP codes in real time, rendering most forms of MFA bypassable by a determined attacker. FIDO2/WebAuthn provides structural protection here because credentials are cryptographically bound to specific origin domains.

## Password managers

Password managers solve the fundamental tension between security — unique, randomly generated, long passwords for every service — and usability — the impossibility of memorizing hundreds of such credentials. Their architecture follows a consistent pattern: the user's master password is processed through a key derivation function (typically PBKDF2 or Argon2id) to produce an encryption key that never leaves the device. A separate authentication value, derived through an additional KDF pass, is sent to the server for identity verification. The local encryption key is used to protect the **vault** — the encrypted store of all saved credentials — with AES-256-CBC or AES-256-GCM.

This is the **zero-knowledge** model: the service provider holds only ciphertext and has no ability to decrypt the vault without the master password. Even in a server breach, attackers obtain only encrypted data that resists cracking as long as the master password carries sufficient entropy.[^bitwarden2025] Bitwarden, for example, encrypts all vault data including URLs and folder names, while some competitors leave metadata unencrypted. A 2025 academic study confirmed through network payload analysis that a correctly implemented zero-knowledge architecture exposes no sensitive data to the server during normal operation.[^darmawan2025]

The primary risk of a password manager is concentration: the master password becomes a single point of failure. Best practice is to protect it with a Diceware passphrase of at least six words and to enable MFA on the password manager account itself.

## Multi-factor authentication

MFA supplements the knowledge factor (the password) with at least one additional, independent factor — something the user possesses or something biometric. NIST SP 800-63B defines three Authentication Assurance Levels: AAL1 permits single-factor authentication, AAL2 requires two distinct factors with a phishing-resistant option, and AAL3 demands hardware-based cryptographic authenticators bound to the session.[^nist2024]

The most common second factor is **TOTP (Time-Based One-Time Password)**, defined in RFC 6238. The user and server share a secret key during enrollment, typically via QR code. At authentication time, the current Unix timestamp is divided into 30-second intervals, and the interval counter is processed through HMAC-SHA-1 (or SHA-256/SHA-512) with the shared key to produce a six-digit code.[^ietf2011totp] The server accepts codes within a ±1 step window to accommodate clock drift. The predecessor algorithm, **HOTP** (RFC 4226), works identically but uses an event-based counter rather than time, requiring explicit synchronization between client and server.[^ietf2005hotp]

**FIDO2/WebAuthn**, a W3C Recommendation since 2019, represents the strongest available authentication mechanism and is structurally immune to phishing.[^w3c2021webauthn] During registration, the authenticator generates a public-private key pair scoped to the relying party's origin; the private key never leaves the device. During authentication, the relying party sends a random challenge, the authenticator signs it after local user verification (biometric or PIN), and the server validates the signature against the stored public key. No shared secret exists, no password crosses the network, and a spoofed domain cannot obtain a valid signature. The consumer-facing evolution, **passkeys**, synchronizes FIDO2 credentials across devices through cloud services such as iCloud Keychain or Google Password Manager, enabling phishing-resistant authentication without a hardware token.

SMS-based second factors, while better than no MFA, carry structural weaknesses. The SS7 signaling protocol underlying SMS lacks encryption and is vulnerable to interception. SIM-swapping attacks — where an attacker convinces a carrier to port a victim's number to a new SIM — allow MFA bypass without device access. NIST and CISA guidance recommend against SMS-based verification for high-assurance contexts.

## System policy and implementation guidance

NIST SP 800-63B and OWASP's cheat sheets together form the current authoritative baseline for password policy, and they have reversed several long-held assumptions. Forced periodic password rotation is explicitly discouraged: users respond to mandatory rotation by choosing weaker passwords and applying predictable, minimal modifications. NIST states that verifiers "should not require memorized secrets to be changed arbitrarily," reserving forced rotation for cases where compromise is confirmed or suspected.[^nist2024] Composition rules are likewise abandoned in favor of minimum length requirements and breach-database screening.

On the implementation side, the required controls include: storing passwords using a salted, slow key derivation function (Argon2id preferred); rate limiting failed attempts to constrain online attacks; accepting pasted input in password fields to support password manager autofill (an explicit NIST requirement); returning identical responses for valid and invalid accounts during password reset to avoid user enumeration; using single-use, short-lived, cryptographically random reset tokens stored in hashed form; and providing informative rejection messages when a chosen password appears in breach databases, explaining why the selection was refused rather than simply blocking it.[^owasp2024forgot]

[^biryukov2021]: Biryukov, A., Dinu, D., Khovratovich, D., & Josefsson, S. (2021). *Argon2 memory-hard function for password hashing and proof-of-work applications* (RFC 9106). IETF. https://datatracker.ietf.org/doc/html/rfc9106
[^bitwarden2025]: Bitwarden. (2025). *How end-to-end encryption paves the way for zero knowledge* [White paper]. https://bitwarden.com/resources/zero-knowledge-encryption-white-paper/
[^darmawan2025]: Darmawan, I., & Cahyono, B. (2025). Implementation of zero-knowledge encryption in a web-based password manager. *ResearchGate*. https://www.researchgate.net/publication/395553936
[^ietf2005hotp]: M'Raihi, D., Bellare, M., Hoornaert, F., Naccache, D., & Ranen, O. (2005). *HOTP: An HMAC-based one-time password algorithm* (RFC 4226). IETF. https://datatracker.ietf.org/doc/html/rfc4226
[^ietf2011totp]: M'Raihi, D., Rydell, J., Pei, M., & Machani, S. (2011). *TOTP: Time-based one-time password algorithm* (RFC 6238). IETF. https://datatracker.ietf.org/doc/html/rfc6238
[^ietf2016scrypt]: Percival, C., & Josefsson, S. (2016). *The scrypt password-based key derivation function* (RFC 7914). IETF. https://datatracker.ietf.org/doc/html/rfc7914
[^ietf2017pbkdf2]: Moriarty, K., Kaliski, B., & Rusch, A. (2017). *PKCS #5: Password-based cryptography specification version 2.1* (RFC 8018). IETF. https://datatracker.ietf.org/doc/html/rfc8018
[^ietf2018tls]: Rescorla, E. (2018). *The transport layer security (TLS) protocol version 1.3* (RFC 8446). IETF. https://datatracker.ietf.org/doc/html/rfc8446
[^mongodb2024scram]: MongoDB. (2024). *SCRAM — MongoDB manual*. https://www.mongodb.com/docs/manual/core/security-scram/
[^nist2024]: National Institute of Standards and Technology. (2024). *Digital identity guidelines: Authentication and lifecycle management* (NIST SP 800-63B-4). U.S. Department of Commerce. https://pages.nist.gov/800-63-4/sp800-63b.html
[^owasp2024auth]: OWASP. (2024). *Authentication cheat sheet*. OWASP Cheat Sheet Series. https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
[^owasp2024credential]: OWASP. (2024). *Credential stuffing prevention cheat sheet*. OWASP Cheat Sheet Series. https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html
[^owasp2024forgot]: OWASP. (2024). *Forgot password cheat sheet*. OWASP Cheat Sheet Series. https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
[^owasp2024storage]: OWASP. (2024). *Password storage cheat sheet*. OWASP Cheat Sheet Series. https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
[^percival2016]: Percival, C. (2016). *scrypt: A new key derivation function* [Presentation slides]. Tarsnap. https://www.tarsnap.com/scrypt/scrypt-slides.pdf
[^suried2024]: Suried Tools. (2024). *Password entropy explained: The math behind password strength*. https://tools.suried.com/en/tutorial/password-entropy-explained
[^w3c2021webauthn]: Balfanz, D., Czeskis, A., Hodges, J., Jones, J. C., Jones, M. B., Kumar, A., Liao, A., Lindemann, R., & Lundberg, E. (Eds.). (2021). *Web authentication: An API for accessing public key credentials level 2*. W3C. https://www.w3.org/TR/webauthn-2/
[^wiki2024bcrypt]: Wikipedia contributors. (2024). *bcrypt*. Wikipedia. https://en.wikipedia.org/wiki/Bcrypt
[^wiki2024rainbow]: Wikipedia contributors. (2024). *Rainbow table*. Wikipedia. https://en.wikipedia.org/wiki/Rainbow_table
[^wiki2024scram]: Wikipedia contributors. (2024). *Salted challenge response authentication mechanism*. Wikipedia. https://en.wikipedia.org/wiki/Salted_Challenge_Response_Authentication_Mechanism
