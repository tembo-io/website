# PGXN creator David Wheeler joins Tembo to help build the future of PostgreSQL extension management

Extensions are among the most powerful and probably the most underutilized features of Postgres.

https://x.com/adamhendel/status/1734877766334456052

They add functionality to Postgres without changing the core of the database. They range from simple data types and functions to distributed databases and MLOps platforms. But why don’t more developers use extensions?


## Reasons why extension penetration is low

If extensions are so powerful, why is penetration low? Among many reasons a a noteworthy few stand out:



* Extensions are hard to find: There isn’t a single easily searchable and navigable place  for developers to easily find all extensions.
* Extension maturity is difficult to judge: developers have to rely on heuristics such as GitHub stars, name recognition, binary packaging distribution, and so on.
* There is no centralized package repository for all platforms: Some extensions have no binary packaging, some are available via yum or apt repositories and some publish their own packages. Managed services allow easy installation of a limited number of extensions, but not for local development.
* There is limited documentation and installation metadata: one cannot simply download an extension binary, but take steps to make extensions work successfully. Some require updates to `shared_preload_libraries`, some depend on other extensions or binary libraries,while others require specific configurations to be usable.

Jumping through these hoops to get extensions working successfully is too much for most developers.


## Trunk - Building a Postgres extension registry

Therefore, we built trunk (pgt.dev) to address these issues. We built a registry where devs could upload their extensions by simply opening a PR against the trunk repo which describes how to build their extension via a .toml file. With that, we built a database of how to build over 190 extensions. We also generated binaries for all these extensions for Ubuntu / Debian for Postgres 15. That allows you to install all these extensions using a simple `trunk install` command for that architecture / operating system.

Then, we started capturing additional metadata for these extensions in our toml file. `preload_libraries` captures if the extension needs something to be added to the `shared_preload_libraries` parameter, [dependencies] section in the .toml file captures any additional packages which need to be installed for the extension to work.

We also built a website, which allows users to search and discover a categorized list of extensions which several people have found useful.

All of this work allows us to support a one-click extension management experience for all these extensions on Tembo Cloud. (show Tembo Cloud UI).


## But, there’s a long way ahead!

What we’ve built serves most of our use cases, but we believe a better solution needs to exist for this for every developer and not just what works for Tembo Cloud. We need to give extension developers freedom to upload their extensions, support packaging for multiple architectures and  operating systems, capture much more metadata and have documentation and guides for all extensions.


## Collaboration with David Wheeler

We’ve been aware of PGXN since the beginning and there are several things we’ve liked about it. It distributes ~375 extensions, 400+ developers already publish extension source code distributions via PGXN, and it also hosts extension documentation, allowing for a more comprehensive search. Still, PGXN Lacks some features we believe to be important. Examples include binary packaging, automated indexing of extensions from GitHub, and a more modern user interface.

While PGXN creator David Wheeler gave feedback on Trunk in its early days, we recognized an enduring passion to build on the foundation of PGXN, take it to completion. David was also inspired by newer patterns exemplified by pkg.go.dev and crates.io, and driving a community project to improve the extension ecosystem.

Today, we’re pleased to announce that David has joined Tembo to work on this initiative full time.


## What are we up to?

To start with, we’re not changing anything in PGXN or Trunk. Rather, the goal is to build a community-driven Postgres extension management solution (which will leverage components and learning from both). Our goals for the project are:



* Be the canonical source of record for all Postgres extensions
* Be super easy for developers to publish their extensions in the ecosystem
* Make extensions easy to find and understand
* Make extension documentation consistent, standardized, and comprehensive
* Provide stable, easy-to-use, and comprehensive APIs on which downstream developers can build other tools and products
* Provide automatic binary packaging for wide variety of platforms
* Provide intuitive, powerful interfaces for managing extensions

It’s week 2 for David and we’ve already drafted a comprehensive vision document, which we will blog about in upcoming days. We’ve also initiated conversations with maintainers of other Postgres extension registries, to get their input and collaborate with them to work toward extension nirvana. If you’re interested in learning more about this or want to be involved, please reach out to us and we’d be happy to collaborate! It’s a big undertaking and we need all the help and feedback we can get 🙂

