---
title: "Torrenting"
date: 2026-03-28
draft: false
tags:
- file-sharing
- networking
- p2p
---

**Peer-to-peer file sharing** is a networking paradigm in which computers exchange data directly with one another rather than routing all transfers through a central server. Where traditional client-server architectures concentrate both storage and distribution at a single point, P2P systems distribute those responsibilities across all participating nodes — turning every downloader into an uploader. The approach scales naturally with demand: the more popular a resource becomes, the more nodes hold copies of it and can serve it to others, which is precisely the opposite of the congestion that overwhelms conventional servers at peak load.

**BitTorrent**, created by Bram Cohen in 2001, is the dominant P2P protocol and the one most people mean when they speak of “torrenting.”[^cohenWiki] It solved two problems that defeated earlier P2P systems: the free-rider problem (peers who download without contributing) and the bandwidth bottleneck of early distribution (where one server absorbs all initial load). Its elegant incentive design and cryptographic integrity checking made it not only resilient but trustworthy — a combination that has since found application in scientific data distribution, enterprise software deployment, and the emerging decentralized web, as well as in the copyright controversies that first made the technology famous.

## Protocol architecture

### The torrent file and swarm formation

A BitTorrent transfer begins with a **.torrent file** — a bencoded metadata dictionary specifying the tracker address, filenames, piece sizes, and a sequence of SHA-1 hashes, one per piece of the file being shared.[^bep3] Piece size is typically 256 KiB. The **info-hash**, a SHA-1 digest of the bencoded info dictionary, serves as a globally unique identifier for every torrent on the network. All peers holding this hash are collectively called the **swarm**.

A client joining a swarm contacts the **tracker** — an HTTP or UDP server — with its info-hash, peer ID, port, and running transfer statistics. The tracker returns a list of active peers. The client then initiates TCP connections using a 68-byte handshake that contains the protocol string `BitTorrent protocol`, the info-hash, and a peer ID. Once both sides confirm a matching info-hash, messages flow as length-prefixed binary frames: `choke`, `unchoke`, `interested`, `have`, `bitfield`, `request`, `piece`, and `cancel`.

### Piece selection and the choking algorithm

Two algorithms give BitTorrent its efficiency. **Rarest-first piece selection** directs each peer to download whichever pieces are held by the fewest other peers in the swarm, maximizing diversity and preventing single-piece bottlenecks.[^cohen2003] The **tit-for-tat choking algorithm** implements reciprocity: each peer unchokes the four peers currently providing the best upload rates, plus one randomly selected peer rotated every 30 seconds (optimistic unchoking). Peers who download without uploading find themselves choked by nearly everyone, approximating a Pareto-efficient allocation without any central coordinator.

### Distributed Hash Table and magnet links

BitTorrent’s most structurally important evolution was the adoption of **Mainline DHT** (BEP 5), based on the Kademlia protocol.[^maymounkov2002] Each node receives a random 160-bit ID drawn from the same space as SHA-1 info-hashes; distance between nodes is computed via XOR. Lookups converge in (O(\log n)) steps through a routing table of *k*-buckets (k = 8), and four UDP-based KRPC queries — `ping`, `find_node`, `get_peers`, and `announce_peer` — enable fully trackerless peer discovery. By 2013, Mainline DHT supported an estimated 16–28 million concurrent users.[^bep5]

**Magnet links** completed the decentralization. A magnet URI encodes only the info-hash (and optionally a display name and tracker hints). The client queries the DHT to find peers, then uses the metadata exchange extension (BEP 9) to fetch the info dictionary in 16 KiB blocks, verifying each against the info-hash.[^bep9] Additional extensions include PEX (Peer Exchange, BEP 11) for sharing peer lists between connected nodes; uTP (BEP 29), a UDP-based transport using LEDBAT congestion control to avoid disrupting interactive traffic; and MSE/PE, a Diffie-Hellman-based stream obfuscation layer that prevents ISP throttling based on protocol signatures.

## History

### Napster and the first wave (1999–2001)

