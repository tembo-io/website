---
title: Hobby Tier
sideBarTitle: Hobby
sideBarPosition: 3
---

The smallest available instances on Tembo Cloud are the Hobby tier instances. These instances are offered for free, with no credit card required, so that users can experiment with [Tembo Cloud](https://cloud.tembo.io).

## Limitations of unpaid Hobby instances

There are limitations for Hobby tier instances, which have been put in place in order to provide a sustainable free experience on Tembo Cloud.

### Spot required enabled

Tembo requires Hobby instances to run on [Spot](/docs/product/cloud/configuration-and-management/spot-instances), which means they are likely to be unavailable for about 10 minutes per day, and there are no uptime guarantees.

### High Availability is disabled

[High availability](/docs/product/cloud/configuration-and-management/high-availability) cannot be enabled on Hobby tier instances.

### Limited resources

Hobby instances are limited to the minimium compute and storage size. Users may upgrade to a paid instance in order to increase storage above `10GiB`.

### Idle instances are automatically paused

In order to avoid wasting resources, idle Hobby tier instances in unpaid organizations are automatically paused.

A Hobby tier instance is paused under these conditions:

- More than 2 days old
- Has not been connected to for over 24 hours
- Has not been unpaused in the last 24 hours
- Is not a member of a paid organization

## Contact Support

Tembo Support is here to help. Please reach out in the [Tembo Cloud UI](https://cloud.tembo.io), or by emailing [support@tembo.io](mailto:support@tembo.io).
