---
slug: pgmq-internals
title: "Dissecting pgmq"
authors: [rjzv]
tags: [postgres, pgmq, rust]
---

# Dissecting pgmq

In my [previous submission](https://tembo.io/blog/pgmq-with-python) to this space, I described my experience with [pgmq](https://github.com/tembo-io/pgmq) while using the Python library. In this post, I'll share what I found after inspecting the code.

So, first, I'll describe the general structure of the project, which uses [pgrx](https://github.com/pgcentralfoundation/pgrx). Then, I'll explain what happens when we install the pgmq extension. Finally, I'll describe how some of its functions work.

In this post, I'll be using version v0.20.0, which you can find [here](https://github.com/tembo-io/pgmq/releases/tag/v0.20.0).


## Project structure
After cloning the appropriate tag, we can see that the repository contains the following files:

```bash
$ ls -1
Cargo.lock
Cargo.toml
CONTRIBUTING.md
core
Dockerfile.build
examples
images
LICENSE
Makefile
pgmq.control
pgmq-rs
README.md
sql
src
tembo-pgmq-python
tests
```

From the pgrx [README](https://github.com/pgcentralfoundation/pgrx/blob/develop/README.md), we know that the relevant files for the extension are `Cargo.toml`, `pgmq.control` and the `src` and `sql` directories:

```bash
$ tree sql src
sql
├── pgmq--0.10.2--0.11.1.sql
├── pgmq--0.11.1--0.11.2.sql
...
├── pgmq--0.8.0--0.8.1.sql
├── pgmq--0.8.1--0.9.0.sql
└── pgmq--0.9.0--0.10.2.sql
src
├── api.rs
├── errors.rs
├── lib.rs
├── metrics.rs
└── partition.rs

0 directories, 5 files
```

## Installing the pgmq extension

To build the pgmq extension, we can do the following:

```bash
cargo build
```

Alternatively, to build and install the pgmq extension, we can do:

```bash
cargo pgrx install
```

In either case, we can see a shared library `pgmq.so` being created. The installation process also places the shared library in the `lib` directory of the postgres installation; and the sql files and the control file in the `extensions` directory. In my case:

```
$ ls -1 /opt/postgres/share/extension/pgmq*
/opt/postgres/share/extension/pgmq--0.10.2--0.11.1.sql
...
/opt/postgres/share/extension/pgmq--0.9.0--0.10.2.sql
/opt/postgres/share/extension/pgmq.control

$ ls -1 /opt/postgres/lib/pgmq*
/opt/postgres/lib/pgmq.so
```
To test the extension, we can do:

```bash
cargo pgrx run
```
and it'll start a `psql` prompt. In the prompt, we can execute the `create extension` statement to start using pgmq:

```sql
-- List installed extensions
\dx

-- Enable pgmq
create extension pgmq;

-- List installed extensions again
\dx
```

The output will look something like:
```
pgmq=# \dx
                 List of installed extensions
  Name   | Version |   Schema   |         Description
---------+---------+------------+------------------------------
 plpgsql | 1.0     | pg_catalog | PL/pgSQL procedural language
(1 row)

pgmq=# create extension pgmq;
CREATE EXTENSION

pgmq=# \dx
                                     List of installed extensions
  Name   | Version |   Schema   |                             Description
---------+---------+------------+---------------------------------------------------------------------
 pgmq    | 0.20.0  | public     | A lightweight message queue. Like AWS SQS and RSMQ but on Postgres.
 plpgsql | 1.0     | pg_catalog | PL/pgSQL procedural language
(2 rows)
```

We can also list the available functions:

```sql
-- List available functions
\df
```

```
pgmq=# \df
                                                                         List of functions
 Schema |            Name             |                                                                         Result data type                                                                         |                                                 Argument data types                                                  | Type
--------+-----------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------------------------------+------
 public | pgmq_archive                | boolean                                                                                                                                                          | queue_name text, msg_id bigint                                                                                       | func
 public | pgmq_archive                | boolean                                                                                                                                                          | queue_name text, msg_ids bigint[]                                                                                    | func
 public | pgmq_create                 | void                                                                                                                                                             | queue_name text                                                                                                      | func
 public | pgmq_create_non_partitioned | void                                                                                                                                                             | queue_name text                                                                                                      | func
 public | pgmq_create_partitioned     | void                                                                                                                                                             | queue_name text, partition_interval text DEFAULT '10000'::text, retention_interval text DEFAULT '100000'::text       | func
 public | pgmq_delete                 | boolean                                                                                                                                                          | queue_name text, msg_id bigint                                                                                       | func
 public | pgmq_delete                 | boolean                                                                                                                                                          | queue_name text, msg_ids bigint[]                                                                                    | func
 public | pgmq_drop_queue             | boolean                                                                                                                                                          | queue_name text, partitioned boolean DEFAULT false                                                                   | func
 public | pgmq_list_queues            | TABLE(queue_name text, created_at timestamp with time zone)                                                                                                      |                                                                                                                      | func
 public | pgmq_metrics                | TABLE(queue_name text, queue_length bigint, newest_msg_age_sec integer, oldest_msg_age_sec integer, total_messages bigint, scrape_time timestamp with time zone) | queue_name text                                                                                                      | func
 public | pgmq_metrics_all            | TABLE(queue_name text, queue_length bigint, newest_msg_age_sec integer, oldest_msg_age_sec integer, total_messages bigint, scrape_time timestamp with time zone) |                                                                                                                      | func
 public | pgmq_pop                    | TABLE(msg_id bigint, read_ct integer, enqueued_at timestamp with time zone, vt timestamp with time zone, message jsonb)                                          | queue_name text                                                                                                      | func
 public | pgmq_read                   | TABLE(msg_id bigint, read_ct integer, enqueued_at timestamp with time zone, vt timestamp with time zone, message jsonb)                                          | queue_name text, vt integer, "limit" integer                                                                         | func
 public | pgmq_read_with_poll         | TABLE(msg_id bigint, read_ct integer, enqueued_at timestamp with time zone, vt timestamp with time zone, message jsonb)                                          | queue_name text, vt integer, "limit" integer, poll_timeout_s integer DEFAULT 5, poll_interval_ms integer DEFAULT 250 | func
 public | pgmq_send                   | bigint                                                                                                                                                           | queue_name text, message jsonb                                                                                       | func
 public | pgmq_send_batch             | TABLE(msg_id bigint)                                                                                                                                             | queue_name text, messages jsonb[], delay bigint DEFAULT 0                                                            | func
 public | pgmq_set_vt                 | TABLE(msg_id bigint, read_ct integer, enqueued_at timestamp with time zone, vt timestamp with time zone, message jsonb)                                          | queue_name text, msg_id bigint, vt_offset integer                                                                    | func
(17 rows)
```

With this, we can now explore the extension from the inside. And, if needed, recompile and reinstall the extension to play with it.


## The internals

We know that when an extension is created with pgrx, it generates a `lib.rs` file. Let us explore it.

One of the first thing we can see, is that the other four files in the `src/` directory are included:

```rust
pub mod api;
pub mod errors;
pub mod metrics;
pub mod partition;
```

We also see that it imports stuff from another module, the one in `core/`:

```rust
use pgmq_core::{
    errors::PgmqError,
    query::{archive, archive_batch, delete, delete_batch, init_queue, pop, read},
    types::{PGMQ_SCHEMA, TABLE_PREFIX},
    util::check_input,
};
```

So, at this point we know that we can find the source code in two places: `src/` and `core/`. 

If we continue exploring `lib.rs`, we can see that it declares some sql that gets executed when the extension is enabled:

```rust
extension_sql!(
    "
CREATE TABLE public.pgmq_meta (
    queue_name VARCHAR UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
...
```

We can actually see that table with `psql`:

```sql
-- List tables
\dt

-- List contents of pgmq_meta
select * from pgmq_meta;
```
```
pgmq-# \dt
           List of relations
 Schema |   Name    | Type  |  Owner
--------+-----------+-------+----------
 public | pgmq_meta | table | binidxaba
(1 row)

pgmq=# select * from pgmq_meta;
 queue_name | created_at
------------+------------
(0 rows)
```
From this point, we can suspect that every time we create a queue, a new row is inserted into this table.

Let us see what `pgmq_create()` does...


### pgmq\_create()

If we chase the call sequence, we can discover that the interesting function is `init_queue(name: &str)`:

```rust
pub fn init_queue(name: &str) -> Result<Vec<String>, PgmqError> {
    let name = CheckedName::new(name)?;
    Ok(vec![
        create_queue(name)?,
        assign_queue(name)?,
        create_index(name)?,
        create_archive(name)?,
        assign_archive(name)?,
        create_archive_index(name)?,
        insert_meta(name)?,
        grant_pgmon_queue(name)?,
    ])
}
```
This function generates several sql statements that are later executed in `pgmq_create_non_partitioned` using a [`Spi` client](https://docs.rs/pgx/latest/pgx/spi/struct.SpiClient.html).

I'll skip the details, but the sql statements basically do:
1. Create a table `pgmq_<queue_name>`.
2. Assign the table to the pqmg extension.
3. Create an index on the `pgmq_<queue_name>` table.
4. Create a table `pgmq_<queue_name>_archive`.
5. Assign the table to the pgmq extension.
6. Create an index on the `pgmq_<queue_name>_archive` table.
7. Insert a row on the `pgmq_meta` table.
8. Grant privileges to `pg_monitor`.

We can see the effects of this in psql using the following lines:
```sql
-- Create a queue
select pgmq_create('my_queue');

-- List tables
\dt

-- List indexes
\di

-- See the contents of pgmq_meta
select * from pgmq_meta;
```

The output will show something like:
```
pgmq=# select pgmq_create('my_queue');
 pgmq_create
-------------

(1 row)

pgmq=# \dt
                 List of relations
 Schema |         Name          | Type  |  Owner
--------+-----------------------+-------+----------
 public | pgmq_meta             | table | binidxaba
 public | pgmq_my_queue         | table | binidxaba
 public | pgmq_my_queue_archive | table | binidxaba
(3 rows)

pgmq=# \di
                               List of relations                                                                                                                                              
 Schema |            Name            | Type  |  Owner    |         Table         
--------+----------------------------+-------+-----------+-----------------------
 public | archived_at_idx_my_queue   | index | binidxaba | pgmq_my_queue_archive
 public | pgmq_meta_queue_name_key   | index | binidxaba | pgmq_meta
 public | pgmq_my_queue_archive_pkey | index | binidxaba | pgmq_my_queue_archive
 public | pgmq_my_queue_pkey         | index | binidxaba | pgmq_my_queue
 public | pgmq_my_queue_vt_idx       | index | binidxaba | pgmq_my_queue
(5 rows)

pgmq=# select * from pgmq_meta;
 queue_name |          created_at
------------+-------------------------------
 my_queue   | 2023-08-30 07:00:42.467084-06
(1 row)
```

For the queue `my_queue`, we can see the underlying table and the corresponding archive table. Each table has an index associated with the primary key. The `pgmq_my_queue` table also has an index on the `vt` column, and `pgmq_my_queue_archive` has an index on the `archived_at` column.

We can suspect that the `pgmq_my_queue` table is used in the send and read operations. Let us look at those two functions.


### pgmq\_send()

`pgmq_send` is straightforward, it just inserts a new row in the the underlying table:

```sql
INSERT INTO {PGMQ_SCHEMA}.{TABLE_PREFIX}_{name} (vt, message)
VALUES (now(), $1)
RETURNING msg_id; 
```


### pgmq\_read()


So, let's see. If I were the one programming `pgmq_read()`, I would perhaps do something like "get the first `{limit}` rows from the queue table whose `{vt}` has already expired, and for those rows, also update the visibility timeout to `now() + {vt}`." Naively, maybe something like:

```sql
update pgmq_my_queue
SET      
    vt = clock_timestamp() + interval '10 seconds',                                            
    read_ct = read_ct + 1                                                                      
WHERE  
    msg_id in (select msg_id from pgmq_my_queue where vt <= clock_timestamp()                                                      
        ORDER BY msg_id ASC                                                                            
        LIMIT 1);  
```

In reality, `pgmq_read` is more interesting than that :sweat_smile:. It performs the following DML:

```sql
WITH cte AS                                                                                                                                                                            
    (                                                                                      
        SELECT msg_id                                                                      
        FROM {PGMQ_SCHEMA}.{TABLE_PREFIX}_{name}                                           
        WHERE vt <= clock_timestamp()                                                      
        ORDER BY msg_id ASC                                                                
        LIMIT {limit}                                                                      
        FOR UPDATE SKIP LOCKED                                                             
    )                                                                                      
UPDATE {PGMQ_SCHEMA}.{TABLE_PREFIX}_{name}                                                 
SET                                                                                        
    vt = clock_timestamp() + interval '{vt} seconds',                                      
    read_ct = read_ct + 1                                                                  
WHERE msg_id in (select msg_id from cte)                                                   
RETURNING *;
```

Firstly, in pgmq's version, there is a CTE (Common Table Expression) to obtain the first `{limit}` message IDs whose `vt` has expired. (It would be interesting to discuss why pgmq developers used a CTE, but we can explore that in another post.)

There are two crucial things to notice in the CTE. One is the `order by` clause that ensures the FIFO ordering. The other one is the `FOR UPDATE SKIP LOCKED` clause, claiming the rows no one else has claimed. This part is essential because it ensures correctness in the case of concurrent  `pgmq_read()` operations. 

The next step in the DML is to update the corresponding rows with a new vt value by adding the supplied `{vt}` to the current timestamp. Additionally, the `read_ct` value is incremented by 1. What is the use of this counter? In general, we can suspect that there is a problem processing a given message if it has a high `read_ct` value because users usually archive the message after successfully processing it. So, ideally, a message is only read once. 



### pgmq\_archive()

The next stage in the lifecycle of a message is archiving it. For that, pgmq uses the following insert statement:

```sql
WITH archived AS (
    DELETE FROM {PGMQ_SCHEMA}.{TABLE_PREFIX}_{name}
    WHERE msg_id = {msg_id}
    RETURNING msg_id, vt, read_ct, enqueued_at, message
)
INSERT INTO {PGMQ_SCHEMA}.{TABLE_PREFIX}_{name}_archive (msg_id, vt, read_ct, enqueued_at, message)
SELECT msg_id, vt, read_ct, enqueued_at, message
FROM archived;
```

Essentially, it deletes the message with the provided `msg_id` from the queue table, and then the message is placed in the corresponding archive table.

One interesting thing to notice is that `pgmq_archive()` can be used to archive a batch of messages too:

```sql
select pgmq_archive('my_queue', ARRAY[3, 4, 5]);
```

```
pgmq=# select pgmq_archive('my_queue', ARRAY[3, 4, 5]);
 pgmq_archive
--------------
 t
(1 row)

```


That is achieved in pgrx by declaring two functions using the [same name in the `pg_extern`](https://github.com/pgcentralfoundation/pgrx/blob/047b1d1fc9e9c4007c871e226fa81e294f8bf5e6/pgrx-macros/src/lib.rs#L462) derive macro as follows:

```rust
[pg_extern]
fn pgmq_archive(queue_name: &str, msg_id: i64) -> Result<Option<bool>, PgmqExtError> {
//...
}

[pg_extern(name = "pgmq_archive")]
fn pgmq_archive_batch(queue_name: &str, msg_ids: Vec<i64>) -> Result<Option<bool>, PgmqExtError> {
//...
}
```


### pgmq\_drop\_queue()

Finally, let's talk about `pgmq_drop_queue()`. It essentially executes multiple statements:

1. Unassign the `pgmq_<queue_name>` table from the extension.
2. Unassign the `pgmq_<queue_name>_archive` table from the extension.
3. Drop the table `pgmq_<queue_name>`.
4. Drop the table `pgmq_<queue_name>_archive`.
5. Delete the corresponding row from the `pgmq_meta` table.

Nothing surprising in this one, and with it, we conclude our tour.


## Conclusion

In this post, we explored how the pgrx tool is used to generate the pgmq extension. We explored how the metadata objects are created and how they are used in the basic send, read and archive operations. At least from an explorer perspective, the internals of the extension are currently easy to read and understand.

I invite everyone to explore how the other pgmq functions work. You can explore the code at https://github.com/tembo-io/pgmq. And you can learn more about pgrx at: https://github.com/pgcentralfoundation/pgrx.
