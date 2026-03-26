---
title: "HTTP"
date: 2026-03-20
updated: 2026-03-19
draft: false
tags:
  - networking
  - protocols
---

**Hypertext Transfer Protocol** (HTTP) is the application-layer protocol that governs how messages are exchanged between clients and servers on the World Wide Web. Designed by Tim Berners-Lee at CERN between 1989 and 1991, it has evolved through four major versions — each one addressing the performance limitations of its predecessor — while preserving the protocol's foundational simplicity. Today, HTTP underpins virtually every interaction between web browsers, mobile applications, APIs, and servers, making it the most widely deployed application protocol on the internet[^mdnA].

HTTP operates on a **client-server architecture**: a client, typically a web browser, sends a request message to a server, which processes it and returns a response. That exchange — one request, one response — constitutes a single HTTP transaction. Between those two endpoints, intermediaries called **proxies** may sit in the path to perform caching, load balancing, authentication, or logging. A typical modern web page requires the browser to complete dozens to hundreds of such transactions in rapid succession, fetching HTML, CSS, JavaScript, images, and fonts as distinct resources. The efficiency of that process — how quickly connections are established, how many requests can travel in parallel, how much repeated data can be suppressed — has driven every major revision to the protocol.

## Request and response structure

Every HTTP transaction begins with the client transmitting a request that carries four elements: a **method** indicating the desired action, a **request target** (the resource path), the protocol version, and a set of **headers** supplying metadata. The server replies with a status line containing the protocol version and a three-digit **status code**, followed by its own headers and an optional body holding the requested resource or result[^fielding9110].

In HTTP/1.x this exchange is plain text, which made the protocol straightforward to debug and contributed to its early adoption. The cost of that readability is verbosity: headers are repeated in full on every request. HTTP/2 and HTTP/3 replace the text format with binary encoding partly to address this overhead, but the logical structure of method, target, headers, and body remains unchanged across all versions.

## Version history

The evolution of HTTP spans more than three decades and reflects the internet's transformation from a research network into global commercial infrastructure.

HTTP/0.9, the original 1991 protocol, was so minimal it had no version number — the designation was applied retroactively. A request was a single line (`GET /page.html`) and a response was raw HTML. There were no headers and no status codes.

HTTP/1.0, formalized in RFC 1945, introduced version information, status codes, headers, and the `Content-Type` header that enabled transmission of non-HTML content. Its critical limitation was that it opened a **new TCP connection for every single request**, requiring a full three-way handshake each time — severe overhead for pages with many resources[^bernesLee1996].

HTTP/1.1, first published as RFC 2068 in January 1997 and revised as RFC 2616 in June 1999, became the workhorse of the web for nearly two decades. It made **persistent connections** the default, eliminating repeated handshakes; added the mandatory `Host` header that enabled virtual hosting of multiple domains on a single IP address; and introduced chunked transfer encoding and more expressive cache controls. HTTP/1.1 also specified **pipelining** — sending multiple requests without waiting for each response — but head-of-line blocking (a slow response stalling all subsequent ones) and inconsistent proxy implementations prevented it from being enabled by default in any major browser[^fieldingReschke2014].

HTTP/2, published as RFC 7540 in May 2015 and revised as RFC 9113 in June 2022, was derived from Google's experimental SPDY protocol. It introduced a **binary framing layer** that replaced HTTP/1.x's plain text, full **stream multiplexing** over a single TCP connection, **HPACK header compression**, server push, and connection-level flow control. These changes substantially reduced latency, particularly for pages with many small resources. One limitation persisted: because all streams share a single TCP byte stream, a lost TCP packet stalls every in-flight stream until retransmission completes — a problem known as TCP-level head-of-line blocking[^bishop2022a].

HTTP/3, published as RFC 9114 in June 2022, resolves that bottleneck by replacing TCP entirely with **QUIC**, a UDP-based transport protocol standardized in RFC 9000. QUIC implements stream multiplexing at the transport layer so that a lost packet affects only the streams whose data it carried. It also mandates TLS 1.3 encryption, supports 1-RTT connection establishment, and enables **connection migration** — connections survive a network change, such as switching from Wi-Fi to cellular, without re-establishing the session[^bishop2022b].

