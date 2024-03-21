---
title: Troubleshooting
---

### Connection hanging

-   There is a known [issue](https://github.com/traefik/traefik/issues/9929#issuecomment-1608993684) when connecting with the default sslmode 'prefer' where if the database is restarting while you start a connection, it will hang even after the database is back up.
-   Please use the sslmode 'require' to avoid this issue, and Tembo team will work on getting this issue resolved for sslmode 'prefer'.
-   Tembo will only accept encrypted connections, regardless of sslmode configured on the client side.

```bash
psql 'postgresql://postgres:***@***.data-1.use1.tembo.io:5432?sslmode=require'
```

### Tembo requires PostgreSQL clients that support Server Name Indication (SNI)

Connection examples are provided [here](https://tembo.io/docs/getting-started/quickstarts/java).

-   [Server Name Indication](https://en.wikipedia.org/wiki/Server_Name_Indication) was introduced in Postgres version 14, and this feature is used in Tembo to route requests to the appropriate databases
    -   [Release notes](https://www.postgresql.org/docs/release/14.0/)
-   Ruling out SNI versioning issues

    -   This command will attempt to connect to your cluster using a known, working version of psql. Replace the connection string with your connection string, found in the Tembo UI

    ```bash
     docker run -it --rm \
        --entrypoint=psql postgres:15 \
        'postgresql://postgres:***@***.data-1.use1.tembo.io:5432?sslmode=require'
    ```

-   If the above fails, you may have problems reaching your cluster
-   Here is an example of installing an updated PostgreSQL client on a Debian-based linux system

    ```bash
    sudo apt-get update && sudo apt-get install -y lsb-release
    sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null
    sudo apt-get update && sudo apt-get install -y postgresql-client
    ```

### Checking if you can reach the Tembo Platform

-   Can you get 404 from your domain name?
    -   just type their domain into browser or use curl
    -   For example, `org-your-org-name-inst-your-cluster-name.data-1.use1.tembo.io`
    -   If you get a 404, then you have network connectivity to Tembo

## Connecting with Unix domain sockets

Some extensions connect to the database using local access. This type of connection is known as connecting by Unix domain sockets.

```
local all all peer
```

Unix domain socket files are not in the default path on Tembo Cloud. Instead, the files are located in the directory `/controller/run`, which can be found by the configuration `unix_socket_directories`.

If you are using an extension which requires local access, you must configure this option. When connecting to Postgres, the `host` option is understood as a path to the Unix domain socket when it starts with a slash.

For example in the case of **cron**, the configuration `cron.host` can be set to `/controller/run`, and in the case of **dblink**, you connect like this: `dblink('dbname=sample host=/controller/run', 'SELECT 1')`
