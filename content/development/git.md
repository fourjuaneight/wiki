---
title: "Git"
date: 2026-03-31
draft: false
tags:
- version-control
---

**Git** is a distributed version control system designed to track changes in source code and coordinate work among multiple contributors. Unlike centralized systems such as Subversion, every Git clone is a self-contained repository holding the project’s complete history, which means nearly every operation — browsing logs, computing diffs, creating branches — executes locally without a network round-trip.[^chacon2014] Git was designed around five explicit goals: speed, a simple internal design, strong support for non-linear development, a fully distributed architecture, and the ability to handle very large projects without performance degradation.[^chacon2014]

At its core, Git is a **content-addressable filesystem** with a version control interface layered on top.[^chacon2014] Rather than recording changes as file-level deltas, Git takes a complete snapshot of all tracked files at each commit and stores a reference to that snapshot — if a file is unchanged, the snapshot simply links to the previously stored copy. This snapshot model makes branching and history traversal significantly faster than delta-based systems, and it enables the cryptographic integrity guarantee that underpins Git’s reliability: every object is identified by a SHA-1 hash of its own content, making silent corruption or tampering detectable.[^chacon2014]

## Design philosophy

The snapshot-versus-delta distinction is the most consequential of Git’s design decisions. Systems such as CVS and Subversion store a base version of each file alongside a sequence of differences; reconstructing any version requires replaying the chain. Git instead stores complete snapshots, which means checking out a commit, computing a diff between two branches, or running `git log` are all single-pass lookups against a local database rather than incremental reconstructions.[^chacon2014] Benchmarks have shown Git to be an order of magnitude faster than comparable distributed systems for large-repository operations, with local history retrieval running up to 100 times faster than equivalent network round-trips.[^wiki2026]

The integrity model follows directly from the storage model. Before writing any object, Git computes a 40-character hexadecimal SHA-1 hash over the object type, a size header, and the raw content. This hash becomes the object’s only identifier — the path under `.git/objects/` is derived from it, and all references between objects (trees pointing to blobs, commits pointing to trees) are hash pointers. The resulting structure is a Merkle tree: a commit’s hash encodes the entire history that produced it, so any retroactive modification to any ancestor would propagate a change that Git would immediately detect.[^chacon2014]

> “It is impossible to change the contents of any file or directory without Git knowing about it.”
> — Chacon & Straub (2014)

Git has been transitioning away from SHA-1 toward SHA-256 since experimental support was introduced in version 2.29. SHA-256 is expected to become the default hash algorithm for new repositories in Git 3.0, alongside a new reftable reference backend and Rust as a mandatory build dependency.[^deployhq2025]

## Object model

The entire content database lives under `.git/objects/` and consists of four object types: blobs, trees, commits, and annotated tags. All four are stored identically — zlib-compressed, identified by their SHA-1 hash — and differ only in the type field of their header.

### Blobs

A **blob** stores the raw byte content of a single file, with no associated metadata: no filename, no permissions, no timestamp. Because the hash is computed purely from content, two files with identical bytes at any path in the project will share the same blob object, saving storage without any explicit deduplication step.[^chacon2014]

### Trees

A **tree** object is the analog of a directory. Each entry in a tree contains a file mode (e.g., `100644` for a regular file, `100755` for an executable, `040000` for a subdirectory), an object type, the SHA-1 of a blob or nested tree, and a name. Trees compose recursively to represent the full directory hierarchy of a project snapshot.[^chacon2014]

### Commits

A **commit** object ties a snapshot to its provenance. It stores a pointer to the top-level tree representing the project at that moment; zero or more parent commit hashes (zero for the root commit, one for a regular commit, two or more for a merge); separate author and committer identities with timestamps; and a commit message. Because each commit references its parent(s), commits form a **directed acyclic graph (DAG)** that encodes the complete development history of the project. The distinction between author and committer is significant in patch-based workflows where one contributor writes a change and a maintainer applies it.[^chacon2014]

### Annotated tags

An **annotated tag** is an object that points — typically — to a commit, and adds a tagger identity, timestamp, and message. Unlike a branch, a tag never moves after creation: it is a permanent, named reference to a specific point in history. *Lightweight tags* skip the tag object entirely and store only a reference file pointing directly to a commit hash.[^chacon2014]

### Packfiles

Objects are initially written as individual *loose objects* — one file per object. Git periodically consolidates these into **packfiles** through a process triggered automatically when loose object count exceeds roughly 7,000, when the user runs `git gc`, or when pushing to a remote. During packing, Git applies delta compression by finding objects similar in name and size and storing only their differences; in practice this can halve storage requirements or better.[^chacon2014] Packfiles are a storage and transfer optimization only — the snapshot-based conceptual model is unchanged, and Git expands objects from packfiles transparently on access.

## The three-state model

Git organizes every file’s lifecycle around three distinct areas that correspond to three states.

