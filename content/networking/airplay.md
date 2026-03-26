---
title: "AirPlay"
date: 2026-03-19
draft: false
tags:
  - apple
  - networking
  - protocols
  - wireless
---

**AirPlay** is Apple's proprietary wireless streaming protocol for transmitting audio, video, photos, and mirrored screen content from iOS, iPadOS, and macOS devices to compatible receivers — Apple TV, HomePod, and a growing roster of third-party speakers and smart TVs.[^apple] Rather than a single protocol, AirPlay is a layered system built on standard networking primitives: mDNS for discovery, RTSP and RTP for audio transport, and HTTP for video and photo delivery. The result is a zero-configuration streaming experience: receivers appear automatically in the system UI, and content plays with no manual address entry or pairing ceremony.

The protocol originated in 2004 as **AirTunes**, a limited audio-only feature for streaming iTunes music to AirPort Express base stations. Apple rebranded it to AirPlay when video support arrived, and in 2018 released **AirPlay 2** with iOS 11.4 — an architectural revision that introduced buffered audio, multi-room synchronization, and HomeKit integration.[^macrumors] Understanding AirPlay means understanding both the protocol mechanics that move bits across the network and the ecosystem design decisions that tie those mechanics to Apple's hardware and software platforms.

## Device discovery

AirPlay relies on **Bonjour**, Apple's implementation of Multicast DNS (mDNS) and DNS-based Service Discovery (DNS-SD), to locate receivers without any user-facing configuration. An AirPlay receiver publishes two distinct mDNS service records on the local network.[^openairplayDiscovery]

The first, `_airplay._tcp` on port 7000, handles video, photo, and screen-mirroring connections. Its TXT record advertises the device's MAC address (`deviceid`), model string (`model`, e.g., `AppleTV2,1`), a 64-bit feature bitfield (`features`), and a public key (`pk`) used in pairing. The second, `_raop._tcp` (Remote Audio Output Protocol), handles audio streaming on a dynamically assigned port. Its TXT record is more granular, declaring supported audio codecs (`cn`), encryption types (`et`), sample rate (`sr`: 44100 Hz), sample size (`ss`: 16 bits), stereo channel count (`ch`: 2), and transport protocol (`tp`: UDP).[^openairplayDiscovery]

Receivers dynamically update their mDNS records to reflect state changes — idle, receiving AirPlay audio, receiving video, or playing local media — by modifying flag fields. This allows clients to display real-time availability information without polling. Device subtypes are inferred from the model string prefix: `AppleTV` for Apple TV, `AudioAccessory` for HomePod. Third-party speakers are identified by a dedicated feature flag (`SupportsUnifiedPairSetupAndMFi`).[^openairplayDiscovery]

## Audio streaming

### Control plane: RTSP

Audio sessions are orchestrated using the **Real Time Streaming Protocol** (RTSP, RFC 2326). The session lifecycle proceeds through a fixed sequence of request types.[^nto]

1. **OPTIONS** — The client discovers the server's supported methods. The request carries `Client-Instance`, `DACP-ID`, and `Active-Remote` headers that link the session to the DACP remote-control channel.
2. **ANNOUNCE** — The client describes the stream via a **Session Description Protocol** (SDP) body containing codec parameters, an AES encryption key (Base64-encoded), and an initialization vector. The RTSP URL takes the form `rtsp://<address>/<session-id>`.
3. **SETUP** — Three UDP channels are negotiated: a *server port* for audio data, a *control port* for synchronization and retransmission, and a *timing port* for clock coordination. The transport header specifies `RTP/AVP/UDP;unicast;mode=record`.
4. **RECORD** — Playback begins. The response includes an `Audio-Latency` value the client uses to synchronize its timeline.
5. **FLUSH** — Halts playback (used for pause and seek operations).
6. **TEARDOWN** — Terminates the session and releases resources.

Volume is set via `SET_PARAMETER` with a floating-point dB attenuation value. The usable range spans −30 dB (quiet) to 0 dB (full volume); −144 dB represents mute.[^nto]

### Data plane: RTP

Audio payload is carried in standard **RTP** packets with payload type 96. The marker bit is set on the first packet after a RECORD or FLUSH request to signal a stream boundary. Three auxiliary channels share the same UDP architecture.[^nto]

**Sync packets** (payload type 84, control port) arrive once per second and correlate RTP timestamps to NTP wall-clock time, allowing the receiver to map the audio timeline to real time. **Timing packets** (payload types 82 and 83, timing port) perform a three-timestamp NTP-style exchange every three seconds, enabling the receiver to compute clock offset and round-trip delay relative to the sender. **Retransmit requests** (payload type 85) let the receiver request specific lost packets by sequence number and count; the sender replies with payload type 86, carrying the original audio RTP packet. This retransmission mechanism provides a lightweight reliability layer over UDP without the overhead of TCP.[^nto]

