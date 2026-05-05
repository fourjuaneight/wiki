---
title: "Cloud Infrastructure"
date: 2026-05-05
draft: false
tags:
  - distributed-systems
  - infrastructure
---

**Cloud infrastructure** is the collection of hardware and software that enables on-demand, self-service access to a shared pool of configurable computing resources — networks, servers, storage, applications, and services — that can be rapidly provisioned and released with minimal management effort. It can be viewed as two interdependent layers: a physical layer consisting of servers, storage devices, and network equipment housed in datacenters, and an abstraction layer of software deployed across that hardware that manifests the essential cloud characteristics. The abstraction layer — hypervisors, virtual networks, distributed storage systems, and orchestration software — is what transforms raw hardware into elastic, metered, multi-tenant services[^mell2011].

Five essential characteristics distinguish cloud from traditional hosting: on-demand self-service (consumers provision resources without human interaction with the provider), broad network access (capabilities available over standard protocols to heterogeneous clients), resource pooling (physical and virtual resources dynamically assigned across multiple tenants), rapid elasticity (capacity scales outward and inward commensurate with demand), and measured service (resource usage is metered, monitored, and reported transparently)[^mell2011].

## Service models

The three service models define the boundary of control between provider and consumer — what each party manages and what each party can modify.

**Infrastructure as a Service** (IaaS) gives the consumer access to fundamental computing resources: processing, storage, and networks. The consumer deploys and runs arbitrary software including operating systems and applications, controlling the OS layer upward while the provider manages everything beneath — the physical hardware, hypervisors, and network fabric. The consumer may also exercise limited control over select networking components such as host firewalls[^mell2011].

**Platform as a Service** (PaaS) provides a managed environment onto which consumers deploy applications built using languages, libraries, and tools the provider supports. The consumer controls deployed applications and possibly application-hosting configuration, but does not manage or control the underlying infrastructure, operating system, or storage. The provider handles runtime maintenance, patching, and capacity management for the platform itself[^mell2011].

**Software as a Service** (SaaS) exposes the provider's applications to consumers via thin-client interfaces such as web browsers. The consumer has no control over the underlying infrastructure, platform, or even individual application capabilities beyond limited user-specific configuration settings. Email services, document editors, and CRM systems are canonical examples[^mell2011].

In short: the lower in the stack, the more the provider owns. IaaS consumers control from the OS upward; PaaS consumers control middleware and application; SaaS consumers control only their data and access configuration[^liu2011].

## Deployment models

Four deployment models describe who owns and operates the infrastructure. **Public cloud** exists on provider premises, open to the general public. **Private cloud** serves a single organization exclusively, on or off its own premises. **Hybrid cloud** composes two or more distinct infrastructures bound by technology enabling data and application portability (e.g., cloud bursting to offload peak demand). **Community cloud** serves organizations with shared concerns like compliance or mission requirements[^mell2011].

## Physical layer

The physical resource layer includes all hardware necessary to support cloud services: compute nodes (CPUs, memory, accelerators), storage components (hard disks, solid-state drives), network equipment (routers, switches, firewalls, network links), and facility infrastructure — power distribution, uninterruptible power supplies, heating/ventilation/air conditioning, and physical security systems[^liu2011].

Hyperscale datacenters standardize on commodity x86 servers organized in racks, connected via top-of-rack switches aggregating into spine-leaf topologies that provide uniform low-latency paths between any two nodes. Storage is either directly attached or pooled into dedicated clusters accessible over high-bandwidth internal networks.

## Virtualization

Virtualization is the foundational abstraction that enables resource pooling and multi-tenancy. A **hypervisor** (or virtual machine monitor) partitions a single physical server into multiple isolated virtual machines, each running its own operating system and applications as if on dedicated hardware.

Type 1 (bare-metal) hypervisors run directly on hardware without a host operating system. KVM (Kernel-based Virtual Machine) converts the Linux kernel into a Type 1 hypervisor via loadable modules, requiring hardware virtualization extensions (Intel VT-x or AMD-V). A userspace component (typically QEMU) handles device emulation while KVM manages CPU scheduling and memory isolation in-kernel[^kvmapi].

