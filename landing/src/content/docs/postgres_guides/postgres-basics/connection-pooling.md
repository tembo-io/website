---
sidebar_position: 2
tags:
  - Postgres Basics
---

# Connection Pooling in Postgres

## The Problem: Many Database Requests from Your Application

Suppose you are managing an e-commerce website that has many users. These users are ordering products, browsing, making online payments, adding products to their cart, and more.

When an application creates a new connection to Postgres, the Postgres database creates a new process for that connection. When there are many open connections, the large number of new processes can slow down your database. The solution to this problem is Connection Pooling.

## The Solution: Connection Pooling

Connection pooling is a method to effectively share database connections. It reduces the load of establishing and breaking down connections for database operations, and improves database performance.

**PgBouncer** is a lightweight connection pool for PostgreSQL. Its purpose is to effectively establish database connections, simultaneously improving the performance of applications built on PostgreSQL. PgBouncer acts as a Postgres server, so simply point your client to the PgBouncer port.

Any application can connect to PgBouncer as a PostgreSQL server - PgBouncer will then manage connections from itself to the Postgres database.

Check out the [official documentation](https://www.pgbouncer.org/) to learn more about PgBouncer.

Next we'll look at a step-by-step process of enabling connection pooling in Postgres using PgBouncer.

## Install

Firstly, install PgBouncer on a server or machine that can be reached by both your application servers and your PostgreSQL database server. There are two ways to install pgBouncer:

### Package Manager

If your server is running on a Linux-based system, you can take advantage of your system's package manager. To install the PgBouncer in Ubuntu, you can run the following command in your terminal:

``` sh
sudo apt-get install pgbouncer
```

### Build from Source

PgBouncer can also be built from its source code. Simply download the source code from its repository, compile it and install it in your system.

## Configure 

Configure PgBouncer with the `pgbouncer.ini` file that resides in the installation directory. You can also pass the file as a parameter when starting it.

Here an example configuration for PgBouncer:

``` ini
[databases]
mydb = host=your_postgresql_host port=5432 dbname=your_database_name

[pgbouncer]
listen_addr = *
listen_port = 6432
auth_type = trust
auth_file = /etc/pgbouncer/userlist.txt
admin_users = postgres
```

Specify the connection credentials for your PostgreSQL database under the `[databases]` section. Make the necessary configurations of the PgBouncer’s settings including authentication method, listening port and address, and admin users under the `[pgbouncer]` section.

## Setup User Access

Create a list of users that are allowed to connect to the database through PgBouncer and name that file as `userlist.txt`. In the `userlist.txt`, list down the PostgreSQL usernames of all those users along with their corresponding passwords.

```
"your_username" "your_password"
```

Of course, make sure to keep this file safe, as it contains passwords to your database!

## Update your Application

Now, instead of connecting directly to Postgres, your application connects to PgBouncer. Update the settings and launch your application.

Here is an example of an updated connection string for your application configuration:

```
host=pgbouncer_host port=6432 dbname=my_database_name user=your_database_user
```

## Test

Finally, test your application to verify the connection is successfully established to Postgres via PgBouncer. Also, monitor PgBouncer to make sure it is properly managing the connections.

## Conclusion

Within this guide, we learned how to set up connection pooling in PostgreSQL. PgBouncer is not the only application that helps implement this. You can also look at [PgPool-II](https://www.pgpool.net/mediawiki/index.php/Main_Page).

Have other questions? Check out our collection of [guides](https://tembo.io/docs/category/postgres-guides) designed to further enhance your knowledge of Postgres.