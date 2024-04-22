---
title: OLAP
sideBarTitle: OLAP
sideBarPosition: 301
---

## Configuration

The following configurations automatically scale based on the size of CPU, memory, and storage for the cluster:

-   `shared_buffers`
-   `max_connections`
-   `work_mem`
-   `bgwriter_delay`
-   `effective_cache_size`
-   `maintenance_work_mem`
-   `max_wal_size`
-   `effective_io_concurrency`

## Extensions

-   `pg_stat_statements` provides statistics on SQL statements executed by the database. It helps users analyze query performance and identify areas for optimization.
-   [hydra_columnar](https://pgt.dev/extensions/hydra_columnar) is open source, column-oriented Postgres, designed for high-speed aggregate operations.
-   [pg_partman](https://pgt.dev/extensions/pg_partman) simplifies and automates partitioning of large database tables. It helps manage data efficiently by dividing it into smaller, more manageable partitions.
-   [pg_cron](https://pgt.dev/extensions/pg_cron) automates database tasks within PostgreSQL, enabling scheduled maintenance, recurring tasks, and interval-based SQL queries.
-   [postgres_fdw](https://pgt.dev/extensions/postgres_fdw) provides the foreign data wrapper necessary to access data stored in external Postgres servers.
-   [redis_fdw](https://pgt.dev/extensions/redis_fdw) provides the foreign data wrapper necessary to access data stored in external Redis servers.
-   [clerk_fdw](https://pgt.dev/extensions/clerk_fdw) bridges the connection between Postgres and the user management solution Clerk.
-   Extensions from [Trunk](https://pgt.dev) can be installed on-demand.

## Getting started

This guide will walk through setting up an analytical workload on Postgres using [Clickbench's "hits" dataset](https://github.com/ClickHouse/ClickBench?tab=readme-ov-file#history-and-motivation) (representing page views on a system) and the [Hydra](https://github.com/hydradatabase/hydra) Postgres extension. 

This guide will demonstrate the use of both extensions in optimizing the database for analytical queries.

### Create a Tembo OLAP Stack instance

Navigate to [cloud.tembo.io](https://cloud.tembo.io) and create a new stack. Select the "OLAP" Stack type and choose the desired instance size. This guide will function on the hobby tier, but it is recommended to use a larger instance for production workloads.

### Setup

Once you've established a Tembo OLAP Stack instance, you can copy the connection string from the UI and execute it in your terminal.

Alternatively, you can fill in and run the following `psql` command:

```bash
psql 'postgresql://postgres:<your-password>@<your-host>:5432/postgres'
```

The `columnar` extension should be pre-installed and enabled on the `postgres` database.

```sql
postgres=# \dx columnar
              List of installed extensions
   Name   | Version | Schema |       Description
----------+---------+--------+--------------------------
 columnar | 11.1-10 | public | Hydra Columnar extension
(1 row)
```

### Load a sample dataset

Next, download then unzip the sample dataset. It is 15GB compressed.

```bash
wget --no-verbose --continue 'https://datasets.clickhouse.com/hits_compatible/hits.tsv.gz'
gzip -d hits.tsv.gz
```

There are 99,997,497 records in `hitz.tsv`.
For simplicity (and to speed up the duration of this guide), take a subset of the data.

```bash
head -1000000 hits.tsv >> hits_1mil.tsv
```

Once the download is complete, create a table configured for columnar storage using the `columnar` extension.
Note the `USING columnar` clause at the end of the `CREATE TABLE` statement.

```sql
CREATE TABLE hits
(
    WatchID BIGINT NOT NULL,
    JavaEnable SMALLINT NOT NULL,
    Title TEXT NOT NULL,
    GoodEvent SMALLINT NOT NULL,
    EventTime TIMESTAMP NOT NULL,
    EventDate Date NOT NULL,
    CounterID INTEGER NOT NULL,
    ClientIP INTEGER NOT NULL,
    RegionID INTEGER NOT NULL,
    UserID BIGINT NOT NULL,
    CounterClass SMALLINT NOT NULL,
    OS SMALLINT NOT NULL,
    UserAgent SMALLINT NOT NULL,
    URL TEXT NOT NULL,
    Referer TEXT NOT NULL,
    IsRefresh SMALLINT NOT NULL,
    RefererCategoryID SMALLINT NOT NULL,
    RefererRegionID INTEGER NOT NULL,
    URLCategoryID SMALLINT NOT NULL,
    URLRegionID INTEGER NOT NULL,
    ResolutionWidth SMALLINT NOT NULL,
    ResolutionHeight SMALLINT NOT NULL,
    ResolutionDepth SMALLINT NOT NULL,
    FlashMajor SMALLINT NOT NULL,
    FlashMinor SMALLINT NOT NULL,
    FlashMinor2 TEXT NOT NULL,
    NetMajor SMALLINT NOT NULL,
    NetMinor SMALLINT NOT NULL,
    UserAgentMajor SMALLINT NOT NULL,
    UserAgentMinor VARCHAR(255) NOT NULL,
    CookieEnable SMALLINT NOT NULL,
    JavascriptEnable SMALLINT NOT NULL,
    IsMobile SMALLINT NOT NULL,
    MobilePhone SMALLINT NOT NULL,
    MobilePhoneModel TEXT NOT NULL,
    Params TEXT NOT NULL,
    IPNetworkID INTEGER NOT NULL,
    TraficSourceID SMALLINT NOT NULL,
    SearchEngineID SMALLINT NOT NULL,
    SearchPhrase TEXT NOT NULL,
    AdvEngineID SMALLINT NOT NULL,
    IsArtifical SMALLINT NOT NULL,
    WindowClientWidth SMALLINT NOT NULL,
    WindowClientHeight SMALLINT NOT NULL,
    ClientTimeZone SMALLINT NOT NULL,
    ClientEventTime TIMESTAMP NOT NULL,
    SilverlightVersion1 SMALLINT NOT NULL,
    SilverlightVersion2 SMALLINT NOT NULL,
    SilverlightVersion3 INTEGER NOT NULL,
    SilverlightVersion4 SMALLINT NOT NULL,
    PageCharset TEXT NOT NULL,
    CodeVersion INTEGER NOT NULL,
    IsLink SMALLINT NOT NULL,
    IsDownload SMALLINT NOT NULL,
    IsNotBounce SMALLINT NOT NULL,
    FUniqID BIGINT NOT NULL,
    OriginalURL TEXT NOT NULL,
    HID INTEGER NOT NULL,
    IsOldCounter SMALLINT NOT NULL,
    IsEvent SMALLINT NOT NULL,
    IsParameter SMALLINT NOT NULL,
    DontCountHits SMALLINT NOT NULL,
    WithHash SMALLINT NOT NULL,
    HitColor CHAR NOT NULL,
    LocalEventTime TIMESTAMP NOT NULL,
    Age SMALLINT NOT NULL,
    Sex SMALLINT NOT NULL,
    Income SMALLINT NOT NULL,
    Interests SMALLINT NOT NULL,
    Robotness SMALLINT NOT NULL,
    RemoteIP INTEGER NOT NULL,
    WindowName INTEGER NOT NULL,
    OpenerName INTEGER NOT NULL,
    HistoryLength SMALLINT NOT NULL,
    BrowserLanguage TEXT NOT NULL,
    BrowserCountry TEXT NOT NULL,
    SocialNetwork TEXT NOT NULL,
    SocialAction TEXT NOT NULL,
    HTTPError SMALLINT NOT NULL,
    SendTiming INTEGER NOT NULL,
    DNSTiming INTEGER NOT NULL,
    ConnectTiming INTEGER NOT NULL,
    ResponseStartTiming INTEGER NOT NULL,
    ResponseEndTiming INTEGER NOT NULL,
    FetchTiming INTEGER NOT NULL,
    SocialSourceNetworkID SMALLINT NOT NULL,
    SocialSourcePage TEXT NOT NULL,
    ParamPrice BIGINT NOT NULL,
    ParamOrderID TEXT NOT NULL,
    ParamCurrency TEXT NOT NULL,
    ParamCurrencyID SMALLINT NOT NULL,
    OpenstatServiceName TEXT NOT NULL,
    OpenstatCampaignID TEXT NOT NULL,
    OpenstatAdID TEXT NOT NULL,
    OpenstatSourceID TEXT NOT NULL,
    UTMSource TEXT NOT NULL,
    UTMMedium TEXT NOT NULL,
    UTMCampaign TEXT NOT NULL,
    UTMContent TEXT NOT NULL,
    UTMTerm TEXT NOT NULL,
    FromTag TEXT NOT NULL,
    HasGCLID SMALLINT NOT NULL,
    RefererHash BIGINT NOT NULL,
    URLHash BIGINT NOT NULL,
    CLID INTEGER NOT NULL,
    PRIMARY KEY (CounterID, EventDate, UserID, EventTime, WatchID)
) USING columnar;
```

From psql, copy the data set into the table.

```sql
\copy hits FROM 'hits_1mil.tsv'
```

```text
COPY 1000000
```

### Create indices on the table

Create indices on the table to optimize the workload for analytical queries.

Creating an index in Postgres helps with query performance as it allows the database to find data faster without the need to scan the entire table.

Think of it as being similar to a book index that enables you to locate specific information without reading every page.

Indexes will vary depending on the specific queries hitting the table.

The indices below are relevant to the [Clickbench](https://github.com/ClickHouse/ClickBench/tree/main/tembo-olap) workload.

```sql
CREATE INDEX userid on hits (UserID);
CREATE INDEX eventtime on hits (EventTime);
CREATE INDEX eventdate on hits (EventDate);
CREATE INDEX search on hits (SearchPhrase);
CREATE INDEX search2 on hits (SearchPhrase) WHERE SearchPhrase <> ''::text;
```

### Execute analytical queries on the table

The table is now optimized for typical analytical queries, where there should be an observable improvement in performance given the indexes you just created.

Here's a few examples of queries you can try.

#### Get the minimum and maximum event dates from the table.

```sql
SELECT MIN(EventDate), MAX(EventDate) FROM hits;
```

```text
    min     |    max
------------+------------
 2013-07-15 | 2013-07-15
```

#### Get the top 10 regions with the most unique users.

```sql
SELECT RegionID, COUNT(DISTINCT UserID) AS u
FROM hits GROUP BY RegionID
ORDER BY u DESC
LIMIT 10;
```

```text
 regionid |   u
----------+-------
      229 | 27961
        2 | 10413
      208 |  3073
        1 |  1720
       34 |  1428
      158 |  1110
      184 |   987
      107 |   966
       42 |   956
       47 |   943
```

Calculate the top 10 pages with the most views for CounterID 62, excluding refreshes and considering only certain traffic sources and a specific referring page.

```sql
SELECT URLHash, EventDate, COUNT(*) AS PageViews
FROM hits
WHERE CounterID = 62
    AND IsRefresh = 0
    AND TraficSourceID IN (-1, 6)
    AND RefererHash = 3594120000172545465
GROUP BY URLHash, EventDate
ORDER BY PageViews DESC LIMIT 10 OFFSET 100;
```

```text
       urlhash        | eventdate  | pageviews
----------------------+------------+-----------
 -5794910153905534566 | 2013-07-15 |        19
 -8675455922189315655 | 2013-07-15 |        19
 -1354147336435390881 | 2013-07-15 |        19
 -1419388746330668048 | 2013-07-15 |        18
  7644052073203380311 | 2013-07-15 |        18
  2183693295573901880 | 2013-07-15 |        18
 -8213908143099318937 | 2013-07-15 |        18
  4329780285977997346 | 2013-07-15 |        18
  1237664075729419728 | 2013-07-15 |        18
  3229224080707842023 | 2013-07-15 |        17
```

## Support

Join the Tembo Community [in Slack](https://join.slack.com/t/tembocommunity/shared_invite/zt-293gc1k0k-3K8z~eKW1SEIfrqEI~5_yw) to ask a question or see how others are building on [https://cloud.tembo.io](Tembo).
