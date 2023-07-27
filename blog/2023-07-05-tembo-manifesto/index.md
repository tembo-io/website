---
slug: tembo-manifesto
title: "Tembo Manifesto"
authors: [ryw]
tags: [postgres, announcement]
---

![tembo brand](./tembo_brand.png)

## The Database Market

The global database market is expected to grow to $100+ billion in the coming years due to enterprises generating, storing, and leveraging more data, and the need for applications to operate at a global scale. 

Enterprises typically store data across various databases, grouped into transactional and analytical systems. There's roughly 10x more transactional than analytical data, mostly in Oracle, MySQL, and Postgres.

1. The first major shift in the data stack involved analytical workloads moving to the cloud, triggering the big data era and the rise of platforms like Snowflake and Databricks. 
2. The second shift involves transactional workloads moving to streaming and real-time data, requiring hybrid transactional and analytical processing platforms that are managed by application developers, not database experts.
3. The third shift entails abstracting application infrastructure, allowing developers to build and scale applications efficiently. However, while services like Vercel and Netlify streamline the software development lifecycle, they focus more on building on top of databases rather than the databases themselves.

## Postgres

Postgres, the world's favorite database with millions of deployments, features a liberal OSS license and a large community. It efficiently manages SQL and JSON queries across diverse workloads due to its growing, decade-old ecosystem of add-ons and extensions.

Postgres is popular for its open-source, standards-compliant, extensible nature, and ACID compliance, making it a reliable, cost-effective system. It handles low latency, high throughput analytical cases, offering HTAP-lite capabilities through window functions and foreign data wrappers.

Its extensibility resulted in numerous add-ons and plugins for GIS data, image processing, and more, with some extensions evolving into companies like CitusDB and Timescale. The extension ecosystem plays a crucial role in Postgres's growth and self-managed usage.

![Postgres is most admired and desired](postgres_is_admired_and_desired_stackoverflow.png)

Source: [Stack Overflow Developer Survey 2023](https://survey.stackoverflow.co/2023/#section-admired-and-desired-databases)

## Problem

Companies are hesitant to adopt new databases due to costs and complexity. The need to adapt to new architectures, configurations, and optimizations makes the transition value often negligible. Hence, costly Oracle instances remain in use for critical applications.

Postgres, favored by DBAs and Data Engineers, is widely adopted for transactional systems. However, deploying and managing it is complicated beyond it's basic use case.

To create a self-managed Postgres cluster, DBAs have to consider infrastructure, environment, security, data management, backups, and workload-specific tuning. Further, maintaining and scaling Postgres involves meeting high availability requirements, managing data storage, updating schemas, optimizing query performance, and managing failover protection and caching. Lastly, extensions exist to support additional functionality in Postgres but they are hard to discover, evaluate, certify and deploy.

## Our Vision

Many developers aren't served by current commercial Postgres solutions due to migration costs, restrictions on the open-source ecosystem, complexity, and a lack of developer-first and use-case first focus.

Tembo aims to enhance developers' Postgres experience by allowing full functionality, including custom extensions, and promoting developer-first workflows. It simplifies deploying Postgres with a virtualized runtime experience, enabling one-click migrations and access to the Postgres ecosystem.

Developers can control the data model lifecycle, and deploy to multiple zones and clouds. Advanced options will include autoscaling, hybrid transactional and analytical processing (HTAP), and edge caching.

Additionally, Tembo invests in the Postgres extension ecosystem, aiming to standardize and simplify the use and creation of extensions. By unbundling and decoupling the database into services and abstraction layers, Tembo enables new simplicity and capability.

## Product

We are productizing Postgres and the extended Postgres OSS ecosystem of add-ons and extensions, into one grand managed cloud offering.

### Tembo Cloud

We are building a dev-first, fully-extensible, fully-managed, secure, and scalable Postgres service. Available on all clouds and bare metal providers, Tembo Cloud provides the largest library of easily-installed extensions and “flavored Postgres” **Tembo Stacks**, allowing our customers to expand their use cases of Postgres.

![Org home](org_home.jpg)

### Tembo Stacks

“Postgres for Everything” delivered as highly-polished “flavored” Postgres — Tembo Stacks. We help teams avoid new databases, and the pains associated with that, reducing database sprawl.

| Name | Components | “North Star” Competition |
| --- | --- | --- |
| Tembo OLTP | Feature-Rich, Optimized Postgres | Other managed Postgres providers |
| Tembo Vector | Optimized Postgres + pgVector/pg_embedding | Pinecone, ChromaDB |
| Tembo Data Warehouse | Optimized Postgres + columnar | Snowflake |
| Tembo Documents | Optimized Postgres + FerretDB | MongoDB, AWS DocumentDB |
| Tembo ML | Optimized Postgres + PostgresML | MindsDB |
| Tembo Messaging | Optimized Postgres + pgmq | Redis, SQS |
| Tembo Search | Optimized Postgres + ZomboDB + Text Search Extensions | Elastic |
| Tembo Timeseries | Optimized Postgres + Timescale | InfluxDB |

![Create cluster](create_cluster.jpg)

## What is a Tembo Stack?

Stacks are pre-built, use case-specific configurations of Postgres, enabling you to quickly deploy specialized data services that can replace external, non-Postgres data services. They include:

- Docker Base Image (Postgres Container)
- Pre-Installed Extensions
- Stack-Specific additional metrics, alerts + recommendations
- Stack-Optimized Postgres Configs
- Dynamic Config Engine
- Sidecars (Kubernetes Services - i.e. nearby workloads)
- Infrastructure and hardware configuration options - things like the HA setup, pgbouncer/pgcat (server-side connection pooling), etc.

## Users

Initial users for our platform are application developers using or intending to use self-managed Postgres deployments, specifically those interested in maintaining the native open-source version. Tembo replaces self-managed Postgres clusters in the cloud or on-prem.

Our inital set of users are interested in one of two key propositions:

1. Developer-first workflows for use-cases, facilitating complete data model lifecycle control.
2. Prioritizing the expansive Postgres extension ecosystem for add-on integration and usage.

Fast database deployment and automatic migration enable high developer satisfaction and swift value realization. We plan to be aligned with the Postgres open-source principles of the Postgres community.

The channel of distribution is a fully-managed cloud service, providing enterprise-level hybrid multi-cloud solutions.

## Bottom Line

Postgres is the most universally loved databases for developers, teams, and enterprises of all sizes. Tembo can become the new de facto standard for deploying and managing databases for developers and companies of all sizes, changing the paradigm of how developers interact and build databases, and unlocking the power of Postgres to all developers.
