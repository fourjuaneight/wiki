---
title: "Backups"
date: 2026-05-05
draft: false
tags:
  - disaster-recovery
  - security
  - storage
---

A **backup** is an independent copy of data stored separately from the primary system, created for restoration following data loss, corruption, or system failure. The goal is not duplication — it is recoverability under adverse conditions. A backup that cannot be restored is not a backup.[^swanson2010]

## Recovery objectives

Two questions determine everything else about a backup strategy:

**How much data can you lose?** This is the Recovery Point Objective (RPO) — the maximum acceptable gap between your last backup and the failure event. RPO directly sets backup frequency: a 15-minute RPO demands backups at least every 15 minutes.[^swanson2010]

**How long can you be down?** This is the Recovery Time Objective (RTO) — the maximum acceptable outage duration. RTO determines what recovery infrastructure you need. Restoring from tape might take days; a hot standby fails over in seconds.[^swanson2010]

| Tier | RTO | Example |
|------|-----|---------|
| Gold | 15 min – 1 hour | Customer-facing transactional systems |
| Silver | 1 – 4 hours | Internal business applications |
| Bronze | 4 – 24 hours | Non-critical or archival systems |

Tighter objectives cost exponentially more.[^google2024][^unitrends2024]

## Backup types

### Full

Copies the entire dataset. Slowest to create, fastest to restore — no other artifacts needed. Typically run weekly or less frequently as a baseline for other types.[^nakivo2024]

### Incremental

Captures only changes since the *most recent backup of any type*. Smallest files, fastest backup window. The tradeoff: restore requires the full backup plus every incremental in sequence — one corrupted link breaks the chain.[^nakivo2024][^techtarget2024]

Change tracking granularity matters:

- **File-level** — any modified file is copied whole. Simple but wasteful for large files with small changes.
- **Block-level** — only changed storage blocks are captured. Changed Block Tracking (CBT) in hypervisors makes this efficient.
- **Byte-level** — captures individual changed bytes. Minimal size, highest CPU cost.

### Differential

Captures all changes since the *last full backup*. Each differential is cumulative and grows over time, but restore only needs two pieces: the full plus the latest differential. A middle ground between full and incremental.[^nakivo2024]

### Modern variants

All three solve the same problem — eliminating recurring full backup windows:

- **Synthetic full** — the backup server merges incrementals into a new full backup without touching the source system.
- **Reverse incremental** — injects changes into the existing full image, keeping latest state always restore-ready as a complete image.
- **Forever-incremental** — one initial full, then only incrementals forever, relying on synthetic merges for restore points.[^nakivo2024]

### Continuous Data Protection (CDP)

Instead of scheduled backups, CDP intercepts every write at the block level and journals it in real time. Recovery can target any arbitrary point in time, not just the last backup window. Achieves RPO measured in seconds. "Near-CDP" products capture at short intervals (minutes) as a cost compromise.[^techtarget2024]

## The 3-2-1 rule

The minimum viable backup strategy:[^veeam2024a][^backblaze2024]

- **3** copies of data (production + two backups)
- **2** different device types or failure domains
- **1** copy offsite (geographically separate)

"Two different media" originally meant disk and tape. Today it means two independent failure domains — local NAS plus cloud object storage, or two different cloud providers.[^backblaze2024]

### 3-2-1-1-0

The modern extension for ransomware resilience:[^veeam2024a]

- **1** copy that is immutable or air-gapped
- **0** errors after automated recovery verification

## Immutable backups

Immutability enforces Write-Once, Read-Many (WORM): backup data cannot be modified, deleted, or encrypted for a defined retention period — even by administrators with root access.[^veeam2024b]

Implementation options:

- **Object Lock (S3/Azure Blob)** — immutability at the storage API level. No API call can delete or overwrite locked objects during the retention window, including from the account root user.
- **Hardened Linux repository** — XFS filesystem with extended file attributes preventing deletion. No SSH daemon; accepts connections only from the backup server on a dedicated port.
- **Appliance-based WORM** — purpose-built appliances (HPE StoreOnce, ExaGrid, Pure FlashBlade) with firmware-level retention locks requiring dual authorization to modify.
- **WORM tape** — LTO hardware physically prevents overwrite of data on WORM-designated cartridges.

Ransomware operators specifically target backup infrastructure. If backups are writable from the production network, a compromised admin account can destroy them before deploying the payload. Immutability decouples backup integrity from credential compromise.[^veeam2024b][^mcbride2020]

## Air-gapped copies

An air gap isolates backup copies from production systems so that no network-based attack can reach them:[^chandramouli2020]

**Physical air gap** — media (tape, removable disk) disconnected from all networks after write completes. Inaccessible to any network-attached attacker by definition.

**Logical air gap** — storage exists on a network but is unreachable from production through architectural controls: separate authentication domains, data diodes (unidirectional connections), or systems that connect only during backup windows and disconnect afterward.

For cyber-attack recovery, NIST SP 800-209 recommends copies that:[^chandramouli2020]

- Reside on physically separated infrastructure or separate cloud accounts
- Are managed from systems separated from production
- Use full baseline copies (not incrementals alone, which depend on a potentially compromised baseline)
- Are never mounted or mapped to a host — restored by push to an isolated staging environment
- Use immutable storage with retention locking

