---
title: How to load census data into Postgres with ogr2ogr
description: This guide will walk through downloading census data and loading it into Postgres with ogr2ogr.
---

Census data reflects the demographic, social, economic, and housing characteristics of a population.
It is useful for guiding public policy decisions, allocating government funds, planning for educational needs, infrastructure development, and healthcare services.

This guide will walk through the steps to download `TIGER` census data, load it into Postgres with `ogr2ogr`, and confirm functionality using the `postgis_tiger_geocoder` extension.

## Contents
- [Get ahold of ogr2ogr](#get-ahold-of-ogr2ogr)
- [Obtaining and loading the data](#obtaining-and-loading-the-data)
    - [Single file](#single-file)
    - [Multiple files](#multiple-files)
- [Confirm successful load](#confirm-successful-load)

## Get ahold of ogr2ogr

[ogr2ogr](https://gdal.org/programs/ogr2ogr.html) is a tool within GDAL (Geospatial Data Abstraction Library); an open source library maintained by OSGeo. PostGIS recognizes `ogr2ogr` as a valid loading method, which can be read about within the [PostGIS official training material](https://postgis.net/workshops/postgis-intro/loading_data.html#loading-with-ogr2ogr).

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

There are numerous flags that allow you to configure a `ogr2ogr` command, which outlined within the [description section](https://gdal.org/programs/ogr2ogr.html#description) of the official documentation.

Below we've laid out a select few that we'll be using in this guide:

| Parameter                                                | Description                                                                                    |
|----------------------------------------------------------|------------------------------------------------------------------------------------------------|
| `-f "PostgreSQL"`                                        | Specifies the format of the output data source, in this case, PostgreSQL.                      |
| `PG:"dbname=postgres host=<your-host> port=5432 user=postgres password=<your-password>"` | Connection string for PostgreSQL database. Replace placeholders with your actual credentials. |
| `-nln tiger_data.ma_tabblock`                            | Name of the new layer (table) to be created in the database.                                  |
| `-nlt PROMOTE_TO_MULTI`                                  | Converts geometries to multi geometries.                                                      |
| `-lco GEOMETRY_NAME=the_geom`                            | Specifies the name of the geometry column in the new table.                                   |
| `-lco FID=gid`                                           | Designates the name of the FID (Feature ID) column in the new table.                          |
| `-lco PRECISION=no`                                      | Disables the storage of geometry precision.                                                   |
| `tl_2010_25_tabblock10.shp`                              | The path to the input shapefile.                          

## Obtaining and loading the data

While there are many ways to acquire census data, one good source is from the [United States Census Bureau](https://www.census.gov/).

[TIGER](https://www.census.gov/programs-surveys/geography/guidance/tiger-data-products-guide.html#:~:text=TIGER%20stands%20for%20the%20Topologically,data%20as%20the%20primary%20source.) is an acronym for "Topologically Integrated Geographic Encoding and Referencing system", and is the United States Census Bureau's database for census and survey mapping. [Click here](https://www2.census.gov/geo/pvs/tiger2010st/) for the US Census Bureau directory for TIGER/Line shapefiles for all states, dated 2010.

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

### Single file



### Multiple files

Once you have the data, you can use `ogr2ogr` to load the shapefiles.
We have a script

<details>
<summary><strong>Example Script</strong></summary>

Open your terminal and run the following commands:

<<<<<<< HEAD
=======
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
>>>>>>> 9bdaf1eebb121935c6436f779038ae3e4865e4ee
```
#!/bin/bash

# Set these variables according to your environment
PGDATABASE=postgres
PGHOST=org-evan-test-inst-evan-dev-march-geo-test.data-1.use1.tembo-development.com
PGPORT=5432
PGUSER=postgres
PGPASSWORD=VC2tVa2vz8bBEhUU
#DATA_DIR=.
SCHEMA_NAME=public

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
    declare -a file_types=("bg10" "tract10" "tabblock10")

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

## Confirm successful load

`psql` into Postgres and run the following:

```
CREATE EXTENSION postgis_tiger_geocoder CASCADE;
```

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
