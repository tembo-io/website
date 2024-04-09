---
title: VectorDB
sideBarTitle: VectorDB
sideBarPosition: 201
description: An introduction to the Tembo VectorDB Stack
---

Tembo VectorDB Stack is a platform that simplifies the process of working with embeddings in Postgres.
 It provides tools to automate the process of generating, managing and working with embeddings from your existing data, which allows you to have vector search capabilities on day one.

## Technical Specifications

### Extensions

- [pg_vectorize](https://github.com/tembo-io/pg_vectorize) provides a simple interface for generating embeddings from text, storing them in Postgres, and then searching for similar vectors using `pgvector`.
- [pgvector](https://github.com/pgvector/pgvector) is a vector similarity search engine for Postgres. It is used for storing embeddings, creating indexes, and conducting vector search on that data. pg_vectorize relies on pgvector for indices and similiary search.
- [pgmq](https://github.com/tembo-io/pgmq) - pg_vectorize utilizes pgmq as a job queue for managing the calculating embeddings from source data. The lives in the VectorDB and provides a means of separating the compute of embeddings from the database.
- [pg_cron](https://github.com/citusdata/pg_cron) is utilized by pg_vectorize to schedule recurring updates to embeddings.

### Container Services

The VectorDB Stack is deployed on Kubernetes and runs a container in the same namespace as your Postgres database to host text embedding models.
 When embeddings need to be computed, pg_vectorize makes HTTP to this container. This container hosts any [SentenceTransformers](https://www.sbert.net/) model.
 The specifics of this container can be found in the [VectorDB Stack Specification](https://github.com/tembo-io/tembo/blob/bbb464870101a6e310477036b1dca0b1d3c3c0eb/tembo-stacks/src/stacks/specs/vectordb.yaml#L11-L60).

## Getting started

The VectorDB Stack comes pre-configured to build applications that require text embeddings.
 The fastest way to build applications on text embeddings is to use the pg_vectorize extension.
 The extension provides a consistent interface to generating embeddings from many common text embedding model sources including OpenAI, and Hugging Face.

The general flow is to first call `vectorize.table()` on your source data table to generate embeddings.
This configures pg_vectorize to generate embeddings from data in that table, keeps track of which transformer model was used to generate embeddings, and watches for updates to the table to update embeddings.
 Then, you can call `vectorize.search()` to search for similar embeddings based on a query and return the source data that is most similar to the query.
 The extension handles the transformation of the query into embeddings and the search for similar embeddings in the table.

First, connect to your Postgres instance.

```sql
psql 'postgresql://postgres:<your-password>@<your-host>:5432/postgres'
```

## Using Hugging Face sentence transformers

`vectorize.table()` works with ANY model that can be loaded via the [SentenceTransformers()](https://www.sbert.net/) API so long as it does not require any additional code execution (which is most open source sentence transformers).

To get started, setup a products table. Copy from the example data provided by the extension.

```sql
CREATE TABLE products (LIKE vectorize.example_products INCLUDING ALL);
INSERT INTO products SELECT * FROM vectorize.example_products;
```

```sql
SELECT * FROM products limit 2;
```

```text
 product_id | product_name |                      description                       |        last_updated_at
------------+--------------+--------------------------------------------------------+-------------------------------
          1 | Pencil       | Utensil used for writing and often works best on paper | 2023-07-26 17:20:43.639351-05
          2 | Laptop Stand | Elevated platform for laptops, enhancing ergonomics    | 2023-07-26 17:20:43.639351-05
```

Create a job to vectorize the products table. We'll specify the tables primary key (product_id) and the columns that we want to search (product_name and description).

```sql
SELECT vectorize.table(
    job_name => 'product_search_hf',
    "table" => 'products',
    primary_key => 'product_id',
    columns => ARRAY['product_name', 'description'],
    schedule => 'realtime',
    transformer => 'sentence-transformers/all-MiniLM-L12-v2'
);
```

### Private models from Hugging Face

If you've uploaded a [private model](https://huggingface.co/blog/introducing-private-hub) to Hugging Face, you can still host it on Tembo Cloud. Simply reference your Hugging Face org and model name,
and pass the API key in as an `arg` to `vectorize.table()`.

```sql
SELECT vectorize.table(
    job_name => 'product_search_hf',
    "table" => 'products',
    primary_key => 'product_id',
    columns => ARRAY['product_name', 'description'],
    transformer => 'my-hugging-face-org/my-private-model',
    schedule => 'realtime',
    args => '{"api_key": "hf_my_private_api_key"}'
);
```

Then search,

```sql
SELECT * FROM vectorize.search(
    job_name => 'product_search_hf',
    query => 'accessories for mobile devices',
    return_columns => ARRAY['product_id', 'product_name'],
    num_results => 3
);
```

```text
                                       search_results
---------------------------------------------------------------------------------------------
 {"product_id": 13, "product_name": "Phone Charger", "similarity_score": 0.8147814132322894}
 {"product_id": 6, "product_name": "Backpack", "similarity_score": 0.7743061352550308}
 {"product_id": 11, "product_name": "Stylus Pen", "similarity_score": 0.7709902653575383}
```

## Using OpenAI embedding models

pg_vectorize also works with using OpenAI's embeddings, but first you'll need an API key.

- [openai API key](https://platform.openai.com/docs/guides/embeddings)

Set your API key as a Postgres configuration parameter.

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

## Changing the configured database

By default, `vectorize` is configured to run on the `postgres` database, but that can be changed to any database in Postgres.
 Update the following configuration parameters so that the corresponding background workers connect to the correct database.
 Both pg_vectorize and pg_cron will need their configuration updated.
 This can be done by running the following SQL commands.

```sql
ALTER SYSTEM SET cron.database_name TO 'my_new_db';
ALTER SYSTEM SET vectorize.database_name TO 'my_new_db';
```

Then, restart postgres to apply the changes and, if you haven't already, enable the extension in your new database.

```sql
CREATE EXTENSION vectorize CASCADE;
```

## Updating embeddings

Embeddings are immediately computed for your data when `vectorize.table()` is called.
However, a time will come when rows are updated or inserted and result in the need for embeddings to be updated.
 pg_vectorize supports two methods of keeping embeddings up-to-date; trigger based and a recurring interval.
 This behavior is configured by setting the `schedule` parameter on `vecotrize.table()`.
 The default behavior is a cron-like syntax `schedule => '* * * * *'` which checks for new rows or updates to existing rows every minute.

 In both cases, the `schedule` parameter determines how new or updates rows or identified and results in jobs enqueued to pgmq to update the embeddings.

### Using triggers

Setting the parameter `schedule => 'realtime'` will create triggers on the table to create embedding update jobs whenever a new row is inserted or an existing row is updated.

```sql
SELECT vectorize.table(
    job_name => 'my_search_project',
    "table" => 'products',
    primary_key => 'product_id',
    columns => ARRAY['product_name', 'description'],
    transformer => 'sentence-transformers/all-MiniLM-L12-v2',
    schedule => 'realtime'
);
```

### Interval updates with pg_cron

The schedule parameter accepts a cron-like syntax to check for updates on a recurring basis.
 For example, to check for updates every hour, set the schedule parameter to `0 * * * *`.
 Using this method, you will also be required to provide the column that contains the last updated timestamp.
 pg_vectorize uses this column to determine which rows have been updated since the last time the embeddings were updated.

```sql
SELECT vectorize.table(
    job_name => 'my_search_project',
    "table" => 'products',
    primary_key => 'product_id',
    columns => ARRAY['product_name', 'description'],
    transformer => 'sentence-transformers/all-MiniLM-L12-v2',
    update_col => 'last_updated_at',
    schedule => '0 * * * *'
);
```

The cron job can then be viewwed by running the following SQL command.

```sql
select command, jobname from cron.job where jobname = 'my_search_project';
```

```text
                      command                      |      jobname      
---------------------------------------------------+-------------------
 select vectorize.job_execute('my_search_project') | my_search_project
```

### On-demand updates

If you need to update the embeddings on an ad-hoc basis, you can do so by calling `vectorize.job_execute()`.

```sql
SELECT vectorize.job_execute('my_search_project');
```

## Embedding Locations

Embeddings can be created either on the same table as the source data, or on a separate table in the `vectorize` schema.
The `table_method` parameter determines where the embeddings are stored, and the default is `table_method => 'join'`,
 which creates a table in the `vectorize` schema named `_embeddings_<project_name>` for each vectorize job.
 For example, if you create a job named `my_search_project`, the embeddings will be stored in a table named `vectorize._embedding_my_search_project`.
 Alternatively, pg_vectorize can be configured to create the embeddings on the same table as the source data.
 By setting the `table_method => 'append'`, pg_vectorize will create two columns on the source table, one for the embedding and one for the updated-at timestamp.

### Separate table

The default behavior is `table_method => 'join'`, and creates a new table in the `vectorize` schema to store the embeddings.

```sql
SELECT vectorize.table(
    job_name => 'my_search_project',
    "table" => 'products',
    primary_key => 'product_id',
    columns => ARRAY['product_name', 'description'],
    transformer => 'sentence-transformers/all-MiniLM-L12-v2',
    table_method => 'join'
);
```

```text
postgres=# \d vectorize._embeddings_my_search_project;
            Table "vectorize._embeddings_my_search_project"
   Column   |           Type           | Collation | Nullable | Default 
------------+--------------------------+-----------+----------+---------
 product_id | integer                  |           | not null | 
 embeddings | vector(384)              |           | not null | 
 updated_at | timestamp with time zone |           | not null | now()
Indexes:
    "_embeddings_my_search_project_product_id_key" UNIQUE CONSTRAINT, btree (product_id)
    "my_search_project_idx" hnsw (embeddings vector_cosine_ops)
Foreign-key constraints:
    "_embeddings_my_search_project_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
```

### New columns, same table

To create the embeddings on the same table as the source data, set the `table_method` parameter to `append`.

```sql
SELECT vectorize.table(
    job_name => 'my_search_project',
    "table" => 'products',
    primary_key => 'product_id',
    columns => ARRAY['product_name', 'description'],
    transformer => 'sentence-transformers/all-MiniLM-L12-v2',
    table_method => 'append'
);
```

Note two new columns; `my_search_project_embeddings` and `my_search_project_updated_at` have been added to the table.

```text
postgres=# \d products
                                                             Table "public.products"
            Column            |           Type           | Collation | Nullable |                            Default                             
------------------------------+--------------------------+-----------+----------+----------------------------------------------------------------
 product_id                   | integer                  |           | not null | nextval('vectorize.example_products_product_id_seq'::regclass)
 product_name                 | text                     |           | not null | 
 description                  | text                     |           |          | 
 last_updated_at              | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 my_search_project_embeddings | vector(384)              |           |          | 
 my_search_project_updated_at | timestamp with time zone |           |          | 
Indexes:
    "products_pkey" PRIMARY KEY, btree (product_id)
    "my_search_project_idx" hnsw (my_search_project_embeddings vector_cosine_ops)
```

## Ad-hoc embedding requests

Any text can be transformed into an embedding using `vectorize.transform_embeddings()`.

This works with any of the sentence-transformers:

```sql
select vectorize.transform_embeddings(
    input => 'the quick brown fox jumped over the lazy dogs',
    model_name => 'sentence-transformers/multi-qa-MiniLM-L6-dot-v1'
);
```

```text
{-0.2556323707103729,-0.3213586211204529 ..., -0.0951206386089325}
```

Privately hosted models on hugging face:

```sql
select vectorize.transform_embeddings(
    input => 'the quick brown fox jumped over the lazy dogs',
    model_name => 'my-private-org/my-private-model',
    api_key => 'your Hugginf Face key'
)
```

And OpenAI models.

For OpenAI requests, you can either set the API key as a Postgres configuration parameter or pass it in as an argument.
 Passing it as an argument will override the configuration parameter.

As an argument:

```sql
select vectorize.transform_embeddings(
    input => 'the quick brown fox jumped over the lazy dogs',
    model_name => 'openai/text-embedding-ada-002',
    api_key => 'your OpenAI API key'
)
```

You do not need to provide the API key as an argument if it already been set via `ALTER SYSTEM SET vectorize.openai_key`.

```sql
select vectorize.transform_embeddings(
    input => 'the quick brown fox jumped over the lazy dogs',
    model_name => 'openai/text-embedding-ada-002'
)
```

## How it works

When `vectorize.table()` is executed, the extension creates jobs in [pgmq](https://github.com/tembo-io/pgmq) to generate embeddings for your existing data.
 These jobs are executed by a background worker in Postgres. The background worker calls the appropriate embedding model, whether thats one coming from Hugging Face or OpenAI.

`vectorize.search()` transforms the raw text query into embeddings using the same model that was used to generate the embeddings in the first place.
It then uses the `pgvector` extension to search for the most similar embeddings in the table,
and returns the results in a JSON format to the caller.

## Support

Join the Tembo Community [in Slack](https://join.slack.com/t/tembocommunity/shared_invite/zt-293gc1k0k-3K8z~eKW1SEIfrqEI~5_yw) to ask a question or see how others are building on [https://cloud.tembo.io](Tembo).
