---
title: "Passkeys"
date: 2026-04-09
draft: false
tags:
  - authentication
  - cryptography
---

**Passkeys** are cryptographic credentials that replace shared-secret authentication — passwords, TOTP codes, SMS one-time passwords — with asymmetric public-key cryptography. Rather than proving identity by transmitting a memorized or generated secret to a server, a passkey proves identity by signing a server-issued challenge with a private key that never leaves the user's device. The standard is built on the W3C **Web Authentication API (WebAuthn)** and the FIDO Alliance's **Client-to-Authenticator Protocol (CTAP2)**, collectively known as FIDO2.[^fidoalliance-nd-a] Every passkey is a *discoverable credential*: the authenticator stores both the private key and credential metadata internally, so the user need not supply a username — the device locates the credential by relying party identity alone.[^w3c2021]

Because the server stores only a public key, a passkey-based system has no credential store worth stealing. There are no hashes to crack offline, no seeds to exfiltrate, and no secrets for a user to type into a spoofed login page — the browser enforces origin binding at the protocol level. The result is a mechanism that provides phishing resistance, replay resistance, and implicit multi-factor authentication by design rather than by policy.[^fidoalliance-nd-a]

## Cryptographic foundation

When a user registers a passkey, the **authenticator** — either a *platform authenticator* embedded in the device (Secure Enclave, Android Keystore, Windows TPM) or a *roaming authenticator* such as a hardware security key — generates an asymmetric key pair scoped to the registering **relying party (RP)**. The overwhelmingly preferred algorithm is **ES256** (ECDSA over NIST P-256 with SHA-256, COSE algorithm identifier −7), with RS256 (RSASSA-PKCS1-v1.5) available as a fallback and EdDSA (Ed25519) supported on some devices.[^w3c2021] The public key is encoded in **COSE_Key** format — a CBOR structure carrying the key type, algorithm, curve, and raw coordinate values — and sent to the RP server. The private key never crosses the authenticator's hardware boundary during a live ceremony.

The RP stores the public key alongside a **credential ID**: a globally unique, authenticator-generated handle used to retrieve the correct key pair in future interactions. For platform authenticators, hardware isolation is provided by the Secure Enclave on Apple devices, the hardware-backed Keystore or StrongBox TEE on Android, and TPM 2.0 on Windows. No biometric template is transmitted at any point; the device performs user verification locally and reports only a boolean result.[^apple-nd][^google-nd-a]

## Registration and authentication ceremonies

WebAuthn defines two protocol flows — **registration** (credential creation) and **authentication** (assertion) — that share a challenge-response structure: the server issues a nonce, the authenticator signs it, and the server verifies the signature.

### Registration

Registration begins when the RP server constructs a `PublicKeyCredentialCreationOptions` object specifying the RP identity (`rp.id`, a domain string), the user identity (`user.id`, an opaque byte array, plus display name), a cryptographically random `challenge` of at least 16 bytes, and a `pubKeyCredParams` array listing acceptable algorithms in preference order.[^w3c2021] The `authenticatorSelection` field must set `residentKey: "required"` for passkeys, and `userVerification: "required"` for passwordless flows. An `excludeCredentials` array prevents duplicate registrations by listing existing credential IDs.[^yubico-nd-a]

The client calls `navigator.credentials.create({ publicKey: options })`. The browser validates that the `rp.id` is a registrable domain suffix of the current origin — a security constraint enforced at the browser level, not in application code — then delegates to the authenticator. After user verification, the authenticator generates the key pair and returns a `PublicKeyCredential` whose `response` is an `AuthenticatorAttestationResponse` containing two payloads.[^w3c2021]

The first is `clientDataJSON`: a UTF-8 JSON structure recording the ceremony type (`"webauthn.create"`), the challenge, and the **origin as observed by the browser** — this field is written by the browser and is not accessible to page JavaScript. The second is `attestationObject`: a CBOR-encoded map containing the attestation format string (`fmt`), the attestation statement (`attStmt`), and `authData` — a densely packed byte sequence.[^duo-nd]

