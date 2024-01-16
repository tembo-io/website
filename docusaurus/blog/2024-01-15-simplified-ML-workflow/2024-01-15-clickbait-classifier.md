---
slug: text-classification
title: 'Simplify ML workflow with Tembo's ML Stack'
authors: [adam]
tags: [postgres, machine-learning, text-classification]
---

We just released the [Tembo ML Stack](htt[s://cloud.tembo.io]), which is an end-to-end solution for building machine learning applications on Postgres.

Building and serving an ML model is a complicated process involving up infrastructure, resolving dependency conflicts, and building webservers, in addition to training the model itself.
 This is a lot of work, especially for teams that do not have support by large engineering teams.
 We wrapped all of this into the Tembo ML Stack so that you can go from training to deployment in minutes, all in Postgres.

![arch](./arch.png 'ml-service')

- [postgresML](https://github.com/postgresml/postgresml) - SQL hooks into most of the popular Python machine learning libraries.
- [pg_vectorize](https://github.com/tembo-io/pg_vectorize) - a simple abstraction over vector transformations. And on Tembo cloud, gives you a hook into additional sentence transformers.
- [PostgREST](https://postgrest.org/) - lets you call functions in your database via external HTTP requests

Tembo's ML Stack give you all the tools you need for your ML project, all within Postgres.

## Frictionless ML Development with Postgres

ML workflows are generally split into three phases; exploration, model training, model serving. Exploring data within Postgres is a familiar process to many scientists, developers and engineers. But training and serving models is often done outside of Postgres, requiring additional infrastructure and engineering work. This often results in the people doing exploration and model training being different from the people who are responsible for serving the model. This can lead to a lot of friction and inefficiency in the ML workflow.

The Tembo ML Stack brings the entire ML workflow into Postgres, making it easier to build and deploy ML models.  It puts operations and model serving in the hands of the model developer.

## Model training with `pgml`

ML model developers can train and evaluate machine learning models with nothing but SQL and the PostgresML extension. Tembo Cloud comes pre-configured with the most popular open-source machine learning extension for Postgres: [PostgresML](https://github.com/postgresml/postgresml). By using this extension, you can both supervised and unsupervised machine learning models with SQL, while still using a workflow that feels comfortable to most scientists. Rather than building a data frame in R or Python, build a Postgres table with your training data. Then, pass that data into the train function from pgml. If you've worked with pytorch, xgboost, or scikit-learn, this is akin to model.train(). Training the model on Postgres uses the compute that is already provisioned for your database.

```sql
SELECT * FROM pgml.train(
    project_name => 'clickbait_classifier',
    algorithm => 'xgboost',
    task => 'classification',
    relation_name => 'titles_training_flattened',
    y_column_name => 'is_clickbait'
);
```

## A model registry built on Postgres

A machine learning model registry is vital in a ML platform as it centralizes model management, enhancing organization and accessibility. It ensures governance and compliance through detailed records of model development and performance, essential for audits. Additionally, it promotes team collaboration by streamlining model sharing and reuse, improving project efficiency. This registry is essential for maintaining order, transparency, and efficiency in machine learning workflows.

Every model that we train using the `pgml` extension is saved to Postgres. There is no need to deploy another model registry such as [MLFlow](https://mlflow.org/), and is versioned.

## Native model serving

A model registry is an important capability to have in any machine learning platform. You need 


## Orchestrating training jobs with pg_cron

Many models performance will decay over time, which means they need to be retrained as the business evolves and data changes. For example, many teams retrain their forecasting models nightly, weekly, or monthly as new data rolls in. Similarly, recommendation models are often retrained as customers and market preferences change, and as new products are released. Model developers can use the pg_cron extension to schedule training jobs. This is a simple way to orchestrate training jobs without having to implement and maintain a separate scheduler, and it very straight forward intuitive to set up.

First, create a function that cron can call.

```sql
CREATE OR REPLACE FUNCTION model_train()
RETURNS void AS $$
BEGIN
    SELECT * FROM pgml.train(
        project_name => 'clickbait_classifier',
        algorithm => 'xgboost',
        task => 'classification',
        relation_name => 'titles_training_flattened',
        y_column_name => 'is_clickbait'
    );
END;
$$ LANGUAGE plpgsql;
```

Then schedule the job with `pg_cron`;

```sql
SELECT cron.schedule(
    job_name => 'weekly-retrain',
    schedule => '0 0 * * 0',
    command => 'CALL model_train()'
);
```

We can see all of our scheduled job in the `cron.job` table.

```sql
SELECT jobid, schedule, command, jobname FROM cron.job;


 jobid | schedule  |      command       |    jobname     
-------+-----------+--------------------+----------------
     4 | 0 0 * * 0 | CALL model_train() | weekly-retrain
```

## Share publicly with PostgREST

## Try it now on Tembo Cloud
