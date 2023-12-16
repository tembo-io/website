---
sidebar_position: 8
---

# Tembo Operator Install

## Installing with Helm

Tembo provides Helm charts as a first-class method of installation on Kubernetes

### Prerequisites

- [Install Helm version 3 or later](https://helm.sh/docs/intro/install/).
- Install a supported version of Kubernetes (currently only 1.25 is supported, but newer versions should work).
- Install cert-manager [with Helm](https://cert-manager.io/docs/installation/helm/#4-install-cert-manager)
- **extra**: For monitoring, you can install the prometheus-operator using the 
[kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)
Helm chart.

### Steps

#### 1. Add the Helm repository

This repository is the only supported source of the tembo-operator charts.

```bash
helm repo add tembo https://tembo-io.github.io/tembo
```

#### 2. Update your local Helm chart repository cache:

```bash
helm repo update
```

#### 3. Install tembo-operator

To install the tembo-operator Helm chart, use the [Helm install command](https://helm.sh/docs/helm/helm_install/) as described below.

```bash
helm install \
  tembo tembo/tembo-operator \
  --namespace tembo-system \
  --create-namespace \
  --set controller.crds.create=true
```

A full list of available Helm values is on [tembo-operator's chart github page](https://github.com/tembo-io/tembo/blob/main/charts/tembo-operator/README.md).

The example below shows how to tune the tembo-operator installation by overwriting the default Helm values:

```bash
helm install \
  tembo tembo/tembo-operator \
  --namespace tembo-system \
  --create-namespace \
  --set controller.crds.create=true \ # Example: enable installation of the CRDs
  --set controller.monitoring.prometheusRule=true \  # Example: enable prometheus rules for CNPG using a Helm parameter
  --set controller.extraEnv[0].name=USE_SHARED_CA,controller.extraEnv[0].value="1" \ # Example: enable the shared CA for instance connections
  --set controller.extraEnv[1].name=DATA_PLANE_BASEDOMAIN,controller.extraEnv[1].value=localhost \ # Example: enable domain name for ingress.
  --set controller.extraEnv[2].name=ENABLE_BACKUP,controller.extraEnv[2].value="false" \ # Example: disable backups (for local use)
  --set pod-init.logLevel=debug # Example: set pod-init log level to debug
```

#### 4. Verify Installation

Once you've installed tembo-operator, you can verify it is deployed correctly by
checking the `tembo-system` namespace for running pods:

```bash
kubectl get pods --namespace tembo-system

NAME                                    READY   STATUS    RESTARTS   AGE
tembo-cloudnative-pg-55966ffbc4-x58wb   1/1     Running   0          4m24s
tembo-controller-7d498b4d5-t7j5n        1/1     Running   0          4m24s
tembo-pod-init-77c456888b-l64sr         1/1     Running   0          4m24s
```

You should see the `controller`, `pod-init`, and
`cloudnative-pg` pods in a `Running` state.

#### 5. Deploy test instance

To deploy a test instance we will need to enable the deployment via a namespace
label.  You will need to apply this label to all namespaces you wish to deploy 
an instance in.

```bash
kubectl label namespace default "tembo-pod-init.tembo.io/watch"="true"
```

Apply the following sample `CoreDB` configuration.  This will use all defaults
and will deploy a Tembo instance to your cluster.

```bash
cat <<EOF | kubectl apply -f -
apiVersion: coredb.io/v1alpha1
kind: CoreDB
metadata:
  name: test-db
spec: {}
EOF
```

```bash
kubectl get pods -n default
NAME                               READY   STATUS    RESTARTS   AGE
test-db-1                          1/1     Running   0          68s
test-db-metrics-58cf9ccf7d-wpc52   1/1     Running   0          88s
```

##### Storage Class Configuration

Depending on your cluster setup and cloud environment you are running the tembo-operator
in you will need to define a `storageClass` when configuring your Tembo instance.

By default the tembo-operator will use your `default` storage class in your cluster.
If you do not wish to use this storage class you will need to define it in the
`CoreDB` configuration.

In this example we want to use the `storageClass` named `gp3enc` to provision the
PVC's with.

```bash
kubectl get storageclass
NAME               PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
gp2 (default)      kubernetes.io/aws-ebs   Delete          WaitForFirstConsumer   false                  278d
gp3enc             ebs.csi.aws.com         Delete          WaitForFirstConsumer   true                   254d
```

```yaml
apiVersion: coredb.io/v1alpha1
kind: CoreDB
metadata:
  name: test-db
spec:
  storageClass: gp3enc
```
 
### Uninstalling with Helm

Uninstalling tembo-operator from a `helm` installation is a case of running the
installation process, *in reverse*, using the delete command on both `kubectl`
and `helm`.

```bash
helm --namespace tembo-system delete tembo
```

Next, delete the tembo-system namespace:

```bash
kubectl delete namespace tembo-system
```

Finally, delete the tembo-operator
[`CustomResourceDefinitions`](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)
using the link to the version you installed:
> **Warning**: This command will also remove installed tembo-operator CRDs. All
> tembo-operator resources (e.g. `coredbs.coredb.io` resources) will
> be removed by Kubernetes' garbage collector.

```bash
kubectl delete -f https://raw.githubusercontent.com/tembo-io/tembo/main/charts/tembo-operator/templates/crd.yaml
```

*Note:* If you used `helm` to install the CRDs with the `controller.crds.create=true`
value for the chart, then the CRDs will **NOT** have been removed and
you will need to run this final `kubectl` command to purge them from the cluster.

### helm installation

tembo-operator bundles the CRDs along with the other templates
in the Helm chart. This means that Helm manages these resources so they are
upgraded with your tembo-operator release when you use 
`controller.crds.create: true` in your values file or CLI command. We also set 
a helm annotation of `helm.sh/resource-policy: keep` which will not delete the
CRD from the cluster when you delete the helm deployment.

Benefits:

- CRDS are automatically updated when you upgrade tembo-operator via `helm`
- Same action manages both CRDs and other installation resources

Drawbacks:

- Helm values need to be correct to avoid accidental removal of CRDs.

### CRD Installation Advice

> You should follow the path that makes sense for your environment.

Generally we recommend:

- For most installations, install CRDs with `helm` is the best method to 
install for now.

You may want to consider your approach along with other tools that may offer
helm compatible installs, for a standardized approach to managing CRD
resources. If you have an approach that tembo-operator does not currently
support, then please 
[raise an issue](https://github.com/tembo-io/tembo/issues) to
discuss or join us on our [Slack community](https://tembocommunity.slack.com) to ask
questions.
