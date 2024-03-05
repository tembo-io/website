---
slug: pgxn-ecosystem-jobs
title: The Jobs to be Done by the Ideal Postgres Extension Ecosystem
authors: [theory]
tags: [postgres, extensions, ecosystem, packaging, distribution, architecture, jobs to be done]
image: ./extension-ecosystem.png
date: 2024-02-21T17:00
description: |
  The challenges of the current Postgres extension ecosystem and the
  interest and energy put into exploring new solutions make clear that the
  time has come to revisit the whole idea. We begin with a survey of the
  jobs to be done by extensions packaging and distribution.
---

The past year has seen a surge in interest in Postgres extension distribution. A
number of people have noted in particular the [challenges] in finding and
installing extensions.

[PGXN], released [way back in 2011], aimed to be the canonical registry for the
community, but currently indexes only the [350 distributions] that developers
have made the effort to publish — perhaps a third of all [known
extensions][extension-gist]. Furthermore, PGXN distributes source code packages,
requiring developers to download, compile, install, and test them.

As a result of these challenges, a number of new entrants have emerged in recent
months with a focus on discovery and ease of installation. These include [dbdev],
[pgxman], [pgpm], and our own [trunk][pgt.dev]. However, they too exhibit
limitations, such as minimal OS and platform availability and, notably, the
manual process to add extensions, further constraining inclusion. None has even
reached the number provided by PGXN.

These challenges and the interest and energy put into exploring new solutions
make clear that the time has come to revisit the whole idea of the PostgreSQL
extension ecosystem: to work though the jobs to be done, specify the tools to do
those jobs, and outline a plan for the broader Postgres community to design and
build them.

Future posts will dream up the tools and make the plan; today we begin with the
jobs.

🎬 Let's get started.

------

## Jobs to be Done

Theodore Levitt cites a [famous adage]:

> "Last year 1 million quarter-inch drills were sold," Leo McGivena once said,
> "not because people wanted quarter-inch drills but because they wanted
> quarter-inch holes."
>
> People don't buy products; they buy the expectation of benefits.

Today the most cited descriptor underpinning [Jobs to be Done Theory], [thanks
to Clayton Christensen], we bear it in mind to think through the "jobs" of an
idealized Postgres extension ecosystem — without reference to existing
Postgres solutions. However, we cite examples for the jobs from other projects
and communities, both to clarify the jobs to be done and to reference prior art
from which to borrow.

So what are the jobs to be done by the ideal Postgres extension ecosystem?

### Authoritative

**Job: Be the official, canonical source of record for all Postgres extensions**

Developers need to know the one place to reliably release and find all
publicly-available Postgres extensions. It can't be a subset, but must be
comprehensive, the assumed default recognized and used by the community and
included in the Postgres documentation.

Exemplars:

*   The [Go Module Index] indexes Go package that it
    [automatically discovers][go-pkg-discovery]
*   [crates.io] indexes Rust crates [published to it][cargo-registries]
*   [PAUSE] indexes Perl modules [uploaded to it][perl-upload]
*   [RubyGems][rubygems.org] indexes Ruby Gems published to it
*   [PyPI][pypi.org] indexes Python distributions [uploaded to it][pypi-upload]

  [Go Module Index]: https://index.golang.org "Go Module Mirror, Index, and Checksum Database"
  [cargo-registries]: https://doc.rust-lang.org/cargo/reference/registries.html
    "The Cargo Book: Registries"
  [PAUSE]: https://pause.perl.org/ "The [Perl programming] Authors Upload Server"
  [pypi-upload]: https://packaging.python.org/en/latest/guides/distributing-packages-using-setuptools/#uploading-your-project-to-pypi
    "Python Packaging User Guide: Uploading your Project to PyPI"
  [perl-upload]: https://pause.perl.org/pause/query?ACTION=pause_04about
    "About PAUSE: Uploading"
  [go-pkg-discovery]: https://go.dev/doc/modules/developing#discovery
    "Go Docs: Developing and publishing modules — Package discovery"
  [pkg.go.dev]: https://pkg.go.dev "Go Packages"
  [crates.io]: https://crates.io "The Rust community's crate registry"
  [metacpan.org]: https://metacpan.org "A search engine for CPAN"
  [rubygems.org]: https://rubygems.org "Find, install, and publish RubyGems"
  [pypi.org]: https://pypi.org "Find, install and publish Python packages with the Python Package Index"

