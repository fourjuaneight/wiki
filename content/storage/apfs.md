---
title: "APFS"
date: 2026-05-05
draft: false
tags:
  - apple
  - filesystems
  - storage
---

**APFS** (Apple File System) is a proprietary filesystem built on copy-on-write semantics, a container-based space-sharing model, and native encryption. It serves as the default filesystem across all Apple platforms — macOS, iOS, iPadOS, tvOS, watchOS, and visionOS. APFS replaces journaling with a checkpoint mechanism that provides crash protection without the write-twice penalty, and its space-sharing container architecture eliminates the need to pre-partition storage across volumes.[^apple2020]

## Architecture

APFS is organized into two distinct layers:[^apple2020]

- **Container layer** (types prefixed `nx_`) — manages space allocation, checkpoint state, volume metadata, encryption keybags, and the container object map. Container objects are padded for 64-bit alignment.
- **File-system layer** (types prefixed `j_`) — stores directory structures, file metadata, extended attributes, and file content. Objects at this layer are byte-packed to minimize space.

A single APFS partition holds exactly one container. That container can hold up to **100 volumes** (`NX_MAX_FILE_SYSTEMS = 100`), all sharing the container's free space pool.[^apple2020] The practical maximum is `ceil(container_size / 512 MiB)`.

All on-disk values are stored in **little-endian** byte order.

## Container and Space Sharing

The container provides a shared pool of free space for all its volumes. APFS allocates disk space on demand — no pre-allocation per volume.[^apple2020][^apple2018]

This means configurations that would require multiple partitions under other filesystems can share a single partition. Two bootable macOS volumes plus a data volume, for example, all draw from the same free space without deciding ahead of time how to divide capacity between them.[^apple2018]

Per-volume controls exist:

- `apfs_fs_reserve_block_count` — minimum space guaranteed for a volume
- `apfs_fs_quota_block_count` — maximum space a volume can consume

The **Space Manager** (`spaceman_phys_t`) is the sole per-container allocator. It tracks available blocks via free queues, chunk info blocks (with per-chunk bitmaps), and allocation zones.[^apple2020]

## Copy-on-Write

APFS never modifies objects in place on disk. Every modification writes a new copy to a different location:[^apple2020]

- **Physical objects** — stored at a known block address (the OID *is* the block address). A modified copy gets a new OID.
- **Virtual objects** — stored at a block address resolved through an **object map** B-tree. Both original and copy share the same OID; a monotonically increasing **transaction identifier** (XID) disambiguates versions.
- **Ephemeral objects** — reside in memory while mounted. Modified in-place in RAM but always written to disk as part of a new checkpoint.

This redirect-on-write model delivers crash protection without the write-twice overhead of traditional journaling.

## B-Trees

All structural data is stored as key/value pairs in B-trees. Default node size is one block (4096 bytes). Each container and each volume maintains its own object map B-tree, plus specialized trees for different purposes:[^apple2020]

| Tree | Purpose |
|------|---------|
| Container Object Map | Maps virtual OIDs to physical addresses (keyed by OID + XID) |
| Volume Object Map | Per-volume virtual-to-physical mapping |
| File-System Tree | All file-system records (inodes, extents, directory entries, xattrs) |
| Extent Reference Tree | Tracks physical extents and their reference counts (for clones/snapshots) |
| Snapshot Metadata Tree | Snapshot information |
| Space Manager Free Queue | Recently freed blocks |
| Fusion Middle Tree | SSD cache tracking for Fusion drives |

Key comparison order for file-system records: object ID, then object type, then type-specific fields (e.g., filename for directory entries).

Notable B-tree flags include `BTREE_SEQUENTIAL_INSERT` (adds new nodes rather than splitting during sequential writes), `BTREE_ALLOW_GHOSTS` (keys without values, used in the free queue), and `BTREE_HASHED` (nonleaf nodes store child hashes, forming a Merkle-tree structure for sealed volumes).[^apple2020]

