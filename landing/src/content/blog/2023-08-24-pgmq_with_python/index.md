---
slug: pgmq-with-python
title: "Using pgmq with Python"
authors: [rjzv]
tags: [postgres, pgmq, python, extensions]
image: './pgmq.png'

---

![pgmq](./pgmq.png)

In my recent search for something interesting to do with Rust, I discovered that people write postgres extensions using [pgrx](https://github.com/pgcentralfoundation/pgrx).

I found that very cool, and while looking for some real-world examples to study and dissect, I came across [pgmq](https://tembo.io/blog/introducing-pgmq): "A lightweight message queue. Like AWS SQS and RSMQ but on Postgres." So, I decided to give it a shot so that perhaps in the future, I can contribute to the project ;)

When reviewing the [repository](https://github.com/tembo-io/pgmq), I noticed a [Python client](https://github.com/tembo-io/pgmq/tree/main/tembo-pgmq-python) to interact with pgmq and began to play with it.

Let me quickly describe how easy it was for me to use it.


## Setting up the environment

The first step was to start Postgres with a docker container. You can check the [README](https://github.com/tembo-io/pgmq) for detailed instructions, but in summary, just run:

```console
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 quay.io/tembo/pgmq-pg:latest
```

A quick test to make sure that Postgres is running:

```console
psql postgres://postgres:postgres@0.0.0.0:5432/postgres
```

After that, I simply installed the pgmq Python client in my virtual environment:

```console
pip install tembo-pgmq-python
```

That's all the setup that I needed.


## The PGMQueue class

To use the library, we need to instantiate a PGMQueue object and from that object we can call the methods described in the following table:


| SQL function                             | PGMQueue method                                                           | Description                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| pgmq\_create(queue)                     | create\_queue(self, queue: str)   | Creates a new queue with the name queue.                                 |
| pgmq\_send(queue, message)            | send(self, queue: str, message: dict, delay: Optional[int] = None) | Appends a message to the queue.                                        |
| pgmq\_read(queue, vt, num\_messages) | read(self, queue: str, vt: Optional[int] = None) | Reads num\_messages from queue and sets the visibility timeout to vt. |
| pgmq\_archive(queue, msg\_id)          | archive(self, queue: str, msg\_id: int) | Archives the message with msg\_id.                                        |
| pgmq\_pop(queue)                        | pop(self, queue: str) | Pop the next message in the queue.                                       |
| pgmq\_delete(queue, msg\_id)           | delete(self, queue: str, msg\_id: int) | Deletes the message with msg\_id from the queue.                        |
| pgmq\_drop\_queue(queue)                 | Not available yet | Drops the queue. |

Next, let me show you how to implement a simple producer/consumer setup using the methods above.


## Implementing a Producer

In summary, the required steps are:
1. Import the Messages and PGMQueue classes.
2. Instantiate a PGMQueue object.
3. Create a queue.
4. Send N messages via the queue in a loop.

```py
from tembo_pgmq_python import Message, PGMQueue

queue = PGMQueue(**connection_info)
queue.create_queue(test_queue)
...

for x in range(num_messages):
    ...
    msg_id = queue.send(test_queue, test_message)
    ...
```

The PGMQueue constructor is the one that receives the connection information. For the Postgres instance initiated by the docker container, the connection details are:

```py
queue = PGMQueue(host="localhost",
                port=5432,
                username="postgres",
                password="postgres",
                database="postgres")
```


## Implementing a Consumer

In short, the code should basically do:
Import the Messages and PGMQueue classes.
Consume the messages from the queue in a loop.

```py
from tembo_pgmq_python import Message, PGMQueue

...
queue = PGMQueue(**connection_info)
...

while True:
    ...
    message: Message = queue.pop(queue_name)
    ...
```

## Harnessing Producer and Consumer

For simplicity, I used a simple shell script to initiate my experiment:

```shell
#/bin/bash

# Spawn one producer
python3 producer.py > /tmp/producer.out &
sleep 2


# Spawn 5 consumers
for i in $(seq 1 5)
do
  python3 consumer.py > /tmp/consumer_${i}.out &
done

# Wait for everyone to finish
wait
```

The script basically starts 1 producer and 5 consumers in the background. The output is saved in the `/tmp` directory.

And that was it...

From this point, you can explore the other available methods.


## Some final words...

It was a pleasant surprise how easy it was to create this example: only a couple of shell commands and a couple of short Python scripts. The PGMQueue methods were very intuitive and straightforward. Personally, my next step is to understand how it works internally. But that's a topic for the future :)

I invite everyone to explore this project at: https://github.com/tembo-io/pgmq. Give it a star and also check out the other available clients for [Rust](https://github.com/tembo-io/pgmq/tree/main/core) and [Go](https://github.com/craigpastro/pgmq-go).


## Appendix

Here is the complete code if you want to give it a try (or see it in [this repository](https://github.com/binidxaba/pgmq-with-python)):

```py
"""
This is the Producer's code
"""

import random
import string
from tembo_pgmq_python import Message, PGMQueue


if __name__ == '__main__':
    host = "localhost"
    port = 5432
    username = "postgres"
    password = "postgres"
    database = "postgres"

    num_messages = 100000
    test_queue = "bench_queue_sample"

    queue = PGMQueue(host=host,
                    port=port,
                    username=username,
                    password=password,
                    database=database)

    try:
        #queue.drop_queue(test_queue)
        queue.create_queue(test_queue)

        for x in range(num_messages):

            payload = ''.join(random.choices(string.ascii_uppercase + string.digits, k = 10))
            msg = {"payload": payload}
            msg_id = queue.send(test_queue, msg)

            if (x+1) % 1000 == 0:
                print("Sent {} messages".format(x + 1))

    except Exception as e:
        print(f"{e}")
```

```py
"""
This is the Consumer's code
"""

import random
import time
from tembo_pgmq_python import Message, PGMQueue


if __name__ == '__main__':
    host = "localhost"
    port = 5432
    username = "postgres"
    password = "postgres"
    database = "postgres"

    no_message_timeout = 0
    test_queue = "bench_queue_sample"

    queue = PGMQueue(host=host, port=port, username=username, password=password, database=database)

    while no_message_timeout < 5:
        try:
            message: Message = queue.pop(test_queue)  # type: ignore
            print("Consumed message: {}".format(message.message["payload"]))
            no_message_timeout = 0

        except IndexError:
            no_message_timeout += 1
            print("No more messages for {no_message_timeout} consecutive reads")
            time.sleep(0.500)

```
