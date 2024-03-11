---
sidebar_position: 1
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

Visit the [Tembo CLI Releases page](https://github.com/tembo-io/tembo/releases) on GitHub. Download the `tembo-cli-[version]-x86_64-windows.tar.gz` file.

1. Use a tool like 7-Zip to extract the `tar.gz` file.
2. Once extracted, you'll find the Tembo CLI executable. To use it, you might want to add its folder to your system's PATH environment variable for easy terminal access.

```shell
# Example of adding Tembo CLI to PATH in PowerShell
$Env:Path += ";C:\path\to\tembo-cli-folder"
```

</details>


<details>
<summary><strong>Linux</strong></summary>

1. Visit the [Tembo CLI Releases page](https://github.com/tembo-io/tembo/releases) on GitHub and download the appropriate file for your architecture, such as `tembo-cli-0.17.0-aarch64-linux.tar.gz` for ARM64 or `tembo-cli-0.17.0-x86_64-linux.tar.gz for x86_64`.
2. Open a terminal and navigate to the download location.
3. Use tar to extract the tar.gz file. Replace `<filename>` with the name of the file you downloaded:

```shell
tar -xzf <filename>
```

4. Move the extracted tembo binary to a location in your PATH, such as /usr/local/bin/:
```shell
sudo mv tembo /usr/local/bin/
```

5. Make sure tembo is executable:
```shell
sudo chmod +x /usr/local/bin/tembo
```
</details>

## Setup Your Environment
After installation, set up your environment by running:

```shell
tembo init
```

The tembo init command initializes your environment with the necessary files in the directory where you wish to create the tembo.toml file.

The initialization process includes:

- A sample `tembo.toml` configuration file.
- A `~/.tembo/context` file 
- A `~/.tembo/credentials` file.

## Configure Tembo CLI
The Tembo CLI utilizes two primary configuration files inside `~/.tembo` to manage and streamline interactions with Tembo Cloud environments.

#### To configure, perform the following steps:

- You can generate a `tembo_access_token` at [Tembo Cloud JWT Generator](https://cloud.tembo.io/generate-jwt).
- Find your `org_id` in your Tembo Cloud URL, for example:
`https://cloud.tembo.io/orgs/org_2bVDi36rsJNberstrP37enwxzMk/clusters`.

### Credentials File:
This file contains your Tembo Cloud access tokens and API endpoints. It's crucial for authenticating requests and interacting with Tembo Cloud services.

#### Example:
```toml
version = "1.0"

[[profile]]
name = 'prod'
tembo_access_token = 'YOUR_ACCESS_TOKEN'
tembo_host = 'https://api.tembo.io'
tembo_data_host = 'https://api.data-1.use1.tembo.io'

[[profile]]
name = 'dev'
tembo_access_token = 'YOUR_ACCESS_TOKEN'
tembo_host = 'https://api.tembo.io'
tembo_data_host = 'https://api.data-1.use1.tembo.io'  
```
- `version`: Specifies the configuration file version.
- `profile`: Defines a user profile with a unique name (prod in this example).
- `tembo_access_token`: JWT token for authenticating with Tembo Cloud.
- `tembo_host`: The main API endpoint for Tembo Cloud.
- `tembo_data_host`: Endpoint for Tembo Cloud data-related operations.

### Context File:
The context file allows you to switch between different environments seamlessly, each with its deployment targets and configurations.

#### Example:
```toml
version = "1.0"

[[environment]]
name = "local"
target = "docker"
set = true

[[environment]]
name = "prod"
target = "tembo-cloud"
org_id = "YOUR_ORGANIZATION_ID"
profile = "prod"

[[environment]]
name = "dev"
target = "tembo-cloud"
org_id = "YOUR_ORGANIZATION_ID"
profile = "dev"
```

- `version`: Specifies the configuration file version.
- `environment`: Defines an environment setting.
  - `name`: A friendly name for the environment (e.g., local, prod).
  - `target`: Deployment target (e.g., docker for local development, tembo-cloud for production).
  - `org_id`: Organization ID for Tembo Cloud environments.
  - `profile`: Specifies which profile to use from the credentials file.
  - `set`: Indicates if this environment is currently active.

<!---
<details>
<summary><strong>Through CLI</strong></summary>
To configure automatically, use the tembo login command:
tembo login
This command generates a JWT token and retrieves your organization ID, updating the credentials file as it guides you through the web-based login process.
</details> --->


## Tembo CLI Help

To view the help information for Tembo CLI, you can run the following command in your terminal:

```shell
tembo --help
```

```output
Commands:
  context   Manage Tembo contexts
  init      Initializes a local environment. Creates a sample context and configuration files
  apply     Deploys a tembo.toml file
  validate  Validates the tembo.toml file, context file, etc
  delete    Deletes database instance locally or on Tembo Cloud
  logs      View logs for your instance
  help      Print this message or the help of the given subcommand(s)

Options:
  -v, --verbose  Show more information in command output
  -h, --help     Print help
  -V, --version  Print version
```

You can also use --help within subcommands like `tembo context --help`