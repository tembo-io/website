---
title: Prisma
description: Connect to Tembo with Prisma
sideBarTitle: 'Prisma'
---

This guide is based on the [Prisma getting started guide](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-node-postgresql), and tested to work on Tembo.

### Prerequisites

- Install [Node.js](https://nodejs.org/en)

# Create project setup

As a first step, create a project directory and navigate into it:

```bash
mkdir hello-prisma
cd hello-prisma
```

Next, initialize a Node.js project and add the Prisma CLI as a development dependency to it:

```bash
npm init -y
npm install prisma --save-dev
```

**Prisma must be version 5.6.0 or greater.**

Next, set up your Prisma ORM project by creating your Prisma schema file with the following command:
```bash
npx prisma init
```

### Configure Postgres connection

Check your file `prisma/schema.prisma`. It should already contain this:

```
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Next, check your `.env`. It should contain a sample connection string

```
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
```

Replace the connection string in the `.env` file with your Tembo connection string. You should add `.env` to your `.gitignore` file.

### Prisma migrate

Next, we need to create your tables in Postgres, using your [Prisma schema](https://www.prisma.io/docs/orm/prisma-schema).

For example, add this content into `prisma/schema.prisma`

```
model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  name    String?
}
```

To map your data model to the database schema, you need to use the prisma migrate CLI commands:

```bash
npx prisma migrate dev --name init
```

### Connect with Prisma client

Install the Prisma client

```bash
npm install @prisma/client
```

**Prisma client must be version 5.6.0 or greater.**

Create a file `index.js`

```javascript
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const allUsers = await prisma.user.findMany()
  console.log(allUsers)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
```

Run the program like this:

```bash
node index.js
```

A result showing an empty list means you have successfully connected and queried your Users table, which is empty:

```bash
[]
```

Read on in the [Prisma documentation](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/querying-the-database-node-postgresql).

## Support and Community

If you encounter any issues, please check out our [troubleshooting guide](/docs/product/cloud/troubleshooting) or contact [support@tembo.io](mailto:support@tembo.io).

You're also welcome to join our [Tembo Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw) to meet and collaborate with other Tembo users.
