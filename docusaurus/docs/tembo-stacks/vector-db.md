---
sidebar_position: 3
---

# Tembo Vector DB

Tembo's Vector Database provides tooling to automate the process of generating embeddings on your existing data, which allows you to have vector search semantic search capabilities on day one.

## Extensions

- [pgvector](https://pgt.dev/extensions/pgvector) - `pgvector` is a vector similarity search engine for Postgres. It is typically used for storing embeddings and then conducting vector search on that data.
- [pg_vectorize](https://pgt.dev/extensions/vectorize) - `pg_vectorize` is an orchestration layer for embedding generation and store, vector search and index maintenance. It provides a simple interface for generating embeddings from text, storing them in Postgres, and then searching for similar vectors using `pgvector`.
- [pgmq](https://pgt.dev/extensions/pgmq) - `pgmq` implements a message queue with API parity with popular message queue services like AWS SQS and Redis RSMQ.
- [pg_cron](https://pgt.dev/extensions/pg_cron) - `pg_cron` automates database tasks within PostgreSQL, enabling scheduled maintenance, recurring tasks, and interval-based SQL queries.


## Getting started

We will build a simple vector search database application using [pg_vectorize](https://github.com/tembo-io/pg_vectorize), Tembo's high level Postgres API which automated the transformation of text to embeddings and the management of embeddings in your database. It is powered by [OpenAI](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key), [pgvector](https://github.com/pgvector/pgvector), [pgmq](https://github.com/tembo-io/pgmq), and [pg_cron](https://github.com/citusdata/pg_cron).

### Setup

First, you will need to acquire an API key from [OpenAI](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key).

Then, connect to your Tembo cluster:

```sql
psql 'postgresql://postgres:<your-password>@<your-host>:5432/postgres'
```

Create a table using the example dataset.

```sql
CREATE TABLE products AS
SELECT * FROM vectorize.example_products;
```

The table contains products along with their descriptions. Our application will allow us to easily search the table.

```sql
SELECT * FROM products limit 2;
```

```text
 product_id | product_name |                      description                       |        last_updated_at
------------+--------------+--------------------------------------------------------+-------------------------------
          1 | Pencil       | Utensil used for writing and often works best on paper | 2023-07-26 17:20:43.639351-05
          2 | Laptop Stand | Elevated platform for laptops, enhancing ergonomics    | 2023-07-26 17:20:43.639351-05
```

### Set your API key as a Postgres parameter

```sql
ALTER SYSTEM SET vectorize.openai_key TO '<your api key>';
```

Restart postgres so that the parameter takes effect.

### Create a vectorize job

Create a job to vectorize the products table. Give the job a name, we'll call it `product_search` in this example. Specify the table's primary key (`product_id`) and the columns that we want to search (`product_name` and `description`).

Provide the OpenAI API key for the job.

```sql
SELECT vectorize.table(
    job_name => 'product_search',
    "table" => 'products',
    primary_key => 'product_id',
    columns => ARRAY['product_name', 'description'],
);
```

### Search your data

Depending on the size of your data, it could take a few minutes to generate embeddings.

```sql
SELECT vectorize.job_execute('product_search');
```


Specify the `job_name`, this must match what we specified in the previous step. Provide a raw text query to search our data. `return_columns` specifies the columns from the table that we want to return. `num_results` specifies the number of results to return.

```sql
SELECT * FROM vectorize.search(
    job_name => 'product_search',
    query => 'accessories for mobile devices',
    return_columns => ARRAY['product_id', 'product_name'],
    num_results => 3
);
```

```console
                                          search_results
--------------------------------------------------------------------------------------------------
 {"value": "Phone Charger", "column": "product_name", "similarity_score": 0.8530797672121025}
 {"value": "Tablet Holder", "column": "product_name", "similarity_score": 0.8284493388477342}
 {"value": "Bluetooth Speaker", "column": "product_name", "similarity_score": 0.8255034841826178}
```

Great! Our query returned the top 3 most similar products to our query, along with the score for each product.

### How it works

By default, this job will run to generate and update embeddings every minute based on the `last_updated_at` column. This update process is triggered by a `pg_cron`, which is setup for your automatically by `pg_vectorize`. If there are updates to the `products` table, the next job run will subsequently update the embeddings accordingly. Tasks are enqueued into a [pgmq](https://github.com/tembo-io/pgmq) queue and processed by a configurable background worker.

By default, this will add two columns to your table: `<job_name>_embeddings` and `<job_name>_updated_at`.

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name   = 'products';
```

```console
        column_name
---------------------------
 product_id
 product_name
 description
 last_updated_at
 product_search_embeddings  <--- embeddings
 product_search_updated_at  <--- embeddings last updated at
```

### Stopping the job

`pg_vectorize` will continuously update the embeddings for your table. If you want to stop the job, you can do so by running:

```sql
UPDATE cron.job
SET active = false
WHERE job_name = 'product_search';
```

You can reenable the job by running:

```sql
UPDATE cron.job
SET active = true
WHERE job_name = 'product_search';
```
