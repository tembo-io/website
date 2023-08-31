---
sidebar_position: 3
tags:
  - local
---

# Running locally

This guide is for running a Postgres container locally that supports installing extensions with Trunk. This guide uses Docker Compose to start the same image used in Tembo Cloud on your local machine, and provides guidance on how to manually install and enable extensions. We are also working on a Tembo CLI that will replace this workflow.

## Start Postgres using Docker

- You can start a Postgres container locally like this
```
docker run -it --name local-tembo -p 5432:5432 --rm quay.io/tembo/tembo-local
```
- The above image includes common system dependencies for extensions listed in [Trunk](https://pgt.dev). Some extensions have very large dependencies, and these are not included, for example in the case of PostgresML.

## Connect to the Postgres container

- Now, you can connect to your database with this command:
```
psql postgres://postgres:postgres@localhost:5432
```

## Install extensions with Trunk

- Browse [Trunk](https://pgt.dev) to find interesting extensions
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
