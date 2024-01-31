---
sidebar_position: 10
---

# Tembo MongoAlternative

The Tembo MongoAlternative Stack is designed to bring document-oriented database capabilities to Postgres.
Leveraging the power of FerretDB, Tembo users can both migrate from MongoDB to Postgres, as well as interact with their data in a remarkably familiar to them!

## Apps & Extensions

- [FerretDB](https://docs.ferretdb.io/) - `FerretDB` is an open-source proxy build on Postgres that translates MongoDB wire protocol queries to SQL.
- Extensions from [Trunk](https://pgt.dev/) can be installed on-demand.

## Getting started

### Download mongosh (MongoDB Shell)

Similar to `psql`, `mongosh` is a means to connect and interact with your Tembo instance.
The difference, however, is that `mongosh` is specific to MongoDB-like environments, such as the one that FerretDB provides.

- For macOS, you can run the following brew command: `brew install mongosh`
- For Windows and Linux, please refer to the steps found within the [mongosh official documentation](https://www.mongodb.com/docs/mongodb-shell/install/)

### Setup

#### Connect via mongosh

Once you've established a Tembo MongoAlternative Stack instance, you will need to download a root SSL certificate (this can be found just above the connection string on the right-hand side).
You can then copy the connection string from the UI and execute it within the terminal having navigated to the directory containing the freshly-downloaded SSL certificate.
As an alternative to copying from the UI, you can fill in and run the following mongosh command:

```bash
mongosh "mongodb://postgres:<your-password>@<your-host>:27018/ferretdb?authMechanism=PLAIN&tls=true&tlsCaFile=$(pwd)/ca.crt"
```

The tlsCaFile=$(pwd)/ca.crt in your MongoDB connection string specifies the SSL certificate file's location using the current directory ($(pwd)).
To use a different directory for your SSL certificate, replace $(pwd) with the full path to the certificate, like tlsCaFile=/your/certificate/path/ca.crt.

#### Connect via psql

Like the other stacks, you have access to `psql` and can connect to Postgres by copying the `psql` connection string from the UI or fill in and run the following:

```bash
psql 'postgresql://postgres:<your-password>@<your-host>:5432/postgres'
```

### Load sample data

Once connected, loading and working with data is very straightforward.
Here we've provided a sample dataset showing satellites belonging to NOAA (National Oceanic and Atmospheric Administration).


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

### Sample queries

#### Query 1
List the collections (table equivalent to relational databases).

```
show collections
```
Result
```text
orbit_data
satellites
```

#### Query 2
Find all Satellites Launched After a Certain Date:

```
db.satellites.find({ launch_date: { $gt: "2010-01-01" } })
```
Result
```text
[
  {
    _id: ObjectId('65ba40a4acdca11e00e19ec8'),
    name: 'NOAA-15',
    type: 'NOAA',
    launch_date: '2010-08-18',
    description: 'Agent none science nothing.'
  },
  {
    _id: ObjectId('65ba40a4acdca11e00e19ec9'),
    name: 'NOAA-18',
    type: 'NOAA',
    launch_date: '2022-11-23',
    description: 'Win might think.'
  }
]
```

#### Query 3
Find Satellites in Low Earth Orbit (LEO) with Altitude Less Than 35000 km:

```
db.orbit_data.find({ orbit_type: "LEO", altitude_km: { $lt: 35000 } })
```

Result
```
[
  {
    _id: ObjectId('65ba40a7acdca11e00e19ecc'),
    satellite_name: 'NOAA-18',
    orbit_type: 'LEO',
    altitude_km: 30000,
    inclination_deg: 88,
    period_minutes: 1020
  },
  {
    _id: ObjectId('65ba40a7acdca11e00e19ecd'),
    satellite_name: 'NOAA-19',
    orbit_type: 'LEO',
    altitude_km: 28000,
    inclination_deg: 55,
    period_minutes: 1120
  }
]
```
