# HA/Replication Guide

## Introduction to Replication

Replication in the context of databases, and particularly in Tembo Cloud, is the process of copying and maintaining database objects in multiple instances across a single or multiple physical locations. This not only provides a cushion against data loss but also allows for data availability and balance of the read-load across systems. Utilizing the advanced replication features of PostgreSQL, Tembo ensures that your data is consistently synchronized, available, and resilient to failures.

### Why is It Important?

Replication serves multiple essential functions in a database management system:

1. **High Availability**: In mission-critical applications where downtime is not an option, replication ensures that an alternate instance can take over in case of failure, reducing or eliminating downtime.
  
2. **Data Durability**: With data replicated in multiple locations, the risk of data loss due to hardware failure or other catastrophes is significantly reduced.

3. **Load Balancing**: Read-heavy workloads can be distributed across multiple instances, improving performance and user experience.

4. **Geo-Localization**: For global applications, replication can localize data closer to where it is accessed, reducing latency.

5. **Backup and Recovery**: Having a replicated database can serve as a real-time backup solution, making it easier to recover data in case of accidental deletions or modifications.

By integrating these capabilities, Tembo Cloud offers a comprehensive solution for managing your PostgreSQL databases, ensuring they are not just performant but also resilient and secure.

---

## Types of Replication

### Physical vs. Logical Replication

In PostgreSQL, there are mainly two types of replication: physical and logical. Physical replication, often referred to as "streaming replication", duplicates the entire database, while logical replication can duplicate specific tables or even rows. However, Tembo Cloud specifically focuses on Physical Asynchronous Replication to ensure high availability.

### Physical Asynchronous Replication (Streaming Replication)

At Tembo, we have made it possible to enable **Physical Asynchronous Replication** also known as **Streaming Replication** in your stack. This approach ensures that all changes made to the primary database are eventually replicated to the secondary (or replica) databases, without requiring each write operation to wait for acknowledgment from the replica. This method prioritizes performance and is particularly useful for environments where high throughput is crucial, and slight data latency between the primary and replicas is acceptable.

Physical asynchronous replication offers several advantages tailored to meet the demands of modern, high-performance applications. One of the most notable benefits is **High Throughput**. In an asynchronous setup, the primary database doesn't have to wait for acknowledgments from the replicas before moving on to the next operation. This results in a higher rate of transactions and offers a performance edge crucial for environments requiring rapid read and write capabilities.

Another advantage is **Reduced Latency**. The absence of a requirement for immediate acknowledgment from the replicas ensures that read and write operations on the primary database are carried out more swiftly. This efficiency is particularly beneficial for user-facing applications where low latency is a key quality metric.

In terms of ease of setup and management, asynchronous replication stands out for its **Simplicity and Lower Overhead**. Unlike some other forms of replication, the asynchronous method is relatively straightforward to configure and manage. Additionally, it incurs less performance overhead, allowing system resources to be utilized more effectively.

Last but not least, physical asynchronous replication provides excellent **Scalability** options. It is particularly well-suited for read-heavy workloads that can be distributed across multiple replica databases, thereby optimizing resource utilization and improving application responsiveness.

> **Note**: Currently Tembo Cloud only supports physical asynchronous replication to provide high availability. At this time, we do not offer support for synchronous or logical replication methods.

---

## How It Works

### Initialization

When you initiate a High Availability (HA) enabled Stack in Tembo Cloud, a specialized user account named `streaming_replica` is automatically generated. This user is imbued with the precise permissions required to facilitate the replication process from the primary database instance to its replicas. With HA enabled, Tembo takes care of setting up streaming replication within the cluster. It does so over an encrypted communication channel and employs TLS client certificate authentication for added security. This is all managed by the `streaming_replica` user. Additionally, Tembo manages the replication slots for each replica in the HA cluster by default. This ensures that the Write-Ahead Logs (WAL) needed by each standby replica are retained on the primary's storage, safeguarding data integrity even in the event of a failover or switchover.

### Number of Replicas

The number of replicas in your HA-enabled stack is determined by a simple formula:

`replicas = instances - 1` (Note: `instances` must be greater than zero)

Here, "instances" refers to the total number of database instances in your HA-enabled Tembo Cloud stack. The total count must be greater than zero to ensure there is at least one primary database instance. 

> **Important**: Currently, Tembo Cloud only supports a single replica for high availability. Therefore, you will have a maximum of 2 instances: one primary and one replica.

For example, if you opt for an HA-enabled cluster in Tembo Cloud, you will have one primary instance and one replica serving as the standby database.

### Roles and Responsibilities

The primary database instance is responsible for handling all write operations and is the source of truth for your data. The replica instances are read-only by default and synchronize with the primary to maintain data consistency and availability. These replicas can be promoted to become the primary instance in the event of a failover, ensuring continuity of service and data availability.

### Failover and Switchover

It's worth mentioning here that Tembo's HA setup includes automated processes for both failover and switchover scenarios. This ensures that your data remains accessible and that service continues even if the primary instance becomes unavailable for any reason.

:::info
Tembo Cloud does not support read-only connections (yet).
:::
