---
title: "Databases"
date: 2026-03-20
updated: 2026-03-19
draft: false
tags:
  - data
  - storage
---

A **database** is an organized collection of structured information stored electronically and controlled by a dedicated management system. The term covers everything from a small embedded store in a mobile app to a globally distributed cluster handling millions of transactions per second. The critical distinction from simpler storage — flat files, spreadsheets — is that a database is a *managed* system: it enforces structure, arbitrates concurrent access, protects integrity through transactional guarantees, and provides a query interface that lets users declare *what* they want without specifying *how* to retrieve it[^oracle2020][^universitySystemGA].

The foundational theory was laid by Edgar F. Codd in his 1970 paper at IBM, which introduced the relational model and formalized the principle that data relationships should be represented through values rather than pointers or physical adjacency[^codd1970]. That model — tables, keys, and a declarative query language — still underlies the majority of production databases in use today, though it has been extended, challenged, and in some domains supplanted by architectures designed for different access patterns and scale characteristics.

## Data organization

### Tables, records, and fields

The relational model organizes data into **tables** (formally, *relations*). Each table represents a single entity type — customers, orders, products — and is defined by a fixed set of named columns, each with a declared data type. A **row** (or *tuple*) is one instance of that entity; a **column** (or *attribute*) is one property. Every value at the intersection of a row and column is atomic: it holds exactly one piece of information, not a list or a nested structure[^kosinski].

This constraint — atomic column values — is the first of the normalization rules formalized by Codd. **Normalization** is the process of restructuring tables to eliminate redundancy and undesirable update anomalies. First normal form (1NF) requires atomic values. Second normal form (2NF) removes partial dependencies on composite keys. Third normal form (3NF) removes transitive dependencies, ensuring that non-key columns depend only on the primary key and not on each other. A fully normalized schema stores each fact exactly once, which prevents the class of bugs where updating a value in one place leaves stale copies elsewhere[^ibmB].

### Schemas

A **schema** is the structural contract of a database — the complete definition of its tables, column names, data types, constraints, and inter-table relationships. IBM describes it as the layer that "technically and logically defines how data is organized within a database"[^ibmB]. Schemas are typically described at three levels of abstraction:

- **Conceptual schema**: a high-level, implementation-agnostic view of entities and relationships (the ER model).
- **Logical schema**: the concrete table definitions, keys, and integrity constraints expressed in DDL.
- **Physical schema**: how data is stored on disk — file layout, index structures, partitioning strategy.

The separation of logical from physical is what allows a DBA to restructure storage or add indexes without changing application code, because applications interact with the logical layer.

## The database management system

The **database management system** (DBMS) is the software that creates, maintains, and provides access to one or more databases. Users and applications never touch raw storage directly; all interaction goes through the DBMS, which arbitrates access, enforces rules, and handles failure recovery. Yasar and Mullins (2024) define its role as enabling end users to "create, protect, read, update and delete data in a database" while managing security, integrity, and concurrency.

The internal architecture of a DBMS comprises several cooperating subsystems. The **storage engine** manages reading and writing pages of data to disk and maintains the buffer pool — a region of RAM that caches recently accessed pages to avoid redundant I/O. The **metadata catalog** (or data dictionary) stores definitions of every database object and is consulted during query parsing. The **query processor** parses SQL text, checks it semantically against the catalog, and hands a validated parse tree to the optimizer. The **lock manager** coordinates concurrent access by granting and queuing locks on rows, pages, or tables. And the **log manager** records every change to a write-ahead log before applying it to the data files, which is the mechanism that makes crash recovery possible[^yasarMullins2024][^ibmB].

## Query processing

SQL is a **declarative** language: a `SELECT` statement describes a desired result set, not a retrieval procedure. The DBMS is responsible for finding an efficient way to produce that result — a task delegated to the query optimizer. Processing a SQL statement proceeds in four stages.

