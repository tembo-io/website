---
sidebar_position: 2
tags:
  - Postgres Basics
---

import AddElement from './images/add-element-to-array.png'
import RemoveElement from './images/remove-element-from-array.png'
import ArrayLength from './images/array-length.png'
import ArrayCat from './images/array-cat.png'
import ArrayDims from './images/array-dims.png'
import SelectElement from './images/select-element-from-array.png'
import WhereClause from './images/where-clause-in-array.png'

# How to use PostgreSQL arrays

PostgreSQL is known for its flexibility in terms of data types. One useful, though sometimes confusing type are arrays. They enable the storage of multiple values of the same data type within a single column.

One ideal use case for array data types is the storage of vectors. Perhaps you need to store geographic data, or vector embeddings for similarity searches in your database (check out our [blog post](https://tembo.io/blog/pgvector-and-embedding-solutions-with-postgres) on vector embeddings).

Let’s see how you can create and use an array-typed column:

**Step 1** - Creating a table with an array column. For the array column, you can use the square brackets '[]' immediately after specifying the data type for the array, just like this:

```
CREATE TABLE students(
    id integer PRIMARY KEY,
    name VARCHAR(30),
    age integer,
    home_coordinates REAL[]
);
```

In this example, the `home_coordinates` array does not have any fixed length and you can insert as many values in it as you want. You can also set limits for the array by specifying its maximum length in between the square brackets:

```
CREATE TABLE students(
    id integer PRIMARY KEY,
    name VARCHAR(30),
    age integer,
    home_coordinates REAL[2]
);
```

In this example, the `home_coordinates` column will store an array of maximum length 2, as this is the number of dimensions needed to represent points in geographic systems.

**Step 2** - Now, you insert the array values in the column. Postgres has two different methods to insert array values:

### Using `ARRAY` constructor

Postgres comes with an `ARRAY` constructor that can be initialized in the SQL query to insert the array values into the table:

```
INSERT INTO students (id, name, age, home_coordinates) VALUES (1, 'John', 15, ARRAY[40.7, 74.0]);
```

Learn more about `ARRAY` constructor on their [official website](https://www.postgresql.org/docs/current/sql-expressions.html#SQL-SYNTAX-ARRAY-CONSTRUCTORS).

### Directly inserting values

You can also use braces to represent an array:

```
INSERT INTO students (id, name, age, subjects) VALUES (1, 'John', 15, {40.7, 74.0});
```

**Step 3** - You can query the data from the array column and display it. Postgres also comes with a way to fetch specific data from the whole array and showcase it.

Specify the element number along with the column name that you want to fetch. Following command will display the first element of `home_coordinates` array: 
```
SELECT home_coordinates[1] FROM students;  -– display the 1st element
```

<img src={SelectElement} width="600" alt="SelectElement" />

You can also specify a `WHERE` clause condition in the query. Following command will display the whole row where the latitude or longitude of a home is above 40 degrees:

```
SELECT * FROM students WHERE 40 < ANY (home_coordinates); 
```

<img src={WhereClause} width="600" alt="WhereClause" />

**Step 4** - There are also methods to manipulate or update the data in the array. You can use the traditional `UPDATE` method to update the data:

`UPDATE` method can be used to remove element(s) from the array. To remove the value `74.0` from the array, execute the following command: 

```
 UPDATE students SET home_coordinates = array_remove(home_coordinates, 74.0);
```

<img src={RemoveElement} width="700" alt="RemoveElement" />

It can then be used to append data to the array. To add the value `80.0` at the end of `home_coordinates` array, execute the following command:

```
UPDATE students SET home_coordinates = home_coordinates || ARRAY[80.0];
```

<img src={AddElement} width="700" alt="AddElement" />

## Array Functions in Postgres

PostgreSQL offers a range of utilities to manage arrays. Some of these popular array functions are `array_cat`, `array_dims`, `array_length`, etc.

`array_cat` function concatenates or merges multiple arrays and returns the merged array:

```
SELECT array_cat(array[1, 2], array[3, 4]);
```

<img src={ArrayCat} width="600" alt="ArrayCat" />

`array_dims` function returns the dimensions of an array:

```
SELECT array_dims(array[[1, 2, 3], [4, 5, 6]]);
```

<img src={ArrayDims} width="600" alt="ArrayDims" />

`array_length` function returns the length of an array:

```
 SELECT array_length(home_coordinates, 1) AS total_coordinates FROM students;
```

In this example, `1` represents the dimension of the array whose length you want to calculate.

<img src={ArrayLength} width="700" alt="ArrayLength" />

There are tons of built-in array functions available in Postgres. You can check the official [PostgreSQL documentation](https://www.postgresql.org/docs/current/functions-array.html) for a comprehensive list of array functions and operators.

To enhance query performance, especially when working with sizable arrays, it is possible to establish indexes on array columns in PostgreSQL. **Gist** (Generalized Search Tree) or **GIN** (Generalized Inverted Index) methods can be used to specify indexes on array columns.

Check out the official documentation of [Gist](https://www.postgresql.org/docs/9.5/gist.html) and [GIN](https://www.postgresql.org/docs/current/gin-intro.html#:~:text=GIN%20stands%20for%20Generalized%20Inverted,appear%20within%20the%20composite%20items.) to learn more about them.

## Conclusion

This guide covers working with arrays in PostgreSQL, including insertion, manipulation, and deletion. We have also discussed some widely used built-in array functions in Postgres.

Struggling to connect your project with Postgres database? Take a look at our organized [guides](https://tembo.io/docs/category/postgres-guides) for a detailed, step-by-step approach to connecting with a PostgreSQL database.