## Object Identifiers and Mapping

Every on-disk object begins with a 32-byte header (`obj_phys_t`):[^apple2020]

| Field | Size | Purpose |
|-------|------|---------|
| `o_cksum` | 8 bytes | Fletcher-64 checksum |
| `o_oid` | 8 bytes | Object identifier |
| `o_xid` | 8 bytes | Transaction identifier |
| `o_type` | 4 bytes | Type (low 16 bits) + storage flags (high 16 bits) |
| `o_subtype` | 4 bytes | Subtype |

Storage type flags in `o_type`:
- `0x00000000` — Virtual (look up in object map)
- `0x40000000` — Physical (OID = block address)
- `0x80000000` — Ephemeral (in memory; persisted in checkpoints)

**Object map lookup**: to find virtual object X at transaction T, search the object map B-tree for the entry where OID = X and XID is the largest value ≤ T, then read the physical address from the value.[^apple2020]

Transaction identifiers are 64-bit, monotonically increasing, and never reused. At one million transactions per second, exhaustion would take over 5,000 centuries.

## Crash Protection

APFS achieves crash consistency through copy-on-write plus a **checkpoint mechanism** — no journal exists:[^apple2020][^apple2018]

**Checkpoint areas** (both are ring buffers):
- **Checkpoint Descriptor Area** — stores `checkpoint_map_phys_t` and `nx_superblock_t` instances
- **Checkpoint Data Area** — stores ephemeral objects (the in-memory state persisted to disk)

**Commit sequence**:
1. In-memory ephemeral objects are written to the checkpoint data area
2. Checkpoint mapping blocks are written to the descriptor area
3. The container superblock is written as the final atomic commit point

If a write is interrupted at any stage, that checkpoint is invalid and is ignored on next mount. Recovery finds the container superblock with the largest XID that has a valid magic number and checksum — that superblock plus its mapping blocks constitute the latest valid state.[^apple2020]

Additional recovery mechanisms:
- `INODE_BEING_TRUNCATED` flag — detected on mount, truncation completes automatically
- `INO_EXT_TYPE_PREV_FSIZE` — stores previous file size for rollback
- **Reaper** (`nx_reaper_phys_t`) — manages deletion of large objects across multiple transactions

## Encryption

APFS provides encryption at three granularities per volume:[^apple2020][^apple2018]

1. **No encryption**
2. **Single-key** (per-volume, `APFS_FS_ONEKEY` flag) — one Volume Encryption Key (VEK) encrypts all data
3. **Multi-key** (per-file) — each file gets a separate key for data; a distinct key encrypts sensitive metadata

Algorithm: **AES-XTS** (or AES-CBC on older hardware), with 128-byte cipher blocks.[^apple2020]

### Key Hierarchy

```
User password / Recovery key / Institutional key
        ↓ (unwraps)
    KEK (Key Encryption Key)
        ↓ (unwraps)
    VEK (Volume Encryption Key)
        ↓ (decrypts)
    File-system tree + file data
```

### Keybag Architecture

- **Container keybag** (`kb_locker_t`) — stores each volume's wrapped VEK and the location of its volume keybag. Encrypted using the container UUID via RFC 3394.
- **Volume keybag** — stores KEK copies wrapped with different credentials (password, personal recovery key, institutional recovery key, iCloud recovery key). Encrypted using volume UUID via RFC 3394.[^apple2020]

Changing or deleting a container/volume UUID **instantly destroys** access to all encrypted content (crypto-erase), because the keybag can no longer be decrypted.

### Protection Classes (iOS Data Protection)

| Class | Protection Level |
|-------|-----------------|
| A | Complete protection — keys discarded on lock |
| B | Protected unless open — keys available while file handle exists |
| C | Protected until first user authentication |
| D | No protection |
| F | No protection, non-persistent key (swap files) |

### Encryption Rolling

