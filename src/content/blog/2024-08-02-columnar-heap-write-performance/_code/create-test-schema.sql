--
-- CREATE TABLES
--

CREATE EXTENSION timeseries CASCADE;

CREATE TABLE IF NOT EXISTS divvy_trips (
    ride_id             TEXT NOT NULL,
    rideable_type       TEXT NULL,
    started_at          TIMESTAMP NOT NULL,
    ended_at            TIMESTAMP NOT NULL,
    start_station_name  TEXT,
    start_station_id    TEXT,
    end_station_name    TEXT,
    end_station_id      TEXT,
    start_lat           FLOAT,
    start_lng           FLOAT,
    end_lat             FLOAT,
    end_lng             FLOAT,
    member_casual       TEXT
) PARTITION BY RANGE (started_at);

SELECT enable_ts_table(
    target_table_id => 'divvy_trips',
    partition_duration => '1 month',
    initial_table_start => '2020-01-01'
);

CREATE UNLOGGED TABLE IF NOT EXISTS chungus (LIKE divvy_trips);

CREATE UNLOGGED TABLE IF NOT EXISTS sample_data (
    id         INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    test_type  TEXT NOT NULL,
    storage    TEXT NOT NULL,
    row_count  INT NOT NULL,
    duration   INTERVAL NOT NULL
);

--
-- CREATE PROCEDURES
--

/**
* Sets the storage of all divvy_trips tables to columnar or heap
*/
CREATE OR REPLACE PROCEDURE sp_set_storage(p_storage TEXT) AS
$$
DECLARE
  part_tab REGCLASS;
BEGIN
    IF p_storage NOT IN ('heap', 'columnar') THEN
        RAISE EXCEPTION 'Invalid storage type %', p_storage;
    END IF;

    FOR part_tab IN 
        SELECT oid FROM pg_class
         WHERE relname LIKE 'divvy\_trips\_%'
           AND relkind = 'r'
    LOOP
        RAISE NOTICE 'Converting %I to %', part_tab, p_storage;
        EXECUTE format($SQL$
          ALTER TABLE %I SET ACCESS METHOD %s;
        $SQL$, part_tab, p_storage);
    END LOOP;
END;
$$ LANGUAGE plpgsql;


/**
  Generates data for the chungus table for specified row count

  Will generate the amount of requested rows. The amount of time between each
  row is based on the amount of seconds since 2020-01-01. If the amount of rows
  is higher than this, it will default to one row per second, and will emit a
  warning that this was necessary, and that some rows may end up in the default
  table partition.
*/
CREATE OR REPLACE PROCEDURE sp_scale_chungus(p_rows BIGINT) AS
$$
DECLARE
    sec_span BIGINT := floor(extract(epoch from now() - '2020-01-01'));
    secs_per_row INT := sec_span / p_rows;
BEGIN
    IF secs_per_row < 1 THEN
      RAISE WARNING 'Too many rows for time period. Check default partition.';
      secs_per_row := 1;
    END IF;

    TRUNCATE TABLE chungus;

    WITH stations AS (
      SELECT id,
             format('%s Super Real Ave', id) AS station_name,
             format('SSSS%s', id) AS station_id,
             round(id / 10000.0 + 41, 4) AS lat,
             round(id / 10000.0 - 88, 4) AS long
        FROM generate_series(1, 5000) AS a(id)  
    )
    INSERT INTO chungus
    SELECT substring(upper(md5(t.id::TEXT)), 1, 16) AS ride_id,
           CASE t.id % 3
             WHEN 0 THEN 'docked_bike'
             WHEN 1 THEN 'classic_bike'
             WHEN 2 THEN 'electric_bike'
           END AS rideable_type,
           now() - t.id * secs_per_row * INTERVAL '1s' AS started_at,
           now() - t.id * secs_per_row * INTERVAL '1s' 
                 + floor(random() * 10 + 1) * INTERVAL '1 minute' AS ended_at,
           s.station_name AS start_station_name,
           s.station_id AS start_station_id,
           e.station_name AS end_station_name,
           e.station_id AS end_station_id,
           s.lat AS start_lat, s.long AS start_long,
           e.lat AS end_lat, e.long AS end_long,
           (ARRAY['casual', 'member'])[t.id % 2 + 1] AS member_casual
      FROM generate_series(1, p_rows) AS t (id)
      JOIN stations s ON (s.id = (t.id % 5000 + 1))
      JOIN stations e ON (e.id = (5000 - t.id % 5000));
END;
$$ LANGUAGE plpgsql;


