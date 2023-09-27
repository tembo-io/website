---
sidebar_position: 8
---

# Running the Tembo Operator Locally

The Tembo Operator allows you to run multiple Tembo Stacks on Kubernetes. This guide shows you how to set up the Tembo Operator on your local machine and provides an example of spinning up and connecting to a local Postgres instance hosted on Kubernetes.

This tutorial requires the following prerequisites:

- [KinD](https://github.com/kubernetes-sigs/kind)
- [Docker](https://www.docker.com/) running locally
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

## Step 3: Start the Kubernetes cluster

```bash
just start-kind
```  

## Step 4: Install the Tembo Operator into the Kubernetes cluster

```bash
just install-chart
```  

## Step 5: Deploy a Tembo Stack instance

Choose a Tembo Stack you would like to use. 

We are using `sample-machine-learning.yaml` but there are [other samples](https://github.com/tembo-io/tembo-stacks/tree/main/tembo-operator/yaml)

```bash
kubectl apply -f yaml/sample-machine-learning.yaml
```  

## Step 6: Obtain connection password

Get your connection password and save it as an environment variable.

```bash
export PGPASSWORD=$(kubectl get secrets/sample-coredb-connection --template={{.data.password}} | base64 -D)
```  

## Step 7: Setup port-forwarding

Port Forward from your Kubernetes to your local machine.

```bash
kubectl port-forward svc/sample-coredb-rw 5432:5432 &
```  

## Step 8: Connect

Connect to the running Postgres instance:

```bash
psql postgres://postgres:$PGPASSWORD@localhost:5432
```  

## Step 9. Enjoy and ask questions!

Any questions? Feel free to ask our team in our [Slack Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw) or email [support@tembo.io](mailto:support@tembo.io).
