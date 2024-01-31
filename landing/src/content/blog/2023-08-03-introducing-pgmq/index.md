---
slug: introducing-pgmq
title: "Introducing PGMQ: Simple Message Queues built on Postgres"
authors: [adam]
tags: [postgres, announcement, queues, extensions]
image: './tembo-launch.png'
---

![tembo brand](./tembo-launch.png)

We've released [PGMQ](https://github.com/tembo-io/pgmq): a packaged extension for message queues on Postgres. Developers have been implementing queues on Postgres in many different ways and we're excited to combine lessons learned from those projects into a simple, feature-rich extension. You can try PGMQ on [Tembo Cloud](https://cloud.tembo.io/) as part of our [Message Queue Stack](https://tembo.io/docs/tembo-stacks/message-queue).

:::note Message Queue Stack

[Tembo Cloud](https://cloud.tembo.io/)'s Message Queue Stack is powered by PGMQ, but also ships with Postgres configurations optimized for message queue workloads. We also provide additional metrics and data visualizations specific to message queues.

:::

Some exciting features of the project include:

* Guaranteed exactly-once delivery of messages within a visibility timeout
* Optional archival of messages retention for replayability and retention
* Familiar SQL interface
* Single and Batch read of messages
* Client SDKs in both Rust and Python for an ORM-like feel

## The need for message queues

Message queues are a very common architectural feature used to manage operational pipelines, particularly for asynchronous tasks and distributed systems. There are products in the market that support message queues (Kafka, RSMQ, RabbitMQ, SQS); however, when adopting one of these technologies, you increase your cognitive load, required skills and production support overhead.

## Building your queues on Postgres

While building our own infrastructure, we ran into a need for a job queue to manage tasks between our control-plane and data-plane in our managed cloud offering. Our control-plane publishes tasks like `create postgres cluster`, and `update postgres cluster`.

Since we are a Postgres startup, we decided to build the queue on Postgres. Note that we are not the first to do this! Companies like [Dagster](https://dagster.io/blog/skip-kafka-use-postgres-message-queue) and [CrunchyData](https://www.crunchydata.com/blog/message-queuing-using-native-postgresql) have also implemented queues on Postgres and written about it; PostgresFM even dedicated [an entire podcast episode](https://postgres.fm/episodes/queues-in-postgres) to queues.

We are the first, however, to wrap it all up in a Postgres extension and share the implementation with the community.

## Queues Implemented with best practices

PGMQ was implemented on Postgres and follows industry best practices. One of the most important practices is the use of Postgres's [SKIP LOCKED](https://www.2ndquadrant.com/en/blog/what-is-select-skip-locked-for-in-postgresql-9-5/), which is similar to `NOWAIT` in other databases. `SKIP LOCKED` helps ensure that consumers don't hang. This is generally paired with `FOR UPDATE`, which locks the message and ensure it is not read twice. PGMQ also supports partitioning, which is particularly beneficial for large queues and can be used to efficiently archive / expire old messages.

PGMQ provides exactly-once delivery semantics within a visibility timeout. Similar to Amazon's SQS and RSMQ, PGMQ consumers set the period of time during which Postgres will prevent all consumers from receiving and processing a message. This is done by the consumer on read, and once the visibility timeout expires the message becomes available for consumption once again. That way, if a consumer crashes, there is no data loss. This effectively means at-least-once delivery semantics once the first visibility timeout has expired.

![vt](./vt.png "VisibilityTimeout")

## Using PGMQ

To get started, check out our [README](https://github.com/tembo-io/pgmq/blob/main/README.md#installation) to install the extension.


### Creating a Queue

You can create a new queue by simply calling

```sql
SELECT pgmq_create('my_queue');
```

### Sending Messages to Queue

Then, pgmq_send() a couple messages to the queue. The message id is returned from the send() function.

```sql
SELECT * from pgmq_send('my_queue', '{"foo": "bar1"}');
SELECT * from pgmq_send('my_queue', '{"foo": "bar2"}');
```

```text
 pgmq_send
-----------
         1
(1 row)

 pgmq_send
-----------
         2
(1 row)
```

### Reading from Queue

Read `2` messages from the queue. Make them invisible for `30` seconds. If the messages are not deleted or archived within 30 seconds, they will become visible again and can be read by another consumer.

```sql
SELECT * from pgmq_read('my_queue', 30, 2);
```

```text
 msg_id | read_ct |              vt               |          enqueued_at          |    message
--------+---------+-------------------------------+-------------------------------+---------------
      1 |       1 | 2023-02-07 04:56:00.650342-06 | 2023-02-07 04:54:51.530818-06 | {"foo":"bar1"}
      2 |       1 | 2023-02-07 04:56:00.650342-06 | 2023-02-07 04:54:51.530818-06 | {"foo":"bar2"}
```

If the queue is empty, or if all messages are currently invisible, no rows will be returned.

```sql
SELECT * from pgmq_read('my_queue', 30, 1);
```

```text
 msg_id | read_ct | vt | enqueued_at | message
--------+---------+----+-------------+---------
```

### Archiving from Queue

`Archiving` removes the message from the queue and inserts it to the queue's archive table. This provides you with an opt-in retention mechanism for messages, and is an excellent way to debug applications.

Archive the message with id 2.

```sql
SELECT * from pgmq_archive('my_queue', 2);
```

Then inspect the message on the archive table.

```sql
SELECT * from pgmq_my_queue_archive;
```

```text
 msg_id | read_ct |         enqueued_at          |          deleted_at           |              vt               |     message
--------+---------+------------------------------+-------------------------------+-------------------------------+-----------------
      2 |       1 | 2023-04-25 00:55:40.68417-05 | 2023-04-25 00:56:35.937594-05 | 2023-04-25 00:56:20.532012-05 | {"foo": "bar2"}```
```

### Deleting from Queue

Alternatively, you can delete a message forever.

```sql
SELECT * from pgmq_send('my_queue', '{"foo": "bar3"}');
```

```text
 pgmq_send
-----------
         3
(1 row)
```

```sql
SELECT pgmq_delete('my_queue', 3);
```

```text
 pgmq_delete
-------------
 t
 ```

## Getting involved

Give us a [star](https://github.com/tembo-io/pgmq) and try out PGMQ by cloning the [repo](https://github.com/tembo-io/pgmq) and following the example in the README. Please use Github issues if you run into any issues or have any feedback. We've also built client side libraries in [Rust](https://github.com/tembo-io/pgmq/tree/main/core) and [Python](https://github.com/tembo-io/pgmq/tree/main/tembo-pgmq-python), which will give you an ORM-like experience.

## Interested in learning more?

Check out [our post on pg_later](https://tembo.io/blog/introducing-pg-later), an extension we built on top of PGMQ as well as benchmarks comparing PGMQ to [SQS](https://aws.amazon.com/sqs/) and [Redis](https://redis.com/).

You can also try PGMQ on [Tembo Cloud](https://cloud.tembo.io/) for free as part of our [Message Queue Stack](https://tembo.io/docs/stacks/message-queue).
