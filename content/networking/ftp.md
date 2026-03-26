---
title: "File Transfer Protocol"
date: 2026-03-21
updated: 2026-03-19
draft: false
tags:
  - networking
  - protocols
  - security
---

**File Transfer Protocol** (FTP) is a TCP/IP application-layer protocol for transferring files between a client and a server over a network. First defined in 1971 for ARPANET and formalized in RFC 959 in 1985, it remains one of the oldest internet protocols still in active use[^postelReynolds1985]. What distinguishes FTP architecturally from nearly every other application-layer protocol is its use of two separate TCP connections — one persistent channel for commands and one ephemeral channel for data — a design that proved elegant for its era but created lasting complications once firewalls and network address translation became ubiquitous.

FTP's plaintext transmission of credentials and file contents, an acceptable trade-off on a small trusted network of academic hosts, became a structural liability as the internet scaled. Two secure successors address this gap from different directions: **FTPS** layers TLS encryption onto the existing FTP architecture, while **SFTP** (SSH File Transfer Protocol) replaces it entirely with a single encrypted channel built on SSH. Understanding how plain FTP works — its dual-channel model, its command and reply system, and why active mode breaks behind NAT — is prerequisite to understanding why those successors are designed the way they are.

## History and standardization

Abhay Bhushan of MIT's Project MAC published the first FTP specification as RFC 114 on April 16, 1971, making FTP one of the very first application-layer protocols defined for ARPANET[^postelReynolds1985]. At that stage the protocol ran over NCP (Network Control Protocol), ARPANET's precursor to TCP/IP, and used a single bidirectional connection for both commands and data. Bhushan revised the protocol through several iterations as ARPANET grew, and by 1980 Jon Postel produced RFC 765, which aligned FTP with the emerging TCP/IP architecture and split the connection model into the two-channel design that persists today.

The canonical specification, **RFC 959**, was published in October 1985 by Postel and Joyce Reynolds at USC's Information Sciences Institute[^postelReynolds1985]. It carries IETF standards status STD 9 and has remained the normative FTP reference for four decades. Subsequent RFCs extended it without replacing it: RFC 1579 (1994) addressed firewall-friendly passive mode, RFC 2228 (1997) added security extension commands, RFC 2428 (1998) introduced IPv6 support via extended passive mode, and RFC 4217 (2005) defined how to layer TLS over FTP to produce FTPS[^fordHutchinson2005][^horowitzLunt1997].

## Dual-channel architecture

FTP's most defining characteristic is its use of two independent TCP connections, which Kurose and Ross describe as sending control information "out of band" relative to the data stream — a contrast with HTTP, which multiplexes commands and responses over a single connection[^kuroseRoss2017].

The **control connection** is opened by the client to the server's port 21 and remains alive for the full duration of the session. It carries FTP commands from client to server and numeric reply codes from server to client, formatted using the Telnet protocol specification. Because it stays open, the client can navigate directories, rename files, or check transfer status at any point without coordinating with an active data transfer.

The **data connection** is created and torn down for each individual transfer or directory listing. Its setup depends on whether the session is operating in active or passive mode (see below). In both cases, once the transfer completes, the data connection closes, and the control connection remains ready for the next command. This separation is analogous to the difference between a telephone call and a text message: the control channel is the persistent call on hold, while each data connection is a distinct message sent and received independently.

FTP is a **stateful protocol**. Unlike HTTP, which treats each request independently, an FTP server tracks the authenticated identity, current working directory, negotiated transfer type, and connection mode for the lifetime of the session[^fortinet]. This statefulness is what allows `CWD` commands to accumulate into a navigation path and for data transfers to inherit the parameters set earlier in the session.

## Active and passive mode

The mechanism by which the data connection is established — and the reason it became a persistent source of operational difficulty — is the distinction between active and passive mode.

### Active mode

