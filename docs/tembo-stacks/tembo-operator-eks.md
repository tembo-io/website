---
sidebar_position: 8
---

# Running the Tembo Operator on AWS EKS

The Tembo Operator allows you to run multiple Tembo Stacks on Kubernetes. This guide shows you how to set up the Tembo
Operator on AWS EKS and provides an example of spinning up and connecting to a Postgres instance hosted on Kubernetes.

This tutorial requires the following prerequisites:

- AWS EKS Cluster configured with a storage provisioner. See the following guides if you're creating these from scratch:
  - [Getting started with eksctl](https://eksctl.io/getting-started/)
  - [Managing the Amazon EBS CSI driver as an Amazon EKS add-on](https://docs.aws.amazon.com/eks/latest/userguide/managing-ebs-csi.html)
  - Optional: Configure your Cluster from Scratch

<details>
  <summary>These commands follow the AWS guides linked above</summary>
  <div>
    <p>
      <h4>Create a Cluster using eksctl</h4>
        <code>eksctl create cluster --region us-east-1 --zones=us-east-1a,us-east-1b,us-east-1c,us-east-1d,us-east-1f --version 1.28</code>
        <h1></h1> 
    </p>
    <p>
      <h4>Find Cluster Name</h4>
        <code>eksctl get clusters</code>
    </p>
    <p>
      <h4>Determine OIDC Issuer ID</h4>
        <p><code>cluster_name=<i>my-cluster-name</i></code></p>
        <p><code>oidc_id=$(aws eks describe-cluster --name $cluster_name --query "cluster.identity.oidc.issuer" --output text | cut -d '/' -f 5)</code></p>
    </p>
    <p>
      <h4>Create an OIDC Identity Provider for your cluster</h4>
        <code>eksctl utils associate-iam-oidc-provider --cluster $cluster_name --approve</code>
    </p>
    <p>
      <h4>Create Amazon EBS CSI plugin IAM role</h4>
      <code>eksctl create iamserviceaccount \
    --name ebs-csi-controller-sa \
    --namespace kube-system \
    --cluster <i>my-cluster-name</i> \
    --role-name AmazonEKS_EBS_CSI_DriverRole \
    --role-only \
    --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy \
    --approve</code>
    </p>
    <p>
      <h4>Add Amazon EBS CSI add-on</h4>
        <code>eksctl create addon --name aws-ebs-csi-driver --cluster <i>my-cluster-name</i> --service-account-role-arn arn:aws:iam::<i>my-account-number</i>:role/AmazonEKS_EBS_CSI_DriverRole --force</code>
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
just --set STORAGE_CLASS_NAME gp2 install-dependencies
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
export PGPASSWORD=$(kubectl get secrets/sample-machine-learning-connection --template={{.data.password}} | base64 -D)
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