### Beneficial

**Job: It's expected for extension developers to develop and publish their
extensions in the ecosystem.**

Extension developers want their extensions to be a part of the ecosystem, to
gain all the advantages and privileges of participation, without undo effort.

Publishing an extension should be as straightforward as possible. Ideally it
simply requires maintaining a metadata file and publishing releases to the
[authoritative index](#authoritative).

Exemplars:

*   [Go Package Discovery][go-pkg-discovery] automatically discovers and indexes
    [`go.mod`]-configured packages
*   Registered [crates.io] developers publish Rust crates defined by [Cargo
    Manifest File]s [via the `cargo` CLI][publish crates]
*   Registered NPM developers publish NPM projects defined by [`package.json`] files
    [via the `npm publish`] command
*   Registered [PAUSE] developers publish Perl modules defined by [CPAN Meta
    Spec] files via the [`cpan-upload` CLI] or [web API][pause-api]

  [`go.mod`]: https://go.dev/doc/modules/gomod-ref "go.mod file reference"
  [Cargo Manifest File]: https://doc.rust-lang.org/cargo/reference/manifest.html
    "The Cargo Book: The Manifest Format"
  [publish crates]: https://doc.rust-lang.org/cargo/reference/publishing.html
    "The Cargo Book: Publishing on crates.io"
  [`package.json`]: https://docs.npmjs.com/cli/v6/configuring-npm/package-json
    "npm Docs: Specifics of npm's package.json handling"
  [via the `npm publish`]: https://docs.npmjs.com/cli/v6/using-npm/developers#publish-your-package
    "npm Docs: Publish your package"
  [CPAN Meta Spec]: https://metacpan.org/pod/CPAN::Meta::Spec
    "CPAN::Meta::Spec - specification for CPAN distribution metadata"
  [`cpan-upload` CLI]: https://metacpan.org/dist/CPAN-Uploader/view/bin/cpan-upload
    "meta::cpan: cpan-upload - upload a distribution to the CPAN"
  [pause-api]: https://metacpan.org/pod/WWW::PAUSE::Simple
    "meta::cpan: WWW::PAUSE::Simple - An API for PAUSE"

### Integrated

**Job: It's easy for developers to start writing and publishing extensions.**

Extension developers need excellent tooling to simplify the process of creating,
maintaining, testing, and distributing extensions. Such tools should be
well-integrated into the extension ecosystem, and empower developers to get
started and easily follow best practices throughout the extension development
lifecycle: from beginning development, managing dependencies and other metadata,
testing it, and releasing it.

Exemplars:

*   [cargo]
*   [Go module-aware commands]
*   [Language Servers]

  [cargo]: https://doc.rust-lang.org/cargo/ "The Cargo Book"
  [Go module-aware commands]: https://go.dev/ref/mod#mod-commands
    "Go Modules Reference: Module-aware commands"
  [Language Servers]: https://langserver.org
    "A community-driven source of knowledge for Language Server Protocol implementations"

### Discoverable

**Job: Make extensions easy to find and understand**

There's no use in being the canonical index of extensions if no one can find
them. The ecosystem needs a well-known web site where people find extensions,
learn their purposes, distinguish them from each other, and read their docs.
Ideally most people use integrated search rather than a search engine, but
extension pages should appear high up in search engine results, too.

Exemplars:

*   [pkg.go.dev]
*   [crates.io]
*   [metacpan.org]
*   [rubygems.org]
*   [pypi.org]

### Informative

**Job: Make extension documentation consistent, standardized, and comprehensive**

Extensions are only as easy to use as their documentation enables. It's
therefore important to provide well-organized, standardized, and accessible
documentation — and that it be expedient for developers to document their
extension packages. Ideally development tools encourage extension documentation.
A documentation standard enables publishing docs in multiple formats, especially
on the canonical [discovery](#discoverable) site.

Exemplars:

*   [Go Doc Comments]
*   [rustdoc]

  [Go Doc Comments]: https://go.dev/doc/comment
  [rustdoc]: https://doc.rust-lang.org/rustdoc/ "The rustdoc book"

### Programmable

**Job: Provide stable, easy-to-use, and comprehensive APIs to empower downstream
developers to build and integrate other tools and products**

Provide excellent, well-documented, intuitive web APIs that allow anyone to
build useful tools and services on the index. The jobs below require it, but
creative coders will invent and [mashup] APIs in ways we haven't thought of. Web
APIs enable imaginative solutions within the ecosystem and without. Some example
APIs:

*   Recent releases feeds
*   Extension metadata
*   Full text search
*   Event webhooks to notify registered services

Better still, let trusted services report back results for listing — even
badging! — in the [authoritative index](#authoritative), such as download
counts, build results, test results, binary packaging availability, and more.

Exemplars:

*   [metacpan-api]
*   [RubyGems API]
*   [PyPI API]
*   [PyPI project releases RSS feed]

  [metacpan-api]: https://github.com/metacpan/metacpan-api/blob/master/docs/API-docs.md
    "metacpan-api API Docs: v1"
  [RubyGems API]: https://guides.rubygems.org/rubygems-org-api/
    "Details on interacting with RubyGems.org over HTTP"
  [PyPI API]: https://peps.python.org/pep-0691/
    "PEP 691 – JSON-based Simple API for Python Package Indexes"
  [PyPI project releases RSS feed]: https://pypi.org/help/#project-release-notifications
    "PyPI Help: “How do I get notified when a new version of a project is released?”"

### Installable

**Job: Provide automatic binary packaging for wide variety of platforms**

It must be as easy as possible for users to install all indexed extensions.
Ideally, independent services rely on the [index APIs](#programmable) for
notification of new releases and automatically build binary packages for as wide
a variety of OSes, OS versions, architectures ([arm64], [amd64], etc.), and
PostgreSQL versions as possible.

Some example repositories to support or enable to build and distribute
extensions from the core registry:

*   Community packaging: [apt.postgresql.org], [yum.postgresql.org]
*   Binary packaging: Homebrew, Chocolatey, etc.
*   Vendor packaging & distribution: [pgxman], [dbdev], [pgpm], [trunk][pgt.dev]

Exemplars: ❓❓

### Trusted

**Job: Validate extensions and protect from supply chain vulnerabilities**

Provide tools and features to earn and retain user trust by ensuring that that
extensions indexed by the [canonical registry](#authoritative) have been
validated, come from trustworthy sources, and are unlikely to be a vector for
[supply chain attacks]. This means some combination of author validation (e.g.
badging projects from well-known sources), checksums, public key signing, and
perhaps static code analysis.

Exemplars:

*   [How Go Mitigates Supply Chain Attacks]
*   [Improving Supply Chain Security for Rust Through Artifact Signing]
*   [GitHub Code Scanning]
*   [Docker Scout]

  [How Go Mitigates Supply Chain Attacks]: https://go.dev/blog/supply-chain
  [Improving Supply Chain Security for Rust Through Artifact Signing]: https://foundation.rust-lang.org/news/2023-12-21-improving-supply-chain-security/
  [GitHub Code Scanning]: https://docs.github.com/en/code-security/code-scanning
    "GitHub Docs: Finding security vulnerabilities and errors in your code with code scanning"
  [Docker Scout]: https://docs.docker.com/scout/ "Docker Docs: Docker Scout"

### Manageable

**Job: Provide intuitive, powerful interfaces for installing and managing
extensions**

Provide applications to manage the extensions in one or more Postgres clusters.
At a minimum distribute a command line interface that manages extensions for a
locally-installed Postgres — as currently required for it to install packages,
for example.

Users need to easily manage their Postgres extensions in a single, consistent
manner. The extensions manager should be aware of installed extensions,
available extensions, dependency graphs, and known vulnerabilities; allow for
search (via the [APIs](#programmable)); and of course install or upgrade
extensions.

Exemplars:

*   [cpan], [cpanminus], [cpm]
*   [cargo]
*   [Go module-aware commands]
*   [pip]
*   [gem]
*   [apt-get]
*   [yum]

  [cpan]: https://metacpan.org/pod/cpan
    "cpan - easily interact with CPAN from the command line"
  [cpanminus]: https://metacpan.org/pod/cpanm
    "cpanm - get, unpack build and install modules from CPAN"
  [cpm]: https://metacpan.org/pod/cpm "cpm - a fast CPAN module installer"
  [pip]: https://pypi.org/project/pip/ "pip is the package installer for Python"
  [gem]: https://guides.rubygems.org/command-reference/
    "What each gem command does, and how to use it"
  [apt-get]: https://en.wikipedia.org/wiki/APT_(software)
    "Wikipedia: “APT (Software)”"
  [yum]: https://en.wikipedia.org/wiki/Yum_(software)
    "Wikipedia: “Yum_(software)”"

## Omissions and Next Steps

With these jobs in mind, we begin to identify the tools necessary to serve them
in the next post.

But first, what's missing here? Are these nine jobs to be done sufficiently
comprehensive to meet most extension indexing, discovery, packaging, and
distribution needs? What's missing? We don't want to leave any good ideas
behind! Please drop yours into the [#extensions] channel on the [Postgres
Slack].

  [challenges]: /blog/welcoming-david-wheeler#challenges-of-the-postgres-extension-ecosystem
    "Challenges of the Postgres Extension Ecosystem"
  [PGXN]: https://pgxn.org "PGXN — PostgreSQL Extension Network"
  [way back in 2011]: https://blog.pgxn.org/post/4601750614/new-pgxn-site
    "PGXN Blog: “It’s Finally Up: The New PGXN Site!”"
  [350 distributions]: https://pgxn.org/about/ "About PGXN"
  [extension-gist]: https://gist.github.com/joelonsql/e5aa27f8cc9bd22b8999b7de8aee9d47
    "GitHub Gist: 🗺🐘 1000+ PostgreSQL EXTENSIONs"
  [apt.postgresql.org]: https://wiki.postgresql.org/wiki/Apt
    "PostgreSQL packages for Debian and Ubuntu"
  [yum.postgresql.org]: https://yum.postgresql.org "PostgreSQL Yum Repository"
  [pgxnclient]: https://pgxn.github.io/pgxnclient/
    "PGXN Client’s documentation"
  [pgxman]: https://pgxman.com/ "npm for PostgreSQL"
  [dbdev]: https://database.dev "The Database Package Manager"
  [pgpm]: https://github.com/postgres-pm/postgres-pm
    "PGPM, or Postgres Package Manager"
  [pgt.dev]: https://pgt.dev "Trunk — A Postgres Extension Registry"
  [famous adage]: https://quoteinvestigator.com/2019/03/23/drill/
    "Quote Investigator: “No One Wants a Drill. What They Want Is the Hole”"
  [Jobs to be Done Theory]: https://strategyn.com/jobs-to-be-done/jobs-to-be-done-theory/
    "Fundamentals of Jobs-to-be-Done Theory"
  [thanks to Clayton Christensen]: https://hbr.org/2005/12/marketing-malpractice-the-cause-and-the-cure
    "HBR: “Marketing Malpractice: The Cause and the Cure”"
  [mashup]: https://en.wikipedia.org/wiki/Mashup_(web_application_hybrid)
    "Wikipedia: “Mashup (web application hybrid)”"
  [arm64]: https://en.wikipedia.org/wiki/AArch64 "Wikipedia: AArch64"
  [amd64]: https://en.wikipedia.org/wiki/amd64 "Wikipedia: AMD64"
  [supply chain attacks]: https://en.wikipedia.org/wiki/Supply_chain_attack
    "Wikipedia: “Supply chain attack”"
  [#extensions]: https://postgresteam.slack.com/archives/C056ZA93H1A
    "Postgres Slack/#extensions: Extensions and extension-related accessories"
  [Postgres Slack]: https://pgtreats.info/slack-invite
    "Join the Postgres Slack"
