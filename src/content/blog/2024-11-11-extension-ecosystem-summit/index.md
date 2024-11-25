---
slug: extension-ecosystem-summit
title: 'Excitement about the PostgreSQL landscape at the Extensions Ecosystem Summit at PGConf EU'
authors: [floor, theory]
description: |
  We organized an event for Postgres extension developers and folks interested in contributing to the larger ecosystem. Here's what happened.
tags: [postgres, tde, pgvector, pgmq, pgrx]
date: 2024-11-11T09:00
# image: './tembonauts.png'
planetPostgres: true
---

October 22nd, my Tembo colleague David Wheeler and I convened a side event during PGConf EU in Athens, Greece: the [Extensions Ecosystem Summit](https://www.eventbrite.com/e/extension-ecosystem-summit-tickets-1022518730047). 36 participants heard from different maintainers of extensions and, in the second part of the day, joined conversations on how to contribute to existing extensions.

We appreciate the support from [Xata](https://xata.io/), [Timescale](https://www.timescale.com/) and [Percona](https://www.percona.com/), who joined as sponsors for the event.

Many extensions are built by individuals or (single) vendors. We therefore sought to increase visibility on these projects and inspire more people to contribute to them (or other extensions), and thus to broaden the foundation.

## State of the Postgres Extension Ecosystem - Past, present, and future

David kicked off with an [introduction to Postgres’ extensibility](https://drive.google.com/file/d/1TWhLKKvWfg-b90XZhVVbySBQOGL5FdjD/view?usp=drive_link). When Dimitri Fontaine added extensions functionality in Postgres 9.1, David saw an opportunity for an extension registry. [PGXN](https://pgxn.org) launched April 2011, soon followed by a [client](https://pgxn.github.io/pgxnclient/), developed by Daniele Varrazzo, and [dev utils](https://github.com/guedes/pgxn-utils), courtesy of Dickson S. Guedes.

While the Clouds support extensions (Azure supports 25, GCP 29, AWS 48), [PGXN counts 377](https://pgxn.org/about), but [the list Joel Jakobsson ]maintains](https://github.com/joelonsql/PostgreSQL-EXTENSIONs.md) counts 1,186. We’re only scratching the surface.

Postgres extensions remain difficult to find and discover, under-documented, difficult to gauge in terms of maturity level, and hard to configure and install. 

[Trusted Language Extensions](https://github.com/aws/pg_tle) aim to empower app developers. They’re easy to install via SQL, portable, hook into CREATE EXTENSION, and support custom data types… An interesting project by AWS & Supabase.

Another interesting project is pgrx, a framework for developing PostgreSQL extensions in Rust. pgrx is under active development by ZomboDB and PgCentral Foundation, and loved by the community for its developer experience.

New registries have popped up recently too! However, poor discovery still hinders adoption, as do insufficient docs, and extensions remain difficult to install. David is actively working on PGXN v2 to address exactly those pain points. Sounds interesting? Check the spec and get involved: [https://wiki.postgresql.org/wiki/PGXN_v2](https://wiki.postgresql.org/wiki/PGXN_v2)

## Time series analysis and visualization with pg_statviz

Jimmy Angelakos is a Senior Principal Engineer at Deriv. He maintains [pg_statviz](https://github.com/vyruss/pg_statviz), a “minimalist extension and utility pair for time series analysis and visualization of PostgreSQL internal statistics”.

pg_statviz tracks PostgreSQL performance over time, providing potentially useful data for tuning and troubleshooting. It’s created for:

* Snapshotting cumulative and dynamic statistics
* Performing time series analyses on them
* Creating visualizations for selected time ranges on the stored stats snapshots, using a Python utility built on Matplotlib

pg_statviz is all sql, no need to restart PostgreSQL. Your snapshots are stored in your database, so in pg. The extension can be used by superusers or any user with pg_monitor role privileges. 

pg_statviz participated in the 2023 Google Summer of Code and seeks external contributions. Jimmy specifically mentioned adding modules for additional stats to record (such as replication), as well as more data management/retention functions. pg_statviz is available via PostgreSQL’s YUM & APT repos, [PGXN](https://pgxn.org/dist/pg_statviz/) (extension), and [PyPI](https://pypi.org/project/pg_statviz/) (utility). 

## Message queueing with pgmq

Adam Hendel, Founding Engineer at Tembo, maintains [pgmq](https://github.com/tembo-io/pgmq), a lightweight message queue like AWS SQS and RSMQ, but on Postgres.

pgmq debuted in December 2022 as a Rust client library, because Tembo Cloud needed a message queue. In February 2023 it was ported to pgrx. Rust crates work well with Rust apps, but what if you're not using Rust? It took just 4 hours to convert from a Rust crate to pgrx Postgres extension., Any language can interact with pgmq when it's an extension! Still, Rust was not enough: it was difficult to install and compile times were slow. 

In May 2024 pgmq was rewritten in PL/pgSQL, making it easier to install via pgxs / pgxn / dbdev / trunk / pgxman. Adam is currently planning v2, and he can use the help! 

## Developing with Zig: pgzx

As pgrx is to Rust, pgzx is to [Zig](https://ziglang.org/). It allows one to write extensions using the Zig programming language. Gülçin Yıldırım Jelínek, Staff Engineer at Xata, works on [pgzx](https://github.com/xataio/pgzx). 

pgzx provides access to all Postgres APIs, and uses Zig memory allocators for memory safety and leak protection. Postgres error wrapper for logging & error handling. Development environment with regression & unit testing build in.

The Zig language offers excellent interoperability with C: can call C functions directly, use C types directly, and translate macros automatically. Gülçin praised Zig’s error handling, even if its 1.0 release is still a bit away. 

## AI tooling: pgvectorscale & pgai

James Sewell, Senior Staff Developer Advocate at Timescale, talked about [pgvectorscale](https://github.com/timescale/pgvectorscale) (a Rust extension) and [pgai](https://github.com/timescale/pgai) (Python). 

TimescaleDB of course created of the TimescaleDB C extension for time-series data. They also developed  the PGAI suite of extensions, bringing the capabilities of modern machine learning and AI directly into the database we already know and love.

Pgvectorscale accelerates [pgvector](https://github.com/pgvector/pgvector) for large scale workloads, offering high-accuracy filtered search and vector search indexing (StreamingDiskANN). pgai, meanwhile, offers embedding creation and in-database LLM reasoning (summarization, moderation,
categorization).

Both extensions seek external contributions.

## Transparent encryption with pg_tde

Alastair Turner, Technical Evangelist at Percona, presented [pg_tde](https://github.com/percona/pg_tde), which offers transparent  encryption of table contents at rest through a Table Access Method extension. Percona developed pg_tde to deliver the benefits of encryption at rest without requiring intrusive changes to the Postgres core.

Multiple efforts to include TDE in core Postgres have stalled, for good reasons perhaps, but that means TDE can only encrypt table content and not the write-ahead log or other logs, at least  for now. Currently in public beta, TDE requires a bit more extensibility than it currently exposes. Starting from an [SMGR patch
proposed by Neon](https://commitfest.postgresql.org/43/4428/), the intent is to encrypt/decrypt at the block level. The tech preview will ship in November, so keep your eyes peeled!

Alastair encourages new contributors to join the project: “Get the current Beta of the extension and try it out, and please give us some feedback!”

## What’s next?

We’ve collected the slides from all of the presentations in the [extensions-ecosystem-summit  repo](https://github.com/tembo-io/tembo-labs/tree/main/extensions-ecosystem-summit). 

We aim to create similar spaces to the Summit at every PostgreSQL event, where extension developers can meet and invite new contributors to the(ir) work. If your company would like to collaborate on future events and initiatives, please reach out: community@tembo.io