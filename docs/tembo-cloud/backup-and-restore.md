---
sidebar_position: 4
tags:
  - backup
  - restore
  - recovery
---

# Backup and restore

Tembo performs Postgres backups and Write-Ahead Log (WAL) archiving using [Barman](https://pgbarman.org/), powered by the [Cloud Native Postgres Operator (CNPG)](https://cloudnative-pg.io/).

Backups are saved to [Amazon S3](https://aws.amazon.com/s3/).

## Retention policies

- The retention policy for Barman is configured to 30 days
- The retention policy for AWS S3 is set to 40 days
- AWS S3 object versioning is enabled, and the retention policy for non-current versions is 30 days

## WAL archiving

Tembo sets `archive_timeout` to 5min, ensuring that WAL files are closed and archived to S3 at least every five minutes, providing a deterministic time-based value for your Recovery Point Objective (RPO).

## Restore

In Tembo Cloud, we support Point-In-Time Recovery (PITR) to a new Tembo Cluster for the last 30 days. Backup data is saved an additional 30 days after deletion to protect against accidental deletion, so backup data in total is retained for 60 days.

:::info
Coming soon: Point-In-Time Recovery (PITR) via the [Tembo Cloud UI](https://cloud.tembo.io)
:::

1. Generate an API token for communicating with your Tembo instance. Navigate to https://cloud.tembo.io/generate-jwt and follow the instructions to generate a token.


2. Set the following environment variables:

    ```bash
    export TEMBO_TOKEN=<your token>
    export TEMBO_ORG=<your organization id>
    export TEMBO_INST=<your instance id>
    ```

3. Initiate a restore from an existing instance using the [Tembo Cloud Platform API](https://tembo.io/docs/tembo-cloud/openapi/#tag/instance/operation/restore_instance):

### Full Restore

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="curl" label="Curl">

```shell
curl -X 'POST' \
  "https://api.tembo.io/api/v1/orgs/$TEMBO_ORG/restore" \
  -H "accept: application/json" \
  -H "Authorization: Bearer $TEMBO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instance_name": "$TEMBO_INST-restore",
    "restore": {
      "instance_id": "$TEMBO_INST"
    }
}'
```

</TabItem>
</Tabs>

### Point-In-Time (PITR) Restore

1. To initiate a PITR you will need to get the earliest time to recover using the [Tembo Cloud Platform API](https://tembo.io/docs/tembo-cloud/openapi):

    ```bash
    curl -X 'GET' \
      "https://api.tembo.io/api/v1/orgs/$TEMBO_ORG/instances/$TEMBO_INST" \
      -H "accept: application/json" \
      -H "Authorization: Bearer $TEMBO_TOKEN" \
      -H "Content-Type: application/json" | | jq .first_recoverability_time 
    ```

2. Now pick a time you want to restore to based off your `first_recoverability_time` and the current date and time.

    ```bash
    export TEMBO_RECOVERY_TIME="2023-10-18T23:00:08Z"

    ```

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="curl" label="Curl">

```shell
curl -X 'POST' \
  "https://api.tembo.io/api/v1/orgs/$TEMBO_ORG/restore" \
  -H "accept: application/json" \
  -H "Authorization: Bearer $TEMBO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instance_name": "$TEMBO_INST-restore",
    "restore": {
      "instance_id": "$TEMBO_INST",
      "recovery_target_time": "$TEMBO_RECOVERY_TIME"
    }
}'
```

</TabItem>
</Tabs>
