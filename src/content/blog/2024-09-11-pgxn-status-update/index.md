---
slug: pgxn-v2-update
title: What’s New on the PGXN v2 Project
authors: [theory]
tags: [pgxn, extensions, trunk, registry, dependencies]
image: './pgxn-status-update.png'
date: 2024-09-11T16:00
description: |
  A lot has happened in he five months since the last PGXN v2 update. The time
  has been used for continuing community discussions, planning, designs, and the
  start of implementation. Read on for a full accounting.
planetPostgres: true
---

Forgive me Postgres community, for it has been five months since [my last PGXN
v2 Update]. In my defense, it has been super busy! The time went into ongoing
community discussions, planning, designs, and the start of implementation.
Join me below for the lowdown.

## Extension Ecosystem Summit

Since last we met, the [Extension Ecosystem Summit] took place at [PGConf.dev]
in Vancouver, BC. Around 35 extension developers, users, and fans gathered for
an [open-space technology] (OST)-style [unconference]. We broke up into small
groups to discuss, debate, and record [notes] for a variety of topics:

*   [Extension Metadata]: Taxonomies, versioning, system dependencies,
    packaging & discoverability, development & compatibility, and more.
*   [Binary Distribution Format]: How to organize pre-compiled extension files
    for distribution, plus upgrade challenges.
*   [Core API/API Compatibility]: How stable are the PostgreSQL core API and
    ABI in minor releases? And how can the APIs improve to enable more
    compatibility?
*   [Including/Excluding Extensions in Core]: When should an extension be
    brought into core? When should a contrib extension be removed from core?
*   [Potential core changes for extensions, namespaces, etc]: Brainstorming
    improvements for extension development and management.

The terrific community collaboration on these topics sparked further
discussions and have already led to useful developments in PGXN and the
Postgres core.

## Core Advocacy

The first of of those results? [Peter Eisentraut] committed [API and ABI
guidance] to the PostgreSQL documentation. An extensive [hackers thread] led
to a collaboration between Peter and me. A key point:

> PostgreSQL makes an effort to avoid server ABI breaks in minor releases. In
> general, an extension compiled against any minor release should work with
> any other minor release of the same major version, past or future.

It contains a few caveats, since the current design, on very rare occasions,
requires a breaking [ABI] change. And in the absence of automated
compatibility checks, unexpected changes still might get through. A proposal
to build automated tooling to check for such changes could allow the guidance
to become a guarantee in the future.

The Summit also sparked revisiting an old patch to add a [second extension
directory] configuration variable. This feature would enable immutable
Postgres distributions, such as [Docker] images and [Postgres.app], to use
dynamically-installed extensions via a separate mutable volume or directory.

As [the patch] originated from the need to test extensions before building
[Apt] packages, discussion meandered into potentially better but more invasive
solutions. The brainstorming continues, but the acceptance of the general need
remains unopposed. Expect to see a solution sometime before the release of
Postgres 18.

## Formal RFCs

Following a few experimental approaches to posting RFC drafts and soliciting
feedback, I finally settled on the [Rust] community pattern, which stores RFCs
in a dedicated [GitHub repository], reviews RFCs via [pull
requests][rust-rfc-pr], and publishes accepted proposals to a [web site]. The
result is:

*   The [PGXN RFCs Repository], with reviews via [pull requests][pgxn-rfc-pr]
*   [rfcs.pgxn.org], which publishes accepted RFCs (currently only the [PGXN
    Meta Spec v1][v1])

With these foundations in place, there are now two RFCs under review:

*   [RFC: Binary Distribution Format][trunk rfc]: A proposal for the file
    layout of a binary distribution format for Postgres extensions, inspired
    by the design of [trunk] packages and the [Python wheel format]. Two blog
    posts describe proofs of concept, as well:
    *   [POC: PGXN Binary Distribution Format] augments a [PGXS]-based
        extension to build and install a Trunk binary package
    *   [POC: Distributing Trunk Binaries via OCI][OCI POC] converts Trunk
        packages into multi-platform [OCI images][OCI] published to an OCI
        registry, and prototypes a CLI that downloads and installs the
        image appropriate to the host platform.
*   [RFC: Meta Spec v2][v2]: A significant revision of the [v1 spec][v1] to
    classify different types of extensions (`CREATE EXTENSION` extensions,
    loadable modules, and applications), enable automated binary packaging
    across platforms and architectures, and discovery & curation.

