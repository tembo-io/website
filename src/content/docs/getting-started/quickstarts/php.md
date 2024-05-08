---
sideBarTitle: 'PHP'
---

The [PHP Postgres database extension](https://www.php.net/manual/en/book.pgsql.php) depends on the Postgres client C libraries, known as **libpq**. Please see [our libpq guide](/docs/getting-started/quickstarts/libpq) to update your version of **libpq**.

If you have PHP installed, often the Postgres database extension is already installed. Check if it is installed like this.

```bash
php -m | grep pdo_pgsql
```

If it shows up in the list, it means the extension is enabled. If not, you may need to enable it in your php.ini file. You can find the location of your php.ini file by running the following.

```bash
php --ini
```

Open the `php.ini` file and uncomment the line `extension=pdo_pgsql`.

Here is an example connecting to a Tembo Cloud instance using PHP.

```php
<?php
$dsn = 'pgsql:host=your-instance-subdomain.use1.tembo.io;port=5432;dbname=postgres'; // Replace with your actual connection details
$username = 'postgres';
$password = '****'; // Replace this with the actual password

try {
    // Create a new database connection
    $pdo = new PDO($dsn, $username, $password);
    echo "Connected successfully.\n";

    // Execute a query
    $query = $pdo->query('SELECT 1 as result');
    if ($query) {
        $result = $query->fetch(PDO::FETCH_ASSOC);
        echo "Query result: " . $result['result'] . "\n";  // Using 'result' as the key
    } else {
        echo "Query failed.\n";
    }

} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
?>
```

## Support and Community

If you encounter any issues, please check out our [troubleshooting guide](/docs/product/cloud/troubleshooting) or contact [support@tembo.io](mailto:support@tembo.io).

You're also welcome to join our [Tembo Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw) to meet and collaborate with other Tembo users.
