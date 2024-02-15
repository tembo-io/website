---
slug: tembo-data-warehouse
title: 'How we built our customer data warehouse all on Postgres'
authors: [adam]
tags: [postgres, extensions, stacks, data-warehouse, data]
image: './dw_social.png'
date: 2024-01-25T12:00
description: Tembo data warehouse
---

At Tembo (like every as-a-service provider), we wanted to have a customer data warehouse to track and understand customer usage and behavior. We wanted to quickly answer questions like "How many Postgres instances have we deployed?", "Who is our most active customer?" and "How many signups do we have by time?". In order to do this, we needed to bring data from several sources into a single location and keep it up-to-date so we could build the dashboards.

![tembo-dashboard](./tembo_metrics.png 'tembo-dashboard')

Typically, this process requires several orchestration tools and technologies and the end result is a highly complex data ecosystem. However, we built our customer data warehouse completely on Postgres by using foreign data wrappers and other Postgres extensions, enhancing efficiency and simplifying the process. We released all the tools we've built as open source projects which you can host on your own using our [Kubernetes Operator](https://github.com/tembo-io/tembo/tree/main/tembo-operator). We also made it straightforward for anybody to build such a data warehouse on [Tembo Cloud](https://cloud.tembo.io/) by using the [Tembo Data Warehouse](https://github.com/tembo-io/tembo/blob/main/tembo-operator/src/stacks/templates/data_warehouse.yaml/) stack.

## Loading data from several sources

![task](./task.png 'task')

To build our data warehouse at Tembo, we first needed to pull our operational data into Postgres from several external sources, namely:

