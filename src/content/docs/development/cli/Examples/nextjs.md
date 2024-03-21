---
title: NextJS
---

## Creating a Next.js Project with Tembo CLI

## Prerequisites

Before you start, make sure you have the following installed:

1. `npx` and `npm`
2. Tembo CLI. you can find the steps [here](../Getting_Started.md)
3. Docker, set up and running for local development

## Step 1: Creating Your Next.js Project

First, create a new Next.js application using the following command:

```bash
npx create-next-app todos-app --use-npm --ts
```

Follow the prompts to customize your Next.js setup, including TypeScript, ESLint, Tailwind CSS, the `src/` directory, App Router, and custom import aliases.

After creating your project, navigate into your project directory:

```bash
cd todos-app
npm run dev
```

## Step 2: Initializing Prisma and Tembo

Initialize Prisma with PostgreSQL as your data source provider:

```bash
npx prisma init --datasource-provider postgresql
```

Then, initialize Tembo in your project:

```bash
tembo init
```

Set the Tembo context to local:

```bash
tembo context set --name local
```

You can check your context by running

```bash
tembo context list
```

Update your `tembo.toml` file to match your project's requirements. Example configuration:

```toml
[test-instance]
environment = "dev"
instance_name = "todos-app"
cpu = "0.25"
memory = "1Gi"
storage = "10Gi"
replicas = 1
stack_type = "OLTP"
```

## Step 3: Database Migrations

Create a migrations file inside the migrations folder created after `tembo init`. Example SQL for creating users and posts tables:

`create_user_post_table.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

Apply your Tembo configuration to spin up a Docker container with PostgreSQL:

```bash
tembo apply
```

If the above command runs sucessfully, copy the `url` and paste it into your .env file. It would look something like

```
DATABASE_URL="postgres://postgres:postgres@todos-app.local.tembo.io:5432"
```

To run your migrations, use the following command:

```bash
cd migrations
psql postgres://postgres:postgres@todos-app.local.tembo.io:5432 -f create_user_post_table.sql
```

## Step 4: Integrating Prisma

Navigate back to the parent folder and pull the schema from your PostgreSQL database into Prisma:

```bash
cd ..
npx prisma db pull
```

Confirm the changes in the `schema.prisma` file within the Prisma folder and by checking the PostgreSQL tables directly.

Generate the Prisma client:

```bash
npx prisma generate
```

In the Next.js project root folder (prisma-next-todos-app), create a lib directory. In it, add a prisma.ts file which will configure the Prisma client as below:

```ts
import { PrismaClient } from '@prisma/client';
const prisma: PrismaClient = new PrismaClient();
export default prisma;
```

Now you should be all set to start development. Additionally you can follow the steps listed [here](https://birdeatsbug.com/blog/simplest-approach-to-work-with-databases-in-next-js-using-prisma) and follow-on from `Setting up the Next.js routes` section. This basic app shows how you can create a basic CRUD nextjs application using Tembo CLI.
