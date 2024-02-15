---
slug: mongo-on-postgres
title: 'MongoDB capabilities on Postgres with Managed FerretDB on Tembo Cloud'
authors: [evan]
tags: [postgres, stacks, database]
image: ./MongoAlt.png
---

Migrating data can be an involved process, often requiring specialized knowledge and expertise.
This is especially true when concerned with cross-database transitions, such as moving data from a document-oriented system like MongoDB to a relational one like PostgreSQL (henceforth Mongo and Postgres).

Here at Tembo, we’re excited to launch Mongo compatibility on Postgres; a feature made possible by our new, FerretDB-powered [MongoAlternative Stack](https://tembo.io/docs/tembo-stacks/mongo-alternative)!
This is an exciting first, as users now have access to FerretDB, hosted on Tembo Cloud next to your Postgres instance.
With the power of a fully integrated FerretDB, users not only have access to a Mongo-compatible Postgres database without needing to change their application, but can also do it with very low latency and without the need to spin up a Docker container!

To get started with a Mongo-compatible instance on [Tembo Cloud](https://cloud.tembo.io/), just download the SSL certificate, move it to a target directory, and run the `mongosh` connection string in that directory!

![connection](./connection.png 'connection')
Figure 1. Connection details for a sample MongoAlternative instance.

## Why migrate to Postgres?

At first glance, it’s easy to consider Mongo and Postgres as oil and water; why not, they’re document-oriented and relational databases?
While this might have stood up years ago, recent developments in Postgres greatly increase the reasons someone might want to leave Mongo for Postgres.
In addition to Postgres being the most-loved, most-utilized database (according to [Stack Overflow’s 2023 Survey](https://survey.stackoverflow.co/2023/#section-most-popular-technologies-databases)), some reasons why Postgres might be the right choice for your document-oriented workloads are:
- [Native jsonb support](https://www.postgresql.org/docs/current/datatype-json.html), as well as various extensions that provide additional document database capabilities.
- Rich ecosystem of extensions that can introduce new functions and data types.
- ACID compliance and large SQL language support.
- Ability to join with all your other data including relational data.
- The PostgreSQL License is a liberal open-source license offering free use, modification, and distribution. In contrast, Mongo uses the Server Side Public License (SSPL), which includes more restrictive terms.

## FerretDB as an app service next to Postgres

At its core, FerretDB is an open-source proxy built on Postgres that translates Mongo wire protocol queries into SQL, bridging the gap between document-oriented and relational database systems.
We offer a fully-integrated, managed FerretDB experience with the help of our application services, as covered in an earlier [blog post](https://tembo.io/blog/tembo-operator-apps) of ours.
Essentially, we achieve this by running FerretDB’s Docker image in a Kubernetes deployment next to Postgres.

To provide a bit more detail, this process first required creating a TCP ingress routing in line with [FerretDB's secure connection instructions](https://docs.ferretdb.io/security/tls-connections/).
Once established, a Kubernetes Service and ingress resource could be created.
Finally, we generated a template by which we could [load FerretDB via our Kubernetes operator](https://github.com/tembo-io/tembo/blob/main/tembo-operator/src/stacks/templates/mongo_alternative.yaml).

![app_service](./app_service.png 'app_service')
Figure 2. Diagram of Tembo's MongoAlternative Stack-specific appService.

## Migrate your Mongo apps to Postgres
Before migrating from any database, it’s advisable to run pre-migration testing.
FerretDB lays out a guide on how to do just that [in their official docs](https://docs.ferretdb.io/migration/premigration-testing/).

For demonstrative purposes, let's consider the following sample dataset, which consists of two collections (known as tables in relational databases): satellites and orbit_data.
These collections contain information about two sets of weather satellites.

```
db.satellites.insertMany([
    { name: "NOAA-15", type: "NOAA", launch_date: "1998-05-13", description: "description1." },
    { name: "NOAA-18", type: "NOAA", launch_date: "2005-05-20", description: "description2." },
    { name: "NOAA-19", type: "NOAA", launch_date: "2009-02-06", description: "description3." },
    { name: "GOES-16", type: "GOES", launch_date: "2016-11-19", description: "description4." },
    { name: "GOES-17", type: "GOES", launch_date: "2018-03-01", description: "description5." },
    { name: "GOES-18", type: "GOES", launch_date: "2022-03-01", description: "description6." }
]);

db.orbit_data.insertMany([
    { satellite_name: "NOAA-15", orbit_type: "LEO", perigee_altitude_km: 808.0, inclination_deg: 98.70, period_minutes: 101.20 },
    { satellite_name: "NOAA-18", orbit_type: "LEO", perigee_altitude_km: 838.0, inclination_deg: 98.88, period_minutes: 102.12 },
    { satellite_name: "NOAA-19", orbit_type: "LEO", perigee_altitude_km: 845.0, inclination_deg: 98.70, period_minutes: 102.00 },
    { satellite_name: "GOES-16", orbit_type: "GEO", perigee_altitude_km: 35780.2, inclination_deg: 0.03, period_minutes: 1436.1 },
    { satellite_name: "GOES-17", orbit_type: "GEO", perigee_altitude_km: 35786.6, inclination_deg: 0.02, period_minutes: 1436.1 },
    { satellite_name: "GOES-18", orbit_type: "GEO", perigee_altitude_km: 35957.0, inclination_deg: 0.05, period_minutes: 1436.1 }
]);
```

A quick and easy way of getting data out of Mongo is to use the CLI tool, mongodump.
In the case of this dataset, the resultant files are `orbit_data.bson`, `orbit_data.metadata.json`, `satellites.bson`, `satellites.metadata.json`.

Use the following command to export your Mongo data to the current working directory:

```
mongodump --uri="<your-mongo-host>" --username <your-mongo-username> --password <your-mongo-password>
```

You can then load the data by using the credentials to your MongoAlternative Postgres instance by running mongorestore as follows:

```
mongorestore --uri "mongodb://postgres:<your-tembo-password>@<your-tembo-host>:27018/ferretdb?authMechanism=PLAIN&tls=true&tlsCaFile=$(pwd)/ca.crt" </your/path/to/dump/files>
```

Once complete, you can use the typical mongo connection string to access your Tembo instance.

```
mongosh "mongodb://postgres:<your-password>@<your-host>:27018/ferretdb?authMechanism=PLAIN&tls=true&tlsCaFile=$(pwd)/ca.crt"
```

![ferretdb](./ferretdb.png 'ferretdb')
Figure 3. Example of a successful connection to FerretDB.

By running the following query you can confirm the data transfer:

```
ferretdb> show collections
---
orbit_data
satellites
```

## Accessing your data via SQL

One of the benefits of running FerretDB alongside Postgres is that you can also access your data via SQL in addition to MQL.
Once connected to your Tembo MongoAlternative instance via `psql`, simply run `SET search_path TO ferretdb;`.
From there, you can run any read queries to further explore your dataset via Postgres’ SQL dialect.
Here’s an example of what this representation would look like in Postgres:

### 1. What are the available tables?

```
\dt
                     List of relations
  Schema  |            Name             | Type  |  Owner
----------+-----------------------------+-------+----------
 ferretdb | _ferretdb_database_metadata | table | postgres
 ferretdb | orbit_data_aadfd118         | table | postgres
 ferretdb | satellites_df29b4db         | table | postgres
(3 rows)
```

### 2. What are the fields (columns) in this dataset?

```
SELECT jsonb_object_keys(_jsonb) AS key
FROM ferretdb.orbit_data_aadfd118
GROUP BY key;
         key
---------------------
 _id
 orbit_type
 satellite_name
 perigee_altitude_km
 $s
 period_minutes
 inclination_deg
(7 rows)
```

### 3. What are the different satellites contained in this dataset?

```
SELECT DISTINCT _jsonb->>'satellite_name' AS satellite_name
FROM ferretdb.orbit_data_aadfd118;
 satellite_name
----------------
 NOAA-19
 GOES-16
 GOES-17
 NOAA-18
 NOAA-15
 GOES-18
(6 rows)
```

## Try it out today!

Using Tembo’s MongoAlternative Stack, you can seamlessly migrate your data out of Mongo and into Postgres while still keeping your Mongo API.
There are a large number of commands available, which you can find in FerretDB’s [supported commands](https://docs.ferretdb.io/reference/supported-commands/) documentation.
Interested in learning more?
Check out our [MongoAlternative getting started guide](https://tembo.io/docs/tembo-stacks/mongo-alternative).

