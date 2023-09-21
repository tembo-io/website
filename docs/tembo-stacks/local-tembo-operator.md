---
sidebar_position: 7
---

# Running the Tembo Operator Locally

The Tembo Operator allows you to run multiple Tembo Stacks on Kubernetes. This guide shows you how to set up the Tembo Operator on your local machine and provides an example of spinning up and connecting to a local Postgres instance hosted on Kubernetes.

This tutorial requires the following prerequisites:
- [KinD](https://github.com/kubernetes-sigs/kind)
- [Docker](https://www.docker.com/) running locally
- [just](https://github.com/casey/just) command runner installed
- [helm](https://helm.sh/) package manager installed

1. Clone the [Tembo Stacks Repo](https://github.com/tembo-io/tembo-stacks/tree/main)
```bash
git clone https://github.com/tembo-io/tembo-stacks.git
```

2. Navigate to the tembo-stacks directory
```bash
cd tembo-stacks/tembo-operator
```

3. Start the Kubernetes cluster with our recipe
```bash
just start-kind
```

4. Install our charting
```bash
just install-chart
```

5. Choose a Tembo Stack you would like to use. We are using `sample-coredb.yaml` but there are other options [here](https://github.com/tembo-io/tembo-stacks/tree/main/tembo-operator/yaml)
```bash
kubectl apply -f yaml/sample-coredb.yaml 
```

6. Get your connection password (the trailing `%` is not part of the password)
```bash
kubectl get secrets/sample-coredb-connection --template={{.data.password}} | base64 -D
```

7. Port Forward from your Kubernetes to your local machine
```bash
kubectl port-forward svc/sample-coredb-rw 5432:5432 
```

8. Open another terminal and connect to Postgres
```bash
psql postgres://postgres:<password>@localhost:5432
```

9. Enjoy your Tembo Postgres Stack!
