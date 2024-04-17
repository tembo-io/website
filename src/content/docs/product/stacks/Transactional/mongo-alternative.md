---
title: MongoAlternative
sideBarTitle: MongoAlternative
sideBarPosition: 104
---

The Tembo MongoAlternative Stack is designed to offer MongoDB (Mongo) protocol compatibility with PostgreSQL (Postgres).

Leveraging the power of FerretDB, Tembo users can migrate from Mongo to Postgres easily as well as interact with their data in a manner that is remarkably familiar to them. In other words, users are able to leverage Mongo-compatible storage without needing to change their application.

## Apps & Extensions

-   [FerretDB](https://docs.ferretdb.io/) - `FerretDB` is an open-source proxy build on Postgres that translates Mongo wire protocol queries to SQL.
-   Extensions from [Trunk](https://pgt.dev/) can be installed on-demand.

## Getting started

Before jumping in, it's important to note some recommended usage practices:

-   `psql` (PostgreSQL Client): When accessing the database via `psql`, we advise read-only operations.
    This is to maintain the integrity of the data structure and compatibility with FerretDB.
-   `mongosh` (MongoDB Shell): For read-write operations, including inserting, updating, and deleting data, please use `mongosh`.
    This ensures that all changes are properly managed and reflected in both Mongo and Postgres representations.

### Download mongosh

Similar to `psql`, `mongosh` is a client that is compatible with FerretDB used to query and interact with the data in your Mongo database.

-   For macOS, you can run the following brew command: `brew install mongosh`.
-   For Windows and Linux, please refer to the installation steps found within the [mongosh official documentation](https://www.mongodb.com/docs/mongodb-shell/install/).

### Setup

#### Connecting via mongosh

Once you've established a Tembo MongoAlternative Stack instance, you will need to download a root SSL certificate (this can be found just above the connection string on the right-hand side).
Then, navigate to the directory containing the freshly-downloaded SSL certificate. You can then copy the connection string from the UI and execute it within the terminal.
As an alternative to copying from the UI, you can fill in and run the following `mongosh` command:

```bash
mongosh "mongodb://postgres:<your-password>@<your-host>:27018/ferretdb?authMechanism=PLAIN&tls=true&tlsCaFile=$(pwd)/ca.crt"
```

The `tlsCaFile=$(pwd)/ca.crt` in your MongoDB connection string specifies the SSL certificate file's location using the current directory (`$(pwd)`).
To use a different directory for your SSL certificate, replace `$(pwd)` with the full path to the certificate, like `tlsCaFile=/your/certificate/path/ca.crt`.

### Load sample data

Once connected via `mongosh`, loading and working with data is very straightforward.

Here we've provided a sample dataset showing satellites belonging to NOAA (National Oceanic and Atmospheric Administration).

Note that this data is for demonstrative purposes and might not be accurate.

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

When you conduct these operations, you should see the following automated response:

```text
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId('<your-object-id>'),
    '1': ObjectId(''),
    '2': ObjectId('65ba40a7acdca11e00e19ecd')
  }
}
```

From there you can interact with the data using the following [FerretDB supported commands](https://docs.ferretdb.io/reference/supported-commands/).

### Reading from psql

Similar to other stacks, you can copy the connection string from the Tembo UI or fill in and run the following `psql` command:

```bash
psql 'postgresql://postgres:<your-password>@<your-host>:5432/postgres'
```

Once connected to the instance, running `\dn` will list the schemas and show `ferretdb` and an option.

Running `SET search_path TO ferretdb;` will allow you to interact with your data stored via FerretDB.

At this point it's important to reemphasize that our current recommendation to treat `psql` as read only when using the MongoAlternative Stack.

### Sample mongosh queries

#### Query 1

List the collections (table equivalent to relational databases).

```
SHOW collections;
```

Result

```text
orbit_data
satellites
```

#### Query 2

Find all satellites launched after a certain date.

```
db.satellites.find({ launch_date: { $gt: "2006-01-01" } })
```

Result

```text
[
  {
    _id: ObjectId('65ba66d3acdca11e00e19ed0'),
    name: 'NOAA-19',
    type: 'NOAA',
    launch_date: '2009-02-06',
    description: 'description3.'
  },
  {
    _id: ObjectId('65ba66d3acdca11e00e19ed1'),
    name: 'GOES-16',
    type: 'GOES',
    launch_date: '2016-11-19',
    description: 'description4.'
  },
  {
    _id: ObjectId('65ba66d3acdca11e00e19ed2'),
    name: 'GOES-17',
    type: 'GOES',
    launch_date: '2018-03-01',
    description: 'description5.'
  },
  {
    _id: ObjectId('65ba66d3acdca11e00e19ed3'),
    name: 'GOES-18',
    type: 'GOES',
    launch_date: '2022-03-01',
    description: 'description6.'
  }
]
```

#### Query 3

Find satellites with a specific perigee altitude range.

```
db.orbit_data.find({perigee_altitude_km: { $gte: 800, $lte: 850 }})
```

Result

```text
[
  {
    _id: ObjectId('65ba66d5acdca11e00e19ed4'),
    satellite_name: 'NOAA-15',
    orbit_type: 'LEO',
    perigee_altitude_km: 808,
    inclination_deg: 98.7,
    period_minutes: 101.2
  },
  {
    _id: ObjectId('65ba66d5acdca11e00e19ed5'),
    satellite_name: 'NOAA-18',
    orbit_type: 'LEO',
    perigee_altitude_km: 838,
    inclination_deg: 98.88,
    period_minutes: 102.12
  },
  {
    _id: ObjectId('65ba66d5acdca11e00e19ed6'),
    satellite_name: 'NOAA-19',
    orbit_type: 'LEO',
    perigee_altitude_km: 845,
    inclination_deg: 98.7,
    period_minutes: 102
  }
]
```
