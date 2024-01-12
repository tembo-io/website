---
slug: data-warehouse-stack
title: 'Data Warehouse Stack on Tembo Cloud'
authors: [adam]
tags: [postgres, extensions, stacks, data-warehouse]
---

Building a data warehouse is a complex task. Typically, a data engineering team would need to integrate several different tools and technologies to bring data into a central location from various data sources. Tembo reduces the complexity associated with building a data warehouse by providing a pre-configured Stack that includes all the tools you need to build a data warehouse without running additional infrastructure, all accessible to you from within Postgres.

In fact, we built our internal data warehouse at Tembo using this Stack. We have data spread across several different vendors and systems, but want a single place to query, analyze, and visualize all of our data. Tembo has operational data in a few different locations, and we used foreign data wrappers to connect Postgres to multiple external sources, partitioning to improve performance and set retention policies, and a built-in scheduler to keep our data up to date.

## Loading data from several sources

![task](./task.png 'task')

To build our data warehouse at Tembo, we needed to pull our operational data into Postgres from several external sources, including other Postgres instances:

- Postgres - we run a dedicated Postgres cluster for the Tembo Cloud backend. We refer to this as our "control-plane". This is where we maintain all the metadata for customers Tembo instances. For example, what cpu, memory, storage, when their instance was created, what its name and the organization it belongs to, etc. We also run a message queue in Postgres, which contains an archive of historical events from the system.
- Prometheus - usage metrics are exported from various systems, including Kubernetes, across our infrastructure into Prometheus.
- Clerk.dev - we partner with Clerk to provide authentication and authorization for all our customers, as well as management of our user's organizations.

Our task was to bring all this data into a single place so that we could join the data together, analyze it, and present it in our dashboards.

