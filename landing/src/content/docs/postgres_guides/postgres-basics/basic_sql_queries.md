---
sidebar_position: 3
tags:
  - Postgres Basics
---

# Basic PostgreSQL Queries

In this guide, you'll learn the fundamentals of writing SQL queries in PostgreSQL. SQL (Structured Query Language) is used to communicate with databases and retrieve, manipulate, and manage data. PostgreSQL, an open-source relational database management system, supports a wide range of SQL commands.

## Prerequisites

- Tembo PostgreSQL stack running.
- Database Administration tool of your choice (such as DBeaver, pgAdmin, etc.) connected to Tembo Cloud PostgreSQL cluster.

## Retrieving Data

The **'SELECT'** statement is used to retrieve data from a table.

```sql
SELECT column1, column2
FROM table_name
```

## Filtering Data

You can use the **'WHERE'** clause to filter data based on specific conditions.

```sql
SELECT first_name, last_name
FROM employees
WHERE department = 'HR';
```

Another example:

```sql
SELECT *
FROM orders
WHERE order_date >= '2023-01-01';
```

## Sorting Data

Use the **'ORDER BY'** clause to sort the result.

```sql
SELECT product_name, unit_price
FROM products
ORDER BY unit_price DESC;
```

## Aggregating Data

Aggregate functions perform calculations on data values.

```sql
SELECT COUNT(*) AS total_orders
FROM orders;
```

## Joining Tables

Use **'JOIN'** to combine data from multiple tables.

```sql
SELECT customers.customer_id, customers.first_name, orders.order_date
FROM customers
JOIN orders ON customers.customer_id = orders.customer_id;
```

## Grouping Data

The **'GROUP BY'** clause groups rows that have the same values.

```sql
SELECT customers.customer_id, customers.first_name, orders.order_date
FROM customers
JOIN orders ON customers.customer_id = orders.customer_id;
```

## Updating Data

The **'UPDATE'** statement modifies the existing records in a table

```sql
UPDATE products
SET stock_quantity = stock_quantity - 10
WHERE product_id = 123;
```

## Deleting Data

The **'DELETE'** statement removes rows from a table.

```sql
DELETE FROM customers
WHERE customer_id = 456;
```

## Conclusion

This guide introduced you to basic SQL queries in PostgreSQL. You've learned how to retrieve, filter, sort, aggregate, and manipulate data using SQL commands. As you delve deeper, you'll discover more advanced features and optimizations PostgreSQL has to offer.

Remember to practice writing SQL queries on your own database to reinforce your learning.
