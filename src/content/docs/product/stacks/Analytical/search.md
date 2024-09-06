---
title: Search
sideBarTitle: Search
description: A postgres extension that enables full text search
tags: [postgres, elasticsearch, textsearch, analytical]
---

## Overview

`pg_search` is a Postgres extension that enables full text search over heap tables using the BM25 algorithm. It is built on top of Tantivy, the Rust-based alternative to Apache Lucene, using `pgrx`.

`pg_search` is supported on all versions supported by the PostgreSQL Global Development Group, which includes PostgreSQL 12+.

## Usage

### Indexing

`pg_search` comes with a helper function that creates a test table that you can use for quick experimentation.

```sql
CALL paradedb.create_bm25_test_table(
  schema_name => 'public',
  table_name => 'mock_items'
);
```

To index the table, use the following SQL command:

```sql
CALL paradedb.create_bm25(
  index_name => 'search_idx',
  schema_name => 'public',
  table_name => 'mock_items',
  key_field => 'id',
  text_fields => paradedb.field('description') || paradedb.field('category'),
  numeric_fields => paradedb.field('rating')
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
