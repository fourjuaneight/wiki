---
title: "ZFS"
date: 2026-05-04
draft: false
tags:
  - filesystems
  - storage
---

**ZFS** (Zettabyte File System) is an integrated filesystem and volume manager that combines pooled storage, end-to-end checksumming, copy-on-write transactional consistency, and self-healing into a single coherent stack. Rather than layering filesystem semantics on top of a separate volume manager (as with LVM + ext4), ZFS owns the entire path from disk to POSIX interface, which is what makes its integrity guarantees possible. The current open implementation is **OpenZFS**, which runs on Linux, FreeBSD, macOS, and illumos.[^openZFS2025c]

## Architecture

ZFS is organized as a series of layers with narrow interfaces between them:[^dilger2010][^openZFS2025a]

- **ZFS POSIX Layer (ZPL)** — bridges the OS VFS interface to DMU objects, mapping filesystem operations to ZFS internal structures called *znodes*. A parallel layer, **ZVOL**, exposes a raw block device backed by a DMU object.
- **Dataset and Snapshot Layer (DSL)** — manages the hierarchical namespace of filesystems, volumes, snapshots, and clones, plus property inheritance, quotas, and reservations.
- **Data Management Unit (DMU)** — the transactional object store at the core. Every consumer (ZPL, ZVOL, ZIL, scrub, send/receive) interacts with named objects via atomic transactions (*dmu_tx_t*). This is the layer that makes ZFS transactional end-to-end.
- **Adaptive Replacement Cache (ARC)** — the primary in-memory read cache, keyed by disk virtual address (DVA).
- **ZIO pipeline** — a staged I/O framework through which every read, write, free, and trim flows. Pipeline stages perform compression, encryption, checksum computation/verification, deduplication lookups, RAID transforms, and vdev dispatch in a fixed order.[^openZFS2024a]
- **Storage Pool Allocator (SPA)** — drives periodic `spa_sync()` commits that flush transaction groups to disk.
- **Vdev layer** — provides mirroring, parity (RAID-Z/dRAID), and spare operations at the physical layer. Each vdev is divided into roughly 200 **metaslabs**, tracked by append-only **space maps**.

## Storage Pools and Vdevs

A **zpool** is a tree of virtual devices (**vdevs**). Top-level vdevs are where redundancy is defined; ZFS dynamically stripes writes across them at the metaslab level, biasing toward emptier vdevs to balance utilization.[^openZFS2025d] Adding a new top-level vdev increases capacity; losing any top-level vdev makes the pool unimportable, so each should be redundant.

The principal vdev types are:

- **mirror** — N-way mirror; tolerates N-1 failures.
- **raidz1 / raidz2 / raidz3** — single, double, triple parity; tolerates 1, 2, or 3 drive failures respectively.
- **draid** (OpenZFS 2.1+) — distributed RAID with integrated distributed hot spares, enabling faster rebuilds by parallelizing resilver across all surviving disks.[^behlendorf2020]

Support vdevs (`log`, `cache`, `spare`, `special`, `dedup`) are not part of the data striping but attach to the pool for specific functions described below.

## Copy-on-Write and Transactions

ZFS never overwrites a live block. All modifications write new data to freshly allocated locations; the parent block pointer is then updated (and itself written anew), propagating changes up to the root **uberblock**.[^bonwick2007] The uberblock is stored in a rotating 128-slot array in each vdev label, so even the root update is copy-on-write. The result is that a power loss at any moment leaves either the old or the new tree intact — ZFS selects the highest-TXG valid uberblock on import, making fsck unnecessary.[^rossmann2025]

Writes are batched into **transaction groups (TXGs)**, each identified by a strictly increasing 64-bit number. A TXG passes through three pipeline states: *open* (accepting writes), *quiescing* (draining in-flight operations), and *syncing* (flushing dirty buffers through ZIO and writing the new uberblock).[^ahrens2012] By default a new TXG is forced every 5 seconds (`zfs_txg_timeout`) or sooner when accumulated dirty data exceeds `zfs_dirty_data_max`. This batching is why ZFS write I/O is naturally bursty and why latency-sensitive synchronous workloads benefit from a separate ZIL.

## Checksumming and Self-Healing

Every **block pointer** (`blkptr_t`) stores the checksum of the block it points to — not next to the data, but in the parent. This creates a self-validating Merkle tree rooted at the uberblock.[^bonwick2007] The separation protects against bit rot, phantom writes, misdirected I/O, and in-flight DMA corruption — failure modes that a disk-embedded CRC cannot detect because the CRC would be wrong alongside the bad data.

