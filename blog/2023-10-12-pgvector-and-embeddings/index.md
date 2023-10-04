---
slug: pgvector-and-embedding-solutions
title: "pgvector and embedding solutions"
authors: [rjzv]
tags: [postgres, extensions, embedding, vector, pgvector]
image: ./distance-vectors.png
---

Language Models are models designed to understand and generate human language. Models like GPT-4 and its predecessors have become very popular because of their outstanding capability to handle natural language and generate human-like responses.

Behind language models lay concepts like vector embeddings. This post will explore embeddings and how they can be used in Postgres through the pgvector extension.


## Representing text as vectors

A vector can represent many things, for example, the position of a character in a 3D video game, the position of a pixel in your screen, the force applied to an object, a color in the RGB space, or even words…

Word embedding refers to the technique by which words can be represented as vectors. These days, [OpenAI embeddings](https://platform.openai.com/docs/models/embeddings) are very popular. However, other alternatives exist. The following are some examples:

- [word2vect](https://arxiv.org/abs/1301.3781)
- [Glove](https://aclanthology.org/D14-1162.pdf)
- [FastText](https://fasttext.cc/docs/en/support.html)
- [ELMo](https://arxiv.org/abs/1802.05365v2)

Similarly, entire sentences can be represented as vectors using models such as [Sentence-BERT](https://sbert.net/).

These models can be accessed through libraries for different languages. For example, the following Python snippet shows how to obtain the vector embeddings of three sentences using Sentence-BERT:

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


## Postgres meets Language Models

Models do an excellent job of converting your information into vectors, but those models are pre-trained with general data. They can understand human language but don’t know specific details about your company, for example. Even if that’s the case, the data with which the model was trained may not be current. So, creating a chatbot based only on the pre-trained data won’t be helpful for your customers.

The concept of [RAG (Retrieval-Augmented Generation)](https://arxiv.org/abs/2005.11401) acknowledges this limitation.

One way of overcoming that limitation is to store your company's knowledge base in a database.... preferably in a vector database.

Specialized vector databases include:
 - [Milvus](https://milvus.io/)
 - [Qdrant](https://qdrant.tech/)
 - [Marqo](https://github.com/marqo-ai/marqo)
 - [Weaviate](https://weaviate.io/)
 - [Pinecone](https://www.pinecone.io/)

However, you probably want to stick to your [Postgres database](https://www.amazingcto.com/postgres-for-everything/). Postgres is not in itself a vector database, but at least a couple of Postgres extensions exist to allow working with vectors:

- [`pgvector`](https://github.com/pgvector/pgvector)
- [`pg_embedding`](https://github.com/neondatabase/pg_embedding)


## What is pgvector?

[pgvector](https://github.com/pgvector/pgvector) is a Postgres extension that helps work with vectors and stores them in your postgres database. It offers functions for calculating the distance between vectors and for similarity search.


## What do we mean by the distance between vectors?

Given two vectors v and w, the distance between them is the length of the vector v-w.

Say we have a vector v=(7,5) and w=(4,1) as shown in the following image:

![Example of Euclidean distance](./distance-vectors.png)

The vector v-w is (3,4). What’s the length of such a vector? Well, one way of calculating the length is by using the Pythagorean theorem: sqrt (3^2 + 4^2) = sqrt (9 + 16) = sqrt (25) = 5 units. This is called the euclidean distance.

```console
postgres=# select  l2_distance('[7,5]','[4,1]');
 l2_distance
-------------
           5
(1 row)

```

Other important metrics are:
- Cosine similarity,
- Inner product

These metrics are essential because an important assumption when using embeddings is that, for example, similar sentences are located closer to each other when translated to the vector space.

## A quick pgvector example

I converted all of Tembo’s blogs into document vectors using this Python script that uses the [langchain framework](https://python.langchain.com)

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


The resulting vectors have [384 dimensions](https://sbert.net/docs/pretrained_models.html#model-overview).


## Finding similar text

Using pgvector we can search content that is similar to a query. For example, we can find content related to `postgres 16`.

First, we obtain the vector:

```python
from langchain.embeddings import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(model_name='all-MiniLM-L6-v2')
print embeddings.embed_query(“What is new in postgres 16")
```

Then we can execute the following query in psql:

```sql
SELECT document, 1-(embedding <=> '[<your_vector_here>]') as cosine_similarity
FROM langchain_pg_embedding
ORDER BY cosine_similarity DESC
LIMIT 2;
```

In my case, the most similar chunk of text was:


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

The problem with the above query is that it calculates the cosine distance to all vectors in the database. That is not very efficient:

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

Fortunately, pgvector also provides specialized vector indexes, for example:

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

However, these specialized indexes are used for `approximate nearest neighbor search`. We’ll explore what that means in a future blog post. 

In any case, the preceding example showed how to generate vectors from a bunch of articles and find relevant information by translating the text to the vector space. 


## Conclusion

In this post, we explored pgvector from a user's perspective. We explored how embeddings can be used to answer queries utilizing a vector database.

I invite everyone to try pgvector and sentence embeddings extending the example in this post. What other uses could this technology have? Let us know your thoughts in [@tembo_io](https://twitter.com/tembo_io)

