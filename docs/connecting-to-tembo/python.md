It’s important to use `psycopg2-binary` version 2.9 or greater. Your requirements.txt should contain:
```
psycopg2-binary==2.9
```
main.py
```
import psycopg2
import subprocess
import sys

# Install required packages from requirements.txt
subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

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


## Support and Community

If you encounter any issues, please check out our [troubleshooting guide](https://tembo.io/docs/tembo-cloud/troubleshooting) or contact [support@tembo.io](support@tembo.io).  

You're also welcome to join our [Tembo Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw) to meet and collaborate with other Tembo users. 