### Audio codecs

AirPlay receivers advertise their supported codecs in the `cn` field of the RAOP TXT record.[^openairplayDiscovery]

| `cn` value | Codec | Description |
|---|---|---|
| 0 | PCM | Uncompressed audio |
| 1 | ALAC | Apple Lossless Audio Codec — lossless compression at CD quality (16-bit, 44.1 kHz) |
| 2 | AAC | Advanced Audio Coding — lossy, widely compatible |
| 3 | AAC ELD | AAC Enhanced Low Delay — used alongside H.264 video during screen mirroring |

ALAC codec parameters are conveyed in the SDP `fmtp` attribute (e.g., `352 0 16 40 10 14 2 255 0 0 44100`). AAC uses `mpeg4-generic/44100/2` in the `rtpmap`, and AAC ELD adds `mode=AAC-eld; constantDuration=480` in `fmtp`.[^nto] Because AirPlay streams over Wi-Fi rather than Bluetooth, it has the bandwidth headroom to use lossless codecs — ALAC at CD quality requires approximately 700–1,400 kbps, well within Wi-Fi capacity but far beyond what Bluetooth audio profiles can sustain.

## Video and screen mirroring

Video and photo transmission use **HTTP** requests on port 7000, the same port as the `_airplay._tcp` discovery service. Photo sharing supports caching and slideshow-specific logic, while video streaming follows a request model suited to progressive playback.[^openairplayIntro]

**Screen mirroring** is architecturally distinct. It combines HTTP-based session negotiation with custom binary stream packets and time synchronization (via PTP or NTP) to keep the mirrored display and its audio in lockstep. The sending device must be capable of real-time **H.264** video encoding without saturating the CPU — a requirement that originally limited mirroring to iPhone 4S, iPad 2, and Macs with Sandy Bridge processors or later.[^openairplayIntro] Modern devices handle this trivially with dedicated hardware encoders, and AirPlay now supports 4K resolution through Apple TV 4K.[^apple]

## Encryption and authentication

AirPlay employs several encryption and authentication mechanisms, selected based on the receiver type and content being streamed.[^nto]

| `et` value | Type | Mechanism |
|---|---|---|
| 0 | None | Unencrypted connection |
| 1 | RSA | 128-bit AES key encrypted with RSA/OAEP; used by AirPort Express |
| 3 | FairPlay | AES key encrypted via Apple's FairPlay DRM |
| 4 | MFiSAP | Hardware-based authentication for licensed third-party devices |
| 5 | FairPlay SAPv2.5 | Updated FairPlay variant for current-generation devices |

In the RSA flow, the client sends a 128-bit random challenge in an `Apple-Challenge` header. The AES session key is encrypted with the receiver's RSA public key using OAEP, and the receiver proves possession of its private key by signing the challenge using PKCS#1. For screen mirroring, FairPlay encryption protects the H.264 video bitstream: the AES key and IV are conveyed in `param1` (72 bytes) and `param2` (16 bytes), and payload encryption is applied per-packet.[^nto]

Password-protected AirPlay sessions fall back to standard **HTTP Digest Authentication** (RFC 2617), with the realm and username both set to `AirPlay`.[^nto] Newer devices also support **HomeKit-based pairing**, which establishes a persistent trust relationship using a pair-setup and pair-verify handshake, avoiding repeated authentication.[^openairplayIntro]

## Metadata and remote control

Track metadata is delivered via `SET_PARAMETER` RTSP requests using Apple's **DAAP** (Digital Audio Access Protocol) encoding format. The request carries an `RTP-Info` header for timestamp correlation and includes song title (`dmap.itemname`), artist (`daap.songartist`), and album (`daap.songalbum`). Album artwork follows as a separate `SET_PARAMETER` request with content type `image/jpeg`. Playback progress is conveyed as three slash-separated absolute RTP timestamps — start, current, and end — from which position and duration can be derived.[^nto]

Communication also flows in the reverse direction. AirPlay receivers can send remote-control commands back to the source device using the **DACP** (Digital Audio Control Protocol) over HTTP. The receiver discovers the sender's DACP service via mDNS (service type `_dacp._tcp`, named `iTunes_Ctrl_<DACP-ID>`) and authenticates with the `Active-Remote` token exchanged during RTSP session setup. Supported commands include `nextitem`, `previtem`, `pause`, `playpause`, `play`, `volumeup`, and `volumedown`.[^nto] This bidirectional control is what allows hardware buttons on AirPlay speakers to function as if they were built into the source device.

