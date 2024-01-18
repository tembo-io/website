---
sidebar_position: 9
---

# Tembo Geospatial

The Tembo Geospatial Stack is designed to bring spatial database capabilities to Postgres. Whether dealing with spatial objects or location queries, or GIS (geographic information systems)-facing workloads, this stack is prepackaged to help.

## Extensions

- [pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html) - `pg_stat_statements` is an additional supplied module that provides valuable metrics related to query performance.
- [postgis](https://postgis.net/) - `postgis` is the main PostGIS extension, adding support for geographic objects to the PostgreSQL database. It allows for storing and querying data based on location.
- [postgis_raster](https://postgis.net/docs/RT_reference.html) - `postgis_raster` is an extension for handling raster data. It's used for storing and analyzing grid-based data like satellite imagery or digital elevation models.
- [postgis_tiger_geocoder](https://postgis.net/docs/postgis_installation.html#loading_extras_tiger_geocoder) - `postgis_tiger_geocoder` provides geocoding and reverse geocoding functionality. It uses the TIGER (Topologically Integrated Geographic Encoding and Referencing) data from the US Census Bureau.
- [postgis_topology](https://postgis.net/docs/Topology.html) - `postgis_topology` focuses on topological data models and functions, allowing for more advanced spatial data analysis and consistency.
- [address_standardizer](https://postgis.net/docs/Extras.html#Address_Standardizer) - `address_standardizer` helps in standardizing address data, making it consistent and easier to work with, especially for geocoding purposes.
- [address_standardizer_data_us](https://postgis.net/docs/Extras.html#Address_Standardizer) - `address_standardizer_data_us` provides the necessary data for the address_standardizer extension, specifically tailored for US addresses.
- [fuzzystrmatch](https://www.postgresql.org/docs/current/fuzzystrmatch.html) - `fuzzystrmatch` is an additional supplied module that helps with string matching, including approximate or "fuzzy" matches. Useful in tasks like deduplication or linking different data sets where string data may not be exactly the same.
- Extensions from [Trunk](https://pgt.dev/) can be installed on-demand.

## Getting started

Let's walkthrough a secenario that would involve loading geospatial data into Postgres.

### Download GDAL library

If you haven't already, please [download the GDAL library](https://gdal.org/index.html), which includes the tool ogr2ogr.

### Download sample dataset

For the purposes of this demonstration, we will utilize the PostGIS-supplied New York City data bundle.
You can learn more about the PostGIS tutorial [here](https://postgis.net/workshops/postgis-intro/) or download the data direcly from this [link](https://s3.amazonaws.com/s3.cleverelephant.ca/postgis-workshop-2020.zip).

## Setup

Once you establish a Tembo Geospatial Stack instance, you can copy the connect string from the UI and execute it in your terminal.
Alternatively, you can fill in and execute the following psql command:

```bash
psql 'postgresql://postgres:<your-password>@<your-host>:5432/postgres'
```

### Define a database

While the default database is `postgres`, you may desire to create a separate database for your geospatial workload.
This can be achieved by running `CREATE DATABASE <your-database>` once you've connected to Tembo and navigated to by running `\c <your-database>`.
If you'd like to learn more, check out our guide: [How to select database in Postgres](https://tembo.io/docs/postgres_guides/how-to-select-database-in-postgres/).

### Load the data

Navigate to the 
Loading files from If you want to load all of the shape files in one 

```
#!/bin/bash

DATABASE="dbname=<your-database> \
host=<your-host> \
user=postgres \
password=<your-password>"

for f in *.shp
do
  echo "Processing $f file..."
  TABLE_NAME=$(basename "$f" .shp)
  ogr2ogr \
    -nln "$TABLE_NAME" \
    -nlt PROMOTE_TO_MULTI \
    -lco GEOMETRY_NAME=geom \
    -lco FID=gid \
    -lco PRECISION=NO \
    Pg:"$DATABASE" \
    "$f"
done
```

You can then load the data by running the following command within the local, target file-containing directory:

```bash

```

### Confirm successful data upload


### Sample queries

#### Query 1

#### Query 2

#### Query 3

#### Query 4

#### Query 5
