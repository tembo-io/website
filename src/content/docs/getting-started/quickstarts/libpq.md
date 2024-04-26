This guide helps users update their system's version of [libpq](https://www.postgresql.org/docs/current/libpq.html).

**libpq** is the C implementation of the Postgres client. Many other languages' Postgres clients depend on **libpq**. Tembo requires a version of **libpq** that supports Server Name Indication (SNI), which was introduced in Postgres version 14.

## Debian based Linux system

The below snippet shows how to add the official Postgres repository, then install the Postgres client from that apt repository.

```bash
sudo apt-get update && sudo apt-get install -y lsb-release
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null
sudo apt-get update && sudo apt-get install -y postgresql-client
```

## Mac

Here’s an example of updating `psql` and `libpq` on a Mac, using [brew](https://brew.sh/):

```bash
brew reinstall libpq
```

## Windows

Please find one of the Windows installers linked from the official [Postgres documentation](https://www.postgresql.org/download/windows/).

## Support and Community

If you encounter any issues, please check out our [troubleshooting guide](/docs/product/cloud/troubleshooting) or contact [support@tembo.io](mailto:support@tembo.io).

You're also welcome to join our [Tembo Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw) to meet and collaborate with other Tembo users.
