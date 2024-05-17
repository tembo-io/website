---
slug: pg-timeseries
title: 'Introducing pg_timeseries: Open-source time-series extension for PostgreSQL'
authors: [samay, jason]
tags: [postgres, extensions, stacks]
image: './timeseriesBlogImg.png'
date: 2024-05-20T09:00
description: This blog introduces pg_timeseries - a PostgreSQL extension focused on creating a cohesive user experience around the creation, maintenance, and use of time-series tables.
---

We are excited to launch `pg_timeseries`: a PostgreSQL extension focused on creating a cohesive user experience around the creation, maintenance, and use of time-series tables. You can now use pg_timeseries to create time-series tables, configure the compression and retention of older data, monitor time-series partitions, and run complex time-series analytics functions with a user-friendly syntax. pg_timeseries is [open-sourced](https://github.com/tembo-io/pg_timeseries) under the PostgreSQL license and can be added to your existing PostgreSQL installation or tried as a part of the [Timeseries Stack](https://tembo.io/docs/product/stacks/analytical/timeseries) on [Tembo Cloud](https://cloud.tembo.io/).


# What is time-series data?

Put simply, time-series data is a collection of data points, each with a timestamp attached. These could be stock prices recorded throughout a trading day, temperature and availability data returned from devices and sensors, or web traffic on a website. Time-series workloads typically include queries filtering by time (generally for some degree of recency) and aggregation queries to summarize the data for analytics.

![time-series](./ts-wiki.png 'time-series')


## Using PostgreSQL for Time-series workloads

We believe that PostgreSQL can be used to [power any data workload](https://tembo.io/blog/tembo-manifesto) thanks to its extensions and ecosystem tools. Therefore, at Tembo, we aim to make it easy for users to [use the entire PostgreSQL ecosystem](https://tembo.io/blog/ga) to reduce the complexity of the modern data stack.

In the last year, we’ve built several [stacks](https://tembo.io/docs/product/stacks/intro-to-stacks) and extensions that help you run [analytics](https://tembo.io/docs/product/stacks/analytical/data-warehouse), [AI](https://tembo.io/docs/product/stacks/ai/vectordb), and [operational](https://tembo.io/docs/product/stacks/transactional/oltp) workloads on PostgreSQL. However, our customers’ most requested stack has been one able to store and act upon their time-series data. That way, they can store all of their data with a single PostgreSQL provider who can meet all their needs.

You may already be asking: "why not just power the stack using [TimescaleDB](https://github.com/timescale/timescaledb)?" The Timescale License would restrict our use of features such as compression, incremental materialized views, and bottomless storage. With these missing, we felt that what remained would not provide an adequate basis for our customers’ time-series needs. Therefore, we decided to build our own PostgreSQL-licensed extension.


## Building blocks for pg_timeseries

To efficiently store and query time-series data, there are a few requirements:

* Easily manage time-series data
* Deal with high-throughput ingest
* Answer range queries fast
* Efficiently store large amounts of data
* Run complex analytics functions

PostgreSQL has several features that provide the right building blocks to solve these requirements. Features such as [native partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html), variety of [indexes](https://www.postgresql.org/docs/current/indexes.html), [materialized views](https://www.postgresql.org/docs/current/rules-materializedviews.html), and [window / analytics functions](https://www.postgresql.org/docs/current/tutorial-window.html) provide the main functionality. Several extensions add additional features to PostgreSQL to make it even better: [pg_partman](https://github.com/pgpartman/pg_partman) for partition management, [pg_cron](https://github.com/citusdata/pg_cron) for scheduling jobs, [columnar](https://github.com/hydradatabase/hydra/tree/main/columnar) for compression, [pg_ivm](https://github.com/sraoss/pg_ivm) for incremental materialized views, and [pg_tier](https://github.com/tembo-io/pg_tier) for long-term offloading of older partitions.

Making all of these components work together cohesively is a tall order, and is hard for most users. pg_timeseries aims to solve this problem.


## pg_timeseries: The simplest way to manage your time-series data in PostgreSQL

pg_timeseries combines the functionality of extensions such as pg_partman, pg_cron, and Hydra’s columnar in order to provide a unified and intuitive interface for managing and querying time-series tables. The PostgreSQL ecosystem has contained many approaches to various aspects of time-series workloads for years and pg_timeseries does the work of making sure all PostgreSQL users experience how these tools work together to make time-series workloads a cinch.

All pg_timeseries requires to get started is a table with a time-like column, partitioned on that column. After that, simply call [enable_ts_table](https://github.com/tembo-io/pg_timeseries/blob/main/doc/reference.md#enable_ts_table):


```
    CREATE TABLE measurements (
      metric_name text,
      metric_value numeric,
      metric_time timestamptz NOT NULL
    ) PARTITION BY RANGE (metric_time);

    SELECT enable_ts_table('measurements');
```


The extension includes various views such as [ts_table_info](https://github.com/tembo-io/pg_timeseries/blob/main/doc/reference.md#ts_table_info) and [ts_part_info](https://github.com/tembo-io/pg_timeseries/blob/main/doc/reference.md#ts_part_info) to surface important information about your tables and partitions:


```
    SELECT table_id, table_size_bytes FROM ts_table_info;

    ┌──────────────┬──────────────────┐
    │   table_id   │ table_size_bytes │
    ├──────────────┼──────────────────┤
    │ measurements │            98304 │
    └──────────────┴──────────────────┘

	SELECT * FROM ts_part_info;

    ┌─[ RECORD 1 ]─────┬───────────────────────────────┐
    │ table_id         │ measurements                  │
    │ part_id          │ measurements_p20240411        │
    │ part_range       │ FOR VALUES FROM ('2024-04-11 …│
    │                  │…00:00:00+00') TO ('2024-04-18…│
    │                  │… 00:00:00+00')                │
    │ table_size_bytes │ 8192                          │
    │ access_method    │ heap                          │
    ├─[ RECORD 2 ]─────┼───────────────────────────────┤
    │ table_id         │ measurements                  │
    │ part_id          │ measurements_p20240418        │
    │ part_range       │ FOR VALUES FROM ('2024-04-18 …│
    │                  │…00:00:00+00') TO ('2024-04-25…│
    │                  │… 00:00:00+00')                │
    │ table_size_bytes │ 8192                          │
    │ access_method    │ heap                          │
    └──────────────────┴───────────────────────────────┘
```


As partitions “age out” of your time-series tables, you can choose whether to have them compressed using columnar storage, deleted entirely, or both. For example, the following will cause partitions to be compressed if their data is older than 90 days, and will drop them entirely after one year:


```
    SELECT set_ts_compression_policy('measurements', '90 days');
    SELECT set_ts_retention_policy('measurements', '365 days');
```


Finally, pg_timeseries includes additional functions like [locf](https://github.com/tembo-io/pg_timeseries/blob/main/doc/reference.md#locf), [last](https://github.com/tembo-io/pg_timeseries/blob/main/doc/reference.md#firstlast) and [date_bin_table](https://github.com/tembo-io/pg_timeseries/blob/main/doc/reference.md#date_bin_table) to make writing time-series queries easier. We know SQL can sometimes be hard to wrangle into doing what you want with time-series data, so these functions were written to enhance query maintainability. For instance, the following will bin data in the specified range by hour and fill any missing hours with the previous reading. It also includes the name of the metric in each hour with the highest reading:


```
    SELECT
      locf(avg(metric_value)) OVER (ORDER BY metric_time) avg_val,
      last(metric_name, metric_value) highest,
      metric_time
    FROM date_bin_table(NULL::measurements, '1 hour', '[2024-05-09,2024-06-07]')

    ┌──────────┬─────────┬────────────────────────┐
    │  avg_val │ highest │      metric_time       │
    ├──────────┼─────────┼────────────────────────┤
    │        ∅ │       ∅ │ 2024-05-09 15:00:00+00 │
    │     3.00 │       3 │ 2024-05-09 16:00:00+00 │
    │    55.00 │    temp │ 2024-05-09 17:00:00+00 │
    │    55.00 │    temp │ 2024-05-09 18:00:00+00 │
    │    17.00 │     cpu │ 2024-05-09 19:00:00+00 │
    │    17.00 │     cpu │ 2024-05-09 20:00:00+00 │
    │    23.00 │    disk │ 2024-05-09 21:00:00+00 │
    │    23.00 │    disk │ 2024-05-09 22:00:00+00 │
    │    84.00 │    eth0 │ 2024-05-09 23:00:00+00 │
    │    49.00 │    eth1 │ 2024-05-10 00:00:00+00 │
    │    49.00 │    eth1 │ 2024-05-10 01:00:00+00 │
    └──────────┴─────────┴────────────────────────┘
```



## We’re just getting started

We know building a full-featured time-series extension for PostgreSQL requires a lot of pieces. However, we’re committed to building them in the open, with the community. The current roadmap includes the following features:

* Offloading older partitions to cold storage such as S3
* Approximate functions for efficient analytics
* Incremental materialized views
* Roll-up and roll-off of older partitions
* Additional analytics helper functions

The entire planned roadmap is present on the [GitHub README](https://github.com/tembo-io/pg_timeseries/tree/main?tab=readme-ov-file#roadmap) and features will be prioritized based on demand from users. Our next addition is going to be plugging in [pg_tier](https://github.com/tembo-io/pg_tier) with pg_timeseries to allow offloading older tables to cold storage such as S3.

The simplest way to try out pg_timeseries is spinning up a free instance of the Timeseries stack on Tembo Cloud. We look forward to your feedback!

