---
sidebar_position: 4
tags:
  - api
  - connection pooling
---

# Connection Pooling


A connection pooler is a tool used to manage database connections, sitting between your application and Postgres
instance. Because of the way Postgres handles connections, the server may encounter resource constraint issues when
managing a few thousand connections. Using a pooler can alleviate these issues by using actual Postgres connections
only when necessary, allowing for easier handling of thousands of connections at a lower cost.

This document will guide you through the process of enabling and configuring connection pooling on Tembo Cloud.

## Enabling and Configuring Connnection Pooling via the Tembo Cloud API

1. Generate an API token for communicating with your Tembo instance. Navigate to https://cloud.tembo.io/generate-jwt and follow the instructions to generate a token.


2. Set the following environment variables:

    ```bash
    export TEMBO_TOKEN=<your token>
    export TEMBO_ORG=<your organization id>
    export TEMBO_INST=<your instance id>
    ```


3. Patch your existing Tembo instance with connection pooler settings using the [Tembo Cloud Platform API](https://tembo.io/docs/tembo-cloud/openapi):

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="curl" label="Curl">

```shell
curl -X 'PATCH' \
  "https://api.tembo.io/api/v1/orgs/$TEMBO_ORG/instances/$TEMBO_INST" \
  -H "accept: application/json" \
  -H "Authorization: Bearer $TEMBO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "connection_pooler": {
    "enabled": true,
    "pooler": {
      "parameters": {
        "max_client_conn": "50",
        "default_pool_size": "5000"
      },
      "poolMode": "transaction"
    }
  }
}'
```

</TabItem>
</Tabs>

## Connect to your Tembo Instance's Connection Pooler

1. Fetch the connection pooler hostname from the Tembo Cloud API and set it as an environment variable:

   ```shell
   export POOLER_HOST=$(
     curl -X 'GET' \
     "https://api.tembo.io/api/v1/orgs/$TEMBO_ORG/instances/$TEMBO_INST" \
     -H "accept: application/json" \
     -H "Authorization: Bearer $TEMBO_TOKEN" \
     -H "Content-Type: application/json" \
     | jq -r ' .connection_info.pooler_host'
   )
   ```

2. Connect to the connection pooler using `psql`:

   ```shell
   psql "postgresql://<user>:<password>@$POOLER_HOST:5432?sslmode=require"
   ```

## Connnection Pooling via the Tembo Cloud UI

### Enable and Configure your Tembo Instance's Connection Pooler

Log in to the [Tembo Cloud UI](https://cloud.tembo.io/) and select the "Database" tab in the navigation bar. In the "Settings" view, you can enable/disable connection pooling and tune a set of parameters.

### Connect to your Tembo Instance's Connection Pooler

On the Home page of [Tembo Cloud UI](https://cloud.tembo.io/), find the "Show connection strings" button on the right side. This button opens a modal where you can find a PSQL connection string. If you have enabled connection pooling on your instance, there will also be a tab called "Connection Pooling" where you can find the complete connection string specifically for the connection pool.

### Integrate a manually created Database to the Connection Pooler

If you manually create a database and wish to integrate it with the connection
pooler you will need to run the following queries from inside your instance.

For each new database you will need to grant permission for `cnpg_pooler_pgbouncer`
to connect to it:

```sql
GRANT CONNECT ON DATABASE { database name here } TO cnpg_pooler_pgbouncer;
```

Then connect in each new database, and then create the authentication
function inside each of the application databases:

```sql
CREATE OR REPLACE FUNCTION user_search(uname TEXT)
  RETURNS TABLE (usename name, passwd text)
  LANGUAGE sql SECURITY DEFINER AS
  'SELECT usename, passwd FROM pg_shadow WHERE usename=$1;';

REVOKE ALL ON FUNCTION user_search(text)
  FROM public;

GRANT EXECUTE ON FUNCTION user_search(text)
  TO cnpg_pooler_pgbouncer;

ALTER FUNCTION user_search(TEXT) OWNER TO postgres;
```
