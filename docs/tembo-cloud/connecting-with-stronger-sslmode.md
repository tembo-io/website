---
tags:
  - security
  - sslmode
---

# More secure connections

Please report security issues by emailing security@tembo.io

## sslmode

Postgres has a connection setting called [sslmode](https://www.postgresql.org/docs/current/libpq-ssl.html).

Tembo Cloud supports sslmodes `require`, `verify-ca`, and `verify-full`. All of these options require encryption. The modes `verify-ca` and `verify-full` validate the server certificate using a locally provided certificate. For more information, please review the [security documentation](/docs/tembo-cloud/security#ssl-and-certificates).

## Connecting with certificate validation

It is more secure to connect to Tembo Cloud with certificate validation, using sslmode `verify-ca` or `verify-full`. To use one of these options, the postgres client needs to be configured with the appropriate `sslmode` and with `sslrootcert` configured with a local certificate. Users can download the root certificate using the Tembo API.

For information on authenticating to the API, please see the [Tembo Cloud API authentication guide](/docs/tembo-cloud/api-authentication).

```bash
ORG_ID='org_id123456'
INST_ID='inst_id123456'
JWT="****"

secret_name="certificate"

curl -s -X 'GET' \
  "https://api.data-1.use1.tembo.io/api/v1/orgs/${ORG_ID}/instances/${INST_ID}/secrets/${secret_name}" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${JWT}" \
  -H 'Content-Type: application/json' \
  | jq -r '."ca.crt"' > ca.crt

psql 'postgresql://postgres:****@org-name-inst-name.data-1.use1.tembo.io:5432?sslmode=verify-full&sslrootcert=ca.crt'
```

:::info
`sslmode=verify-full` will not work when using a [Tembo Custom Domain](/docs/tembo-cloud/custom-domains), but your connections is still highly secure. This is because your custom domain host will not match the host at Tembo. 
:::

Different client software may connect in different ways. Connection examples are available in [this section of the Tembo documentation](/docs/category/connection-examples).
