---
slug: data-warehouse-stack
title: 'Data Warehouse Stack on Tembo Cloud'
authors: [adam]
tags: [postgres, extensions, stacks, data-warehouse]
---

Building a data warehouse is a complex task. There are many different tools and technologies that need to be integrated together to make a data warehouse work. Tembo Cloud makes it easy to build a data warehouse by providing a pre-configured stack that includes all the tools you need to build a data warehouse.

In fact, Tembo build it's very own data warehouse using this Stack. We have data spread across several different vendors and systems, but want a single place to query, analyze, and visualize all of our data.

Tembo has operational data in a few different locations:

- Postgres - we run a dedicated Postgres cluster for the Tembo Cloud backend. We refer to this as our "control-plane". This is where we maintain all the metadata for customer;'s Tembo instances. For example, what cpu, memory, storage, when their instance was created, what its name and the organization it belongs to, etc. We also run a message queue in Postgres, which contains an archive of historical events from the system.
- Prometheus - usage metrics are exported from various systems, including Kubernetes, across our infrastructure into Prometheus.
- Clerk.dev - we partner with Clerk to provide authentication and authorization for all our customers, as well as management of our user's organizations.

Our task was to bring all this data into a single place so that we could join the data together, analyze it, and present it in our dashboards.

![task](./task.png 'task')

## Loading data from several sources

Moving data from several different sources into a single place is a common task for data engineers. There are lots of tools in the ecosystem to help with this task. Many organizations bring in external tools, and vendors to handle this orchestration. Tools like Airflow, dbt, Fivetran, Dagster are very popular, and outstanding projects, but using them comes at a huge cost. Every time we bring in a new technology into the ecosystem it expands the cognitive load on the engineering and analytics teams. Many software systems today consist of far too many tools and technologies for any human to keep in their head. Some engineers at Uber spoke briefly about this [recently](https://youtu.be/zQ5e3B5I-U0?t=81).

So, rather than bring in new tools, we can use Postgres extensions to do the work for us. As a developer, extensions feel natural, like installing and importing a module or package from your favorite repository, which is much lighter and easier to manage than a completely new tool.

## Foreign Data Wrappers

Foreign data wrappers (FDW) are a class of Postgres extensions provide you with a simple interface that connects Postgres to another data source. If you've worked with Kafka, this are similar to 'Connectors'. There are many different foreign data wrappers available, and you can even write your own. To build our data warehouse, we knew right away that we could use the [postgres_fdw](https://www.postgresql.org/docs/current/postgres-fdw.html) to connect our data warehouse and control-plane Postgres instances.

But what about getting out data from Prometheus and Clerk? Writing a foreign data wrapper sounded like a lot of work at first, until we came across the [Wrappers](https://github.com/supabase/wrappers) project.

## Building FDWs in Rust

The [Wrappers](https://github.com/supabase/wrappers) project comes with a collection of FDWs built-in, such as [S3](https://github.com/supabase/wrappers/tree/main/wrappers/src/fdw/s3_fdw) and [Stripe](https://github.com/supabase/wrappers/tree/main/wrappers/src/fdw/stripe_fdw), and it is also a framework for authoring new FDWs. Wrappers enabled us to quickly develop two more FDWs; [clerk_fdw](https://github.com/tembo-io/clerk_fdw) and [prometheus_fdw](https://github.com/tembo-io/prometheus_fdw). These two FDWs are written in Rust, and take care of connecting Postgres to the Clerk and Prometheus APIs, and transforming that data into a format that can be written to Postgres storage. We wrote about both of these FDWs in more detail in previous blog posts ([clerk_fdw blog](https://tembo.io/blog/clerk-fdw) | [prometheus_fdw blog](https://tembo.io/blog/monitoring-with-prometheus-fdw)).

Developing a foreign data wrapper with Wrappers is straight-forward. You simply implement the [ForeignDataWrapper](https://github.com/supabase/wrappers/blob/main/supabase-wrappers/src/interface.rs) trait in your Rust extension. This tells postgres how to scan and modify with these data sources.

## Connecting Postgres to sources

Working with FDWs is a fairly consistent experience. We'll walk through the process for how we set up clerk_fdw, but it is similar for `prometheus_fdw` and `postgres_fdw`.

First - run the create extension command. For developers, this might feel a lot like importing a module, and I think that is a good analogy. We also need to create the foreign data wrapper object itself.

```sql
CREATE EXTENSION clerk_fdw;

CREATE FOREIGN DATA WRAPPER clerk_wrapper
  handler clerk_fdw_handler
  validator clerk_fdw_validator;

```

Next, create a server object. This is where we configure the connection to the source data system. In the case of Clerk.dev, we need to provide our API key. The server object also needs to know which FDW to use, so we direct it to the clerk_wrapper we created above.

```sql
CREATE SERVER clerk_server
  foreign data wrapper clerk_wrapper
  options (
    api_key '<clerk secret Key>');
```

Finally, we create a foreign table. This is where we tell Postgres how to map the data from Clerk into a table.

```sql
CREATE FOREIGN TABLE clerk_users (
  user_id text,
  first_name text,
  last_name text,
  email text,
  gender text,
  created_at bigint,
  updated_at bigint,
  last_sign_in_at bigint,
  phone_numbers bigint,
  username text
  )
  server clerk_server
  options (
      object 'users'
  );
```

We can view all the foreign tables in our database in `psql` with the `\dE` command, or by executing the following statement:

```sql
SELECT *
FROM information_schema.foreign_tables
```

```console
 foreign_table_catalog | foreign_table_schema |       foreign_table_name       | foreign_server_catalog | foreign_server_name  
-----------------------+----------------------+--------------------------------+------------------------+----------------------
 postgres              | public               | pgmq_saas_queue_archive        | postgres               | control_plane_server
 postgres              | public               | clerk_users                    | postgres               | clerk_server
 postgres              | public               | clerk_organizations            | postgres               | clerk_server
 postgres              | public               | clerk_organization_memberships | postgres               | clerk_server
 postgres              | public               | metrics                        | postgres               | prometheus_server
 postgres              | f                    | instance_state                 | postgres               | control_plane_server
 postgres              | f                    | instances                      | postgres               | control_plane_server
 postgres              | f                    | organizations                  | postgres               | control_plane_server
```

## Scheduling Updates with pg_cron

New users are signing up for Tembo and using our product every day, so we need a way to keep the data in our data warehouse up to date -- "there's an extension for that!".

## Partitioning is trivial with pg_partman

Larger tables benefit from partitioning for query performance. pg_partman makes it trivial to partition tables in Postgres.

## DB Objects as code with SQL Migrations

We define all our objects using SQLx migrations in Rust. This makes is easy for us to recreate the datawarehouse in any environment.

## Dashboarding with Apache Superset

Apache Superset is a an open source technology that we use to create dashboards for reporting for stakeholder and decision makers.

## Wrapping up

[insert final architecture diagram here]

Tembo Cloud makes it easy to build a data warehouse. We provide a pre-configured stack that includes all the tools you need to build a data warehouse. We use this stack to build our own data warehouse, and we use it to power our dashboards and reporting.