---
sidebar_position: 1
---

# Getting Started

## What is Tembo?

At Tembo, we're creating a radically simpler way to build, deploy, and scale services and applications on top of Postgres. Unlike traditional managed Postgres offerings, Tembo abstracts the complexity of deployment, configuration, management, and optimization, allowing developers to easily build and deploy highly specialized data services without needing to rely on multiple different database platforms, and teams of backend engineers, devops, database administrators, and data engineers.

Today, Tembo is differentiated by:

- Live extension management — powered by [Trunk](https://www.pgt.dev), you can easily install a growing list of Postgres extensions into your running Postgres cluster.
- Start with a Stack — A **Tembo** **Stack** is a productized starting point that includes a Postgres cluster, a bundle of Postgres extensions, configuration, and possibly a sidecar. Right now we have two Stacks available, **Standard** Postgres and a **Message Queue** optimized stack.

## Alpha Considerations

- We are not charging for resources during our alpha phase.
- So please try to keep your clusters tidy — i.e. delete clusters that you're not using.
  We will prompt you to delete unused clusters, especially if they are large.
- Once we have established pricing (later 2023), we'll reach out to give a permanent grandfathered pricing discount to those who run production workloads in our alpha.

## Creating an Account

- ✅ Join the waitlist. We will reach out to you soon.
- ⚡️ Email support@tembo.io with details on your use case to jump to the front of the line.
- 👏 Sign in at [cloud.tembo.io](http://cloud.tembo.io/).

## Creating a Database

- Choose a Stack
- Choose size:
  - From 1-32 CPUs
  - .5-32GB RAM
  - 1Gb-1Tb of disk
- Modify your configuration - our default configuration is currently mostly “stock” — you may want to edit some configuration options such as `max_connections, shared_buffers, work_mem, maintenance_work_mem, effective_cache_size` (we will be setting these to sensible defaults more and more as Stacks come online)

## Connecting to your Database

- Click on the Overview tab of the database, and you can get a psql command to connect to the database
- Or you can click into hostname, port, username, and password to obtain the credentials

## Enabling Extensions

- Supported extensions — we support all [Trunk](https://www.pgt.dev)-installable extensions
- Browse extensions — click the extensions tab while viewing a cluster (the little box icon)
- Install extension — click the "Add new extension”, find the extension, click “Install”
- Enable extensions — click the extensions tab while viewing a cluster (the little box icon), and enable any extensions you have installed.

## Monitoring

- We're watching everything for you during Alpha, we'll reach out if we see any problems or opportunities for improvement.
- Some ideas for self-monitoring in meantime:
  - Connections — you can get a live count of connections with a query like this:
    `select count(*) from pg_stat_activity where usename = 'postgres';`
  - CPU and Memory usage — follow [Aaron Parecki's "Monitoring CPU and memory usage from Postgres" Guide](https://aaronparecki.com/2015/02/19/8/monitoring-cpu-memory-usage-from-postgres)
  - Slow queries — follow [Shane Lynn's "Find slow, long-running, and Blocked Queries" guide](https://www.shanelynn.ie/postgresql-find-slow-long-running-and-blocked-queries/)

## Backups

- We are automatically taking backups, and can provide point-in-time restores.
- If you need a restore, create a new database to restore into, and send us a request to restore in Intercom.
- Self-service backup restores are coming soon.

## Coming Soon

- Monitoring / Metrics Dashboard
- More Extensions
  (note: you can help add them to [Trunk](https://www.pgt.dev), the open Postgres Extension registry)
- More Stacks — with automatic sensible configurations
- Self-service backup restores
- Add-ons — optional functionality that you can enable for a cluster.
- Featurized Extensions — some Postgres extensions are so crucial that we have decided to build them into our platform, starting with `pg_stat_statements` — we preinstall it, and plan to build information from it into our product.
