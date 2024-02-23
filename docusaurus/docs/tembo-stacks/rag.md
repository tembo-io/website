---
sidebar_position: 5
---


# Tembo RAG

Build LLM applications without deploying new infrastructure or changing your application's language stack. Tembo's RAG Stack gives you a SQL API to building LLM applications using Retrieval Augmented Generation (RAG) techniques.

## Features

- text to embedding transformers: supports any Hugging Face sentence transformer model, privately hosted Hugging Face model, and OpenAI embedding models
- define custom prompt templates with SQL
- mix-and-match embedding models and chat-completion models by changing SQL configurations

## Build a support agent with Tembo RAG

### Setup

Navigate to [https://cloud.tembo.io](cloud.tembo.io) and create a new RAG Stack instance.

### Prepare documents

First you will need a collection of documents. In this example, the Tembo's docs and blogs will be used as the contextual basis for the application.

```bash
git clone https://github.com/tembo-io/website.git
```

Let's write a minimal script to copy all the markdown documents out of the repo and into a temporary directory.

```bash
mkdir tembo_docs

find "website/docusaurus/docs" -type f -name "*.md" -exec cp {} "tembo_docs" \;
find "website/landing/src/content/blog" -type f -name "*.md" -exec cp {} "tembo_docs" \;

There should be somewhere around 80 documents in the `tembo_docs` directory:

```bash
ls -l tembo_docs | wc -l
```

```console
79
```

Now all the contextual documents are in the `./tembo_docs` directory, which will make the next steps easier.

### Chunk documents

Most chat-completion models, like [chatgpt-3.5-turbo](https://platform.openai.com/docs/models/gpt-3-5-turbo) for example, have limits to the amount of data they can receive in a single request.
 OpenAI's gpt-3.5-turbo model only accepts 4096 tokens per request, while OpenAI's [gpt-4-turbo](https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo) accepts 128,000 tokens.
 Therefore, the documents that are submitted to the chat completion model should fit into that context window limit.

It is also important to be aware for these context windows for cost reasons. As of this writing, GPT-4 costs $0.03 per 1k input tokens and $0.06 per output 1k token.
 Assume a question like "how do I build a message queue on Postgres?" is submitted to the agent, and it submits a 1,000 token document to GPT-4 as part of the request and a 100 token response is received.
 That's approximately $0.04 per question (this also assumes usage of Tembo's self hosted transformer models for generating embeddings, which would normally accrue a cost per token on embedding the question itself).
 Generally, using the full context window will achieve a better response, but comes at great cost.

Load the documents into memory and process them into chunks using the official python sdk for Tembo, tembo-py. This library's `rag` module currently wraps the major chunking functionality from the llama-index library, but all transformation and
 search functionality is handled within Tembo Postgres.

```bash
pip install tembo-py
```

```python
from tembo_py.rag import TemboRAGcontroller

tembo_loader = TemboRAGcontroller(
    project_name="tembo_support",
    chat_model="gpt-3.5-turbo",
    connection_string="postgresql://postgres:<password>@<yourTemboHost>:5432/postgres"
)

chunks = tembo_loader.prepare_from_directory("./tembo_docs")
```

The original 80 documents are now split into nearly 500 chunks, where each chunk is <= to the context window size of the `gpt-3.5-turbo` model.

```python
> print("number of chunks: ", len(chunks))
number of chunks:  475
```

### Insert documents into Postgres

Loading the chunks into Tembo Postgres is a one-line command:

```python
connection_string = 
tembo_loader.load_documents(chunks)
```

### Initialize the agent

Now initialize the RAG project. This starts the process of generating embeddings for each chunk. This happens within Postgres on Tembo, and not in the location where the python scripts are executed. This could take some time depending on how many chunks and documents are in the project.

```python
tembo_loader.init_rag(transformer="sentence-transformers/all-MiniLM-L12-v2")
```

### Ask a question

Connect to Postgres using any sql client.

```bash
psql 'postgresql://postgres:<password>@<yourTemboHost>:5432/postgres'
```

The chat completion model only supports OpenAI (embeddings can come from more sources), for now. Enter the OpenAI API key into the configuration below.

```sql
ALTER SYSTEM SET vectorize.openai_key TO '<your api key>';

SELECT pg_reload_conf();
```

```sql
\x

postgres=# select vectorize.rag('tembo_support', 'what are tembo_stacks?') -> 'chat_response';
-[ RECORD 1 ]------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
?column? | "Tembo Stacks are pre-built, use case specific Postgres deployments that are designed to quickly deploy specialized data services in order to replace external, non-Postgres data services."
```

### Create a custom prompt


### Support

Join the Tembo Community and say hi and see how others are building on Tembo.
