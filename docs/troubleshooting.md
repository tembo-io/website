---
sidebar_position: 3
---

# Troubleshooting

## CoreDB requires PostgreSQL clients of version 14+

- [Server Name Indication](https://en.wikipedia.org/wiki/Server_Name_Indication) was introduced in version 14, and this feature is used in CoreDB to route requests to the appropriate databases
    - [Release notes](https://www.postgresql.org/docs/release/14.0/)
- Ruling out SNI versioning issues
    - This command will attempt to connect to your instance using a known, working version of psql. Replace the connection string with your connection string, found in the CoreDB UI
    
    ```
     docker run -it 
        --rm 
        --entrypoint=psql postgres:15 
        --'postgresql://postgres:***@***.data-1.use1.coredb.io:5432'
    ```
    
- If the above fails, you may have problems reaching your instance

## Checking if you can reach the CoreDB Platform

- Can you get 404 from your domain name?
    - just type their domain into browser or use curl
    - For example, `org-your-org-name-inst-your-instance-name.data-1.use1.coredb.io`
    - If you get a 404, then you have network connectivity to CoreDB

## Checking if you can reach the CoreDB Platform

- can you get 404 from your domain name?
    - just type their domain into browser or use curl
    - For example, `org-your-org-name-inst-your-instance-name.data-1.use1.coredb.io`
    - If you get a 404, then you have network connectivity to CoreDB

## Connecting from Python on ARM64 environment

- https://github.com/psycopg/psycopg2/issues/1550
- this version works:

```bash
FROM --platform=linux/arm64/v8 python:3.11
RUN pip install psycopg2-binary==2.9.6
```