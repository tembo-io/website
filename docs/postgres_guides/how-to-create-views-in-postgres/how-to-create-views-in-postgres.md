---
sidebar_position: 2
tags:
  - Postgres Basics
---

# How to Create Views in PostgreSQL

In PostgreSQL, views are virtual representations of data that show the outcomes of a `SELECT` query. They are like a virtual table. Views can help to reduce the complexity of queries, and improve the query reusability. They are also useful to present a limited view of data to users with fewer access privileges.

Imagine you're responsible for managing user data for your product, including their ID, name, and age. You have been asked to produce a report with a list of users older than 18; however the consumers of that view may not be allowed to see PII, like user names. You can create a view to provide them that limited access.

**Step 1** - Open your terminal and connect it to your desired Postgres database. Check out our [guide](https://tembo.io/docs/postgres_guides/how-to-connect-to-postgres/) to follow the step-by-step procedure.

**Step 2** - Create the SQL query that you want to turn into a view. Any `SELECT` query can be turned into a view. For example:

```
SELECT id, age
FROM users
WHERE age >= 18;
```

**Step 3** - If you are satisfied, you can create a view using the `CREATE VIEW` command. Assign a name to the view and add your desired query to the view:

```
CREATE VIEW adult_users AS
SELECT id, age
FROM users
WHERE age >= 18;
```

**Step 4** - Now you can query that view the same way you would query any table. For example:

```
SELECT age, COUNT(*) FROM adult_users GROUP BY age;
```

Note that views do not store any data by themselves. They are only a query over one or more tables in a database.

Postgres comes with the `ALTER VIEW` command which can be used to modify or edit the created view. `ALTER VIEW` can also be used to recreate the view with a whole new SQL query:

```
ALTER VIEW adult_users AS
SELECT id, age
FROM users
WHERE age >= 20;
```

And to drop (delete) the view, there’s a `DROP VIEW` command in Postgres:

```
DROP VIEW adult_users;
```

Check out the [official documentation](https://www.postgresql.org/docs/current/tutorial-views.html) to explore more about Postgres Views.

## Conclusion

In this guide, we've explored Postgres views and understood the step-by-step process to create Views in Postgres.

Interested in expanding your knowledge of Postgres? Review our other [guides](https://tembo.io/docs/category/postgres-guides).

Also, take a look at our latest extensions, [pgmq](https://tembo.io/blog/introducing-pgmq) and [pg_later](https://tembo.io/blog/introducing-pg-later), designed to assist you in handling messaging and long-running query tasks.