APFS supports in-place encryption key changes tracked via `er_state_phys_t`, enabling encryption, decryption, or key rotation of live volumes with crash recovery for interrupted operations.[^apple2020]

## Snapshots

Snapshots provide stable, read-only copies of a volume at a point in time:[^apple2020][^apple2018]

- **Fast to create** — copy-on-write means old versions persist on disk naturally; taking a snapshot records the current XID
- **Space-efficient** — a snapshot consumes additional space only as blocks it references are overwritten by the live volume
- Maximum count: `UINT32_MAX` per volume

Each object map maintains a snapshot tree (`om_snapshot_tree_oid`) keyed by XID. Looking up objects at a snapshot's XID returns the volume state at that moment.

Physical extent kinds distinguish snapshot participation:
- `APFS_KIND_NEW` — data not part of any snapshot
- `APFS_KIND_UPDATE` — data that modifies blocks belonging to an existing snapshot

Dataless snapshots (`APFS_INCOMPAT_DATALESS_SNAPS`) exist as lightweight metadata-only references.

## Clones

Cloning creates an instant copy of a file or directory without duplicating data on disk:[^apple2018]

- Invoked via `clonefile()` system call (or `cp -c` on command line)
- The Finder uses cloning automatically for same-volume copies
- Cloned files share physical extents; divergence happens lazily as either copy is modified
- The **Extent Reference Tree** tracks reference counts (`refcnt`) for shared extents
- Only modified extents are written to new locations (delta storage)

Inode flags track clone state:
- `INODE_WAS_CLONED` — this inode was created by cloning
- `INODE_WAS_EVER_CLONED` — this inode has been cloned at least once; blocks may be shared and reference counts must be checked before deallocation

APFS does not perform data deduplication — encrypted extents prevent content examination. Cloning is the mechanism for avoiding data duplication.[^apple2020]

## Data Integrity

### Metadata Checksums

Every object header begins with an 8-byte **Fletcher-64** checksum (`o_cksum`), covering all metadata operations.[^apple2020]

### Limitations

APFS does **not** checksum user data. It relies on hardware error-correcting codes (ECC) present on Flash/SSD and HDD controllers for data integrity. Apple states that metadata redundancy is "ineffective due to Flash translation layers."[^apple2018]

### Sealed Volumes (macOS 11+)

The system volume uses a cryptographically verified, immutable seal:[^apple2020]

- Volume role must be `APFS_VOL_ROLE_SYSTEM`
- The volume's B-tree uses `BTREE_HASHED` — conceptually a **Merkle tree** where nonleaf nodes store the OID and hash of each child node
- `integrity_meta_phys_t` stores the hash algorithm and root hash
- Supported hash algorithms: SHA-256, SHA-512/256, SHA-384, SHA-512
- If the seal is broken, `APFS_SEAL_BROKEN` flag is set with the breaking transaction ID

## Volume Management

### Volume Roles

| Role | Purpose |
|------|---------|
| `SYSTEM` | macOS system volume (sealed) |
| `DATA` | User data |
| `RECOVERY` | Recovery environment |
| `VM` | Virtual memory / swap |
| `PREBOOT` | Preboot environment |
| `BACKUP` | Time Machine |
| `UPDATE` | Software updates |
| `INSTALLER` | Installer |
| `PRELOGIN` | Pre-login |

macOS Catalina+ requires at minimum five volumes: System (read-only, sealed), Data, Preboot, Recovery, and VM.[^apple2020]

### Volume Groups

Volumes can belong to a **volume group** (`apfs_volume_group_id`). macOS uses this to pair the System and Data volumes into a single logical unit.[^apple2020]

### Format Variants

- **APFS** — standard
- **APFS (Encrypted)** — volume-level encryption
- **APFS (Case-sensitive)** — case-sensitive filenames
- **APFS (Case-sensitive, Encrypted)** — both

## Additional Features

### 64-bit Capacity

