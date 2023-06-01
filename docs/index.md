---
sidebar_position: 1
---

# Getting Started

## What is CoreDB?

At CoreDB, we're creating a radically simpler way to build, deploy, and scale services and applications on top of Postgres. Unlike traditional managed Postgres offerings, CoreDB abstracts the complexity of deployment, configuration, management, and optimization, allowing developers to easily build and deploy highly specialized data services without needing to rely on multiple different database platforms, and teams of backend engineers, devops, database administrators, and data engineers.

Today, CoreDB is differentiated by: 

- Live extension management — powered by [Trunk](https://www.pgtrunk.io), you can easily install a growing list of Postgres extensions into your running Postgres instance.
- Start with a Stack — A **CoreDB** **Stack** is a productized starting point that includes a Postgres instance, a bundle of Postgres extensions, configuration, and possibly a sidecar. Right now we have two Stacks available, **Standard** Postgres and a **Message Queue** optimized stack.

## Alpha Considerations

- We are not charging for resources during our alpha phase.
- So please try to keep your instances tidy — i.e. delete instances that you're not using. 
We will prompt you to delete unused instances, especially if they are large.
- Once we have established pricing (later 2023), we'll reach out to give a permanent grandfathered pricing discount to those who run production workloads in our alpha.

## Creating an account

- Join the waitlist, then wait a bit. We will reach out to you soon.
- DM [rywalker](https://twitter.com/rywalker) on Twitter if you *really* want in badly.
- Once invited, sign in at [cloud.CoreDB.io](http://cloud.CoreDB.io/).

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

- Supported extensions — we support all [Trunk](https://www.pgtrunk.io)-installable extensions
- Browse extensions — click the extensions tab while viewing an instance (the little box icon)
- Install extension — click the "Add new extension”, find the extension, click “Install”
- Enable extensions — click the extensions tab while viewing an instance (the little box icon), and enable any extensions you have installed.

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
(note: you can help add them to [Trunk](https://www.pgtrunk.io), the open Postgres Extension registry)
- More Stacks — with automatic sensible configurations
- Self-service backup restores
- Add-ons — optional functionality that you can enable for an instance.
- Featurized Extensions — some Postgres extensions are so crucial that we have decided to build them into our platform, starting with `pg_stat_statements` — we preinstall it, and plan to build information from it into our product.