1. **Parsing** — the SQL text is tokenized, its grammar validated, and its referenced objects resolved against the catalog. Any syntax error or reference to a nonexistent table fails here.
2. **Optimization** — the optimizer generates a set of candidate execution plans, estimates the cost of each (in terms of I/O, CPU, and memory) using table statistics, and selects the cheapest. This is where it decides whether to scan a full table or use an index, and which join algorithm — nested loop, hash join, or merge join — to apply to each pair of tables[^oracle2019][^microsoftA].
3. **Execution** — the chosen plan is run by the execution engine using an iterator model: each operator (scan, filter, join, sort) pulls rows from its child operators on demand and passes them up the tree until a result set emerges at the root.
4. **Plan caching** — compiled plans are stored in a plan cache so that subsequent identical queries bypass the expensive optimization step.

A simple retrieval looks like this:

```sql
SELECT customer_id, total_amount
FROM orders
WHERE status = 'shipped'
ORDER BY total_amount DESC;
```

JOINs combine rows from multiple tables on a shared key. An `INNER JOIN` returns only rows with matches in both tables; a `LEFT JOIN` returns all rows from the left table and fills in `NULL` for unmatched columns from the right[^w3schools].

```sql
SELECT c.name, o.total_amount
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
WHERE o.status = 'shipped';
```

## Keys and indexes

**Keys** define uniqueness and enforce relationships. A **primary key** uniquely identifies each row in a table — it must be unique and non-null, and each table can have only one[^microsoftB]. A **foreign key** is a column that references the primary key of another table, establishing a formal parent-child relationship. Foreign keys enforce **referential integrity**: the DBMS rejects any insert or update that would create a reference to a nonexistent parent row. When a parent row is deleted, the system's cascading rules determine the response — block the deletion (`NO ACTION`), delete the child rows too (`CASCADE`), or set the foreign key to null (`SET NULL`)[^oracleA].

Table relationships fall into three structural patterns: one-to-one (a user and their profile), one-to-many (one customer, many orders — the most common pattern), and many-to-many (students and courses), which requires a junction table holding foreign keys to both parent tables.

**Indexes** solve the performance problem of scale. Without one, finding matching rows requires a full table scan — reading every row sequentially. A **B-tree index**, the default in most systems, is a balanced tree structure where leaf nodes hold sorted key values and pointers to the corresponding rows. Think of it as a book's back-of-index: rather than reading every page, you look up the term and jump directly to the relevant location. Searches on a B-tree index run in `O(log n)` time rather than `O(n)`[^oracleB]. A **clustered index** physically reorders the table's data pages to match the key order, giving the fastest possible sequential reads for range queries; a table can have only one. Non-clustered indexes maintain a separate structure with row pointers and can exist in many per table. The trade-off: indexes speed reads but slow writes, since every INSERT, UPDATE, or DELETE must also update every index on the affected columns.

The table below summarizes the main index types and their trade-offs:

| Index type | Structure | Best for | Trade-off |
|---|---|---|---|
| B-tree | Balanced tree | Range queries, equality, sorts | Moderate write overhead |
| Hash | Hash table | Exact-match lookups | Cannot support range queries |
| Clustered | Sorted data pages | Sequential range scans | Only one per table |
| Non-clustered | Separate pointer structure | Selective queries on non-PK columns | Additional storage; write overhead |

## ACID transactions

A **transaction** is a unit of work that must be executed atomically with respect to the rest of the database. The four properties that define a reliable transaction were formalized by Härder and Reuter in 1983 under the acronym **ACID**[^wikipediaB].

**Atomicity** means the transaction is all-or-nothing. A bank transfer that debits one account and credits another must either complete both steps or complete neither; if the credit fails mid-transaction, the debit is rolled back[^mongodb]. **Consistency** means a transaction can only move the database between valid states — any operation that would violate a defined constraint (a `NOT NULL` column, a referential integrity rule, a `CHECK` constraint) is rejected and rolled back. **Isolation** means concurrent transactions do not see each other's intermediate, uncommitted state. Without it, a reader could observe a partially applied transfer — money debited but not yet credited — a condition called a *dirty read*. Databases implement isolation through locking (pessimistic) or multi-version concurrency control (MVCC, optimistic), at configurable strictness levels ranging from Read Uncommitted through Serializable[^techTargetB]. **Durability** means committed transactions survive crashes. This is enforced through **write-ahead logging** (WAL): changes are written to a durable log before being applied to data pages, so the log can be replayed to reconstruct committed state after a failure[^wikipediaB][^awsD].

