---
sidebar_position: 1
---

# Introduction to Stacks

## Why Stacks?

Adopting a new database adds significant complexity and costs to an engineering organization. Organizations spend a huge amount of time evaluating, benchmarking or migrating databases and setting up complicated pipelines keeping those databases in sync.

Most of these use cases can be served by Postgres, thanks to its stability, feature completeness and extensibility. However, optimizing Postgres for each use case is a non-trivial task and requires domain expertise, use case understanding and deep Postgres expertise, making it hard for most developers to adopt this.

Tembo Stacks solve that problem by providing pre-built, use case optimized Postgres deployments.

A tembo stack is a pre-built, use case specific Postgres deployment which enables you to quickly deploy specialized data services that can replace external, non-Postgres data services. They help you avoid the pains associated with adopting, operationalizing, optimizing and managing new databases.

|Name|Replacement for|
|----|---------------|
|[Data Warehouse](datawarehouse.md)| Snowflake, Bigquery |
|[Geospatial](geospatial.md)| ESRI, Oracle |
|[OLTP](oltp.md)| Amazon RDS |
|[OLAP](olap.md)| Snowflake, Bigquery |
|[Machine Learning](machine-learning.md)| MindsDB |
|[Message Queue](message-queue.md)| Amazon SQS, RabbitMQ, Redis |
|[Mongo Alternative on Postgres](mongo-alternative.md)| MongoDB |
|[RAG](rag.md)| LangChain |
|[Standard](standard.md)| Amazon RDS |
|[Vector DB](vector-db.md)| Pinecone, Weaviate |
|[Time Series](timeseries.md)| InfluxDB, TimescaleDB |

We are actively working on additional Stacks. Check out the [Tembo Roadmap](https://roadmap.tembo.io/roadmap) and upvote the stacks you'd like to see next.

## Anatomy of a Stack

A stack consists of a number of components that are optimized for a particular use case. A stack includes:

* Docker Base Image containing a particular version of Postgres.
* Curated Set of extensions which turn Postgres into best-in-class for that workload.
* Hardware (CPU::Memory ratios, Storage tiers) optimized for the workload.
* Postgres configs optimized according to hardware and use cases.
* Use case specific metrics, alerts and recommendations.
* On-instance application deployments to add additional tools required for the use case.
