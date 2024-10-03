---
title: ParadeDB
sideBarTitle: ParadeDB
description: Postgres for Search and Analytics
tags: [postgres, elasticsearch, analytical, paradedb]
---

## Overview

[ParadeDB](https://docs.paradedb.com/welcome/introduction) is an Elasticsearch alternative built on Postgres. Built for real-time, update-heavy workloads.

## Getting Started

### Full Text Search

`ParadeDB` comes with a helpful procedure that creates a table populated with mock data to help you get started. Once connected with psql, run the following commands to create and inspect this table.

```sql
CALL paradedb.create_bm25_test_table(
  schema_name => 'public',
  table_name => 'mock_items'
);

SELECT description, rating, category
FROM mock_items
LIMIT 3;
```

```plaintext
       description        | rating |  category
--------------------------+--------+-------------
 Ergonomic metal keyboard |      4 | Electronics
 Plastic Keyboard         |      4 | Electronics
 Sleek running shoes      |      5 | Footwear
(3 rows)
```

Next, let’s create a BM25 index called search_idx on this table. A BM25 index is a covering index, which means that multiple columns can be included in the same index. The following code block demonstrates the various Postgres types that can be combined inside a single index.

```sql
CALL paradedb.create_bm25(
  index_name => 'search_idx',
  table_name => 'mock_items',
  key_field => 'id',
  text_fields => paradedb.field('description') || paradedb.field('category'),
  numeric_fields => paradedb.field('rating'),
  boolean_fields => paradedb.field('in_stock'),
  datetime_fields => paradedb.field('created_at'),
  json_fields => paradedb.field('metadata')
);
```

Note the mandatory `key_field` option in the `WITH` code. Every `bm25` index needs a `key_field`, which should be the name of a column that will function as a row's unique identifier within the index. Usually, the `key_field` can just be the name of your table's primary key column.

Once the indexing is complete, you can run various search functions on it.

### Basic Search

Execute a search query on your indexed table:

```sql
SELECT description, rating, category
FROM search_idx.search(
  '(description:keyboard OR category:electronics) AND rating:>2',
  limit_rows => 5
);
```

This will return:

```csv
         description         | rating |  category
-----------------------------+--------+-------------
 Plastic Keyboard            |      4 | Electronics
 Ergonomic metal keyboard    |      4 | Electronics
 Innovative wireless earbuds |      5 | Electronics
 Fast charging power bank    |      4 | Electronics
 Bluetooth-enabled speaker   |      3 | Electronics
(5 rows)
```

Note the usage of `limit_rows` instead of the SQL `LIMIT` clause. For optimal performance, we recommend always using
`limit_rows` and `offset_rows` instead of `LIMIT` and `OFFSET`.