In the same month, the IETF published a landmark reorganization of the HTTP specification. RFC 9110 separated *HTTP Semantics* — the universal meaning of methods, status codes, and headers — from version-specific wire formats. RFC 9111 codified caching. RFCs 9112, 9113, and 9114 then defined the wire formats for HTTP/1.1, HTTP/2, and HTTP/3 respectively. This was the first time HTTP achieved formal Internet Standard status[^fielding9110].

## Methods

HTTP methods, sometimes called verbs, indicate the intended action on a resource. RFC 9110 defines nine standard methods and assigns each a combination of three semantic properties: **safety** (the method does not modify server state), **idempotency** (repeated identical requests produce the same outcome as a single one), and cacheability (the response may be stored and reused)[^fielding9110].

`GET` retrieves a representation of a resource and is safe, idempotent, and cacheable — the most common method on the web. `HEAD` is identical to `GET` but returns only headers without a body, useful for checking a resource's metadata without downloading its content. `POST` submits data to a resource, typically causing a state change on the server, and is neither safe nor idempotent: sending the same `POST` twice may create two records. `PUT` replaces the entire target resource with the request payload; it is idempotent because uploading the same content twice leaves the resource in the same state. `DELETE` removes the specified resource and is also idempotent. `PATCH`, defined in RFC 5789, applies partial modifications rather than a full replacement, and is not guaranteed to be idempotent. `OPTIONS` returns the methods the server supports for a given resource and plays a central role in CORS preflight checks. `TRACE` echoes the received request back to the client for diagnostic purposes and is typically disabled in production to prevent cross-site tracing attacks. `CONNECT` establishes a tunnel through a proxy, most commonly to relay HTTPS traffic[^mdnB].

The safety and idempotency properties matter in practice because they determine how clients and caches should behave on failure. A client that loses the connection mid-`GET` can safely retry; retrying a `POST` without user confirmation risks unintended side effects.

## Status codes

HTTP status codes are three-digit integers grouped into five classes, each communicating a category of outcome. They are defined comprehensively in RFC 9110[^fielding9110].

*1xx Informational* responses signal that the server has received the request and processing is ongoing. `100 Continue` tells a client that it may proceed with sending a large request body. `101 Switching Protocols` acknowledges a protocol upgrade, most commonly from HTTP to WebSocket. `103 Early Hints` allows the server to send preliminary `Link` headers so the browser can begin preloading subresources before the final response arrives.

*2xx Success* responses confirm that the request was received, understood, and accepted. `200 OK` is the standard success code; `201 Created` indicates that a new resource was produced and typically includes its URI in the `Location` header; `204 No Content` signals success with no body to return, common for `DELETE` and certain `PUT` responses.

*3xx Redirection* responses require the client to take an additional step. A subtle but important distinction separates `301 Moved Permanently` and `308 Permanent Redirect`: `301` may cause some clients to downgrade a `POST` to a `GET` on the redirected request, whereas `308` explicitly preserves the original method. `304 Not Modified` serves a specific caching role — it confirms that the client's cached copy remains current, saving bandwidth without retransmitting the body.

*4xx Client Error* responses attribute the failure to the request itself. `401 Unauthorized` — more precisely, unauthenticated — demands credentials and must be accompanied by a `WWW-Authenticate` header specifying the accepted scheme. `403 Forbidden` means the server understood the request and refuses it regardless of credentials. `404 Not Found` is the most widely recognized code. `429 Too Many Requests` signals rate limiting and should include a `Retry-After` header.

*5xx Server Error* responses indicate that the server failed to fulfill a valid request. `500 Internal Server Error` is the generic fallback. `503 Service Unavailable` signals temporary overload or maintenance and should also carry a `Retry-After` header. `504 Gateway Timeout` means an upstream server failed to respond in time.

## Headers