Many distributed and NoSQL databases relax ACID in favor of the **BASE** model — *Basically Available, Soft state, Eventually consistent* — which prioritizes availability and partition tolerance over strict correctness. The choice between models is not merely philosophical; it is governed by the CAP theorem[^awsD].

## Database types

The relational model is not universally the right tool. Different access patterns, data shapes, and scale requirements have produced a diverse taxonomy of database types.

| Type | Data model | Query interface | Representative systems |
|---|---|---|---|
| Relational (RDBMS) | Tables with typed columns | SQL | PostgreSQL, MySQL, Oracle, SQL Server |
| Document store | JSON/BSON documents | Document API or SQL-like | MongoDB, Couchbase |
| Key-value store | Opaque values keyed by ID | GET/SET | Redis, DynamoDB |
| Column-family | Wide rows grouped by column | CQL, Thrift | Apache Cassandra, HBase |
| Graph | Nodes and edges | Cypher, Gremlin | Neo4j, Amazon Neptune |
| NewSQL | Relational with horizontal scale | SQL + ACID | CockroachDB, Spanner, YugabyteDB |
| In-memory | Any of the above, RAM-resident | Varies | Redis, SAP HANA |
| Vector | High-dimensional float arrays | ANN search | Pinecone, Weaviate, Milvus |

Relational databases remain the dominant choice wherever transactional correctness is non-negotiable — finance, ERP, healthcare. NoSQL systems were built for web-scale read/write patterns where schema flexibility and horizontal scalability outweigh strict consistency[^kosinski][^microsoftAzure]. NewSQL systems attempt to close that gap by delivering full SQL semantics and ACID compliance across distributed clusters — a position CockroachDB and Google Spanner have carved out by using consensus protocols (Raft and Paxos, respectively) to coordinate distributed transactions[^techTarget]. Vector databases have emerged as a distinct category alongside large language models, where retrieval by semantic similarity rather than exact match is the primary query pattern[^kosinski].

## Scalability and distribution

A single-node database has a hard ceiling: the CPU, RAM, and I/O bandwidth of one machine. Two strategies extend beyond it. **Vertical scaling** (scaling up) replaces the server with a more powerful one — straightforward but expensive, with diminishing returns and a single point of failure. **Horizontal scaling** (scaling out) distributes data and load across multiple commodity nodes. One analysis found that ten smaller cloud instances can match the throughput of a single high-end server at roughly 35% lower cost while eliminating the single point of failure[^manne2024].

**Sharding** is the primary mechanism for horizontal write scaling. The dataset is partitioned into shards, each stored on a separate node, and a shard key — typically a hash or range of a high-cardinality column — determines which node holds a given row. Modern distributed databases like YugabyteDB handle this transparently, splitting tablets and rebalancing them as nodes join or leave the cluster[^aaltoUniversity]. **Replication** complements sharding by maintaining synchronized copies of data across nodes. A primary-replica setup routes all writes to one leader while replicas serve reads — appropriate given that read traffic commonly constitutes around 80% of database workload. Multi-master replication distributes writes but introduces conflict resolution complexity[^aaltoUniversity].

The theoretical constraints on distributed systems are captured by the **CAP theorem**, proven by Gilbert and Lynch in 2002: a distributed system can guarantee at most two of *Consistency* (all nodes see the same data), *Availability* (every request receives a response), and *Partition Tolerance* (the system operates despite network splits). Because network partitions are an environmental reality rather than an engineering choice, the practical trade-off is between CP systems — like MongoDB and HBase, which reject requests during a partition to preserve consistency — and AP systems — like Cassandra and DynamoDB, which remain available but may serve stale reads[^ibmC][^wikipediaC].

