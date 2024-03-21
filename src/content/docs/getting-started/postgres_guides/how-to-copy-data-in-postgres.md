---
title: How to Copy and Move Data Between PostgreSQL Instances Hosted at Different Hosts
---

#### Step-by-Step Guide

1. **Preparation**:

    - Ensure you have administrative access to both PostgreSQL instances.
    - Install PostgreSQL tools on your local machine if not already present. This includes `pg_dump` and `pg_restore`.

2. **Exporting Data from the Source Instance**:

    - Use `pg_dump` to create a backup of your database:
        ```sql
        pg_dump -h [source_host] -p [source_port] -U [source_username] -d [source_database] -F c -b -v -f "[backup_file].dump"
        ```
    - Replace `[source_host]`, `[source_port]`, `[source_username]`, `[source_database]`, and `[backup_file]` with your source instance details and desired backup file name.

3. **Transferring the Backup File**:

    - Securely transfer the `.dump` file to the host where the target PostgreSQL instance resides.

4. **Importing Data into the Target Instance**:

    - Use `pg_restore` to load the backup into the target database:
        ```sql
        pg_restore -h [target_host] -p [target_port] -U [target_username] -d [target_database] -v "[backup_file].dump"
        ```
    - Replace `[target_host]`, `[target_port]`, `[target_username]`, `[target_database]`, and `[backup_file]` with your target instance details.

5. **Verification**:
    - Verify the data integrity and completeness in the target database.

For detailed instructions and troubleshooting, refer to the Tembo documentation on [Data Migration](/docs/getting-started/postgres_guides/how-to-copy-data-in-postgres).

#### Best Practices and Recommendations

-   **Backup Verification**: Always verify the integrity of the backup file before proceeding.
-   **Network Security**: Ensure secure network channels (like VPNs or SSH tunnels) during data transfer.
-   **Performance Tuning**: For large databases, consider tuning parameters like `maintenance_work_mem` and `wal_buffers` during import/export for faster operations.
-   **Monitoring**: Monitor the process for any errors or warnings in the PostgreSQL logs.
-   **Downtime Planning**: Be aware of the potential downtime during migration and plan accordingly.

### Moving Data Between Databases Within the Same PostgreSQL Instance

#### Step-by-Step Guide

1. **Preparation**:

    - Ensure you have administrative access to the PostgreSQL instance.
    - Confirm the names of the source and target databases.

2. **Exporting Data from the Source Database**:

    - Use `pg_dump` to create a backup of the source database:
        ```sql
        pg_dump -U [username] -d [source_database] -F c -b -v -f "[backup_file].dump"
        ```
    - Replace `[username]`, `[source_database]`, and `[backup_file]` with appropriate values.

3. **Importing Data into the Target Database**:

    - Use `pg_restore` to load the backup into the target database:
        ```sql
        pg_restore -U [username] -d [target_database] -v "[backup_file].dump"
        ```
    - Replace `[username]`, `[target_database]`, and `[backup_file]` with relevant details.

4. **Verification**:
    - Verify the transferred data in the target database.

#### Best Practices and Recommendations

-   **Data Consistency**: Ensure that the target database schema is compatible with the source data.
-   **Testing**: Test the data transfer process in a staging environment before applying to production.
-   **Transaction Management**: Use transactions where possible to maintain atomicity.
-   **Cleanup**: After successful migration, consider cleaning up any redundant data in the source database.
-   **Security**: Ensure proper roles and permissions are set in the target database to maintain data security.

Following these steps and adhering to the best practices should provide a smooth experience in moving data between PostgreSQL instances and databases.
