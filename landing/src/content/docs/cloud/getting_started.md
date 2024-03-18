---
sideBarPosition: 1
---

Goodbye Database Sprawl, Hello Postgres.

At Tembo, we've created a radically simpler way to build, deploy, and scale data services and applications on top of Postgres. Unlike traditional managed Postgres offerings, Tembo abstracts the complexity of deployment, configuration, management, and optimization, allowing developers to easily build and deploy highly specialized data services without needing to rely on multiple different database platforms, and teams of backend engineers, devops, database administrators, and data engineers.

## What Makes Tembo Unique?

Today, Tembo is differentiated by:

-   Expert database management - No need to learn new database systems or hire additional teams in order to get Master DBA-level database performance.
-   Live extension management — thanks to [Trunk](https://www.pgt.dev), you can easily install a growing list of Postgres extensions into your running Postgres cluster at the click of a button.
-   Use-case specific — Tembo Stacks are productized starting points that includes a Postgres cluster, an intentionally curated bundle of Postgres extensions, optimized configuration, and application services. Want to know more? Check out our [Stacks](https://tembo.io/docs/category/tembo-stacks) here.

Ready to get started? Let's do it.

## Creating an Account

-   Sign in at [cloud.tembo.io](https://cloud.tembo.io/).

## Creating a Database

-   Choose a Stack
-   Choose size
-   You may want to edit some configuration options such as `max_connections, shared_buffers, work_mem, maintenance_work_mem, effective_cache_size` (we set these to sensible defaults, but you have full control)

## Connecting to your Database

-   Click on the Overview tab of the database, and you can get a psql command to connect to the database
-   Or you can click into hostname, port, username, and password to obtain the credentials

## Enabling Extensions

-   We support (200+) [Trunk](https://www.pgt.dev)-installable extensions
-   Click the extensions tab while viewing a cluster (the little box icon)
-   Click the "Add new extension”, find the extension, click “Install”
-   Click the extensions tab while viewing a cluster, to enable any extensions you have installed.
