---
sideBarPosition: 0
sideBarTitle: Overview
title: Apps Overview
---

Postgres is renowned for its extensibility, and we're excited to leverage Kubernetes to take it a step further by introducing modular, containerized applications!

These Tembo-hosted Apps can be understood as software that lives next to and interact with your Postgres database. More specifically, an App is a Kubernetes resource specification that is managed by the Tembo Operator. Within the [yaml instructions](https://github.com/tembo-io/tembo/tree/main/tembo-stacks/src/apps), you can find some (or all) of the following:

- Containerized image
- Trunk-powered extension installation
- Postgres configurations

In addition to the Apps already provided, you have the power to [create your own Apps](https://tembo.io/docs/product/cloud/apps/custom) and take your projec to new heights.

## Available Apps

| App                                                                               | Summary                                          |
| --------------------------------------------------------------------------------- | ------------------------------------------------ |
| [Connection pooler](https://tembo.io/docs/product/cloud/apps/connection-pooler)   | Application-to-Postgres connection management.   |
| [REST API](https://tembo.io/docs/product/cloud/apps/rest-api)                     | HTTP interface to your Postgres database.        |
| [GraphQL](https://tembo.io/docs/product/cloud/apps/graphql)                       | Query language for APIs.                         |
| [pganalyze](https://tembo.io/docs/product/cloud/apps/pganalyze)                   | Advanced metrics.                                |
| [Embeddings](https://tembo.io/docs/product/cloud/apps/embeddings)                 | Text-to-embeddings API.                          |
| [Custom](https://tembo.io/docs/product/cloud/apps/custom)                         | User-defined Apps.                               |

