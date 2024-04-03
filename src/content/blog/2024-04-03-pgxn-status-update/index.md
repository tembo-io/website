---
slug: pgxn-v2-status
title: What’s Happening on the PGXN v2 Project
authors: [theory]
tags: [pgxn, extensions, trunk]
# image: './pg-14-16.png'
date: 2024-04-03T14:00
description: |
  A lot of thinking, explaining, dreaming, and planning has gone into what
  we're now calling the "PGXN v2" initiative. Let's check in on things, shall
  we?
---

Since writing about [jobs to be done] last month, work has continued apace on
the project now code-named "PGXN v2". This effort has encompassed
investigating a number of technical questions and decisions, with a few essays
and RFCs circulated amongst the PostgreSQL community, as well as a series of
talks and discussions around these issues. Here's a quick update. 

## RFCs and Brain Dumps

The original extensions ecosystem brain dump included a list of [tools to
fulfill the jobs], and these two perspectives have shaped the ensuing efforts
— mainly a lot of thinking, talking, and writing on various issues. A
sampling:

*   [A contemplation of decentralized extension publishing] seeks to
    understand how [Go centralized publishing] works, and imagines a similar
    model for Postgres extension distribution, including auto-discovery
    and a few tentative ideas for namespacing improvements.
*   [A meditation on extension versioning] and why, ultimately, it's probably
    best to stick with [semantic versioning].
*   An outline for an [extension metadata typology], inspired by a review of
    various packaging and source distribution metadata standards, and the need
    to group types of metadata for easier comprehension.
*   An [extension registry namespacing RFC] follows up on the distributed
    publishing post to address namespacing. Many find the current state
    confusing, with insufficient distinction between the name of a thing to be
    downloaded and installed vs. the name of an extension to create or load in
    the database. The RFC proposing to more specifically name the distribution
    bundle with a URI inspired by [Go module paths].
*   Building on metadata typology, the [PGXN metadata sketch] seeks comments
    on a slew of ideas for expanding the [PGXN Meta Spec] to enable automated
    binary packaging, [different types of extensions], system dependencies,
    curation, stats and reports, and more. It's admittedly a slog, but has
    already produced useful commentary from the broader PostgreSQL community
    that will inform the next generation of metadata.

The endeavor continues apace, most recently with the creation of a [public
project plan] that covers the work anticipated to finish examining these
issues, then to design and implement the tools and services to make them a
reality. It's *a lot* (we're super imaginative), but having the project
sketched out across [six milestones] will allow for an agile, iterative
approach to accomplishing our goals over the next year or so.

Next up is a document that pulls a number of these threads together in a
comprehensive architectural vision and planning guide for the project,
including diagrams and deeper explanations of its component parts. Watch for
that soon! For now, a teaser:

![Diagram of the extension distribution ecosystem vision, featuring “Root Registry” in the center and bidirectional lines to four of the surrounding nodes: “Web UX”, “Client”, “Packaging”, and “Interactions”. The “Packaging” and “Interactions” boxes also have a bi-directional arrow between them, while the fifth box, “Stats & Reports”, has a bi--directional arrow pointing to “Interactions” and another arrow pointing to “Root Registry”.](./future-extension-ecosystem.png "Future Extension Ecosystem")

## Extensions Ecosystem Summit

Meanwhile, a collaboration with colleagues from [Crunchy Data],
[EnterpriseDB], and [AWS] organized the [Extension Ecosystem Summit] on
Tuesday May 28 at [PGConf.dev] in Vancouver, BC. This community event will
assemble the most passionate and dedicated extension developers and
distributors to focus on a number of key challenges and questions on the road
to extension distribution nirvana. The agenda will include topics such as:

*   Identity, namespacing, and uniqueness
*   Distributed vs. centralized publishing
*   Binary packaging and distribution patterns
*   Extension developer tools
*   Metadata standards for third-party dependencies, extension types, TLEs,
    taxonomies, etc.
*   Improving the release process
*   Documentation standards
*   Community integration: identity, infrastructure, and support
*   Services and tools to build or improve upon

We plan for a loosely organized agenda, with people breaking into working
groups to examine specific problem domains.

