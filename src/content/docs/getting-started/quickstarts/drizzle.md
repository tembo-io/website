It's important to use `pg` version 8.11.3 or greater. Check this value in your `package-lock.json`

Node.JS requires a CA Certificate. Refer to [this guide](/docs/product/cloud/security/sslmode) to retrieve your certificate.

Here is a sample code snippet for connecting to Tembo using Drizzle ORM:

```typescript title="app.ts"
import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from 'drizzle-orm';
import { Pool } from "pg";
import fs from "fs";

const pool = new Pool({
  connectionString: "postgresql://postgres:*****@org-yourorg-inst-yourinst.data-1.use1.tembo.io:5432/postgres",
  ssl: {
    // Please re-download this certificate at least monthly to avoid expiry
    ca: fs.readFileSync("./ca.crt").toString(),
  },
})

const db = drizzle(pool);

async function testQuery() {
  try {
    const result = await db.execute(sql`SELECT 1`);
    console.log('Query result:', result.rows);
  } catch (error) {
    console.error('Error executing query:', error);
  }
}

testQuery();
```

## Support and Community

If you encounter any issues, please check out our [troubleshooting guide](/docs/product/cloud/troubleshooting) or contact [support@tembo.io](mailto:support@tembo.io).

You're also welcome to join our [Tembo Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw) to meet and collaborate with other Tembo users.
