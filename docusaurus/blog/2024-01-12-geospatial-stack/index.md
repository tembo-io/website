---
slug: geospatial-on-postgres
title: 'Geospatial Workloads on Postgres: An Elephant of a Story'
authors: [evan]
tags: [postgres, geospatial, stacks, database]
---

While today’s data is ubiquitous, there remain many cases whereby, only after providing additional contexts, can a collection of points graduate to valuable information. This is especially true when dealing with geospatial datasets.

Geospatial data and dealing with that data can be complex, but yield exciting insights. We at Tembo recently launched a Stack celebrate geospatial workloads! This comes pre-packaged with PostGIS and related extensions, and as always only a couple clicks away from any extension hosted in [Trunk](https://pgt.dev).

![extensions](./extensions.png 'extensions')

We wanted to showcase some interesting content, so please join us on a journey to Africa! Stick around to the end, where we will share insights that might be applicable to your personal use case.

Check out the source code and follow along interactively!

## 1. The Data

Forest elephant populations in the West African country of Côte d'Ivoire have been dwindling and are commonly relocated to nature preserves. One difficulty involved in monitoring their health and wellness is tied closely to the thick tropical forests where the elephants feel at home. To address this, select elephants are outfitted with tracking collars, which collects GPS (Global Positioning System) data for future analysis. The following dataset was gathered from Movebank, a repository for animal tracking data:

- Location: Africa, Côte d'Ivoire, Forest Preserve near the village of Dassioko
- Timeframe: 2018 - 2021
- Sample size: 1

The first step is to download [the dataset](https://www.movebank.org/cms/webapp?gwt_fragment=page%3Dstudies%2Cpath%3Dstudy2742086566), load it into a Postgres instance, and explore. A link to the provided study is provided here<https://www.movebank.org/cms/webapp?gwt_fragment=page%3Dstudies%2Cpath%3Dstudy2742086566>. To access the ogr2ogr tool comes bundled when downloading [GDAL](https://gdal.org/index.html).

```
ogr2ogr -f "PostgreSQL" \
PG:"dbname<YOUR DATABASE NAME> \
user=<YOUR USER NAME> \
password=<YOUR PASSWORD> \
host=<YOUR HOST>" \
-nln elephant5990 \
-lco PRECISION=NO \
points.shp 
```

```
SELECT COUNT(*) FROM elephant5990;
count
-----
9280
(1 row)
```

```
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'elephant5990'
ORDER BY ordinal_position;
column_name
ogc_fid
timestamp
long
lat
comments
sensor_typ
individual
tag_ident
ind_ident
study_name
utm_east
utm_north
utm_zone
study_tz
study_ts
date
time
wkb_geometry
(18 rows)
```
![map_data_points](./map_data_points.png 'map_data_points')

## 2. PostGIS

Already we see some interesting fields corresponding to coordinates and timestamps. With relative ease, we can leverage PostGIS to apply functions to further analyze the data. Some of the queries can be a bit lengthly, so in lieu of brevity we’ve listed key functions, paired with a study-related question it can help answer, as well as a potential business use case with a marketing focus. As mentioned above the source code can be found here<PATH TO SOURCE CODE REPO>.

### `ST_Distance`

ST_Distance can be used to find the minimum distance between two points. This approach can be extended in a recursive manner to many points.

- Which hour of the day (24hr format) with the highest average distance traveled (meters) per year?

| year | hour |       avg_distance        |
|------|------|---------------------------|
| 2018 |  20  | 500.1667879009256         |
| 2019 |  22  | 500.23505130464025        |
| 2020 |  20  | 490.65593160356303        |
| 2021 |  22  | 474.28919337170834        |

### `ST_Contains`

ST_Contains checks whether a given geometry A contains another geometry B.

- Throughout the study, how many times did the elephant enter Dassioko Village? Is there a particular year, month, day, time of day, where this was most frequent?

![map_area_village](./map_area_village.png 'map_area_village')

### `ST_ConcaveHull`, `ST_InteriorRingN`

ST_ConcaveHull can be used to establish a boundary around a set of points, while also allowing for gaps (known as holes). ST_InteriorRingN can then be used to identify these holes.

- On visual inspection, there appears to be an area of avoidance in the top left region of the dataset. Can this be identified with a query?

![map_area_avoidance](./map_area_avoidance.png 'map_area_avoidance')


## 3. Summary
Using Tembo’s Geospatial Stack, we were able to explore a GPS tracking dataset. Though this demonstration focused on the movements of a single elephant, it should be noted that the showcased PostGIS functions have numerous applications to other, business-centric projects:
- Loading and exploring geospatial datasets
- Insights on time-of-day activity
- Insights on avoidance behavior
- Insights on behavior related to pre-determined areas (zones)


## 4. Acknowledgements
We would like to thank Mark MacAllister et al. for their efforts in acquiring this interesting data and for sharing it with the public under the CC0 license. And for the Max Planck Institute, as well as affiliate groups, for maintaining Movebank.