When a checksum mismatch is detected on a redundant pool, ZFS fetches an alternate copy (mirror, RAID-Z reconstruction, or a `copies>1` ditto block), verifies it, and silently rewrites the corrupt block in place. This **self-healing** happens during normal reads without administrator intervention.[^klara2025b]

Available checksum algorithms are selectable via the `checksum` dataset property: Fletcher-2/4 (fast, default for most data), SHA-256/SHA-512, Edon-R, and Skein.

## RAID-Z

RAID-Z avoids the classical RAID-5 **write hole** — the condition where a crash between writing data and its recomputed parity leaves the stripe silently inconsistent — by using **variable-width stripes**.[^oracle2021a] Because ZFS controls both the filesystem and the block layout, it sizes each stripe to the block actually being written. Every RAID-Z write is a full-stripe write, so data and parity are always written together and are always consistent with each other.

The space efficiency of a RAID-Z group varies with block size and group width rather than following the simple `(N-P)/N` rule of fixed-stripe RAID. Very small blocks (e.g., metadata) are written with a single data sector plus parity, approaching mirror cost; large blocks approach the theoretical maximum. For IOPS-sensitive workloads, many narrow groups or mirror vdevs outperform a single wide RAID-Z group because each RAID-Z I/O touches every disk in the group.

## Caching: ARC and L2ARC

The **Adaptive Replacement Cache (ARC)** is ZFS's in-memory read cache. It maintains four lists — Most Recently Used (MRU), Most Frequently Used (MFU), and ghost (eviction-history) lists for each — with a balance target `arc_p` that self-tunes based on hit patterns. A scan-resistant property emerges naturally: a one-pass linear read fills only the MRU side and cannot evict genuinely hot MFU blocks.[^megiddo2003] The ARC dynamically yields memory to the kernel under pressure via a shrinker callback.

The **L2ARC** is a second-level read cache on a fast block device (typically NVMe SSD), added as a `cache` vdev. A background feed thread writes about-to-be-evicted ARC blocks to L2ARC. Losing the L2ARC device has no effect on data integrity. Each L2ARC entry requires approximately 70 bytes of ARC header memory, so the return on investment is best when the working set substantially exceeds available RAM. Since OpenZFS 2.0, L2ARC contents persist across reboots via `l2arc_rebuild_enabled`.[^truenas2025a]

## ZIL and SLOG

The **ZFS Intent Log (ZIL)** satisfies POSIX synchronous-write semantics (`fsync()`, `O_SYNC`, NFS COMMIT) without forcing the entire current TXG to flush. On a synchronous write, ZFS logs an intent record to stable storage and immediately acknowledges the write; the data is committed to the main pool on the next TXG sync. If the system crashes before that sync, ZFS replays the ZIL on import to recover acknowledged-but-uncommitted writes.[^jrs2019] In normal operation the ZIL is never read.

By default the ZIL lives on the main pool devices, meaning synchronous writes are written twice. A **Separate Intent Log (SLOG)** moves the ZIL to a dedicated low-latency, power-loss-protected device (`log` vdev), reducing synchronous write latency for database and NFS workloads. Asynchronous writes bypass the ZIL entirely and gain nothing from a SLOG.[^truenas2025b]

## Datasets, Snapshots, and Clones

A **dataset** is any named DMU object set in the DSL hierarchy: a filesystem, zvol, snapshot, clone, or bookmark. Datasets share pool free space — there is no static partitioning — and properties (compression, recordsize, quota, encryption, etc.) are inherited from parent datasets unless overridden.[^openZFS2024e]

**Snapshots** are read-only, point-in-time references to a dataset's state. Creation is nearly instantaneous because no data is copied — ZFS preserves the current object-set root and increments block reference counts.[^illumos2024] A snapshot accumulates space cost only as blocks it references are overwritten by the live dataset. **Clones** are writable datasets forked from a snapshot; they initially share all blocks with their origin and diverge lazily as writes occur.[^oracle2021c] The `zfs promote` command can invert the parent-child relationship between a clone and its origin, making the clone the primary dataset.

**Bookmarks** record the same TXG reference as a snapshot but hold no data and consume negligible space. They serve as durable incremental-send anchors after the source snapshot has been pruned.

## Send and Receive

`zfs send` serializes a snapshot into a stream of DMU Replay Records (DRRs) describing object writes, frees, and metadata; `zfs receive` applies the stream to reconstruct the dataset on another pool. The stream is block-level: it preserves checksums, sparseness, ACLs, and properties exactly. **Incremental sends** (`-i`) transmit only blocks changed between two snapshots, enabling efficient replication.[^oracle2021e] The `-R` flag produces a replication stream of an entire dataset hierarchy including clones and child datasets.

