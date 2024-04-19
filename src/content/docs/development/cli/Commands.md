This document contains the help content for the `Tembo` command-line program.

**Command Overview:**

* [Tembo](#Tembo)
* [Tembo context](#Tembo-context)
* [Tembo context list](#Tembo-context-list)
* [Tembo context set](#Tembo-context-set)
* [Tembo init](#Tembo-init)
* [Tembo apply](#Tembo-apply)
* [Tembo validate](#Tembo-validate)
* [Tembo delete](#Tembo-delete)
* [Tembo logs](#Tembo-logs)
* [Tembo login](#Tembo-login)
* [Tembo top](#Tembo-top)


## `Tembo`

**Usage:** `Tembo [OPTIONS] <COMMAND>`

###### **Subcommands:**

* `context` — Manage Tembo contexts

* `init` — Initializes a local environment. Creates a sample context and configuration files

* `apply` — Deploys a tembo.toml file

* `validate` — Validates the tembo.toml file, context file, etc

* `delete` — Deletes database instance locally or on Tembo Cloud

* `logs` — View logs for your instance

* `login` — Initiates login sequence to authenticate with Tembo

* `top` — [EXPERIMENTAL] View Metric values of your instances


###### **Options:**

* `--markdown-help`
* `-v`, `--verbose` — Show more information in command output

<br />


## `Tembo context`

Manage Tembo contexts

**Usage:** `Tembo context <COMMAND>`

###### **Subcommands:**

* `list` — List all available contexts

* `set` — Set the current context

<br />

## `Tembo context list`

List all available contexts

**Usage:** `Tembo context list`

<br />


## `Tembo context set`

Set the current context

**Usage:** `Tembo context set --name <NAME>`

###### **Options:**

* `-n`, `--name <NAME>`

<br />



## `Tembo init`

Initializes a local environment. Creates a sample context and configuration files

**Usage:** `Tembo init`
<br />



## `Tembo apply`

Deploys a tembo.toml file

**Usage:** `Tembo apply [OPTIONS]`

###### **Options:**

* `-m`, `--merge <MERGE>` — Merge the values of another tembo.toml file to this file before applying
* `-s`, `--set <SET>` — Replace a specific configuration in your tembo.toml file. For example, tembo apply --set standard.cpu = 0.25

<br />


## `Tembo validate`

Validates the tembo.toml file, context file, etc

**Usage:** `Tembo validate`

<br />



## `Tembo delete`

Deletes database instance locally or on Tembo Cloud

**Usage:** `Tembo delete`

<br />



## `Tembo logs`

View logs for your instance

**Usage:** `Tembo logs`

<br />


## `Tembo login`

Initiates login sequence to authenticate with Tembo

**Usage:** `Tembo login [OPTIONS]`

###### **Options:**

* `--organization-id <ORGANIZATION_ID>` — Set your Org ID for your new environment, which starts with "org_"
* `--profile <PROFILE>` — Set a name for your new environment, for example "prod". This name will be used for the name of the environment and the credentials profile
* `--tembo-host <TEMBO_HOST>` — Set your tembo_host for your profile, for example api.tembo.io
* `--tembo-data-host <TEMBO_DATA_HOST>` — Set your tembo_data_host for your profile, for example api.data-1.use1.tembo.io

<br />



## `Tembo top`

[EXPERIMENTAL] View Metric values of your instances

**Usage:** `Tembo top [OPTIONS]`

###### **Options:**

* `--tail`