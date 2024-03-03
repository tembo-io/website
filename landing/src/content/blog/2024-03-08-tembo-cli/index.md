---
slug: tembo-cli
title: 'Announcing the Tembo CLI'
authors: [steven]
tags: [postgres, extensions, stacks]
image: './dw_social.png'
date: 2024-03-08T12:00
description: Announcing Tembo CLI
---

# Introducing the Tembo CLI: Streamlining Database Deployments for Developers

Postgres isn't just a database; it's a whole ecosystem of extensions and tools for all kinds of tasks.

At Tembo Cloud, we've made it easy to deploy Postgres with extensions and apps combined to create solutions, such as vector search, data warehousing, machine learning, high throughput transactional database, and so on. But having these capabilities in the cloud means you'll also want a way to test them out locally, to ensure your applications work seamlessly. You will need some tool that helps set up Postgres with your extensions and apps locally. That's why we created the Tembo CLI. It's designed to give developers the power to set up their Postgres configurations on their own machines or in CI environments, mirroring how things will run on Tembo Cloud. This way, you can experiment, develop, and test with confidence, knowing your local setup reflects the cloud environment.

## Why Tembo CLI?

The Tembo CLI is a powerful tool designed to simplify how you deploy databases, whether locally or in the cloud. By supporting the same Tembo configuration across development, staging, and production environments, it ensures consistency and reliability in your deployments. This means what you test locally, your workload behaves the same way when deployed to the cloud.

## Key Features of the Tembo CLI

- **Seamless Deployment Across Environments**: Deploy your database locally for development or to any cloud environment (dev, staging, prod) using the same configuration.
- **Support for Stacks, Extensions, and Apps**: Tailor your Postgres deployments with Tembo Stacks, and further customize your setup by specifying additional extensions and apps
- **Simple Configuration**: Specify the database(s) for your application in your Tembo.toml, then deploy locally, or to multiple cloud environments with the same configuration file

## What's it like to use the Tembo CLI?

When you're ready to dive in, please refer to the [Tembo CLI Getting Started](https://tembo.io/docs/tembo-cloud/Tembo-CLI/Getting_Started) guide.

Using the Tembo CLI is easy. Just define your database(s) in a **tembo.toml** file.

```toml
[minimal]
environment = "prod"
instance_name = "minimal"
```

The above tembo.toml file includes one database, on the Standard Stack. If you want to pick a stack tailored to your use case, you can do so like this:

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

You start your database(s) with the command `tembo apply`.

You can deploy to cloud or local by selecting your deployment context.

```bash
tembo context list
```
```
➜ Your current Tembo context: dev


+---------+-------------+---------------------------------+---------+-------+
| Name    | Target      | Org ID                          | Profile | Set   |
+---------+-------------+---------------------------------+---------+-------+
| local   | docker      |                                 | local   | false |
+---------+-------------+---------------------------------+---------+-------+
| prod    | tembo-cloud | org_2PEmuBhDmY2yKGnAdJI9sesXaaC | prod    | false |
+---------+-------------+---------------------------------+---------+-------+
| dev     | tembo-cloud | org_2YW4TYIMI1LeOqJTFIyvkHOHCUo | dev     | true  |
+---------+-------------+---------------------------------+---------+-------+
```

This allows you to deploy locally, then deploy to cloud with the same configuration.

```bash
# Deploy local
tembo context set --name local
tembo apply

# Deploy to cloud, dev environment
tembo context set --name dev
tembo apply
```

The power of Tembo is that you can customize Postgres to suit your needs. You can enable Postgres extensions, set your own Postgres configurations, or enable Apps to run alongside your database, all using the Tembo CLI.

```
[vector-search]
environment = "prod"
instance_name = "vector-search"
stack = "VectorDB"

# TODO: example turning on 1 extension, and rest API via app
```

## Dive Deeper

TODO link to getting started and examples in docs

## What's Next?

TODO