The `authData` structure contains a 32-byte SHA-256 hash of the RP ID, a flags byte encoding User Presence (UP), User Verified (UV), Backup Eligibility (BE), Backup State (BS), and whether attested credential data is present, a four-byte big-endian **sign counter**, and — during registration — the **AAGUID** (a 16-byte authenticator model identifier), credential ID length, credential ID, and the COSE_Key-encoded public key.[^w3c2021] The server executes the 19-step validation procedure from §7.1 of the WebAuthn specification: verifying ceremony type, challenge, origin, RP ID hash, flags, and the attestation statement before persisting the credential.

### Authentication

Authentication constructs a `PublicKeyCredentialRequestOptions` with a fresh `challenge`, the `rpId`, and a `userVerification` policy. For passkey flows, `allowCredentials` is typically **empty**: the authenticator searches by RP ID and presents an account selector or Conditional UI autofill suggestion to the user, removing any username requirement.[^google-nd-b] The client calls `navigator.credentials.get({ publicKey: options })`.

After user verification, the authenticator computes a **signature** over the concatenation of `authenticatorData || SHA-256(clientDataJSON)` using the stored private key.[^w3c2021] The resulting `AuthenticatorAssertionResponse` carries the signature, updated `authenticatorData`, `clientDataJSON` (with type `"webauthn.get"`, challenge, and origin), and the `userHandle` (the `user.id` from registration). The server retrieves the stored public key, recomputes the signed payload, verifies the signature, checks that UP and UV flags satisfy policy, and confirms the sign counter exceeds the stored value. A counter regression signals potential authenticator cloning.[^w3c2021]

## Synced versus device-bound passkeys

The FIDO Alliance distinguishes two credential categories with sharply different security and usability profiles.[^fidoalliance-nd-b]

**Synced passkeys** (multi-device credentials) permit the private key — wrapped in end-to-end encryption — to replicate across a user's device ecosystem. Apple's iCloud Keychain encrypts passkeys with 256-bit AES keys derived from material inaccessible to Apple itself; a new device joins the sync circle by being sponsored by an existing trusted device or through an escrow recovery path limited to 10 passcode attempts before permanent destruction.[^apple-nd] Google Password Manager encrypts passkeys end-to-end before syncing across Android, Chrome on Windows/macOS/Linux/ChromeOS, and (since January 2025) iOS; decryption on a new device requires the user's Password Manager PIN or an existing device's screen lock, verified inside hardware security enclaves on Google's servers with the same 10-attempt ceiling.[^google-nd-a] Microsoft's Password Manager, updated in November 2025, syncs passkeys across Windows 11 via Azure Managed HSMs and Azure Confidential Compute.[^microsoft-nd-b] Third-party managers — 1Password, Bitwarden, Dashlane, and others — can serve as system-level passkey providers on Android 14+ and iOS 17+. The forthcoming FIDO Alliance **Credential Exchange Protocol (CXP)** will enable encrypted cross-manager portability, with Apple's iOS 26 announced as the first implementing platform.[^bitwarden2025]

**Device-bound passkeys** confine the private key to a single physical device. They offer stronger attestation guarantees — the RP can cryptographically verify authenticator make and model against the FIDO Metadata Service — but lose the credential permanently if the device is lost. NIST SP 800-63-4 (finalized July 2025) formally recognizes synced passkeys at Authenticator Assurance Level 2 (AAL2); device-bound passkeys with hardware attestation can satisfy AAL3 under certain configurations.[^nist2025]

## Cross-device authentication

A passkey stored on a phone can authenticate a session on a desktop through the **hybrid transport** defined in CTAP 2.2.[^fidoalliance2023] The five-phase flow uses a QR code to bootstrap a secure channel, with Bluetooth Low Energy serving only as a proximity oracle — no authentication data flows over BLE.

The desktop browser displays a QR code encoding an ECDH public key, a session-specific secret, and routing information. The phone scans it, extracts the session parameters, and begins broadcasting a BLE advertisement; the desktop detects the advertisement to confirm physical proximity. Using the ECDH material from the QR code, the two devices establish an **encrypted tunnel over the public internet** (typically a WebSocket via platform-vendor infrastructure). The phone prompts the user for verification, signs the WebAuthn challenge with its private key, and transmits the assertion through the tunnel. Only the one-time signature crosses the wire; the private key never leaves the phone.[^fidoalliance2023] After a successful pairing, state-assisted reconnection eliminates the need to scan QR codes in future sessions.

