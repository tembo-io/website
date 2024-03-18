---
title: High Availability
---

Tembo supports highly available (HA) deployments of Postgres in [Tembo Cloud](https://cloud.tembo.io). Click the HA toggle on when creating or updating an instance to enable this feature. When using the API directly, configure replicas to 2.

## How is High Availability configured in Tembo?

When the HA option is enabled on a Tembo Instance, a standby server (replica) with the same compute, storage, and extensions is deployed. The standby server is configured to use **physical, asynchronous replication** also known as **streaming replication**. The asynchronous option is selected for better performance and availability, while sacrificing some durability in the unlikely event of a disk failure.

Please read more about this in the Cloud Native Postgres Operator documentation [here](https://cloudnative-pg.io/documentation/1.20/replication/).

### Failover

Tembo's HA setup includes an automated processes for failover if the primary becomes unhealthy. Please read more about this in the Cloud Native Postgres Operator documentation [here](https://cloudnative-pg.io/documentation/1.20/failover/).
