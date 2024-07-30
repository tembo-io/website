---
title: API Authentication
uppercase: true
---

To explore the Tembo Cloud API, visit our [API documentation](https://api.tembo.io/redoc).

### Create a personal access token

After logging in to Tembo Cloud, navigate here to issue a token: https://cloud.tembo.io/generate-jwt

To revoke a token, please follow guidance in the documentation [here](/docs/product/cloud/security/revoke-token).

### Test an API request

Then, you can use this token in API requests to Tembo Cloud, for example:

```bash
export TOKEN='******'

curl "https://api.tembo.io/api/v1/orgs/instances/schema" \
  -H "authorization: Bearer ${TOKEN}"
```

-   You can try the Tembo Cloud API using this token in our [Interactive API documentation](https://api.tembo.io/swagger-ui/) by clicking the "Authorize" button.