Useful send flags include `-c` (send pre-compressed blocks without redecompressing), `-w` (send encrypted data without decrypting, preserving the IV set), and `-s` (write a resume token so interrupted transfers can continue). Bookmarks can be the source side of an incremental send, enabling source-side snapshot pruning while preserving the incremental chain.[^openZFS2024f]

## Scrubbing

`zpool scrub` performs a full background read of every allocated block, verifying each against its parent-pointer checksum. On a redundant pool, detected corruption is repaired automatically from an alternate copy, exactly as during a self-healing read.[^klara2025b] Scrub traverses the entire Merkle tree — metadata, indirect blocks, parity, and snapshot references — not just user data. Modern OpenZFS uses sequential scrub, sorting work into large physically-contiguous ranges to improve throughput on spinning disks.[^openZFS2024g]

Scrub differs from **resilver** in scope: resilver reads only the blocks needed to reconstruct a replaced disk, while scrub reads everything. Only one scan can run at a time; a new scrub defers until any in-progress resilver completes.

## Compression

ZFS performs inline, transparent, per-block compression in the ZIO pipeline before checksumming and before writing. Each block is compressed independently; decompression happens on the way out of ZIO and is invisible to applications. The `compression` property selects the algorithm:[^openZFS2024e]

- **lz4** — the recommended default; fast, decent ratio, with an early-abort heuristic that skips compression if the first 8 KiB of a block does not compress by at least 12.5%.
- **zstd / zstd-N** — Zstandard at levels 1–19; significantly better ratios than gzip at comparable speeds, introduced in OpenZFS 2.0.[^jude2021]
- **gzip / gzip-N** — high ratio, high CPU cost.
- **zle** — zero-length encoding; compresses only runs of zeros.

Because compression is applied before checksum computation, the stored checksum reflects the compressed form. Enabling `lz4` on nearly all datasets is standard practice — its early-abort makes it free on incompressible data.

## Deduplication

With `dedup=on`, ZFS performs synchronous, in-band, block-level deduplication: every write hashes the new block (default SHA-256) and consults the **deduplication table (DDT)**. If the block already exists, ZFS increments a reference count rather than writing a duplicate.[^oracle2021d] The DDT is a DMU ZAP object; each entry consumes roughly 320 bytes in memory and ~507 bytes on disk in the traditional implementation.

Because dedup is synchronous, the DDT must reside in memory for acceptable performance — a DDT that spills to disk causes each dedup-eligible write to incur extra random reads. The conventional sizing estimate is approximately 1 GiB of ARC per 1 TiB of unique data, on top of normal ARC use. The DDT can be directed to a `dedup` or `special` allocation-class vdev to keep its random I/O on SSD rather than spinning disks.

OpenZFS 2.3 introduced **Fast Dedup**, redesigning DDT storage with a write-ahead log, prefetch, and pruning so entries are written in batched, sorted order rather than as scattered random writes, reducing both write amplification and the live-entry memory footprint.[^despair2024]

Compression should be evaluated before dedup: it is far cheaper and benefits a wider range of data. Running `zdb -S <pool>` estimates the dedup ratio before enabling it; a ratio below roughly 2× rarely justifies the cost.

## Special Vdevs and Allocation Classes

ZFS allocates blocks from one of several **metaslab classes**: normal, log, special, and dedup. A **special vdev** (typically mirrored NVMe SSDs) dedicates a fast tier to specific block types.[^openZFS2025d] By default, all filesystem and pool metadata — dnodes, indirect blocks, space maps — is routed to the special class. The `special_small_blocks` dataset property extends this to small data blocks below a configurable size threshold.

If the special class fills, allocations spill to the normal class. Losing the special vdev loses the pool, so its redundancy must match the rest of the pool. A separate `dedup` vdev class directs DDT storage specifically; a `log` vdev (SLOG) directs ZIL records.

