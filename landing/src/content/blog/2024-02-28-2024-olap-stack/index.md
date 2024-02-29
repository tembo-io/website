---
slug: olap-stack
title: 'Optimizing Postgres for OLAP Workloads'
authors: [adam]
tags: [postgres, stacks, database, olap]
date: 2024-02-28T17:00
image: ./olap-social.png
---

![olap](./olap-social.png)

Postgres is commonly known for its performance in transactional workloads where there are high frequencies of create, read, update and delete operations. However, Postgres can also be tuned to perform analytical workloads, such as queries that perform trend analysis, forecasting, and decision analytics support on large amounts of data. There continues to be innovation in analytical processing as well, including extending Postgres with high-performance analytics engines in ParadeDB (pg_analytics) and pg_quack.

We’ll walk through how we selected Postgres configurations and extensions in order to build an analytical workload stack for Postgres. The final configurations definitions can be found in the [tembo stack’s definition](https://github.com/tembo-io/tembo/blob/main/tembo-operator/src/stacks/templates/olap.yaml).

## Principles of tuning for analytics workloads

Columnar storage, compression, and configuration are three important  principles we used for tuning for high performance analytical queries in Postgres. There are also more such techniques as processing columns of data via vectorized execution, which allows us to process an array or vector of data, rather than iterating over rows. In addition to these principles, it is also important to tune specific queries and the data model itself.

### Postgres Configurations

Simply tuning the Postgres configurations for analytical workloads gives users an advantage. Generally, Postgres should be tuned for increased parallelism. One of the most commonly tuned parameters is [max_parallel_workers](https://postgresqlco.nf/doc/en/param/max_parallel_workers/), which allows Postgres to dedicate more parallel worker processes to the execution of queries. For analytics workloads, this generally results in much faster query execution.

### Row vs Column Based Storage

Normally Postgres stores data in tuples, where the data is written to disk such that each row. To use an analogy, let’s assume that a Postgres database is a bookshelf and each table is a book. The default behavior of postgres is to store each row in the table on its own page in that book. We can create indexes to find pages a lot faster, but ultimately we always need to scan over pages to find the exact page or group of pages that we are looking for. This is great when we are using the database for operations like updating pages or adding new pages.

However, if we want to access the information in the book based on a topic that we know spans multiple pages, organizing the book page by page makes less sense. This is where columnar storage comes in, the data is partition vertically, by column rather than by row. Often in analytical queries we will want to compute summary statistics of all values in a column, and perhaps group them by another column, but we are typically not concerned with each and every column of the row, only the columns that we are using for our aggregate. For example, if we have a row with 10 values in it, and we only need 2 columns for our aggregate, we can simply read the 2 columns for our query, rather than read and parse every column when our data is using row-based storage.

### Compression

Compressing data on disk brings significant benefits, especially in analytical workloads. Analytical workloads commonly involve storing, processing and compressing larger amounts of data that typical application workloads. In a cloud environment like AWS, block storage can be [4-5x more costly](https://bluexp.netapp.com/blog/ebs-efs-amazons3-best-cloud-storage-system) than colder storage like S3 or Glacier, so it is more cost effective to compress data. In addition to saving costs, it also brings performance improvements. Data is compressed  which means there is less data to scan and results in a more efficient use of memory. When combined with columnar storage, this brings a lot of benefits as columnar data generally compresses better.

### Workload Specific Optimization & Execution

In addition to these generic principles, you can se techniques such as table partitioning to improve query performance by limiting the number of rows to scan. Selecting the partition key is the one of the most important aspects when partitioning. The general goal for partitioning is to limit the amount of data that must be scanned, Andrew Atkinson has written extensively on [partitioning in Postgres](https://andyatkinson.com/blog/2023/07/27/partitioning-growing-practice)and is a great starting point. You could also use specific indexing Strategies: such as bitmap indexes or BRIN (Block Range INdexes) for large datasets, to speed up query execution.

If there are common queries that are executed frequently, and do not need to be updated in real time, materialized views can be highly beneficial. For example, if the application requirements specify that the average number of clicks on a page only need to be updated hourly, a materialized view for that aggregate could be set up to compute that. Then, there could be further aggregate or selection done on the materialized view.

## An Analysis of Clickbench

[Clickbench](https://benchmark.clickhouse.com/) is a set of benchmarks managed by Clickhouse that cover the typical queries conducted in ad-hoc analytics and real-time dashboards, and is a common standard comparison tool for analytics database engines. This analysis focuses primarily on the benchmarks conducted on a [c6a.4xlarge](https://aws.amazon.com/ec2/instance-types/c6a/) ec2 instance, which is 16vCPU and 32GB memory. However, it is important to note that some benchmarks are being conducted on [c6a.metal](https://aws.amazon.com/about-aws/whats-new/2023/10/new-amazon-ec2-bare-metal-instances/), which is Amazon’s bare metal server offering and advertises increased performance by direct access to compute.

Untuned Postgres is slow on these benchmarks, especially when comparing it to the top two performers [Clickhouse](https://clickhouse.com/) and [Umbra](https://umbra-db.com/). However, Postgres can be tuned and extended.

![untuned](./untuned.png 'untuned')

## Tuned Postgres is faster than you think, but it is not enough

Postgres natively comes with several configurations that improve the performance of analytic workloads. If we are to ignore any changes involving storage or compression, how much performance gain should we expect? We can answer this question by analyzing some of Clickbench’s benchmark results for [Postgres vs Tuned Postgres](https://benchmark.clickhouse.com/#eyJzeXN0ZW0iOnsiQWxsb3lEQiI6ZmFsc2UsIkF0aGVuYSAocGFydGl0aW9uZWQpIjpmYWxzZSwiQXRoZW5hIChzaW5nbGUpIjpmYWxzZSwiQXVyb3JhIGZvciBNeVNRTCI6ZmFsc2UsIkF1cm9yYSBmb3IgUG9zdGdyZVNRTCI6ZmFsc2UsIkJ5Q29uaXR5IjpmYWxzZSwiQnl0ZUhvdXNlIjpmYWxzZSwiY2hEQiI6ZmFsc2UsIkNpdHVzIjpmYWxzZSwiQ2xpY2tIb3VzZSBDbG91ZCAoYXdzKSI6ZmFsc2UsIkNsaWNrSG91c2UgQ2xvdWQgKGdjcCkiOmZhbHNlLCJDbGlja0hvdXNlIDIzLjExIChkYXRhIGxha2UsIHBhcnRpdGlvbmVkKSI6ZmFsc2UsIkNsaWNrSG91c2UgMjMuMTEgKGRhdGEgbGFrZSwgc2luZ2xlKSI6ZmFsc2UsIkNsaWNrSG91c2UgMjMuMTEgKFBhcnF1ZXQsIHBhcnRpdGlvbmVkKSI6ZmFsc2UsIkNsaWNrSG91c2UgMjMuMTEgKFBhcnF1ZXQsIHNpbmdsZSkiOmZhbHNlLCJDbGlja0hvdXNlIDIzLjExICh3ZWIpIjpmYWxzZSwiQ2xpY2tIb3VzZSI6ZmFsc2UsIkNsaWNrSG91c2UgKHR1bmVkKSI6ZmFsc2UsIkNsaWNrSG91c2UgMjMuMTEiOmZhbHNlLCJDbGlja0hvdXNlICh6c3RkKSI6ZmFsc2UsIkNyYXRlREIiOmZhbHNlLCJEYXRhYmVuZCI6ZmFsc2UsIkRhdGFGdXNpb24gKFBhcnF1ZXQsIHBhcnRpdGlvbmVkKSI6ZmFsc2UsIkRhdGFGdXNpb24gKFBhcnF1ZXQsIHNpbmdsZSkiOmZhbHNlLCJBcGFjaGUgRG9yaXMiOmZhbHNlLCJEcnVpZCI6ZmFsc2UsIkR1Y2tEQiAoUGFycXVldCwgcGFydGl0aW9uZWQpIjpmYWxzZSwiRHVja0RCIjpmYWxzZSwiRWxhc3RpY3NlYXJjaCI6ZmFsc2UsIkVsYXN0aWNzZWFyY2ggKHR1bmVkKSI6ZmFsc2UsIkdsYXJlREIiOmZhbHNlLCJHcmVlbnBsdW0iOmZhbHNlLCJIZWF2eUFJIjpmYWxzZSwiSHlkcmEiOmZhbHNlLCJJbmZvYnJpZ2h0IjpmYWxzZSwiS2luZXRpY2EiOmZhbHNlLCJNYXJpYURCIENvbHVtblN0b3JlIjpmYWxzZSwiTWFyaWFEQiI6ZmFsc2UsIk1vbmV0REIiOmZhbHNlLCJNb25nb0RCIjpmYWxzZSwiTW90aGVyZHVjayI6ZmFsc2UsIk15U1FMIChNeUlTQU0pIjpmYWxzZSwiTXlTUUwiOmZhbHNlLCJPeGxhLmNvbSI6ZmFsc2UsIlBhcmFkZURCIjpmYWxzZSwiUGlub3QiOmZhbHNlLCJQb3N0Z3JlU1FMICh0dW5lZCkiOnRydWUsIlBvc3RncmVTUUwiOnRydWUsIlF1ZXN0REIgKHBhcnRpdGlvbmVkKSI6ZmFsc2UsIlF1ZXN0REIiOmZhbHNlLCJSZWRzaGlmdCI6ZmFsc2UsIlNlbGVjdERCIjpmYWxzZSwiU2luZ2xlU3RvcmUiOmZhbHNlLCJTbm93Zmxha2UiOmZhbHNlLCJTUUxpdGUiOmZhbHNlLCJTdGFyUm9ja3MiOmZhbHNlLCJUaW1lc2NhbGVEQiAoY29tcHJlc3Npb24pIjpmYWxzZSwiVGltZXNjYWxlREIiOmZhbHNlLCJVbWJyYSI6ZmFsc2V9LCJ0eXBlIjp7IkMiOnRydWUsImNvbHVtbi1vcmllbnRlZCI6dHJ1ZSwiUG9zdGdyZVNRTCBjb21wYXRpYmxlIjp0cnVlLCJtYW5hZ2VkIjp0cnVlLCJnY3AiOnRydWUsInN0YXRlbGVzcyI6dHJ1ZSwiSmF2YSI6dHJ1ZSwiQysrIjp0cnVlLCJNeVNRTCBjb21wYXRpYmxlIjp0cnVlLCJyb3ctb3JpZW50ZWQiOnRydWUsIkNsaWNrSG91c2UgZGVyaXZhdGl2ZSI6dHJ1ZSwiZW1iZWRkZWQiOnRydWUsInNlcnZlcmxlc3MiOnRydWUsImF3cyI6dHJ1ZSwiUnVzdCI6dHJ1ZSwic2VhcmNoIjp0cnVlLCJkb2N1bWVudCI6dHJ1ZSwiYW5hbHl0aWNhbCI6dHJ1ZSwic29tZXdoYXQgUG9zdGdyZVNRTCBjb21wYXRpYmxlIjp0cnVlLCJ0aW1lLXNlcmllcyI6dHJ1ZX0sIm1hY2hpbmUiOnsiMTYgdkNQVSAxMjhHQiI6dHJ1ZSwiOCB2Q1BVIDY0R0IiOnRydWUsInNlcnZlcmxlc3MiOnRydWUsIjE2YWN1Ijp0cnVlLCJjNmEuNHhsYXJnZSwgNTAwZ2IgZ3AyIjp0cnVlLCJMIjp0cnVlLCJNIjp0cnVlLCJTIjp0cnVlLCJYUyI6dHJ1ZSwiYzZhLm1ldGFsLCA1MDBnYiBncDIiOnRydWUsIjE5MkdCIjp0cnVlLCIyNEdCIjp0cnVlLCIzNjBHQiI6dHJ1ZSwiNDhHQiI6dHJ1ZSwiNzIwR0IiOnRydWUsIjk2R0IiOnRydWUsIjE0MzBHQiI6dHJ1ZSwiZGV2Ijp0cnVlLCI3MDhHQiI6dHJ1ZSwiYzVuLjR4bGFyZ2UsIDUwMGdiIGdwMiI6dHJ1ZSwiYzUuNHhsYXJnZSwgNTAwZ2IgZ3AyIjp0cnVlLCJtNWQuMjR4bGFyZ2UiOnRydWUsIm02aS4zMnhsYXJnZSI6dHJ1ZSwiYzZhLjR4bGFyZ2UsIDE1MDBnYiBncDIiOnRydWUsImNsb3VkIjp0cnVlLCJkYzIuOHhsYXJnZSI6dHJ1ZSwicmEzLjE2eGxhcmdlIjp0cnVlLCJyYTMuNHhsYXJnZSI6dHJ1ZSwicmEzLnhscGx1cyI6dHJ1ZSwiUzIiOnRydWUsIlMyNCI6dHJ1ZSwiMlhMIjp0cnVlLCIzWEwiOnRydWUsIjRYTCI6dHJ1ZSwiWEwiOnRydWV9LCJjbHVzdGVyX3NpemUiOnsiMSI6dHJ1ZSwiMiI6dHJ1ZSwiNCI6dHJ1ZSwiOCI6dHJ1ZSwiMTYiOnRydWUsIjMyIjp0cnVlLCI2NCI6dHJ1ZSwiMTI4Ijp0cnVlLCJzZXJ2ZXJsZXNzIjp0cnVlLCJkZWRpY2F0ZWQiOnRydWUsInVuZGVmaW5lZCI6dHJ1ZX0sIm1ldHJpYyI6ImhvdCIsInF1ZXJpZXMiOlt0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlXX0=). Tuning Postgres configuration settings results in roughly 20x improvement to performance on the Clickbench evaluation.

![tuned-postgres](./tuned.png 'tuned')

And remove un-tuned Postgres for scale:

![sized](./tuned-sized.png 'tuned-sized')

Most of the differences in configuration settings are all related to parallelism, which lets Postgres do more work in parallel, which results in faster processing. These are also configuration settings that anyone should be able to set, so long as their Postgres role allows them. Note that `max_worker_processes` should also be increased, since the `max_parallel_workers value` is not allowed to exceed `max_worker_processes`, so it should be increased accordingly. Key tunings performed in this benchmark are:

* 18 B-Tree indexes and 2 gin indexes created on the `hits` table
* `shared_buffers` increased to 25% of system memory
* `max_parallel_workers` increased to be equal to the number of vCPU on the machine
* `max_parallel_workers_per_gather` increased to 8, or ½ the total vCPU
* `max_wal_size` increased to 32GB, to account for a larger amount of data.

These configuration settings can be found in the [untuned Postgres](https://github.com/ClickHouse/ClickBench/tree/main/postgresql)settings and the [Tuned Postgres](https://github.com/ClickHouse/ClickBench/tree/main/postgresql-tuned) settings in the Clickbench Github repository.

## Moving the needle with compression and columnar storage

Hydra’s [columnar extension](https://github.com/hydradatabase/hydra), which is a fork of Citus’s [columnar extension](https://github.com/citusdata/citus/tree/main/src/backend/columnar), adds two ingredients which improve performance; compression and columnar storage. These ingredients result in a roughly 13% improvement on Clickbench’s benchmark compared to tuned Postgres.

![hydra](./hydra.png 'hydra')

The `hits` column is all stored together, with no index, so Postgres must scan every value to match the pattern. Whereas in the tuned Postgres benchmark, there is an index which allows Postgres to scan only a subset of data. Performance would likely improve more significantly under a benchmark that better represents pure analytics, rather than a combination of streaming and analytics changes.

There is a set of queries that perform lower than tuned Postgres, all related to the usage of pattern matching which is very conducive to row-based indexes. For example, query 20 is `select count(*) from hits where url like ‘%google%’`. Columnar and compression do not help these cases. Ignoring queries 20-26, which are match based queries which are not best suited for columnar format, results in a significant improvement (3x vs 13%). Tuned Postgres performed very well on these types of queries, so removing them results in a decrease in performance for tuned Postgres.

![remove-match](./remove-match.png 'remove-match')

## Tembo’s OLAP Performance

Tembo OLAP’s OLAP stack is able to increase performance beyond just using columnar by further tuning Postgres, creating a few more indexes and some hardware infrastructure level optimizations, including gp3 storage.

Some of the configurations we’ve tuned further include:

* shared_buffers = 12GB
* effective_io_concurrency = 100
* work_mem = 3GB
* effective_cache_size = 20GB

![tembo](./tembo.png 'tembo')

## Rising technologies in Postgres OLAP

pg_analytics and pg_quack, two Postgres extensions, both take a similar approach to improving analytical workload performance on Postgres. In the executor and planner, through the use of hooks, both of these projects outsource query planning and execution to third party libraries. In the case of pg_analytics, execution and planning are handled by DataFusion while pg_quack integrates with DuckDB. Both of these projects disable Postgres’s query planner, in favor of the plans created and executed by DataFusion and DuckDB, respectively to operate on data in Apache Arrow format.

Pg_analytics provides its own process utility hook to handle all alter table, drop, rename, truncate, and vacuum statements so that they are compatible with Apache Parquet.

![paradedb](./paradedb.png 'paradedb')

Talking with our friends at ParadeDB, pg_analytics is under active development and it is expected that it will mature rapidly. We’re looking forward to supporting this extension on  Tembo Cloud as the project matures.
