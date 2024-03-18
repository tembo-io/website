Message queues let you send, read, and retain messages between applications without data loss or requiring all systems in a distributed system to be available. The MQ Stack is powered by [PGMQ](https://github.com/tembo-io/pgmq#sql-examples), a Postgres extension built and maintained by Tembo that provides a simple and consistent interface for creating queues and sending, receiving, deleting and archiving messages.

Tembo optimized this Postgres instance for Message queue workloads by tuning the Postgres configuration, implementing aggressive [autovacuum](https://postgresqlco.nf/doc/en/param/autovacuum/) configurations, installing the PGMQ extension, and creating a default database and user. The Message Queue Stack is a great way to get started with PGMQ and Postgres.

## Extensions

-   [pgmq](https://pgt.dev/extensions/pgmq) - `pgmq` implements a message queue with API parity with popular message queue services like AWS SQS and Redis RSMQ.
-   [pg_partman](https://pgt.dev/extensions/pg_partman) - `pg_partman` automates database tasks within PostgreSQL, enabling scheduled maintenance, recurring tasks, and interval-based SQL queries.
-   `pg_stat_statements` comes pre-installed and enabled. It provides statistics on SQL statements executed by the database, which helps users analyze query performance and identify areas for optimization.

## SQL API

For users familiar with Postgres, you can interact with your queues using SQL. The [PGMQ](https://github.com/tembo-io/pgmq) extension comes pre-installed in the Tembo Message Queue Stack.

Please refer to the [PGMQ API documentation](https://tembo-io.github.io/pgmq/api/sql/functions/) for a guide on getting started with PGMQ.

## REST API

Tembo cloud provides an HTTP interface to your Message Queue Stack which allows you to interact with your queues without SQL.

First, you'll need to gather some information from your Tembo instance. You'll need:

-   Tembo Data Domain - this is the same value as the host of your Tembo Postgres instance. For example, `org-acme-inst-my-first-database.data-1.use1.tembo.io`

-   Tembo API Token - you can [generate a new API token](https://cloud.tembo.io/generate-jwt) on the [Tembo Cloud Platform](https://cloud.tembo.io/generate-jwt)

Export these two values as environment variables:

```bash
export TEMBO_DATA_DOMAIN="your-data-domain"
export TEMBO_TOKEN="your-token"
```

All of PGMQ's [API functions](https://tembo-io.github.io/pgmq/api/sql/functions/) are available via the REST API.
The functions can be reached at `https://{TEMBO_DATA_DOMAIN}/pgmq/v1/<function_name>` and parameters passed as JSON in the request body.

We'll walk through the major functionality of the HTTP interface below.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

### Create a Queue

<Tabs>
<TabItem value="py" label="Python">

```py
import requests

TEMBO_DATA_DOMAIN = os.environ["TEMBO_DATA_DOMAIN"]
TEMBO_TOKEN = os.environ["TEMBO_TOKEN"]

resp = requests.post(
    url=f"https://{TEMBO_DATA_DOMAIN}/pgmq/v1/create",
    json={
        "queue_name": "my_demo",
    },
    headers={"Authorization": f"Bearer {TEMBO_TOKEN}"},
)
print(resp.status_code)
```

</TabItem>

<TabItem value="curl" label="Curl">

```bash
curl -X POST \
  -H "Authorization: Bearer ${TEMBO_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"queue_name": "my_demo"}' \
  "https://${TEMBO_DATA_DOMAIN}/pgmq/v1/create"
```

</TabItem>
</Tabs>

---

### List Queues

List all the queues currently in the database.

<Tabs>
<TabItem value="py" label="Python">

```py
resp = requests.post(
    url=f"https://{TEMBO_DATA_DOMAIN}/pgmq/v1/list_queues",
    headers={"Authorization": f"Bearer {TEMBO_TOKEN}"},
)
print(resp.status_code)
```

</TabItem>

<TabItem value="curl" label="Curl">

```bash
curl -X POST \
  -H "Authorization: Bearer ${TEMBO_TOKEN}" \
  -H "Content-Type: application/json" \
  "https://${TEMBO_DATA_DOMAIN}/pgmq/v1/list_queues"
```

</TabItem>
</Tabs>

The existing queues will be returned in the response:

```json
[
	{
		"queue_name": "my_demo",
		"created_at": "2023-11-02T14:31:06.130805+00:00",
		"is_partitioned": false,
		"is_unlogged": false
	}
]
```

---

### Send a Message

<Tabs>
<TabItem value="py" label="Python">

```py
resp = requests.post(
    url=f"https://{TEMBO_DATA_DOMAIN}/pgmq/v1/send",
    json={
        "queue_name": "my_demo",
        "msg": {"hello": "world-0"},
    },
    headers={"Authorization": f"Bearer {TEMBO_TOKEN}"},
)
resp.json()
```

</TabItem>

<TabItem value="curl" label="Curl">

```bash
curl -X POST \
  -H "Authorization: Bearer ${TEMBO_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"queue_name": "my_demo", "msg": {"hello": "world-0"}}' \
  "https://${TEMBO_DATA_DOMAIN}/pgmq/v1/send"
```

</TabItem>
</Tabs>

The message ID is returned from the request.

```json
[1]
```

---

### Send a Batch of Messages

To send multiple messages in a single request, use the `send_batch` endpoint.
The `msg` parameter becomes `msgs`, and accepts a list or array of json messages.

<Tabs>
<TabItem value="py" label="Python">

```py
resp = requests.post(
    url=f"https://{TEMBO_DATA_DOMAIN}/pgmq/v1/send_batch",
    json={
        "queue_name": "my_demo",
        "msgs": [
          {"hello": "world-1"},
          {"hello": "world-2"},
          {"hello": "world-3"},
          {"hello": "world-4"},
          {"hello": "world-5"},
        ],
    },
    headers={"Authorization": f"Bearer {TEMBO_TOKEN}"},
)
resp.json()
```

</TabItem>

<TabItem value="curl" label="Curl">

```bash
curl -X POST \
  -H "Authorization: Bearer ${TEMBO_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"queue_name": "my_demo", "msgs": [{"hello": "world-1"}, {"hello": "world-02"}, {"hello": "world-03"}, {"hello": "world-04"}, {"hello": "world-05"}]}' \
  "https://${TEMBO_DATA_DOMAIN}/pgmq/v1/send_batch"
```

</TabItem>
</Tabs>

The message IDs for all messages are returned in an array.

```json
[2, 3, 4, 5, 6]
```

---

### Read Messages

Read one or many message from the queue. Set the visibility timeout to 30 seconds, which will prevent all consumers from reading that message again for 30 seconds. Specify the number of messages you want to read with `qty`.

<Tabs>
<TabItem value="py" label="Python">

```py
resp = requests.post(
    url=f"https://{TEMBO_DATA_DOMAIN}/pgmq/v1/read",
    json={
        "queue_name": "my_demo",
        "vt": 30,
        "qty": 1
    },
    headers={"Authorization": f"Bearer {TEMBO_TOKEN}"},
)
resp.json()
```

---

</TabItem>
<TabItem value="curl" label="Curl">

```bash
curl -X POST \
  -H "Authorization: Bearer ${TEMBO_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"queue_name": "my_demo", "vt": 30, "qty": 1}' \
  "https://${TEMBO_DATA_DOMAIN}/pgmq/v1/read"
```

</TabItem>
</Tabs>

The messages are returned in an array. The message response also tells us how many times the message has been read (`read_ct`), and when the message first reached the queue (`enqueued_at`).

```json
[
	{
		"msg_id": 1,
		"read_ct": 1,
		"enqueued_at": "2023-11-02T15:00:39.396488+00:00",
		"vt": "2023-11-02T15:05:26.352591+00:00",
		"message": {
			"hello": "world-0"
		}
	}
]
```

---

### Archive a Single Message

Archiving a message will remove it from the queue, but it will still be available to be viewed via SQL on the queue's archive table.

Archive messages by passing the `queue_name` and the `msg_id`. We'll archive the message with ID=1.

<Tabs>
<TabItem value="py" label="Python">

```py
resp = requests.post(
    url=f"https://{TEMBO_DATA_DOMAIN}/pgmq/v1/archive",
    json={
        "queue_name": "my_demo",
        "msg_id": 1,
    },
    headers={"Authorization": f"Bearer {TEMBO_TOKEN}"},
)
resp.json()
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash
curl -X POST \
  -H "Authorization: Bearer ${TEMBO_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"queue_name": "my_demo", "msg_id": 1}' \
  "https://${TEMBO_DATA_DOMAIN}/pgmq/v1/archive"
```

</TabItem>
</Tabs>

Single message archive returned a boolean indicating the success or failure of the operation. If the message does not exist it will return `False`, otherwise it is `True`.

```json
true
```

---

### Archive a Batch of Messages

Same rules apply to batch archive as single message archive. However, you simple pass an array of `msg_ids` to instead of a single `msg_id`.

<Tabs>
<TabItem value="py" label="Python">

```py
resp = requests.post(
    url=f"https://{TEMBO_DATA_DOMAIN}/pgmq/v1/archive",
    json={
        "queue_name": "my_demo",
        "msg_ids": [2, 3],
    },
    headers={"Authorization": f"Bearer {TEMBO_TOKEN}"},
)
resp.json()
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash
curl -X POST \
  -H "Authorization: Bearer ${TEMBO_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"queue_name": "my_demo", "msg_ids": [2, 3]}' \
  "https://${TEMBO_DATA_DOMAIN}/pgmq/v1/archive"
```

</TabItem>
</Tabs>

The response will show which message IDs were successfully archived. If a message ID does not exist then it's ID will not be returned.

```json
[2, 3]
```

---

### Delete a Message

Deleting messages removing them completely from the system. Specify the queue name and the message ID that you want to delete.
If the message does not exist it will return `False`, otherwise it is `True`.

<Tabs>
<TabItem value="py" label="Python">

```py
resp = requests.post(
    url=f"https://{TEMBO_DATA_DOMAIN}/pgmq/v1/delete",
    json={
        "queue_name": "my_demo",
        "msg_id": 4,
    },
    headers={"Authorization": f"Bearer {TEMBO_TOKEN}"},
)
resp.json()
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash
curl -X POST \
  -H "Authorization: Bearer ${TEMBO_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"queue_name": "my_demo", "msg_id": 4}' \
  "https://${TEMBO_DATA_DOMAIN}/pgmq/v1/archive"
```

</TabItem>
</Tabs>

```json
true
```

---

### Delete a batch of Messages

You can delete several messages in one HTTP request similar to a single message request. Simply pass an array of `msg_ids` instead of a single `msg_id`.

<Tabs>
<TabItem value="py" label="Python">

```py
resp = requests.post(
    url=f"https://{TEMBO_DATA_DOMAIN}/pgmq/v1/delete",
    json={
        "queue_name": "my_demo",
        "msg_ids": [5, 6],
    },
    headers={"Authorization": f"Bearer {TEMBO_TOKEN}"},
)
resp.json()
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash
curl -X POST \
  -H "Authorization: Bearer ${TEMBO_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"queue_name": "my_demo", "msg_ids": [5, 6]}' \
  "https://${TEMBO_DATA_DOMAIN}/pgmq/v1/archive"
```

</TabItem>
</Tabs>

The response will show which message IDs were successfully deleted. If a message ID does not exist then it's ID will not be returned.

```json
[5, 6]
```
