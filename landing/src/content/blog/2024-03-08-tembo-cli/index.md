---
slug: tembo-cli
title: 'Announcing the Tembo CLI'
authors: [steven, adarsh, joshua]
tags: [postgres, extensions, stacks]
image: './dw_social.png'
date: 2024-03-08T12:00
description: Announcing Tembo CLI
---

# Infrastructure as code for the Postgres ecosystem

Postgres isn't just a database; it's a whole ecosystem of extensions and tools for all kinds of tasks.

At Tembo Cloud, we've made it easy to deploy the Postgres ecosystem of extensions and apps combined to create solutions, which we call "Stacks". If you're using these capabilities in Tembo Cloud, you'll also want a way to test locally. That's why we created the Tembo CLI. It's designed to give you the power to set up Postgres Stacks on your own machine or in CI, mirroring how things will run on Tembo Cloud. This way, you can experiment, develop, and test with confidence, knowing your local setup reflects the cloud environment.

## Why Tembo CLI?

The Tembo CLI is a powerful tool designed to simplify how you deploy databases, whether locally or in the cloud. By supporting the same Tembo configuration across development, staging, and production environments, it ensures consistency and reliability in your deployments. This means when you test locally, your workload behaves the same way when deployed to the cloud.

## Key Features of the Tembo CLI

- **Seamless Deployment Across Environments**: Deploy your database locally for development or to any cloud environment (dev, staging, prod) using the same configuration.
- **Support for Stacks, Extensions, and Apps**: Tailor your Postgres deployments with Tembo Stacks, and further customize your setup by specifying additional extensions and apps
- **Simple Configuration**: Specify the database(s) for your application in your **tembo.toml**, then deploy locally, or to multiple cloud environments with the same configuration file

## What's it like to use the Tembo CLI?

When you're ready to dive in, please refer to the [Tembo CLI Getting Started](https://tembo.io/docs/tembo-cloud/Tembo-CLI/Getting_Started) guide.

Using the Tembo CLI is easy. Just define your database(s) in a **tembo.toml** file.

```toml
[minimal]
environment = "prod"
instance_name = "minimal"
```

The above **tembo.toml** file includes one database, on the Standard Stack. If you want to pick a stack tailored to your use case, you can do so like this:

```toml
[my-instance-vector]
environment = "prod"
instance_name = "my-instance-vector"
stack = "VectorDB"
```

You can run multiple databases in a single file, if you wish.

```toml
[vector-search]
environment = "prod"
instance_name = "vector-search"
stack = "VectorDB"

[analytics]
environment = "prod"
instance_name = "analytics"
stack = "DataWarehouse"
```

You can deploy to cloud or local by selecting your deployment context. This allows you to deploy locally, then deploy to cloud with the same configuration.

```bash
# Deploy local
tembo context set --name local
tembo apply

# Deploy to cloud, dev environment
tembo context set --name dev
tembo apply
```

The open source ecosystem of tools around Postgres are a first-class product experience with Tembo. You can enable Postgres extensions, set your own Postgres configurations, or enable Apps to run alongside your database, all using the Tembo CLI.

```toml
[vector-search]
environment = "prod"
instance_name = "vector-search"
stack = "VectorDB"

# Set a Postgres configuration
[vector-search.postgres_configurations]
statement_timeout = 60

# Enable the popular extension pg_partman
[vector-search.extensions.pg_partman]
enabled = true
trunk_project = "pg_partman"
trunk_project_version = "4.7.4"

# Enable an HTTP API with PostgREST
[[vector-search.app_services]]
restapi = {}
```

## Dive Deeper

Please refer to the [Tembo CLI Getting Started](https://tembo.io/docs/tembo-cloud/Tembo-CLI/Getting_Started) guide for setting up Tembo CLI on your machine. Continue reading to find examples for how you can use the Tembo CLI to power the data in your application.
