---
tags:
  - cli
---

# Getting Started

This guide provides instructions on how to install and configure the Tembo CLI on various operating systems. Follow these steps to set up your environment and begin using Tembo CLI.

## Installation

Choose your operating system below and follow the steps to install Tembo CLI.

<details>
<summary><strong>MacOS</strong></summary>

#### Using Homebrew

Open your terminal and run the following commands:

```shell
brew tap tembo-io/tembo
brew install tembo-cli
```
</details>

<details>
<summary><strong>Windows</strong></summary>
</details>


<details>
<summary><strong>Linux</strong></summary>
</details>

#### Using Cargo

If you prefer using Rust's package manager, run:

```shell
cargo install tembo-cli
```


## Setup Your Environment
After installation, set up your environment by running:

```shell
tembo init
```

The tembo init command initializes your environment with the necessary files in the directory where you wish to create the tembo.toml file.

The initialization process includes:

- A sample `tembo.toml` configuration file.
- A migrations directory for SQL migrations.
- A `~/.tembo/context` file to manage various user contexts.
- A `~/.tembo/credentials` file for storing credentials and API URLs.

## Configure Tembo Cloud Information
You can configure your Tembo Cloud information automatically or manually.

<details>
<summary><strong>Automatic</strong></summary>
To configure automatically, use the tembo login command:

```shell
tembo login
```

This command generates a JWT token and retrieves your organization ID, updating the credentials file as it guides you through the web-based login process.
</details>

<details>
<summary><strong>Manual</strong></summary>
To configure manually, perform the following steps:

Open the .tembo directory in your preferred text editor by running:

```shell
open .tembo
```
- You can generate a JWT token at Tembo Cloud JWT Generator.
- Find your organization ID in your Tembo Cloud URL, for example:
`https://cloud.tembo.io/orgs/org_2bVDi36rsJNberstrP37enwxzMk/clusters`.

</details>