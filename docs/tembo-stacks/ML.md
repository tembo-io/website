---
sidebar_position: 2
---

# Enterprise Machine Learning Stack

Machine learning significantly enhances the features and capabilities of applications. The Enterprise Machine Learning Stack is a Postgres cluster with the latest machine learning and large language model toolchains pre-installed and enabled.

## Extensions

- [postgresml](https://pgt.dev/extensions/postgresml) - `pgml` allows you to train and run machine learning models in Postgres. It supports a variety of models and algorithms, including linear regression, logistic regression, decision tree, random forest, and k-means clustering. It also provides hooks into HuggingFace for downloading and consuming pre-training models and transformers.
- [pgvector](https://pgt.dev/extensions/pgvector) - `pgvector` is a vector similarity search engine for Postgres. It is typically used for storing embedding and then conducting vector search on that data.
- [pg_embedding](https://pgt.dev/extensions/pg_embedding) - an alternative to `pgvector` and provides similar functionality.
- [pg_vectorize](https://pgt.dev/extensions/vectorize) - an orchestration layer for embedding generation and store, vector search and index maintenance. It provides a simple interface for generating embeddings from text, storing them in Postgres, and then searching for similar vectors using `pgvector`.

The extensions listed above are all very flexible and support many use cases. Visit their documentation pages for additional details.

## Getting started

We will build a simple vector search application using `pg_vectorize`, which is powered by [OpenAI](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key) and [pgvector](https://github.com/pgvector/pgvector).

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

### Create a vectorize job

Create a job to vectorize the products table. Give the job a name, we'll call it `product_search` in this example. Specify the table's primary key (`product_id`) and the columns that we want to search (`product_name` and `description`).

Provide the OpenAI API key for the job.

```sql
SELECT vectorize.table(
    job_name => 'product_search',
    "table" => 'products',
    primary_key => 'product_id',
    columns => ARRAY['product_name', 'description'],
    args => '{"api_key": "your-openai-key"}'
);
```

By default, this job will run to generate and update embeddings every minute based on the `last_updated_at` column. This update process is triggered by a `pg_cron`, which is setup for your automatically by `pg_vectorize`. If there are updates to the `products` table, the next job run will subsequently update the embeddings accordingly.

By default, this will add two columns to your table; `<job_name>_embeddings` and `<job_name>_updated_at`.

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name   = 'products';
```

```text
        column_name
---------------------------
 product_id
 product_name
 description
 last_updated_at
 product_search_embeddings  <--- embeddings
 product_search_updated_at  <--- embeddings last updated at
```

### Manually trigger embedding generation

We can manually trigger the update, or wait for the cron job to do it

```sql
-- manually trigger the refresh
SELECT vectorize.job_execute('product_search');
```

### Search for similar products

Now that we have generated embeddings for our products, we can search for similar products using the extension.

```sql
SELECT * FROM vectorize.search(
    job_name => 'product_search',
    return_col => 'product_name',
    query => 'accessories for mobile devices',
    api_key => 'your-openai-key"',
    num_results => 3
);
```

```text
                                          search_results
--------------------------------------------------------------------------------------------------
 {"value": "Phone Charger", "column": "product_name", "similarity_score": 0.8530797672121025}
 {"value": "Tablet Holder", "column": "product_name", "similarity_score": 0.8284493388477342}
 {"value": "Bluetooth Speaker", "column": "product_name", "similarity_score": 0.8255034841826178}
```

Great! Our query returned the top 3 most similar products to our query, along with the score for each product.

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

### Tuning performance with indexes

When you have tens of thousands of rows, your query performance will improve by adding an index. See the [pgvector documentation](https://github.com/pgvector/pgvector#indexing) to tune the index for your use case.s

```sql
CREATE INDEX ON products USING ivfflat (product_search_embeddings vector_cosine_ops) WITH (lists = 100);
```
