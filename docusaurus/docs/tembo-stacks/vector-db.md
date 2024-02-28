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

## Using Hugging Face sentence transformers

Setup a products table. Copy from the example data provided by the extension.

```sql
CREATE TABLE products AS 
SELECT * FROM vectorize.example_products;
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
    transformer => 'sentence-transformers/multi-qa-MiniLM-L6-dot-v1'
);
```

This adds a new column to your table, in our case it is named `product_search_embeddings`, then populates that data with the transformed embeddings from the `product_name` and `description` columns.

Then search,

```sql
SELECT * FROM vectorize.search(
    job_name => 'product_search_hf',
    query => 'accessories for mobile devices',
    return_columns => ARRAY['product_id', 'product_name'],
    num_results => 3
);

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
CREATE TABLE products AS 
SELECT * FROM vectorize.example_products;
```

Then create the job:

```sql
SELECT vectorize.table(
    job_name => 'product_search_openai',
    "table" => 'products',
    primary_key => 'product_id',
    columns => ARRAY['product_name', 'description'],
    transformer => 'text-embedding-ada-002'
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

                                         search_results                                     
    
--------------------------------------------------------------------------------------------
----
 {"product_id": 13, "product_name": "Phone Charger", "similarity_score": 0.8564681325237845}
 {"product_id": 24, "product_name": "Tablet Holder", "similarity_score": 0.8295988934993099}
 {"product_id": 4, "product_name": "Bluetooth Speaker", "similarity_score": 0.8250355616233103}
(3 rows)
```

## Changing the database

By default, `vectorize` is configured to run on the `postgres` database, but that can be changed to any database in Postgres.

Update the following configuration parameters so that the corresponding background workers connect to the correct database.

```sql
ALTER SYSTEM SET cron.database_name TO 'my_new_db';
ALTER SYSTEM SET vectorize.host TO 'postgresql://postgres?host=/controller/run&dbname=my_new_db';
```

Then, restart postgres

```sql
CREATE EXTENSION vectorize CASCADE;
```


## How it works


When `vectorize.table()` is executed, the extension creates jobs in [pgmq](https://github.com/tembo-io/pgmq) that are executed by the background worker.
 The background worker calls the appropriate embedding model, whether thats one coming from Hugging Face or OpenAI.
 By default, triggers are created that also update the embeddings any time a new record is inserted into the table or
 if a record is updated.

`vectorize.search()` transforms the raw text query into embeddings using the same model that was used to generate the embeddings in the first place.
 It then uses the `pgvector` extension to search for the most similar embeddings in the table,
 and returns the results in a JSON format to the caller.


## Support

Join the Tembo Community [in Slack](https://join.slack.com/t/tembocommunity/shared_invite/zt-293gc1k0k-3K8z~eKW1SEIfrqEI~5_yw) to ask a question or see how others are building on [https://cloud.tembo.io](Tembo).