The modern P2P era began on June 1, 1999, when Shawn Fanning launched Napster from his Northeastern University dormitory.[^napsterWiki] The service used a centralized index server to connect users exchanging MP3 files, and its growth was extraordinary: at its peak it had approximately 80 million registered users, with campus networks reporting that up to 61% of external traffic consisted of MP3 transfers. The centralized architecture that made Napster easy to use also made it fatally vulnerable — a 1999 RIAA lawsuit led to a court order shutting the service down in July 2001, and it filed for bankruptcy in June 2002.[^napsterLegal]

### Decentralization and the BitTorrent era (2001–2006)

Napster’s shutdown triggered a race toward decentralized architectures. Gnutella (released by Nullsoft’s Justin Frankel in March 2000) eliminated central servers but relied on query flooding, which did not scale. Kazaa, built on the FastTrack protocol with roughly 30,000 supernodes, was downloaded over 389 million times before legal pressure shut it down.[^kazaaLegal] eDonkey2000 pioneered file assembly from multiple simultaneous sources; its open-source successor eMule accumulated over 693 million downloads on SourceForge.[^emuleWiki]

Bram Cohen released the first BitTorrent client on July 2, 2001, and presented the protocol formally at CodeCon in February 2002.[^cohenTimeline] By 2004, BitTorrent traffic represented an estimated 20–35% of all internet traffic. The index sites that made torrents discoverable — including The Pirate Bay, which launched September 15, 2003 — became the next legal battleground.[^tpbWiki]

### Streaming, enforcement, and the present (2007–present)

The launch of Netflix streaming (2007) and Spotify (2008) reduced P2P music piracy from one in five American internet users at its 2005 peak to roughly one in ten by 2012. Research published in *MIS Quarterly* found that UK site-blocking orders caused a 7–12% increase in visits to paid streaming platforms, suggesting legal access meaningfully displaces infringement.[^danaher2020] The subsequent fragmentation of streaming services into competing walled gardens reversed part of this decline: Parks Associates projected cumulative US streaming revenue losses to piracy exceeding $113 billion by 2027.[^parksAssoc]

KickassTorrents, which surpassed The Pirate Bay in traffic by 2014, was seized by US authorities in July 2016.[^katWiki] The Pirate Bay itself survived a 65-officer police raid in May 2006, criminal convictions for its founders in April 2009, and a second raid in December 2014 — returning each time under mirror domains or new hosting arrangements.[^tpbWiki]

## Legitimate applications

Linux distributions represent the protocol’s oldest and most visible legitimate use. Virtually every major distribution — Ubuntu, Fedora, Arch Linux, Manjaro, and Linux Mint among them — offers official BitTorrent downloads, relying on the network to absorb release-day traffic surges and verify file integrity without additional server cost.[^fossTorrents]

Academic data sharing has become a critical application. **Academic Torrents**, founded in 2013 by Joseph Paul Cohen and Henry Z. Lo at the University of Massachusetts, hosts over 32 TB of research data and serves over 3 TB daily to more than 30,000 monthly users, including major machine-learning datasets like ImageNet.[^cohen2014] BioTorrents demonstrated the protocol’s suitability for genomic data: in a single month, users downloaded the 8,981 GB 1000 Genomes dataset 100,000 times.[^langille2010]

Enterprise adoption has been equally significant. Facebook uses BitTorrent internally to push hundreds of megabytes to tens of thousands of servers in under a minute.[^facebook2010] Twitter’s open-source “Murder” tool reduced 40-minute deployment cycles to 12 seconds — a 75-fold improvement.[^twitterMurder] The Internet Archive added BitTorrent as a download option for over 1.4 million items in 2012, calling it “the fastest means of downloading media from the Archive.”[^bitWiki] Microsoft’s Delivery Optimization in Windows 10 and later uses P2P principles to distribute system updates between devices on the same network.[^microsoftDO] The gaming industry employed the same approach: Blizzard Entertainment distributed World of Warcraft patches via a BitTorrent-based downloader for years.[^blizzardDownloader]

## Protocol evolution and next-generation systems