In active mode, after the client establishes the control connection, it sends a `PORT` command containing its own IP address and an ephemeral port on which it is listening for the incoming data connection. The format encodes the 32-bit IP address and 16-bit port as six decimal integers: `PORT h1,h2,h3,h4,p1,p2`, where the port is computed as `p1 × 256 + p2`[^postelReynolds1985]. The server then initiates a TCP connection *from* its port 20 *to* the client's specified address and port.

This works cleanly when both endpoints have public, routable IP addresses. In modern networks it routinely fails because the server's inbound connection to the client appears to the client's firewall as an unsolicited external connection, which the firewall drops. NAT compounds the problem: the `PORT` command embeds the client's private IP address, which is unreachable from the server's perspective[^dropbox2024][^domantasG2025].

### Passive mode

Passive mode inverts the initiation responsibility. The client sends `PASV` (no arguments), and the server responds with reply code 227 and its own IP address plus an ephemeral listening port in the same six-octet format. The client then opens the data connection *to* that address and port. Because both the control and data connections are now initiated outbound from the client, they pass cleanly through client-side firewalls and NAT devices[^postelReynolds1985].

RFC 2428 introduced the **Extended Passive Mode** command `EPSV` specifically for IPv6 compatibility[^rfc2428]. The `EPSV` response includes only a port number — not an IP address — and instructs the client to reuse the same IP address as the control connection. This avoids both the address-format limitations of the original `PASV` and the NAT translation issues that arise when a server reports its private IP in the `PASV` response.

The trade-off is that passive mode shifts the firewall burden to the server side: administrators must open a range of high-numbered ports to accept incoming data connections, and that range must be explicitly configured so that `PASV` responses advertise a reachable port.

## Commands and reply codes

RFC 959 defines more than 30 commands, divided into three functional groups[^postelReynolds1985].

**Access control commands** manage the session lifecycle and navigation: `USER` and `PASS` perform credential exchange, `CWD` and `CDUP` navigate the directory tree, and `QUIT` terminates the session cleanly.

**Transfer parameter commands** configure how data will be moved. `PORT` and `PASV` set up the data connection as described above. `TYPE` selects the data representation — `A` for ASCII text (with line-ending translation), `I` for image/binary (raw bytes, no translation), and `E` for EBCDIC. `MODE` selects the transmission mode: stream (default, continuous byte stream), block (structured with headers), or compressed (run-length encoded). `STRU` sets the file structure to file, record, or page.

**Service commands** perform file operations: `RETR` downloads a file, `STOR` uploads one, `APPE` appends to an existing file, `DELE` deletes a file, `MKD` and `RMD` create and remove directories, `PWD` reports the current directory, and `LIST` sends a directory listing over the data connection. RFC 959 specifies a minimum conforming implementation that must support at least `USER`, `QUIT`, `PORT`, `TYPE`, `MODE`, `STRU`, `RETR`, `STOR`, and `NOOP`[^postelReynolds1985].

Every command elicits a **three-digit numeric reply**. The digit structure encodes both outcome and category:

| First digit | Meaning |
|---|---|
| `1xx` | Positive preliminary — action started, further reply expected |
| `2xx` | Positive completion — command succeeded |
| `3xx` | Positive intermediate — further input required |
| `4xx` | Transient negative — failure that may resolve on retry |
| `5xx` | Permanent negative — command will not succeed as issued |

The second digit groups replies by function: `x0z` for syntax, `x2z` for connection status, `x3z` for authentication, and `x5z` for file-system status. Commonly encountered codes include `220` (service ready), `331` (username accepted, password required), `230` (login successful), `150` (about to open data connection), `226` (transfer complete), `530` (not logged in), and `550` (file unavailable)[^postelReynolds1985].

### A typical session

The following illustrates a minimal authenticated file download in passive mode:

```
C → S: USER alice
S → C: 331 Password required
C → S: PASS s3cr3t
S → C: 230 User logged in
C → S: PASV
S → C: 227 Entering Passive Mode (192,0,2,1,19,136)   ; port = 19*256+136 = 5000
C → S: RETR /reports/q1.csv
S → C: 150 Opening data connection
       [data connection opens; file bytes transfer; data connection closes]
S → C: 226 Transfer complete
C → S: QUIT
S → C: 221 Goodbye
```

## Authentication

The FTP login sequence is a two-step challenge-response: the client sends `USER <name>`, the server replies with `331`, the client sends `PASS <password>`, and the server returns `230` on success or `530` on failure[^postelReynolds1985]. RFC 959 acknowledges that password information is sensitive and recommends masking it in user interfaces, but the protocol itself transmits credentials in cleartext over the wire.

**Anonymous FTP** is a convention in which servers permit public access under the username `anonymous`, with an email address supplied as the password[^domantasG2025][^fortinet]. This mechanism was historically important for distributing software and academic datasets before HTTP-based downloads became dominant.

## Security weaknesses

FTP's security problems are architectural, not incidental — the protocol was designed before network security was a design consideration, and RFC 959's stated goals (file sharing, remote computer use, heterogeneous filesystem abstraction, reliable transfer) make no mention of confidentiality or integrity[^postelReynolds1985]. The consequences are severe and well-documented in RFC 2577[^allmanOstermann1999].

The most fundamental vulnerability is **plaintext transmission**: usernames, passwords, and all transferred file data cross the network as readable text, fully visible to any observer with access to the path between client and server[^allmanOstermann1999][^dropbox2024][^fortinet].

Beyond passive eavesdropping, three structural attacks are worth noting:

- **FTP bounce attack**: The `PORT` command accepts any IP address, not just the client's own. An attacker can instruct an FTP server to open data connections to arbitrary third-party hosts, using the server as an anonymizing proxy to port-scan internal networks or forge traffic from a trusted address[^allmanOstermann1999].
- **Man-in-the-middle**: FTP provides no mechanism for verifying server identity, so an attacker who can intercept traffic can impersonate the server, steal credentials, and substitute malicious file content.
- **Brute-force**: Because the protocol imposes no authentication throttling, RFC 2577 recommends (but cannot require) that servers limit failed login attempts to three to five tries with five-second delays between failures[^allmanOstermann1999].

## Secure alternatives

### FTPS

**FTPS** (FTP Secure) wraps FTP's existing protocol in TLS, preserving the dual-channel architecture and command vocabulary while encrypting both the control and data connections. The IETF-standardized form is *Explicit FTPS* (RFC 4217): the client opens a normal FTP connection on port 21 and then issues `AUTH TLS` to negotiate encryption before transmitting credentials[^fordHutchinson2005]. An older, non-standardized form called *Implicit FTPS* dedicates port 990 to mandatory TLS from the first byte of the connection.

FTPS supports X.509 certificate-based server authentication and optional mutual authentication via client certificates. Its principal limitation is that TLS encryption defeats the firewall ALGs (application-layer gateways) that inspect FTP control-channel traffic to dynamically open passive data ports — because the commands are now encrypted, the ALG cannot read them. Organizations using FTPS must therefore configure passive port ranges explicitly on both server firewalls and load balancers[^fordHutchinson2005].

### SFTP

**SFTP** (SSH File Transfer Protocol) is not FTP tunneled over SSH. It is an independent protocol designed from scratch as an SSH subsystem, running over a *single encrypted connection on port 22*[^ylonenLonvick2006]. The dual-channel complexity of FTP is absent: commands, authentication, and data travel over the same SSH session. Authentication uses SSH mechanisms — public/private key pairs, encrypted passwords, or keyboard-interactive methods — and encryption is non-negotiable rather than opt-in. SFTP also supports remote file attribute manipulation and symbolic link operations that plain FTP lacks.

Notably, the SFTP specification never advanced beyond IETF Internet Draft status and was never published as a formal RFC, yet it has become the de facto standard for secure file transfer, implemented universally in tools like OpenSSH, WinSCP, and FileZilla[^dropbox2024].

