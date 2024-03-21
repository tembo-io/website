---
title: How to Create and Use Materialized Views
---

Imagine yourself as the administrator of a users' database for an e-commerce website. Within this database, there is a table known as "orders" which stores the details of every order that has been made. Now suppose that you want to continuously have a view with the number of orders made by each customer.

If you create a normal Postgres view, you will be running a large table scan and aggregation every time you view this data, which is a bit inefficient. Instead, you can use **materialized views**.

Materialized views are very similar to normal Postgres views, with the key difference that their results can be stored in disk as they are computed. By physically storing the data, they avoid the need to recompute the results each time a query runs.

(To learn more about normal views in Postgres, take a look at our [guide](https://tembo.io/docs/postgres_guides/how-to-create-views-in-postgres/).)

Let’s walk through the steps to create a materialized view:

**Step 1** - Open your terminal and connect it to your desired Postgres database. Check out our comprehensive [guide](https://tembo.io/docs/postgres_guides/how-to-connect-to-postgres/) to establish a connection from your terminal to Postgres database.

**Step 2** - Create a materialized view using the `CREATE MATERIALIZED VIEW` statement. It should look something like this:

```
CREATE MATERIALIZED VIEW customer_order_totals AS
SELECT customer_id, SUM(order_amount) AS total_amount
FROM orders
GROUP BY customer_id;
```

In this example:

-   `customer_order_totals` is the name of the view
-   `customer_id` and `order_amount` are the columns whose data we want to store in the created materialized view
-   `orders` is the name of the table
-   `customer_id` is the condition to filter out the data

**Step 3** - After successfully creating the materialized view, the next step is to populate/fill it with the data. There are 2 ways in Postgres to populate the materialized view:

**Manually**

`REFRESH MATERIALIZED VIEW` statement allows you to populate and refresh the materialized view. Run the following command to refresh the materialized view:

```
REFRESH MATERIALIZED VIEW my_materialized_view;
```

Replace the `my_materialized_view` with your own materialized view’s name. This same command can also be executed to refresh the materialized view whenever there is a change in the query.

**Automatically**

You can set up a trigger which will refresh the materialized view at a regular interval of time, which keeps you from having to refresh the materialized view manually.

**Step 4** - Now you can query the populated materialized view to display it. You can query the materialized view just like a regular table on Postgres:

```
SELECT * FROM my_materialized_view;
```

Materialized views can save lots of time on query execution. They are ideal for queries that need to run multiple times and be consumed by different users, like dashboards and large aggregations.

Want a deeper dive? Check out the [official documentation on Materialized Views](https://www.postgresql.org/docs/current/rules-materializedviews.html).

## Conclusion

Within this guide, we delved into the topic of materialized views and explored their practical usage. Remember that you can use them to reuse the results from queries that might be needed many times in the future.

Still have questions about PostgreSQL? We're here to help - have a look at our [guides](https://tembo.io/docs/category/postgres-guides) for more.