In order to build momentum and to arrive at a solid list of topics, we're also
hosting a series of [six mini-summits][mini-summit]. Every other Wednesday
community members remotely gather for a brief talk on a relevant topic,
followed by discussion. The series inaugurated on March 6th with [the state of
the extension ecosystem] ([video](https://www.youtube.com/watch?v=6o1N1-Eq-Do)),
which attracted a strong turnout and terrific discussion.

Last Wednesday, Tembo's own [Ian Stanton] talked through the inspirations,
issues, and solutions that drove the creation of [trunk], a key component of
the Tembo Cloud architecture that's inspiring new thinking about binary
extension packaging. Once again, Postgres community participants engaged in a
robust discussion of the implications and remaining challenge to making a
widely-available multi-platform standard for easy-to-install and use
extensions ([notes], [video](https://www.youtube.com/watch?v=k3VC_RFL1bQ)).

The next four mini-summits remain open to all — [sign up here][mini-summit]!
The tentative speaker lineup:

*   April 3: [Devrim Gündüz]: "yum.postgresql.org and the challenges RPMifying
    extensions"
*   April 17: [Jonathan Katz]: "TLE Vision and Specifics"
*   May 1: [Yurii Rashkovskii], Omnigres: "Universally buildable extensions:
    dev to prod"
*   May 15: (Placeholder) [David Wheeler], PGXN: "Metadata for All: Enabling
    discovery, packaging, and community"

[Join us][mini-summit]! And if you're thinking of coming to [PGConf.dev], we'd
love to have you at the [Extension Ecosystem Summit] to help shape the future
of the extensions ecosystem.

  [jobs to be done]: /blog/pgxn-ecosystem-jobs
    "The Jobs to be Done by the Ideal Postgres Extension Ecosystem"
  [tools to fulfill the jobs]: https://gist.github.com/theory/898c8802937ad8361ccbcc313054c29d#tools
    "Extension Ecosystem: Tools"
  [A contemplation of decentralized extension publishing]: https://justatheory.com/2024/02/decentralized-extension-publishing/
  [Go centralized publishing]: https://go.dev/doc/modules/developing#decentralized
    "go.dev: Developing and publishing modules"
  [semantic versioning]: https://semver.org
  [extension metadata typology]: https://justatheory.com/2024/02/extension-metadata-typology/
  [extension registry namespacing RFC]: https://justatheory.com/2024/03/extension-namespace-rfc/
  [Go module paths]: https://go.dev/ref/mod#module-path
  [PGXN metadata sketch]: https://justatheory.com/archive/
  [PGXN Meta Spec]: https://pgxn.org/spec
  [different types of extensions]: /blog/four-types-of-extensions
    "Enter the matrix: the four types of Postgres extensions"
  [public project plan]: https://github.com/orgs/pgxn/projects/1/views/1
  [six milestones]: https://github.com/pgxn/planning/milestones
  [Crunchy Data]: https://www.crunchydata.com
    "Crunchy Data: Postgres for Cloud, Kubernetes, or Enterprise"
  [EnterpriseDB]: https://www.enterprisedb.com
    "EDB: Open-Source, Enterprise Postgres Database Management"
  [AWS]: https://aws.amazon.com/rds/postgresql/
    "Amazon RDS for PostgreSQL"
  [Extension Ecosystem Summit]: https://www.pgevents.ca/events/pgconfdev2024/schedule/session/191
    "PGConf.dev: Extensions Ecosystem Summit: Enabling comprehensive indexing, discovery, and binary distribution"
  [PGConf.dev]: https://2024.pgconf.dev "PostgresQL Development Conference 2024"
  [mini-summit]: https://www.eventbrite.com/e/851125899477/
    "Postgres Extension Ecosystem Mini-Summit"
  [the state of the extension ecosystem]: https://justatheory.com/2024/03/mini-summit-one/
    "Mini Summit One"
  [Ian Stanton]: https://github.com/ianstanton
  [trunk]: https://pgt.dev
  [notes]: https://justatheory.com/2024/03/mini-summit-two/
  [sign up here]: https://www.eventbrite.com/e/851125899477/
  [Devrim Gündüz]: https://github.com/devrimgunduz
  [Jonathan Katz]: https://jkatz05.com
  [Yurii Rashkovskii]: https://ca.linkedin.com/in/yrashk