The choice between FTPS and SFTP is largely contextual. FTPS integrates naturally with environments that already rely on FTP workflows and TLS certificate infrastructure and is sometimes mandated by compliance frameworks. SFTP is preferred for new deployments where SSH infrastructure already exists, and for scenarios that demand firewall simplicity.

| Property | FTP | FTPS | SFTP |
|---|---|---|---|
| Encryption | None | TLS (optional or required) | SSH (always) |
| Ports | 21 (control), 20 (data) | 21 or 990 + passive range | 22 (single) |
| Channels | Two (control + data) | Two (control + data) | One |
| Authentication | Plaintext password | Password or X.509 cert | Password or SSH key |
| Firewall friendliness | Low | Low | High |
| Formal standard | RFC 959 | RFC 4217 | IETF Internet Draft |

## Current status

No major web browser supports plain FTP as of 2026. Chrome removed it in version 88 (January 2021), Firefox in version 90 (July 2021), and Edge followed Chromium's lead. The removals reflected both negligible usage — Firefox telemetry showed under 0.32% of active users ever accessing an FTP URL — and the impossibility of retrofitting FTP with browser-grade security guarantees[^dropbox2024].

FTP nonetheless persists in legacy systems across healthcare, finance, manufacturing, and government, where migration costs remain high and workflows were built around FTP decades ago. Web hosting providers continue to offer it alongside SFTP for site file management[^domantasG2025]. The broader file-transfer solution market — encompassing SFTP, FTPS, and managed file transfer platforms — was valued at approximately $0.55 billion in 2024 and is projected to reach $1.32 billion by 2033, though this growth is driven by secure variants and automation platforms rather than plain FTP[^businessResearchInsights2025].

Regulatory pressure accelerates the transition away from unencrypted FTP. Compliance frameworks including PCI DSS, HIPAA, and NIST SP 800-171 prohibit the unencrypted transmission of sensitive data, effectively ruling out plain FTP for any regulated use case.

[^allmanOstermann1999]: Allman, M., & Ostermann, S. (1999). *FTP security considerations* (RFC 2577). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc2577

[^businessResearchInsights2025]: Business Research Insights. (2025). *FTP (File Transfer Protocol) solution market size, growth 2032*. https://www.businessresearchinsights.com/market-reports/ftp-file-transfer-protocol-solution-market-113656

[^domantasG2025]: Domantas G. (2025, August 8). What is FTP: File Transfer Protocol explained for beginners. *Hostinger Tutorials*. https://www.hostinger.com/tutorials/what-is-ftp

[^dropbox2024]: Dropbox. (2024, October 27). *What is File Transfer Protocol (FTP)?* Dropbox Resources. https://www.dropbox.com/resources/what-is-ftp

[^fordHutchinson2005]: Ford-Hutchinson, P. (2005). *Securing FTP with TLS* (RFC 4217). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc4217

[^fortinet]: Fortinet. (n.d.). *What is FTP (File Transfer Protocol)?* Fortinet CyberGlossary. https://www.fortinet.com/resources/cyberglossary/file-transfer-protocol-ftp-meaning

[^horowitzLunt1997]: Horowitz, M., & Lunt, S. (1997). *FTP security extensions* (RFC 2228). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc2228

[^kuroseRoss2017]: Kurose, J. F., & Ross, K. W. (2017). *Computer networking: A top-down approach* (7th ed.). Pearson.

[^postelReynolds1985]: Postel, J., & Reynolds, J. (1985). *File Transfer Protocol (FTP)* (RFC 959). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc959

[^rfc2428]: RFC 2428. (1998). *FTP extensions for IPv6 and NATs*. Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc2428

[^ylonenLonvick2006]: Ylonen, T., & Lonvick, C. (2006). *The Secure Shell (SSH) transport layer protocol* (RFC 4253). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc4253