Review and feedback very much wanted and appreciated! Meanwhile, based on
these RFCs and current [architectural designs], expected future RFCs might
include:

*   A list of supported platforms and architectures, and the strings to
    represent them in file names and metadata
*   An [OCI] distribution and metadata (annotation) specification
*   A method for mapping generic dependencies to system-specific packages, to
    support system dependencies on as many platforms as possible
*   A naming convention for [OCI] registry URLs, to distinguish PGXN
    distributions from potential additions in the future, including core
    extensions and user-published extensions.

## Development Commences

In the meantime, development has begun! The first release is [pgxn_meta
v0.1.0], a [Rust crate] an CLI that validates both [v1] and [v2] PGXN metadata
files. It validates against an appropriate [JSON Schema] for each version,
currently stored [in the meta repo] an compiled into the library, but
eventually to be published in a canonical location for other tools to use.

The [pgxn_meta v0.1.0] CLI has been compiled from a wide variety of platforms
and architectures, including Linux, macOS, FreeBSD, NetBSD, Solaris, Illumos,
and Windows. Thanks to its [Rust] implementation, this app and all the other
planned apps and services will support and be easily installed onto many OSes
and architectures.

Development continues with recent work to [parse PGXN Metadata] into Rust
structures for manipulation, and to [convert v1 Metadata] to the new,
canonical v2 form, which will be important for migrating distributions to v2.
Next up: v2 patches, so that the planned binary build system can add metadata
to improve build automation for extensions that need additional metadata.

## The Future

I originally planned to rewrite the *existing* PGXN services for this project,
starting with the [v2 Meta spec][v2] and upgrading or replacing the [release],
[api], and [UX] services. But in the last couple months I decided to focus on
the binary distribution challenges, first; hence the [trunk RFC] and [OCI
POC].

The goal is to fully evolve the metadata standard by developing the services
and tools required to build and index binary packages, and to provide a robust
CLI for easy binary extension installation by the end of 2024. This approach
will more quickly provide a valuable new service while also finalizing the
metadata format. With that format firmly established, we'll revise and migrate
all of the existing PGXN distributions.

