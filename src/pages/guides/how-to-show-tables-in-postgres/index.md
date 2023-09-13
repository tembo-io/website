---
slug: how-to-show-tables-in-postgres
title: "How to show tables in Postgres"
authors: [ayush]
tags: [postgres, tembo]
---

# How to show tables in Postgres

Tables are an extremely crucial part of Postgres. All the data stored in Postgres is in the form of a table.

So, it becomes necessary to view those tables and then use them in the desired way.

There are different ways to views the list of all tables. In this guide, we will see 3 different ways to view the tables - Using psql command, using SQL query, and Using PgAdmin tool. We will understand the whole step-by-step process with the help of an example

Let’s get started

## Using psql command

**Step 1** - Open the terminal on your device. If you are on Windows, open Command Prompt and for Mac, open terminal

![1](1.png "VisibilityTimeout")

**Step 2** - Connect the terminal to your desired Postgres database. Follow our guide to see the whole process, click here

![2](2.png "VisibilityTimeout")

**Step 3** - To display the list of tables present in the database, run `\dt` command

![3](3.png "VisibilityTimeout")

It will show the list of all tables present in that database along with the Schema, Type, and Owner of that tables.

To get more information about tables, use `\dt+` command

That’s how you can show tables in Postgres

![4](4.png "VisibilityTimeout")

This command will give the details of Persistence, Access method, Size, and Description of tables

## Using PgAdmin

PgAdmin software can also serve as a tool to list down the tables present in database. Let’s take a look at the steps

**Step 1** - Open PgAdmin tool on your device

![5](5.png "VisibilityTimeout")

**Step 2** - In the Object Explorer present on the left sidebar, expand the Servers and direct to your desired database

![6](6.png "VisibilityTimeout")

**Step 3** - Right click on the Schemas option and select the Query Tool feature

![7](7.png "VisibilityTimeout")

**Step 4** - You can type and run SQL queries in the Query tool. To list down all the tables present in the desired database, run this query -

`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`

![8](8.png "VisibilityTimeout")

**Step 5** - Click Execute (present on the upper horizontal menu), or you can press F5 key to execute the query

It will list down all the tables present in that database and the output will be displayed in the Data Output section.

![9](9.png "VisibilityTimeout")

Make sure to replace the name of schema from public to any of your desired schema if the tables are present in a different schema.

## Using SQL query

There is a SQL query which can be executed in the terminal to enumerate and display a comprehensive list of tables.

**Step 1** - Open your terminal and connect it to your desired Postgres database. Follow our guide to see the whole process, click here

![1](1.png "VisibilityTimeout")

**Step 2** - Now run this SQL query to get the list of all tables present in the database

`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

![10](10.png "VisibilityTimeout")

You can replace 'public' with the another schema name if applicable