### BitTorrent v2

**BitTorrent v2** (BEP 52) replaces SHA-1 with SHA-256 and introduces Merkle hash trees with 16 KiB leaf nodes.[^libtorrent2020] The change was motivated by Google’s 2017 demonstration of a practical SHA-1 collision. Merkle trees yield smaller torrent metadata (accelerating magnet-link startup), enable block-level validation (detecting corruption from a single 16 KiB block rather than an entire multi-megabyte piece), and allow per-file hash trees that support cross-torrent deduplication. A hybrid mode maintains backward compatibility with v1 clients. Implementation is led by libtorrent, with support in qBittorrent and BiglyBT.[^libtorrent2020]

### WebTorrent

**WebTorrent**, created by Feross Aboukhadijeh, brings BitTorrent to the browser using **WebRTC** data channels.[^webtorrentHandwiki] The JavaScript library supports streaming playback before download completion and is loaded approximately 5 million times per month. WebTorrent Desktop bridges WebRTC-based browser peers with traditional TCP/UDP BitTorrent networks, enabling a fully interoperable mixed swarm. A major milestone arrived when libtorrent added WebRTC support, allowing qBittorrent, Deluge, and other clients to seed directly to browser peers.

### IPFS and decentralized storage

The **InterPlanetary File System** (IPFS), created by Juan Benet at Protocol Labs, extends P2P principles with content addressing — files are identified by cryptographic hashes (Content Identifiers, or CIDs) rather than by location URLs.[^ipfsIEEE] This ensures that any node with a copy can serve a file regardless of where it was originally hosted. The network supports over 250,000 daily active nodes. In January 2024, the Filecoin Foundation and Lockheed Martin successfully deployed IPFS in orbit, transmitting files between Earth and a CubeSat — a milestone for resilient off-planet communications.[^filecoinSpace]

**Filecoin**, IPFS’s incentive layer, now secures approximately 2.1 exbibytes of data, with the Filecoin Virtual Machine enabling smart contracts on the storage network. The broader Decentralized Physical Infrastructure Networks (DePIN) sector grew from a $5.2 billion market capitalization in 2024 to over $19 billion by late 2025, driven partly by AI workloads demanding distributed storage at scale.[^depin2026]

