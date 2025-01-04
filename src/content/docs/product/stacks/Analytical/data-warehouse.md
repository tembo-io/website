---
title: DataWarehouse
sideBarTitle: DataWarehouse
sideBarPosition: 302
tags: [postgres, datawarehouse, analytical]
---

--
**NOTE**

Data Warehouse stack has now been deprecated. Please use the [Analytics](https://tembo.io/docs/product/stacks/analytical/analytics) stack for new instances. It provides a superset of the features the data warehouse stack provides.

--
Tembo DataWarehouse Stack is tuned and configured for data warehouse workloads. Extract, Transform and Load data from external sources using extensions. Build centralize datastore for analytical and tactical queries.

## Container Image

This stack is built with a custom image, `dw-cnpg`, which you can find more detailed information about within the [dw-cnpg Dockerfile](https://github.com/tembo-io/tembo-images/blob/main/dw-cnpg/Dockerfile)

For interest in the other Stack-specific images, please visit the official [tembo-images repository](https://github.com/tembo-io/tembo-images).

## Extensions

-   `pg_stat_statements` provides statistics on SQL statements executed by the database. It helps users analyze query performance and identify areas for optimization.
-   [hydra_columnar](https://pgt.dev/extensions/hydra_columnar) - `hydra_columnar` is open source, column-oriented Postgres, designed for high-speed aggregate operations.
-   [pg_partman](https://pgt.dev/extensions/pg_partman) - `pg_partman` - simplifies and automates partitioning of large database tables. It helps manage data efficiently by dividing it into smaller, more manageable partitions.
-   [pg_cron](https://pgt.dev/extensions/pg_cron) - `pg_cron` automates database tasks within PostgreSQL, enabling scheduled maintenance, recurring tasks, and interval-based SQL queries.
-   [postgres_fdw](https://pgt.dev/extensions/postgres_fdw) - `postgres_fdw` provides the foreign data wrapper necessary to access data stored in external Postgres servers.
-   [redis_fdw](https://pgt.dev/extensions/redis_fdw) - `redis_fdw` provides the foreign data wrapper necessary to access data stored in external Redis servers.
-   [wrappers](https://pgt.dev/extensions/wrappers) - `wrappers` is a development framework for Postgres Foreign Data Wrappers (FDW), written in Rust. It also comes with collection of FDWs built by Supabase.
-   [multicorn](https://pgt.dev/extensions/multicorn) - `multicorn2` Foreign Data Wrapper allows you to fetch foreign data in Python in your PostgreSQL server.
-   Extensions from [Trunk](https://pgt.dev) can be installed on-demand.

## Getting started

Let's say you are wearing a data engineer hat and working on a click through rate (CTR) project and you have got a bunch of CTR data dumped in S3.
Data can be in CSV, Parquet or JSON format. Motivation is to get insights from S3 data with minimal setup.

### About Data in S3

The data we will use for the example is available in a publicly available S3 bucket. You can download the data using the [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html) from the bucket using the following command. Please note that you will need to have the [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html) installed and configured with your AWS credentials.

```bash
aws s3api get-object --bucket tembo-demo-bucket --key CTR1M.csv.gz ./CTR1M.csv.gz --no-sign-request
```

And then create a new bucket and upload the data using the following command.

```bash
aws s3api create-bucket --bucket tembo-demo-bucket
aws s3api put-object --bucket tembo-demo-bucket --key CTR1M.csv.gz --body CTR1M.csv.gz
```

Please see the AWS S3 documentation on [downloading](https://docs.aws.amazon.com/AmazonS3/latest/userguide/download-objects.html) and [uploading](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html) objects for more details.

#### Data fields

    id: ad identifier
    click: 0/1 for non-click/click
    hour: format is YYMMDDHH, so 14091123 means 23:00 on Sept. 11, 2014 UTC.
    C1 — anonymized categorical variable
    banner_pos
    site_id
    site_domain
    site_category
    app_id
    app_domain
    app_category
    device_id
    device_ip
    device_model
    device_type
    device_conn_type
    C14-C21 — anonymized categorical variables

### Setup

First, connect to your Tembo cluster:

```bash
psql 'postgresql://postgres:<your-password>@<your-host>:5432/postgres'
```

Accessing S3 data from the Tembo stack is a three step process.

#### Step 1

Define a handler and validator for wrapper.

```sql
CREATE foreign data wrapper s3_wrapper
  handler s3_fdw_handler
  validator s3_fdw_validator;
```

#### Step 2

Create a server on top of wrapper.

```sql
create server s3_server
  foreign data wrapper s3_wrapper
  options (
	aws_access_key_id 'INSERT_ACCESS_KEY_ID',
	aws_secret_access_key 'INSERT_SECRET_ACCESS_KEY',
	aws_region 'us-east-1'
  );
```

#### Step 3

Create a foreign table that matches the columns of the CSV data. Keep all the columns of type text.

```sql
create foreign table s3_ctr_1M_gzip_csv(
id text,
click text,
hour text,
c1 text,
banner_pos text,
site_id text,
site_domain text,
site_category text,
app_id text,
app_domain text,
app_category text,
device_id text,
device_ip text,
device_model text,
device_type text,
device_conn_type text,
c14 text,
c15 text,
c16 text,
c17 text,
c18 text,
c19 text,
c20 text,
c21 text
)server s3_server
  options (
	uri 's3://tembo-demo-bucket/CTR1M.csv.gz',
	format 'csv',
	has_header 'true',
	compress 'gzip'
  );
```

### Good to go...

#### Query 1

Gather overall CTR across 1 million impressions.

```sql
SELECT count(*) impressions, sum(click::integer) clicks, sum(click::integer) / count(*)::numeric overall_ctr from s3_ctr_1M_gzip_csv;
```

Result:

```text
impressions | clicks |      overall_ctr
-------------+--------+------------------------
     1000000 | 169566 | 0.16956600000000000000
(1 row)

```

#### Query 2

Gather hourly click trend.

```sql
SELECT EXTRACT(HOUR from to_timestamp(hour,'YYMMDDHH24')) hourly, count(*) hourly_impressions, sum(click::integer) clicks_per_hour, sum(click::integer) / count(*)::numeric hourly_ctr from s3_ctr_1M_gzip_csv GROUP  BY hourly ORDER BY hourly;
```

Result:

```text
 hourly | hourly_impressions | clicks_per_hour |       hourly_ctr
--------+--------------------+-----------------+------------------------
      0 |              20954 |            3639 | 0.17366612579937004868
      1 |              24454 |            4518 | 0.18475505029851966958
      2 |              30281 |            5342 | 0.17641425316204880948
      3 |              34689 |            6093 | 0.17564645853152296117
      4 |              47580 |            7626 | 0.16027742749054224464
      5 |              49165 |            8055 | 0.16383606223939794569
      6 |              43411 |            7189 | 0.16560318813204026629
      7 |              45395 |            8115 | 0.17876418107721114660
      8 |              51687 |            8405 | 0.16261342310445566583
      9 |              56745 |            9046 | 0.15941492642523570359
     10 |              53366 |            8651 | 0.16210695948731402016
     11 |              50360 |            8549 | 0.16975774424146147736
     12 |              54729 |            9355 | 0.17093314330610827897
     13 |              59380 |           10046 | 0.16918154260693836309
     14 |              54753 |            9651 | 0.17626431428414881376
     15 |              51496 |            9223 | 0.17910128942053751748
     16 |              50269 |            9031 | 0.17965346436173387177
     17 |              49995 |            8762 | 0.17525752575257525753
     18 |              43401 |            7283 | 0.16780719338264095297
     19 |              32943 |            5417 | 0.16443554017545457305
     20 |              27687 |            4477 | 0.16170043702820818435
     21 |              24543 |            3897 | 0.15878254492115878254
     22 |              22523 |            3736 | 0.16587488345247080762
     23 |              20194 |            3460 | 0.17133802119441418243
(24 rows)

```

#### Query 3

Gather click trend over DayOfWeek.

```sql
SELECT EXTRACT(DOW from to_timestamp(hour,'YYMMDDHH24')) DayOfWeek, count(*) dow_impressions, sum(cast(click as integer)) dow_clicks, sum(click::integer)/count(*)::numeric dow_ctr from s3_ctr_1M_gzip_csv GROUP  BY DayOfWeek ORDER BY DayOfWeek;

```

Result:

```text
 dayofweek | dow_impressions | dow_clicks |        dow_ctr
-----------+-----------------+------------+------------------------
         0 |           94449 |      17216 | 0.18227826657772978009
         1 |           79607 |      14508 | 0.18224527993769392139
         2 |          232847 |      37659 | 0.16173281167461895580
         3 |          226852 |      35536 | 0.15664838749493061556
         4 |          200471 |      35201 | 0.17559148205974929042
         5 |           82523 |      14410 | 0.17461798528894974734
         6 |           83251 |      15036 | 0.18061044311780038678
(7 rows)

```

#### Query 4

Gather click trend on various Devices.

```sql
SELECT device_type, count(*) impressions_per_device, sum(click::integer) clicks_per_device, sum(click::integer)/count(*)::numeric device_ctr from s3_ctr_1M_gzip_csv GROUP BY 1 ORDER BY 1;
```

Result:

```text
 device_type | impressions_per_device | clicks_per_device |       device_ctr
-------------+------------------------+-------------------+------------------------
 0           |                  55111 |             11636 | 0.21113752245468236831
 1           |                 922596 |            155849 | 0.16892442629276519733
 2           |                      1 |                 0 | 0.00000000000000000000
 4           |                  19096 |              1791 | 0.09378927524088814411
 5           |                   3196 |               290 | 0.09073842302878598248
(5 rows)
```

#### Query 5

Gather click trend for Features.

```sql
SELECT c1 feature, count(*) impressions_per_feature, sum(click::integer) clicks_per_feature, sum(click::integer)/count(*)::numeric feature_ctr from s3_ctr_1M_gzip_csv GROUP BY 1 ORDER BY 1;

```

Result:

```text
 feature | impressions_per_feature | clicks_per_feature |      feature_ctr
---------+-------------------------+--------------------+------------------------
 1001    |                     232 |                  4 | 0.01724137931034482759
 1002    |                   55111 |              11636 | 0.21113752245468236831
 1005    |                  918496 |             155315 | 0.16909708915444378636
 1007    |                     893 |                 47 | 0.05263157894736842105
 1008    |                     145 |                 16 | 0.11034482758620689655
 1010    |                   22292 |               2081 | 0.09335187511214785573
 1012    |                    2831 |                467 | 0.16495937831155068880
(7 rows)
```