Moving data from several different sources into a single place is a common task for data engineers. There are lots of tools in the ecosystem to help with this task. Many organizations bring in external tools, and vendors to handle this orchestration. Tools like Airflow, dbt, Fivetran, Dagster are very popular, and outstanding projects, but using them comes at a huge cost. Every time we bring in a new technology into the ecosystem it expands the cognitive load on the engineering and analytics teams. Many software systems today consist of far too many tools and technologies for any human to keep in their head. Some engineers at Uber spoke briefly about this [recently](https://youtu.be/zQ5e3B5I-U0?t=81).

So, rather than bring in new tools, we can use Postgres extensions to do the work for us. As a developer, extensions feel natural, like installing and importing a module or package from your favorite repository, which is much lighter and easier to manage than a completely new tool.

## Foreign Data Wrappers

Foreign data wrappers (FDW) are a class of Postgres extensions provide you with a simple interface that connects Postgres to another data source. If you've worked with Kafka, this are similar to 'Connectors'. There are many different foreign data wrappers available, and you can even write your own. To build our data warehouse, we knew right away that we could use the [postgres_fdw](https://www.postgresql.org/docs/current/postgres-fdw.html) to connect our data warehouse and control-plane Postgres instances.

But what about getting out data from Prometheus and Clerk? Writing a foreign data wrapper sounded like a lot of work at first, until we came across the [Wrappers](https://github.com/supabase/wrappers) project.

## Building FDWs in Rust

The [Wrappers](https://github.com/supabase/wrappers) project comes with a collection of FDWs built-in, such as [S3](https://github.com/supabase/wrappers/tree/main/wrappers/src/fdw/s3_fdw) and [Stripe](https://github.com/supabase/wrappers/tree/main/wrappers/src/fdw/stripe_fdw), and it is also a framework for authoring new FDWs. Wrappers enabled us to quickly develop two more FDWs; [clerk_fdw](https://github.com/tembo-io/clerk_fdw) and [prometheus_fdw](https://github.com/tembo-io/prometheus_fdw). These two FDWs are written in Rust, and take care of connecting Postgres to the Clerk and Prometheus APIs, and transforming that data into a format that can be written to Postgres storage. We wrote about both of these FDWs in more detail in previous blog posts ([clerk_fdw blog](https://tembo.io/blog/clerk-fdw) | [prometheus_fdw blog](https://tembo.io/blog/monitoring-with-prometheus-fdw)).

Developing a foreign data wrapper with Wrappers is straight-forward. You simply implement the [ForeignDataWrapper](https://github.com/supabase/wrappers/blob/main/supabase-wrappers/src/interface.rs) [trait](https://doc.rust-lang.org/book/ch10-02-traits.html) in your Rust extension. Implementing a trait in Rust is a lot like implementing an abstract base class in Python or an interface in Java, and ultimately, the the functions in the trait are what map your SQL query into the requests that get sent to the foreign data server. In the case of clerk_fdw, we need to map a query like `select * from users` into a request to the Clerk API, and that is exactly what happens in the trait functions.

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

New users are signing up for Tembo and using our product every day, so we need make sure that the data in our data warehouse stays up to date...There's an extension for that, [pg_cron](https://github.com/citusdata/pg_cron).

If you're familiar with the unix utility "cron", then pg_cron is exactly what you'd expect.

We create a function in Postgres to refresh our data sources, then we tell pg_cron to call that function on a schedule. If you've worked with Apache Airflow or Dagster before, this is a lot like creating a job to execute some code you wrote.

Below is the function we wrote to update the clusters that existing across our data-planes. It is simply a replacement of the `ingested_clusters` table with the latest data from the `instance_vw` view in our control-plane, not a ton different for how someone might update a Hive table.

```sql
CREATE EXTENSION pg_cron
```

We'll need to make sure that the `shared_preload_libraries` config is set to include `pg_cron` as well. Both the `CREATE EXTENSION` and `shared_preload_libraries` steps are handled for you automatically on [Tembo Cloud](https://cloud.tembo.io)!


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

Then, we set up the pg_cron job to call this function as frequently as we need:

```sql
SELECT cron.schedule('update-clusters', '5 minutes', 'CALL refresh_clusters()');
```

We can easily check and see what jobs we've scheduled in our data warehouse by peeking at he `cron.job` table, and its easy to interpret.
 We can see that we have two jobs that each run every 5 minutes; each is a simple function call.

```sql
select jobid, jobname, schedule, command from cron.job limit where jobname = 'refresh-clusters';

 jobid |     jobname      |  schedule   |         command         
-------+------------------+-------------+-------------------------
     1 | refresh-clusters | */5 * * * * | CALL refresh_clusters()

```

We can also check on the status of these jobs by querying the `cron.job_run_details` table. This table contains a log of every time a job was run, and how long it took to complete.

```sql
select status, start_time, end_time
from cron.job_run_details
where jobid = 1
order by runid
desc limit 1;

  status   |          start_time           |           end_time            
-----------+-------------------------------+-------------------------------
 succeeded | 2024-01-12 19:45:00.014907+00 | 2024-01-12 19:45:00.485323+00
```

## Partitioning is trivial with pg_partman

Partitioning is a [native feature](https://www.postgresql.org/docs/current/ddl-partitioning.html) in Postgres, and it is the logical splitting of one table into smaller physical tables. Some, but not all of the tables in our data warehouse have grown quite large. Largest being our metrics, and this presents two problems that must be addressed; performance and storage.

The majority of our dashboard queries aggregate data over time, and most commonly on a daily interval. So, we can partition our tables by day, and only query the partitions we need to answer our questions. This provides a substantial improvement to the performance of those queries which makes our dashboards very snappy.

Our stakeholders do not require visualization for the entirety of our metric data, in fact they are typically only concerned with a 30 days at most. Therefore, we only need to retail 30 days in our data warehouse storage. By setting up a retention policy, we can automatically drop partitions that are older than 30 days, and reclaim that storage. Dropping a partition is much faster than deleting rows from a table. As we'll see in a moment, it is trivial to configure partitioning on Postgres if you use [pg_partman](https://github.com/pgpartman/pg_partman) (which is my personal favorite Postgres extensions). Without pg_partman, it is up to you to handle the creation and deletion of partitions.

```sql
CREATE EXTENSION pg_partman
```

We'll need to make sure that the `shared_preload_libraries` config is set to include `pg_partman_bgw` as well. Both the `CREATE EXTENSION` and `shared_preload_libraries` steps are handled for you automatically on [Tembo Cloud](https://cloud.tembo.io)!

Creating a partitioned table is like creating an extra table, with extra steps. One caveat, is that we must create an index on the column that we want to partition by. In our case, we want a new partition for every day, so we partition by the `time` column, then create an index there as well.

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

Next, we set up pg_partman. We pass our partitioned table into `create_parent()`, then update the `part_config` table to set our retention policy.

```sql
SELECT create_parent('public.metric_values', 'time', 'native', 'daily');

UPDATE part_config
    SET retention = '30 days',
        retention_keep_table = false,
        retention_keep_index = false,
        infinite_time_partitions = true
    WHERE parent_table = 'public.metric_values';
```

We use partitioning in other places at Tembo as well, and we wrote a bit about those use-cases earlier this year in [another blog](https://tembo.io/blog/table-version-history).

## DB Objects as code with SQL Migrations

The [Tembo-CLI](https://github.com/tembo-io/tembo/tree/main/tembo-cli) is currently under development and will be the preferred method of managing objects such as FDWs and pg_cron jobs in your Tembo Cloud instance.
 In the interim, we use [SQLx](https://github.com/launchbadge/sqlx) to keep track of our migrations, and apply them in our CI/CD pipelines.

## Wrapping up

We build Tembo's internal datawarehouse using the Tembo Datawarehouse Stack. Using a handful of Postgres extensions saved us the effort of setting up infrastructure, and most importaly, it helped us keep the complexity of our data ecosystem low. We were able to build a data warehouse that is easy to maintain, and easy to reason about, and quick to onboard new engineers.

![tembo-dw-stack](./fin.png 'final')

The Tembo Datawarehouse Stack is [open source](https://github.com/tembo-io/tembo-stacks/blob/main/tembo-operator/src/stacks/templates/data_warehouse.yaml), and is available to deploy with a single click on [Tembo Cloud](https://cloud.tembo.io).

Join the conversation about the Tembo Datawarehouse Stack in our [Slack Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-293gc1k0k-3K8z~eKW1SEIfrqEI~5_yw.)
