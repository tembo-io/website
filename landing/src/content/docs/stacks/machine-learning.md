The Tembo Machine Learning Stack has several important Postgres extensions that make it easy to train and deploy machine learning models in Postgres.

## Container Image

This stack is built with a custom image, `ml-cnpg`, which you can find more detailed information about within the [ml-cnpg Dockerfile](https://github.com/tembo-io/tembo-images/blob/main/ml-cnpg/Dockerfile).

For interest in the other Stack-specific images, please visit the official [tembo-images repository](https://github.com/tembo-io/tembo-images).

## Extensions

-   [postgresml](https://pgt.dev/extensions/postgresml) - `pgml` allows you to train and run machine learning models in Postgres. It supports a variety of models and algorithms, including linear regression, logistic regression, decision tree, random forest, and k-means clustering. It also provides hooks into HuggingFace for downloading and consuming pre-trained models and transformers. Visit [PostgresML](https://github.com/postgresml/postgresml) for more details.
-   [pgvector](https://pgt.dev/extensions/pgvector) - `pgvector` is a vector similarity search engine for Postgres. It is typically used for storing embeddings and then conducting vector search on that data. Visit pgvector's [Github repo](https://github.com/pgvector/pgvector) for more information.
-   [pg_vectorize](https://pgt.dev/extensions/vectorize) - an orchestration layer for embedding generation and store, vector search and index maintenance. It provides a simple interface for generating embeddings from text, storing them in Postgres, and then searching for similar vectors using `pgvector`.
-   [pg_later](https://pgt.dev/extensions/pg_later) - Enables asynchronous query execution, which helps better manage resources and frees users up for other tasks.

The extensions listed above are all very flexible and support many use cases. Visit their documentation pages for additional details.

## Getting started

This tutorial will walk you through the process of training a text classification model and then deploying that model behind a REST API on Tembo Cloud.

First, create a Tembo Cloud instance with the Machine Learning Stack. We recommend 8 vCPU and 32GB RAM for this example.

## Acquire examples of click-bait and non-click-bait text

We will use the [clickbait dataset](https://github.com/bhargaviparanjape/clickbait/tree/master/dataset) for this example, which contains text that are both click-bait, and not click-bait [1]. First, download those datasets. We will use `wget` to download them, but any tool will do.

```bash
wget https://github.com/bhargaviparanjape/clickbait/raw/master/dataset/clickbait_data.gz
wget https://github.com/bhargaviparanjape/clickbait/raw/master/dataset/non_clickbait_data.gz
```

and extract them.

```bash
gzip -d clickbait_data.gz
gzip -d non_clickbait_data.gz
```

## Preparing data to load into Postgres

We will transform those two data files to make it easier to insert into Postgres. We'll use a small python script to handle this for us. This will give us a csv file with two columns, `text` and `is_clickbait`.

```python
# prep.py
import csv

# init with file header
clickbait_data = [("text", "is_clickbait")]

files = ["clickbait_data", "non_clickbait_data"]
for f in files:
    with open(f, 'r') as file:
        is_clickbait = 1 if f == "clickbait_data" else 0
        for line in file:
            # Skip empty lines
            if line.strip():
                clickbait_data.append((line.strip(), is_clickbait))

with open('training_data.csv', mode='w', newline='') as file:
    writer = csv.writer(file)
    for item in clickbait_data:
        writer.writerow(item)
```

Run it! This will create a file called `training_data.csv` with two columns; the text and a 1 or 0 indicating whether or not it is clickbait.

```bash
python3 prep.py
```

Inspecting that csv, it should look something like below. The first record is likely from the [BuzzFeed article 'Should I get Bings'](https://www.buzzfeed.com/mollieshafer/should-i-get-bings).

```bash
head -3 training_data.csv

title,is_clickbait
Should I Get Bings,1
Which TV Female Friend Group Do You Belong In,1
```

## Load training data into Postgres using `psql`

You will need a Tembo with the Machine Learning Stack. We recommend at least 8 vCPU and 32GB RAM instance for this example.
Let's set our postgres connection string in an environment variable so we can re-use it throughout this guide.
You can find the Tembo org and the instance ID in the Tembo Cloud UI in the URL.

`https://cloud.tembo.io/orgs/{TEMBO_ORG}/clusters/{TEMBO_INST}`

You can get the `TEMBO_TOKEN` from the Tembo Cloud UI by navigating to [https://cloud.tembo.io/generate-jwt](https://cloud.tembo.io/generate-jwt)

```bash
export TEMBO_CONN='postgresql://postgres:yourPassword@yourHost:5432/postgres'
export TEMBO_ORG='your Tembo organization ID'
export TEMBO_INST='your Tembo instance ID'
export TEMBO_TOKEN='your token'
```

And now we can connect to Postgres using `psql`.

```bash
psql $TEMBO_CONN
```

Create a table to store the training data.

```sql
CREATE TABLE titles_training (
    title TEXT,
    is_clickbait INTEGER
);
```

Load the data into the Postgres table using the `\copy` command.

```bash
\copy titles_training FROM './training_data.csv' DELIMITER ',' CSV HEADER;

COPY 32000
```

Inspect the data table. We should see two columns, exactly as shown below.

```sql
select * from titles_training limit 2;

                     title                     | is_clickbait
-----------------------------------------------+--------------
 Should I Get Bings                            |            1
 Which TV Female Friend Group Do You Belong In |            1
```

The dataset is approximately balanced, having about the same number of clickbait and non-clickbait titles.

```sql
select count(*) from titles_training group by is_clickbait;
 count
-------
 16001
 15999
(2 rows)
```

## Transform text to embeddings

Machine learning algorithms work with numbers, not text. So in order to train a model on our text, we need to we need to transform that text into some numbers.
There are many ways to transform text into numbers, such as [Bag of Words](https://en.wikipedia.org/wiki/Bag-of-words_model), [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf), [any many others](https://medium.com/analytics-vidhya/a-beginners-guide-to-convert-text-data-to-numeric-data-part-1-e0e15666d9e5). The natural language processing domain is rather large and for this example, we will use the [all_MiniLM_L12_v2](https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2) sentence transformer from Hugging Face.

Let's add the embeddings service to our Tembo instance. You can add it via the API like this, or you can do it in the browser on the "Apps" tab, selecting the "embeddings" app.

```bash
curl -X PATCH \
     -H "Authorization: Bearer ${TEMBO_TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{"app_services": [{"embeddings": null}]}' \
     "https://api.tembo.io/api/v1/orgs/${TEMBO_ORG}/instances/${TEMBO_INST}"
```

Add a new column to the table where we will store the embeddings for each row of text.

```sql
ALTER TABLE titles_training ADD COLUMN record_id BIGSERIAL PRIMARY KEY;
ALTER TABLE titles_training ADD COLUMN embedding double precision[];
```

We'll use the [all_MiniLM_L12_v2](https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2), which is hosted in your Tembo instance. This model will transform our text into a 384 dimensional vector. We'll save the vectors in the `embedding` column.

First, create a function using `pl/python` to handle this transformation. Let's enable that extension first.

```sql
CREATE EXTENSION plpython3u;
```

```sql
CREATE OR REPLACE FUNCTION sentence_transform(relation text, col_name text, project_name text)
RETURNS TABLE (embeddings double precision[]) AS
$$
import pandas as pd
import requests

res = plpy.execute(f'SELECT {col_name} FROM {relation}')
rv = []
for r in res:
    rv.append(r)
plpy.notice(f"Total rows: {len(rv)}")
batch_size = 5000
batches = []
for i in range(0, len(rv), batch_size):
    b = rv[i : i + batch_size]
    batches.append([i[col_name] for i in b])

embeddings_url = f"http://{project_name}-embeddings.{project_name}.svc.cluster.local:3000/v1/embeddings"

embeddings = []
total_batches = len(batches)
for i, batch in enumerate(batches):
    plpy.notice(f"Processing batch {i} / {total_batches}")

    resp = requests.post(embeddings_url, json={"input": batch})
    if resp.status_code == 200:
        req_embeddings = resp.json()["data"]
        for emb in req_embeddings:
            embeddings.append(emb["embedding"])
    else:
        plpy.error(f"Error: {resp.status_code}, {resp.text}")
return embeddings

$$ LANGUAGE 'plpython3u';
```

Now that we have that function created, we can craft a SQL statement and apply it to our table. You will need to replace the `project_name` parameter, which is the same subdomain prefix you can find in your connection string. For example, `org-test-inst-ml-demo` from the connection string `postgresql://user:password@org-test-inst-ml-demo.data-1.use1.tembo.io:5432/postgres`.

```sql
WITH embedding_results as (
    SELECT
        ROW_NUMBER() OVER () AS rn,
        sentence_transform
    FROM sentence_transform(relation => 'titles_training', col_name => 'title', project_name => 'org-test-inst-ml-demo')
),
table_rows AS (
    SELECT
        ROW_NUMBER() OVER () AS rn,
        record_id
    FROM titles_training
)
UPDATE titles_training
SET embedding = embedding_results.sentence_transform
FROM embedding_results, table_rows
WHERE titles_training.record_id = table_rows.record_id
AND table_rows.rn = embedding_results.rn;
```

Tada! Now we have a table with embeddings for each title.

```sql
\x
select * from titles_training limit 1;
```

```console
title                | Do You Have ESP
is_clickbait         | 1
record_id            | 110
embedding | {-0.058323003,0.056333832,-0.0038603533,0.013325908,-0.011109264,0.010492517,-0.052566845,-0.027296204,0.047804408,0.06442312,0.039435994,-0.019316772,0.020162422,0.039854486,-0.0015520975,0.02531284,...}
```

## Prepare data for model training

We don't want to train our model on the `record_id` column and we can't train it on the raw text in the `title` column, so let's create a new table with just the columns that we will use for training, which is the `embedding` column and the `is_clickbait` column.

```sql
CREATE TABLE title_tng as (select is_clickbait, embedding from titles_training);
```

## Train a classification model using XGBoost and `pgml`

Now have a data table, `titles_training_flattened`, that is prepared for model training. Now we can train a classification model using XGBoost on this data using the `pgml` extension.

```sql
SELECT * FROM pgml.train(
    project_name => 'clickbait_classifier',
    algorithm => 'xgboost',
    task => 'classification',
    relation_name => 'title_tng',
    y_column_name => 'is_clickbait',
    test_sampling => 'random'
);

...

INFO:  Deploying model id: 1
       project        |      task      | algorithm | deployed
----------------------+----------------+-----------+----------
 clickbait_classifier | classification | xgboost   | t
(1 row)
```

This should take only a few minutes or less. Check that the model exists in the local model registry.

```sql
\x

select * from pgml.models
```

It looks like we should expect about 85% accuracy on this model. Not bad as a start.

```console
postgres=# select id, project_id, status, metrics from pgml.models;
-[ RECORD 1 ]--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
id         | 1
project_id | 1
status     | successful
metrics    | {"f1": null, "mcc": null, "recall": null, "roc_auc": null, "accuracy": 0.8585000038146973, "fit_time": 8.021133422851562, "log_loss": 2.2558600902557373, "precision": 0.0, "score_time": 0.07048381119966507}
```

The model is trained. We can pass new titles in to the model to get them classified as clickbait or not clickbait. But first, we need to transform the new title into an embedding using the exact same transformer that we used to train the model.
For that, we will call `vectorize.transform_embeddings()` and pass the result into `pgml.predict()`. Let's try it out, a 1 response means it is clickbait, a 0 means it is not clickbait.

## Make predictions using the model

```sql
SELECT pgml.predict('clickbait_classifier',
    (select vectorize.transform_embeddings(
        input => 'the clickiest bait you have ever seen',
        model_name => 'all_MiniLM_L12_v2')
    )
);
 predict
---------
       1
(1 row)
```

```sql
SELECT pgml.predict('clickbait_classifier',
    (select vectorize.transform_embeddings(
        input => 'warmest weather on record',
        model_name => 'all_MiniLM_L12_v2')
    )
);
 predict
---------
       0
(1 row)
```

There we go, a click bait classifier in Postgres!

## Serve the model w/ a REST api using PostgREST

Let's add a RestAPI to our instance. This can be done either using the Tembo Cloud UI, or via the API with the PATCH request given below.

```python
curl -X PATCH \
     -H "Authorization: Bearer ${TEMBO_TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{"app_services": [{"embeddings": null},{"http": null}]}' \
     "https://api.tembo.io/api/v1/orgs/${TEMBO_ORG}/instances/${TEMBO_INST}"
```

Let's create a helper function that we can call via PostgREST. This function will take in a string, then call `vectorize.transform_embeddings()` and pass the result into `pgml.predict()` the same as we previously demonstrated.

```sql
CREATE OR REPLACE FUNCTION predict_clickbait(
    input_string text
) RETURNS TABLE(is_clickbait REAL) LANGUAGE sql AS $$
    SELECT pgml.predict(
        project_name => 'clickbait_classifier',
        features => (select vectorize.transform_embeddings(
            input => 'warmest weather on record',
            model_name => 'all_MiniLM_L12_v2')
        )
    )
$$;
```

We're almost done. Tell PostgREST to reload the schema so that our function can be discovered by invoking a NOTIFY command:

```sql
NOTIFY pgrst, 'reload schema';
```

Finally, we can make an HTTP request to our Tembo instance to classify our text:

`TEMBO_DATA_DOMAIN` is the same value as the host on your Postgres connection string.

```bash
export TEMBO_DATA_DOMAIN=yourTemboHost
```

```bash
curl -X POST \
    -H "Authorization: Bearer ${TEMBO_TOKEN}" \
    -H "Content-Type: application/json" \
    https://${TEMBO_DATA_DOMAIN}/rest/v1/rpc/predict_clickbait \
    -d '{"input_string": "the clickiest bait of them all"}'

[{"is_clickbait":1}]
```

It returned a 1, so we think this is clickbait!

Now we should have a machine learning model which classifies text as clickbait or not clickbait, and a REST API that we can use to make predictions.

Try it now at [cloud.tembo.io](https://cloud.tembo.io).

Sources:

[1] Chakraborty, A., Paranjape, B., Kakarla, S., & Ganguly, N. (2016). Stop Clickbait: Detecting and preventing clickbaits in online news media. In _Advances in Social Networks Analysis and Mining (ASONAM), 2016 IEEE/ACM International Conference on_ (pp. 9-16). IEEE.
