---
sidebar_position: 9
---

# Running the Tembo Operator on GCP GKE

The Tembo Operator allows you to run multiple Tembo Stacks on Kubernetes. This guide shows you how to set up the Tembo
Operator on GCP GKE and provides an example of spinning up and connecting to a Postgres instance hosted on Kubernetes.

This tutorial requires the following prerequisites:

- GCP GKE Cluster configured with a storage provisioner. See the following guides if you're creating these from scratch:
  - [Getting started with GCP GKE Standard Cluster](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-zonal-cluster)
  - Your Cluster should have a minimum of 4CPU compute and 16GB memory and should have a minimum of 3 nodes. 
  - Your storage class default is set to `standard`
  - Optional: Configure your Cluster from Scratch

<details>
  <summary>These commands follow the GCP GKE guides linked above</summary>
  <div>
    <p>
      <h4>Create a Cluster using gcloud command line and replace PROJECT_NAME with the name of your project</h4>
        <code>gcloud beta container --project "PROJECT_NAME" clusters create "tembo-cluster" --zone "us-central1-c" --no-enable-basic-auth --cluster-version "1.27.3-gke.100" --release-channel "regular" --machine-type "e2-standard-4" --image-type "COS_CONTAINERD" --disk-type "pd-balanced" --disk-size "100" --metadata disable-legacy-endpoints=true --scopes "https://www.googleapis.com/auth/devstorage.read_only","https://www.googleapis.com/auth/logging.write","https://www.googleapis.com/auth/monitoring","https://www.googleapis.com/auth/servicecontrol","https://www.googleapis.com/auth/service.management.readonly","https://www.googleapis.com/auth/trace.append" --num-nodes "3" --logging=SYSTEM,WORKLOAD --monitoring=SYSTEM --enable-ip-alias --network "projects/tembo-operator-standard/global/networks/default" --subnetwork "projects/tembo-operator-standard/regions/us-central1/subnetworks/default" --no-enable-intra-node-visibility --default-max-pods-per-node "110" --security-posture=standard --workload-vulnerability-scanning=disabled --no-enable-master-authorized-networks --addons HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver --enable-autoupgrade --enable-autorepair --max-surge-upgrade 1 --max-unavailable-upgrade 0 --binauthz-evaluation-mode​=DISABLED --enable-managed-prometheus --enable-shielded-nodes --node-locations "us-central1-c"</code>
        <h1></h1> 
    </p>
    <p>
      <h4>Change the default storageclass to standard using the following commands:</h4>
        <code>tembo-operator % kubectl patch storageclass standard-rwo -p '&#123;"metadata":&#123;"annotations":&#123;"storageclass.kubernetes.io/is-default-class":"false"&#125;&#125;&#125;'</code>
        <code>tembo-operator % kubectl patch storageclass standard -p '&#123;"metadata":&#123;"annotations":&#123;"storageclass.kubernetes.io/is-default-class":"true"&#125;&#125;&#125;'</code>
    </p>
  </div>
</details>

- [just](https://github.com/casey/just) command runner installed
- [helm](https://helm.sh/) package manager installed

## Step 1: Clone the repo 

Clone the [Tembo Stacks Repo](https://github.com/tembo-io/tembo-stacks/tree/main).

```bash
git clone https://github.com/tembo-io/tembo-stacks.git
```  

## Step 2: Navigate to the `tembo-operator` directory

```bash
cd tembo-stacks/tembo-operator
```

## Step 3: Install dependencies on the Kubernetes cluster

```bash
just install-dependencies
```

## Step 4: Install the Tembo Operator into the Kubernetes cluster

```bash
just install-chart
```  

## Step 5: Deploy a Tembo Stack instance

Choose a Tembo Stack you would like to use. 

Here we are using `sample-machine-learning.yaml`, but there are [other samples](https://github.com/tembo-io/tembo-stacks/tree/main/tembo-operator/yaml).

```bash
kubectl apply -f yaml/sample-machine-learning.yaml
```  

## Step 6: Obtain connection password

Get your connection password and save it as an environment variable.

```bash
export PGPASSWORD=$(kubectl get secrets/sample-machine-learning-connection --template={{.data.password}} | base64 -d)
```  


## Step 7: Setup port-forwarding

Port Forward from your Kubernetes to your local machine.

```bash
kubectl port-forward svc/sample-machine-learning-rw 5432:5432 &
```

## Step 8: Connect

Connect to the running Postgres instance:

```bash
psql postgres://postgres:$PGPASSWORD@localhost:5432
```

## Step 9. Enjoy and ask questions!

Any questions? Feel free to ask our team in our [Slack Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw) or email [support@tembo.io](mailto:support@tembo.io).


