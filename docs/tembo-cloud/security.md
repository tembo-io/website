---
tags:
  - security
---

# Security

Please report security issues by emailing security@tembo.io

## User permissions

In the Tembo Cloud security model, end users are permitted arbitrary code execution as a non-root user within their server.

Users are allowed to access the Postgres superuser, perform actions that are not typically allowed in other cloud providers like `COPY FROM PROGRAM`, and execute arbitrary code with Postgres extensions. Tembo Cloud does not attempt to limit users from escaping Postgres security controls by using privileges associated with Postgres superuser, but also we provide a less-privileged user as an option. Security isolation is performed using network policies and containers. The relevant configurations for tenant isolation are open source.

## Tenant isolation

Postgres workloads are running on shared compute infrastructure.

Compute isolation is handled with containers. To address container escape attacks, Tembo Cloud does not allow root and drops all Linux capabilities from the container using Kubernetes security policies.

Kubernetes Pod configuration excerpt:
```
securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    drop:
    - ALL
  privileged: false
  readOnlyRootFilesystem: true
  runAsNonRoot: true
```

Network isolation is handled with Kubernetes network policies, which are handled by [Calico](https://docs.tigera.io/calico/latest/reference/installation/api). Each server is in an isolated namespace, with a default deny-all network policy. Network access is permitted on a case-by-case basis, and the configurations are open source in [this file](https://github.com/tembo-io/tembo-stacks/blob/main/tembo-operator/src/network_policies.rs).

## Network connections

Postgres connections are encrypted and authenticated inside each customer's database. When an end user connects to their Tembo Cloud instance, they are establishing an encrypted TLS session with their Postgres server. There is no part of the network that decrypts the user's connections, and connections are routed into the correct database using [Server Name Indication](https://https.cio.gov/sni/), which is an extension of TLS that allows for routing connections to different hosts without decrypting the traffic. Likewise, username / password authentication to Postgres is performed in the customer's database.

## Data storage

For instances deployed to an Amazon Web Services (AWS) region, the data is stored in an Elastic Block Storage General Purpose storage version 3 (EBS gp3). The volumes are encrypted with [AES-256 using AWS-managed keys](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html).

## Need stronger isolation?

Tembo Cloud is designed to allow for end users to host their own Tembo Cloud *data plane* on premise or in any cloud. In this model, end users can manage their databases using the Tembo Cloud UI or API in the normal way, while the system hosting their Postgres servers (the *data plane*) can live anywhere. The *data plane* only requires egress network access to Tembo Cloud, and Tembo Cloud does not need network access to any *data plane*. *Data planes* subscribe to Tembo Cloud in order to synchronize their configurations with Tembo Cloud (for example, deploying new instances, installing extensions, and so on), and the *data plane* only reports back non-sensitive information like CPU, memory, health status, and so on to Tembo Cloud. Sensitive information like metrics, logs, and database passwords are retrieved by end users directly from the data plane, creating a seamless experience for any users with access to the private network. For example, if you are looking at metrics in Tembo Cloud, those metrics are being fetched by your browser from the *data plane*, not from Tembo Cloud. This model allows for a seamless experience while retaining an option for users who need complete control of their data.

Please reach out to customer support if you are interested in a dedicated or self-hosted *data plane*.
