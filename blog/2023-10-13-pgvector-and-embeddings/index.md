---
slug: pgvector-and-embedding-solutions-with-postgres
title: "Unleashing the power of vector embeddings with PostgreSQL"
authors: [rjzv]
tags: [postgres, extensions, embedding, vector, pgvector]
image: ./RAG.png
---

*Language models are like the wizards of the digital world, conjuring up text that sounds eerily human. These marvels of artificial intelligence, such as GPT-3.5, are sophisticated algorithms that have been trained on vast swathes of text from the internet. They can understand context, generate coherent paragraphs, translate languages, and even assist in tasks like writing, chatbots, and more. Think of them as your trusty digital scribe, ready to assist with their textual sorcery whenever you summon them.*

If you have used ChatGPT in the past, you probably were able to suspect that the previous paragraph was generated using it. And that's true :smiley: See the prompt [here](https://chat.openai.com/share/9fab8ac9-6e34-481d-a281-db2f00b0f7f5).

From the example above, you can witness the eloquence LLMs are capable of. Some people have been shocked so much that they became convinced that these [models were sentient](https://www.scientificamerican.com/article/google-engineer-claims-ai-chatbot-is-sentient-why-that-matters/). However, in the end, they are nothing but a large, complex series of [matrix and vector operations](https://www.youtube.com/watch?v=bCz4OMemCcA). These matrices and vectors have been trained to represent the semantic meaning of words.

In today's post, we will explore these meaning vectors and how they are related to Postgres. In particular, we are going to play with sentence transformers, vectors, and similarity search. All of that with the help of the pgvector Postgres extension.

Let’s go!


## From words to vectors

Like we said, a vector can represent many things, for example, the position of a character in a 3D video game, the position of a pixel in your screen, the force applied to an object, a color in the RGB space, or even the meaning of a word…

Word embedding refers to the technique by which words can be represented as vectors. These days, the embeddings offered by [OpenAI](https://openai.com/blog/new-and-improved-embedding-model) are very popular. However, other alternatives exist, like [word2vect](https://arxiv.org/abs/1301.3781), [Glove](https://aclanthology.org/D14-1162.pdf), [FastText](https://fasttext.cc/docs/en/support.html), and [ELMo](https://arxiv.org/abs/1802.05365v2).

Similarly, entire sentences can be represented as vectors using [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings/what-are-embeddings) or [SentenceTransformers](https://sbert.net/), for example.

These models can be accessed through libraries for different languages. The following Python snippet shows how to obtain the vector embeddings of three sentences using SentenceTransformer:

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
sentences = ['SentenceTransformers is a Python framework for state-of-the-art sentence, text and image embeddings.',
             'Pgvector is postgres extension for vector similarity search.',
             'Tembo will help you say goodby to database sprawl, and hello to Postgres.']

sentence_embeddings = model.encode(sentences)

for sentence, embedding in zip(sentences, sentence_embeddings):
    print("Sentence:", sentence)
    print("Embedding:", embedding)
    print("")
```

:::note 
The code used in this blog post can be found in [this gist](https://gist.github.com/binidxaba/2eb3bff573c6be700e4391d650a302db). :wink:
:::

The mind-blowing part is that words and sentences with a similar meaning will have similar vectors. 🤯 This characteristic is the basis of a search technique called similarity search, where we simply find the nearest embedding vectors to find texts that are similar to our query.


## Postgres meets Language Models

Models are great at generating content that seems credible, as shown earlier. However, you may have experienced cases where ChatGPT hallucinates answers or delivers out-of-date information. That's because LLMs are **pre-trained** using **general data**. And, because of that, creating a chatbot based only on the pre-trained data wouldn't be helpful for your customers, for instance.

The concept of [RAG (Retrieval-Augmented Generation)](https://arxiv.org/abs/2005.11401) acknowledges this limitation. 

One way of overcoming these problems is to store your company's knowledge base in a database.... preferably in a vector database. You could then query related content and feed that content to the LLM of your preference.

![RAG with pgvector](./RAG.png)


Specialized vector databases include [Milvus](https://milvus.io/), [Qdrant](https://qdrant.tech/), [Weaviate](https://weaviate.io/), and [Pinecone](https://www.pinecone.io/). However, you probably want to [stick to your Postgres database](https://www.amazingcto.com/postgres-for-everything/). 

Postgres is not in itself a vector database, but extensions can come to the rescue one more time... This time with [**pgvector**](https://github.com/pgvector/pgvector).

Let's use it and explore how we would query related content from a Postgres database.


## pgvector: Postgres as a vector database

[pgvector](https://github.com/pgvector/pgvector) is a Postgres extension that helps work with vectors and stores them in your postgres database. It offers functions for calculating the distance between vectors and for similarity search.

For the following demo, I converted all of Tembo’s blogs into document vectors using the following Python script that uses the [langchain framework](https://python.langchain.com).

```python
from langchain.document_loaders import TextLoader
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores.pgvector import PGVector

import os


CONNECTION_STRING = "postgresql+psycopg2://postgres:password@localhost:5432/vector_db"
COLLECTION_NAME = 'my_collection'

embeddings = HuggingFaceEmbeddings(model_name='all-MiniLM-L6-v2')
text_splitter = RecursiveCharacterTextSplitter(chunk_size = 1000, chunk_overlap = 20)

files = os.listdir('./corpus')

for file in files:
    file_path = f"./corpus/{file}"
    print(f"Loading: {file_path}")
    loader = TextLoader(file_path)
    document = loader.load()
    texts = text_splitter.split_documents(document)
    sentence_embeddings = embeddings.embed_documents([t.page_content for t in texts[:5]])

    db = PGVector.from_documents(
            embedding=embeddings,
            documents=texts,
            collection_name=COLLECTION_NAME,
            connection_string=CONNECTION_STRING)
```

It basically loads each document and then inserts them into Postgres using the [`PGVector` class](https://python.langchain.com/docs/integrations/vectorstores/pgvector). As a result, in my Postgres database called `vector_db`, I got two tables:

![Show tables](./table-list.png)

- `langchain_pg_collection`: contains information about all collections.
- `langchain_pg_embedding`: contains all the resulting vectors.

The following picture shows part of the contents of (2):

![Show vectors](./select-vectors.png)

The resulting vectors have [384 dimensions](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2).  


## Are these sentences similar?

Let’s now play with these vectors.

Using pgvector we can search content that is similar to a query. For example, we can find content related to `postgres 16`.

First, we can obtain a vector that represents a query:

```python
from langchain.embeddings import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(model_name='all-MiniLM-L6-v2')
print embeddings.embed_query(“What is new in postgres 16")
```

Then we can search vectors stored in the database that are similar to the query vector. The tool for that is [`cosine distance`](https://en.wikipedia.org/wiki/Cosine_similarity), which in pgvector is represented with the `<=>` operator:

```sql
SELECT document, 1-(embedding <=> '[<your_vector_here>]') as cosine_similarity
FROM langchain_pg_embedding
ORDER BY cosine_similarity DESC
LIMIT 2;
```

The above query retrieves vectors/chunks of text ordered by how close they are (in terms of `cosine distance`) to the query vector. In my case, the most similar chunk of text was:

> In case you missed it, Postgres 16 came out last week - and this year it
> arrived earlier than the last few years. There are many features that
> I’ve been looking forward to for the last few months and I’m excited to
> see them get into the hands of users. Before we dive into the specific
> features of this release, let’s discuss what a Postgres major release
> actually means.
> 
> [postgres-16]
> 
> Postgres Releases
> 
> The PostgreSQL Global Development Group releases a new major version
> every year with new features.
> 
> In addition, Postgres releases minor versions of each major release
> every 3 months or so with bug fixes and security fixes. No new features
> are released in minor versions, and that’s what makes major version
> releases so exciting as it’s the culmination of about a year’s worth of
> development work on the project.

Which is an excerpt from [Postgres 16: The exciting and the unnoticed](https://tembo.io/blog/postgres-16).

Let us look at what Postgres is doing behind the scenes, using `explain analyze`:

```console
Limit  (cost=28.07..28.08 rows=2 width=641) (actual time=1.069..1.071 rows=2 loops=1)
   ->  Sort  (cost=28.07..28.53 rows=181 width=641) (actual time=1.067..1.068 rows=2 loops=1)
         Sort Key: ((embedding <=> '[<your_vector>]'::vector))
         Sort Method: top-N heapsort  Memory: 28kB
         ->  Seq Scan on langchain_pg_embedding  (cost=0.00..26.26 rows=181 width=641) (actual time=0.036..0.953 rows=181 loops=1)
 Planning Time: 0.079 ms
 Execution Time: 1.093 ms
(7 rows)


```

We can observe that Postgres is sequentially scanning all rows. Then it computes the `cosine distance` for all those rows and sorts them. Finally,  it takes the first two rows.

The `sequential scan` could be avoided if we had an index. Indeed, we can create one thanks to pgvector, for example:

```sql
alter table langchain_pg_embedding alter column embedding type vector(384);

CREATE INDEX ON langchain_pg_embedding  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

```console
 Limit  (cost=5.01..5.11 rows=2 width=641) (actual time=0.175..0.179 rows=1 loops=1)
   ->  Index Scan using langchain_pg_embedding_embedding_idx2 on langchain_pg_embedding  (cost=5.01..13.49 rows=181 width=641) (actual time=0.172..0.175 rows=1 loops=1)
         Order By: (embedding <=> '[<your_vector>]'::vector)
 Planning Time: 0.154 ms
 Execution Time: 0.224 ms
(5 rows)
```

One thing to keep in mind is that these indexes are used for `approximate nearest neighbor search`. We’ll explore what that means in a future blog post. [Let us know](https://twitter.com/tembo_io) if that would be interesting for you.


## Pgvector(ize)? 

Ok, at this point you should now have a sense of what pgvector is, and how to use it together with Python. However, wouldn't it be great if the vectorizing step could happen all within Postgres?

[**Pg_vectorize**](https://github.com/tembo-io/pg_vectorize) is an extension being developed by **Tembo** that intends to streamline the process of generating vectors from the data in your Postgres tables. It uses a background worker to generate and update the embeddings in batches every *N* seconds. Also, if you need to find similar vectors, the extension can do that. All within Postgres. Isn't that a cool idea? :wink: 

I invite you to check out the repository and stay tuned.


## Conclusion

In this post, we briefly discussed the concept of `embeddings`, why they are important, and how they can be generated using one of the multiple available libraries. We also explored how to store and query the resulting vectors using Postgres and the pgvector extension.

These concepts are relevant to leveraging a knowledge base in conjunction with LLMs in an emerging technique called RAG. Of course, when implementing a real-life solution, [more factors need to be considered](ttps://medium.com/@neum_ai/retrieval-augmented-generation-at-scale-building-a-distributed-system-for-synchronizing-and-eaa29162521), and this post was just an introduction.

I invite everyone to try out pgvector (e.g. using the scripts in this post), and the different operations that it offers. Also, can you think of other uses of pgvector? Let us know your thoughts in [@tembo_io](https://twitter.com/tembo_io).

## Disclaimer

*The first paragraph in this blog post was generated using ChatGPT. [Here’s the prompt](https://chat.openai.com/share/9fab8ac9-6e34-481d-a281-db2f00b0f7f5)*

