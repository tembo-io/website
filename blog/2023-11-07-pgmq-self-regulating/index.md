---
slug: pgmq-self-regulating-queue
title: "PGMQ: No More Background Worker"
authors: [adam]
tags: [postgres, message-queue, pgmq]
---

<div style={{width: '75%'}}>

![image](./tembo-queue.png)

</div>

When building a queue on Postgres, you have several important design decisions to make related to the mechanisms for identifying messages able to be read, how messages are marked as ‘in-progress’, and finally the mechanism for marking messages as ‘complete’. FOR UPDATE and SKIP LOCKED are amazing Postgres features that help with how messages are read and marked as in-progress, but  do not help with marking messages as ‘complete’. Many people resort to implementing a “watcher process” or background worker to oversee the queues and check on the status of messages—but there’s a better way. By designing with a visibility timeout, we can further simplify the architecture to require no external processes for queue management. PGMQ is a Postgres extension built following this self-regulating queue.

## Core Postgres Features

FOR UPDATE and SKIP LOCKED are likely two recommendations you’ll come across. FOR UPDATE helps ensure that just a single consumer receives a message in the queue. And SKIP LOCKED is required if you want to have multiple consumers on the same queue – without it each consumer would wait for the others to remove their locks. Those are two great features of Postgres, so let’s quickly review them.

## FOR UPDATE: Ensuring Exclusive Access

Imagine a crowded store with a single cashier. As customers approach the counter, the cashier must serve them one at a time, ensuring each transaction is complete before moving on to the next. Similarly, when working with a queue, it's essential to ensure that only one process or transaction works with a particular row of data at a time. This is where FOR UPDATE comes into play.

The FOR UPDATE clause is used to lock selected rows, preventing other transactions from modifying or locking them until the current transaction ends. This ensures that once a task (or row in our queue) is picked up, it isn't grabbed by another worker or process simultaneously. It guarantees exclusive access, much like how our lone cashier attends to a single customer at a time.

## SKIP LOCKED: Keeping the Line Moving

Back to our store analogy, if a customer isn't ready to check out and holds up the line, it can cause unnecessary delays for the other customers. What if, instead, those who aren't ready simply step aside, allowing others to continue? That would undoubtedly speed up the checkout process. This is the concept behind SKIP LOCKED.

When combined with FOR UPDATE, the SKIP LOCKED clause ensures that if a row is locked by another transaction, it gets skipped over, and the next available row is selected. This way, other workers or processes don't get stuck waiting for a locked row to be released; they simply move on to the next available task.

By using these two clauses together, you can ensure that tasks in your queue are processed smoothly and efficiently, with each task getting picked up by a single worker and other workers moving seamlessly to the next available task.

However, how can we take this one step further? Many queue implementations have us using FOR UPDATE to mark a message as “in progress” which is great. However, that typically requires us to have a service external to postgres which monitors the queue to check for messages which have been “in progress” for too long.

## Self-Regulating Queues in PostgreSQL

If you’re using FOR UPDATE SKIP LOCKED, and setting messages “in progress”, you most likely need a process to watch your queue and check for messages that have been processing for too long. Rather than running a background worker or external process, PGMQ implements a Visibility Timeout (VT). A VT is a designated period during which a message, once read from the queue, becomes invisible to other consumers or workers. This ensures that once a worker picks up a task, other workers won't attempt to process the same task for the duration of this timeout. If the original worker fails to complete the task within the specified timeout, the task becomes visible again by nature of time elapsing past the specified VT, which means PGMQ still provides an at-least-once delivery guarantee even when the VT has elapsed. The task is ready for reprocessing by the same or a different worker.

In essence, the visibility timeout provides a grace period for tasks to be processed. It becomes a buffer against potential failures, ensuring that if a task isn’t completed due to any unforeseen reasons, it doesn’t get lost but rather re-enters the queue. Without something like the VT, queue systems will need to run a process to watch the queue. If that watcher crashes, or loses connection, then messages will stay unavailable until the watcher is recovered.

## Queue regulation isn’t just for error modes

A common use case is for a consumer that needs to process a long-running I/O bound task. Let’s say there is a message with a task to create some infrastructure in your favorite [cloud provider](https://cloud.tembo.io), e.g. create an EC2 instance if it doesn’t already exist. That could take minutes to start up. Your consumer can submit the request to provision EC2, and then instead of waiting for EC2 to create, it can set the VT on that message to 60 seconds from now, then move on to read the next message. In 60 seconds, the message will become visible again and can be picked up.  That can look something like the follow pseudo-code:

```text
# read a message, make it invisible for 30 seconds
select pgmq.read(‘task_queue’, 30, 1)

...check if S3 bucket already already created
...request to create S3 bucket if not exists

# set message VT to 60 seconds from now If not exists: 
select pgmq.set_vt(‘task_queue’, <msg_id>, 60)

# consumer archives or deletes the message when its finished with its job
select pgmq.archive('test_queue', <msg_id>)
```

With PGMQ’s design, messages do not leave the queue until they are explicitly archived or deleted, so you could think of using the VT directly as “returning the message to the queue”, even though it technically never left the queue. Rather, returning it to a state that can be read by other consumers.

## Choose the simplest queue architecture with PGMQ

Use `FOR UPDATE` so that you ensure messages are only read by one consumer at time. `SKIP LOCKED` so that you can have multiple workers processing messages concurrently. Finally, implement a visibility timeout so that you no longer need to rely on an external process to handle messages that have failed to process. Install the open-source [PGMQ extension](https://github.com/tembo-io/pgmq) for Postgres or try it on [Tembo Cloud](https://cloud.tembo.io) today and immediately benefit from all of these design decisions.
