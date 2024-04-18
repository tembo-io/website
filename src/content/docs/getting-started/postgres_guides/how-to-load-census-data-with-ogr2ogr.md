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
<summary><strong>multistate_load.sh</strong></summary>

```bash
#!/bin/bash

TMPDIR="<path/to/temp/dir>"
UNZIPTOOL=unzip
WGETTOOL="<path/to/wget>"
OGR2OGR="<path/to/ogr2ogr>"
export PGBIN="<path/to/postgresql/bin>"
export PGPORT=5432
export PGHOST=<your-host>
export PGUSER=postgres
export PGPASSWORD=<your-password>
export PGDATABASE=postgres
PSQL=${PGBIN}/psql

# Function to convert state abbreviation to FIPS code
state_to_fips() {
    case "$1" in
        AL) echo "01" ;; # Alabama
        AK) echo "02" ;; # Alaska
        AZ) echo "04" ;; # Arizona
        AR) echo "05" ;; # Arkansas
        CA) echo "06" ;; # California
        CO) echo "08" ;; # Colorado
        CT) echo "09" ;; # Connecticut
        DE) echo "10" ;; # Delaware
        DC) echo "11" ;; # District of Columbia
        FL) echo "12" ;; # Florida
        GA) echo "13" ;; # Georgia
        HI) echo "15" ;; # Hawaii
        ID) echo "16" ;; # Idaho
        IL) echo "17" ;; # Illinois
        IN) echo "18" ;; # Indiana
        IA) echo "19" ;; # Iowa
        KS) echo "20" ;; # Kansas
        KY) echo "21" ;; # Kentucky
        LA) echo "22" ;; # Louisiana
        ME) echo "23" ;; # Maine
        MD) echo "24" ;; # Maryland
        MA) echo "25" ;; # Massachusetts
        MI) echo "26" ;; # Michigan
        MN) echo "27" ;; # Minnesota
        MS) echo "28" ;; # Mississippi
        MO) echo "29" ;; # Missouri
        MT) echo "30" ;; # Montana
        NE) echo "31" ;; # Nebraska
        NV) echo "32" ;; # Nevada
        NH) echo "33" ;; # New Hampshire
        NJ) echo "34" ;; # New Jersey
        NM) echo "35" ;; # New Mexico
        NY) echo "36" ;; # New York
        NC) echo "37" ;; # North Carolina
        ND) echo "38" ;; # North Dakota
        OH) echo "39" ;; # Ohio
        OK) echo "40" ;; # Oklahoma
        OR) echo "41" ;; # Oregon
        PA) echo "42" ;; # Pennsylvania
        RI) echo "44" ;; # Rhode Island
        SC) echo "45" ;; # South Carolina
        SD) echo "46" ;; # South Dakota
        TN) echo "47" ;; # Tennessee
        TX) echo "48" ;; # Texas
        UT) echo "49" ;; # Utah
        VT) echo "50" ;; # Vermont
        VA) echo "51" ;; # Virginia
        WA) echo "53" ;; # Washington
        WV) echo "54" ;; # West Virginia
        WI) echo "55" ;; # Wisconsin
        WY) echo "56" ;; # Wyoming
        AS) echo "60" ;; # American Samoa
        GU) echo "66" ;; # Guam
        MP) echo "69" ;; # Northern Mariana Islands
        PR) echo "72" ;; # Puerto Rico
        VI) echo "78" ;; # U.S. Virgin Islands
        # Default case if state is unknown
        *) echo "Unknown" ;;
    esac
}

# Check for at least one argument
if [ $# -lt 1 ]; then
    echo "Usage: $0 <State Abbreviation>"
    exit 1
fi

STATE_ABBR=$1
STATE_FIPS=$(state_to_fips $STATE_ABBR)

if [ "$STATE_FIPS" = "Unknown" ]; then
    echo "Invalid or unsupported state abbreviation: $STATE_ABBR"
    exit 1
fi

 cd ${TMPDIR%/*}
 wget https://www2.census.gov/geo/tiger/TIGER2022/PLACE/tl_2022_${STATE_FIPS}_place.zip --mirror --reject=html
 cd ${TMPDIR%/*}/www2.census.gov/geo/tiger/TIGER2022/PLACE
 rm -f ${TMPDIR}/*.*
 ${PSQL} -c "DROP SCHEMA IF EXISTS tiger_staging CASCADE;"
 ${PSQL} -c "CREATE SCHEMA tiger_staging;"
 
for z in tl_2022_${STATE_FIPS}*_place.zip; do
    $UNZIPTOOL -o -d $TMPDIR $z;
done
cd $TMPDIR;

 ${PSQL} -c "CREATE TABLE tiger_data.${STATE_ABBR}_place(CONSTRAINT pk_${STATE_ABBR}_place PRIMARY KEY (plcidfp) ) INHERITS(tiger.place);" 

 ${OGR2OGR} -f "PostgreSQL" PG:"dbname=${PGDATABASE} host=${PGHOST} port=${PGPORT} user=${PGUSER} password=${PGPASSWORD}" -nln tiger_staging.ma_place -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=the_geom -lco FID=gid -lco PRECISION=NO -a_srs "EPSG:4269" -s_srs "EPSG:4269" ${TMPDIR}/tl_2022_${STATE_FIPS}_place.shp

 ${PSQL} -c "ALTER TABLE tiger_staging.${STATE_ABBR}_place RENAME geoid TO plcidfp;SELECT loader_load_staged_data(lower('${STATE_ABBR}_place'), lower('${STATE_ABBR}_place')); ALTER TABLE tiger_data.${STATE_ABBR}_place ADD CONSTRAINT uidx_${STATE_ABBR}_place_gid UNIQUE (gid);"
 ${PSQL} -c "CREATE INDEX idx_${STATE_ABBR}_place_soundex_name ON tiger_data.${STATE_ABBR}_place USING btree (soundex(name));"
 ${PSQL} -c "CREATE INDEX tiger_data_${STATE_ABBR}_place_the_geom_gist ON tiger_data.${STATE_ABBR}_place USING gist(the_geom);"
 ${PSQL} -c "ALTER TABLE tiger_data.${STATE_ABBR}_place ADD CONSTRAINT chk_statefp CHECK (statefp = '${STATE_FIPS}');"
 cd ${TMPDIR%/*}
 wget https://www2.census.gov/geo/tiger/TIGER2022/COUSUB/tl_2022_${STATE_FIPS}_cousub.zip --mirror --reject=html
 cd ${TMPDIR%/*}/www2.census.gov/geo/tiger/TIGER2022/COUSUB
 rm -f ${TMPDIR}/*.*
 ${PSQL} -c "DROP SCHEMA IF EXISTS tiger_staging CASCADE;"
 ${PSQL} -c "CREATE SCHEMA tiger_staging;"
 for z in tl_2022_${STATE_FIPS}*_cousub.zip ; do $UNZIPTOOL -o -d $TMPDIR $z; done
 cd $TMPDIR;

 ${PSQL} -c "CREATE TABLE tiger_data.${STATE_ABBR}_cousub(CONSTRAINT pk_${STATE_ABBR}_cousub PRIMARY KEY (cosbidfp), CONSTRAINT uidx_${STATE_ABBR}_cousub_gid UNIQUE (gid)) INHERITS(tiger.cousub);" 

 ${OGR2OGR} -f "PostgreSQL" PG:"dbname=${PGDATABASE} host=${PGHOST} port=${PGPORT} user=${PGUSER} password=${PGPASSWORD}" -nln tiger_staging.ma_cousub -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=the_geom -lco FID=gid -lco PRECISION=NO -a_srs "EPSG:4269" -s_srs "EPSG:4269" ${TMPDIR}/tl_2022_${STATE_FIPS}_cousub.shp

 ${PSQL} -c "ALTER TABLE tiger_staging.${STATE_ABBR}_cousub RENAME geoid TO cosbidfp;SELECT loader_load_staged_data(lower('${STATE_ABBR}_cousub'), lower('${STATE_ABBR}_cousub')); ALTER TABLE tiger_data.${STATE_ABBR}_cousub ADD CONSTRAINT chk_statefp CHECK (statefp = '${STATE_FIPS}');"
 ${PSQL} -c "CREATE INDEX tiger_data_${STATE_ABBR}_cousub_the_geom_gist ON tiger_data.${STATE_ABBR}_cousub USING gist(the_geom);"
 ${PSQL} -c "CREATE INDEX idx_tiger_data_${STATE_ABBR}_cousub_countyfp ON tiger_data.${STATE_ABBR}_cousub USING btree(countyfp);"
 cd ${TMPDIR%/*}
 wget https://www2.census.gov/geo/tiger/TIGER2022/TRACT/tl_2022_${STATE_FIPS}_tract.zip --mirror --reject=html
 cd ${TMPDIR%/*}/www2.census.gov/geo/tiger/TIGER2022/TRACT
 rm -f ${TMPDIR}/*.*
 ${PSQL} -c "DROP SCHEMA IF EXISTS tiger_staging CASCADE;"
 ${PSQL} -c "CREATE SCHEMA tiger_staging;"
 for z in tl_2022_${STATE_FIPS}*_tract.zip ; do $UNZIPTOOL -o -d $TMPDIR $z; done
 cd $TMPDIR;

 ${PSQL} -c "CREATE TABLE tiger_data.${STATE_ABBR}_tract(CONSTRAINT pk_${STATE_ABBR}_tract PRIMARY KEY (tract_id) ) INHERITS(tiger.tract); " 

 ${OGR2OGR} -f "PostgreSQL" PG:"dbname=${PGDATABASE} host=${PGHOST} port=${PGPORT} user=${PGUSER} password=${PGPASSWORD}" -nln tiger_staging.ma_tract -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=the_geom -lco FID=gid -lco PRECISION=NO -a_srs "EPSG:4269" -s_srs "EPSG:4269" ${TMPDIR}/tl_2022_${STATE_FIPS}_tract.shp

 ${PSQL} -c "ALTER TABLE tiger_staging.${STATE_ABBR}_tract RENAME geoid TO tract_id; SELECT loader_load_staged_data(lower('${STATE_ABBR}_tract'), lower('${STATE_ABBR}_tract')); "
 	${PSQL} -c "CREATE INDEX tiger_data_${STATE_ABBR}_tract_the_geom_gist ON tiger_data.${STATE_ABBR}_tract USING gist(the_geom);"
 	${PSQL} -c "VACUUM ANALYZE tiger_data.${STATE_ABBR}_tract;"
 	${PSQL} -c "ALTER TABLE tiger_data.${STATE_ABBR}_tract ADD CONSTRAINT chk_statefp CHECK (statefp = '${STATE_FIPS}');"
 cd ${TMPDIR%/*}
 wget https://www2.census.gov/geo/tiger/TIGER2022/TABBLOCK20/tl_2022_${STATE_FIPS}_tabblock20.zip --mirror --reject=html
 cd ${TMPDIR%/*}/www2.census.gov/geo/tiger/TIGER2022/TABBLOCK20
 rm -f ${TMPDIR}/*.*
 ${PSQL} -c "DROP SCHEMA IF EXISTS tiger_staging CASCADE;"
 ${PSQL} -c "CREATE SCHEMA tiger_staging;"
 for z in tl_2022_${STATE_FIPS}*_tabblock20.zip ; do $UNZIPTOOL -o -d $TMPDIR $z; done
 cd $TMPDIR;

 ${PSQL} -c "CREATE TABLE tiger_data.${STATE_ABBR}_tabblock20(CONSTRAINT pk_${STATE_ABBR}_tabblock20 PRIMARY KEY (geoid)) INHERITS(tiger.tabblock20);" 

 ${OGR2OGR} -f "PostgreSQL" PG:"dbname=${PGDATABASE} host=${PGHOST} port=${PGPORT} user=${PGUSER} password=${PGPASSWORD}" -nln tiger_staging.ma_tabblock20 -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=the_geom -lco FID=gid -lco PRECISION=NO -a_srs "EPSG:4269" -s_srs "EPSG:4269" ${TMPDIR}/tl_2022_${STATE_FIPS}_tabblock20.shp

 ${PSQL} -c "SELECT loader_load_staged_data(lower('${STATE_ABBR}_tabblock20'), lower('${STATE_ABBR}_tabblock20')); "
 ${PSQL} -c "ALTER TABLE tiger_data.${STATE_ABBR}_tabblock20 ADD CONSTRAINT chk_statefp CHECK (statefp = '${STATE_FIPS}');"
 ${PSQL} -c "CREATE INDEX tiger_data_${STATE_ABBR}_tabblock20_the_geom_gist ON tiger_data.${STATE_ABBR}_tabblock20 USING gist(the_geom);"
 ${PSQL} -c "vacuum analyze tiger_data.${STATE_ABBR}_tabblock20;"
 cd ${TMPDIR%/*}
 wget https://www2.census.gov/geo/tiger/TIGER2022/BG/tl_2022_${STATE_FIPS}_bg.zip --mirror --reject=html
 cd ${TMPDIR%/*}/www2.census.gov/geo/tiger/TIGER2022/BG
 rm -f ${TMPDIR}/*.*
 ${PSQL} -c "DROP SCHEMA IF EXISTS tiger_staging CASCADE;"
 ${PSQL} -c "CREATE SCHEMA tiger_staging;"
 for z in tl_2022_${STATE_FIPS}*_bg.zip ; do $UNZIPTOOL -o -d $TMPDIR $z; done
 cd $TMPDIR;

 ${PSQL} -c "CREATE TABLE tiger_data.${STATE_ABBR}_bg(CONSTRAINT pk_${STATE_ABBR}_bg PRIMARY KEY (bg_id)) INHERITS(tiger.bg);" 

 ${OGR2OGR} -f "PostgreSQL" PG:"dbname=${PGDATABASE} host=${PGHOST} port=${PGPORT} user=${PGUSER} password=${PGPASSWORD}" -nln tiger_staging.ma_bg -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=the_geom -lco FID=gid -lco PRECISION=NO -a_srs "EPSG:4269" -s_srs "EPSG:4269" ${TMPDIR}/tl_2022_${STATE_FIPS}_bg.shp

 ${PSQL} -c "ALTER TABLE tiger_staging.${STATE_ABBR}_bg RENAME geoid TO bg_id;  SELECT loader_load_staged_data(lower('${STATE_ABBR}_bg'), lower('${STATE_ABBR}_bg')); "
 ${PSQL} -c "ALTER TABLE tiger_data.${STATE_ABBR}_bg ADD CONSTRAINT chk_statefp CHECK (statefp = '${STATE_FIPS}');"
 ${PSQL} -c "CREATE INDEX tiger_data_${STATE_ABBR}_bg_the_geom_gist ON tiger_data.${STATE_ABBR}_bg USING gist(the_geom);"
 ${PSQL} -c "vacuum analyze tiger_data.${STATE_ABBR}_bg;"

 cd ${TMPDIR%/*}

# Use curl to fetch the directory listing, grep to filter it, and cut to extract filenames
curl -s https://www2.census.gov/geo/tiger/TIGER2022/FACES/ | grep 'tl_2022_'${STATE_FIPS}'[^"]*_faces.zip' | grep -o 'href="[^"]*"' | cut -d '"' -f 2 > files_to_download.txt

# Download each file listed
while IFS= read -r file; do

    wget --mirror "https://www2.census.gov/geo/tiger/TIGER2022/FACES/$file"
done < files_to_download.txt

 cd ${TMPDIR%/*}/www2.census.gov/geo/tiger/TIGER2022/FACES/
 rm -f ${TMPDIR}/*.*
 ${PSQL} -c "DROP SCHEMA IF EXISTS tiger_staging CASCADE;"
 ${PSQL} -c "CREATE SCHEMA tiger_staging;"
 for z in tl_*_${STATE_FIPS}*_faces*.zip ; do $UNZIPTOOL -o -d $TMPDIR $z; done
 cd $TMPDIR;

 ${PSQL} -c "CREATE TABLE tiger_data.${STATE_ABBR}_faces(CONSTRAINT pk_${STATE_ABBR}_faces PRIMARY KEY (gid)) INHERITS(tiger.faces);" 
 for z in *faces*.shp; do ${OGR2OGR} -f "PostgreSQL" PG:"dbname=${PGDATABASE} host=${PGHOST} port=${PGPORT} user=${PGUSER} password=${PGPASSWORD}" -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=the_geom -lco FID=gid -lco PRECISION=no -nln tiger_staging.${STATE_ABBR}_faces $z; 
 ${PSQL} -c "SELECT loader_load_staged_data(lower('${STATE_ABBR}_faces'), lower('${STATE_ABBR}_faces'));"
 done

 ${PSQL} -c "CREATE INDEX tiger_data_${STATE_ABBR}_faces_the_geom_gist ON tiger_data.${STATE_ABBR}_faces USING gist(the_geom);"
 	${PSQL} -c "CREATE INDEX idx_tiger_data_${STATE_ABBR}_faces_tfid ON tiger_data.${STATE_ABBR}_faces USING btree (tfid);"
 	${PSQL} -c "CREATE INDEX idx_tiger_data_${STATE_ABBR}_faces_countyfp ON tiger_data.${STATE_ABBR}_faces USING btree (countyfp);"
 	${PSQL} -c "ALTER TABLE tiger_data.${STATE_ABBR}_faces ADD CONSTRAINT chk_statefp CHECK (statefp = '${STATE_FIPS}');"
 	${PSQL} -c "vacuum analyze tiger_data.${STATE_ABBR}_faces;"

 cd ${TMPDIR%/*}
 
# Use curl to fetch the directory listing, grep to filter it, and cut to extract filenames
curl -s https://www2.census.gov/geo/tiger/TIGER2022/FEATNAMES/ | grep 'tl_2022_'${STATE_FIPS}'[^"]*_featnames.zip' | grep -o 'href="[^"]*"' | cut -d '"' -f 2 > files_to_download.txt

# Download each file listed
while IFS= read -r file; do

    wget --mirror "https://www2.census.gov/geo/tiger/TIGER2022/FEATNAMES/$file"
done < files_to_download.txt

 cd ${TMPDIR%/*}/www2.census.gov/geo/tiger/TIGER2022/FEATNAMES/
 rm -f ${TMPDIR}/*.*
 ${PSQL} -c "DROP SCHEMA IF EXISTS tiger_staging CASCADE;"
 ${PSQL} -c "CREATE SCHEMA tiger_staging;"
 for z in tl_*_${STATE_FIPS}*_featnames*.zip ; do $UNZIPTOOL -o -d $TMPDIR $z; done
 cd $TMPDIR;

 ${PSQL} -c "CREATE TABLE tiger_data.${STATE_ABBR}_featnames(CONSTRAINT pk_${STATE_ABBR}_featnames PRIMARY KEY (gid)) INHERITS(tiger.featnames);ALTER TABLE tiger_data.${STATE_ABBR}_featnames ALTER COLUMN statefp SET DEFAULT '${STATE_FIPS}';" 
 for z in *featnames*.dbf; do ${OGR2OGR} -f "PostgreSQL" PG:"dbname=${PGDATABASE} host=${PGHOST} port=${PGPORT} user=${PGUSER} password=${PGPASSWORD}" -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=the_geom -lco FID=gid -lco PRECISION=no -nln tiger_staging.${STATE_ABBR}_featnames $z;
 ${PSQL} -c "SELECT loader_load_staged_data(lower('${STATE_ABBR}_featnames'), lower('${STATE_ABBR}_featnames'));"
 done

 ${PSQL} -c "CREATE INDEX idx_tiger_data_${STATE_ABBR}_featnames_snd_name ON tiger_data.${STATE_ABBR}_featnames USING btree (soundex(name));"
 ${PSQL} -c "CREATE INDEX idx_tiger_data_${STATE_ABBR}_featnames_lname ON tiger_data.${STATE_ABBR}_featnames USING btree (lower(name));"
 ${PSQL} -c "CREATE INDEX idx_tiger_data_${STATE_ABBR}_featnames_tlid_statefp ON tiger_data.${STATE_ABBR}_featnames USING btree (tlid,statefp);"
 ${PSQL} -c "ALTER TABLE tiger_data.${STATE_ABBR}_featnames ADD CONSTRAINT chk_statefp CHECK (statefp = '${STATE_FIPS}');"
 ${PSQL} -c "vacuum analyze tiger_data.${STATE_ABBR}_featnames;"

 cd ${TMPDIR%/*}
 
# Use curl to fetch the directory listing, grep to filter it, and cut to extract filenames
curl -s https://www2.census.gov/geo/tiger/TIGER2022/EDGES/ | grep 'tl_2022_'${STATE_FIPS}'[^"]*_edges.zip' | grep -o 'href="[^"]*"' | cut -d '"' -f 2 > files_to_download.txt

# Download each file listed
while IFS= read -r file; do

    wget --mirror "https://www2.census.gov/geo/tiger/TIGER2022/EDGES/$file"
done < files_to_download.txt

 cd ${TMPDIR%/*}/www2.census.gov/geo/tiger/TIGER2022/EDGES/
 rm -f ${TMPDIR}/*.*
 ${PSQL} -c "DROP SCHEMA IF EXISTS tiger_staging CASCADE;"
 ${PSQL} -c "CREATE SCHEMA tiger_staging;"
 for z in tl_*_${STATE_FIPS}*_edges*.zip ; do $UNZIPTOOL -o -d $TMPDIR $z; done
 cd $TMPDIR;

 ${PSQL} -c "CREATE TABLE tiger_data.${STATE_ABBR}_edges(CONSTRAINT pk_${STATE_ABBR}_edges PRIMARY KEY (gid)) INHERITS(tiger.edges);"
 for z in *edges*.shp; do ${OGR2OGR} -f "PostgreSQL" PG:"dbname=${PGDATABASE} host=${PGHOST} port=${PGPORT} user=${PGUSER} password=${PGPASSWORD}" -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=the_geom -lco FID=gid -lco PRECISION=no -nln tiger_staging.${STATE_ABBR}_edges $z; 
${PSQL} -c "SELECT loader_load_staged_data(lower('${STATE_ABBR}_edges'), lower('${STATE_ABBR}_edges'));"
 done

 ${PSQL} -c "ALTER TABLE tiger_data.${STATE_ABBR}_edges ADD CONSTRAINT chk_statefp CHECK (statefp = '${STATE_FIPS}');"
 ${PSQL} -c "CREATE INDEX idx_tiger_data_${STATE_ABBR}_edges_tlid ON tiger_data.${STATE_ABBR}_edges USING btree (tlid);"
 ${PSQL} -c "CREATE INDEX idx_tiger_data_${STATE_ABBR}_edgestfidr ON tiger_data.${STATE_ABBR}_edges USING btree (tfidr);"
 ${PSQL} -c "CREATE INDEX idx_tiger_data_${STATE_ABBR}_edges_tfidl ON tiger_data.${STATE_ABBR}_edges USING btree (tfidl);"
 ${PSQL} -c "CREATE INDEX idx_tiger_data_${STATE_ABBR}_edges_countyfp ON tiger_data.${STATE_ABBR}_edges USING btree (countyfp);"
 ${PSQL} -c "CREATE INDEX tiger_data_${STATE_ABBR}_edges_the_geom_gist ON tiger_data.${STATE_ABBR}_edges USING gist(the_geom);"
 ${PSQL} -c "CREATE INDEX idx_tiger_data_${STATE_ABBR}_edges_zipl ON tiger_data.${STATE_ABBR}_edges USING btree (zipl);"
 ${PSQL} -c "CREATE TABLE tiger_data.${STATE_ABBR}_zip_state_loc(CONSTRAINT pk_${STATE_ABBR}_zip_state_loc PRIMARY KEY(zip,stusps,place)) INHERITS(tiger.zip_state_loc);"
 ${PSQL} -c "INSERT INTO tiger_data.${STATE_ABBR}_zip_state_loc(zip,stusps,statefp,place) SELECT DISTINCT e.zipl, '${STATE_ABBR}', '${STATE_FIPS}', p.name FROM tiger_data.${STATE_ABBR}_edges AS e INNER JOIN tiger_data.${STATE_ABBR}_faces AS f ON (e.tfidl = f.tfid OR e.tfidr = f.tfid) INNER JOIN tiger_data.${STATE_ABBR}_place As p ON(f.statefp = p.statefp AND f.placefp = p.placefp ) WHERE e.zipl IS NOT NULL;"
 ${PSQL} -c "CREATE INDEX idx_tiger_data_${STATE_ABBR}_zip_state_loc_place ON tiger_data.${STATE_ABBR}_zip_state_loc USING btree(soundex(place));"
 ${PSQL} -c "ALTER TABLE tiger_data.${STATE_ABBR}_zip_state_loc ADD CONSTRAINT chk_statefp CHECK (statefp = '${STATE_FIPS}');"
 ${PSQL} -c "vacuum analyze tiger_data.${STATE_ABBR}_edges;"
 ${PSQL} -c "vacuum analyze tiger_data.${STATE_ABBR}_zip_state_loc;"
 ${PSQL} -c "CREATE TABLE tiger_data.${STATE_ABBR}_zip_lookup_base(CONSTRAINT pk_${STATE_ABBR}_zip_state_loc_city PRIMARY KEY(zip,state, county, city, statefp)) INHERITS(tiger.zip_lookup_base);"
 ${PSQL} -c "INSERT INTO tiger_data.${STATE_ABBR}_zip_lookup_base(zip,state,county,city, statefp) SELECT DISTINCT e.zipl, '${STATE_ABBR}', c.name,p.name,'${STATE_FIPS}'  FROM tiger_data.${STATE_ABBR}_edges AS e INNER JOIN tiger.county As c  ON (e.countyfp = c.countyfp AND e.statefp = c.statefp AND e.statefp = '${STATE_FIPS}') INNER JOIN tiger_data.${STATE_ABBR}_faces AS f ON (e.tfidl = f.tfid OR e.tfidr = f.tfid) INNER JOIN tiger_data.${STATE_ABBR}_place As p ON(f.statefp = p.statefp AND f.placefp = p.placefp ) WHERE e.zipl IS NOT NULL;"
 ${PSQL} -c "ALTER TABLE tiger_data.${STATE_ABBR}_zip_lookup_base ADD CONSTRAINT chk_statefp CHECK (statefp = '${STATE_FIPS}');"
 ${PSQL} -c "CREATE INDEX idx_tiger_data_${STATE_ABBR}_zip_lookup_base_citysnd ON tiger_data.${STATE_ABBR}_zip_lookup_base USING btree(soundex(city));"

 cd ${TMPDIR%/*}

# Use curl to fetch the directory listing, grep to filter it, and cut to extract filenames
curl -s https://www2.census.gov/geo/tiger/TIGER2022/ADDR/ | grep 'tl_2022_'${STATE_FIPS}'[^"]*_addr.zip' | grep -o 'href="[^"]*"' | cut -d '"' -f 2 > files_to_download.txt

# Download each file listed
while IFS= read -r file; do

    wget --mirror "https://www2.census.gov/geo/tiger/TIGER2022/ADDR/$file"
done < files_to_download.txt

cd ${TMPDIR%/*}/www2.census.gov/geo/tiger/TIGER2022/ADDR/
 rm -f ${TMPDIR}/*.*
 ${PSQL} -c "DROP SCHEMA IF EXISTS tiger_staging CASCADE;"
 ${PSQL} -c "CREATE SCHEMA tiger_staging;"
 for z in tl_*_${STATE_FIPS}*_addr*.zip ; do $UNZIPTOOL -o -d $TMPDIR $z; done
 cd $TMPDIR;

 ${PSQL} -c "CREATE TABLE tiger_data.${STATE_ABBR}_addr(CONSTRAINT pk_${STATE_ABBR}_addr PRIMARY KEY (gid)) INHERITS(tiger.addr);ALTER TABLE tiger_data.${STATE_ABBR}_addr ALTER COLUMN statefp SET DEFAULT '${STATE_FIPS}';" 
 for z in *addr*.dbf; do
 	${OGR2OGR} -f "PostgreSQL" PG:"dbname=${PGDATABASE} host=${PGHOST} port=${PGPORT} user=${PGUSER} password=${PGPASSWORD}" -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=the_geom -lco FID=gid -lco PRECISION=no -nln tiger_staging.${STATE_ABBR}_addr $z; 
 	${PSQL} -c "SELECT loader_load_staged_data(lower('${STATE_ABBR}_addr'), lower('${STATE_ABBR}_addr'));" 
 done

 ${PSQL} -c "ALTER TABLE tiger_data.${STATE_ABBR}_addr ADD CONSTRAINT chk_statefp CHECK (statefp = '${STATE_FIPS}');"
 ${PSQL} -c "CREATE INDEX idx_tiger_data_${STATE_ABBR}_addr_least_address ON tiger_data.${STATE_ABBR}_addr USING btree (least_hn(fromhn,tohn) );"
 ${PSQL} -c "CREATE INDEX idx_tiger_data_${STATE_ABBR}_addr_tlid_statefp ON tiger_data.${STATE_ABBR}_addr USING btree (tlid, statefp);"
 ${PSQL} -c "CREATE INDEX idx_tiger_data_${STATE_ABBR}_addr_zip ON tiger_data.${STATE_ABBR}_addr USING btree (zip);"
 ${PSQL} -c "CREATE TABLE tiger_data.${STATE_ABBR}_zip_state(CONSTRAINT pk_${STATE_ABBR}_zip_state PRIMARY KEY(zip,stusps)) INHERITS(tiger.zip_state); "
 ${PSQL} -c "INSERT INTO tiger_data.${STATE_ABBR}_zip_state(zip,stusps,statefp) SELECT DISTINCT zip, '${STATE_ABBR}', '${STATE_FIPS}' FROM tiger_data.${STATE_ABBR}_addr WHERE zip is not null;"
 ${PSQL} -c "ALTER TABLE tiger_data.${STATE_ABBR}_zip_state ADD CONSTRAINT chk_statefp CHECK (statefp = '${STATE_FIPS}');"
 ${PSQL} -c "vacuum analyze tiger_data.${STATE_ABBR}_addr;"

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
