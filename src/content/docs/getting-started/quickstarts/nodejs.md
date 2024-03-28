It's important to use `pg` version 8.11.3 or greater.

```shell title="shell"
npm install pg@8.11.3
```

Node.JS requires a CA Certificate. Refer to [this guide](/docs/product/cloud/security/sslmode) to retrieve your certificate.

```js title="app.js"
const { Pool } = require("pg")
const fs = require("fs")

const connectionString =
  "postgresql://postgres:******@your-subdomain-here.data-1.use1.tembo.io:5432/postgres"

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    ca: fs.readFileSync("/path/to/ca.crt").toString(),
  },
})

async function testQuery() {
  const client = await pool.connect()
  try {
    const response = await client.query("SELECT 1")
    console.log(response.rows[0]["?column?"])
  } finally {
    client.release()
  }
}

testQuery()
```

## Support and Community

If you encounter any issues, please check out our [troubleshooting guide](/docs/product/cloud/troubleshooting) or contact [support@tembo.io](mailto:support@tembo.io).

You're also welcome to join our [Tembo Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw) to meet and collaborate with other Tembo users.
