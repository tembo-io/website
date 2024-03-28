---
slug: introducing-oltp-on-postgres
title: 'OLTP on Postgres: 3 Ways the Tembo OLTP Stack Makes Things Simple'
authors: [darren]
tags: [postgres, oltp, stacks, database]
image: './apps.png'
---

Let’s cut right to the chase: the problem with your OLTP database _actually_ doesn’t have anything to do with the database.

Your OLTP database is great.

The problem…is all the _other_ stuff required in order for that database to solve your problem. In order for your application to work, you have to maintain a ridiculous pile of tools, add-ons, and services (with all their corresponding vendors). In practical terms, that means instead of having one thing to manage and build, you actually have _multiple_, all of which means more headache, effort, and cost. At Tembo, we believe that your database—the “OLTP stack”—should be ready to go. It should be a rock-solid solution, not more problems.

Want to see how it works? Check it out here as Darren gives us the tour:

<div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', marginBottom: '5%'}}>
  <iframe
    style={{ position: 'absolute', top:'10px', width: '100%', height: '100%' }}
    width="100%"
    height="400"
    src="https://www.youtube.com/embed/ys7l7WhlV6Y?si=9lkAlIuMd240kluY"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen>
  </iframe>
</div>

So what does that mean for you today? Simple. There are 3 key components that can make or break your OLTP database, and Tembo provides all three.

## 1. Extension Accessibility

As we said at the beginning, the power—and complexity—of your OLTP database isn’t in the database itself. The complexity comes in all the extensions and other add-ons that are necessary for your specific use case—identifying, vetting, integrating, and managing them becomes just one more headache standing between you and the job you’re actually trying to run. But with the Tembo OLTP stack, we take all that headache off your plate.

First, we enable a couple of key extensions right out of the box and give you easy access to other commonly needed ones:

![extensions](./extensions.png 'extensions')

We also give you access to the full Tembo extension library—nearly 200 Postgres extensions and growing, all accessible in a single click. Need one that we currently don’t support? Just add it to our open source Trunk project, which makes it available in Tembo cloud. With the Tembo OLTP database, it’s simple for you to customize your stack to the exact use case you need.

## 2. Integrated Apps

This extension integration is powerful, but often your database will need more than just extensions. The Tembo library also includes a growing suite of applications that sit alongside your Postgres instance:

![apps](./apps.png 'apps')

These powerful tools run on dedicated compute resources (which preserves your database performance) and are managed by Tembo Cloud alongside your Postgres instance (which ensures consistent accessibility and security). This means that you get the capability needed for your specific use case without the hassle of having to manage additional services or vendors.

## 3. Instant Performance

Finally, let’s come back to the database itself. Typically, you’d expect to have to do a sizeable amount of tuning and optimization for your brand new database, but we’ve taken that headache off your plate as well. WAL settings are optimized, and we’ve set fairly aggressive autovacuum settings. We think of this as an “opinionated” OLTP setup. We’re setting you up to get to work right out of the gate; we believe that you shouldn’t have to spend hours tinkering with your settings just to get the performance levels you expect. Put simply, we give you master-level database performance without _you_ having to become a database expert.

So what does this mean for you? It means that you can focus on what you’re building instead of on your database. Try it for yourself on [Tembo Cloud](https://cloud.tembo.io)
