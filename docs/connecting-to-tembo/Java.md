It is important to use Java version 8 or greater and PostgreSQL JDBC Driver version 4.2 or greater.
We recommend downloading the latest Java Development Kit  [JDK 21](https://www.oracle.com/java/technologies/downloads/#java8-mac)
Also, you must download the [PostgreSQL 4.2 JDBC Driver](https://jdbc.postgresql.org/download/)

```java title="Example.java"
import java.sql.*;
import java.net.URI;
import java.net.URISyntaxException;

public class Example
{
   public static void main(String[] args)
   {
      try
      {
         // Store PostgreSQL connection string in a variable
         String psqlString = "postgresql://postgres:******@your-subdomain-here.data-1.use1.tembo.io:5432/postgres";

         // Parse PostgreSQL connection string
         URI dbUri = new URI(psqlString);

         String username = dbUri.getUserInfo().split(":")[0];
         String password = dbUri.getUserInfo().split(":")[1];
         String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath() + "?user=" + username + "&password=" + password;

         Connection conn = DriverManager.getConnection(dbUrl);

         Statement st = conn.createStatement();
         ResultSet rs = st.executeQuery("SELECT 1");
         while (rs.next())
         {
            System.out.format("%s\n", rs.getString(1));
         }
         rs.close();
         st.close();
      }
      catch (SQLException | URISyntaxException e)
      {
         System.err.println(e);
      }
   }
}
```
You will need to compile `Example.java` with the `PostgreSQL JDBC Driver`

```bash title="shell"
javac -cp .:/path/to/postgresql-42.6.0.jar Example.java
```

Now, you can connect Java to Tembo Postgres
```bash title="shell"
java -cp .:/path/to/postgresql-42.6.0.jar Example
```

## Support and Community


If you encounter any issues, please check out our [troubleshooting guide](https://tembo.io/docs/tembo-cloud/troubleshooting) or contact [support@tembo.io](mailto:support@tembo.io).

You're also welcome to join our [Tembo Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw) to meet and collaborate with other Tembo users.
