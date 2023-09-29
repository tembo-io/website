---
sidebar_position: 3
tags:
  - local
---

# Try extensions locally

Run a Postgres container locally and install extensions with Trunk.

There's an example of using this method of trying extensions in the blog [Version History and Lifecycle Policies for Postgres Tables](https://tembo.io/blog/table-version-history).

## Start Postgres using Docker

- You can start a Postgres container locally like this
```
docker run -d -it --name local-tembo -p 5432:5432 --rm quay.io/tembo/tembo-local
```
- The above image includes common system dependencies for extensions listed in [Trunk](https://pgt.dev). Some extensions have very large dependencies, and these are not included.

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
- Enable an extension. Note a hyphenated extension name, e.g., uuid-ossp, will require double quotes when enabling.
```
CREATE EXTENSION pgmq CASCADE;
```
- List enabled extensions
```
\dx
```

## Create a custom image

After using the above process to experiment with extensions, you may want to build a custom image that you can start with all your extensions ready to go.

- Optionally, create a Postgres configuration file. Some extensions require configuration, for example `shared_preload_libraries`, or extension-specific configurations like `cron.host`. In this example, we have named the file `custom.conf`.

```
shared_preload_libraries = 'pg_partman_bgw'
```

- Optionally, create a startup SQL script. This script can be used to enable your extension, or other startup logic for your local development. In this example, we have named the file `startup.sql`

```
CREATE EXTENSION IF NOT EXISTS pg_partman CASCADE;
```

- Create a Dockerfile:

```
FROM quay.io/tembo/tembo-local:latest

# Optional:
# Install any extensions you want with Trunk
RUN trunk install pg_partman

# Optional:
# Specify extra Postgres configurations by copying into this directory
COPY custom.conf $PGDATA/extra-configs

# Optional:
# Specify startup SQL scripts by copying into this directory
COPY startup.sql $PGDATA/startup-scripts
```

- We now have the following files present in our directory:

```
.
├── Dockerfile
├── custom.conf
└── startup.sql

1 directory, 3 files
```

- This setup allows you to build an image that will start with your extensions ready to go:

```
# Build the image
docker build -t example-local-image .

# If you have another container running with the same name, delete it
docker rm --force local-tembo

# Run your custom image
docker run -d -it --name local-tembo -p 5432:5432 --rm example-local-image
```

- Connect to postgres in the same way as before:

```
psql postgres://postgres:postgres@localhost:5432
```
