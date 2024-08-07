---
title: Hobby Tier
sideBarTitle: Hobby
sideBarPosition: 3
description: Tembo Hobby Tier
---

Tembo Cloud offers a hobby tier for developers so that users can experiment with [Tembo Cloud](https://cloud.tembo.io). This does not require a credit card is available for free.

## Limitations of unpaid Hobby instances

While hobby tier instances are good for hobby projects and experimentation, they're not the best fit for running production workloads due to certain limitations. These allow us to provide a feature rich free tier on Tembo Cloud while running it sustainably.

### Spot is enabled

Tembo requires Hobby instances to run on [Spot](/docs/product/cloud/configuration-and-management/spot-instances). Spot instances can be interrupted with a short heads-up, which means they could be unavailable for about 10 minutes per day. Hobby tier also does not come with uptime SLAs.

### High availability is disabled

[High availability](/docs/product/cloud/configuration-and-management/high-availability) cannot be enabled on Hobby tier instances.

### Limited resources

Hobby instances have limited compute (0.25 CPU & 1GiB RAM) and storage (10GiB). Users may upgrade to a paid instance to increase storage or compute.

### Idle Hobby instances are automatically paused

In order to avoid wasting resources, *idle* Hobby tier instances are automatically paused.

A Hobby tier instance is paused under these conditions:

- More than 2 days old
- Has not been connected to for over 24 hours
- Has not been unpaused in the last 24 hours

## Contact Support

Tembo Support is here to help. Please reach out in the [Tembo Cloud UI](https://cloud.tembo.io), or by emailing [support@tembo.io](mailto:support@tembo.io) if you have any questions.