## AirPlay 2

**AirPlay 2**, released in 2018 with iOS 11.4, was not merely a feature update but an architectural revision to the audio streaming pipeline.[^macrumors] Three changes are fundamental.

First, AirPlay 2 introduced **buffered audio**. The original protocol streamed audio in real time with minimal receiver-side buffering, making playback vulnerable to momentary Wi-Fi congestion or interference. AirPlay 2 receivers maintain a larger audio buffer, absorbing network variability and substantially reducing dropouts. The `SupportsBufferedAudio` feature flag in the mDNS TXT record distinguishes AirPlay 2 receivers from their predecessors.[^openairplayDiscovery]

Second, AirPlay 2 enabled **multi-room audio** — simultaneous streaming to multiple speakers with sample-accurate synchronization. The original protocol supported only a single destination at a time. Multi-room sync relies on the same NTP-based clock coordination present in the original protocol, extended so that all participating receivers align their playback timelines to a common reference. Users can group speakers, play different content in different rooms, or synchronize the same track across an entire home.[^apple]

Third, AirPlay 2 speakers became **HomeKit accessories**, appearing in the Home app alongside lights, locks, and thermostats. This integration enabled Siri voice control by room ("Play jazz in the kitchen"), automation triggers based on speaker activity, and centralized management of all AirPlay 2 devices from a single interface. iOS 17 later extended this with on-device intelligence that learns a user's AirPlay preferences and surfaces automatic suggestions.[^macrumors]

The AirPlay 2 ecosystem has grown well beyond Apple's own hardware. Compatible receivers now include smart TVs from Samsung, LG, Sony, and Vizio; speakers from Bose, Sonos, Bang & Olufsen, Bowers & Wilkins, Denon, KEF, Marantz, and Yamaha, among others; and hotel room TVs at select IHG properties, where guests connect via QR code scanning introduced in iOS 17.3.[^apple] [^macrumors]

## Comparison with Bluetooth audio

AirPlay and Bluetooth audio solve the same surface problem — wireless audio playback — through fundamentally different means, and the choice between them involves real engineering trade-offs.

AirPlay streams over Wi-Fi (802.11), giving it access to the full bandwidth of the local network. This means it can carry lossless codecs (ALAC, PCM) at bitrates of 700–1,400 kbps or higher, and its range extends to anywhere the Wi-Fi signal reaches. Bluetooth, by contrast, uses a direct 2.4 GHz radio link capped at roughly 2–3 Mbps (with audio codecs like SBC, AAC, and aptX typically operating well below 1 Mbps) and a practical range of about 10 meters.[^apple]

The trade-off is dependency and latency. AirPlay requires Wi-Fi infrastructure — a router, a functioning network, and all devices on the same subnet. Bluetooth is peer-to-peer and infrastructure-free; it connects anywhere two devices are in range. Bluetooth also pairs instantly and consumes less power, particularly with Bluetooth Low Energy profiles. AirPlay's initial connection involves mDNS discovery, RTSP negotiation, and key exchange, which adds setup time — though once streaming, the buffered pipeline (especially in AirPlay 2) delivers consistent, low-jitter playback. AirPlay is also inherently tied to the Apple ecosystem, while Bluetooth is a universal cross-platform standard.

## Security

AirPlay's encryption layers protect content in transit, but the protocol's attack surface has grown alongside its ecosystem. In 2025, security researchers at Oligo disclosed a family of vulnerabilities collectively called **Airborne**, affecting the AirPlay protocol implementation across millions of Apple and third-party devices. Apple patched its own products promptly, but many third-party AirPlay-enabled speakers and TVs remain unpatched due to inconsistent firmware update practices among manufacturers.[^macrumors] The episode highlights a structural tension in AirPlay's licensing model: Apple controls the protocol specification and patches its own devices quickly, but cannot force timely updates across the hundreds of third-party products that implement the protocol.

## References

[^apple]: Apple. (n.d.). [*AirPlay*](https://www.apple.com/airplay/). Apple.

[^macrumors]: MacRumors. (n.d.). [*AirPlay: Everything you need to know*](https://www.macrumors.com/guide/airplay/). MacRumors.

[^nto]: nto. (n.d.). [*Unofficial AirPlay protocol specification*](https://nto.github.io/AirPlay.html).

[^openairplayDiscovery]: OpenAirplay Contributors. (n.d.). [*AirPlay specification: Service discovery*](https://openairplay.github.io/airplay-spec/service_discovery.html). OpenAirplay.

[^openairplayIntro]: OpenAirplay Contributors. (n.d.). [*AirPlay specification: Introduction*](https://openairplay.github.io/airplay-spec/introduction.html). OpenAirplay.
