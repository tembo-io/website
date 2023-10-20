---
sidebar_position: 1
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

:::info
Coming soon: Enable and configure connection pooling via the [Tembo Cloud UI](https://cloud.tembo.io)
:::

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