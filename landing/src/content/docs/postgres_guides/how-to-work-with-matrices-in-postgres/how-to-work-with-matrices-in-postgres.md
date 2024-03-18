---
title: How to work with matrices in Postgres
---

import AccessMatrix from './images/access-matrix-element.png'
import ArrayFunctions from './images/array-functions-on-matrices.png'
import CreateMatrices from './images/create-matrices.png'

Working with matrices in PostgreSQL opens a world of possibilities for managing structured data. Whether you're dealing with scientific data, financial models, or any other multidimensional datasets, PostgreSQL provides powerful tools and techniques to store, manipulate, and query matrices efficiently.

Matrices consist of arrays organized in a two-dimensional plane to store data in rows and columns. As a result, they operate much like arrays do within PostgreSQL. (Check our [guide](https://tembo.io/docs/postgres_guides/how-to-use-postgresql-arrays/) to learn more about using arrays in Postgres.)

This guide will walk you through the essentials of working with matrices in PostgreSQL.

## Creating a matrix in Postgres

As we mentioned, matrix is just a 2-D array, therefore you can use the `ARRAY` constructor to create a matrix in Postgres. Here’s an example of 2x2 matrix:

```sql
SELECT ARRAY[ARRAY[1, 2], ARRAY[3, 4]] AS matrix1;
```

<img src={CreateMatrices} width="600" alt="CreateMatrices" />

In this example, we have used 2 `ARRAY` constructors (`ARRAY[1,2]`, `ARRAY[3,4]`) inside of an `ARRAY` constructor. `matrix1` is the name of the column holding this matrix.

## Matrix Storage in Tables

In Postgres it’s possible to use "matrix" as a data type for a column in a table. You can create a column in the table and store matrix format data in it, like this:

```sql
CREATE TABLE matrix_table (
    id serial PRIMARY KEY,
    data INT[][]
);
```

In this example, the `data` column is of type integer matrix, but you can use any data type as the element type when defining matrices.

Once your matrix is created, you can follow the traditional method to insert values into it:

```sql
INSERT INTO matrix_table (data)
VALUES (ARRAY[ARRAY[1, 2, 3], ARRAY[4, 5, 6]]);
```

## Accessing elements

You can also specify each element present in the matrix individually by specifying the row and column indices for that element. For example:

```sql
SELECT data[2][1] FROM matrix_table;
```

<img src={AccessMatrix} width="600" alt="AccessMatrix" />

In this example, we have specified the row index `2` and column index `1`.

## Operations on Matrices

Postgres does not come with built-in functions to perform operations on matrices, so defining matrix operations can be quite verbose. In general, to operate efficiently on matrices, we recommend creating custom SQL and PL/SQL functions.

Here’s an example of a function to add two matrices of size 2 by 2:

```sql
CREATE FUNCTION add_matrices(matrix1 INT[], matrix2 INT[])
RETURNS INT[] AS $$
DECLARE
    result INT[];
BEGIN
    result := ARRAY[ARRAY[matrix1[1][1] + matrix2[1][1], matrix1[1][2] + matrix2[1][2]],
                    ARRAY[matrix1[2][1] + matrix2[2][1], matrix1[2][2] + matrix2[2][2]]];
    RETURN result;
END;
$$ LANGUAGE plpgsql;
```

## Matrix manipulation

PostgreSQL includes some array functions that can be used to manipulate matrices. For example, you can use the `ARRAY_AGG` function to transpose a matrix:

```sql
SELECT ARRAY_AGG(value ORDER BY rownum, colnum) AS transposed_matrix
FROM my_matrix;
```

<img src={ArrayFunctions} width="600" alt="ArrayFunctions" />

Here, `ARRAY_AGG` is an array function that we have applied on a matrix to perform the operation. However it's important to know that not every array function will work on matrices. To see a comprehensive list of array functions and operators, see the official [PostgreSQL documentation](https://www.postgresql.org/docs/current/functions-array.html).

## Conclusion

In this guide, we explored the matrices and how you can work with them in Postgres.

Struggling to connect Postgres to your project? We're here to help. Have a look at our guides [guides](https://tembo.io/docs/category/postgres-guides) for more ideas and assistance in working with Postgres.