We’re really excited for what’s to come.


# Samay v2

We’re excited to welcome David Wheeler, a long-time PostgreSQL contributor to Tembo. David has made significant contributions to Postgres, including [CITEXT2](https://www.postgresql.org/docs/current/citext.html), the case-insensitive data type; [pgTAP](https://pgtap.org/), a database test framework; and [Sqitch](https://sqitch.org/), a database change management system. While an Associate at [PostgreSQL Experts](https://pgexperts.com/) in 2011, he created [PGXN](https://pgxn.org/), the original extension distribution system. His most recent stint was designing and building [a searchable, encrypted data store on PostgreSQL](https://justatheory.com/2023/10/cipherdoc/) for [The New York Times](https://nytimes.com/).

David will be focussing on critically evaluating the challenges of Postgres **extension discovery and distribution** and work with the [PostgreSQL community](https://www.postgresql.org/community/) to address them.


## Challenges of the Postgres Extension Ecosystem

Extensions are arguably the most powerful capability of Postgres. They allow you to add to and replace critical components of the database without changing a single line in core. In terms of functionality, they range from simple data types and functions to distributed databases and MLOps platforms. But why don’t more developers use extensions?

Among many reasons, a noteworthy few stand out:


* Extensions are hard to find and discover: There isn’t a single easily searchable and navigable place for developers to easily find all extensions.
* Extension maturity is difficult to judge: Developers have to rely on heuristics such as GitHub stars, name recognition, binary packaging distribution, and so on.
* There is no centralized package repository for all platforms: Some extensions have no binary packaging while others are available via yum or apt. Managed services allow easy installation but support a limited number of extensions.
* There is limited documentation and metadata on how to get an extension working successfully. Some require updates to `shared_preload_libraries`, some depend on other extensions or binary libraries, while others require specific configurations to be usable.


## Trunk: Binary packaging and metadata capture for extensions

To solve this problem, we built [Trunk](https://pgt.dev/). Trunk has a registry of 190+ extensions, their binary packages (for Ubuntu / Debian) and metadata about them which allow us to deploy them programmatically on Tembo Cloud. We’ve also built a website at pgt.dev allowing developers to explore a categorized catalog of extensions and discover new ones.

[Add image]

While this works well for Tembo Cloud, we see a need for a better solution for the Postgres community in general. Extension developers should be able to upload their extensions, we should support binary packaging and testing for different architectures and operating systems, capture more metadata and have documentation and guides for all extensions.


## PGXN and collaboration with David

PGXN is the original Postgres extension registry. It distributes ~375 extensions and 400+ developers already publish extension source code distributions via PGXN. It also hosts extension documentation, allowing for a comprehensive search. Still, PGXN lacks some features we believe to be important, including binary packaging (which is even more important in the era of Rust extensions), automated indexing of extensions from GitHub, and a more modern user interface.

While David gave feedback on Trunk in its early days, we recognized an enduring passion to build on the PGXN foundation and take it to completion. David was also inspired by newer patterns exemplified by pkg.go.dev and crates.io, and driving a community project to improve the extension ecosystem.

Today, we’re pleased to announce that David has joined Tembo to work on this initiative full time.


## What are we working on?

To start with, we’re not immediately changing anything in PGXN or Trunk. Rather, the goal is to build a community-driven Postgres extension management solution that leverages components and learning from both). Our goals for the project are:



* Be the canonical source of record for all Postgres extensions
* Be super easy for developers to publish their extensions in the ecosystem
* Make extensions easy to find and understand
* Make extension documentation consistent, standardized, and comprehensive
* Provide stable, easy-to-use, and comprehensive APIs on which downstream developers can build other tools and products
* Provide automatic binary packaging for wide variety of platforms
* Provide intuitive, powerful interfaces for managing extensions

It’s week 2 for David and we’ve already drafted a comprehensive vision document, which we will share in upcoming days. We’ve also initiated conversations with maintainers of other Postgres extension registries, to get their input and collaborate with them to work toward extension nirvana. If you’re interested in learning more about this or want to be involved, please reach out to us and we’d be happy to collaborate! It’s a big undertaking and we need all the help and feedback we can get 🙂

We’re excited for what’s to come.

