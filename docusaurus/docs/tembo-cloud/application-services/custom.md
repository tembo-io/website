---
sidebar_position: 999
tags:
  - tools
  - containers
  - kubernetes
---

# User Defined Applications

Tembo Cloud allows you to run your own applications alongside your Postgres instance. This allows you to run custom applications that can interact with your Postgres instance, or other services.

As an implementation detail, Tembo Application Services consist of Kubernetes resources that are deployed in the same namespace as your Tembo Postgres instance. This consists of common Kubernetes resources such as Deployments, Services, ConfigMaps, and Ingress, etc.

The Tembo Platform API provides you with an abstraction over the Kubernetes API, allowing you to manage your application services via the Tembo Platform API. Some, but not all of those resources are exposed to you via the Tembo Platform API, and this guide will walk you through what is currently available. Over time, the Tembo Platform API will mature and expose more of the underlying Kubernetes resources to you.

## Creating a User Defined Application

The Tembo Platform API defines applications by their `AppType`. The `AppType` is an enum, with variants such as RestAPI, Embeddings, graphQL...and `custom`, and the `custom` variant is used to define a user defined application. The `custom` variant allows the user to configure all of the attributes of the [AppService](https://docs.rs/controller/latest/controller/app_service/types/struct.AppService.html#fields) type defined in the tembo-operator.

Additional notes about the attributes in the AppServices spec:

For user defined containers, you must specify the key `custom` in the `app_services` array.

- `image`: The container image to run. This can be any container image that is publicly accessible, or a private image that is accessible to the Tembo Platform API.

- `name`: The name of the application service. This is used to identify the application service in the Tembo Platform API. It is unique across all application services in the same namespace, and there is one namespace per Tembo Postgres instance.

- `routing`: The routing configuration for the application service. This is an array of `Routing` objects, which define how the application service is exposed to the outside world. See also the [Routing](https://docs.rs/controller/latest/controller/app_service/types/struct.Routing.html) spec. The `Routing` object has the following fields:
  - `port`: The port that the application service listens on.
  - `ingressPath`: The path that the application service is exposed on. This is used to route traffic to the application service.
  - `middlewares`: An array of references to middleware names that you want applied to the application service. The middleware names are defined in the `middlewares` field of the `AppService` spec, (see below).
- `middlewares`: An array of middleware objects that are applied to the application service. The middleware objects have the following fields. Supported middlewares can be found [here](https://docs.rs/controller/latest/controller/app_service/types/enum.Middleware.html). These can be extended by contributing to the [Tembo Kubernetes Operator](https://github.com/tembo-io/tembo/tree/main/tembo-operator).
- `env`: An array of environment variables that are passed to the application service. These are key-value pairs that are used to configure the application service. The Postgres connection string for your Tembo Postgres instance can be passed into an environment variable by using `valueFromPlatform: ReadWriteConnection`.
- `resources`: The resource limits and requests for the application service. This is used to configure the amount of CPU and memory that the application service can use.
- `storage`: The storage configuration for the application service, including volumes and volume mounts. See also the [StorageConfig](https://docs.rs/controller/latest/controller/app_service/types/struct.StorageConfig.html) spec.

Below is an example deploying a python FastAPI webserver container alongside your Tembo Postgres instance. This can be applied in a PATCH request to an existing Tembo instance or used as part of any of the instance methods, to the [Tembo Platform API](https://api.tembo.io/redoc). The container image is public, and the application was designed to run on port 3000 in the container. The application is exposed publicly at `https://$YourTemboHostName/embeddings`, and those requests are mapped to the path `/v1/embeddings` and port `3000` on the container. Two environment variables are configured, along with cpu and memory requests and limits. An ephemeral storage volume is mounted at the `/models` path in the container.

```bash
export TEMBO_TOKEN=<your token>
export TEMBO_ORG_ID=<your organization id>
export TEMBO_INST_ID=<your instance id>
export TEMBO_INST_NAME=<your instance name>
```

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>

<TabItem value="curl" label="Curl">

```bash
curl -X PATCH "https://api.tembo.io/orgs/${TEMBO_ORG_ID}/instances/${TEMBO_INST_ID}" \
     -H "Authorization: Bearer ${TEMBO_TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{
  "app_services": [
    {
      "custom": {
        "image": "quay.io/tembo/vector-serve:7dc6329",
        "name": "embeddings",
        "routing": [
          {
            "port": 3000,
            "ingressPath": "/embeddings",
            "middlewares": [
              "map-embeddings"
            ]
          }
        ],
        "middlewares": [
          {
            "replacePathRegex": {
              "name": "map-embeddings",
              "config": {
                "regex": "^\\/embeddings\\/?",
                "replacement": "/v1/embeddings"
              }
            }
          }
        ],
        "env": [
          {
            "name": "TMPDIR",
            "value": "/models"
          },
          {
            "name": "XDG_CACHE_HOME",
            "value": "/models/.cache"
          }
        ],
        "resources": {
          "requests": {
            "cpu": "500m",
            "memory": "1500Mi"
          },
          "limits": {
            "cpu": "4000m",
            "memory": "1500Mi"
          }
        },
        "storage": {
          "volumeMounts": [
            {
              "mountPath": "/models",
              "name": "hf-model-vol"
            }
          ],
          "volumes": [
            {
              "ephemeral": {
                "volumeClaimTemplate": {
                  "spec": {
                    "accessModes": [
                      "ReadWriteOnce"
                    ],
                    "resources": {
                      "requests": {
                        "storage": "2Gi"
                      }
                    }
                  }
                }
              },
              "name": "hf-model-vol"
            }
          ]
        }
      }
    }
  ]
}'

```

</TabItem>

<TabItem value="py" label="Python">

```py
import requests

TEMBO_ORG = os.environ["TEMBO_ORG_ID"]
TEMBO_INST = os.environ["TEMBO_INST_ID"]
TEMBO_TOKEN = os.environ["TEMBO_TOKEN"]

resp = requests.patch(
    url=f"https://api.tembo.io/orgs/{TEMBO_ORG}/instances/{TEMBO_INST}",
    headers={"Authorization": f"Bearer {TEMBO_TOKEN}"},
    json={
        "app_services": [
            {
                "custom": {
                    "image": "quay.io/tembo/vector-serve:7dc6329",
                    "name": "embeddings",
                    "routing": [
                    {
                        "port": 3000,
                        "ingressPath": "/embeddings",
                        "middlewares": [
                        "map-embeddings"
                        ]
                    }
                    ],
                    "middlewares": [
                    {
                        "replacePathRegex": {
                        "name": "map-embeddings",
                        "config": {
                            "regex": "^\\/embeddings\\/?",
                            "replacement": "/v1/embeddings"
                        }
                        }
                    }
                    ],
                    "env": [
                    {
                        "name": "TMPDIR",
                        "value": "/models"
                    },
                    {
                        "name": "XDG_CACHE_HOME",
                        "value": "/models/.cache"
                    }
                    ],
                    "resources": {
                    "requests": {
                        "cpu": "500m",
                        "memory": "1500Mi"
                    },
                    "limits": {
                        "cpu": "4000m",
                        "memory": "1500Mi"
                    }
                    },
                    "storage": {
                    "volumeMounts": [
                        {
                        "mountPath": "/models",
                        "name": "hf-model-vol"
                        }
                    ],
                    "volumes": [
                        {
                        "ephemeral": {
                            "volumeClaimTemplate": {
                            "spec": {
                                "accessModes": [
                                "ReadWriteOnce"
                                ],
                                "resources": {
                                "requests": {
                                    "storage": "2Gi"
                                }
                                }
                            }
                            }
                        },
                        "name": "hf-model-vol"
                        }
                    ]
                    }
                }
            },  
        ]
    }
)
```

</TabItem>

</Tabs>

## Limitations

- Container images must be publicly accessible
- This means all HTTP ingress traffic is authenticated and authorized by Tembo's API Gateway, which means the HTTP header `Authorization: Bearer <your Tembo JWT>` must be valid. This is a limitation of the current implementation, and we are working on a solution to allow direct access to the application service from the internet.
- Volumes are currently ephemeral only
