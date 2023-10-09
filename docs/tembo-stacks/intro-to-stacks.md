---
sidebar_position: 1
---

# Introduction to Stacks

## Why Stacks?

Adopting a new database adds signficant complexity and costs to an engineering organization. Organizations spend a huge amount of time evaluating, benchmarking or migrating databases and setting up complicated pipelines keeping those databases in sync.

Most of these use cases can be served by Postgres, thanks to it's stability, feature completeness and extensibility. However, optimizing Postgres for each use case is a non-trivial task and requires domain expertise, use case understanding and deep Postgres expertise making it hard for most developers to adopt this.

Tembo Stacks solve that problem by providing pre-built, use case optimized Postgres deployments.

## Introduction to Stacks

A tembo stack is a pre-built, use case specific Postgres deployment which enables you to quickly deploy specialized data services that can replace external, non-Postgres data services. They help you avoid the pains associated with adopting, operationalizing, optimizing and managing new databases.

|Name|Replacement for|
|----|---------------|
|[Tembo OLTP](oltp.md)| Amazon RDS |
|[Tembo Enterprise LLM](enterprise-llm.md)| Pinecone, ChromaDB |
|[Tembo Message Queue](message-queue.md)| Amazon SQS, RabbitMQ, Redis |
|[Tembo Data Warehouse](olap.md)| Snowflake, Bigquery |

## Anatomy of a Stack

A stack consists includes a number of components which are optimized for a particular use case. A stack includes:

* Docker Base Image containing a particular version of Postgres.
* Curated Set of extensions which turn Postgres into best-in-class for that workload.
* Hardware (CPU::Memory ratios, Storage tiers) optimized for the workload.
* Postgres configs optimized according to hardware and use cases.
* Use case specific metrics, alerts and recommendations.
* On-instance application deployments to add additional tools required for the use case.

