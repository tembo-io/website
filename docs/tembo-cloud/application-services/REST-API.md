---
sidebar_position: 2
tags:
  - api
  - tools
---

# REST API (via PostgREST)

Have an HTTP interface to your Postgres database significantly improves the rate at which you can develop applications. Sometimes developers build these CRUD webservers from scratch, but for many use cases, you can simply use [PostgREST](https://postgrest.org/en/stable/) and it is available on Tembo Cloud.

PostgREST is a well-designed and supported Postgres project built by an awesome [group of engineers](https://github.com/PostgREST/postgrest/graphs/contributors), and arguably the fastest way to get a REST service in place for your Postgres databse.

PostgREST is a standalone web server that turns your PostgreSQL database directly into a RESTful API. The immediacy with which PostgREST enables the interaction with the database eliminates the need for a middle-layer application server. By leveraging the underlying capabilities of PostgreSQL, PostgREST offers automatic API generation, allowing you to define the API's structure using the database schema, and then immediately querying it via the API endpoint.

Main Features:

- Automatic API Generation: With just a database schema, PostgREST generates a comprehensive and secure REST API without requiring additional layers of code.
- Role-Based Authentication: It integrates seamlessly with PostgreSQL's role-based access control, ensuring security and allowing granular permissions for API consumers.
- Real-time updates with WebSockets: PostgREST can push real-time updates to clients through WebSockets, enhancing responsiveness and interactivity.
- Support for Stored Procedures: Custom business logic can be incorporated directly through PostgreSQL stored procedures, making it accessible via the API.


## Enabling PostgREST

First, you will need to generate an API token so that you can communicate with your Tembo instance. Navigate to cloud.tembo.io/generate-jwt and follow the instructions to generate a token. Alternatively, you can follow the instructions [here](https://tembo.io/docs/tembo-cloud/api-authentication).

Set your Tembo token as an environment variable:

```bash
export TEMBO_TOKEN=<your token>
```

PostgREST will come configured to run in Tembo Cloud and no configuration is required. However, you optionally configure PostgREST by setting any of the [environment variables configurations](https://postgrest.org/en/stable/references/configuration.html?highlight=environment%20variables#environment-variables) supported by PostgREST.

Patch your existing Tembo instance to enable PostgREST. We'll set the the configurations to `None` so that the defaults are assigned.


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="py" label="Python">

```py
import requests

org_id = "<your org id>"
inst_id = "<your instance id>"
token = os.environ["TEMBO_TOKEN"]

resp = requests.patch(
    url=f"https://api.tembo.io/orgs/{org_id}/instances/{inst_id}",
    headers={"Authorization": f"Bearer {token}"},
    json={
        "app_services": [
            {"postgrest": None},  // default configuration
        ]
    }
)
```

</TabItem>

<TabItem value="curl" label="Curl">

```bash
curl -X PATCH \
  -H "Authorization: Bearer ${token}" \
  -H "Content-Type: application/json" \
  -d '{"app_services": [{"postgrest": null}]}' \
  "${tembo_url}/orgs/${org_id}/instances/${inst_id}"
```

</TabItem>
</Tabs>

## Using PostgREST

You can use Postgrest to conduct a number of different operations on your Postgres database.


### Read the OpenAPI schema

