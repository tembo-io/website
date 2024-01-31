---
sidebar_position: 10
---

# Tembo MongoAlternative

The Tembo MongoAlternative Stack is designed to bring document-oriented database capabilities to Postgres.
Leveraging the power of FerretDB, Tembo users can both migrate from MongoDB to Postgres, as well as interact with their data as if they never left!

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

Once you've established a Tembo MongoAlternative Stack instance, you will need to download a root SSL certificate.
You can then copy the connection string from the UI and execute it within the terminal having navigated to the directory containing the freshly-downloaded SSL certificate.
As an alternative to copying from the UI, you can fill in and run the following mongosh command:

```bash
mongosh "mongodb://postgres:<your-password>@<your-host>:27018/ferretdb?authMechanism=PLAIN&tls=true&tlsCaFile=$(pwd)/ca.crt"
```

Note that the end of the connection string, `tlsCaFile=$(pwd)/ca.crt`, is pointing to the directory in which your terminal is in when executing the connection string.
This can be changed if you have a specific directory you would like to store your SSL certificate in.


```bash
psql 'postgresql://postgres:<your-password>@<your-host>:5432/postgres'
```

### Load sample data

Once connected, loading and working with data is very straightforward.
Here we've provided a sample dataset showing satellite 

```
// Inserting all Satellite Data
db.satellites.insertMany([
    { name: "NOAA-15", type: "NOAA", launch_date: "2010-08-18", description: "description1." },
    { name: "NOAA-18", type: "NOAA", launch_date: "2022-11-23", description: "description2." },
    { name: "NOAA-19", type: "NOAA", launch_date: "2009-12-08", description: "description3." },
    { name: "GOES-16", type: "GOES", launch_date: "2010-09-05", description: "description4." },
    { name: "GOES-17", type: "GOES", launch_date: "2005-01-06", description: "description5." },
    { name: "GOES-18", type: "GOES", launch_date: "2016-11-03", description: "description6." }
]);

// Inserting all Orbit Data
db.orbit_data.insertMany([
    { satellite_name: "NOAA-15", orbit_type: "LEO", altitude_km: 35786, inclination_deg: 47, period_minutes: 1436 },
    { satellite_name: "NOAA-18", orbit_type: "LEO", altitude_km: 30000, inclination_deg: 88, period_minutes: 1020 },
    { satellite_name: "NOAA-19", orbit_type: "LEO", altitude_km: 28000, inclination_deg: 55, period_minutes: 1120 },
    { satellite_name: "GOES-16", orbit_type: "GEO", altitude_km: 35786, inclination_deg: 0, period_minutes: 1436 },
    { satellite_name: "GOES-17", orbit_type: "GEO", altitude_km: 35786, inclination_deg: 0, period_minutes: 1436 },
    { satellite_name: "GOES-18", orbit_type: "GEO", altitude_km: 35786, inclination_deg: 0, period_minutes: 1436 }
]);
```

When you conduct these operations, you should see an automated response

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
List the collections

```
show collections
orbit_data
satellites
```

#### Query 2
Find all Satellites Launched After a Certain Date:

```
db.satellites.find({ launch_date: { $gt: "2010-01-01" } })
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
