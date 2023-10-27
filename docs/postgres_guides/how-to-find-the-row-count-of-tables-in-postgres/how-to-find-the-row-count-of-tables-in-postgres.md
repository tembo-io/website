---
sidebar_position: 2
tags:
  - Postgres Basics
---

# How to find the row count of tables in Postgres

Imagine you are the manager of an e-commerce website, and you want to analyze the sales performance of your products. Within your PostgreSQL database, there exists a table that stores records of every order placed. To assess the monthly performance comprehensively, it becomes necessary to obtain the total count of orders made in a specific month.

In such scenarios, you can look for the row count in the table to get the total number of orders placed. Postgres comes with three different methods to get the row count of a table: Using `COUNT` function, the `table_schema`, and the `pg_stat_user_tables`.

Let’s walkthrough each of these methods in brief along with examples:

## Using `COUNT` function

The SQL language has a built-in `COUNT` function that can be used to get the row count of tables. Here’s an example of `COUNT` function to find the number of rows in a table:

```sql
SELECT COUNT(*) FROM your_table_name;
```

Use your own table name in-place of `your_table_name`.

Make sure that you are connected to your Postgres server via terminal before executing this command. Take a look at our comprehensive [guide](https://tembo.io/docs/postgres_guides/how-to-connect-to-postgres/) for instructions to proceed through each step.

`COUNT` function can also be used to get the row count of multiple tables at once. You can create a series of `COUNT` function queries to get the row count of all tables you are interested in. Here’s an example of it:

```sql
SELECT 'table1' AS table_name1, COUNT(*) AS row_count FROM table1
UNION ALL
SELECT 'table2' AS table_name2, COUNT(*) AS row_count FROM table2
UNION ALL
SELECT 'table3' AS table_name3, COUNT(*) AS row_count FROM table2
UNION ALL
-- Add more tables per your requirements
SELECT 'tableN' AS table_nameN, COUNT(*) AS row_count FROM tableN;
```

Just replace the `table_name1`, `table_name2`, `table_name3` and so on with the tables you are interested in.

This method provides the most accurate row count because it performs a full table scan, counting each row. For that reason, it can be slow, especially in large tables. You should consider the tradeoff between precision of your results and overhead on your database.

## Using `table_schema`

The _schema_ property present in every table can also be used to get the row count of each table. There is a SQL query created using the `pg_stat_user_tables` and `table_schema` to get the row count of tables.

Execute the following SQL query to get the row count:

```sql
SELECT table_name, (SELECT n_live_tup FROM pg_stat_user_tables WHERE relname = table_name) AS row_count
FROM information_schema.tables
WHERE table_schema = 'public';
```

This query will return the row count of all the tables in the `public` schema.

In this query, `n_live_tup` represents the live (non-deleted) rows present in a table. `n_live_tup` is basically a column of `pg_stat_user_tables` that gives us the count of rows that are currently stored in a table.

## Using `pg_stat_user_tables`

You can also use the `pg_stat_user_tables` alone, without even mentioning the table_schema, to get the row count of tables.

To obtain the row count, run the following SQL query:

```sql
SELECT relname, n_live_tup
FROM pg_stat_user_tables;
```

In this query, `relname` represents the name of each table present in the Postgres database. So, this query fetches the names of user tables (relations) along with the counts of active rows from the `pg_stat_user_tables` view.

This method queries statistics tables that are continuously computed by Postgres as it runs. This means that it takes a very small amount of time to perform a query, but the results are approximate.

`pg_stat_user_tables` comes with a lot of statistical information about tables in the database. Check out the [official documentation](https://www.postgresql.org/docs/current/monitoring-stats.html) of Postgres to learn more about it.

## Conclusion

In this guide, we explored some different methods to get the row count of tables in Postgres database.

Interested to learn more about Postgres utilities? Check out our collection of well-written [blogs](https://tembo.io/blog) and expand your knowledge regarding Postgres.