Memory virtualization uses hardware-assisted two-dimensional paging (Intel EPT or AMD NPT), which lets hardware walk both guest and host page tables simultaneously — eliminating expensive software-maintained shadow tables. This supports 4K, 2M, and 1G page sizes for efficient mapping at any workload scale[^kvmapi].

In production cloud environments, dedicated hardware offloads networking and storage I/O from the hypervisor entirely. AWS's Nitro system, for example, uses a minimized KVM-based hypervisor that handles only CPU and memory partitioning, while PCIe Nitro Cards manage VPC networking, block storage, and instance storage in hardware — delivering near-bare-metal performance with all CPU cores available to customer workloads[^hamilton2019].

## Software-defined networking

Physical network hardware in a cloud datacenter is abstracted through **software-defined networking** (SDN), which physically separates the control plane from the forwarding plane. This separation enables centralized, programmable management of network behavior across thousands of switches and routers[^haleplidis2015].

The architecture comprises five functional layers. The forwarding plane handles packet processing — forwarding, dropping, and modification — based on rules pushed from above. The operational plane manages device state (port status, resource allocation, health). The control plane makes routing and forwarding decisions on millisecond timescales, managing ephemeral state like computed routes and flow entries. The management plane monitors, configures, and maintains devices on longer timescales. The application plane houses programs that define desired network behavior through northbound APIs[^haleplidis2015].

Layers communicate through standardized interfaces: OpenFlow and ForCES for time-critical control-plane southbound communication, NETCONF for management-plane configuration. SDN controllers maintain a logically centralized global network view and expose northbound APIs (typically RESTful) to applications[^haleplidis2015].

In practice, SDN enables cloud providers to create isolated virtual networks per tenant, implement security groups in software, perform load balancing without dedicated hardware, and reconfigure topology programmatically in response to failures — all without touching physical switches.

## Distributed storage

Cloud storage systems must provide durability (data survives hardware failures), availability (data is accessible when requested), and scalability (capacity grows with demand). Two primary mechanisms achieve durability: replication and erasure coding.

**Replication** copies each data object to N storage nodes (typically three), each on a different failure domain — rack, power circuit, or availability zone. Any single copy can serve reads independently. The tradeoff is storage overhead: triple replication requires 3x raw capacity. The Google File System demonstrated this approach at scale: files split into 64 MB chunks, each replicated to three chunkservers across different racks, with a single master coordinating namespace and chunk-to-server mappings via periodic heartbeats[^ghemawat2003].

**Erasure coding** reduces storage overhead while maintaining equivalent durability. An object is divided into K data chunks, and M coding (parity) chunks are computed using algorithms like Reed-Solomon. Recovery requires only K surviving chunks out of K+M total. Storage overhead is (K+M)/K — for example, K=10 and M=4 yields 1.4x overhead (compared to 3x for replication) while tolerating loss of any four chunks[^ceph2024].

Data placement in distributed storage avoids centralized lookup tables. Ceph's CRUSH algorithm, for instance, uses deterministic pseudorandom computation — any client or storage node independently calculates where data should live based on a hierarchical failure domain map (datacenter, room, rack, host, disk) and placement rules. This enables parallel operation without coordination bottlenecks. On failure, CRUSH redistributes only affected data according to rules, maintaining target redundancy automatically[^ceph2024].

Local Reconstruction Codes (LRC), introduced by Microsoft for Azure Storage, optimize repair efficiency by reducing the number of fragments needed to reconstruct data after a single failure — minimizing network bandwidth consumed during the most common recovery scenario[^huang2012].

## Container orchestration

While virtual machines provide hardware-level isolation, **containers** offer a lighter-weight abstraction: process-level isolation using Linux kernel namespaces and cgroups, sharing the host kernel. Container orchestration systems automate the deployment, scaling, and management of containerized applications across clusters of machines.

Kubernetes, the dominant orchestration platform, schedules **Pods** (groups of co-located containers) onto **Nodes** (worker machines) using a two-phase algorithm. The filtering phase eliminates nodes that cannot satisfy a Pod's requirements — insufficient CPU or memory, incompatible taints, failed affinity rules. The scoring phase ranks remaining feasible nodes using weighted plugins, and the highest-scoring node receives the workload[^k8s2024].