## Storage efficiency

**Deduplication** stores each unique data block once and replaces duplicates with references:[^acronis2024]

1. Data is divided into variable-length chunks (preferred over fixed-length to handle boundary shifts from insertions).
2. Each chunk is fingerprinted with a cryptographic hash (SHA-256).
3. New chunks matching an existing hash store only a pointer; unique chunks are written and indexed.

This can happen *source-side* (before network transit — saves bandwidth) or *target-side* (after arrival — saves storage). Hashes compare pre-compression data, so different compression levels don't defeat dedup.[^acronis2024]

**Compression** (LZ4/zstd/gzip) reduces the size of each unique block after deduplication. The two are complementary.

## Testing

An untested backup is an assumption. Verification must cover:[^veeam2024a][^chandramouli2020]

- **Integrity** — data passes checksum verification, not corrupted.
- **Completeness** — includes all dependencies: databases, certificates, encryption keys, configs, ACLs, DNS records, build environments.
- **Bootability** — system images produce a functional running system.
- **RTO compliance** — restore finishes within required time under realistic conditions.
- **Application consistency** — databases start with transactionally consistent data.

Automated verification ("recovery assurance") spins up backed-up VMs in an isolated sandbox, runs health checks, and reports pass/fail without human intervention.[^veeam2024a]

Minimum testing cadence:

| Data tier | Frequency | Scope |
|-----------|-----------|-------|
| Critical | Monthly | End-to-end restore to sandbox |
| Sensitive | Quarterly | Full audit: completeness, dependencies, RTO |
| Standard | Annually | Integrity verification and restore sampling |

Also test after any significant infrastructure change.[^chandramouli2020]

## Recommendations summary

1. **Define RPO/RTO first.** Everything else follows from how much loss and downtime you can accept.
2. **Follow 3-2-1-1-0 minimum.** Three copies, two device types, one offsite, one immutable, zero unverified restores.
3. **Make at least one copy immutable.** Object Lock, hardened repo, or WORM tape — pick what fits your stack.
4. **Air-gap your cyber-recovery copy.** Physically or logically isolated from production credentials and networks.
5. **Use incremental + synthetic full.** Balances backup speed with restore reliability without recurring full backup windows.
6. **Enable deduplication and compression.** Dramatically reduces storage cost with no downside for most workloads.
7. **Automate restore testing.** Schedule it. If you haven't tested a restore, you don't have a backup.
8. **Separate backup credentials from production.** Compromising AD should not grant access to backup storage.
9. **Encrypt everything.** At rest and in transit. Store keys separately from backup media.
10. **Document and review annually.** Backup plans rot as infrastructure changes.

[^acronis2024]: Acronis. (2024). [*What is data deduplication?*](https://www.acronis.com/en-us/blog/posts/deduplication/). Acronis Blog.
[^backblaze2024]: Backblaze. (2024). [*The 3-2-1 backup strategy*](https://www.backblaze.com/blog/the-3-2-1-backup-strategy/). Backblaze Blog.
[^chandramouli2020]: Chandramouli, R., & Pinhas, D. (2020). [*Security guidelines for storage infrastructure*](https://doi.org/10.6028/NIST.SP.800-209) (NIST SP 800-209). National Institute of Standards and Technology.
[^google2024]: Google Cloud. (2024). [*Disaster recovery planning guide*](https://cloud.google.com/architecture/dr-scenarios-planning-guide). Google Cloud Architecture Center.
[^mcbride2020]: McBride, T., Ekstrom, M., Lusty, L., Sexton, J., & Townsend, A. (2020). [*Data integrity: Recovering from ransomware and other destructive events*](https://csrc.nist.gov/pubs/sp/1800/11/final) (NIST SP 1800-11). National Institute of Standards and Technology.
[^nakivo2024]: NAKIVO. (2024). [*Backup types explained: Full, incremental, differential, synthetic, and reverse incremental*](https://www.nakivo.com/blog/backup-types-explained/). NAKIVO Blog.
[^swanson2010]: Swanson, M., Bowen, P., Phillips, A., Gallup, D., & Lynes, D. (2010). [*Contingency planning guide for federal information systems*](https://doi.org/10.6028/NIST.SP.800-34r1) (NIST SP 800-34 Rev. 1). National Institute of Standards and Technology.
[^techtarget2024]: TechTarget. (2024). [*Incremental backup*](https://www.techtarget.com/searchdatabackup/definition/incremental-backup). SearchDataBackup.
[^unitrends2024]: Unitrends. (2024). [*RPO and RTO: Understanding the difference*](https://www.unitrends.com/blog/rpo-rto). Unitrends Blog.
[^veeam2024a]: Veeam. (2024). [*The 3-2-1 backup rule: Building a reliable data protection strategy*](https://www.veeam.com/blog/321-backup-rule.html). Veeam Blog.
[^veeam2024b]: Veeam. (2024). [*Immutable backup: What it is and why you need it*](https://www.veeam.com/blog/immutable-backup.html). Veeam Blog.
 