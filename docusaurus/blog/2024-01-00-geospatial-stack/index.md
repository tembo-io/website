---
slug: geospatial-on-postgres
title: 'Geospatial Workloads on Postgres: An Elephant of a Story'
authors: [Evan, ]
tags: [postgres, geospatial, stacks, database]
---



![extensions](./extensions.png 'extensions')

## 1. The Data


![map_data_points](./map_data_points.png 'map_data_points')

## 2. PostGIS

### `ST_Distance`

ST_Distance can be used to find the minimum distance between two points. This approach can be extended in a recursive manner to many points.

- Elephant: Hour of the day with the highest average distance traveled (meters) per year?

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

