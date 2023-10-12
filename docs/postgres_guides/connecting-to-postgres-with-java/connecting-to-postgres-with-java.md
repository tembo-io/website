---
sidebar_position: 2
tags:
  - Postgres Basics
---

import AddingJdbc from './images/adding-jdbc.png'

# Connecting to Postgres with Java using JDBC

In this guide, we will study the step-by-step procedure to establish a connection to the Postgres database with your Java project. We will take advantage of the JDBC (Java Database Connectivity) driver to setup the connection, and then will take a look at different approaches to integrate the JDBC driver into your project.

Let’s get started

**Step 1** - Integrate the PostgreSQL JDBC driver into your project directory. We can add the JDBC driver either by manually adding the JAR file in the project or using a management tool like Maven.

### 1. Using PostgreSQL JDBC Driver

**1.1** - Download the PostgreSQL JDBC Driver in your Device. Visit their [official website](https://jdbc.postgresql.org/download/) to download it.

:::info
PostgreSQL JDBC Driver is driver that allows the users to connect a Java progam to a PostgreSQL database. It is an Open-source driver. To learn more about it, [check there official documentation](https://jdbc.postgresql.org/)
:::

**1.2** - Add the PostgreSQL JDBC Driver JAR file to your project.

To do that go to Project Properties → Add JAR/Folder and select the downloaded JDBC driver file.

<img src={AddingJdbc} width="600" alt="AddingJdbc" />

### 2. Using Maven

**2.1** - In this method, we need to modify the `pom.xml` file of our project. This XML file holds all the necessary information like dependencies, metadata, and build settings required to build and manage the project.

Open the `pom.xml` file in your project directory and integrate the PostgreSQL JDBC driver. To do that, simply paste the following code snippet in `pom.xml` file.

```
<dependencies>
    <!-- Other dependencies -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <version>DRIVER_VERSION</version>
    </dependency>
</dependencies>
```

Do replace the `DRIVER_VERSION` with your PostgreSQL JDBC driver.

You can check the [official documentation](https://jdbc.postgresql.org/) of Postgres JDBC to get the driver version.

:::info
Maven, primarily for Java projects, streamlines the entire development process, ensuring consistency in managing dependencies, code compilation, testing, packaging, and deployment across different environments.

Check their [official documentation](https://maven.apache.org/what-is-maven.html) to learn more about it.
:::

You do not need to manually download the JDBC Driver when you are using Maven method. Maven takes care of that by automatically downloading all the required JAR files from remote repositories.

**Step 3** - Connect the PostgreSQL database to your project. Use this code to connect the database

```
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class PostgreSQLExample {
    public static void main(String[] args) {

        String jdbcUrl = "jdbc:postgresql://localhost:5432/database_name";
        String username = "username";
        String password = "password";


            // Register the PostgreSQL driver

            Class.forName("org.postgresql.Driver");

            // Connect to the database

            Connection connection = DriverManager.getConnection(jdbcUrl, username, password);

            // Perform desired database operations

            // Close the connection
            connection.close();
        }
}

```

Make sure to replace the `username`, `password`, and `database_name` with the credentials of your database

**Step 4** - Now you can execute your desired SQL queries to perform operations on database.

```
Connection connection = DriverManager.getConnection(jdbcUrl, username, password);

Statement statement = connection.createStatement();

ResultSet resultSet = statement.executeQuery("SELECT * FROM employees");

while (resultSet.next())
{
String columnValue = resultSet.getString("column_name");
System.out.println("Column Value: " + columnValue);
}
```

Use your table name in-place of `employees`

**Step 5** - Close the connection after you have performed the desired operations on the database.

```
resultSet.close();
statement.close();
connection.close();
```

In this example, we have demonstrated how you can read the data, but you can also perform other operations on Posgtres database like Insert, Update, and Create Table

**Insert**

```
(Connection connection = DriverManager.getConnection(jdbcUrl, username, password)) {
            String sql = "INSERT INTO employees(column1, column2) VALUES (value1, value2)";
            PreparedStatement preparedStatement = connection.prepareStatement(sql);

            preparedStatement.setString(1, "value1");
            preparedStatement.setString(2, "value2");

            int rowsInserted = preparedStatement.executeUpdate();
            System.out.println(rowsInserted + " row(s) inserted."
}
```

**Update**

```
(Connection connection = DriverManager.getConnection(jdbcUrl, username, password)) {
            String sql = "UPDATE employees SET column1 = ‘value1’ WHERE column2 = ‘value2’";
            PreparedStatement preparedStatement = connection.prepareStatement(sql);

            preparedStatement.setString(1, "updated_value");
            preparedStatement.setString(2, "old_value");

            int rowsUpdated = preparedStatement.executeUpdate();
            System.out.println(rowsUpdated + " row(s) updated.");
        }
```

**Create Table**

```
(Connection connection = DriverManager.getConnection(jdbcUrl, username, password)) {
            Statement statement = connection.createStatement();

            String createTableSQL = "CREATE TABLE employees ("
                    + "id serial PRIMARY KEY,"
                    + "name VARCHAR(255),"
                    + "age INT)";

            statement.execute(createTableSQL);

            System.out.println("Table created successfully.");
        }
```

## Conclusion

In this guide, we discussed the step-by-step process to connect to the Postgres database with Java.

Working on a C# project? Explore our [C# guide](https://tembo.io/docs/postgres_guides/connecting-to-postgres-with-c/) to learn how to establish a connection with a PostgreSQL database using C#.

Also, check out our new extensions [pgmq](https://tembo.io/blog/introducing-pgmq) and [pg_later](https://tembo.io/blog/introducing-pg-later) which can help you manage basic message and long-running query operations.