HTTP headers are key-value pairs that carry the metadata shaping every transaction — caching directives, authentication credentials, content descriptions, connection preferences, and security policies. In HTTP/1.x they are transmitted as case-insensitive ASCII text, one per line. In HTTP/2 and HTTP/3 they are binary-encoded, normalized to lowercase, and supplemented by **pseudo-headers** such as `:method`, `:path`, and `:status` that carry information formerly embedded in the request and status lines (MDN Web Docs, n.d.-c).

Request headers describe the client and constrain the acceptable response. `Host` is mandatory in HTTP/1.1 and identifies the target domain, enabling a single server to host multiple sites. `Accept`, `Accept-Language`, and `Accept-Encoding` drive **content negotiation**, telling the server which MIME types, languages, and compression formats the client can handle. `Authorization` carries credentials, typically a bearer token or a base64-encoded username-and-password pair. `Cookie` transmits previously stored cookie values. The conditional request headers `If-None-Match` and `If-Modified-Since` are the mechanism behind cache validation: they allow the client to ask whether its cached copy is still current before downloading a fresh one.

Response headers communicate server-side metadata. `Content-Type` declares the MIME type and character encoding of the body (e.g., `text/html; charset=utf-8`). `Set-Cookie` instructs the client to store a cookie, with attributes governing its expiry, path, domain, and security constraints. `Cache-Control` directs caching behavior for both clients and intermediaries. `ETag` provides a version identifier for a resource. `Location` specifies the URI for redirects and newly created resources. `Vary` tells caches which request headers must match before a cached response can be reused — `Vary: Accept-Encoding`, for example, ensures compressed and uncompressed responses are cached separately.

Headers are also classified by forwarding scope. **End-to-end headers** travel to the final recipient and are stored by caches. **Hop-by-hop headers** — such as `Connection`, `Keep-Alive`, and `Transfer-Encoding` — are meaningful only for a single forwarding step and must be removed before the message is forwarded.

## HTTPS

