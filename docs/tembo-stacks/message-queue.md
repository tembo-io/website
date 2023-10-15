---
sidebar_position: 6
---

# Tembo Message Queue

Message queues let you send, read, and retain messages between applications without data loss or requiring all systems in a distributed system to be available. The MQ Stack is powered by [PGMQ](https://github.com/tembo-io/pgmq#sql-examples), a Postgres extension built and maintained by Tembo that provides a simple and consistent interface for creating queues and sending, receiving, deleting and archiving messages.

The Message Queue Stack is a Postgres cluster with PGMQ pre-installed. Infrastructure and Postgres configurations are optimized for message queue workloads. To get the most out of the Message Queue Stack, visit the [PGMQ documentation](https://github.com/tembo-io/pgmq#sql-examples) for a guide on getting started with PGMQ.

## PGMQ Features

- Lightweight, built with Rust and Postgres only
- Guaranteed "exactly once" delivery of messages to consumers within a visibility timeout
- API parity with [AWS SQS](https://aws.amazon.com/sqs/) and [RSMQ](https://github.com/smrchy/rsmq)
- Messages stay in the queue until explicitly deleted
- Messages can be archived, instead of deleted, for long-term retention and replayability
- Table (bloat) maintenance automated with [pg_partman](https://github.com/pgpartman/pg_partman)
- High performance operations with index-only scans.

## Credits

* The [PGMQ](https://github.com/tembo-io/pgmq) extension
