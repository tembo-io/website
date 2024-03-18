## Creating a Rails Application with Tembo CLI

## Prerequisites

Before you start, ensure you have the following installed:

1. Ruby on Rails
2. Tembo CLI. you can find the steps [here](../Getting_Started.md)
3. Docker, set up and running for local development

## Step 1: Creating Your Rails Project

First, create a new Rails application with PostgreSQL as the database:

```bash
rails new todolist -d postgresql
cd todolist/
```

## Step 2: Initializing Tembo

Initialize Tembo in your project directory:

```bash
tembo init
```

Update your `tembo.toml` file to match your project's requirements. Example configuration:

```toml
[test-instance]
environment = "dev"
instance_name = "rails-todo"
cpu = "0.25"
memory = "1Gi"
storage = "10Gi"
replicas = 1
stack_type = "OLTP"
```

Set the Tembo context to local:

```bash
tembo context set --name local
```

Apply your Tembo configuration to provision the required infrastructure:

```bash
tembo apply
```

## Step 3: Configuring the Database

Update your `config/database.yml` file with the Tembo PostgreSQL instance URL:

```yaml
default: &default
    adapter: postgresql
    encoding: unicode
    pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
    url: postgres://postgres:postgres@rails-todo.local.tembo.io:5432
```

Create the database:

```bash
rails db:create
```

## Step 4: Creating a Todo Model

Generate a Todo model with a description field:

```bash
rails generate model Todo description:text
```

Migrate the database to create the todos table:

```bash
rails db:migrate
```

## Step 5: Verifying the Setup

Confirm the setup by connecting to the PostgreSQL instance and listing the databases and tables:

Connect to the PostgreSQL instance:

```bash
psql postgres://postgres:postgres@rails-todo.local.tembo.io:5432
```

List all databases:

```sql
SELECT datname FROM pg_database;
```

Connect to your application's development database:

```sql
\c todolist_development
```

List the tables:

```sql
\dt
```

For a detailed guide on building a TodoList with Rails, you can refer to this Codecademy article: [Building a ToDoList with Rails](https://www.codecademy.com/article/deyemiobaa/building-a-todolist-with-rails).
