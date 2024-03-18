---
title: Collecting Metrics
---

Tembo Cloud shows some database metrics on [cloud.tembo.io](https://cloud.tembo.io). If you want to collect metrics from your database into your self-hosted metrics system, you can follow this guide.

## Where to find your metrics

You can find your metrics on your database's domain name, with the `/metrics` path. You must provide a Tembo authentication token in order to access these metrics. You can generate a token in Tembo Cloud [here](https://cloud.tembo.io/generate-jwt).

```bash
# Your Tembo Cloud token
TOKEN="****"

# Use the domain name from your Postgres connection string
curl -H "Authorization: Bearer ${TOKEN}" \
     https://example-db-name.data-1.use1.tembo.io/metrics
```

## Configuring Prometheus

Prometheus is a metrics server which collects metrics on a schedule. To configure Prometheus to collect metrics from a Tembo Cloud instance, you must configure the target with the authentication token.

Here is a sample Prometheus configuration file:

```
global:
  scrape_interval: 30s

scrape_configs:
  - job_name: 'example_target'
    scheme: https
    static_configs:
      # Use the domain name from your Postgres connection string
      - targets: ['example-db-name.data-1.use1.tembo.io']
    metrics_path: '/metrics'
    authorization:
      type: Bearer
      # Replace by your Tembo cloud token
      credentials: < your token here >
```

You may also avoid including the token in your configuration file by loading it from a file. Please consult [the Prometheus documentation](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config), `authorization` section of `scrape_config`.

### Prometheus quick start

Follow this part of the guide to quickly understand how to connect a Prometheus server to Tembo Cloud by example.

To quickly get up and running with a local Prometheus server, you can follow these steps:

-   Install Docker
-   Generate a [Tembo authentication token](https://cloud.tembo.io/generate-jwt)
-   Create a file, `docker-compose.yml`, with the following content

```yaml
version: '3.7'
services:
    prometheus:
        image: prom/prometheus:v2.33.1
        volumes:
            - ./prometheus.yml:/etc/prometheus/prometheus.yml
        ports:
            - '9090:9090'
        command:
            - '--config.file=/etc/prometheus/prometheus.yml'
```

-   Create a file `prometheus.yml` in the same directory, with the Prometheus configuration. This should look like the configuration example in the previous section, replacing the target by your Postgres server's domain name, and the token by your Tembo Cloud token.
-   Run `docker-compose up`

Within 30 seconds, you should be able to see Prometheus is collecting the metrics if you access the local Prometheus server in your web browser here: [localhost:9090/targets](http://localhost:9090/targets).
