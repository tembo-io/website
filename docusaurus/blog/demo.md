

# Clerk to Hubspot

So today we'll talk about getting data from one cloud service to another, using nothing but Postgres and a few Postgres extensions.

We use Clerk as our auth provider, and Hubspot as our CRM. We want to send a welcome email from Hubspot every time a user signs up.

```mermaid
flowchart LR
    classDef worry stroke:#A00,fill:#600
    signup[[User signup]] --> clerk[(Clerk)]
    clerk[(Clerk)] --> unknown[[???]]:::worry
    unknown[[???]]:::worry --> hubspot[(Hubspot)]
    hubspot[(Hubspot)] --> welcome[[Welcome email]]
```

Both services offer a REST API, and webhook support. Googling for this leads you towards something like Zapier (nice SEO!)

But we're going to "Just Use Postgres"

Let's begin...

---

My objective is to create contact records in Hubspot for new signups in Clerk.

Here's how we'll do it:

1. Spin up a Postgres-based data warehouse on Tembo
1. Connect Clerk to our data warehouse using the `clerk_fdw` extension 
1. Copy users data from Clerk to postgres with the `pg_cron` extension
1. Use an insert trigger to send data to Hubspot using the `pg_net` extension
1. Deploy to Tembo Cloud

```mermaid
flowchart LR
    classDef new stroke:#090,fill:#030
    signup[[User signup]]-->clerk[(Clerk)]
    clerk[(Clerk)]--clerk_fdw-->postgres[(Postgres)]
    postgres[(Postgres)]--"pg_cron"-->postgres[(Postgres)]:::new
    postgres[(Postgres)]--pg_net-->hubspot[(Hubspot)]
    hubspot[(Hubspot)]-->welcome[[Welcome email]]
```

---

## 1. Set up a Postgres-based data warehouse on Tembo

> TODO: Show process via UI

---

## 2. Set up `clerk_fdw`

Setting up `clerk_fdw` is simple:

We'll setup foreign data on our `f` schema:

> TODO: JAY

---

---

## 3. Setting up `pg_cron`

We'll ingesting data to the `i` schema

Here's the function: 

```postgresql
CREATE OR REPLACE FUNCTION i.refresh_users()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN

RAISE NOTICE 'Refreshing users from f.users to i.users';

insert into i.users
	(
		select 
			now(), 
			user_id, 
			first_name, 
			last_name, 
			email,
			TO_TIMESTAMP(created_at/1000) as created_at
		from f.users
	)
    ON CONFLICT (email) DO NOTHING
;
END;
$function$
;
```

And we'll schedule this with `pg_cron` to run every 5 minutes:

```postgresql
SELECT cron.schedule('i.refresh_users', '0/5 * * * *', 'i.refresh_users');
```

We can call the function directly to refresh the data during testing:

```postgresql
SELECT call i.refresh_users();
```

---

## 4. Send data to Hubspot via `pg_net`

Let's have a look at Hubspot's endpoint:

```
curl --request POST \
  --url https://api.hubapi.com/crm/v3/objects/contacts \
  --header 'authorization: Bearer my_token' \
  --header 'content-type: application/json' \
  --data '{
  "properties": {
    "email": "bob@bob.net",
    "lastname": "Bob",
    "firstname": "Bobnet"
  }
}'
```

We'll convert this to a postgres function, in the `h` schema (for Hubspot):

```postgresql
CREATE OR REPLACE FUNCTION h.create_contact()
RETURNS trigger AS
$$
BEGIN

PERFORM(SELECT net.http_post(
    'https://api.hubapi.com/crm/v3/objects/contacts',
    jsonb_build_object('properties', 
	    jsonb_build_object('email', NEW.email, 'lastname', NEW.last_name, 'firstname', NEW.first_name, 'tembo_source', 'Tembo Cloud Signup')),
    headers := '{"authorization": "Bearer pat-na1-e7130413-127b-45a5-b066-5b183b9763b8", "content-type": "application/json"}'::JSONB
));

RETURN NEW;
END;
$$
LANGUAGE 'plpgsql';
```

And the trigger:

```postgresql
CREATE TRIGGER i.users_insert_trigger
  AFTER INSERT ON i.users
  FOR EACH ROW
  EXECUTE FUNCTION h.create_contact();
```

---

## Deploy to Tembo Cloud

> Ideally this whole demo is executed locally from scratch, then deployed with `tembo apply` to push it all to Tembo Cloud

---

It really is that easy, and this pattern can be used with many other services.

---

Setting up Hubspot to send a welcome email required us to create a short workflow, which I'll share here:

> Show the trigger we made in Hubspot

---

That's it - no Zapier, just use Postgres.

Using Tembo's Data Warehouse stack made this super easy, with pre-installed extensions like `pg_cron` and `pg_net`. Visit cloud.tembo.io to try it out for free today!