- [Postgres](https://www.postgresql.org/) - We run a dedicated Postgres cluster (called "control-plane") to store all metadata for our customer's Tembo instances. This database contains information like cpu, memory and storage specs of instances, when the instances were created, their names, the organization it belongs to etc. We also run a message queue in Postgres using [pgmq](https://github.com/tembo-io/pgmq), which contains an archive of historical events from the system.
- [Prometheus](https://prometheus.io/) - Prometheus stores our usage metrics such as cpu and memory usage which are exported from across our infrastructure including Postgres and Kubernetes.
- [Clerk.dev](https://clerk.com/) - We partner with Clerk to provide authentication and authorization for all our customers, as well as management of our users' organizations. So, Clerk has all our user metadata and organization information.

The first task was to bring all this data into a single place so that we could join the data together, analyze it, and present it in our dashboards.

## Why all-in Postgres?

Moving data from different sources into a single place is a common task for data engineers. There are lots of tools in the ecosystem to help with this task. Many organizations bring in external tools, and vendors to handle this complexity. Tools like [Airflow](https://airflow.apache.org/), [dbt](https://github.com/dbt-labs/dbt-core), [Fivetran](https://www.fivetran.com/blog/modern-data-warehouse), [Dagster](https://dagster.io/) are very popular, and outstanding projects, but using them comes at a huge cost.

Every time we bring in a new technology into the ecosystem, it becomes a piece of software that needs to be learned, mastered and maintained. This becomes a huge cost in the form of cognitive overhead for the team in addition to the time and resources it takes to set up, manage and maintain it. The system also gets expensive and much harder to debug due to the sheer number of tools involved. Many software systems today consist of far too many tools and technologies for any human to keep in their head. Some engineers at Uber spoke briefly about this [recently](https://youtu.be/zQ5e3B5I-U0?t=81).

So, rather than bring in new tools, we decided to use Postgres extensions to do the work for us. As a developer, extensions feel natural, like installing and importing a module or package from your favorite repository, which is much lighter and easier to manage than a completely new tool.

## Connecting Postgres to sources

Now, how do we get the data from all these sources into Postgres? We already knew we could use [postgres_fdw](https://www.postgresql.org/docs/current/postgres-fdw.html) to connect our data warehouse and control-plane Postgres instances. But, we were not certain how we could do the same for our data in Prometheus and Clerk. Prometheus had [several projects already available](https://tembo.io/blog/monitoring-with-prometheus-fdw), but none of them were a good fit for our use-case. Clerk.dev did not have any existing extensions for Postgres, so we decided to [build our own](https://tembo.io/blog/clerk-fdw).

### An intro to Foreign Data Wrappers

Foreign data wrappers (FDW) are a class of Postgres extensions which provide you with a simple interface that connects Postgres to another data source. If you've worked with Kafka, this is similar to 'Connectors'. There are many different foreign data wrappers available, and you can even write your own. Additionally, the [Wrappers](https://github.com/supabase/wrappers) framework makes it very easy to develop FDWs in Rust.

So, we built two new FDWs using the Wrappers framework to connect to those sources; [clerk_fdw](https://github.com/tembo-io/clerk_fdw) and [prometheus_fdw](https://github.com/tembo-io/prometheus_fdw).

Working with FDWs is a fairly consistent experience. We'll walk through the process for how we set up `clerk_fdw`, but it is similar for `prometheus_fdw` and `postgres_fdw`.

### Setting up clerk_fdw

First - run the create extension command. For developers, this might feel a lot like importing a module, and I think that is a good analogy. We also need to create the foreign data wrapper object itself.

```sql
CREATE EXTENSION clerk_fdw;

CREATE FOREIGN DATA WRAPPER clerk_wrapper
  handler clerk_fdw_handler
  validator clerk_fdw_validator;
```

Next, we create a server object. This is where we configure the connection to the source data system. In the case of Clerk.dev, we need to provide our API key. The server object also needs to know which FDW to use, so we direct it to the clerk_wrapper we created above.

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

We did similar processes to map our metrics data from prometheus and instance information from Postgres.

We can view all the foreign tables we created in our database in `psql` with the `\dE` command, or by executing the following statement:

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

New users are signing up for Tembo and creating new instances every day, so we need make sure that the data in our data warehouse stays up to date. To do that, we use a popular job scheduling extension [pg_cron](https://github.com/citusdata/pg_cron). If you're familiar with the unix utility "cron", then pg_cron is exactly like that but all within Postgres.

We create a function to refresh our data sources, then we tell pg_cron to call that function on a schedule. Working with pg_cron is very intuitive: we simply provide a name for the job, a schedule, and the command to execute. This is a lot like creating a job to execute some code you wrote using Apache Airflow or Dagster.

For example, we can simply create a function to delete and re-populate our cluster metadata from the control-plane, then schedule it to run every 5 minutes. Note that this is just an example but can be easily modified to UPSERT only newer or updated clusters.

```sql
CREATE OR REPLACE FUNCTION public.refresh_clusters()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN

RAISE NOTICE 'Refreshing clusters from instance_vw to ingested_clusters';

delete from ingested_clusters;
insert into ingested_clusters
  (select
    now(),
    organization_id,
    instance_id,
    instance_name,
    entity_type,
    created_at,
    desired_spec,
    state,
    environment
  from instance_vw
  );
END;
$function$
```

```sql
SELECT cron.schedule('update-clusters', '5 minutes', 'CALL refresh_clusters()');
```

## Partitioning with pg_partman for performance and easy expiry

Partitioning is a [native feature](https://www.postgresql.org/docs/current/ddl-partitioning.html) in Postgres, and it is the logical splitting of one table into smaller physical tables. Some, but not all of the tables in our data warehouse have grown quite large. Largest being our metrics, and this presents two problems that must be addressed; performance and storage. The majority of our dashboard queries aggregate data over time, and most commonly on a daily interval. So, we can partition our tables by day, and only query the partitions we need to answer our questions. This provides a substantial improvement to the performance of those queries which makes our dashboards very snappy.

Partitioning in Postgres is a batteries-not-included experience, which means you need to handle the creating, updating, and deleting of partitions yourself. That is, unless you use the [pg_partman](https://github.com/pgpartman/pg_partman) extension.

Our stakeholders do not require visualization for the entirety of our metric data, in fact they are typically only concerned with a 30 days at most. So, we can automatically drop partitions that are older than 30 days by setting up a retention policy and reclaiming that storage. Dropping a partition is much faster than deleting rows from a table and also skips having to deal with bloat. As we'll see in a moment, it is trivial to configure partitioning on Postgres if you use pg_partman (which is my personal favorite Postgres extension).

Creating a partitioned table just like creating a regular table but you have to specify a partition column. One caveat, is that we must create an index on the column that we want to partition by. In our case, we want a new partition for every day, so we partition by the `time` column, then create an index there as well. We use partitioning in other places at Tembo as well, and we wrote a bit about those use-cases earlier this year in [another blog](https://tembo.io/blog/table-version-history).

```sql
CREATE TABLE public.metric_values (
    id int8 NOT NULL,
    "time" int8 NULL,
    value float8 NOT NULL,
    CONSTRAINT metric_values_unique UNIQUE (id, "time")
)
PARTITION BY RANGE ("time");
CREATE INDEX metric_values_time_idx ON ONLY public.metric_values USING btree ("time" DESC);
```

Next, we set up pg_partman. We pass our partitioned table into `create_parent()`.

```sql
SELECT create_parent('public.metric_values', 'time', 'native', 'daily');
```

## Wrapping up

Tembo's data warehouse was made possible by the hard work from [Jay Kothari](https://github.com/Jayko001) and [Steven Miller](https://github.com/sjmiller609), who paved the path for building it all on Postgres. They used foreign data wrappers to connect Postgres to external sources, pg_cron as a scheduler to keep out data up-to-date, and pg_partman to improve performance and automate our retention policy. You can use any visualization tool to create dashboards as most tools have Postgres support. We picked [Preset](https://preset.io/). We were able to build a data warehouse that is easy to maintain, and easy to reason about, and quick to onboard new engineers. In the end, our stakeholders get the dashboards they need to make business decisions.

![tembo-dw-stack](./fin.png 'final')

The Tembo DataWarehouse Stack is [open source](https://github.com/tembo-io/tembo-stacks/blob/main/tembo-operator/src/stacks/templates/data_warehouse.yaml), and is available to deploy with a single click on [Tembo Cloud](https://cloud.tembo.io).

Join the conversation about the Tembo Data Warehouse Stack in our [Slack Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-293gc1k0k-3K8z~eKW1SEIfrqEI~5_yw.)
