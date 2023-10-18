---
sidebar_position: 1
tags:
  - api
  - configuration
---

# Postgres Configuration

Intro about configuration

## Configuring Postgres via the Tembo Cloud API

:::info
Coming soon: Configure Postgres via the [Tembo Cloud UI](https://cloud.tembo.io)
:::

First, you will need to generate an API token so that you can communicate with your Tembo instance. Navigate to https://cloud.tembo.io/generate-jwt and follow the instructions to generate a token.

Set the following environment variables:

```bash
export TEMBO_TOKEN=<your token>
export TEMBO_ORG=<your organization id>
export TEMBO_INST=<your instance id>
```

Patch your existing Tembo instance with new configuration values using the [Tembo Cloud Platform API](https://tembo.io/docs/tembo-cloud/openapi).

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
  "postgres_configs": [
    {
      "name": "max_connections",
      "value": "500"
    },
    {
      "name": "log_connections",
      "value": "on"
    },
    {
      "name": "log_disconnections",
      "value": "on"
    }
  ]
}'
```

</TabItem>
</Tabs>

## Confirming Configuration Values are Applied

You can confirm that your configuration values are applied by connecting to your Postgres instance and running the following:

```sql
postgres=# show max_connections;
 max_connections
-----------------
 500
(1 row)

postgres=# show log_connections;
 log_connections
-----------------
 on
(1 row)

postgres=# show log_disconnections;
 log_disconnections
--------------------
 on
(1 row)
```
