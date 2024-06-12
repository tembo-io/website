---
title: Advanced Configuration
sideBarTitle: Advanced What??
sideBarPosition: 6
description: Configuring the VectorDB Instance
tags: [postgres, vectordb, ai]
---

There are a number of additional configuration parameters available in `vectorize` that determine the extension's behavior.

### Embedding locations

Embeddings can be created either on the same table as the source data, or on a separate table in the `vectorize` schema.

The `table_method` parameter determines where the embeddings are stored, and the default is `table_method => 'join'`, which creates a table in the `vectorize` schema named `_embeddings_<project_name>` for each `vectorize` job.

For example, if you create a job named `my_search_project`, the embeddings will be stored in a table named `vectorize._embedding_my_search_project`.

Alternatively, `pg_vectorize` can be configured to create the embeddings on the same table as the source data.

By setting the `table_method => 'append'`, pg_vectorize will create two columns on the source table: one for the embedding, and one for the updated-at timestamp.

### Separate table

The default behavior is `table_method => 'join'`, and a new table is created in the `vectorize` schema to store the embeddings.

```sql
SELECT vectorize.table(
    job_name     => 'my_search_project',
    "table"      => 'products',
    primary_key  => 'product_id',
    columns      => ARRAY['product_name', 'description'],
    transformer  => 'sentence-transformers/all-MiniLM-L6-v2',
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
    job_name     => 'my_search_project',
    "table"      => 'products',
    primary_key  => 'product_id',
    columns      => ARRAY['product_name', 'description'],
    transformer  => 'sentence-transformers/all-MiniLM-L6-v2',
    table_method => 'append'
);
```

Note two new columns: `my_search_project_embeddings` and `my_search_project_updated_at` have been added to the table.

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

### Ad-hoc embedding requests

Any text can be transformed into an embedding using `vectorize.encode()`.

This works with any of the sentence-transformers:

```sql
SELECT vectorize.encode(
    input => 'the quick brown fox jumped over the lazy dogs',
    model => 'sentence-transformers/all-miniLM-L6-v2'
);
```

```text
{-0.2556323707103729,-0.3213586211204529 ..., -0.0951206386089325}
```

Privately hosted models on Hugging Face can be referenced like so:

```sql
SELECT vectorize.encode(
    input   => 'the quick brown fox jumped over the lazy dogs',
    model   => 'my-private-org/my-private-model',
    api_key => 'your Hugging Face key'
)
```

For OpenAI requests, you can either set the API key as a Postgres configuration parameter or pass it in as an argument.

Passing it as an argument will override the configuration parameter.

As an argument:

```sql
SELECT vectorize.encode(
    input   => 'the quick brown fox jumped over the lazy dogs',
    model   => 'openai/text-embedding-ada-002',
    api_key => 'your OpenAI API key'
)
```

You do not need to provide the API key as an argument if it already been set via `ALTER SYSTEM SET vectorize.openai_key`.

```sql
SELECT vectorize.encode(
    input => 'the quick brown fox jumped over the lazy dogs',
    model => 'openai/text-embedding-ada-002'
)
```

### Filtering Results

`vectorize.search()` results can be filtered by supplying a where clause to the `where_sql` parameter in `vectorize.search()`.
The filter operation happens after the embeddings are searched. To pre-filter the search of embeddings, you will need to separate
embeddings into multiple tables or deploy a partitioning strategy.

In the example below, we will filter results to only return the product with `product_id = 3`.
Note that product_id is unique, so only one result will be returned.

```sql
SELECT * FROM vectorize.search(
    job_name        => 'product_search_hf',
    query           => 'accessories for mobile devices',
    return_columns  => ARRAY['product_id', 'product_name'],
    num_results     => 3,
    where_sql       => $$product_id = 3$$
);
```

```plaintext
                                     search_results
----------------------------------------------------------------------------------------
 {"product_id": 3, "product_name": "Desk Lamp", "similarity_score": 0.6498761419705363}
```

### Manually searching embeddings

`vectorize.encode()` can be useful when you want to manually query your embeddings.

To do this, place the `vectorize.encode()::vector` call into your query and manually compute the distance using pgvector's [distance operators](https://github.com/pgvector/pgvector?tab=readme-ov-file#distances). Note that you must select the same transformer model that was used to generate the embeddings.

The example below assumes embeddings are in a column named `my_search_project_embeddings` on the `products` table.

```sql
SELECT
    product_name,
    description,
    1 - (
        my_search_project_embeddings <=>
        vectorize.encode('mobile electronic devices', 'sentence-transformers/all-MiniLM-L6-v2')::vector
    ) as similarity
FROM products
ORDER by similarity DESC
LIMIT 3;
```

```text
   product_name    |                        description                         |     similarity
-------------------+------------------------------------------------------------+---------------------
 Phone Charger     | Device to replenish the battery of mobile phones           |  0.5351522883863631
 Bluetooth Speaker | Portable audio device with wireless connectivity           | 0.38232471837548787
 Wireless Mouse    | Pointing device without the need for a physical connection | 0.35592426991011383
```

### Changing the configured database

By default, `vectorize` is configured to run on the `postgres` database, but that can be changed to any database in Postgres.

Update the following configuration parameters so that the corresponding background workers connect to the correct database.

Both `pg_vectorize` and `pg_cron` will need their configuration updated.

This can be done by running the following SQL commands.

```sql
ALTER SYSTEM SET cron.database_name TO 'my_new_db';
ALTER SYSTEM SET vectorize.database_name TO 'my_new_db';
```

Then, restart Postgres to apply the changes and, if you haven't already, enable the extension in your new database.

```sql
CREATE EXTENSION vectorize CASCADE;
```