|Area                |What it is                                             |File state |
|--------------------|-------------------------------------------------------|-----------|
|Working directory   |Files checked out on disk for editing                  |*Modified* |
|Staging area (index)|A binary file in `.git/index` recording the next commit|*Staged*   |
|Git directory       |The `.git` object database and metadata                |*Committed*|

A file is *modified* when it has been changed in the working directory but not yet recorded in the index. Running `git add` writes the file’s content as a blob object, updates the index to map the path and mode to that blob, and places the file in the *staged* state. Running `git commit` reads the index, writes a tree hierarchy for the full directory structure, creates a commit object referencing that tree and the previous HEAD commit, and advances the branch pointer — moving affected files into the *committed* state.[^chacon2014]

The separation between staging and committing is deliberate: it allows a developer to edit several files and then craft a commit containing only a carefully chosen subset of those changes. `git diff` with no arguments compares the working directory to the index (showing unstaged changes), while `git diff --staged` compares the index to the last commit (showing what is about to be committed).[^chacon2014]

Files that have never been staged or committed are *untracked* — Git is aware of their existence through directory traversal but stores nothing about them until they are explicitly added.

## Branching and merging

A Git **branch** is a lightweight movable pointer: a 41-byte file in `.git/refs/heads/` containing the SHA-1 of a single commit. Creating a branch is nearly instantaneous and costs almost nothing, which is why non-linear development is a first-class capability rather than an expensive special case.[^chacon2014] A special pointer named `HEAD` tracks which branch is currently checked out; when a commit is made, the branch `HEAD` points to advances automatically to the new commit.

When `HEAD` is moved to a raw commit hash rather than a branch name — typically through `git checkout <SHA>` or `git switch --detach` — the repository enters a *detached HEAD* state. This is appropriate for inspecting historical snapshots, but commits made in this state will become unreachable once HEAD moves elsewhere unless a new branch is first created from that position.[^chacon2014]

### Fast-forward merges

A **fast-forward merge** occurs when the target branch’s tip commit is a direct ancestor of the branch being merged, meaning no divergent work exists. Git simply advances the target branch pointer to the source branch’s tip without creating a new commit.[^chacon2014]

### Three-way merges

When the two branches have diverged, Git performs a **three-way merge**: it identifies the most recent common ancestor (the *merge base*), computes the changes introduced on each branch relative to that base, and combines them into a new *merge commit* with two parent pointers.[^chacon2014] If the same region of the same file was modified on both branches, Git cannot resolve the conflict automatically; it halts and marks the conflicting sections with `<<<<<<<`, `=======`, and `>>>>>>>` delimiters for manual resolution.

### Rebasing

`git rebase` offers an alternative integration path. Rather than creating a merge commit, it takes the commits on the current branch and **replays them one by one onto the tip of a target branch**, rewriting each commit’s hash in the process. The resulting snapshot is identical to a three-way merge, but the history is linear — there is no merge commit and no record that parallel development occurred.[^chacon2014] Rebasing is well suited to preparing a clean sequence of commits before merging a feature branch. The critical constraint is that rebased commits must not already exist in a shared remote repository: because rebasing rewrites hashes, force-pushing rebased commits onto a branch that collaborators have already pulled from will cause significant reconciliation problems.[^chacon2014]

## Distributed workflows

Because every clone is a full repository, Git supports several collaboration topologies without privileging any particular one as canonical.

### Centralized workflow

A single shared repository acts as the integration point. All contributors push to and pull from the same remote; the first to push succeeds, and others must fetch and merge before retrying. This is the simplest model and maps directly onto the older centralized VCS experience, though Git’s branching capabilities remain fully available within it.[^chacon2014]

### Integration-manager workflow

Each contributor maintains a personal fork and pushes changes there. A designated *integration manager* pulls from forks, reviews, tests, and merges contributions into the canonical repository. This decouples contributor work from the integration timeline — contributors can continue working without waiting for the maintainer — and is the model underlying GitHub and GitLab pull requests.[^chacon2014]

### Dictator-and-lieutenants workflow

For very large projects, a hierarchy of maintainers mediates integration. Regular contributors rebase onto a shared branch; *lieutenants* (subsystem owners) merge and validate contributions for their respective areas; a single *benevolent dictator* merges the lieutenants’ branches into the authoritative repository. The Linux kernel project operates on this model.[^chacon2014]

### Remote operations

`git fetch` downloads objects and references from a remote into the local database without touching the working directory or merging anything, making it safe to inspect incoming changes before integrating them. `git pull` is shorthand for `git fetch` followed immediately by `git merge` on the tracking branch; using the two commands separately is generally preferable when the local branch may have diverged.[^chacon2014] `git push` transmits local commits to a remote and succeeds only when the result would be a fast-forward on the remote branch.

