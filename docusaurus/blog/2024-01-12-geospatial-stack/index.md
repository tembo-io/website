---
slug: geospatial-on-postgres
title: 'Geospatial Workloads on Postgres: An Elephant of a Story'
authors: [evan]
tags: [postgres, geospatial, stacks, database]
---

In today's world, geographic data stands out for its ability to apply spatial context to collections of points, transforming them into valuable insights.
When properly analyzed, these datasets can reveal exciting patterns that explore not only the dichotomy of nature and human activity, but the balance between them as well.
Even as a quick illustration, geospatial can help facilitate predictive modeling and spatial analytics, aiding in everything from disaster response planning to optimizing delivery routes in logistics.

Performing operations on, and gathering insights from geospatial datasets can be complex, but very rewarding.
To address this, we recently launched the Geospatial Stack to make it easier for you to get started with exploring your geospatial datasets.

Working with geospatial workloads is not new to Postgres.
In fact, it’s most popular geospatial extension, and certainly one of the most popular in general, [PostGIS, has been around since 2001](https://postgis.net/workshops/postgis-intro/introduction.html#a-brief-history-of-postgis).
The Geospatial Stack comes pre-packaged with PostGIS and related extensions, and as always only a few clicks away from any extension hosted in [Trunk](https://pgt.dev).
These extensions add incredible capabilities, and when using them together in Postgres, you don’t need any other database!

![extensions](./extensions.png 'extensions')
Figure 1. Snapshot of Tembo's Geospatial Stack extension overview.

## 1. How to load elephant tracking data (and geospatial in general) into Postgres

Since we're talking about Postgres, we thought an interesting example to explore would be an elephant's journey through the forests of Cote d'Ivoire.

The following dataset was gathered by Dr. Mike Loomis and his team and published to the Movebank online database of animal tracking data under the CC0 License.
- Location: Africa, Côte d'Ivoire, Forest Preserve near the village of Dassioko
- Timeframe: 2018 - 2021
- Sample size: 1

To begin, you can [download the dataset here](https://www.movebank.org/cms/webapp?gwt_fragment=page%3Dstudies%2Cpath%3Dstudy2742086566).

Please be mindful that this dataset's license places it within the public domain, but other datasets hosted on Movebank might have a differnt license.

Once you've navigated to the local directory containing the dataset, fill in the appropriate information and run the following command:

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

Once the data was loaded, we could run queries like the following:

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

## 2. PostGIS and its power to gather insights from your data

Already we see some interesting fields corresponding to coordinates and timestamps. 

With relative ease, we can leverage PostGIS to apply functions to further analyze the data.

Some of the queries can be a bit lengthly, so in lieu of brevity we’ve listed key functions, paired with a study-related question it can help answer.

### `ST_Distance`

ST_Distance can be used to find the minimum distance between two points. This approach can be extended in a recursive manner to many points.

- Which hour of the day (24hr format) had the highest average distance traveled (meters) per year?

| year | hour |       avg_distance        |
|------|------|---------------------------|
| 2018 |  20  | 500.1667879009256         |
| 2019 |  22  | 500.23505130464025        |
| 2020 |  20  | 490.65593160356303        |
| 2021 |  22  | 474.28919337170834        |

### `ST_Contains`

ST_Contains checks whether a given geometry "A" contains another geometry "B".

- Throughout the study, how many times did the elephant enter Dassioko Village?

```
SELECT
COUNT(e.*)
FROM
elephant5990 e,
village v
WHERE
ST_Contains(v.wkb_geometry, e.wkb_geometry);

-[ RECORD 1 ]
count | 47
```

### `ST_ConcaveHull`, `ST_InteriorRingN`

ST_ConcaveHull can be used to establish a boundary around a set of points, while also allowing for gaps (known as holes). ST_InteriorRingN can then be used to identify these holes.

- On visual inspection, there appears to be an area of avoidance in the top left region of the dataset. Can this be identified with a query?


## 3. Visualizing this Data with QGIS

In addition to running these SQL queries, we could easily overlay this data over maps using QGIS to emit visualizations.

By leveraging QGIS' OpenStreetMap feature, we can offer real world context to an otherwise meaningless distribution of points (Figure 2).
This not only helps draw territorial boundaries, but spotlights areas of cluser vs dispersion for further analysis.

![map_data_points](./map_data_points.png 'map_data_points')
Figure 2. QGIS-renedered OpenStreetMap visualization containing elephant tracking data.

The OpenStreetMap layer readily shows the defined border of Dassioko Village (Figure 2).
Using QGIS, we can create a custom geometry to both visualize, as well as analyze in Postgres.
This layer helps us answer questions related to the elephant's behavior in relation to the village (Figure 3).

![map_area_village](./map_area_village.png 'map_area_village')
Figure 3. QGIS-rendered OpenStreetMap visualization containing elephant tracking data and an overlay geometry representing Dassioko Village. This is made possible using the PostGIS function, ST_Contains.

Finally, we can implement a reverse workflow, whereby we quantify in Postgres and use the results to generate a QGIS overlay.
In this case, showcasing a potential area of avoidance (Figure 4). 


![map_area_avoidance](./map_area_avoidance.png 'map_area_avoidance')
Figure 4. QGIS-rendered OpenStreetMap visualization containing elephant tracking data and an overlay geometry representing a generated potential area of avoidance. This is made possible using PostGIS functions, ST_ConcaveHull and ST_InteriorRingN.


## 4. Summary and applications to other projects

Using Tembo’s Geospatial Stack, we were able to explore a GPS tracking dataset. Though this demonstration focused on the movements of a single elephant, it should be noted that the showcased PostGIS functions have numerous applications to other, business-centric projects:
- Loading and exploring geospatial datasets
- Insights on time-of-day activity
- Insights on avoidance behavior
- Insights on behavior related to pre-determined areas (zones)

Interested in a more comprehensive guide? Checkout our [Geospatial Stack getting started guide](https://tembo.io/docs/tembo-stacks/geospatial).

## 5. Acknowledgements
We would like to thank Dr. Mike Loomis and Team for their efforts in acquiring this interesting data and for sharing it with the public under the CC0 license. And for the Max Planck Institute, as well as affiliate groups, for maintaining Movebank.