HTTP transmits data in plaintext over port 80, making it readable to anyone on the network path. **HTTPS** (HTTP Secure) addresses this by running HTTP over a TLS (Transport Layer Security) tunnel on port 443. HTTPS is not a distinct protocol — it is standard HTTP with an encrypted transport layer inserted beneath it. The TLS layer provides three guarantees: confidentiality (data is unreadable to observers), integrity (tampering is detectable), and authentication (the server's identity is verified via a digital certificate). As of 2025, over 80% of web traffic travels over HTTPS, driven by browser warnings on insecure pages and search ranking signals introduced by Google in 2014[^cloudflareB].

## Statelessness and session management

HTTP is **stateless**: each request-response pair is fully independent, and the server retains no memory of prior exchanges with the same client. This is a deliberate design choice that simplifies server implementation and enables horizontal scaling — any server instance can handle any request without shared in-memory state. The trade-off is that applications requiring continuity across requests, such as authenticated sessions or shopping carts, must reconstruct state on every transaction.

**Cookies** are the primary mechanism for working around statelessness. The server sets a cookie via the `Set-Cookie` response header; the client stores it and automatically includes it in subsequent requests to the same domain using the `Cookie` request header. Cookie attributes control scope and security precisely: `Secure` restricts transmission to HTTPS connections; `HttpOnly` blocks JavaScript access via `document.cookie`, mitigating cross-site scripting attacks; and `SameSite` controls whether the cookie is sent on cross-site requests — `Strict` prevents this entirely, `Lax` (the emerging default) permits it only on top-level navigations, and `None` (which requires `Secure`) allows full cross-site transmission.

Two patterns dominate session management in practice. Server-side sessions store all application state in a server-side database or cache and issue only an opaque session ID as a cookie; this keeps sensitive data off the client but introduces a shared data dependency that complicates stateless horizontal scaling. Token-based authentication using **JSON Web Tokens** (JWTs) embeds signed claims directly in the token, allowing the server to validate state cryptographically without any server-side lookup — well-suited to distributed architectures, though it requires additional infrastructure to support individual token revocation.

## Connection management

The way HTTP manages its underlying transport connections has changed fundamentally at each major version, always in pursuit of the same goal: reducing the latency cost of establishing a connection relative to the time spent transferring data.

HTTP/1.0's non-persistent connections required a new TCP three-way handshake for every request, a significant overhead when a page involved many resources. An unofficial `Connection: keep-alive` extension emerged to allow connection reuse, but it was not standardized. HTTP/1.1 made persistent connections the default, so multiple sequential requests could share a single connection. Browsers further compensated for HTTP/1.1's pipelining limitations — specifically, head-of-line blocking — by opening up to six parallel TCP connections per origin, a pragmatic workaround that consumed considerably more server and network resources.

HTTP/2 addressed this with true stream multiplexing. Multiple concurrent request-response streams, each identified by a stream ID, share a single TCP connection; binary frames from different streams interleave freely, and the receiver reassembles them. A slow response on one stream no longer delays others at the HTTP level. HTTP/2 also adds per-stream and per-connection **flow control** via `WINDOW_UPDATE` frames, preventing any single stream from monopolizing available bandwidth. The remaining limitation was at the TCP layer: a lost packet stalled all streams while the transport retransmitted it, because TCP presents a single ordered byte stream to the layers above it.

HTTP/3 eliminates that constraint by building on QUIC. Because QUIC's streams are independent at the transport layer, a retransmission affects only the stream that lost data. QUIC also combines the transport and TLS handshakes into a single 1-RTT exchange, and for clients reconnecting to a known server, **0-RTT resumption** allows encrypted application data to be sent in the very first packet — at the cost of replay protection, so 0-RTT should be confined to safe, idempotent methods. Servers may reject 0-RTT data with status `425 Too Early`[^bishop2022b].

## Binary framing and header compression

HTTP/2's binary framing layer and its compression scheme, HPACK, address two distinct costs present in HTTP/1.x: the parsing overhead of text-formatted messages and the bandwidth cost of repeatedly transmitting identical headers.

Every HTTP/2 message is decomposed into **frames** — fixed-header binary units each carrying a type, length, flags, and a stream identifier. Frame types serve different purposes: `DATA` frames carry body content, `HEADERS` frames carry compressed headers, `SETTINGS` frames negotiate connection parameters, `WINDOW_UPDATE` frames adjust flow control, `PUSH_PROMISE` frames initiate server push, and `RST_STREAM` frames cancel a stream. The default maximum frame size is 16,384 bytes, configurable up to roughly 16.7 MB.

**HPACK** (RFC 7541) compresses headers using three complementary mechanisms: a static table of 61 predefined common header name-value pairs (such as `:method: GET`), a dynamic table that accumulates headers actually sent over the connection, and Huffman encoding for string literals. HPACK typically achieves over 80% compression of header data. It was also explicitly designed to avoid the vulnerability class exploited by the CRIME attack, which used DEFLATE-based TLS compression to infer plaintext from changes in ciphertext length.

**QPACK** (RFC 9204), the HTTP/3 equivalent, adapts this approach for QUIC's out-of-order stream delivery. Because QUIC streams can arrive independently, HPACK's blocking dependency on an ordered instruction stream would create deadlocks. QPACK addresses this with two dedicated unidirectional streams — one for encoder instructions, one for decoder acknowledgments — decoupling header compression from application data streams entirely[^bishop2022b].

**Server push**, introduced in HTTP/2, allows a server to proactively send resources the client has not yet requested by sending a `PUSH_PROMISE` frame alongside the response to an initial request. The intent is to eliminate the round trip a browser would otherwise need to discover and fetch a CSS file referenced in an HTML document. In practice, adoption has been limited because the server has no reliable way to know which resources are already in the client's cache; RFC 9113 retains server push as an optional feature.

## Caching

HTTP caching stores responses and reuses them for subsequent matching requests, reducing latency for users and load on origin servers. The caching framework is defined in RFC 9111 and controlled primarily through the `Cache-Control` header[^fielding9111].

A **private cache** — the browser's local cache — stores responses for a single user, including personalized content. A **shared cache** sits between clients and origin servers, either as a proxy cache at the network level or as a managed cache such as a CDN or reverse proxy. The `Cache-Control: private` directive restricts storage to private caches; `public` explicitly permits shared caching of responses that would otherwise be considered private.

The `Cache-Control` response directives give precise control over freshness and reuse. `max-age=N` declares the response fresh for N seconds from when it was received. `s-maxage=N` overrides `max-age` specifically for shared caches. `no-store` prohibits caching entirely and is the correct directive when a response must never be stored anywhere. `no-cache` is frequently misunderstood: it permits storage but requires the cache to revalidate with the origin server before every reuse, functionally equivalent to `max-age=0, must-revalidate`. `must-revalidate` prevents a cache from serving stale content even during network outages. `immutable` declares that the response body will never change for its lifetime, suppressing unnecessary revalidation requests on browser reload — most useful for cache-busted assets whose URLs embed a content hash.

Cache **validation** allows a cache to confirm its stored copy is still current without re-downloading the body. The server includes an `ETag` header — typically a hash of the content — when serving a response. When that cached response later becomes stale, the client sends `If-None-Match` with the stored ETag value; if the resource has not changed, the server responds with `304 Not Modified`, resetting the freshness window without transmitting a body. An older parallel mechanism pairs `Last-Modified` timestamps with `If-Modified-Since` conditional requests, though it offers only one-second resolution and can behave unpredictably across distributed servers. When both validators are present, `If-None-Match` takes precedence[^mdnD].

Effective caching strategy follows from the volatility and sensitivity of the content. Static assets with content-hashed filenames — common in modern build pipelines — can be served with `Cache-Control: public, max-age=31536000, immutable`, caching aggressively for one year since any content change produces a new URL. HTML documents, which change without a URL change, should use `no-cache` with `ETag` and `Last-Modified` so clients always validate but receive a cheap `304` when nothing has changed. API responses containing sensitive data should use `no-store`. The `Vary` header is essential wherever content negotiation produces different representations for the same URL — `Vary: Accept-Encoding` ensures compressed and uncompressed variants are cached independently.

[^akamai]: Akamai. (n.d.). *What is HTTP?* https://www.akamai.com/glossary/what-is-http

[^bernesLee1996]: Berners-Lee, T., Fielding, R., & Frystyk Nielsen, H. (1996). *Hypertext Transfer Protocol — HTTP/1.0* (RFC 1945). Internet Engineering Task Force. https://datatracker.ietf.org/doc/html/rfc1945

[^bishop2022a]: Bishop, M. (Ed.). (2022). *HTTP/2* (RFC 9113). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc9113.html

[^bishop2022b]: Bishop, M. (Ed.). (2022). *HTTP/3* (RFC 9114). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc9114.html

[^cloudflareA]: Cloudflare. (n.d.). *What is HTTP?* https://www.cloudflare.com/learning/ddos/glossary/hypertext-transfer-protocol-http/

[^cloudflareB]: Cloudflare. (n.d.). *What is HTTPS?* https://www.cloudflare.com/learning/ssl/what-is-https/

[^fielding9110]: Fielding, R., Nottingham, M., & Reschke, J. (Eds.). (2022). *HTTP semantics* (RFC 9110). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc9110.html

[^fielding9111]: Fielding, R., Nottingham, M., & Reschke, J. (Eds.). (2022). *HTTP caching* (RFC 9111). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc9111.html

[^fieldingReschke2014]: Fielding, R., & Reschke, J. (Eds.). (2014). *Hypertext Transfer Protocol (HTTP/1.1): Message syntax and routing* (RFC 7230). Internet Engineering Task Force. https://datatracker.ietf.org/doc/html/rfc7230

[^mdnA]: MDN Web Docs. (n.d.). *Overview of HTTP*. Mozilla. https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview

[^mdnB]: MDN Web Docs. (n.d.). *HTTP request methods*. Mozilla. https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods

[^mdnC]: MDN Web Docs. (n.d.). *HTTP headers*. Mozilla. https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers

[^mdnD]: MDN Web Docs. (n.d.). *HTTP caching*. Mozilla. https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching
