---
title: Getting Started
sideBarTitle: Getting Started
sideBarPosition: 1
description: An introduction to the Tembo VectorDB Stack
tags: [postgres, vectordb, ai]
---

The Tembo VectorDB Stack is a platform that simplifies the process of working with embeddings in Postgres.
It provides tools to automate the process of generating, managing, and working with embeddings from your existing data, giving you vector search capabilities on day one.

## Technical specifications

### Extensions

-   `pg_stat_statements` provides statistics on SQL statements executed by the database. It helps users analyze query performance and identify areas for optimization.
-   [pg_vectorize](https://github.com/tembo-io/pg_vectorize) provides a simple interface to generate embeddings from text, store them in Postgres, and then search for similar vectors using `pgvector`.
-   [pgvector](https://github.com/pgvector/pgvector) is a vector similarity search engine for Postgres. It is used to store embeddings, create indexes, and conduct vector searches on that data. `pg_vectorize` relies on `pgvector` for indices and similiary search.
-   [pgmq](https://github.com/tembo-io/pgmq) is used by `pg_vectorize` as a job queue for managing and separating the calculation of embeddings from source data.
-   [pg_cron](https://github.com/citusdata/pg_cron) is used by `pg_vectorize` to schedule recurring updates to embeddings.
-   Extensions from [Trunk](https://pgt.dev) can be installed on-demand.

### Container services

The VectorDB Stack deploys a container in the same Kubernetes namespace as your Postgres database to host text embedding models.

When embeddings need to be computed, `pg_vectorize` sends a HTTP request to this container. This container hosts any [SentenceTransformers](https://www.sbert.net/) models as well as any private models uploaded to Hugging Face. The models are downloaded to this container on-demand and cached for all subsequent requests.

The container is private to your Tembo instance.

Additional technical specs of this container can be found in the [VectorDB Stack Specification](https://github.com/tembo-io/tembo/blob/bbb464870101a6e310477036b1dca0b1d3c3c0eb/tembo-stacks/src/stacks/specs/vectordb.yaml#L11-L60).

## Getting started

The VectorDB Stack comes pre-configured for building applications that require embeddings.

The fastest way to build applications on text embeddings is to use the `pg_vectorize` Postgres extension.

This extension provides a consistent interface for generating embeddings from many common text embedding model sources including OpenAI and Hugging Face, as well as searching the embeddings and keeping them up-to-date.

The general flow is to first call `vectorize.table()` on your source data table to initialize the process. This can be done in a SQL migration.

This configures `pg_vectorize` to generate embeddings from data in that table, keeps track of which transformer model was used to generate embeddings, and watches for updates to the table to update embeddings.

Then, you'll need to call `vectorize.search()` to search for similar embeddings based on a query and return the source data that is most similar to the query.

The extension handles the transformation of the query into embeddings and the search for similar embeddings in the table.

Let's get started!

You'll want to begin by connecting to your Postgres instance.

```sql
psql 'postgresql://postgres:<your-password>@<your-host>:5432/postgres'
```

### Setup

`vectorize.table()` works with ANY model that can be loaded via the [SentenceTransformers()](https://www.sbert.net/) API so long as it does not require any additional code execution (which includes most open source sentence transformers).

To get started, setup a products table. Copy from the example data provided by the extension.

```sql
CREATE TABLE products (LIKE vectorize.example_products INCLUDING ALL);
INSERT INTO products SELECT * FROM vectorize.example_products;
```

```sql
SELECT * FROM products LIMIT 2;
```

```text
 product_id | product_name |                      description                       |        last_updated_at
------------+--------------+--------------------------------------------------------+-------------------------------
          1 | Pencil       | Utensil used for writing and often works best on paper | 2023-07-26 17:20:43.639351-05
          2 | Laptop Stand | Elevated platform for laptops, enhancing ergonomics    | 2023-07-26 17:20:43.639351-05
```

## Initializing a vectorize job using OpenAI

Create a job to vectorize the products table. This will generate embeddings for all records in this table. We'll specify the tables primary key (`product_id`)
 and the columns that we want to search (`product_name` and `description`), and use OpenAI's models to generate embeddings.
 Note that it is possible to generate embeddings from other sources in addition to OpenAI, such as open source models available on Hugging Face.

## Using OpenAI embedding models

`pg_vectorize` also works with using OpenAI's embeddings, but first you'll need an [OpenAI API key](https://platform.openai.com/docs/guides/embeddings).

Start by setting your API key as a Postgres configuration parameter.

```sql
ALTER SYSTEM SET vectorize.openai_key TO '<your api key>';

SELECT pg_reload_conf();
```

Create an example table if it does not already exist.

```sql
CREATE TABLE products (LIKE vectorize.example_products INCLUDING ALL);
INSERT INTO products SELECT * FROM vectorize.example_products;
```

Then create the job:

```sql
SELECT vectorize.table(
    job_name => 'product_search_openai',
    "table" => 'products',
    primary_key => 'product_id',
    columns => ARRAY['product_name', 'description'],
    transformer => 'openai/text-embedding-ada-002',
    schedule => 'realtime'
);
```

It may take some time to generate embeddings, depending on API latency.
 By default, an HNSW index is created on the embeddings.

## Searching embeddings with a raw text query

We can search this data using `vectorize.search()`.
 By specifying the `job_name` and `query`, we can search for similar embeddings in the table using
 exactly the same model that was used to create embeddings.

```sql
SELECT * FROM vectorize.search(
    job_name => 'product_search_openai',
    query => 'accessories for mobile devices',
    return_columns => ARRAY['product_id', 'product_name'],
    num_results => 3
);
```

```text
                                         search_results

--------------------------------------------------------------------------------------------
----
 {"product_id": 13, "product_name": "Phone Charger", "similarity_score": 0.8564681325237845}
 {"product_id": 24, "product_name": "Tablet Holder", "similarity_score": 0.8295988934993099}
 {"product_id": 4, "product_name": "Bluetooth Speaker", "similarity_score": 0.8250355616233103}
(3 rows)
```

## Generating Embeddings Directly

You can also generate embeddings directly using `vectorize.encode()`.

```sql
select vectorize.encode(
    input => 'mobile electronic accessories',
    model => 'openai/text-embedding-ada-002'
);
```

## How it works

When `vectorize.table()` is executed, the extension creates jobs in [pgmq](https://github.com/tembo-io/pgmq) to generate embeddings for your existing data.

These jobs are executed by a background worker in Postgres. The background worker calls the appropriate embedding model, whether it's coming from Hugging Face or OpenAI.

`vectorize.search()` transforms the raw text query into embeddings using the same model that was used to generate the embeddings in the first place.

It then uses the `pgvector` extension to search for the most similar embeddings in the table and returns the results in a JSON format to the caller.

Updates to the table will result in new embeddings created, as determined by the `schedule` parameter and most behaviors are [configurable](./configuration).

## Support

Join the Tembo Community [in Slack](https://join.slack.com/t/tembocommunity/shared_invite/zt-293gc1k0k-3K8z~eKW1SEIfrqEI~5_yw) to ask a question or see how others are building on [https://cloud.tembo.io](Tembo).
