It’s important to use `psycopg2-binary` version 2.9 or greater.

```shell
pip install psycopg2-binary==2.9
```
**main.py**
```python
import psycopg2

def main():
    # Connection string
    conn_str = 'postgresql://postgres:******@your-subdomain-here.data-1.use1.tembo.io:5432?sslmode=require'

    try:
        # Create a new database session
        conn = psycopg2.connect(conn_str)
    except Exception as e:
        print(f"Unable to connect to the database: {e}")

    try:
        # Create a new cursor object.
        cur = conn.cursor()

        # Test Query
        cur.execute("SELECT 1")

        # Fetch result
        output = cur.fetchone()[0]
        print(output)
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # Close communication with the database
        cur.close()
        conn.close()

if __name__ == "__main__":
    main()
```

If you're using Psycopg 3, which is the module just `psycopg`, then you may choose to install the version that includes the packaged dependencies like this `pip install "psycopg[binary,pool]"`, similar to the case of Psycopg 2. In either case of Psycopg 2 or 3, it works without the `-binary` version of the module if the underlying `libpq` is up to date.

You can update `libpq` like this on a Debian based Linux system:

```bash
sudo apt-get update && sudo apt-get install -y lsb-release
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null
sudo apt-get update && sudo apt-get install -y postgresql-client
```

Here’s an example of updating `psql` and `libpq` on a Mac, using [brew](https://brew.sh/):

```bash
brew reinstall libpq
```

## Support and Community

If you encounter any issues, please check out our [troubleshooting guide](/docs/product/cloud/troubleshooting) or contact [support@tembo.io](mailto:support@tembo.io).

You're also welcome to join our [Tembo Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw) to meet and collaborate with other Tembo users.
