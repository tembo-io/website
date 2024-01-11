---
slug: text-classification
title: 'Build a machine-learning clickbait classifier on Postgres'
authors: [adam]
tags: [postgres, machine-learning, text-classification]
---

With the help of a few Postgres extensions, we can build an end-to-end machine learning AP on Postgres.

Normally, this might involved setting up a bunch of infrastructure, resolving dependency conflicts, and building webservers.
 This is a lot of work, especially for teams that do not have support by large engineering teams.
 Luckily, there are several Postgres extensions and community tools that make this a lot easier.

- [postgresML](https://github.com/postgresml/postgresml) - provides postgres with hooks into most of the popular Python machine learning libraries.
- [pg_vectorize](https://github.com/tembo-io/pg_vectorize) - gives you a clean abstraction over vector transformations. And on Tembo cloud, gives you a hook into additional sentence transformers.
- [PostgREST](https://postgrest.org/) - provides a REST API for your Postgres database. Lets you call functions in your database via HTTP requests

We will piece these tools together with SQL to build an end-to-end machine learning experience, all within Postgres.

First, create a Tembo Cloud instance with the Machine Learning Stack. We recommend at least 8 vCPU and 32GB RAM instance for this example.

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

Let's set our postgres connection string in an environment variable so we can re-use it a bunch of times. You can find the Tembo org and the instance ID in the Tembo Cloud UI in the URL.

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

Let's add the embeddings service to our Tembo instance.

```bash
curl -X PATCH \
     -H "Authorization: Bearer ${TEMBO_TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{"app_services": [{"embeddings": null}]}' \
     "https://api.tembo.io/orgs/${TEMBO_ORG}/instances/${TEMBO_INST}"
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

Now that we have that function created, we can craft a SQL statement and apply it to our table.

```sql
WITH embedding_results as (
    SELECT 
        ROW_NUMBER() OVER () AS rn,
        sentence_transform
    FROM sentence_transform('titles_training', 'title', 'org-test-inst-ml-demo')
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
embedding | {-0.058323003,0.056333832,-0.0038603533,0.013325908,-0.011109264,0.010492517,-0.052566845,-0.027296204,0.047804408,0.06442312,0.039435994,-0.019316772,0.020162422,0.039854486,-0.0015520975,0.02531284,-0.06524969,-0.05538848,-0.023060005,0.0066169654,0.035967965,0.047866415,-0.05493321,-0.0033718573,-0.017675877,0.0050533246,-0.066565424,0.007516786,0.1062944,0.043667007,-0.078659415,-0.066382155,-0.0974421,0.14953314,-0.008974811,-0.046380926,0.056557525,-0.050913405,0.07219889,-0.026177727,-0.026813423,-0.024904946,-0.030696737,0.0596905,0.0069343126,0.05261133,0.01682677,0.028517837,-0.13426387,-0.0076862997,0.017102452,-0.06326257,-0.0034633286,0.057555377,0.0025229498,-0.0245171,0.0018767425,0.022280844,0.13649009,-0.06795578,0.002331664,-0.030881247,-0.05710915,-0.019142598,0.056000363,0.006210302,0.033121906,-0.06986101,0.0053541185,0.0022922107,-0.023773909,-0.016029889,0.003032488,-0.10161338,-0.004613021,-0.03648713,-0.0008599769,0.032408558,-0.018994464,-0.059149444,-0.031894125,0.014270951,0.05692849,0.006299161,-0.001959868,0.0075378157,0.025272857,-0.03879528,0.049434464,0.08017796,-0.07127319,-0.013389913,0.042767826,0.014403912,-0.027272377,0.0061531086,0.074253924,0.06169741,0.017082456,0.0036015601,-0.032929562,0.009529873,-0.10287347,-0.044819526,0.005821062,0.019935193,-0.009213438,-0.015773851,0.056187235,-0.009097783,-0.09098749,-0.03131999,0.008298577,-0.0349469,-0.035731964,0.13938737,0.06263442,0.021498635,0.030761061,-0.048678745,-0.06952543,0.009334161,0.0048434664,0.0792383,0.025489027,0.08081476,-0.0015146967,-0.0033181922,-0.010224394,-0.0581685,-0.030536288,-0.04244264,0.0082079815,-0.0014451788,-0.046140056,0.0025231028,-0.05227404,0.025592213,-0.012421529,-0.0049001444,-0.061728038,-0.0043455213,-0.056350026,-0.10649932,0.026374912,0.09459809,0.075361095,0.066348836,0.08389456,-0.03673743,0.076092206,0.022332042,-0.0029558504,-0.053310547,0.0042319247,-0.13988078,0.0086377775,0.002202777,0.0815318,0.03767454,-0.055081654,-0.024684371,0.013421579,-0.108331844,-0.0054123565,-0.060586803,-0.036669802,0.0055406187,0.029250214,0.054775365,-0.047669377,-0.031586774,0.11630385,-0.0015755807,0.029411664,-0.06875308,0.14298901,-0.0069527365,-0.07865524,0.003973616,-0.021514947,-0.055141997,-0.045962997,-0.014572593,-0.02257412,-0.012096626,-0.035054434,-0.050175462,-0.049129575,0.00075050193,-0.06143659,0.04420916,-0.03601588,0.12782551,0.0034956646,-0.05719936,-0.014841186,-0.08547803,0.022391114,-0.06580024,0.026399026,-0.03423396,-0.008375255,0.04737191,0.03613243,-0.12805253,0.014772816,0.04081545,-0.09421183,-0.0012017005,0.0816309,0.028559009,-0.008321249,-0.07851789,0.025430482,0.06344359,0.08726261,-0.025034584,-0.02195596,-0.07367842,0.010734694,0.017557902,0.08767401,-6.8125966e-33,0.048279524,-0.032719526,-0.06640266,0.016316585,0.046425533,-0.09175111,-0.10157652,0.08938732,0.078136735,0.011294263,0.06793161,-0.027102685,0.009283981,0.04505685,-0.06830146,0.06218492,-0.08274111,0.0668413,-0.03501399,-0.03932527,-0.019597877,-0.07798013,-0.0050762016,0.0763867,-0.04480684,-0.054619297,0.011105705,-0.0061384696,0.05854574,0.044343997,-0.03186539,0.06062889,-0.1281511,0.064455815,-0.08162396,-0.077357434,0.017158104,-0.013476392,-0.06632697,0.053424496,0.060418747,0.011727643,0.024813874,0.032096278,-0.03089842,0.0379675,0.09656183,0.0054825195,-0.04213503,-0.05572661,0.061696887,0.082163185,0.044632707,0.006358529,0.08357622,0.036564488,0.038837414,0.014229493,0.0494845,0.004864638,0.032733183,0.034670062,0.05577703,-0.012948649,0.017047545,-0.036515806,0.03399955,-0.011476246,0.09972862,0.020226596,-0.050777,-0.04955579,0.001091302,-0.011613292,0.07176656,-0.05339713,0.011790994,-0.059765816,0.06175529,0.039072223,-0.08459761,0.064320624,0.03268151,-0.011582075,0.059960086,-0.00046249028,-0.049256224,-0.021245403,0.052772377,0.09091808,-0.06664734,0.03003811,0.013914128,-0.013043058,-0.06545466,2.5646924e-32,-0.020471536,0.040614903,0.013942915,0.064812265,-0.010511781,0.019615723,0.018787997,-0.043926634,-0.0025283284,0.0087330155,-0.0024966446,0.03235226,0.03871786,-0.034328975,0.0020813234,-0.011104036,-0.004925143,0.0019763699,0.0044270065,-0.03296877,-0.034099925,-0.008809724,-0.014488834,-0.043869372,-0.03334987,0.018309196,-0.099868506,0.11828973,0.007699046,0.08291148,0.02640259,-0.036686577,0.012626571,-0.0065624607,-0.07775091,-0.13005526,0.002981511,0.009105528,-0.017209068,-0.069837995,-0.04481329,0.071698,0.07381045,0.017337335,0.015142549,-0.014537166,-0.023021867,-0.009104607,0.023105036,0.01271074,-0.024151757,-0.10144878,0.060199752,-0.05578722,0.022148283,0.07031317,-0.018748315,0.010023229,-0.057293613,0.02356632,-0.023348015,-0.035052363,0.040445056,-0.019527128}
```

## Prepare data for model training

Now that we have a column that contains our embeddings, we need to flatten it so that we can train a model using the [pgml](https://pgt.dev/extensions/postgresml) extension. We'll transform this table into a new table where each element in our embedding vector becomes its own column. Once again, we will use `pl/python3u` to conduct this operation.

```sql
CREATE OR REPLACE FUNCTION transform_unnest(
    relation text,
    target_column text,
    embedding_column text
)
RETURNS VOID AS
$$
import pandas as pd
import json

flat_table=f"{relation}_flattened"

plpy.notice('reading raw')
rv = plpy.execute(f'SELECT {target_column}, {embedding_column} FROM {relation}')
df = pd.DataFrame(rv[0:])
   
embedding_dim = len(df[embedding_column][0])
column_names = [f'embedd_{i}' for i in range(embedding_dim)]

plpy.notice(f'creating table: {flat_table}, dim: {embedding_dim}')
all_col_names = ", ".join(column_names)
column_defs = [f"{col} float" for col in column_names]
all_col_defs =  ', '.join(column_defs)

create_stmt = f'CREATE TABLE IF NOT EXISTS {flat_table} ({target_column} integer, {all_col_defs})'
plpy.execute(create_stmt)

all_value_ph = [f"${x}" for x in range(1, embedding_dim+1)]
all_value_ph = ", ".join(all_value_ph)
insert_stmt = f'INSERT INTO {flat_table} ({all_col_names}) VALUES ({all_value_ph})'

num_rows = df.shape[0]
row_embedding_types = ['float' for _ in range(embedding_dim)]

try:
    plpy.notice('starting insert')

    for idx, row in df.iterrows():
        if idx % 1000 == 0:
            plpy.notice(f'inserting row {idx} / {num_rows}')
        plan = plpy.prepare(insert_stmt, row_embedding_types)
        plpy.execute(plan, row[embedding_column])
except Exception as e:
    plpy.error(f'Error: {e}')

$$ LANGUAGE 'plpython3u';
```

Let's execute that function.

```sql
select transform_unnest(
    relation => 'titles_training',
    target_column => 'is_clickbait',
    embedding_column => 'embedding'
);
```

```console
NOTICE:  reading raw
NOTICE:  creating table: titles_training_flattened, dim: 384
NOTICE:  starting insert
NOTICE:  inserting row 0 / 32000
NOTICE:  inserting row 1000 / 32000
NOTICE:  inserting row 2000 / 32000
....
```

## Train a classification model using XGBoost and `pgml`

Now have a data table, `titles_training_flattened`, that is prepared for model training. Now we can train a classification model using XGBoost on this data using the `pgml` extension.

```sql
SELECT * FROM pgml.train(
    project_name => 'clickbait_classifier',
    algorithm => 'xgboost',
    task => 'classification',
    relation_name => 'titles_training_flattened',
    y_column_name => 'is_clickbait'
);

...

INFO:  Deploying model id: 1
       project        |      task      | algorithm | deployed 
----------------------+----------------+-----------+----------
 clickbait_classifier | classification | xgboost   | t
(1 row)
```

This should take only a few minutes. Check that the model exists in the local model registry.

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

There we go, a click bait classifier in Postgres!

## Serve the model w/ a REST api using PostgREST

Let's add a RestAPI to our instance. This can be done either using the Tembo Cloud UI, or via the API with the PATCH request given below.

```python
curl -X PATCH \
     -H "Authorization: Bearer ${TEMBO_TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{"app_services": [{"embeddings": null},{"http": null}]}' \
     "https://api.tembo.io/orgs/${TEMBO_ORG}/instances/${TEMBO_INST}"
```

Let's create a helper function that we can call via PostgREST. This function will take in a string, then call `vectorize.transform_embeddings()` and pass the result into `pgml.predict()` the same as we previously demonstrated.

```sql
CREATE OR REPLACE FUNCTION predict_clickbait(input_string text)
RETURNS TABLE(is_clickbait REAL)
AS $$
BEGIN
    RETURN QUERY 
    SELECT pgml.predict(
        'clickbait_classifier',
        (SELECT vectorize.transform_embeddings(
            input => input_string,
            model_name => 'all_MiniLM_L12_v2'
        ))
    ) AS is_clickbait;
END;
$$ LANGUAGE plpgsql;
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

[1] Chakraborty, A., Paranjape, B., Kakarla, S., & Ganguly, N. (2016). Stop Clickbait: Detecting and preventing clickbaits in online news media. In *Advances in Social Networks Analysis and Mining (ASONAM), 2016 IEEE/ACM International Conference on* (pp. 9-16). IEEE.