[^bep3]: BitTorrent.org. (2008). [*BEP 3: The BitTorrent Protocol Specification*](https://www.bittorrent.org/beps/bep_0003.html). BitTorrent Enhancement Proposals.

[^bep5]: BitTorrent.org. (2008). [*BEP 5: DHT Protocol*](https://www.bittorrent.org/beps/bep_0005.html). BitTorrent Enhancement Proposals.

[^bep9]: BitTorrent.org. (2008). [*BEP 9: Extension for Peers to Send Metadata Files*](https://www.bittorrent.org/beps/bep_0009.html). BitTorrent Enhancement Proposals.

[^bitWiki]: Wikipedia. (n.d.). [*BitTorrent*](https://en.wikipedia.org/wiki/BitTorrent). Wikimedia Foundation.

[^blizzardDownloader]: Wowpedia. (n.d.). [*Blizzard Downloader*](https://wowpedia.fandom.com/wiki/Blizzard_Downloader). Fandom.

[^cohen2003]: Cohen, B. (2003). *Incentives build robustness in BitTorrent*. Workshop on Economics of Peer-to-Peer Systems.

[^cohen2014]: Cohen, J. P., & Lo, H. Z. (2014). Academic Torrents: A community-maintained distributed repository. *Proceedings of the 2014 Annual Conference on Extreme Science and Engineering Discovery Environment (XSEDE ’14)*. ACM. https://doi.org/10.1145/2616498.2616528

[^cohenTimeline]: Computer Timeline. (n.d.). [*Bram Cohen (BitTorrent)*](http://www.computer-timeline.com/timeline/bram-cohen/). Computer Timeline.

[^cohenWiki]: Wikipedia. (n.d.). [*Bram Cohen*](https://en.wikipedia.org/wiki/Bram_Cohen). Wikimedia Foundation.

[^danaher2020]: Danaher, B., Smith, M. D., & Telang, R. (2020). The effect of piracy website blocking on consumer behavior. *MIS Quarterly, 44*(3). Carnegie Mellon University. https://www.cmu.edu/entertainment-analytics/documents/effectiveness-of-anti-piracy-efforts/uk-blocking-misq.pdf

[^depin2026]: AdiPek. (2026). [*Web3 Storage War 2026: Filecoin, Arweave & DePIN Boom*](https://adipek.com/articles/the-web3-storage-war-is-here-why-decentralized-file-systems-are-suddenly-everywhere-in-2026). AdiPek.

[^emuleWiki]: Wikipedia. (n.d.). [*eMule*](https://en.wikipedia.org/wiki/EMule). Wikimedia Foundation.

[^facebook2010]: TorrentFreak. (2010, June 25). [*Facebook uses BitTorrent, and they love it*](https://torrentfreak.com/facebook-uses-bittorrent-and-they-love-it-100625/). TorrentFreak.

[^filecoinSpace]: Filecoin Foundation. (2024). [*Filecoin Foundation successfully deploys IPFS in space*](https://fil.org/blog/filecoin-foundation-successfully-deploys-interplanetary-file-system-ipfs-in-space). Filecoin Foundation.

[^fossTorrents]: FOSS Torrents. (n.d.). [*Free open-source distribution torrents*](https://fosstorrents.com/distributions/). FOSS Torrents.

[^ipfsIEEE]: Benet, J., & Greco, N. (2020). The InterPlanetary File System and the Filecoin Network. *IEEE Conference Publication*. https://ieeexplore.ieee.org/document/9159174/

[^katWiki]: Wikipedia. (n.d.). [*KickassTorrents*](https://en.wikipedia.org/wiki/KickassTorrents). Wikimedia Foundation.

[^kazaaLegal]: The Law Institute. (n.d.). [*The legal battles of P2P networks: From Napster to Kazaa*](https://thelaw.institute/commerce-and-cyberspace/legal-battles-p2p-networks-napster-kazaa/). TheLaw.Institute.

[^langille2010]: Langille, M. G. I., & Eisen, J. A. (2010). BioTorrents: A file sharing service for scientific data. *PLoS ONE, 5*(4). https://doi.org/10.1371/journal.pone.0010071

[^libtorrent2020]: Norberg, A. (2020, September). [*BitTorrent v2*](https://blog.libtorrent.org/2020/09/bittorrent-v2/). libtorrent blog.

[^maymounkov2002]: Maymounkov, P., & Mazières, D. (2002). Kademlia: A peer-to-peer information system based on the XOR metric. *Proceedings of the 1st International Workshop on Peer-to-Peer Systems (IPTPS ’02)*, 53–65.

[^microsoftDO]: Microsoft Learn. (n.d.). [*Optimize Windows update delivery*](https://learn.microsoft.com/en-us/windows/deployment/do/waas-optimize-windows-10-updates). Microsoft.

[^napsterWiki]: Wikipedia. (n.d.). [*Napster*](https://en.wikipedia.org/wiki/Napster). Wikimedia Foundation.

[^parksAssoc]: VdoCipher. (n.d.). [*Streaming piracy statistics & fixes for pirate streaming services*](https://www.vdocipher.com/blog/streaming-piracy/). VdoCipher.

[^tpbWiki]: Wikipedia. (n.d.). [*The Pirate Bay*](https://en.wikipedia.org/wiki/The_Pirate_Bay). Wikimedia Foundation.

[^twitterMurder]: Twitter Engineering. (2010, July 16). [*Murder: Fast datacenter code deploys using BitTorrent*](https://blog.twitter.com/engineering/en_us/a/2010/murder-fast-datacenter-code-deploys-using-bittorrent). Twitter Engineering Blog.

[^webtorrentHandwiki]: HandWiki. (n.d.). [*Software: WebTorrent*](https://handwiki.org/wiki/Software:WebTorrent). HandWiki.