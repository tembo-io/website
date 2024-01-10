---
sidebar_position: 1
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

```yaml
securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - ALL
  privileged: false
  readOnlyRootFilesystem: true
  runAsNonRoot: true
```

Network isolation is handled with Kubernetes network policies, which are handled by [Calico](https://docs.tigera.io/calico/latest/reference/installation/api). Each server is in an isolated namespace, with a default deny-all network policy. Network access is permitted on a case-by-case basis, and the configurations are open source in [this file](https://github.com/tembo-io/tembo/blob/main/tembo-operator/src/network_policies.rs).

## Data storage

For instances deployed to an Amazon Web Services (AWS) region, the data and extensions of each instance are stored in a dedicated Elastic Block Storage volume (EBS gp3). The volumes are encrypted with [AES-256 using AWS-managed keys](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html).

## Network connections

Postgres connections are encrypted and authenticated inside each customer's database. When an end user connects to their Tembo Cloud instance, they are establishing an encrypted TLS session with their Postgres server. There is no part of the network that decrypts the user's connections, and connections are routed into the correct database using [Server Name Indication](https://https.cio.gov/sni/), which is an extension of TLS that allows for routing connections to different hosts without decrypting the traffic. Likewise, username / password authentication to Postgres is performed in the customer's database.

### SSL and certificates

Tembo Cloud supports [Postgres Connection sslmode](https://www.postgresql.org/docs/current/libpq-ssl.html) `require`, `verify-ca`, and `verify-full`. Users cannot connect to their database without using encryption. For a guide on how to connect with these modes, please see the [Tembo sslmode documentation](/docs/tembo-cloud/security-and-authentication/connecting-with-stronger-sslmode).

Tembo uses a self-signed certificate authority (CA) to issue unique certificates for each Tembo Instance. The CA is managed with [cert-manager](https://cert-manager.io/). All Tembo Instances are issued unique certificates with no wildcard domains. A self-signed CA is used instead of a publicly trusted CA so that Tembo can manage the CA used to sign leaf certificates for each Tembo Instance, allowing for scalable certificate management. Public CAs will not issue leaf certificates quickly enough or in high enough volume to allow for a platform-as-a-service use case, where each database will have unique certificates.

The certificate infrastructure is configured like this:

```yaml
---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: selfsigning-postgres-ca-issuer
spec:
  selfSigned: {}
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: postgres-selfsigned-ca
  namespace: cert-manager
spec:
  commonName: data-1.use1.tembo.io
  subject:
    organizations:
      - tembo
    organizationalUnits:
      - engineering
  dnsNames:
    - data-1.use1.coredb.io
    - data-1.use1.tembo.io
  isCA: true
  issuerRef:
    group: cert-manager.io
    kind: ClusterIssuer
    name: selfsigning-postgres-ca-issuer
  privateKey:
    algorithm: ECDSA
    size: 256
  secretName: postgres-ca-secret
---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: postgres-server-issuer
spec:
  ca:
    secretName: postgres-ca-secret
```

Above, we use a self-signed ClusterIssuer to create a self-signed CA Certificate. Then, another ClusterIssuer is created to issue certificates for Tembo Instances using that CA.

Each tembo instance will have certificates created, for example like this:

```yaml
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: instance-name
  namespace: namespace
spec:
  dnsNames:
    - instance-name.data-1.use1.tembo.io
    - instance-name-rw
    - instance-name-rw.namespace
    - instance-name-rw.namespace.svc
    - instance-name-r
    - instance-name-r.namespace
    - instance-name-r.namespace.svc
    - instance-name-ro
    - instance-name-ro.namespace
    - instance-name-ro.namespace.svc
    - instance-name-rw
  issuerRef:
    group: cert-manager.io
    kind: ClusterIssuer
    name: postgres-server-issuer
  secretName: ...
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: instance-name
  namespace: namespace
spec:
  commonName: streaming_replica
  issuerRef:
    group: cert-manager.io
    kind: ClusterIssuer
    name: postgres-server-issuer
  secretName: ...
```

The code to issue certificates is open source in [this GitHub repository](https://github.com/tembo-io/tembo).

## Need stronger isolation?

Tembo Cloud is designed to allow for end users to host their own Tembo Cloud _data plane_ on premise or in any cloud. In this model, end users can manage their databases using the Tembo Cloud UI or API in the normal way, while the system hosting their Postgres servers (the _data plane_) can live anywhere. The _data plane_ only requires egress network access to Tembo Cloud, and Tembo Cloud does not need network access to any _data plane_. _Data planes_ subscribe to Tembo Cloud in order to synchronize their configurations with Tembo Cloud (for example, deploying new instances, installing extensions, and so on), and the _data plane_ only reports back non-sensitive information like CPU, memory, health status, and so on to Tembo Cloud. Sensitive information like metrics, logs, and database passwords are retrieved by end users directly from the data plane, creating a seamless experience for any users with access to the private network. For example, if you are looking at metrics in Tembo Cloud, those metrics are being fetched by your browser from the _data plane_, not from Tembo Cloud. This model allows for a seamless experience while retaining an option for users who need complete control of their data.

Please reach out to customer support if you are interested in a dedicated or self-hosted _data plane_.