[^ahrens2012]: Ahrens, M. (2012, December 13). *ZFS fundamentals: Transaction groups*. https://ahl.dtrace.org/2012/12/13/zfs-fundamentals-transaction-groups/
[^behlendorf2020]: Behlendorf, B., Lin, I., & Khan, M. (2020). *Distributed spare (dRAID) feature* [Pull request #10102]. openzfs/zfs. https://github.com/openzfs/zfs/pull/10102
[^bonwick2007]: Bonwick, J., & Moore, B. (2007). *ZFS: The last word in file systems* [Conference presentation]. Sun Microsystems. https://www.racf.bnl.gov/Facility/TechnologyMeeting/Archive/Apr-09-2007/zfs.pdf
[^despair2024]: Despair Labs. (2024, October 27). *OpenZFS deduplication is good now and you shouldn't use it*. https://despairlabs.com/blog/posts/2024-10-27-openzfs-dedup-is-good-dont-use-it/
[^dilger2010]: Dilger, A. (2010). *ZFS features and concepts TOI* [Conference presentation]. Lustre Wiki. https://wiki.lustre.org/images/4/49/Beijing-2010.2-ZFS_overview_3.1_Dilger.pdf
[^illumos2024]: Illumos Project. (2024). *Working with ZFS snapshots and clones*. ZFS Administration Guide. https://www.illumos.org/books/zfs-admin/snapshots.html
[^jrs2019]: JRS Systems. (2019, May 2). *ZFS sync/async + ZIL/SLOG, explained*. https://jrs-s.net/2019/05/02/zfs-sync-async-zil-slog/
[^jude2021]: Jude, A., & Behlendorf, B. (2021). *Zstandard compression in OpenZFS*. FreeBSD Foundation. https://freebsdfoundation.org/wp-content/uploads/2021/05/Zstandard-Compression-in-OpenZFS.pdf
[^klara2025b]: Klara Systems. (2025). *Understanding ZFS scrubs and data integrity*. https://klarasystems.com/articles/understanding-zfs-scrubs-and-data-integrity/
[^megiddo2003]: Megiddo, N., & Modha, D. S. (2003). ARC: A self-tuning, low overhead replacement cache. *Proceedings of the 2nd USENIX Conference on File and Storage Technologies (FAST '03)*. https://www.usenix.org/conference/fast-03/arc-self-tuning-low-overhead-replacement-cache
[^openZFS2024a]: OpenZFS Project. (2024). *ZIO pipeline implementation* [Source: include/sys/zio_impl.h]. https://github.com/openzfs/zfs/blob/master/include/sys/zio_impl.h
[^openZFS2024e]: OpenZFS Project. (2024). *zfsprops.7 manual page*. https://openzfs.github.io/openzfs-docs/man/master/7/zfsprops.7.html
[^openZFS2024f]: OpenZFS Project. (2024). *zfs-recv.8 manual page*. https://openzfs.github.io/openzfs-docs/man/master/8/zfs-recv.8.html
[^openZFS2024g]: OpenZFS Project. (2024). *zpool-scrub.8 manual page*. https://openzfs.github.io/openzfs-docs/man/master/8/zpool-scrub.8.html
[^openZFS2025a]: OpenZFS Project. (2025). *OpenZFS architecture overview*. DeepWiki. https://deepwiki.com/openzfs/zfs
[^openZFS2025c]: OpenZFS Project. (2025). *System administration*. OpenZFS Wiki. https://openzfs.org/wiki/System_Administration
[^openZFS2025d]: OpenZFS Project. (2025). *zpoolconcepts.7 manual page*. https://openzfs.github.io/openzfs-docs/man/master/7/zpoolconcepts.7.html
[^oracle2021a]: Oracle. (2021). *RAID-Z storage pool configuration*. Oracle Solaris ZFS Administration Guide. https://docs.oracle.com/cd/E19253-01/819-5461/gamtu/index.html
[^oracle2021c]: Oracle. (2021). *Overview of ZFS clones*. Oracle Solaris ZFS Administration Guide. https://docs.oracle.com/cd/E19253-01/819-5461/gbcxz/index.html
[^oracle2021d]: Oracle. (2021). *ZFS data deduplication requirements*. Transitioning from Oracle Solaris 10 to Oracle Solaris 11.2. https://docs.oracle.com/cd/E36784_01/html/E39134/fsdedup-1.html
[^oracle2021e]: Oracle. (2021). *Sending and receiving ZFS data*. Oracle Solaris ZFS Administration Guide. https://docs.oracle.com/cd/E19253-01/819-5461/gbchx/index.html
[^rossmann2025]: Rossmann Group. (2025). *How ZFS differs from hardware RAID*. https://rossmanngroup.com/technical-reference/zfs-vs-hardware-raid
[^truenas2025a]: TrueNAS. (2025). *L2ARC*. TrueNAS Documentation Hub. https://www.truenas.com/docs/references/l2arc/
[^truenas2025b]: TrueNAS. (2025). *SLOG devices*. TrueNAS Documentation Hub. https://www.truenas.com/docs/references/slog/