[^aaltoUniversity]: Aalto University. (n.d.). *Data distribution: Replication, sharding, and CAP & PACELC*. CS Foundations: Designing and Building Scalable Web Applications. https://csfoundations.cs.aalto.fi/en/courses/designing-and-building-scalable-web-applications/part-2/3-data-distribution-sharding-partitioning-and-cap-and-pacelc-theorems

[^awsD]: Amazon Web Services. (n.d.). *ACID vs BASE databases: Difference between databases*. AWS. https://aws.amazon.com/compare/the-difference-between-acid-and-base-database/

[^codd1970]: Codd, E. F. (1970). A relational model of data for large shared data banks. *Communications of the ACM, 13*(6), 377–387. https://doi.org/10.1145/362384.362685

[^ibmB]: IBM. (n.d.). *What is a database schema?* IBM Think. https://www.ibm.com/think/topics/database-schema

[^ibmC]: IBM. (n.d.). *What is the CAP theorem?* IBM Think. https://www.ibm.com/think/topics/cap-theorem

[^kosinski]: Kosinski, M. (n.d.). *What is a database?* IBM Think. https://www.ibm.com/think/topics/database

[^manne2024]: Manne, U. K. (2024). Horizontal vs. vertical scaling in modern database systems: A comparative analysis of performance and cost trade-offs. *International Journal of Computer Engineering and Technology, 15*(5), 514–524.

[^microsoftA]: Microsoft. (n.d.). *Query processing architecture guide*. SQL Server Documentation, Microsoft Learn. https://learn.microsoft.com/en-us/sql/relational-databases/query-processing-architecture-guide

[^microsoftAzure]: Microsoft Azure. (n.d.). *What are databases?* Microsoft Azure Cloud Computing Dictionary. https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-are-databases

[^microsoftB]: Microsoft. (n.d.). *Primary and foreign key constraints*. SQL Server Documentation, Microsoft Learn. https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints

[^mongodb]: MongoDB. (n.d.). *ACID properties in DBMS explained*. MongoDB Resources. https://www.mongodb.com/resources/basics/databases/acid-transactions

[^oracleA]: Oracle Corporation. (n.d.). *Data integrity*. Oracle Database Concepts, 19c. https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/data-integrity.html

[^oracleB]: Oracle Corporation. (n.d.). *Indexes and index-organized tables*. Oracle Database Concepts. https://docs.oracle.com/cd/E11882_01/server.112/e40540/indexiot.htm

[^oracle2019]: Oracle Corporation. (2019). *SQL processing*. Oracle Database SQL Tuning Guide, 19c. https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/sql-processing.html

[^oracle2020]: Oracle Corporation. (2020, November 24). *What is a database?* Oracle. https://www.oracle.com/database/what-is-database/

[^techTarget]: TechTarget. (n.d.). *SQL vs. NoSQL vs. NewSQL: How do they compare?* TechTarget. https://www.techtarget.com/whatis/feature/SQL-vs-NoSQL-vs-NewSQL-How-do-they-compare

[^techTargetB]: TechTarget. (n.d.). *What is ACID?* TechTarget SearchDataManagement. https://www.techtarget.com/searchdatamanagement/definition/ACID

[^universitySystemGA]: University System of Georgia. (n.d.). *What is a database?* GALILEO Online Library Learning Center. https://www.usg.edu/galileo/skills/unit04/primer04_01.phtml

[^w3schools]: W3Schools. (n.d.). *SQL joins*. W3Schools. https://www.w3schools.com/sql/sql_join.asp

[^wikipediaB]: Wikipedia. (n.d.). ACID. *Wikipedia*. https://en.wikipedia.org/wiki/ACID

[^wikipediaC]: Wikipedia. (n.d.). CAP theorem. *Wikipedia*. https://en.wikipedia.org/wiki/CAP_theorem

[^yasarMullins2024]: Yasar, K., & Mullins, C. S. (2024, June 25). *Database management system (DBMS)*. TechTarget SearchDataManagement. https://www.techtarget.com/searchdatamanagement/definition/database-management-system