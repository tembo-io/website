---
title: Sentence Transformers
sideBarTitle: Sentence Transformers
sideBarPosition: 2
description: An introduction to the Tembo VectorDB Stack
tags: [postgres, vectordb, ai]
---

Earlier we demonstrated how to generate embeddings and then search them using OpenAI,
 but this can also be done using the Sentence Transformers available on Hugging Face.

## Setup

Start by connecting to your instance:

```sql
psql 'postgresql://postgres:<your-password>@<your-host>:5432/postgres'
```

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

## Initializing a job

Create a job to vectorize the products table. We'll specify the tables primary key (`product_id`) and the columns that we want to search (`product_name` and `description`).

```sql
SELECT vectorize.table(
    job_name    => 'product_search_hf',
    "table"     => 'products',
    primary_key => 'product_id',
    columns     => ARRAY['product_name', 'description'],
    schedule    => 'realtime',
    transformer => 'sentence-transformers/all-MiniLM-L6-v2'
);
```

### Private models from Hugging Face

If you've uploaded a [private model](https://huggingface.co/blog/introducing-private-hub) to Hugging Face, you can still host it on Tembo Cloud. Simply reference your Hugging Face org and model name,
and pass the API key in as an `arg` to `vectorize.table()`.

```sql
SELECT vectorize.table(
    job_name    => 'product_search_hf',
    "table"     => 'products',
    primary_key => 'product_id',
    columns     => ARRAY['product_name', 'description'],
    transformer => 'my-hugging-face-org/my-private-model',
    schedule    => 'realtime',
    args        => '{"api_key": "hf_my_private_api_key"}'
);
```

## Searching the embeddings

Then search, again specifying the `job_name` as define above and the columns you want to return.

```sql
SELECT * FROM vectorize.search(
    job_name        => 'product_search_hf',
    query           => 'accessories for mobile devices',
    return_columns  => ARRAY['product_id', 'product_name'],
    num_results     => 3
);
```

```text
                                       search_results
---------------------------------------------------------------------------------------------
 {"product_id": 13, "product_name": "Phone Charger", "similarity_score": 0.8147814132322894}
 {"product_id": 6, "product_name": "Backpack", "similarity_score": 0.7743061352550308}
 {"product_id": 11, "product_name": "Stylus Pen", "similarity_score": 0.7709902653575383}
```

## Directly generating embeddings

You can also generate embeddings directly using `vectorize.encode()`.

```sql
select vectorize.encode(
    input => 'mobile electronic accessories',
    model => 'sentence-transformers/all-MiniLM-L6-v2'
);
```

This can be used in a more complex query, such as:

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
