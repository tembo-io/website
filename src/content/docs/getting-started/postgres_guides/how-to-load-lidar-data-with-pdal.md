---
title: How to load LiDAR data into Postgres with PDAL
description: This guide will walk through downloading sample LiDAR data and loading it into Postgres with PDAL.
---

The aptly-named point cloud dataset represents a collection of data points in space and is commonly associated with 3D scanners, such as LiDAR. This technology has a wide range of applications, from autonomous vehicles to urban planning and natural resource management.

This guide will walk through the steps to download sample LiDAR data, load it into Postgres with PDAL, and confirm functionality using the `pgpointcloud` extension.

The Postgres instance used in this guide was powered by [Tembo Cloud](https://cloud.tembo.io/)'s Geospatial Stack.
To learn more about the Geospatial Stack [click here](https://tembo.io/docs/product/stacks/analytical/geospatial).

## Table of contents
- [Download PDAL](#download-pdal)
- [Obtain the data](#obtain-the-data)
- [Load sample data with PDAL](#load-sample-data-with-pdal)
- [Test for functionality](#test-for-functionality)

## Download PDAL

[PDAL](https://pdal.io/) (Point Data Abstraction Library) is an open-source library for translating and processing point cloud data.
It is a powerful tool for working with LiDAR data and can be used to load data into Postgres.

If you haven’t already, please download it:

<details>
<summary><strong>MacOS</strong></summary>

```bash
brew install pdal
```

</details>

<details>
<summary><strong>Linux</strong></summary>

```bash
sudo apt-get update
sudo apt-get install pdal
```

</details>

For Windows and others, please refer to the [official PDAL download page](https://pdal.io/en/2.7-maintenance/download.html).

## Obtain the data

While there are many ways to acquire LiDAR data, one good source is from the [The United States Geological Survey](https://www.usgs.gov/faqs/what-lidar-data-and-where-can-i-download-it).

For this guide, we utilized the [3DEP LidarExplorer](https://apps.nationalmap.gov/lidar-explorer/#/) and navigated to the [following dataset](https://www.sciencebase.gov/catalog/item/61cab6f9d34e0fd3e7b25dbd) from Yellowstone National Park.

Out of the box, PDAL offers functionality to explore raw data by running `pdal info`, for example:

```bash
pdal info USGS_LPC_WY_YellowstoneNP_2020_D20_12TVQ980780.laz
```

:bulb: Note that running `pdal info` on a .laz file will create a cloud-optimized point cloud file with the same name, but with the `.copc.laz` extension. `.copc` files are out of scope of this guide, but more information can be found [here](https://copc.io/).

Select results:

```text
Number of points: 7337487
Number of dimensions: 18
```

<details>
<summary><strong>Extended Results</strong></summary>

```json
{
  "file_size": 41637748,
  "filename": "USGS_LPC_WY_YellowstoneNP_2020_D20_12TVQ980780.laz",
  "now": "2024-03-31T20:23:15+0200",
  "pdal_version": "2.6.3 (git-version: Release)",
  "reader": "readers.las",
  "stats":
  {
    "bbox":
    {
      "EPSG:4326":
      {
        "bbox":
        {
          "maxx": -111.0190172,
          "maxy": 44.95993601,
          "maxz": 2273.45,
          "minx": -111.0253581,
          "miny": 44.95543387,
          "minz": 2199.35
        },
        "boundary": { "type": "Polygon", "coordinates": [ [ [ -111.025356136111228, 44.955433869667083, 2199.35 ], [ -111.025358118426794, 44.959934776253547, 2199.35 ], [ -111.019018716018422, 44.959936007896026, 2273.450000000000273 ], [ -111.019017229271711, 44.955435101117374, 2273.450000000000273 ], [ -111.025356136111228, 44.955433869667083, 2199.35 ] ] ] }
      },
      "native":
      {
        "bbox":
        {
          "maxx": 498499.99,
          "maxy": 4978499.99,
          "maxz": 2273.45,
          "minx": 498000,
          "miny": 4978000,
          "minz": 2199.35
        },
        "boundary": { "type": "Polygon", "coordinates": [ [ [ 498000.0, 4978000.0, 2199.35 ], [ 498000.0, 4978499.990000000223517, 2199.35 ], [ 498499.99, 4978499.990000000223517, 2273.450000000000273 ], [ 498499.99, 4978000.0, 2273.450000000000273 ], [ 498000.0, 4978000.0, 2199.35 ] ] ] }
      }
    },
    "statistic":
    [
      {
        "average": 498274.1092,
        "count": 7337487,
        "maximum": 498499.99,
        "minimum": 498000,
        "name": "X",
        "position": 0,
        "stddev": 136.150308,
        "variance": 18536.90638
      },
      {
        "average": 4978258.089,
        "count": 7337487,
        "maximum": 4978499.99,
        "minimum": 4978000,
        "name": "Y",
        "position": 1,
        "stddev": 145.3071764,
        "variance": 21114.1755
      },
      {
        "average": 2219.416485,
        "count": 7337487,
        "maximum": 2273.45,
        "minimum": 2199.35,
        "name": "Z",
        "position": 2,
        "stddev": 16.75870489,
        "variance": 280.8541896
      },
      {
        "average": 1963.953869,
        "count": 7337487,
        "maximum": 6825,
        "minimum": 185,
        "name": "Intensity",
        "position": 3,
        "stddev": 887.143548,
        "variance": 787023.6748
      },
      {
        "average": 1.214731828,
        "count": 7337487,
        "maximum": 7,
        "minimum": 1,
        "name": "ReturnNumber",
        "position": 4,
        "stddev": 0.5639972576,
        "variance": 0.3180929066
      },
      {
        "average": 1.42409438,
        "count": 7337487,
        "maximum": 7,
        "minimum": 1,
        "name": "NumberOfReturns",
        "position": 5,
        "stddev": 0.8283597823,
        "variance": 0.6861799289
      },
      {
        "average": 0.5056416454,
        "count": 7337487,
        "maximum": 1,
        "minimum": 0,
        "name": "ScanDirectionFlag",
        "position": 6,
        "stddev": 0.4999682049,
        "variance": 0.2499682059
      },
      {
        "average": 0,
        "count": 7337487,
        "maximum": 0,
        "minimum": 0,
        "name": "EdgeOfFlightLine",
        "position": 7,
        "stddev": 0,
        "variance": 0
      },
      {
        "average": 1.498680679,
        "count": 7337487,
        "maximum": 7,
        "minimum": 1,
        "name": "Classification",
        "position": 8,
        "stddev": 0.5044351898,
        "variance": 0.2544548607
      },
      {
        "average": 1.397167229,
        "count": 7337487,
        "maximum": 19.99799919,
        "minimum": -19.99799919,
        "name": "ScanAngleRank",
        "position": 9,
        "stddev": 12.42244903,
        "variance": 154.31724
      },
      {
        "average": 12.20088581,
        "count": 7337487,
        "maximum": 15,
        "minimum": 11,
        "name": "UserData",
        "position": 10,
        "stddev": 1.833416746,
        "variance": 3.361416965
      },
      {
        "average": 8129.116813,
        "count": 7337487,
        "maximum": 15020,
        "minimum": 5018,
        "name": "PointSourceId",
        "position": 11,
        "stddev": 4629.13075,
        "variance": 21428851.51
      },
      {
        "average": 285738091.5,
        "count": 7337487,
        "maximum": 285963402.9,
        "minimum": 285435244.8,
        "name": "GpsTime",
        "position": 12,
        "stddev": 210799.1792,
        "variance": 4.443629394e+10
      },
      {
        "average": 3,
        "count": 7337487,
        "maximum": 3,
        "minimum": 3,
        "name": "ScanChannel",
        "position": 13,
        "stddev": 0,
        "variance": 0
      },
      {
        "average": 0,
        "count": 7337487,
        "maximum": 0,
        "minimum": 0,
        "name": "Synthetic",
        "position": 14,
        "stddev": 0,
        "variance": 0
      },
      {
        "average": 0,
        "count": 7337487,
        "maximum": 0,
        "minimum": 0,
        "name": "KeyPoint",
        "position": 15,
        "stddev": 0,
        "variance": 0
      },
      {
        "average": 0.0001485522223,
        "count": 7337487,
        "maximum": 1,
        "minimum": 0,
        "name": "Withheld",
        "position": 16,
        "stddev": 0.01218729563,
        "variance": 0.0001485301748
      },
      {
        "average": 0.6506903522,
        "count": 7337487,
        "maximum": 1,
        "minimum": 0,
        "name": "Overlap",
        "position": 17,
        "stddev": 0.4767519782,
        "variance": 0.2272924487
      }
    ]
  }
}
```

</details>

## Load sample data with PDAL

PDAL excels in its ability to compose operations on point clouds as stages within user-configured pipelines.
As these pipelines can be written in a declarative JSON syntax, this guide will compose a simple json file based on the [pgpointcloud getting started guide](https://pgpointcloud.github.io/pointcloud/quickstart.html#running-a-pipeline).

The example `pipeline.json` file uses three types:
1. `readers.las` - reads LiDAR data in the LAS format (also supporting LAZ format, which is compressed LAS). 
2. `filters.chipper` - divides the data into smaller chunks. These will later be referred to as `patches`, or as the `pa` column.
3. `writers.pgpointcloud` - writes the data to a PostgreSQL database with the `pgpointcloud` extension.

```json
{
  "pipeline":[
    {
      "type":"readers.las",
      "filename":"USGS_LPC_WY_YellowstoneNP_2020_D20_12TVQ980780.copc.laz"
    },
    {
      "type":"filters.chipper",
      "capacity":"400"
    },
    {
      "type":"writers.pgpointcloud",
      "connection":"host='<your-host>' dbname='postgres' user='postgres' password='<your-password>' port='5432'",
      "table":"usgs",
      "compression":"dimensional",
      "srid":"4326"
    }
  ]
}
```

Run the pipeline with the following command:

```bash
pdal pipeline pipeline.json
```

## Test for functionality

`psql` into Postgres and enable the `pgpointcloud` extension:

```sql
CREATE EXTENSION pointcloud CASCADE;
```

### Query 1 - Table structure

Upon processing the data with the PDAL pipeline and loading it into Postgres, what does the table structure look like?

Running `\d <table-name>` or `\d+ <table-name>` is the fastest way to check the table structure:

```text
\d usgs

                              Table "public.usgs"
 Column |    Type    | Collation | Nullable |             Default
--------+------------+-----------+----------+----------------------------------
 id     | integer    |           | not null | nextval('usgs_id_seq'::regclass)
 pa     | pcpatch(2) |           |          |
Indexes:
    "usgs_pkey" PRIMARY KEY, btree (id)
```

However if you'd like to cross reference multiple tables, you could run something like the following:

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name IN ('usgs', '<second-table>');
```
```text
 column_name
-------------
 id
 pa
 <second-table-column-1>
 <second-table-column-2>
(4 rows)
```

### Query 2 - Summarize the data set

Prior to loading into Postgres, we ran `pdal info` to summarize the data set.
We can use the `PC_Summary` function to achieve the same from within the database.

```sql
SELECT jsonb_pretty(PC_Summary(pa)::jsonb) FROM usgs LIMIT 1;
```

We've opted not to reprint the output, as it can be found above within the `Extended Results` output of the [Obtain the data](#obtain-the-data) secion, earlier in this guide.

### Query 3 - Highest intensity

We see from data summary that the `Intensity` parameter has the following statistics:

```json
{
  "average": 1963.953869,
  "count": 7337487,
  "maximum": 6825,
  "minimum": 185,
  "name": "Intensity",
  "position": 3,
  "stddev": 887.143548,
  "variance": 787023.6748
}
```

We may have an interest in the maximum intensity value of 6825, which we can investigate further using the `PC_FilterGreaterThan` function.

The following query identifies the `id` of the patch in the `usgs` table that contains the highest number of points with an intensity value greater than 5000.

```sql
SELECT
  id,
  COUNT(*) AS high_intensity_points_count
FROM (
  SELECT
    id,
    PC_Explode(PC_FilterGreaterThan(pa, 'Intensity', 5000)) AS high_intensity_point
  FROM
    usgs
) sub
GROUP BY
  id
ORDER BY
  high_intensity_points_count DESC
LIMIT 1;
```
```
  id  | high_intensity_points_count
------+-----------------------------
 9348 |                          19
(1 row)
```

