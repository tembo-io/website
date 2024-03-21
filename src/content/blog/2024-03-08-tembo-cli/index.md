---
slug: tembo-cli
title: 'Announcing Tembo CLI: Infrastructure as code for the Postgres ecosystem'
authors: [steven, adarsh, joshua]
tags: [postgres, extensions, stacks]
image: './cli.png'
date: 2024-03-08T12:00
description: Announcing Tembo CLI
---

Postgres isn't just a database; it's a whole ecosystem of extensions and tools for all kinds of tasks. At Tembo Cloud, we've made it easy to deploy the Postgres ecosystem of extensions and apps combined to create solutions, which we call "[Stacks](https://tembo.io/blog/tembo-stacks-intro)".

However, users often ask us, what about local development? That's why we created the [Tembo CLI](/docs/development/cli/getting_started). It's designed to give you the power to set up Postgres Stacks on your own machine or in CI, mirroring how things will run on [Tembo Cloud](https://cloud.tembo.io/). This way, you can experiment, develop, and test with confidence, knowing your local setup reflects the cloud environment.

## Why Tembo CLI?

Tembo CLI is the easiest way to try out Postgres extensions, stacks, and apps - whether or not you're on Tembo Cloud.

Tembo CLI also helps you deploy the same Tembo configuration across development, staging, and production environments. This means when you test locally, your workload behaves the same way when deployed to the cloud.

## Key Features of the Tembo CLI

- **Seamless Deployment Across Environments**: Deploy your database locally for development or across any cloud environment (dev, staging, prod) using the same configuration
- **Support for Stacks, Extensions, and Apps**: Tailor your Postgres deployments with Tembo Stacks and further customize your setup by specifying additional extensions and apps
- **Simple Configuration**: Specify the database(s) for your application in your **tembo.toml**, then deploy locally or to your cloud environment(s) with the same configuration file

## What's it like to use the Tembo CLI?

When you're ready to dive in, please refer to the [Tembo CLI Getting Started](/docs/development/cli/getting_started) guide.

Using the Tembo CLI is easy. Just define your database(s) in a **tembo.toml** file.

```toml
[minimal]
environment = "prod"
instance_name = "minimal"
```

The above **tembo.toml** file includes one database. For additional information on how your **tembo.toml** file can be configured, please see "[Configure Tembo CLI](/docs/development/cli/getting_started)" in the Tembo docs.

You can also configure a Stack, like this:

```toml
[my-instance-oltp]
environment = "prod"
instance_name = "my-instance-oltp"
stack = "OLTP"
```

You can find information about each available Stack in our [Stacks documentation](https://tembo.io/docs/tembo-stacks/intro-to-stacks).

If you need to run multiple databases concurrently, they can all be configured within **tembo.toml**. This would look something like:

```toml
[my-instance-oltp]
environment = "prod"
instance_name = "my-instance-oltp"
stack = "OLTP"

[vector-search]
environment = "prod"
instance_name = "vector-search"
stack = "VectorDB"
```

You can choose to deploy locally or to the cloud by selecting your [deployment context](/docs/development/cli/getting_started). This option allows you to use the same configuration no matter where you deploy.

```bash
# Deploy local
tembo context set --name local
tembo apply

# Deploy to cloud, dev environment
tembo context set --name dev
tembo apply
```

The open source ecosystem of tools surrounding Postgres are delivered as a first-class product experience with Tembo. You can enable Postgres extensions hosted on Trunk, set your own Postgres configurations, or enable applications to run alongside your database — all using the Tembo CLI (and UI, too).

The following code shows an example of a complete **tembo.toml** file with these three situations managed within:

```toml
[my-instance-oltp]
environment = "prod"
instance_name = "my-instance-oltp"
stack = "OLTP"

# Enable the popular extension pg_partman
[my-instance-oltp.extensions.pg_partman]
enabled = true
trunk_project = "pg_partman"
trunk_project_version = "4.7.4"

# Set a Postgres configuration
[my-instance-oltp.postgres_configurations]
statement_timeout = "5min"

# Enable an HTTP API with PostgREST
[[my-instance-oltp.app_services]]
restapi = {}
```

## Dive Deeper

Tembo CLI allows you to easily access the full power of Postgres with its associated ecosystem seamlessly across local and cloud deployments using a single configuration file and simple CLI commands. Best of all, it's free to get started.

For more information, please refer to our [Tembo CLI Getting Started](/docs/development/cli/getting_started) guide to learn how to set up Tembo CLI on your machine.
