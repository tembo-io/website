---
sidebar_position: 4
tags:
  - JSONB
---

# JSONB

## Why JSONB?

- **Flexibility**: JSONB allows for schema-less data storage, which can be useful for situations where the data structure is not fixed.
- **Query Capabilities**: With JSONB, you can query specific fields, use array functions, and even join on JSONB fields.
- **Performance**: JSONB data is stored in a binary format, making it faster to query compared to the textual JSON type. It also supports indexing, which can further speed up queries.

## Creating a table
```sql
CREATE TABLE users (
    id serial PRIMARY KEY,
    data jsonb
);
```

## Inserting
```sql
INSERT INTO users(data) VALUES
('{"name": "John", "age": 28, "contacts": {"email": "john@example.com", "phone": "1234567890"}}');
```

## Querying

- Query a field:
```sql
SELECT data->>'name' as name FROM users WHERE data->>'name' = 'John';
```

:::info
The `->` operator returns data as the jsonb type. The operator `->>` returns the data as text.
:::

- Query a nested field:
```sql
SELECT data->'contacts'->>'email' as email FROM users WHERE data->'contacts'->>'phone' = '1234567890';
```

## Updating

- Performing an update on one of the fields
```sql
UPDATE users SET data = jsonb_set(data, '{contacts,email}', '"new_email@example.com"') WHERE data->>'name' = 'John';
```

- Using another query to check it was updated
```sql
SELECT data->'contacts'->>'email' as email FROM users WHERE data->>'name' = 'John';
```

:::info
Updating one field of JSONB data also rewrites the column to disk.
:::

## Checking if keys are present

With unstructured documents, you'll often want to check for the presence of particular keys.

- **Checking for the existence of a key**:

```sql
SELECT id FROM users WHERE data ? 'name';
```

- **Checking for the existence of multiple keys**:

```sql
SELECT id FROM users WHERE data ?& array['name', 'age'];
```

- **Checking for the existence of any given key**:

```sql
SELECT id FROM users WHERE data ?| array['name', 'nickname'];
```

- **Checking for a particular value ("containment")**:

```sql
SELECT data FROM users WHERE data @> '{"name": "John"}';
```