As of early 2026, Android 9+ and iOS 16+ can act as cross-device authenticators, while macOS 13+, Windows 23H2+, ChromeOS 108+, and Chrome/Edge on Linux function as desktop clients.[^passkeysdev-nd]

## Platform and browser support

Passkey support spans all major platforms. Apple shipped passkeys in iOS 16 and macOS 13 Ventura, with Conditional UI autofill arriving in iOS 16.1 and Safari 16.1. iOS 17 opened the passkey provider API to third-party managers; iOS 18 added Conditional Create for seamless upgrade prompts.[^apple-nd] Android supports passkeys from version 9 via Google Password Manager and the Credential Manager API, with third-party provider selection added in Android 14.[^google-nd-a] Windows 11 22H2 introduced native passkey management; 23H2 enabled cross-device authentication; and the November 2025 update added synced passkeys via Microsoft Password Manager with a plug-in model for third-party providers.[^microsoft-nd-a][^microsoft-nd-b]

Browser coverage as of early 2026 is as follows:[^passkeysdev-nd]

| Browser | Autofill UI | Conditional Create | Related Origin Requests | PRF Support |
|---|---|---|---|---|
| Chrome | 108+ | 136+ | 128+ | 147+ |
| Safari | 16+ | 18+ | 18+ | — |
| Firefox | 122+ | — | — | 148+ |
| Edge | 122+ | — | 128+ | — |

## Developer integration

### Client API

The entire WebAuthn client surface is two JavaScript calls: `navigator.credentials.create()` for registration and `navigator.credentials.get()` for authentication, both accepting a `{ publicKey: options }` argument. Passing `mediation: "conditional"` to `get()` and adding `autocomplete="webauthn"` to the username input enables **Conditional UI**, surfacing passkey suggestions in the browser's native autofill dropdown alongside saved passwords.[^google-nd-b]

### RP ID scoping

The **RP ID** is embedded at registration and is immutable afterward — changing it invalidates all existing credentials. It must be a registrable domain suffix of the calling origin; a page at `login.example.com` may use RP ID `example.com` and that credential will work on any subdomain, but a parent origin cannot use a subdomain RP ID.[^w3c2021] For organizations spanning multiple root domains, **Related Origin Requests** allow a `.well-known/webauthn` file to list additional permitted origins. Native mobile apps declare the association via Apple's `apple-app-site-association` or Android's `assetlinks.json` Digital Asset Links files.[^google-nd-b]

### Attestation and the FIDO Metadata Service

The `attestationObject` returned at registration carries a statement verifying the credential's authenticator origin. Format identifiers include `"packed"` for most FIDO2 keys, `"tpm"` for Windows Hello, `"android-key"` for Android hardware keystore, and `"apple"` for Apple's anonymous attestation.[^w3c2021] The FIDO Alliance's **Metadata Service (MDS3)**, published as a signed BLOB at `mds3.fidoalliance.org`, provides per-AAGUID trust anchors: attestation root certificates, capability metadata, certification level (L1–L3+), and security status flags including key-compromise advisories.[^fidoalliance-nd-c] Synced passkey providers generally do not produce verifiable attestation, which means enterprise policies requiring attestation effectively restrict users to device-bound hardware authenticators.

### Server-side storage and validation

For each credential, the server must persist: credential ID, public key (COSE-encoded), algorithm identifier, sign counter, user handle, transport hints from `getTransports()`, AAGUID, and the BE and BS flags indicating sync eligibility.[^w3c2021] Challenges must be cryptographically random, single-use, and time-limited — typically 32 bytes with a 60–120 second expiry.[^google-nd-b]

Mature open-source libraries exist across all major ecosystems: **SimpleWebAuthn** (TypeScript), **java-webauthn-server** (Java, Yubico), **py_webauthn** (Python), **go-webauthn** (Go), **webauthn-rs** (Rust), and **fido2-net-lib** (.NET).[^passkeysdev-nd]

## Security properties

Passkeys structurally eliminate three attack categories that TOTP and SMS-based MFA leave open.

**Phishing resistance** is enforced by the protocol, not the user. The browser writes the `origin` into `clientDataJSON` and the authenticator hashes the RP ID into `authenticatorData`; the server validates both. A credential created for `example.com` produces signatures that are cryptographically invalid at `evil-example.com`, regardless of how convincingly the phishing site is rendered.[^fidoalliance-nd-a]