To that end, this week I updated the [project milestones] with detailed task
lists for designing and building [OCI]-based, [Trunk][trunk rfc]-packaged
extension distribution and installation. There's a lot to do, but it's all
do-able — especially with your help! If you're interested and have some time,
look over the task lists and see what you can do!

  [my last PGXN v2 Update]: /blog/pgxn-v2-status
    "What’s Happening on the PGXN v2 Project"
  [Rust]: https://www.rust-lang.org "Rust Programming Language"
  [GitHub repository]: https://github.com/rust-lang/rfcs
    "RFCs for changes to Rust"
  [rust-rfc-pr]: https://github.com/rust-lang/rfcs/pulls
    "Rust RFC Pull Requests"
  [web site]: https://rust-lang.github.io/rfcs/
    "Rust RFCs - RFC Book - Active RFC List"
  [PGXN RFCs Repository]: https://github.com/pgxn/rfcs/
    "RFCs for Changes to PGXN"
  [pgxn-rfc-pr]: https://github.com/pgxn/rfcs/pulls
    "PGXN RFC Pull Requests"
  [rfcs.pgxn.org]: https://rfcs.pgxn.org
  [trunk rfc]: https://github.com/pgxn/rfcs/pull/2
  [trunk]: https://pgt.dev
  [Python wheel format]: https://packaging.python.org/en/latest/specifications/binary-distribution-format/
    "Python Binary Distribution Format"
  [POC: PGXN Binary Distribution Format]: https://justatheory.com/2024/06/trunk-poc/
  [PGXS]: https://www.postgresql.org/docs/currnent/extend-pgxs.html
    "PostgreSQL Docs: “Extension Building Infrastructure”"
  [OCI POC]: https://justatheory.com/2024/06/trunk-oci-poc/ "POC: Distributing Trunk Binaries via OCI"
  [OCI]: https://github.com/opencontainers/image-spec "OCI Image Format Specification"
  [v2]: https://github.com/pgxn/rfcs/pull/3 "pgxn/meta#3 RFC: Meta Spec v2"
  [v1]: https://rfcs.pgxn.org/0001-meta-spec-v1.html "PGXN Meta Spec v1"
  [PGXN metadata sketch]: https://justatheory.com/archive/
  [architectural designs]: https://wiki.postgresql.org/wiki/PGXNv2/Architecture 
    "PGXN v2 Architecture"
  [Extension Ecosystem Summit]: https://www.pgevents.ca/events/pgconfdev2024/schedule/session/191
    "PGConf.dev: Extensions Ecosystem Summit: Enabling comprehensive indexing, discovery, and binary distribution"
  [PGConf.dev]: https://2024.pgconf.dev "PostgresQL Development Conference 2024"
  [open-space technology]: https://en.wikipedia.org/wiki/Open_space_technology
    "Wikipedia: Open space technology"
  [unconference]: https://en.wikipedia.org/wiki/Unconference "Wikipedia: Unconference"
  [notes]: https://wiki.postgresql.org/wiki/PGConf.dev_2024_Extension_Summit
    "PostgreSQL Wiki: PGConf.dev 2024 Extension Summit"
  [Extension Metadata]: https://wiki.postgresql.org/wiki/PGConf.dev_2024_Extension_Summit#Extension_Metadata
    "PostgreSQL Wiki: PGConf.dev 2024 Extension Summit --- Extension Metadata"
  [Binary Distribution Format]: https://wiki.postgresql.org/wiki/PGConf.dev_2024_Extension_Summit#Binary_Distribution_Format
    "PostgreSQL Wiki: PGConf.dev 2024 Extension Summit --- Binary Distribution Format"
  [Core API/API Compatibility]: https://wiki.postgresql.org/wiki/PGConf.dev_2024_Extension_Summit#ABI.2FAPI_discussion
    "PostgreSQL Wiki: PGConf.dev 2024 Extension Summit --- ABI/API discussion"
  [Including/Excluding Extensions in Core]: https://wiki.postgresql.org/wiki/PGConf.dev_2024_Extension_Summit#Including.2FExcluding_Extensions_in_Core
    "PostgreSQL Wiki: PGConf.dev 2024 Extension Summit --- Including/Excluding Extensions in Core"
  [Potential core changes for extensions, namespaces, etc]: https://wiki.postgresql.org/wiki/PGConf.dev_2024_Extension_Summit#Potential_core_changes_for_extensions.2C_namespaces.2C_etc
    "PostgreSQL Wiki: PGConf.dev 2024 Extension Summit --- Potential core changes for extensions, namespaces, etc"
  [API and ABI guidance]: https://github.com/postgres/postgres/commit/e54a42a
    "postgres/postgres@e54a42a: Add API and ABI stability guidance to the C language docs"
  [hackers thread]: https://www.postgresql.org/message-id/flat/5DA9F9D2-B8B2-43DE-BD4D-53A4160F6E8D%40justatheory.com
    "pgsql-hackers Proposal: Document ABI Compatibility"
  [Peter Eisentraut]: http://peter.eisentraut.org
  [ABI]: https://en.wikipedia.org/wiki/Application_binary_interface
    "Wikipedia: Application binary interface"
  [second extension directory]: https://www.postgresql.org/message-id/flat/E7C7BFFB-8857-48D4-A71F-88B359FADCFD%40justatheory.com
    "pgsql-hackers RFC: Additional Directory for Extensions"
  [Docker]: https://hub.docker.com/_/postgres "Docker Hub: Postgres"
  [Postgres.app]: https://postgresapp.com
    "Postgres.app: The easiest way to get started with PostgreSQL on the Mac"
  [the patch]: https://github.com/theory/postgres/pull/3
  [Apt]: https://wiki.debian.org/Apt
  [pgxn_meta v0.1.0]: https://github.com/pgxn/meta/releases/tag/v0.1.0
  [Rust crate]: https://docs.rs/pgxn_meta/ "docs.rs: pgxn_meta"
  [JSON Schema]: https://json-schema.org
  [in the meta repo]: https://github.com/pgxn/meta/tree/main/schema
    "v1 and v2 JSON Schema Definitions"
  [parse PGXN Metadata]: https://github.com/pgxn/meta/pull/14
    "pgxn/meta#14 Implement meta module and struct"
  [convert v1 Metadata]: https://github.com/pgxn/meta/pull/15
    "pgxn/meta#15 Implement v1-v2 conversion"
  [release]: https://manager.pgxn.org "PGXN Manager" 
  [api]: https://github.com/pgxn/pgxn-api/wiki "The PGXN API"
  [UX]: https://pgxn.org "The PostgreSQL Extension Network"
  [project milestones]: https://github.com/pgxn/planning/milestones?direction=asc&sort=due_date&state=open
    "PGXN v2 Project Milestones"
