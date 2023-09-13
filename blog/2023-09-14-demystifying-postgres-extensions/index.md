---
slug: demystifying-postgres-extensions
title: "Demystifying Postgres Extensions"
authors: [steven]
tags: [postgres, extensions]
---

Postgres is designed to be easily extendable, and there are thousands of awesome extensions developed by the community. Many developers don't know about Postgres extensions, or wouldn't know where to start. Let's walk through some examples of running Postgres, trying different and interesting combinations of extensions, while explaining the common steps involved to get up and running.

It can be tricky to get an extension working. These are the steps that are typically involved:

- Find the extension you want
- Figure out how to build it
- Installation of system dependencies
- Install the extension
- Sometimes, configure in shared_preload_libraries (more on this later)
- Sometimes, provide extension-specific configurations
- Sometimes, run `CREATE EXTENSION` to enable

We can simplify this process using open source tooling that Tembo is building. Let's use [Trunk](https://pgt.dev) for discovery and for skipping the build step. Also, we can use Tembo's pre-built container images to skip system dependency installation for many commonly used extensions. Configuring and enabling an extension is one of the more complicated steps, but let's simplify that too. To understand how extensions can be configured and enabled in different ways, let's first review what's in an extension. Extensions consist of SQL (either normal SQL or SQL including functionality provided by extensions) and libraries. A 'library' simply means code that should be accessible in Postgres, and this is where the functionality for extending SQL lives, along with any other functionality an extension may provide. To connect into Postgres' existing functionality, libraries can use a Postgres feature informally called 'hooks'. 'Hooks' allow for overwriting default Postgres functionality, or calling back into an extension's code at the appropriate time (for example modifying start up behavior). Sometimes extensions are instead referred to as 'modules', but we will simply refer to everything as an 'extension'.

:::info
Enabling an extension can be thought of like this:

|                             | Requires `CREATE EXTENSION`                                       | Does not require `CREATE EXTENSION`                           |
|-----------------------------|-------------------------------------------------------------------|---------------------------------------------------------------|
| **Requires `LOAD`**         | Extensions that use SQL and their libraries have hooks            | Extensions that do not use SQL, but their libraries use hooks |
| **Does not require `LOAD`** | SQL-only extensions, and SQL + libraries without hooks            | Not applicable                                                |
:::


Extensions with libraries that do not use hooks do not need to be loaded because Postgres will automatically load the related libraries when `CREATE EXTENSION` is run. However, when hooks are used, an extension might require a `LOAD` at the appropriate time, for example on start up, before the extension can be considered ready. These extensions will typically require the user to perform a load before `CREATE EXTENSION` can be run. `LOAD` is the command that tells Postgres to load a compiled binary file into memory, however this command is not typically used directly. Typically, the library should be configured in `shared_preload_libraries` which Postgres uses for loading libraries on start up. Changing this configuration requires a restart to take effect. There is another option, `session_preload_libraries`, which allows for libraries to be loaded for each new connection to Postgres, however all extensions that require loading may be loaded by the `shared_preload_libraries` configuration. So, we can just consider all extensions that require a load in the same category, and configure these in `shared_preload_libraries`. In other cases, it's best to optimize the configuration to use `session_preload_libraries` where possible to avoid a restart.

:::info
Extensions that require a `LOAD` can always be configured in `shared_preload_libraries`, but this configuration requires a restart to take effect. Some extensions can be loaded without a restart using `LOAD` directly, or using the `session_preload_libraries` configuration.
:::


To get a local development environment for trying different combinations of extensions, I followed [this guide](https://tembo.io/docs/tembo-cloud/try-extensions-locally).

In summary of the steps provided by the linked guide:
- Discover and install extensions with [Trunk](https://pgt.dev) to skip the build process
- Use Tembo-provided container images
- Configure `shared_preload_libraries`, if applicable
- Run `CREATE EXTENSION`, if applicable

## Example
