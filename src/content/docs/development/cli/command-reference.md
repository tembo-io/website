---
title: Reference
sideBarTitle: Reference
uppercaseParent: true
---
This comprehensive guide is your resource for understanding and utilizing the tembo CLI, which offers powerful tools for managing your instance environments. Below, you'll find complete instructions on how to use each command, alongside options and subcommands to tailor your operations precisely to your needs.

**Command Overview:**

* [tembo](#tembo)
* [tembo context](#tembo-context)
* [tembo context list](#tembo-context-list)
* [tembo context set](#tembo-context-set)
* [tembo init](#tembo-init)
* [tembo apply](#tembo-apply)
* [tembo validate](#tembo-validate)
* [tembo delete](#tembo-delete)
* [tembo logs](#tembo-logs)
* [tembo login](#tembo-login)
* [tembo top](#tembo-top)

## tembo

**Usage:**
 ```bash
tembo [OPTIONS] <COMMAND>
```

**Subcommands:**

* `context` — Manage Tembo contexts
* `init` — Initializes a local environment. Creates a sample context and configuration files
* `apply` — Deploys a tembo.toml file
* `validate` — Validates the tembo.toml file, context file, etc
* `delete` — Deletes database instance locally or on Tembo Cloud
* `logs` — View logs for your instance
* `login` — Initiates login sequence to authenticate with Tembo
* `top` — [EXPERIMENTAL] View Metric values of your instances

**Options:**

* `--markdown-help`

  Possible values: `true`, `false`

* `-v`, `--verbose` — Show more information in command output

  Possible values: `true`, `false`


<br />

## tembo context

Manage Tembo contexts

**Usage:**
 ```bash
tembo context <COMMAND>
```

**Subcommands:**

* `list` — List all available contexts
* `set` — Set the current context

<br />

## tembo context list

List all available contexts

**Usage:**
 ```bash
tembo context list
```

<br />

## tembo context set

Set the current context

**Usage:**
 ```bash
tembo context set --name <NAME>
```

**Options:**

* `-n`, `--name <NAME>`

<br />

## tembo init

Initializes a local environment. Creates a sample context and configuration files

**Usage:**
 ```bash
tembo init
```

<br />

## tembo apply

Deploys a tembo.toml file

**Usage:**
 ```bash
tembo apply [OPTIONS]
```

**Options:**

* `-m`, `--merge <MERGE>` — Merge the values of another tembo.toml file to this file before applying
* `-s`, `--set <SET>` — Replace a specific configuration in your tembo.toml file. For example, tembo apply --set standard.cpu = 0.25

<br />

## tembo validate

Validates the tembo.toml file, context file, etc

**Usage:**
 ```bash
tembo validate
```

<br />

## tembo delete

Deletes database instance locally or on Tembo Cloud

**Usage:**
 ```bash
tembo delete
```

<br />

## tembo logs

View logs for your instance

**Usage:**
 ```bash
tembo logs [OPTIONS]
```

**Options:**

* `--tail` — Tail your logs

  Possible values: `true`, `false`

* `--app <APP>` — Fetch logs for specific apps

<br />

## tembo login

Initiates login sequence to authenticate with Tembo

**Usage:**
 ```bash
tembo login [OPTIONS]
```

**Options:**

* `--organization-id <ORGANIZATION_ID>` — Set your Org ID for your new environment, which starts with "org_"
* `--profile <PROFILE>` — Set a name for your new environment, for example "prod". This name will be used for the name of the environment and the credentials profile
* `--tembo-host <TEMBO_HOST>` — Set your tembo_host for your profile, for example api.tembo.io
* `--tembo-data-host <TEMBO_DATA_HOST>` — Set your tembo_data_host for your profile, for example api.data-1.use1.tembo.io

<br />

## tembo top

[EXPERIMENTAL] View Metric values of your instances

**Usage:**
 ```bash
tembo top [OPTIONS]
```

**Options:**

* `--tail`

  Possible values: `true`, `false`


<br />