- 2^63 allocation blocks (vs. HFS+ 2^32)
- 64-bit file identifiers
- Maximum file size: 8 exabytes
- Supports over 9 quintillion files per volume[^apple2020]

### Nanosecond Timestamps

All timestamps have **1-nanosecond granularity** (vs. HFS+ 1-second).[^apple2018]

### Sparse Files

Natively supported. Tracked via `INODE_IS_SPARSE` flag with a dedicated sparse byte count recording how much logical space has no physical backing.[^apple2020]

### Fast Directory Sizing

Precomputes directory sizes as content is added or removed, enabling rapid computation of total space used by directory hierarchies. Cannot be enabled on directories with existing content — best suited for directories with many files and low churn.[^apple2018]

### Atomic Safe-Save

A filesystem primitive for bundles and directories that performs renames as single transactions. Operations either complete fully or do not occur — no partial states. Document IDs (`INO_EXT_TYPE_DOCUMENT_ID`) track documents across atomic save operations where one file replaces another; the document ID stays with the path, not the inode.[^apple2018][^apple2020]

### TRIM Support

TRIM operations are issued **asynchronously**, executed only after metadata changes have persisted to stable storage.[^apple2018]

### Fusion Drive Support

APFS natively supports Apple's Fusion drives (SSD + HDD combination):[^apple2020]

- **Fusion write-back cache** (`fusion_wbc_phys_t`) — data written to SSD first, then migrated to HDD
- **Fusion middle tree** — tracks data placement between tiers
- `FUSION_TIER2_DEVICE_BYTE_ADDR` distinguishes HDD-tier blocks
- Files can be pinned to main (SSD) or tier-2 (HDD) via inode flags

### Unicode and Filenames

- Filenames stored as **UTF-8** (vs. HFS+ UTF-16)
- Unicode 9.0 compliance
- Hash-based native normalization scheme; normalization-insensitive by default on macOS
- `readdir(2)` returns filenames in **hash order**, not lexicographical order
- Prevents unassigned Unicode 9.0 codepoints in filenames
- Case-insensitive mode uses a 22-bit CRC-32C hash in directory entry keys for fast lookups[^apple2020]

### Network Protocol Support

Supports SMB and NFS. AFP is deprecated and not supported by APFS.[^apple2018]

## APFS vs. ZFS

Both filesystems use copy-on-write, but their design goals differ substantially:

| Aspect | APFS | ZFS |
|--------|------|-----|
| Data checksums | No (relies on hardware ECC) | Yes (per-block, stored in parent pointer) |
| Self-healing | No | Yes (from redundant copies) |
| Redundancy | None built-in (no RAID) | Mirror, RAID-Z1/2/3, dRAID |
| Encryption | Native per-file and per-volume | Native per-dataset |
| Space sharing | Container model (up to 100 volumes) | Pool model (unlimited datasets) |
| Deduplication | No (uses clones instead) | Yes (DDT-based, block-level) |
| Compression | No | Yes (lz4, zstd, gzip, zle) |
| Crash protection | Checkpoints (ring buffer) | Uberblock + TXG (rotating label slots) |
| Send/receive | No | Yes (incremental replication streams) |
| Target hardware | Flash/SSD (works on HDD) | Agnostic (HDD, SSD, NVMe) |
| Scrubbing | No | Yes (background Merkle-tree verification) |

APFS is optimized for Apple's vertical integration — Flash storage, hardware encryption engines, and single-user devices. ZFS is designed for multi-disk server environments where data integrity across unreliable hardware is the primary concern.

[^apple2018]: Apple Inc. (2018). [*Apple File System Guide*](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/APFS_Guide/Introduction/Introduction.html). Apple Developer Documentation Archive.
[^apple2020]: Apple Inc. (2020, June 22). [*Apple File System Reference*](https://developer.apple.com/support/downloads/Apple-File-System-Reference.pdf).
 