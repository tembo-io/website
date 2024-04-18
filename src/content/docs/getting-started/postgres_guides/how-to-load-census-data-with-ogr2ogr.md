---
title: How to load census data into Postgres with ogr2ogr
description: This guide will walk through downloading census data and loading it into Postgres with ogr2ogr.
---

Census data reflects the demographic, social, economic, and housing characteristics of a population.
It is useful for guiding public policy decisions, allocating government funds, planning for educational needs, infrastructure development, and healthcare services.

This guide will walk through the steps to download `TIGER` census data, load it into Postgres with `ogr2ogr`, and confirm functionality using the `postgis_tiger_geocoder` extension.

The Postgres instance used in this guide was powered by [Tembo Cloud](https://cloud.tembo.io/)'s Geospatial Stack.
To learn more about the Geospatial Stack [click here](https://tembo.io/docs/product/stacks/analytical/geospatial).

## Table of Contents
- [Download ogr2ogr](#download-ogr2ogr)
- [Obtain and load census data](#obtain-and-load-census-data)
    - [Example Script](#example-script)
- [Test for functionality](#test-for-functionality)

## Download ogr2ogr

[ogr2ogr](https://gdal.org/programs/ogr2ogr.html) is a tool within GDAL (Geospatial Data Abstraction Library); an open source library maintained by [OSGeo](https://www.osgeo.org/projects/gdal/). PostGIS recognizes `ogr2ogr` as a valid loading method, which can be explored within the [PostGIS official training material](https://postgis.net/workshops/postgis-intro/loading_data.html#loading-with-ogr2ogr).

If you haven’t already, please download the GDAL library which includes `ogr2ogr`.

<details>
<summary><strong>MacOS</strong></summary>

```bash
brew install gdal
```

</details>

<details>
<summary><strong>Linux</strong></summary>

```bash
sudo apt-get update
sudo apt-get install gdal-bin
```

</details>

For Windows and others, please refer to the [official GDAL download page](https://gdal.org/download.html#download).

## Obtain and load census data

While there are many ways to acquire census data, one good source is from the [United States Census Bureau](https://www.census.gov/).

Their database for census and survey mapping is called [TIGER](https://www.census.gov/programs-surveys/geography/guidance/tiger-data-products-guide.html#:~:text=TIGER%20stands%20for%20the%20Topologically,data%20as%20the%20primary%20source.) (Topologically Integrated Geographic Encoding and Referencing system), and the directory for TIGER/Line shapefiles for all states, dated 2010, can be found [here](https://www2.census.gov/geo/pvs/tiger2010st/).

We drew inspiration from the PostGIS guide, [Loader_Generate_Census_Script](https://postgis.net/docs/Loader_Generate_Census_Script.html), and created a script to ease the aquisition and loading of these shapefiles. The following three sections review the portions that require your configuration; the rest will be taken care of for you.

### Establish connection string variables

Your connection string will be unique, and will need to be adjusted before the script can be run.

### Select files to download

For the purposes of this guide, we've selected the `tract`, block groups `bg`, and `tabblocks` files, but there are many more available.
Check out [Minnesota's page](https://www2.census.gov/geo/pvs/tiger2010st/27_Minnesota/27/) for an example of the files available.

### Configure `ogr2ogr` command

There are numerous flags that allow you to configure a `ogr2ogr` command, which are outlined within the [description section](https://gdal.org/programs/ogr2ogr.html#description) of the official documentation.

Below we've laid out a select few that we'll be using in this guide:

| Parameter                                                | Description                                                                                    |
|----------------------------------------------------------|------------------------------------------------------------------------------------------------|
| `-f "PostgreSQL"`                                        | Specifies the format of the output data source, in this case, PostgreSQL.                      |
| `PG:"dbname=postgres host=<your-host> port=5432 user=postgres password=<your-password>"` | Connection string credentials. |
| `-nln tiger_data.ma_tabblock`                            | Name of the new layer (table) to be created in the database.                                  |
| `-nlt PROMOTE_TO_MULTI`                                  | Shape files contain multi-part geometries, so this flag primes Postgres to use `MultiPolygon` instead of `Polygon` as the type.                                                      |
| `-lco GEOMETRY_NAME=the_geom`                            | Specifies the name of the geometry column in the new table.                                   |
| `-lco FID=gid`                                           | Designates the name of the FID (Feature ID) column in the new table.                          |
| `-lco PRECISION=no`                                      | Disables the storage of geometry precision.                                                   |
| `tl_2010_25_tabblock10.shp`                              | The path to the input shapefile.                          

### Example Scripts

<details>
<summary><strong>nation_script_load.sh</strong></summary>

```bash
#!/bin/bash

# Set directory and tool variables
TMPDIR="<path/to/temp/dir>"
UNZIPTOOL=unzip
WGETTOOL="<path/to/wget>"
OGR2OGR="<path/to/ogr2ogr>"
export PGBIN="<path/to/postgresql/bin>"
export PGPORT=5432
export PGHOST="<your-host>"
export PGUSER="postgres"
export PGPASSWORD="<your-password>"
export PGDATABASE="postgres"
PSQL="${PGBIN}/psql"

# Ensure the temp directory is clear
mkdir -p ${TMPDIR}
rm -f ${TMPDIR}/*

# Download and process state data
echo "Downloading state data..."
cd ${TMPDIR}
${WGETTOOL} -N https://www2.census.gov/geo/tiger/TIGER2022/STATE/tl_2022_us_state.zip --directory-prefix=${TMPDIR}
unzip -o ${TMPDIR}/tl_2022_us_state.zip -d ${TMPDIR}

echo "Processing state data..."
${PSQL} -c "DROP SCHEMA IF EXISTS tiger_staging CASCADE;"
${PSQL} -c "CREATE SCHEMA tiger_staging;"
${PSQL} -c "CREATE TABLE IF NOT EXISTS tiger_data.state_all(CONSTRAINT pk_state_all PRIMARY KEY (statefp), CONSTRAINT uidx_state_all_stusps UNIQUE (stusps), CONSTRAINT uidx_state_all_gid UNIQUE (gid)) INHERITS (tiger.state);"
${OGR2OGR} -f "PostgreSQL" PG:"dbname=${PGDATABASE} host=${PGHOST} port=${PGPORT} user=${PGUSER} password=${PGPASSWORD}" -nln tiger_staging.state -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=the_geom -lco FID=gid -lco PRECISION=NO -a_srs EPSG:4269 -s_srs EPSG:4269 ${TMPDIR}/tl_2022_us_state.shp
${PSQL} -c "SELECT loader_load_staged_data(lower('state'), lower('state_all'));"
${PSQL} -c "CREATE INDEX IF NOT EXISTS tiger_data_state_all_the_geom_gist ON tiger_data.state_all USING gist(the_geom);"
${PSQL} -c "VACUUM ANALYZE tiger_data.state_all"

# Download and process county data
echo "Downloading county data..."
${WGETTOOL} -N https://www2.census.gov/geo/tiger/TIGER2022/COUNTY/tl_2022_us_county.zip --directory-prefix=${TMPDIR}
unzip -o ${TMPDIR}/tl_2022_us_county.zip -d ${TMPDIR}

echo "Processing county data..."
if [ -f "${TMPDIR}/tl_2022_us_county.shp" ]; then
    echo "Shapefile is present, proceeding with database operations..."
    ${PSQL} -c "DROP SCHEMA IF EXISTS tiger_staging CASCADE;"
    ${PSQL} -c "CREATE SCHEMA tiger_staging;"
    ${PSQL} -c "CREATE TABLE IF NOT EXISTS tiger_data.county_all (CONSTRAINT pk_tiger_data_county_all PRIMARY KEY (cntyidfp), CONSTRAINT uidx_tiger_data_county_all_gid UNIQUE (gid)) INHERITS (tiger.county);"
    ${OGR2OGR} -f "PostgreSQL" PG:"dbname=$PGDATABASE host=$PGHOST port=$PGPORT user=$PGUSER password=$PGPASSWORD" -nln tiger_staging.county -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=the_geom -lco FID=gid -lco PRECISION=NO -a_srs EPSG:4269 -s_srs EPSG:4269 "${TMPDIR}/tl_2022_us_county.shp"
    ${PSQL} -c "INSERT INTO tiger_data.county_all SELECT * FROM tiger_staging.county ON CONFLICT DO NOTHING;"
    ${PSQL} -c "CREATE INDEX IF NOT EXISTS tiger_data_county_all_the_geom_gist ON tiger_data.county_all USING gist(the_geom);"
    ${PSQL} -c "VACUUM ANALYZE tiger_data.county_all"
else
    echo "ERROR: Shapefile not found after extraction: ${TMPDIR}/tl_2022_us_county.shp"
fi

```


</details>

Below you can expand `census.sh` and copy its contents to a `.sh` file in your local environment.

<details>
<summary><strong>census.sh</strong></summary>

```bash
#!/bin/bash

# Set these variables according to your environment
PGDATABASE=postgres
PGHOST=<your-host>
PGPORT=5432
PGUSER=postgres
PGPASSWORD=<your-password>
SCHEMA_NAME=tiger_data

export PGDATABASE PGHOST PGPORT PGUSER PGPASSWORD

# Function to download and process shapefiles for a given state abbreviation
download_and_load_state() {
    local state_abbr="$1"
    local state_fips=""
    local state_name=""
    
    # Define state FIPS codes and names here
    case "$state_abbr" in
        AL) state_fips="01"; state_name="Alabama";;
        AK) state_fips="02"; state_name="Alaska";;
        AZ) state_fips="04"; state_name="Arizona";;
        AR) state_fips="05"; state_name="Arkansas";;
        CA) state_fips="06"; state_name="California";;
        CO) state_fips="08"; state_name="Colorado";;
        CT) state_fips="09"; state_name="Connecticut";;
        DE) state_fips="10"; state_name="Delaware";;
        DC) state_fips="11"; state_name="District_of_Columbia";;
        FL) state_fips="12"; state_name="Florida";;
        GA) state_fips="13"; state_name="Georgia";;
        HI) state_fips="15"; state_name="Hawaii";;
        ID) state_fips="16"; state_name="Idaho";;
        IL) state_fips="17"; state_name="Illinois";;
        IN) state_fips="18"; state_name="Indiana";;
        IA) state_fips="19"; state_name="Iowa";;
        KS) state_fips="20"; state_name="Kansas";;
        KY) state_fips="21"; state_name="Kentucky";;
        LA) state_fips="22"; state_name="Louisiana";;
        ME) state_fips="23"; state_name="Maine";;
        MD) state_fips="24"; state_name="Maryland";;
        MA) state_fips="25"; state_name="Massachusetts";;
        MI) state_fips="26"; state_name="Michigan";;
        MN) state_fips="27"; state_name="Minnesota";;
        MS) state_fips="28"; state_name="Mississippi";;
        MO) state_fips="29"; state_name="Missouri";;
        MT) state_fips="30"; state_name="Montana";;
        NE) state_fips="31"; state_name="Nebraska";;
        NV) state_fips="32"; state_name="Nevada";;
        NH) state_fips="33"; state_name="New_Hampshire";;
        NJ) state_fips="34"; state_name="New_Jersey";;
        NM) state_fips="35"; state_name="New_Mexico";;
        NY) state_fips="36"; state_name="New_York";;
        NC) state_fips="37"; state_name="North_Carolina";;
        ND) state_fips="38"; state_name="North_Dakota";;
        OH) state_fips="39"; state_name="Ohio";;
        OK) state_fips="40"; state_name="Oklahoma";;
        OR) state_fips="41"; state_name="Oregon";;
        PA) state_fips="42"; state_name="Pennsylvania";;
        RI) state_fips="44"; state_name="Rhode_Island";;
        SC) state_fips="45"; state_name="South_Carolina";;
        SD) state_fips="46"; state_name="South_Dakota";;
        TN) state_fips="47"; state_name="Tennessee";;
        TX) state_fips="48"; state_name="Texas";;
        UT) state_fips="49"; state_name="Utah";;
        VT) state_fips="50"; state_name="Vermont";;
        VA) state_fips="51"; state_name="Virginia";;
        WA) state_fips="53"; state_name="Washington";;
        WV) state_fips="54"; state_name="West_Virginia";;
        WI) state_fips="55"; state_name="Wisconsin";;
        WY) state_fips="56"; state_name="Wyoming";;
        AS) state_fips="60"; state_name="American_Samoa";;
        GU) state_fips="66"; state_name="Guam";;
        MP) state_fips="69"; state_name="Commonwealth_Of_The_Northern_Mariana_Islands";;
        PR) state_fips="72"; state_name="Puerto_Rico";;
        VI) state_fips="78"; state_name="Virgin_Islands_Of_The_United_States";;
        *) echo "State abbreviation ($state_abbr) not recognized." ; exit 1 ;;
    esac

    # Array of file types you want to download
    declare -a file_types=("bg10" "tract10" "tabblock10" "state10" "county10")

    for file_suffix in "${file_types[@]}"; do
        local file_name="tl_2010_${state_fips}_${file_suffix}"
        local url="https://www2.census.gov/geo/pvs/tiger2010st/${state_fips}_${state_name}/${state_fips}/${file_name}.zip"

        echo "Downloading $file_name from URL: $url"
        wget -q -O "${file_name}.zip" "$url" && \
        echo "Unzipping ${file_name}..." && \
        unzip -q -o "${file_name}.zip" && \
        echo "Loading ${file_name} into PostgreSQL..." && \
        ogr2ogr -f "PostgreSQL" PG:"dbname=$PGDATABASE host=$PGHOST port=$PGPORT user=$PGUSER password=$PGPASSWORD" \
                -nln "${SCHEMA_NAME}.${state_abbr}_${file_suffix}" -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=the_geom -lco FID=gid -lco PRECISION=no "${file_name}.shp" && \
        echo "${file_name} processed successfully." || echo "Failed to process ${file_name}."
    done
}

read -p "Enter state abbreviation (e.g., FL for Florida): " state_abbr
state_abbr=$(echo "$state_abbr" | tr '[:lower:]' '[:upper:]')

download_and_load_state "$state_abbr"

echo "Data loading complete."
```

</details>

---

You can then run the script and enter the state abbreviation when prompted:

```bash
bash census.sh
```
```text
Enter state abbreviation (e.g., FL for Florida):
```
---

<details>
<summary><strong>Single file workflow</strong></summary>

If instead of running a script, you're interested in walking through individual commands, this section walks through the three steps it would take to download, unzip, and load a single file into Postgres.

#### wget commands to download the data

```bash
wget https://www2.census.gov/geo/pvs/tiger2010st/25_Massachusetts/25/tl_2010_25_bg10.zip
```
```bash
wget https://www2.census.gov/geo/pvs/tiger2010st/25_Massachusetts/25/tl_2010_25_tract10.zip
```
```bash
wget https://www2.census.gov/geo/pvs/tiger2010st/25_Massachusetts/25/tl_2010_25_tabblock10.zip
```

#### unzip commands to decompress the downloaded files

```bash
unzip tl_2010_25_bg10.zip
```
```bash
unzip tl_2010_25_tract10.zip
```
```bash
unzip tl_2010_25_tabblock10.zip
```

#### ogr2ogr command to load the data into Postgres

:bulb: Note that the command will have to be run for each shapefile, which means that the `-nln` and final arguments of the command need to be specified per file.

```bash
ogr2ogr -f "PostgreSQL" \
PG:"dbname=postgres \
host=<your-host> \
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

</details>
</details>

## Test for functionality

`psql` into Postgres and enable the `postgis_tiger_geocoder` extension:

```
CREATE EXTENSION postgis_tiger_geocoder CASCADE;
```

Following PostGIS conventions, we created a schema called `tiger_data` to house the loaded data. If you'd like to query the data, you'll need to set the search path to include this schema:

```sql
SET search_path TO "$user", public, tiger, tiger_data;
```

If you'd like to make this change permanet and persist across sessions, you can alter the database:

```sql
ALTER DATABASE your_database_name SET search_path TO "$user", public, tiger, tiger_data;
```



### Query 1 - Confirm proper data loading

```sql
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'tiger_data'
ORDER BY table_name;
```
```text
 table_schema | table_name
--------------+-------------
 tiger_data   | ok_bg
 tiger_data   | ok_tabblock
 tiger_data   | ok_tract
(3 rows)
```

### Query 2 - 

postgres=# SELECT
    AVG(aland10) AS average_land_area,
    MIN(aland10) AS minimum_land_area,
    MAX(aland10) AS maximum_land_area,
    AVG(awater10) AS average_water_area,
    COUNT(*) AS total_tracts
FROM tiger_data.ok_tract10;
-[ RECORD 1 ]------+---------------------
average_land_area  | 169847056.93690249
minimum_land_area  | 502385
maximum_land_area  | 4707327640
average_water_area | 3228692.636711281071
total_tracts       | 1046

postgres=#

### Query 3 - 

postgres=# SELECT countyfp10, SUM(aland10) AS total_land_area, SUM(awater10) AS total_water_area
FROM tiger_data.ok_tabblock10
GROUP BY countyfp10
ORDER BY countyfp10;
 countyfp10 | total_land_area | total_water_area
------------+-----------------+------------------
 001        |      1485298113 |          9261716
 003        |      2244106958 |         38546713
 005        |      2526578130 |         37283206
 007        |      4699978363 |          7347183
 009        |      2335665049 |          5527162
 011        |      2404607766 |         26851771
 013        |      2342567959 |        102228720
 015        |      3310753325 |         30820558
 017        |      2322250237 |         23244265
 019        |      2129424630 |         30016294
 021        |      1940956597 |         69625855
 023        |      1995214679 |         75667441
 025        |      4751948736 |         15923999
 027        |      1395398450 |         50038594
 029        |      1338199454 |         12080937
 031        |      2769439538 |         37339122
 033        |      1638566638 |         24095479
 035        |      1971897258 |          3697821
 037        |      2460853552 |         50982330
 039        |      2561024716 |         34321703
 041        |      1911868565 |        140205197
 043        |      2588632047 |         22688140
 045        |      3189609693 |           952238
 047        |      2741414396 |          4140336
 049        |      2077482576 |         29961926
 051        |      2850273013 |         11403865
 053        |      2592244963 |          7021928
 055        |      1655842714 |         11157422
 057        |      1391326707 |          3800417
 059        |      2691040791 |          5259448
 061        |      1493181861 |        126266885
 063        |      2084025091 |         26505491
 065        |      1223051540 |          3166046
(33 rows)





---


postgres=# SELECT 'ok_bg10' AS table_name, COUNT(*) FROM tiger_data.ok_bg10
UNION ALL
SELECT 'ok_tabblock10', COUNT(*) FROM tiger_data.ok_tabblock10
UNION ALL
SELECT 'ok_tract10', COUNT(*) FROM tiger_data.ok_tract10;
  table_name   | count
---------------+-------
 ok_bg10       |  2965
 ok_tabblock10 | 99999
 ok_tract10    |  1046
(3 rows)


### drop tables

postgres=# SELECT drop_state_tables_generate_script('OK');
-[ RECORD 1 ]---------------------+-------------------------------------
drop_state_tables_generate_script | DROP TABLE tiger_data.ok_bg10;      +
                                  | DROP TABLE tiger_data.ok_county10;  +
                                  | DROP TABLE tiger_data.ok_state10;   +
                                  | DROP TABLE tiger_data.ok_tabblock10;+
                                  | DROP TABLE tiger_data.ok_tract10;