Scheduling decisions consider resource requests and limits, node affinity (hard or soft constraints matching node labels), pod affinity and anti-affinity (co-locating or separating pods based on what else is running, scoped to topology domains like zones or racks), taints and tolerations (nodes repelling pods unless explicitly tolerated), and topology spread constraints ensuring even distribution across failure domains[^k8s2024].

The architecture separates the control plane (API server, scheduler, controller manager, etcd distributed state store) from the data plane (kubelet agents on each node that actually run containers). This separation enables the control plane to maintain a declarative desired state while kubelets independently reconcile actual state, recovering from node failures by rescheduling affected workloads onto healthy nodes.

## Auto-scaling and elasticity

**Elasticity** is the degree to which a system adapts to workload changes by provisioning and de-provisioning resources autonomously, matching available capacity to current demand as closely as possible at each point in time[^lorido2014].

Auto-scaling mechanisms fall into two categories. Reactive (threshold-based) scaling applies predefined rules — "if average CPU utilization exceeds 80% for five minutes, add an instance." This is simple to implement but suffers from response lag and oscillation as the system hunts between thresholds. Proactive (predictive) scaling uses time-series analysis, queuing theory, or machine learning to anticipate demand and pre-provision resources before load arrives, trading complexity for reduced latency spikes during traffic surges[^lorido2014].

Scaling operates in two dimensions. Horizontal scaling (scale out/in) adds or removes instances from a pool — well-suited to stateless services. Vertical scaling (scale up/down) changes resource capacity of existing instances — useful when work cannot easily distribute. The control loop — observe metrics (CPU, memory, request rate, latency, queue depth), compare against targets, compute desired replica count, actuate — runs continuously with stabilization windows to prevent thrashing.

[^ceph2024]: Ceph Foundation. (2024). [*Erasure code*](https://docs.ceph.com/en/latest/rados/operations/erasure-code/). Ceph Documentation.
[^ghemawat2003]: Ghemawat, S., Gobioff, H., & Leung, S.-T. (2003). The Google File System. *Proceedings of the 19th ACM Symposium on Operating Systems Principles (SOSP '03)*, 29–43. https://doi.org/10.1145/945445.945450
[^haleplidis2015]: Haleplidis, E., Pentikousis, K., Denazis, S., Hadi Salim, J., Meyer, D., & Koufopavlou, O. (2015). [*Software-Defined Networking (SDN): Layers and Architecture Terminology*](https://www.rfc-editor.org/rfc/rfc7426) (RFC 7426). Internet Research Task Force.
[^hamilton2019]: Hamilton, J. (2019, February). [*AWS Nitro System*](https://perspectives.mvdirona.com/2019/02/aws-nitro-system/). Perspectives.
[^huang2012]: Huang, C., Simitci, H., Xu, Y., Ogus, A., Calder, B., Gopalan, P., Li, J., & Yekhanin, S. (2012). Erasure coding in Windows Azure Storage. *Proceedings of the 2012 USENIX Annual Technical Conference (ATC '12)*, 15–26.
[^k8s2024]: The Kubernetes Authors. (2024). [*Kubernetes Scheduler*](https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/). Kubernetes Documentation.
[^kvmapi]: The Linux Kernel Project. (n.d.). [*The Definitive KVM (Kernel-based Virtual Machine) API Documentation*](https://docs.kernel.org/virt/kvm/api.html). Linux Kernel Documentation.
[^liu2011]: Liu, F., Tong, J., Mao, J., Bohn, R., Messina, J., Badger, L., & Leaf, D. (2011). [*NIST cloud computing reference architecture*](https://csrc.nist.gov/publications/detail/sp/500-292/final) (NIST SP 500-292). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.SP.500-292
[^lorido2014]: Lorido-Botran, T., Miguel-Alonso, J., & Lozano, J. A. (2014). A review of auto-scaling techniques for elastic applications in cloud environments. *Journal of Grid Computing, 12*(4), 559–592. https://doi.org/10.1007/s10723-014-9314-7
[^mell2011]: Mell, P., & Grance, T. (2011). [*The NIST definition of cloud computing*](https://csrc.nist.gov/publications/detail/sp/800-145/final) (NIST SP 800-145). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.SP.800-145