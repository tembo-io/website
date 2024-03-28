---
slug: introducing-pg_vectorize
title: "Introducing pg_vectorize: Vector Search in 60 Seconds on Postgres"
authors: [adam]
tags: [postgres, vector, pg_vectorize, tembo-only]
image: './intro-pg_vectorize.png'
---


That’s right. You could have vector searches running on your existing Postgres database in less time than it takes to read this blog. Let’s see how it works:

<div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', marginBottom: '5%'}}>
  <iframe
    style={{ position: 'absolute', top:'10px', width: '100%', height: '100%' }}
    width="100%"
    height="315"
    src="https://www.youtube.com/embed/TgtINeeucy8?si=7jBlRi59mSnlnH0i"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen>
  </iframe>
</div>

Intrigued? Let’s take a look at the bigger story.

## Vector “Solutions” Aren’t Solving Anything

There are many vector “solutions” just a Google search away—Chroma, Pinecone, Redis, Postgres, and more, all fighting for your attention. Lots of people have written about using Postgres in particular as the storage layer for your vector data, and we agree with them. Unfortunately, these solutions still leave you with a _lot_ to do.

First, you get to figure out how to generate, store, update, and manage your embeddings. Loads of blogs out there that will coach you through the process of building an embeddings application in python, javascript, or your language of choice. You’ll be walked through the process of pulling data out of your database, transforming it in memory, orchestrating a few API calls, then inserting that data back into the database. Maybe you’ll bring in some fantastic tools like Dagster or Airflow to help run this on a schedule. Now you get to monitor that process and hope it doesn’t break, or otherwise you get to hire a team to keep it healthy. Congratulations, you now have embeddings for your data—you’re halfway there!

Now you get to build _more_ software. See, your existing data is set up, but you need a way for your application to search it. When a user enters something like “mobile electronic devices” into their search bar, your application will need to transform that raw text into embeddings, using precisely the same algorithm that you applied to your existing data. In other words, you get to repeat the process we just did for the entire table except now you’re doing it for the user’s request. That will give you embeddings for the text query.

_Finally_, you can use those embeddings to search the data in the table.

So are all these providers and “solutions” actually making things easier? It sure doesn’t seem like it. We think there’s a better way.


## Introducing pg_vectorize: Only Two Calls

Remember at the beginning how we said you could set up vector searches on Tembo Cloud in 60 seconds? No way you’re doing that with the long, convoluted process we just described—so we automated it. On Tembo Cloud, the whole process of setting up and managing vectors for a given table is done with an open source extension we built named pg_vectorize, using a single Postgres function call:


```
SELECT vectorize.table(
    job_name => 'product_search',
    "table" => 'products',
    primary_key => 'product_id',
    columns => ARRAY['product_name', 'description'],
);
```


So what happened here? Remember that ultimately, vectors are just arrays of floats that we're going to do linear algebra on. So we created a job, called it “product_search”, on an existing table called “products”. We want our user search queries to look at “product_name” and “description”. Tembo’s platform handles transforming these two columns into embeddings (via OpenAI embeddings endpoint) for you, and continues to monitor the table for changes. When there’s changes, embeddings are updated. The data is stored using pg vector’s vector data type, and indexed using pg vector HNSW index.

It’s as simple—actually simple—as that. One call, and we’re ready to search.

See, Postgres lets us create our own indexes via extensions, which enables us to do that search with one more SQL function call. We reference the job name we set up in the last step, provide the raw text query, and specify which columns we want returned and the number of rows. Think of this as a “select product_id, product_name from products where product_name and product_description are similar to 'our query'”.


``` sql
SELECT * FROM vectorize.search(
    job_name => 'product_search',
    query => 'accessories for mobile devices',
    return_columns => ARRAY['product_id', 'product_name'],
    num_results => 3
);
```

Then we get our results, along with the cosine similarity score for each records.

```
                                         search_results
------------------------------------------------------------------------------------------------
 {"product_id": 13, "product_name": "Phone Charger", "similarity_score": 0.8564774308489237}
 {"product_id": 24, "product_name": "Tablet Holder", "similarity_score": 0.8295404213393001}
 {"product_id": 4, "product_name": "Bluetooth Speaker", "similarity_score": 0.8248579643539758}
);
```

No management, no migrating data, no extra services or teams to hire. You can add vector search right now, with none of the hassle.

And if you don't like the defaults that have been supplied by pg_vectorize, you can override just about everything. You can transform your search query data manually via `vectorize.transform_embeddings()`, change the index on the table, and craft your own similarity search using pg vector directly. It's all open source, and you can use it the way that fits best for you.


## What Else Can It Do?

As you can imagine, quite a bit. The platform is powered by open source Postgres and Postgres extensions; pg vector, pg_vectorize, pgmq, and pg_cron and you have full access to all of these. You can change the index if you want, query the embeddings directly or change any of the parameters of these extensions. But if you just want to have vector search handled for you, then all you have to do is those two function calls.

In other words…60 seconds. That’s all it takes to try it out for yourself.

Come to [cloud.tembo.io](https://cloud.tembo.io) and create a vector db or install pg_vectorize on any instance in Tembo for yourself—and while you're at it, visit the [pg_vectorize repo](https://github.com/tembo-io/pg_vectorize) and give it a star!

Want to use an open source model instead of using OpenAI to generate your embeddings? We have something coming up for you—stay tuned!
