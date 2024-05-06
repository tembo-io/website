---
title: Tembo Operator GKE Install
sideBarPosition: 102
---

## Steps

### 1. Register/Configure domain to be used for instances

In this example we will be using `tembo-soft.com` as an example

### 2. Install Operator with Helm

Install Operator using steps [here](overview)

Make sure you use following values during installation:

```bash
controller:
  extraEnv:
    - name: DATA_PLANE_BASEDOMAIN
      value: gke.tembo-soft.com
    - name: USE_SHARED_CA
      value: "1"
```

**Note:** There is an issue installing `cert-manager` to GKE cluster with Autopilot mode turned on

### 2. Enable Backup/Restore

#### a. Create a Google Storage Bucket

* Create a Google Storage Bucket: `db-test-backup`
```bash
gcloud storage buckets create gs://db-test-backup
```
* Go to Settings --> Interoperability & create access key for service accounts

#### b. Create an instance to test backup

```bash 
cat <<EOF | kubectl apply -f -
apiVersion: coredb.io/v1alpha1
kind: CoreDB
metadata:
  name: coredb-backup
  namespace: gke-db-test
spec:
  backup:
    destinationPath: s3://gke-db-test-backup/coredb-backup
    encryption: AES256
    endpointURL: https://storage.googleapis.com
    retentionPolicy: "30"
    s3Credentials:
      accessKeyId:
        key: ACCESS_KEY_ID
        name: aws-creds
      secretAccessKey:
        key: ACCESS_SECRET_KEY
        name: aws-creds
    schedule: 0 0 * * *
    volumeSnapshot:
      enabled: false
EOF
```

#### c. Create a k8s secret to access bucket

Update the `ACCESS_KEY_ID` and `ACCESS_SECRET_KEY` below with the access key created in step a above

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: aws-creds 
  annotations: {
    kubernetes.io/service-account.name: "coredb-backup"
  }
  namespace: gke-db-test
type: kubernetes.io/service-account-token
data:
  ACCESS_KEY_ID: 
  ACCESS_SECRET_KEY: 
```

#### d. Update k8s role to give get access to secrets

```bash
kubectl edit roles coredb-backup -n gke-db-test
```

Add following at the bottom:

```bash
- apiGroups:
  - ""
  resources:
  - secrets
  verbs:
  - get
```

#### e. Verify backup

Check `db-test-backup` bucket to see if the backup is created. If not check instance pod logs to troubleshoot

```bash
kubectl logs coredb-backup -n gke-db-test
```

### 3. Test Restore

You can test restore by creating a new instance using the backup created for the previous instance.

```bash
cat <<EOF | kubectl apply -f -
apiVersion: coredb.io/v1alpha1
kind: CoreDB
metadata:
  name: coredb-restore
  namespace: gke-db-test
spec:
  backup:
    destinationPath: s3://gke-db-test-backup/coredb-restore
    encryption: AES256
    endpointURL: https://storage.googleapis.com
    retentionPolicy: "30"
    s3Credentials:
      accessKeyId:
        key: ACCESS_KEY_ID
        name: aws-creds
      secretAccessKey:
        key: ACCESS_SECRET_KEY
        name: aws-creds
    schedule: 0 0 * * *
    volumeSnapshot:
      enabled: false
  restore:
    serverName: coredb-backup
    endpointURL: https://storage.googleapis.com
    s3Credentials:
      accessKeyId:
        key: ACCESS_KEY_ID
        name: aws-creds
      secretAccessKey:
        key: ACCESS_SECRET_KEY
        name: aws-creds
```

### 3. Add Ingress

#### a. Install traefik

We recommend using traefik for ingress. You can setup traefik by running following command:

Create following files locally

```bash
cat <<EOF > traefik-values.yaml
image:
  tag: v3.0.0-beta2
logs:
  general:
    level: DEBUG
  access:
    enabled: true
service:
  type: LoadBalancer
  annotations:
    networking.gke.io/load-balancer-type: "External"
additionalArguments:
  - "--entryPoints.postgresql.address=:5432/tcp"
  - "--providers.kubernetesCRD.allowEmptyServices=true"
  - "--api=true"
  - "--api.insecure=true"
  - "--api.debug=true"
  - "--providers.file.filename=/config/postgres-catch-all.yaml"
volumes:
  - name: 'postgres-catch-all'
    mountPath: "/config"
    type: configMap
ports:
  postgresql:
    expose: true
    port: 5432
    exposedPort: 5432
    protocol: TCP
  websecure:
    expose: true
    port: 8443
    exposedPort: 8443
    nodePort: 32443
    protocol: TCP
  traefik:
    expose: true
    port: 9000
    exposedPort: 9000
    nodePort: 32431
    protocol: TCP
deployment:
  replicas: 1
resources:
  requests:
    cpu: "200m"
    memory: "100Mi"
  limits:
    cpu: "400m"
    memory: "300Mi"
EOF
```

```bash
cat <<EOF > postgres-catch-all.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: postgres-catch-all
  namespace: traefik
data:
  postgres-catch-all.yaml: |
    tcp:
      routers:
        catchAll:
          entryPoints:
            - "postgresql"
          rule: "HostSNI(`*`)"
          service: empty
      services:
        empty:
          loadBalancer:
            servers: {}
EOF
```

Install traefik using helm:

```bash
helm install --namespace=traefik --version=20.8.0 --values=./traefik-values.yaml traefik traefik/traefik
```

#### b. Test ingress

Create a new instance and fetch the instance password by running following command: 

```bash
kubectl get secrets/coredb-backup-connection -n gke-db-test --template={{.data.password}} | base64 -D
```

Use the password in the below command and you should be able to connect to it using the following command:

```bash
psql postgresql://postgres:PWD_GOES_HERE@coredb-backup.gke.tembo-soft.com:5432
```

