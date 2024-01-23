---
sidebar_position: 10
tags:
  - cli
---

# Tembo CLI

Tembo CLI allows users to experience [Tembo](https://tembo.io) locally, as well as,
manage and deploy to Tembo Cloud. It abstracts away complexities of configuring,
managing, and running Postgres in a local environment.

## Getting Started

### Installing CLI

Using homebrew

```
brew tap tembo-io/tembo
brew install tembo-cli
```

Using cargo

```
cargo install tembo-cli
```

### Commands

#### `tembo init`

The `tembo init` command initializes your environment with following files. Run init in the directory you want to create the `tembo.toml` file.

* `tembo.toml` example configuration file
* `migrations` directory for sql migrations
* `~/.tembo/context` file with various contexts user can connect to
* `~/.tembo/credentials` file with credentials & api urls

For more information: `tembo init --help`

### Add Tembo Cloud info

To provision instances on Tembo Cloud using CLI you will need to configure `org_id` & `tembo_access_token`

* fetch the `org_id` Tembo Cloud and add it as `org_id` in context file generated above 
* generate a JWT token using steps [here](https://tembo.io/docs/tembo-cloud/security-and-authentication/api-authentication/) & add it as `tembo_access_token` to the credentials file generated above.

#### `tembo context list/set`

tembo context works like [kubectl context](https://www.notion.so/abee0b15119343e4947692feb740e892?pvs=21). User can set context for local docker environment or tembo cloud (dev/qa/prod) with org_id. When they run any of the other commands it will run in the context selected. Default context will be local.

#### `tembo validate`

Validates `tembo.toml` and other configurations files.

#### `tembo apply`

Validates tembo.toml (same as `tembo validate`) and applies the changes to the context selected. It applies changes and runs migration for all databases.

##### Environment:

  * ###### Local Docker:
    * runs `docker-compose down` to bring down all existing containers
    * generates `Dockerfile` for each instance & builds a docker image
    * generates `docker-compose` to provision all instances
    * runs `docker-compose up -d` to spin up all instances
    * runs `sqlx migration` against the instances

  * ###### Tembo-Cloud: 
    * Creates/updates instance on tembo-cloud by calling the api against the appropriate environment

##### Flags: 
  * `--merge`: Overlays Tembo.toml by another toml file for a specific context
  *  `--set` : Specifies a single instance setting by assigning a new value

#### `tembo delete`

- **local docker:** runs `docker stop & rm` command
- **tembo-cloud:** calls delete tembo api endpoint

