---
sidebar_position: 10
---

# Tembo MongoAlternative

The Tembo MongoAlternative Stack is designed to bring document-oriented database capabilities to Postgres.
Leveraging the power of FerretDB, Tembo users can both migrate from MongoDB to Postgres, as well as interact with their data as if they never left!

## Extensions

- [FerretDB](https://docs.ferretdb.io/) - `FerretDB` is an open-source proxy that translates MongoDB wire protocol queries to SQL, with Postgres as the backend.
- Extensions from [Trunk](https://pgt.dev/) can be installed on-demand.

## Getting started

### Download mongosh (MongoDB Shell)

Similar to `psql`, `mongosh` is a means to connect and interact with your Tembo instance.
The difference, however, is that `mongosh` is specific to MongoDB-like environments, such as the one that FerretDB provides.

- For macOS, you can run the following brew command: `brew install mongosh`
- For Windows and Linux, please refer to the steps found within the [mongosh official documentation](https://www.mongodb.com/docs/mongodb-shell/install/)

### Sample dataset

This document will deal soely with sample data and not migrations.
For more information, refer to our guide on migrating from MongoDB to Postgres with Tembo and FerretDB.

### Setup

Once you've established a Tembo MongoAlternative Stack instance, you will need to download a root SSL certificate.
You can then copy the connection string from the UI and execute it within the terminal having navigated to the directory containing the freshly-downloaded SSL certificate.
As an alternative to copying from the UI, you can fill in and run the following mongosh command:

```bash
mongosh "mongodb://postgres:<your-password>@<your-host>:27018/ferretdb?authMechanism=PLAIN&tls=true&tlsCaFile=$(pwd)/ca.crt"
```

Note that the end of the connection string, `tlsCaFile=$(pwd)/ca.crt`, is pointing to the directory in which your terminal is in when executing the connection string.
This can be changed if you have a specific directory you would like to store your SSL certificate in.


```bash
psql 'postgresql://postgres:<your-password>@<your-host>:5432/postgres'
```

### Sample queries

#### Query 1

#### Query 2

#### Query 3

#### Query 4

#### Query 5