/**
  Run a speed test for INSERT statements from chungus to divvy_trips

  The parameters are essentially for reporting purposes in the sample_data
  table. Runs a CHECKPOINT before starting the test.

  Parameters:
  - p_storage: Type of storage being tested (heap, columnar)
  - p_row_count: amount of rows tested
*/
CREATE OR REPLACE PROCEDURE sp_insert_test(
  p_storage TEXT, p_row_count BIGINT
) AS 
$$
DECLARE
    start_time TIMESTAMP;
    stop_time TIMESTAMP;
BEGIN
    CHECKPOINT;

    start_time := clock_timestamp();
    INSERT INTO divvy_trips
    SELECT * FROM chungus;
    stop_time := clock_timestamp();

    INSERT INTO sample_data (test_type, row_count, storage, duration)
    VALUES ('INSERT', p_row_count, p_storage, stop_time - start_time);
    COMMIT;
END;
$$ LANGUAGE plpgsql;


/**
  Run a speed test for UPDATE statements to divvy_trips

  The parameters are essentially for reporting purposes in the sample_data
  table. Runs a CHECKPOINT before starting the test.

  Parameters:
  - p_storage: Type of storage being tested (heap, columnar)
  - p_row_count: amount of rows tested
*/
CREATE OR REPLACE PROCEDURE sp_update_test(
  p_storage TEXT, p_row_count BIGINT
) AS 
$$
DECLARE
    start_time TIMESTAMP;
    stop_time TIMESTAMP;
BEGIN
    CHECKPOINT;

    start_time := clock_timestamp();
    UPDATE divvy_trips dt
       SET ended_at = ended_at + INTERVAL '1s';
    stop_time := clock_timestamp();

    INSERT INTO sample_data (test_type, row_count, storage, duration)
    VALUES ('UPDATE', p_row_count, p_storage, stop_time - start_time);
    COMMIT;
END;
$$ LANGUAGE plpgsql;


/**
  Run a speed test for DELETE statements from divvy_trips

  The parameters are essentially for reporting purposes in the sample_data
  table. Runs a CHECKPOINT before starting the test.

  Parameters:
  - p_storage: Type of storage being tested (heap, columnar)
  - p_row_count: amount of rows tested
*/
CREATE OR REPLACE PROCEDURE sp_delete_test(
  p_storage TEXT, p_row_count BIGINT
) AS 
$$
DECLARE
    start_time TIMESTAMP;
    stop_time TIMESTAMP;
BEGIN
    CHECKPOINT;

    start_time := clock_timestamp();
    DELETE FROM divvy_trips;
    stop_time := clock_timestamp();

    INSERT INTO sample_data (test_type, row_count, storage, duration)
    VALUES ('DELETE', p_row_count, p_storage, stop_time - start_time);
    COMMIT;
END;
$$ LANGUAGE plpgsql;


/**
  Coordinate execution of all tests requested against the divvy_trips tables

  This will execute five tests following these criteria:
  - Per heap or columnar storage type
  - In a loop of 1 to N for the amount of requested steps.
  - Per write type of INSERT, UPDATE, or DELETE.

  So if we want to perform 10 tests, where each test is an additional 10000
  rows, we'd test 10,000 rows, 20,000 rows, etc., up to 100,000 rows. This 
  makes it very easy to plot results to examine results by row count.

  Parameters:
  - p_steps: How many steps to execute for the test? 
  - p_scale: The amount of rows to use for each test
*/
CREATE OR REPLACE PROCEDURE sp_run_tests(
    p_steps INT, p_scale BIGINT
) AS 
$$
DECLARE
    num_rows BIGINT;
    s TEXT;
BEGIN
    FOREACH s IN ARRAY ARRAY['heap', 'columnar'] LOOP
    
        RAISE INFO '-=[ Switching to % storage ]=-', s;
        TRUNCATE TABLE divvy_trips;
        CALL sp_set_storage(s);

        FOR i IN 1..p_steps LOOP
            num_rows := i * p_scale;
            RAISE INFO 'Testing % rows', num_rows;
            RAISE INFO 'Generating row sample...';
            CALL sp_scale_chungus(num_rows);

            -- Run the test several times to denoise.
            FOR j IN 1..5 LOOP
                TRUNCATE TABLE divvy_trips;
                RAISE INFO '  - Test number %', j;
                CALL sp_insert_test(s, num_rows);
                CALL sp_update_test(s, num_rows);
                CALL sp_delete_test(s, num_rows);
            END LOOP;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
