# How to Load Census Data into Postgres with ogr2ogr

Census data reflects the demographic, social, economic, and housing characteristics of a population.
It is useful for guiding public policy decisions, allocating government funds, planning for educational needs, infrastructure development, and healthcare services.

While there are many ways to acquire this type of data, one good source is from the [United States Census Bureau](https://www.census.gov/).

This guide will walk through the steps to download `TIGER` census data, load it into Postgres with `ogr2ogr`.

Some helpful references before getting started:
- [TIGER](https://www.census.gov/programs-surveys/geography/guidance/tiger-data-products-guide.html#:~:text=TIGER%20stands%20for%20the%20Topologically,data%20as%20the%20primary%20source.) - Acronym for "Topologically Integrated Geographic Encoding and Referencing system", TIGER is the United States Census Bureau's database for census and survey mapping. [Click here](https://www2.census.gov/geo/pvs/tiger2010st/) for the US Census Bureau directory for TIGER/Line shapefiles for all states, dated 2010.
- [ogr2ogr](https://gdal.org/programs/ogr2ogr.html) - Tool within GDAL (Geospatial Data Abstraction Library); an open source library maintained by OSGeo. PostGIS recognizes `ogr2ogr` as a valid loading method, which can be read about within the [PostGIS official training material](https://postgis.net/workshops/postgis-intro/loading_data.html#loading-with-ogr2ogr).

## Get ahold of ogr2ogr

If you haven’t already, please [download the GDAL library](https://gdal.org/download.html#binaries), which includes the tool `ogr2ogr`.

## Download the data

We drew inspiration from the PostGIS guide, [Loader_Generate_Census_Script](https://postgis.net/docs/Loader_Generate_Census_Script.html), and will focus solely on `Massachusetts` data, specifically, `tract`, block groups `bg`, and `tabblocks`.

As mentioned above, if you'd like other states [follow this link](https://www2.census.gov/geo/pvs/tiger2010st/).

```bash
wget https://www2.census.gov/geo/pvs/tiger2010st/25_Massachusetts/25/tl_2010_25_bg10.zip
```
```bash
wget https://www2.census.gov/geo/pvs/tiger2010st/25_Massachusetts/25/tl_2010_25_tract10.zip
```
```bash
wget https://www2.census.gov/geo/pvs/tiger2010st/25_Massachusetts/25/tl_2010_25_tabblock10.zip
```

Unzip the files to your target directory.

```bash
unzip tl_2010_25_bg10.zip
```
```bash
unzip tl_2010_25_tract10.zip
```
```bash
unzip tl_2010_25_tabblock10.zip
```

## Load the data

Once you have the data, you can use `ogr2ogr` to load the shapefiles.
You will have to run the following command for each file, unless you choose to create a script.

Note that you will have to adjust the `-nln` flag and file (last line) parameters for each file you would like to load into Postgres.

```bash
ogr2ogr -f "PostgreSQL" \
PG:"dbname=postgres \
host=<your-host>\
port=5432 \
user=postgres \
password=<your-password>" \
-nln tiger_data.ma_tabblock \
-nlt PROMOTE_TO_MULTI \
-lco GEOMETRY_NAME=the_geom \
-lco FID=gid \
-lco PRECISION=no \
tl_2010_25_tabblock10.shp
```

## Confirm successful load

`psql` into Postgres and run the following:

```sql
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'tiger_data'
ORDER BY table_name;
```
```text
 table_schema | table_name
--------------+-------------
 tiger_data   | ma_bg
 tiger_data   | ma_tabblock
 tiger_data   | ma_tract
(3 rows)
```
