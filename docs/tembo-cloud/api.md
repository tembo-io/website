---
sidebar_position: 4
tags:
  - api
  - authentication
---

# API

To explore the Tembo Cloud API, visit our [interactive API documentation](https://api.coredb.io/swagger-ui/#/). 

The API is under continuous development and subject to change.

:::note
CoreDB is our old company name, and the API URL will be updated soon.
:::

## Authentication

This document covers how to authenticate to the Tembo Cloud API. Before an API token feature is available, we provide a means to create a service user, then get an authentication token using that service user's email and password. The API is available for direct use at an experimental stability level, and the structure of the API will change.

## Tembo uses Clerk

Tembo is using [Clerk](https://clerk.com/) for authentication and user management. Clerk provides a way for our users to log in, and receive a JSON Web Token ("JWT"). Tembo Cloud API checks that all requests include a valid JWT from Clerk. Clerk has API tokens on their roadmap, but this feature is not currently available. While that feature is not available, this guide provides a way to create a service user using email and password, then an automated process to get a JWT token from the service user's email and password combination.

## Create a service user

During Private Beta, Tembo Cloud is invitation-only, so your service user will need to be invited. First, your service user email address will need to be allowed to join Tembo Cloud. Either Tembo Support will already have granted your company email domain access to Tembo Cloud, or you can contact support and ask to add your service user's email or company domain to our list of allowed email addresses.

To avoid accidentally signing in with your personal Tembo Cloud user when creating a new user, make sure you are not signed into Tembo Cloud, and if applicable, also not signed into your Google account in your browser. Using an incognito window or another browser for this step is recommended.

Sign up with your service user here https://accounts.tembo.io/sign-up with the email / password option

:::caution
Do not use Google, GitHub, or any other third party authentication option.
:::

Then log into the email account of your service user, and confirm.

:::info
There is no need to create a new Tembo Organization with your service user.
:::

## Invite your service user to your organization

- Log into Tembo Cloud with your personal email
- Invite your service user to your organization(s) using [this link](https://accounts.tembo.io/organization)
- In the service user's email, accept the invitation
- Log in as the service user, confirming you have access to the Tembo Organization

## Authentication an API request with the service user

- We will use the service user's email / password combination to log in to Tembo Cloud, receiving a JWT. Then, we will use the JWT in an API request to Tembo Cloud.

```shell
#!/bin/bash

# Replace with your service user email
EMAIL='steven+service-user-test@tembo.io'
# Replace with your service user password
PASSWORD='******'

LOG_IN_TOKEN=$(curl 'https://clerk.tembo.io/v1/client/sign_ins?_clerk_js_version=4.53.0' \
  -H 'authority: clerk.tembo.io' \
  -H 'origin: https://accounts.tembo.io' \
  -H 'content-type: application/x-www-form-urlencoded' \
  -c ./cookies \
  --data-urlencode "identifier=${EMAIL}" \
  --compressed | jq -r '.response.id')

JWT=$(curl "https://clerk.tembo.io/v1/client/sign_ins/${LOG_IN_TOKEN}/attempt_first_factor?_clerk_js_version=4.53.0" \
  -H 'authority: clerk.tembo.io' \
  -H 'origin: https://accounts.tembo.io' \
  -H 'content-type: application/x-www-form-urlencoded' \
  -b ./cookies \
  --data-urlencode "strategy=password" \
  --data-urlencode "password=- ${PASSWORD}" \
  --compressed | jq -r '.client.sessions[0].last_active_token.jwt')

# Sample API command to Tembo Cloud, replace with your actual command

curl "https://api.coredb.io/api/entities/all" \
  -H "authorization: Bearer ${JWT}"
```

- The above script is an example using curl and jq to query the Tembo API after logging in with Clerk.