There are also additional operators, read more details about JSON functions and operators in the Postgres documentation [here](https://www.postgresql.org/docs/current/functions-json.html#FUNCTIONS-JSONB-OP-TABLE).

## Creating indexes for JSONB data

Generalized Inverted Indexes ("GIN") can be used to efficiently search for keys or key/value pairs occurring within a large number of JSONB documents. Two GIN operator classes are provided, offering different performance and flexibility trade-offs.

### Types of indexes

- Two primary GIN operator classes exist for `jsonb`:
  - **Default (jsonb_ops)**:
    - Supports: `?`, `?|`, `?&`, `@>`, `@?`, and `@@`.
    - Typical use:
      ```sql
      CREATE INDEX idxgin ON users USING GIN (data);
      ```
    - `idxgin` is an arbitrary name for our index
  - **jsonb_path_ops**:
    - Doesn't support key-exists operators but does support: `@>`, `@?`, and `@@`.
    - Typically more performant and space-efficient than default.
    - Typical use:
      ```sql
      CREATE INDEX idxginp ON users USING GIN (data jsonb_path_ops);
      ```

### Index query example

For example, you may want to search a large database for users by phone number. That can be done like this:

```sql
SELECT id, data->>'name' as name, data->'contacts'->>'email' as email FROM users WHERE data @> '{"contacts": {"phone": "1234567890"}}';
```

Let's try populating our database with a million rows, and compare the performance with and without the index.

:::info
You can list currently active indexes with
```sql
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public';
```
:::

- Let's drop the index, to be sure we are not using it
```sql
DROP INDEX IF EXISTS idxgin;
DROP INDEX IF EXISTS idxginp;
```

- Generate 1 million rows in the users table. We'll do this using PL/pgSQL

:::info
PL/pgSQL stands for "Procedural Language / PostgreSQL", and it's the PostgreSQL database's default procedural language.
:::

```sql
-- Generate the data

DO $$
DECLARE
    counter INTEGER := 0;
BEGIN
    WHILE counter < 1000000 LOOP
        INSERT INTO users(data) VALUES
        (jsonb_build_object('name', 'User' || counter, 'contacts', jsonb_build_object('email', 'user' || counter || '@example.com', 'phone', '12345' || counter)));
        counter := counter + 1;
    END LOOP;
END $$;

-- The above command takes about a minute to run on the author's laptop

-- Show a sample of the data

SELECT * FROM users LIMIT 10;
```

- Let's add another user to search for

```sql
INSERT INTO users(data) VALUES
('{"name": "Steven", "age": 31, "contacts": {"email": "steven@example.com", "phone": "8675309"}}');
```

- Let's perform a search query by phone number, without the index

```sql
SELECT id, data->>'name' as name, data->'contacts'->>'email' as email FROM users WHERE data @> '{"contacts": {"phone": "8675309"}}';
```

- On the author's laptop, this query takes about 1 second
- Let's check the query plan to understand what is performed when that query was running

:::info
Prefixing a command by `EXPLAIN ANALYZE` will run the query and show the query plan.
:::

```sql
EXPLAIN ANALYZE SELECT id, data->>'name' as name, data->'contacts'->>'email' as email FROM users WHERE data @> '{"contacts": {"phone": "8675309"}}';
```

Sample output:

```
postgres=# EXPLAIN ANALYZE SELECT id, data->>'name' as name, data->'contacts'->>'email' as email FROM users WHERE data @> '{"contacts": {"phone": "8675309"}}';
                                                       QUERY PLAN
------------------------------------------------------------------------------------------------------------------------
 Gather  (cost=1000.00..23667.84 rows=101 width=68) (actual time=820.331..834.720 rows=1 loops=1)
   Workers Planned: 2
   Workers Launched: 2
   ->  Parallel Seq Scan on users  (cost=0.00..22657.74 rows=42 width=68) (actual time=761.228..761.250 rows=0 loops=3)
         Filter: (data @> '{"contacts": {"phone": "8675309"}}'::jsonb)
         Rows Removed by Filter: 336667
 Planning Time: 3.666 ms
 Execution Time: 836.048 ms
(8 rows)
```

- We can see it took 836ms. The query plan explains that this was performed in parallel by 2 workers, and each worker scanned 336,667 rows. In the author's table, there are 1,010,001 total rows. 336,667 times 3 is the total number of rows in the database, this shows how two background workers participate with the main thread to scan a table.

- Let's try with an index

```sql
CREATE INDEX idxgin ON users USING GIN (data);
```

- This command took about 1 minute on the author's laptop.

:::caution
Running `CREATE INDEX .. ON users ...` locks the users table. Instead, use `CREATE INDEX CONCURRENTLY`, which is mostly non-blocking. However, it's also slower to create the index, and if it fails part way through, it will leave behind an invalid index.
:::

- Now, we can search by phone number, using the index

```sql
EXPLAIN ANALYZE SELECT id, data->>'name' as name, data->'contacts'->>'email' as email FROM users WHERE data @> '{"contacts": {"phone": "1234567890"}}';
```

Sample output:

```
postgres=# EXPLAIN ANALYZE SELECT id, data->>'name' as name, data->'contacts'->>'email' as email FROM users WHERE data @> '{"contacts": {"phone": "8675309"}}';
                                                    QUERY PLAN
------------------------------------------------------------------------------------------------------------------
 Bitmap Heap Scan on users  (cost=64.78..447.72 rows=101 width=68) (actual time=2.586..2.614 rows=1 loops=1)
   Recheck Cond: (data @> '{"contacts": {"phone": "8675309"}}'::jsonb)
   Heap Blocks: exact=1
   ->  Bitmap Index Scan on idxgin  (cost=0.00..64.76 rows=101 width=0) (actual time=2.331..2.336 rows=1 loops=1)
         Index Cond: (data @> '{"contacts": {"phone": "8675309"}}'::jsonb)
 Planning Time: 2.905 ms
 Execution Time: 3.312 ms
(7 rows)
```

- We can see this query only took 3ms, compared to more than 800ms in the previous example.

- Let's check how big our table is, and how much of that is the index

```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename)) AS total,
  pg_size_pretty(pg_relation_size(tablename)) AS table,
  pg_size_pretty(pg_indexes_size(tablename)) AS index
FROM (SELECT ('"' || table_schema || '"."' || table_name || '"') AS tablename
      FROM information_schema.tables WHERE table_name = 'users') AS subquery;
```

Sample output:
```
postgres=# SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename)) AS total,
  pg_size_pretty(pg_relation_size(tablename)) AS table,
  pg_size_pretty(pg_indexes_size(tablename)) AS index
FROM (SELECT ('"' || table_schema || '"."' || table_name || '"') AS tablename
      FROM information_schema.tables WHERE table_name = 'users') AS subquery;

    tablename     | total  | table  | index
------------------+--------+--------+--------
 "public"."users" | 375 MB | 136 MB | 239 MB
(1 row)
```

- Notably, the index is larger than the table itself!
- We can make this much smaller by only indexing the phone number.

```sql
DROP INDEX idxgin;
```

- Create a new, limited index. Using an expression index like this will only index the phone number. In our case, we are using the default, binary tree index because we are only searching for a single text value, so the index does not need to use GIN indexes. Consider the use of GIN indexes if you want to do a JSONB query, for example if users have multiple phone number each, and you want to check all users for any phone number.

```sql
CREATE INDEX idx_users_phone_btree ON users ((data->'contacts'->>'phone'));
```

- We have to slightly modify our query so that it's not using the containment operator:

```sql
SELECT id, data->>'name' as name, data->'contacts'->>'email' as email
FROM users
WHERE data->'contacts'->>'phone' = '8675309';
```

```
postgres=# explain analyze SELECT id, data->>'name' as name, data->'contacts'->>'email' as email
FROM users
WHERE data->'contacts'->>'phone' = '8675309';
                                                          QUERY PLAN
------------------------------------------------------------------------------------------------------------------------------
 Index Scan using idx_users_phone_btree on users  (cost=0.42..8.45 rows=1 width=68) (actual time=0.885..0.935 rows=1 loops=1)
   Index Cond: (((data -> 'contacts'::text) ->> 'phone'::text) = '8675309'::text)
 Planning Time: 6.859 ms
 Execution Time: 1.976 ms
(4 rows)
```

- And, we can see the index is smaller.
```

postgres=# SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename)) AS total,
  pg_size_pretty(pg_relation_size(tablename)) AS table,
  pg_size_pretty(pg_indexes_size(tablename)) AS index
FROM (SELECT ('"' || table_schema || '"."' || table_name || '"') AS tablename
      FROM information_schema.tables WHERE table_name = 'users') AS subquery;

    tablename     | total  | table  | index
------------------+--------+--------+-------
 "public"."users" | 198 MB | 136 MB | 62 MB
(1 row)
```
