---
sidebar_position: 3
tags:
  - embeddings
  - tools
  - containers
---

# Embeddings

:::info
**Powered by [all-MiniLM-L12-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2)**
:::

## Enabling Embeddings on Tembo Cloud

:::info
Coming soon: enable the embeddings service via the [Tembo Cloud UI](https://cloud.tembo.io)
:::

First, you will need to generate an API token so that you can communicate with the Tembo platform API. Navigate to cloud.tembo.io/generate-jwt and follow the instructions to generate a token. Alternatively, you can follow the instructions [here](https://tembo.io/docs/tembo-cloud/security-and-authentication/api-authentication).

Set your Tembo token as an environment variable, along with your organization id and the Tembo instance id. Fetch the `TEMBO_DATA_DOMAIN` from the "Host" parameter of your Tembo instance.

```bash
export TEMBO_TOKEN=<your token>
export TEMBO_ORG=<your organization id>
export TEMBO_INST_ID=<your instance id>
export TEMBO_INST_NAME=<your instance name>
export TEMBO_DATA_DOMAIN=<you Tembo domain>
```

Patch your existing Tembo instance using the [Tembo Cloud Platform API](https://tembo.io/docs/tembo-cloud/openapi) to enable the embeddings API. We'll set the the configurations to `None` so that the defaults are assigned.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="py" label="Python">

```py
import requests

TEMBO_ORG = os.environ["TEMBO_ORG"]
TEMBO_INST = os.environ["TEMBO_INST"]
TEMBO_TOKEN = os.environ["TEMBO_TOKEN"]

resp = requests.patch(
    url=f"https://api.tembo.io/orgs/{TEMBO_ORG}/instances/{TEMBO_INST}",
    headers={"Authorization": f"Bearer {TEMBO_TOKEN}"},
    json={
        "app_services": [
            {"embeddings": None},  // default configuration
        ]
    }
)
```

</TabItem>

<TabItem value="curl" label="Curl">

```bash
curl -X PATCH \
  -H "Authorization: Bearer ${TEMBO_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"app_services": [{"embeddings": null}]}' \
  "https://api.tembo.io/orgs/${TEMBO_ORG}/instances/${TEMBO_INST}"
```

</TabItem>
</Tabs>

## Using the Embeddings API for vector similarity search

If you already have a table, you can start with that. You could also start with an example dataset.


```bash
psql postgres://$yourUser:$yourPassword@${TEMBO_DATA_DOMAIN}:5432/postgres

CREATE TABLE products AS 
SELECT * FROM vectorize.example_products;
```

### Configure pg_vectorize to consume the Embeddings API

TEMBO_ORG_NAME is  the name of your organization, and TEMBO_INSTANCE_NAME is the name of your Postgres instance.

```sql
ALTER SYSTEM SET vectorize.embedding_service_url to 'org-${TEMBO_ORG_NAME}-inst-${TEMBO_INSTANCE_NAME}-embeddings.${TEMBO_ORG_NAME}-inst-${TEMBO_INSTANCE_NAME}.svc.cluster.local:3000/v1/embeddings';
```

## Initialize a table for automated vector search

We need to specify a `job_name`. There can be more than one job per table, but generally people will have just one job. It must be unique though. Specify the `table` name, `primary_key` for the table that you want to search. The `columns`
parameter specifies the specific columns within that table that you want to search. In our example, we'll search the `product_name` and `description` columns. The `transformer` parameter specifies the transformer model that you want to use (for not we only support `all_MiniLM_L12_v2` for privately hosted open source models). 

The `schedule` parameter specifies how often you want to update the embeddings. In our example, we'll update the embeddings every minute.


```sql
SELECT vectorize.table(
    job_name => 'product_search',
    "table" => 'products',
    primary_key => 'product_id',
    columns => ARRAY['product_name', 'description'],
    transformer => 'all_MiniLM_L12_v2',
    schedule => "* * * * *"
);
```
We can start the initial load of embeddings immediately by running the following command:

```sql
SELECT vectorize.job_execute('product_search');
```

Or we can simply wait for the cron job to complete.

## Search the table with raw text

```sql
SELECT * FROM vectorize.search(
    job_name => 'product_search',
    query => 'accessories for mobile devices',
    return_columns => ARRAY['product_id', 'product_name'],
    num_results => 3
);
```