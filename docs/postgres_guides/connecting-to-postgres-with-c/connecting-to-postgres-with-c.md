---
sidebar_position: 2
tags:
  - Postgres Basics
---

# Connecting to Postgres with C#

In this tutorial, we have provided a thorough, step-by-step guide for creating a connection to a PostgreSQL database using C#. We will utilize the Npgsql package for establishing a connection to the Postgres database.

Let’s gets started

**Step 1** - Install the Npsql library in your project. You can install it via .NET command line-interface by running this command in the terminal

```
dotnet add package Npgsql
```

:::info
Npgsql is an open source ADO.NET Data Provider for PostgreSQL, it allows C# programs to connect to the PostgreSQL database server. To learn more about Npgsql, [take a look at its official documentation](https://www.npgsql.org/index.html).
:::

**Step 2** - Create a connection string that includes all the necessary credentials required to setup a connection with Postgres database.

This connection string includes credentials - port number, server address, database name, username, and password.

```
string connectionString = "Host=my_host;
Port=port_number;
Database=database_name;
User Id=username;
Password=password;";
```

Do replace the `my_host`, `port_number`, `database_name`, `username`, and `password` parameters with the respective credentials of your database.

**Step 3** - Initialize the _NpgsqlConnection_ class in your project to setup a connection to the Postgres database. You will also need to use the connection string you have created.

```
using NpgsqlConnection connection = new NpgsqlConnection(connectionString);
connection.Open();
```

You can also use the `using` block as a wrapper to make sure that the connection is properly closed when the program exits the `using` block.

**Step 4** - Execute the desired SQL query using the NpgsqlCommand class.

```
using NpgsqlCommand cmd = new NpgsqlCommand(“SELECT * FROM customers", connection);

using NpgsqlDataReader reader = cmd.ExecuteReader();

while (reader.Read())
{
// Use the fetched results
}
```

You can execute any of your desired query

Here’s the complete code to connect to a Postgres database with C#:

```
using Npgsql;
using System;

class Program
{
    static void Main()
    {
        string connectionString = "Host=my_host;Port=port_number;Database=database_name;User Id=username;Password=password;";

        using NpgsqlConnection connection = new NpgsqlConnection(connectionString);
        connection.Open();

        using NpgsqlCommand cmd = new NpgsqlCommand(“SELECT * FROM customers”, connection);

        using NpgsqlDataReader reader = cmd.ExecuteReader();

        while (reader.Read())
        {
            Console.WriteLine(reader["column_name"]);
            // Use the fetched results
        }
    }
}

```

In this example, we have demonstrated how you can read the data, but you can also perform other operations - DML statements like Insert, Update, and DDL statements like Create Table.

**Insert**

```
using NpgsqlCommand cmd = new NpgsqlCommand("INSERT INTO table_name (column1, column2) VALUES (value1, value2)", connection);
        cmd.Parameters.AddWithValue("value1", "xyz");
        cmd.Parameters.AddWithValue("value2", 123);

        int rowsAffected = cmd.ExecuteNonQuery();
```

**Update**

```
 using NpgsqlCommand cmd = new NpgsqlCommand("UPDATE table_name SET column1 = new_value WHERE column2 = condition", connection);
        cmd.Parameters.AddWithValue("new_value", "new_data");
        cmd.Parameters.AddWithValue("condition", "some_condition");

        int rowsAffected = cmd.ExecuteNonQuery();
```

**Create Table**

```
 using NpgsqlCommand cmd = new NpgsqlCommand("CREATE TABLE table_name (column1 data_type, column2 data_type, column3 data_typet)", connection);

        cmd.ExecuteNonQuery();

```

You can simply copy and paste this code snippet to integrate in your project. Just make sure to replace the variables with the database credentials.

## Conclusion

In this guide, we discussed the step-by-step process to connect to the Postgres database with C#.

If you are working on a Python project, you can check out other guide to know how you can connect a Postgres database with Python.

Also, check out our new extensions [pgmq](https://tembo.io/blog/introducing-pgmq) and [pg_later](https://tembo.io/blog/introducing-pg-later).