**Replay resistance** follows from the single-use challenge nonce. Every ceremony begins with a server-generated random value; the authenticator's signature covers this value (via the hash of `clientDataJSON`), and the server rejects any repeated or stale challenge. An intercepted assertion cannot be replayed.[^w3c2021]

**No shared secrets at rest** means a server breach yields nothing exploitable. The RP stores only public keys — computationally infeasible to reverse — and there are no password hashes, TOTP seeds, or recovery codes to harvest. For synced passkeys, the private key exists in the cloud only in an end-to-end encrypted form the provider cannot decrypt.[^apple-nd][^google-nd-a]

The **sign counter** provides a lightweight authenticator clone-detection mechanism: if the server observes a counter less than or equal to the stored value, it signals a possible duplication event. Because synced passkeys may not maintain consistent counters across devices, the signal is less reliable in that context and should be treated as advisory rather than definitive.[^w3c2021]

[^apple-nd]: Apple. (n.d.). [*About the security of passkeys*](https://support.apple.com/en-us/102195). Apple Support.
[^bitwarden2025]: Bitwarden. (2025). [*Security vendors join forces to make passkeys more portable for everyone*](https://bitwarden.com/blog/security-vendors-join-forces-to-make-passkeys-more-portable-for-everyone/). Bitwarden Blog.
[^duo-nd]: Duo Security. (n.d.). [*Guide to Web Authentication*](https://webauthn.guide/). webauthn.guide.
[^fidoalliance-nd-a]: FIDO Alliance. (n.d.-a). [*FIDO passkeys: Passwordless authentication*](https://fidoalliance.org/passkeys/). FIDO Alliance.
[^fidoalliance-nd-b]: FIDO Alliance. (n.d.-b). [*FIDO user authentication specifications*](https://fidoalliance.org/specifications/). FIDO Alliance.
[^fidoalliance-nd-c]: FIDO Alliance. (n.d.-c). [*FIDO Metadata Service (MDS) overview*](https://fidoalliance.org/metadata/). FIDO Alliance.
[^fidoalliance2021]: FIDO Alliance. (2021, May 18). [*FIDO Metadata Service v3.0*](https://fidoalliance.org/specs/mds/fido-metadata-service-v3.0-ps-20210518.html). FIDO Alliance.
[^fidoalliance2023]: FIDO Alliance. (2023). *Client to Authenticator Protocol (CTAP) 2.2*. FIDO Alliance. https://fidoalliance.org/specifications/
[^google-nd-a]: Google. (n.d.-a). [*Security of passkeys in the Google Password Manager*](https://security.googleblog.com/2022/10/SecurityofPasskeysintheGooglePasswordManager.html). Google Security Blog.
[^google-nd-b]: Google. (n.d.-b). [*Passkeys developer guide for relying parties*](https://developers.google.com/identity/passkeys/developer-guides). Google for Developers.
[^microsoft-nd-a]: Microsoft. (n.d.-a). [*Support for passkeys in Windows*](https://learn.microsoft.com/en-us/windows/security/identity-protection/passkeys/). Microsoft Learn.
[^microsoft-nd-b]: Microsoft. (n.d.-b). [*Windows 11 expands passkey manager support*](https://techcommunity.microsoft.com/blog/windows-itpro-blog/windows-11-expands-passkey-manager-support/4467572). Microsoft Community Hub.
[^nist2025]: National Institute of Standards and Technology. (2025). *Digital identity guidelines* (NIST SP 800-63-4). U.S. Department of Commerce. https://doi.org/10.6028/NIST.SP.800-63-4
[^passkeysdev-nd]: FIDO Alliance. (n.d.). [*Passkey device support matrix*](https://passkeys.dev/device-support/). passkeys.dev.
[^w3c2021]: World Wide Web Consortium. (2021). [*Web Authentication: An API for accessing public key credentials — Level 3*](https://www.w3.org/TR/webauthn-3/). W3C.
[^yubico-nd-a]: Yubico. (n.d.-a). [*WebAuthn client registration*](https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/WebAuthn_Client_Registration.html). Yubico Developer Documentation.
