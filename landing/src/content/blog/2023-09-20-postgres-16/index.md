---
slug: postgres-16
title: "Postgres 16: The exciting and the unnoticed"
authors: [samay]
tags: [postgres]
image: './postgres-16.png'
---

In case you missed it, Postgres 16 came out last week - and this year it arrived earlier than the last few years. There are many features that I’ve been looking forward to for the last few months and I’m excited to see them get into the hands of users. Before we dive into the specific features of this release, let’s discuss what a Postgres major release actually means.

![postgres-16](./postgres-16.png "PG16")


## Postgres Releases

The PostgreSQL Global Development Group releases a new _major_ [version](https://www.postgresql.org/support/versioning/) every year with new features.

In addition, Postgres releases minor versions of each major release every 3 months or so with bug fixes and security fixes. No new features are released in minor versions, and that’s what makes major version releases so exciting as it’s the culmination of about a year’s worth of development work on the project.

While there's a case to be made for faster release of features, Postgres prides itself on stability and this release cadence provides enough time for features to be proposed, reviewed, committed and tested before they get shipped.


## Should I upgrade to Postgres 16?

If you are building a new application, yes, I would recommend that you start with the latest major version of Postgres. This will guarantee the latest and greatest features, and a continuous flow of minor releases that fix bugs and improve the security of your database.

If you are upgrading an existing system, there are more factors to consider. The general advice is to **upgrade minor versions** always - because they contain security and bug fixes and the risk of not upgrading is higher.

However, for major versions, you will need to consider the tradeoffs as the major versions usually change the internal format of system tables and data files. That means, you can’t just use previous versions of the data directory — you’ll need to use `pg_dump` / `pg_restore` or [pg_upgrade](https://www.postgresql.org/docs/current/pgupgrade.html) to upgrade. In addition, depending on the features you are using and the Postgres release, manual changes to your code or queries may also be required.

Obviously, another important factor if you are using a managed service provider is when they provide support for Postgres 16. At [Tembo Cloud](https://cloud.tembo.io/), we’ve already started working on supporting Postgres 16 and expect it to be available in a few weeks.


## What’s most exciting about Postgres 16?

Postgres 16 delivers exciting features in all aspects of the database ranging from performance improvements, monitoring enhancements, better security and privilege handling, replication improvements, new server features and commands and a lot more.

If you’re interested in the complete list of features, you can read the detailed [release notes](https://www.postgresql.org/docs/16/release-16.html). Below, I’ll talk about the aspects of this release which excite me the most and we will talk about a few not-so-talked about features which lay the groundwork for more exciting features in Postgres 17.


### Logical replication improvements

[Logical replication](https://www.postgresql.org/docs/current/logical-replication.html) is a feature I’ve always been interested in, as it allows you to expand the capabilities of Postgres by moving data between different Postgres databases or from Postgres to other databases. It finds interesting use cases in: replicating selectively from one database to another, replicating across Postgres versions, online migrations and allowing consolidation from multiple databases.

This release, arguably the most exciting logical replication feature, is allowing [logical replication from standby servers](https://pganalyze.com/blog/5mins-postgres-16-logical-decoding). Prior to this feature, you could only create a logical replication slot on the primary which meant adding more replicas would add more load on the primary. With Postgres 16, secondaries also have the ability to create replication slots allowing for more distribution of that load. What’s more is that the replication slots on the secondary are persisted even when the standby is promoted to the primary. This means that subscribers won’t be affected even during a failover! You can read more about this feature in Bertrand’s [blog post](https://bdrouvot.github.io/2023/04/19/postgres-16-highlight-logical-decoding-on-standby/).

The short of it is that now you can do this on a Postgres 16 standby:

```
postgres@standby=# select pg_is_in_recovery();
 pg_is_in_recovery
-------------------
 t
(1 row)

postgres@standby=# SELECT * FROM pg_create_logical_replication_slot('active_slot', 'test_decoding', false, true);
  slot_name  |    lsn
-------------+------------
 active_slot | 0/C0053A78
(1 row)
```

On Postgres 15, the same thing would have errored out:
```
postgres@standby=# SELECT * FROM pg_create_logical_replication_slot('active_slot', 'test_decoding', false, true);
ERROR:  logical decoding cannot be used while in recovery
```

In addition to this, there are a number of other logical replication performance improvements. This includes faster initial table sync using [binary format](https://www.postgresql.org/message-id/flat/TYCPR01MB8373B593010467315C2BA8EBED229%40TYCPR01MB8373.jpnprd01.prod.outlook.com#be8109723de40d3724730713175517ab), use of [btree indexes](https://www.postgresql.org/message-id/flat/CACawEhX6TvX%2Bj8EpcpCKvnMGao8Gcp8W43Sgc87pg9o6-Xbf2Q%40mail.gmail.com#81e7ec5c7732e7492c9e28d0f38df657) during logical replication apply when tables don’t have a primary key (previously the table would be scanned sequentially) and parallel application of large transactions (~25-40% speedups).


### Monitoring improvements

The other bucket of features which intrigued me are the monitoring enhancements. While Postgres provides a number of statistics tables with monitoring information, I believe more can be done to provide actionable insights to users. As an example, Lukas pointed out several interesting gaps in Postgres monitoring in his [PGCon 2020 talk](https://www.pgcon.org/events/pgcon_2020/sessions/session/132/slides/49/Whats%20Missing%20for%20Postgres%20Monitoring.pdf).

Coming back to this release, [`pg_stat_io`](https://www.postgresql.org/docs/16/monitoring-stats.html#MONITORING-PG-STAT-IO-VIEW) has to be the most useful piece of information added to the Postgres stats views in Postgres 16. It allows you to understand the I/O done by Postgres at a more granular level, broken down by `backend_type` and `context`. This means you can calculate a more accurate cache hit ratio by ignoring the I/O done by VACUUM, differentiate between `extends` and `flushes`, and separate out bulk operations while deciding which configurations to tune. Melanie talks about this and much more in her [talk](https://www.youtube.com/watch?v=rCzSNdUOEdg) and this [blog post](https://www.depesz.com/2023/02/27/waiting-for-postgresql-16-add-pg_stat_io-view-providing-more-detailed-io-statistics/) approaches how you would use this as a DBA.

Here is an example of the statistics you can see in `pg_stat_io`:

```
$ SELECT * FROM pg_stat_io ;
    backend_type     │   io_object   │ io_context │  reads  │ writes  │ extends │ op_bytes │ evictions │ reuses  │ fsyncs │          stats_reset
─────────────────────┼───────────────┼────────────┼─────────┼─────────┼─────────┼──────────┼───────────┼─────────┼────────┼───────────────────────────────
 autovacuum launcher │ relation      │ bulkread   │       0 │       0 │  [NULL] │     8192 │         0 │       0 │ [NULL] │ 2023-02-27 13:25:39.725072+01
 ...
 autovacuum worker   │ relation      │ bulkread   │       0 │       0 │  [NULL] │     8192 │         0 │       0 │ [NULL] │ 2023-02-27 13:25:39.725072+01
 ...
 client backend      │ temp relation │ normal     │       0 │       0 │       0 │     8192 │         0 │  [NULL] │ [NULL] │ 2023-02-27 13:25:39.725072+01
 background worker   │ relation      │ bulkread   │  268221 │  268189 │  [NULL] │     8192 │         0 │  268189 │ [NULL] │ 2023-02-27 13:25:39.725072+01
 ...
 checkpointer        │ relation      │ normal     │  [NULL] │   32121 │  [NULL] │     8192 │    [NULL] │  [NULL] │   3356 │ 2023-02-27 13:25:39.725072+01
 standalone backend  │ relation      │ bulkread   │       0 │       0 │  [NULL] │     8192 │         0 │       0 │ [NULL] │ 2023-02-27 13:25:39.725072+01
 ...
 startup             │ relation      │ vacuum     │       0 │       0 │       0 │     8192 │         0 │       0 │ [NULL] │ 2023-02-27 13:25:39.725072+01
 walsender           │ relation      │ bulkread   │       0 │       0 │  [NULL] │     8192 │         0 │       0 │ [NULL] │ 2023-02-27 13:25:39.725072+01
 ...
 walsender           │ temp relation │ normal     │       0 │       0 │       0 │     8192 │         0 │  [NULL] │ [NULL] │ 2023-02-27 13:25:39.725072+01
...
```

In addition to this, there are other improvements including the addition of `last_seq_scan` and `last_idx_scan` on `pg_stat_*` tables which allow you to understand index usage better and figure out when plans for a query might have changed.


### Special mentions

Like I said, each release comes with many improvements - and I could not outline them all in a blog post (and if I did, nobody would read it!). But I do want to mention a few other items in Postgres 16 that I won’t be able to dive deeper into but are interesting as well.


* Load balancing with multiple hosts in `libpq`: This feature allows to balance the load across Postgres read replicas directly within `libpq` (which is the foundational Postgres client library) without having to use another load balancer. You can read [this blog post](https://mydbops.wordpress.com/2023/05/07/postgresql-16-brings-load-balancing-support-in-libpq-psql/) on how this new feature is implemented and can be used.
* Performance: I won’t repeat what’s in the release notes but there’s a long list of performance improvements in this release. There’s support for more parallelism on `FULL` and `OUTER` `JOINs` and on more aggregates, greater usage of incremental sorts, window function optimizations and even an upto 300% performance improvement in `COPY`.
* `VACUUM` improvements: Last thing I’d mention is improvements to `VACUUM` which include freezing performance improvements, ability to increase (or decrease) shared buffer usage by `VACUUM`, and faster loading of `VACUUM` configs.


## Laying the groundwork for an exciting Postgres 17 (and beyond)

All of the features mentioned above can immediately add a lot of value to your Postgres usage, but there are new features which lay the groundwork for powerful features in future releases. I’ll quickly touch upon three items that I believe are noteworthy:



* Direct IO and Async IO in Postgres: In Postgres 16, several building blocks for implementing direct and [asynchronous IO](https://www.youtube.com/watch?v=CD0w3gWBF7s) for Postgres were committed. This includes reduced contention on the relation extension lock and addition of Direct IO as a developer only option via the `debug_io_direct` setting. This important but hard work has been ongoing for several releases and Postgres 17 will likely be the first release where users will be able to utilize these features.
* Moving towards Active Active replication: A feature was committed in Postgres 16 to allow logical replication to avoid replication loops, which is when a transaction gets replicated from source to target and back. Postgres 16 allows subscribers to process only changes which have no origin which allows you to prevent these loops. Bi-directional active-active replication is still very complicated and requires solving a lot of problems, but this feature tackles one of those important sub-problems.
* Migration of the build system to Meson: This might have slipped under your radar but in this release, Postgres added support for a new build system which is expected to replace the Autoconf and Windows based build systems. Why, you might ask? Andres makes a compelling case for it in [this thread](https://www.postgresql.org/message-id/flat/20211012083721.hvixq4pnh2pixr3j%40alap3.anarazel.de) if you’re interested but some reasons include faster build times, simpler dependency management and moving towards a common build system across Linux and Windows.


## Postgres continues to deliver

With every new release, Postgres becomes more and more compelling and adds great features that improve the experience of its users. I recommend you check out the [press release](https://www.postgresql.org/about/news/postgresql-16-released-2715/), and [the release notes](https://www.postgresql.org/docs/16/release-16.html) to see everything coming along with this new release.

And if you want to try out the full power of Postgres including its powerful extension ecosystem on a managed service, try out [Tembo Cloud](https://cloud.tembo.io/).
