---
sidebar_position: 1
tags:
  - local
---

# Running Tembo locally

This guide is for running a Postgres container locally that supports installing extensions with Trunk. This guide uses Docker Compose to start the same image used in Tembo Cloud on your local machine, and provides guidance on how to manually install and enable extensions. We are also working on a Tembo CLI that will replace this workflow.

## Starting Postgres and connect

- Checkout a directory from <u>[this linked github repository](https://github.com/tembo-io/tembo/tree/main/examples/run-tembo-locally)</u> using git, or duplicate the files into a local directory
- You can start a Postgres container locally like this
```
docker-compose up --build -d
```
- The above command will fail if you already have something running on port 5432
- Now, you can connect to your database with this command:
```
psql postgres://postgres:postgres@localhost:5432
```

## Install extensions with Trunk

- Get a shell connection into your Postgres container
```
docker exec -it local-tembo /bin/bash
```

- Trunk install an extension
```
trunk install pgmq
```

## Enabling extensions

- Connect to Postgres. This works from inside or outside the Postgres container.
```
psql postgres://postgres:postgres@localhost:5432
```
- Enable an extension
```
CREATE EXTENSION pgmq CASCADE;
```
- List enabled extensions
```
\dx
```
