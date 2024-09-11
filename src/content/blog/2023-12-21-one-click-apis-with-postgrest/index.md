---
slug: one-click-apis-with-postgrest
title: 'One-Click RESTful APIs in Postgres'
authors: [darren]
tags: [postgres, apps]
image: './enableApp.png'
---

At Tembo, we support the things we believe in.

It’s why we’re committed to the OSS movement—it’s not just that we like Postgres (we do), but that we genuinely believe that the open-source approach is _better_. We believe it creates a better ecosystem for us all to work in, it creates a better framework for innovation, and most of all, it just creates better projects.

Projects like [PostgREST](https://github.com/PostgREST/postgrest).

For those that aren’t familiar, PostgREST is a fantastic open source project for generating a RESTful API from any existing Postgres database. Like most developers and teams, we quickly ran into a situation where we had applications that we needed to be able to talk to one another. As a company, we needed a stable, flexible API solution—and immediately had to wrestle with how to handle it. Do we build our own? If we did, we could ensure it was stable and safe, but we’d be reinventing the wheel. If we used someone else’s, it would save on work, but introduce more risk.

And like many of you, we found PostgREST and realized the problem was solved.

In fact, we loved it so much that we became a sponsor—like we said at the beginning, we support the things we believe in. Beyond that, we’ve integrated it into Tembo cloud as an app that users can enable with a single click because we want them to be able to benefit from the PostgREST team's fantastic work.

Want to see an example? No problem — Darren walks us through how it works:

<div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', marginBottom: '5%'}}>
  <iframe
    style={{ position: 'absolute', top:'10px', width: '100%', height: '100%' }}
    width="100%"
    height="400px"
    src="https://www.youtube.com/embed/YuXaJreVyrw?si=0EQ07nNFhz-9qSww"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen>
  </iframe>
</div>

For more, keep reading or check out our [docs](/docs/product/cloud/apps/rest-api).

## No SaaS, Just One Step

Let’s start with the Tembo Cloud UI–we’ll be using an instance that we’ve just set up, and if we go to the new “Apps” tab, we can enable PostgREST (among others, more to come on that!) with a single click. This also works with instances that are already up and running—you don’t have to decide ahead of time, and it’s still just a single click to enable.

![enableApp](./enableApp.png 'enableApp')

Now that it’s up and running, let’s see how it actually works. This instance we created has some data in it, and we will need a token to connect to it. We’ll set that token as a variable in our shell, along with the org id and instance id:

```bash
export TEMBO_TOKEN=<your token>
export TEMBO_ORG=<your organization id>
export TEMBO_INST=<your instance id>
export TEMBO_DATA_DOMAIN=<you Tembo domain>
```

The endpoints created are dependent on the structure of the database tables and schema, so for this one, for example, we can use a simple GET request to select from a table called `products`, which would look like this:

Request:

```bash
curl -X GET \
  -H "Authorization: Bearer ${TEMBO_TOKEN}" \
  -H "Content-Type: application/json" \
  https://{TEMBO_DATA_DOMAIN}/restapi/v1/products
```

Response:

```json
[
	{
		"uid": 1,
		"name": "ballpoint-pen",
		"category": "office-supplies",
		"unit_price": 0.75,
		"created_at": "2023-10-12T14:30:41.170505+00:00"
	},
	{
		"uid": 2,
		"name": "stapler",
		"category": "office-supplies",
		"unit_price": 2.5,
		"created_at": "2023-10-12T14:37:55.188744+00:00"
	}
]
```

In the same way, we can also use PostgREST to handle any other table/object in the database schema, which opens the door for a wide range of controls, but still without the need for complex add ons or additional services.

It’s as simple as that, and it’s thanks to the PostgREST team—[check out the repo](https://github.com/PostgREST/postgrest) and give them a star, then enable it on your next project on [Tembo Cloud](cloud.tembo.io)!