Internally, Git uses either a *dumb protocol* — a sequence of plain HTTP GET requests requiring no server-side Git process — or the *smart protocol*, which pairs `upload-pack`/`fetch-pack` for downloads and `receive-pack`/`send-pack` for uploads to negotiate exactly which objects must be transferred and to generate a purpose-built packfile for the operation.[^chacon2014]

## Core commands

The following table maps the most frequently used porcelain commands to the underlying object operations they perform.

|Command                      |What it does internally                                                                                                                                                    |
|-----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|`git init`                   |Creates `.git/` with empty `objects/`, `refs/`, a `HEAD` file, and a template config. No objects are written until the first commit.                                       |
|`git add`                    |Hashes file contents as a blob, writes it to the object database, and updates the index entry for the path.                                                                |
|`git commit`                 |Reads the index, writes tree objects for the directory hierarchy, creates a commit object pointing to the root tree and the previous HEAD, and advances the branch pointer.|
|`git branch <n>`             |Writes a new file at `.git/refs/heads/<n>` containing the current HEAD commit’s SHA-1. Does not touch the working directory.                                               |
|`git checkout` / `git switch`|Updates HEAD to the target branch, then rewrites the working directory and index to match the target commit’s tree.                                                        |
|`git merge`                  |Finds the merge base, performs a fast-forward or three-way merge, and (for three-way) creates a merge commit with two parents.                                             |
|`git log`                    |Walks the commit DAG from HEAD, following parent pointers, and prints commit metadata. `--graph --all` renders the DAG structure as ASCII art.                             |
|`git gc`                     |Packs loose objects into packfiles with delta compression, prunes unreachable objects older than the configured threshold, and consolidates `refs/` into `packed-refs`.    |

## Ecosystem and adoption

Git is used by approximately 94% of professional developers, a share that has grown steadily from 69.3% in 2015 to 87.2% in 2018 to 93.9% in 2022.[^wiki2026] The version control system market was valued at between $708 million and $1.24 billion in 2024–2025 and is projected to expand at roughly 18–19% annually through 2034.[^fortune2025][^grandview2025]

GitHub, the dominant hosting platform, reported over 180 million registered developers in 2025 with roughly one new developer joining per second, and crossed one billion total repositories in June of that year.[^github2025][^wiki2026] GitLab provides an open-core self-hostable alternative with integrated CI/CD pipelines. Bitbucket, operated by Atlassian, serves primarily enterprise environments and dropped Mercurial support entirely in 2020 — a move that further consolidated Git’s market position.

Research into Git’s usability has documented a persistent tension between the simplicity of its internal model and the complexity of its user interface. A 2013 ACM paper proposed a redesign after concluding that “despite its widespread adoption, Git puzzles even experienced developers and is not regarded as easy to use.”[^derosso2013] A subsequent large-scale analysis of 80,370 Git-related Stack Overflow questions found that self-directed learning is the predominant way developers acquire Git knowledge, and that question volume has increased consistently year over year.[^ragkhitwetsagul2022]

[^chacon2014]: Chacon, S., & Straub, B. (2014). [*Pro Git*](https://git-scm.com/book/en/v2) (2nd ed.). Apress.

[^deployhq2025]: DeployHQ. (2025). [*Git 3.0: Release date, features, and what developers need to know*](https://www.deployhq.com/blog/git-3-0-on-the-horizon-what-git-users-need-to-know-about-the-next-major-release). DeployHQ Blog.

[^derosso2013]: de Rosso, S. P., & Jackson, D. (2013). What’s wrong with Git? A conceptual design analysis. *Proceedings of the 2013 ACM International Symposium on New Ideas, New Paradigms, and Reflections on Programming & Software*, 37–52. https://doi.acm.org/10.1145/2509578.2509584

[^fortune2025]: Fortune Business Insights. (2025). [*Version control systems market*](https://www.fortunebusinessinsights.com/version-control-systems-market-111262). Fortune Business Insights.

[^github2025]: GitHub. (2025). [*Octoverse 2025*](https://github.blog/news-insights/octoverse/octoverse-2024/). GitHub Blog.

[^grandview2025]: Grand View Research. (2025). [*Version control system market size, share & trends analysis report*](https://www.grandviewresearch.com/industry-analysis/version-control-system-market). Grand View Research.

[^ragkhitwetsagul2022]: Ragkhitwetsagul, C., et al. (2022). Do developers really know how to use Git commands? *ACM Transactions on Software Engineering and Methodology*. https://doi.acm.org/10.1145/3494518

[^rhodecode2025]: RhodeCode. (2025). [*Version control systems popularity in 2025*](https://rhodecode.com/blog/156/version-control-systems-popularity-in-2025). RhodeCode Blog.

[^wiki2026]: Wikipedia contributors. (2026). Git. In *Wikipedia*. https://en.wikipedia.org/wiki/Git