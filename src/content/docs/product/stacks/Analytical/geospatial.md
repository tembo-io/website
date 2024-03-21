---
title: Geospatial
sideBarTitle: Geospatial
sideBarPosition: 303
---

The Tembo Geospatial Stack is designed to bring spatial database capabilities to Postgres.
Whether dealing with spatial objects, location queries, or GIS (geographic information systems)-facing workloads in general, this stack is pre-packaged to help.

## Container Image

This stack is built with a custom image, `geo-cnpg`, which you can find more detailed information about within the [geo-cnpg Dockerfile](https://github.com/tembo-io/tembo-images/blob/main/geo-cnpg/Dockerfile).

For interest in the other Stack-specific images, please visit the official [tembo-images repository](https://github.com/tembo-io/tembo-images).

## Extensions

-   [pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html) - `pg_stat_statements` is an additional supplied module that provides valuable metrics related to query performance.
-   [fuzzystrmatch](https://www.postgresql.org/docs/current/fuzzystrmatch.html) - `fuzzystrmatch` is an additional supplied module that helps with string matching, including approximate or "fuzzy" matches. Useful in tasks like deduplication or linking different data sets where string data may not be exactly the same.
-   [postgis](https://postgis.net/) - `postgis` is the main PostGIS extension, adding support for geographic objects to the PostgreSQL database. It allows for storing and querying data based on location.
-   [postgis_raster](https://postgis.net/docs/RT_reference.html) - `postgis_raster` is an extension for handling raster data. It's used for storing and analyzing grid-based data like satellite imagery or digital elevation models.
-   [postgis_tiger_geocoder](https://postgis.net/docs/postgis_installation.html#loading_extras_tiger_geocoder) - `postgis_tiger_geocoder` provides geocoding and reverse geocoding functionality. It uses the TIGER (Topologically Integrated Geographic Encoding and Referencing) data from the US Census Bureau.
-   [postgis_topology](https://postgis.net/docs/Topology.html) - `postgis_topology` focuses on topological data models and functions, allowing for more advanced spatial data analysis and consistency.
-   [address_standardizer](https://postgis.net/docs/Extras.html#Address_Standardizer) - `address_standardizer` helps in standardizing address data, making it consistent and easier to work with, especially for geocoding purposes.
-   [address_standardizer_data_us](https://postgis.net/docs/Extras.html#Address_Standardizer) - `address_standardizer_data_us` provides the necessary data for the address_standardizer extension, specifically tailored for US addresses.
-   Extensions from [Trunk](https://pgt.dev/) can be installed on-demand.

## Getting started

Let's walkthrough a scenario that would involve loading geospatial data into Postgres.

### Download GDAL library

If you haven't already, please [download the GDAL library](https://gdal.org/index.html), which includes the tool ogr2ogr.

### Download sample dataset

For the purposes of this demonstration, we will utilize the PostGIS-supplied New York City data bundle.
You can learn more about the PostGIS tutorial [here](https://postgis.net/workshops/postgis-intro/) or download the data directly from this [link](https://s3.amazonaws.com/s3.cleverelephant.ca/postgis-workshop-2020.zip).
Once downloaded, move the .zip file to your target directory and unzip.

## Setup

Once you've established a Tembo Geospatial Stack instance, you can copy the connection string from the UI and execute it in your terminal.
Alternatively, you can fill in and run the following psql command:

```bash
psql 'postgresql://postgres:<your-password>@<your-host>:5432/postgres'
```

### Define a database

While the default database is `postgres`, you may desire to create a separate database for your geospatial workload.
This can be achieved by running `CREATE DATABASE <your-database>` once you've connected to Tembo and navigated to by running `\c <your-database>`.
If you'd like to learn more, check out our guide: [How to select database in Postgres](/docs/postgres_guides/how-to-select-database-in-postgres/).

### Load the data

Navigate to your local directory where the data is stored; the path will look similar to path/to/target/directory/postgis-workshop/data/.
For this simple exercise, we'll focus exclusively on shapefiles, but bear in mind that they alone do not represent the entire dataset.
Consider the following files:

-   nyc_cencus_blocks.shp
-   nyc_homicides.shp
-   nyc_neighborhoods.shp
-   nyc_streets.shp
-   nyc_subway_stations.shp

PostGIS does a great job in their free workshop how to use ogr2ogr with select flags to load data into Postgres.
Their explanation can be found [here](https://postgis.net/workshops/postgis-intro/loading_data.html).
With the following command, we can load files (individually) into Postgres:

```bash
ogr2ogr \
  -nln nyc_streets \
  -nlt PROMOTE_TO_MULTI \
  -lco GEOMETRY_NAME=geom \
  -lco FID=gid \
  -lco PRECISION=NO \
  Pg:"dbname=<your-database> host=<your-host> user=postgres" \
  nyc_streets.shp
```

Loading files individually may take some time, so an alternative may be to create a script that iterates across target files and loads them from one executable.
PLEASE NOTE: The following is strictly for demonstration purposes and we strongly advise against hardcoding sensitive information in a script like the one below.

Start by creating a file:

```bash
touch <your-file-name>.sh
```

Then, with your preferred text editor or IDE (integrated development environment), introduce the following script to your file:

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

Make the file executable by running the following:

```bash
chmod +x <your-file-name>.sh
```

You can then load the data by running the following command within the local, target file-containing directory:

```bash
./<your-file-name>.sh
```

### Confirm successful data upload

If you're not already, connect to your database following the same instructions as laid out in the Setup section above.
Then, simply confirm you are in the correct database and run `\t` to list the current tables.
You should see something similar to the following:

### Sample queries

#### Query 1

How many rows are there in the nyc_streets table?

```sql
SELECT COUNT(*) FROM nyc_streets;
```

Result:

```text
 count
-------
 19091
(1 row)
```

#### Query 2

Which fields (columns) are represented in the nyc_streets table?

```sql
SELECT
    column_name,
    data_type
FROM
    information_schema.columns
WHERE
    table_name = 'nyc_streets';
```

Result:

```text
 column_name |     data_type
-------------+-------------------
 gid         | integer
 id          | bigint
 geom        | USER-DEFINED
 name        | character varying
 oneway      | character varying
 type        | character varying
(6 rows)
```

#### Query 3

What are all the streets in the nyc_streets table that have the Ave suffix (limit to 10 rows)?

```sql
SELECT name FROM nyc_streets WHERE name LIKE '%Ave%' LIMIT 10;
```

Result:

```text
      name
----------------
 Avenue O
 Avenue Z
 Avenue Y
 Avenue N
 Carlton Ave
 Ryder Ave
 Willoughby Ave
 Gee Ave
 Myrtle Ave
 7th Ave
(10 rows)
```

#### Query 4

Say Lexington Avenue is your favorite street, but you want to know how many there are in this dataset.

```sql
SELECT COUNT(*)
FROM nyc_streets
WHERE name = 'Lexington Ave';
```

Result:

```text
 count
-------
     5
(1 row)
```

#### Query 5

What is the SRID (Spatial Reference Identifier) of the data in this table.
and if possible, how can I change it?

```sql
SELECT DISTINCT ST_SRID(geom) FROM nyc_streets;
```

Result:

```text
 st_srid
---------
    4326
(1 row)
```

Say the srid was actually 26918. How can I change it to 4326?

```sql
ALTER TABLE nyc_streets
ALTER COLUMN geom
TYPE geometry(Geometry, 4326)
USING ST_Transform(ST_SetSRID(geom, 26918), 4326);
```

Result:

```text
ALTER TABLE
```
