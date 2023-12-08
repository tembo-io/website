---
sidebar_position: 8
---

# Tembo Operator Install

## Installing with Helm

Tembo provides Helm charts as a first-class method of installation on Kubernetes

### Prerequisites

- [Install Helm version 3 or later](https://helm.sh/docs/intro/install/).
- Install a supported version of Kubernetes (currently only 1.25 is supported, but newer versions should work).
- Install cert-manager [with Helm](https://cert-manager.io/docs/installation/helm/)

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

#### 3. Install `CustomResourceDefinitions`

tembo-operator requires a number of CRD resources, which can be installed manually using `kubectl`,
or using the `controller.crds.create` option when installing the Helm chart. Both options
are described below and will achieve the same result but with varying
consequences. You should consult the [CRD Considerations](#crd-considerations)
section below for details on each method.

##### Option 1: install CRDs as part of the Helm release

> Recommended for production installations

To automatically install and manage the CRDs as part of your Helm release, you
must add the `--set controller.crds.create=true` flag to your Helm installation command.

Uncomment the relevant line in the next steps to enable this.

##### Option 2: installing CRDs with `kubectl`

```bash
kubectl apply -f https://raw.githubusercontent.com/tembo-io/tembo/main/charts/tembo-operator/templates/crd.yaml
```

#### 4. Install tembo-operator

To install the tembo-operator Helm chart, use the [Helm install command](https://helm.sh/docs/helm/helm_install/) as described below.

```bash
helm install \
  tembo-operator tembo \
  --namespace tembo-system \
  --create-namespace \
  --version v0.2.0 \
  # --set controller.crds.create=true
```

A full list of available Helm values is on [tembo-operator's chart github page](https://github.com/tembo-io/tembo/blob/main/charts/tembo-operator/README.md).

The example below shows how to tune the tembo-operator installation by overwriting the default Helm values:

```bash
helm install \
  tembo-operator tembo \
  --namespace tembo-system \
  --create-namespace \
  --version v0.2.0 \
  --set controller.crds.create=true \ # Example: enable installation of the CRDs
  --set controller.monitoring.prometheusRule=true \  # Example: enable prometheus rules for CNPG using a Helm parameter
  --set pod-init.logLevel=debug # Example: set pod-init log level to debug
```

#### 5. Verify Installation

Once you've installed tembo-operator, you can verify it is deployed correctly by
checking the `tembo-system` namespace for running pods:

```bash
$ kubectl get pods --namespace tembo-system

NAME                                    READY   STATUS    RESTARTS   AGE
tembo-cloudnative-pg-55966ffbc4-x58wb   1/1     Running   0          4m24s
tembo-controller-7d498b4d5-t7j5n        1/1     Running   0          4m24s
tembo-pod-init-77c456888b-l64sr         1/1     Running   0          4m24s
```

You should see the `controller`, `pod-init`, and
`cloudnative-pg` pods in a `Running` state.

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

*Note:* If you used `helm` to install the CRDs with the `controller.crds.enable=true`
value for the chart, then the CRDs will **NOT** have been removed and
you will need to run this final `kubectl` command to purge them from the cluster.

## CRD considerations

### kubectl installation

When installing CRDs with `kubectl`, you will need to upgrade these in tandem
with your tembo-operator installation upgrades. This approach may be useful when
you do not have the ability to install CRDs all the time in your environment.
If you do not upgrade these as you upgrade tembo-operator itself, you may miss
out on new features for tembo-operator.

Benefits:

- CRDs will not change once applied

Drawbacks:

- CRDs are not automatically updated and need to be reapplied before
  upgrading tembo-operator
- You may have different installation processes for CRDs compared to
  the other resources.

### helm installation

tembo-operator bundles the CRDs along with the other templates
in the Helm chart. This means that Helm manages these resources so they are
upgraded with your tembo-operator release when you use 
`controller.crds.enable: true` in your values file or CLI command. We also set 
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
discuss.
