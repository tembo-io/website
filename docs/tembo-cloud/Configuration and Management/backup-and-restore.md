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

Tembo Cloud supports Point-In-Time Recovery (PITR) to a new Tembo Instance for all running Instances and for 30 days after deletion.

:::info
Coming soon: Point-In-Time Recovery (PITR) via the [Tembo Cloud UI](https://cloud.tembo.io)
:::

For information on authenticating to the API, please see the [Tembo Cloud API authentication guide](/docs/tembo-cloud/api-authentication).

```shell
TEMBO_TOKEN=<your token>
TEMBO_ORG=<your organization id>
TEMBO_INST_RESTORE_FROM=<your instance id>
TEMBO_INST_RESTORE_TO=<your new instance name>

# Recover to five minutes ago
TEMBO_RECOVERY_TIME=$(date -u +'%Y-%m-%dT%H:%M:%SZ' -d '-5 minutes')

curl -X 'POST' \
  "https://api.tembo.io/api/v1/orgs/$TEMBO_ORG/restore" \
  -H "accept: application/json" \
  -H "Authorization: Bearer $TEMBO_TOKEN" \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
    "instance_name": "$TEMBO_INST_RESTORE_TO",
    "restore": {
        "instance_id": "$TEMBO_INST_RESTORE_FROM",
        "recovery_target_time": "$TEMBO_RECOVERY_TIME"
    }
}
EOF
```

If `recovery_target_time` is omitted, then it will use now as the time.

For more information to restore from an existing instance, please see the [Tembo Cloud Platform API documentation](https://tembo.io/docs/tembo-cloud/openapi/#tag/instance/operation/restore_instance).
