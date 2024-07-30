---
title: 'Rails'
sideBarTitle: 'Rails'
sideBarPosition: 207
description: Connect to Postgres using Rails
---

Make sure you have Ruby Version `2.7.0` or greater
You will have to remove the default `SQLite3` Active Record
```bash title="Gemfile"
#remove `SQLite3` from Gemfile
gem 'sqlite3', '~> 1.4'
```
You will need to add the PostgreSQL Gem
```bash title="Gemfile"
#add `pg` to Gemfile
gem "pg"
```
Navigate to `/config/database.yml` and add the following contents
Rails will create a database, so use a database name not currently in Tembo Postgres
```bash title="/config/database.yml"
development:
  adapter: postgresql
  encoding: unicode
  database: your_postgres_table_name
  pool: 5
  host: your_tembo_host_name
  username: your_postgres_username
  password: your_postgres_password
```
Now you can build your project
```bash title="shell"
bundle install
```
Then, create the Active Record
```bash title="shell"
rails db:create
```
## Support and Community

If you encounter any issues, please check out our [troubleshooting guide](/docs/product/cloud/troubleshooting/connectivity) or contact [support@tembo.io](mailto:support@tembo.io).

You're also welcome to join our [Tembo Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw) to meet and collaborate with other Tembo users.
