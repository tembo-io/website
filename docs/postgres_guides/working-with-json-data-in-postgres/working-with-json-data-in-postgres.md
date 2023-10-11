---
sidebar_position: 2
tags:
  - Postgres Basics
---

import DisplayingData from './images/displaying-data.png'
import Operator1 from './images/operator-1.png'
import Operator2 from './images/operator-2.png'
import WhereClause from './images/where-clause.png'
import JsonEach from './images/json_each.png'
import Update from './images/update.png'
import Nested from './images/nested.png'

# Working with JSON Data in Postgres

JSON (JavaScript Object Notation) is a compact format designed for the storage and sharing of data. Postgres allows the users to use JSON as a data type to store and fetch data.

The JSON data type gives Postgres capabilities that resemble document databases like MongoDB or Firestore. It grants great flexibility on the kinds of data that a document can hold, as the schema (i.e. the shape) of the data does not have to be known beforehand.

In this guide, we will study how you can store JSON data in Postgres database and perform multiple operations on it. Let’s get started

## `Create Table` with JSON data type statements

JSON works like a regular data type, just like other data types in Postgres. So, to add a json data type column in a table, you can simply assign `JSON` data type to that column.

```
CREATE TABLE table_name (
    id serial PRIMARY KEY,
    data JSON
);
```

:::note
Make sure to connect your desired Postgres database before executing these commands. Check out our guide to follow the step-by-step process, [click here](https://tembo.io/docs/postgres_guides/how-to-connect-to-postgres/)
:::

## `Insert` JSON data statements

Since JSON data type is actually an object data type consisting of key-value pairs. So, to insert JSON data in the table, we have to pass the data in the object format.

```
INSERT INTO table_name (data)
VALUES ('{"key1": "value1", "key2": value2}');
```

you can also insert multiple JSON values at once

```
INSERT INTO table_name (data)
VALUES  ('{"key1": "value1", "key2": value2}'),
	    ('{"key3": "value3", "key4": value4}'),
        ('{"key5": "value5", "key6": value6}');
```

## Displaying JSON data statements

You can simply get the JSON data type column and display it

<img src={DisplayingData} width="600" alt="DisplayingData" />

Postgres comes with 2 built-in operators to operate over JSON objects: `->` and `->>`

- `->` operator returns the JSON value as key data type. In other words, it returns the elements as JSON data type.
- `->>` operator returns the JSON value as string (text) data type

```
select info -> 'name' as names from students;
```

<img src={Operator1} width="600" alt="Operator1" />

```
select info ->> 'name' as names from students;
```

<img src={Operator2} width="600" alt="Operator2" />

You can also use the ‘WHERE’ clause to filter out the data

```
SELECT * FROM students WHERE info->>'age' < '15';
```

<img src={WhereClause} width="600" alt="WhereClause" />

PostgreSQL also comes with multiple built-in json functions that you can use to manipulate data.

One of them is `json_each` which allows you to unravel the top-level JSON object into a collection of key-value pairs.

```
 select json_each(info) FROM students;
```

<img src={JsonEach} width="500" alt="JsonEach" />

The `jsonb_set` function helps to update the value in the table following a specified condition.

```
UPDATE "students" SET "info"=jsonb_set("info"::jsonb, '{age}', '16') WHERE "info"::json->>'name'='John';
```

<img src={Update} width="900" alt="Update" />

There are many other json functions that you can use to manipulate data in the desired manner. To know about more json function, [check their official documentation](https://www.postgresql.org/docs/9.5/functions-json.html)

## Delete JSON data

You can use the `DELETE` statement to delete any specific row

```
DELETE FROM students WHERE info->>'name' = 'John';
```

## Working with Nested JSON

If a key in JSON data has an object as it’s value, we can use the combination of both `->` and `->>` operators to target that data.

```
 SELECT info->'age'->>'years' nested_age FROM students;
```

<img src={Nested} width="600" alt="Nested" />

## Conclusion

In this guide, we studied how you can work with JSON data in the Postgres database from inserting in a table to manipulating data to deleting data.

If you are struggling to connect to Postgres on your project, we recommend you to check our well-written [Postgres guides](https://tembo.io/docs/category/postgres-guides) to solve your problem.
