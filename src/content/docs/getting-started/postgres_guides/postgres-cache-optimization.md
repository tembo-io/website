# Postgres **Cache Optimization Guide**

Effective cache optimization is crucial for enhancing the performance of PostgreSQL databases, especially when working with Tembo's enhanced platform. Properly configured cache settings can significantly reduce disk I/O, leading to faster query responses. This guide provides a detailed approach to optimize cache settings in Tembo, covering both how to enable and configure this feature, and best practices for fine-tuning it according to your workload.

With [Tembo Stacks](http://localhost:4321/docs/product/stacks/intro-to-stacks), optimal PostgreSQL settings are automatically configured. Please refer to the [Stacks Documentation](http://localhost:4321/docs/product/stacks/intro-to-stacks) for more details.

## **Enabling and Configuring Cache Settings in Tembo**

### **Step 1: Accessing the Configuration File**

To begin optimizing the cache, you need to access the PostgreSQL configuration file (**`postgresql.conf`**), which contains cache-related parameters.

```bash
# Access the postgresql.conf file
vim /var/lib/pgsql/data/postgresql.conf
```

### **Step 2: Configuring Key Cache Parameters**

Inside the configuration file, focus on the following parameters for cache optimization:

```sql
-- Set shared_buffers to allocate memory for shared data
shared_buffers = '2GB'

-- Adjust effective_cache_size to guide the planner's estimates
effective_cache_size = '4GB'

-- Configure work_mem for internal sort operations and hash tables
work_mem = '50MB'

-- Set maintenance_work_mem for maintenance tasks
maintenance_work_mem = '256MB'
```

Replace the values based on your system's RAM and workload requirements.

### **Step 3: Applying the Configuration Changes**

After setting the cache parameters, save the file and restart the PostgreSQL service to apply the changes.

```bash
# Restart PostgreSQL service
systemctl restart postgresql
```

## **Best Practices for Cache Optimization in Tembo**

1. **Shared Buffers**:
    - Generally, set **`shared_buffers`** to around 25% of the total memory, but not more than 32GB, even on systems with a large amount of RAM.
2. **Effective Cache Size**:
    - Set **`effective_cache_size`** to approximately 50%-75% of your total memory. This helps the planner in optimizing disk I/O.
3. **Work Memory**:
    - **`work_mem`** is critical for performance. Set it high enough for your largest queries, but be mindful of the total number of connections and query complexity, as each active query can use this amount of memory for every sort, hash, merge, and other memory-intensive operation necessary for execution.
4. **Maintenance Work Memory**:
    - A higher **`maintenance_work_mem`** can speed up maintenance tasks like **`VACUUM`**, **`CREATE INDEX`**, and **`ALTER TABLE ADD FOREIGN KEY`**. However, avoid setting it to a very high value to prevent the risk of out-of-memory conditions.
5. **Monitoring Cache Usage**:
    - Regularly monitor cache usage and hit ratios. A low cache hit ratio indicates that you may need to increase your cache size.
6. **Balancing Resources**:
    - Balance the cache settings with other memory demands, such as maintenance tasks and OS-level caching.
7. **Tuning According to Workload**:
    - Different workloads may benefit from different cache settings. Regularly review and adjust these settings based on the current workload.

With [Tembo Stacks](http://localhost:4321/docs/product/stacks/intro-to-stacks), optimal PostgreSQL settings are automatically configured. Please refer to the [Stacks Documentation](http://localhost:4321/docs/product/stacks/intro-to-stacks) for more details.
