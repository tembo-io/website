---
slug: secure-embeddings-in-postgres
title: 'Secure Embeddings in Postgres without the OpenAI Risk'
authors: [darren]
tags: [postgres, extensions]
image: './internalData.png'
---

Generating external embeddings—using OpenAI, for example—is a risk.

It’s a reasonable, logical risk—one that many of us willingly embrace when it comes to vector search and other AI-powered operations. However, the fact remains that it is still a _risk_. In order to make use of OpenAI embeddings, your data has to leave your secure environment; for many of our organizations, that risk simply isn’t on the table.

Which means that if you want vector search, you’re stuck building, managing, and orchestrating the whole thing yourself…until now anyway.

At Tembo, we recently released a new version of [pg_vectorize](https://github.com/tembo-io/pg_vectorize) and talked about how you can use it to perform vector searches using [just two commands](https://tembo.io/blog/introducing-pg_vectorize). Simple, straightforward, and powerful, this method checks all the boxes for a lot of us, but relies on OpenAI for the embeddings. Today, we want to show you an alternative that keeps all your data safely within your Postgres instance, but with that same `pg_vectorize` simplicity and convenience.

Interested? Thought so. Darren walks us through it right here:

<div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', marginBottom: '5%'}}>
  <iframe
    style={{ position: 'absolute', top:'10px', width: '100%', height: '100%' }}
    width="100%"
    height="400"
    src="https://www.youtube.com/embed/Sv6PPDcG25A?si=CrUwdxa12aOGODyl"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen>
  </iframe>
</div>

Let’s dig in a little more.

## Vector Search, Simplified

As we mentioned earlier, our original reason for creating pg_vectorize was to simplify this vector search process. If you’re using Postgres, there’s no reason why you should have to employ multiple tools, manage external services, or bring on extra vendors just to make vector search possible. We took that long, complex process you’ll find in most “how to create vector search” how-to articles and automated it.

With Tembo, once your instance is created (and check out the [docs](/docs/getting-started/getting_started) if you need help with that), you can build your vector search query in just two commands. We’re using a table with some popular brands as an example:

```json
[
	{ "id": 1, "name": "Nike", "industry": "Leading sportswear brand" },
	{ "id": 2, "name": "Apple", "industry": "Technology and electronics" },
	{
		"id": 3,
		"name": "Coca-Cola",
		"industry": "World-famous beverage company"
	},
	{ "id": 4, "name": "Adidas", "industry": "Sports and lifestyle brand" },
	{
		"id": 5,
		"name": "Google",
		"industry": "Internet and technology services"
	}
    ...
]
```

Now, to search this table, we’ll be using an open source extension we built named [pg_vectorize](https://github.com/tembo-io/pg_vectorize). We’ll create a job named “brands_search,” on that “brands” table, and we want the query to look at the columns “brand name” and “description.”

```sql
select vectorize.table(
job_name => 'brands_search',
"table" => 'brands',
primary_key => 'id',
columns => ARRAY['brand_name', 'description'],
transformer => 'all_MiniLM_L12_v2'
);
```

If you saw our `pg_vectorize` post a couple of weeks ago, you’ll notice something different here. Rather than making use of an OpenAI endpoint to generate the embeddings, you’ll notice that we’re using an open source embeddings model instead—this one happens to be from HuggingFace (but you’re not limited to that model either). From there, we simply set up a new job, and run the query as normal, generating our results with their corresponding similarity score:

```sql
SELECT * FROM vectorize.search(
job_name => 'brands_search',
query => 'fashion and cars',
return_columns => ARRAY['id', 'brand_name'],
num_results => 3
);
```

Simple and straightforward, no hassle necessary.

## Privacy and Security Matter

Of course, this does beg the “Why?” question a bit. After all, we did poke the bear at the beginning of this article by saying that OpenAI is a risk. At Tembo, we use tools like OpenAI regularly, and have nothing against them—they’re fantastic tools, and we are big fans.

That said, our statement upfront is still _true_. Your data is leaving your secure, private environment:

![externalData](./externalData.png 'externalData')

All of us know (but sometimes forget—or want to!) that any time _your_ data leaves _your_ environment, it is a risk. Anything can happen out there, and for some organizations, those risks simply aren’t worth it. This model matters because it allows for your data to stay completely secure and private within your environment, while still having the transformative power of pg_vectorize:

![internalData](./internalData.png 'internalData')

Obviously there’s a lot more you can do with this, but the reality is that your vector search \_doesn’t \_have to be complicated or a security risk, thanks to Tembo and pg_vectorize. Try it out for yourself at [Tembo Cloud](https://cloud.tembo.io).
