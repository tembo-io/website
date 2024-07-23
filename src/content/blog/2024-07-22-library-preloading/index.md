---
slug: library-preloading
title: To Preload, or Not to Preload
authors: [theory]
description: |
  When should a Postgres extension be pre-loaded and when should it not?
  Should it be loaded in user sessions or at server startup? Read on for
  answers.
tags: [postgres, extensions, preload]
date: 2024-07-24T14:00
image: './shared-library-preloading.png'
planetPostgres: true
---

> To preload, or not to preload, that is the question:<br/>
> Whether ’tis nobler in the ram to suffer<br/>
> The slings and arrows of pointer functions,<br/>
> Or to take arms against a sea of backends,<br/>
> And by alter role limit them: to session, to user
>
> — William Shakespeare, DBA (probably)

Recently I've been trying to figure out when a Postgres extension shared
libraries should be preloaded. By "shared libraries" I mean libraries provided
or used by Postgres extensions, whether [`LOAD`]able libraries or
`CREATE EXTENSION` libraries written in C or [pgrx]. By "preloaded" I mean
under what conditions should they be added to one of the [Shared Library
Preloading] variables, especially `shared_preload_libraries`.

The answer, it turns out, comes very much down to the extension type. Read on
for details.

Normal Extensions
-----------------

If your extension includes and requires no shared libraries, congratulations!
You don't have to worry about this question at all.

If your extension's shared library provides functionality only via functions
called from SQL, you also don't need to worry about preloading. Custom types,
operators, and functions generally follow this pattern. The DDL that creates
objects, such as [`CREATE FUNCTION`], uses the `AS 'obj_file', 'link_symbol'`
syntax to tell PostgreSQL what library to load when SQL commands need them.

For certain extensions used by nearly every connection, there are may be
performance benefits to preloading them in [`shared_preload_libraries`], but
it's not required. See [below](#shared-preloading) for details.

Initializing Extensions
-----------------------

If your shared library needs to perform tasks before PostgreSQL would load it
--- or if it would never be loaded implicitly by SQL statements --- then it
must be explicitly loaded before it's used. This is typically the case for
libraries that modify the server's behavior through [hooks] rather than
providing a set of functions.

To accommodate these requirements, PostgreSQL provides three preloading levels
that correspond to the configuration variables for which they're named:

*   [`session_preload_libraries`]: session preloading
*   [`local_preload_libraries`]: local preloading
*   [`shared_preload_libraries`]: shared preloading

Let's take a look at the use cases for each.

### Session Preloading

If your extension is intended for debugging or performance-measurement, it
likely doesn't need to be preloaded for every connection. In this scenario, a
DBA might allow specific users to load it by either:

*   Adding it to the user's [`session_preload_libraries`] variable via
    [`ALTER ROLE`], so it loads for every connection for that user:

    ```sql
    ALTER ROLE role_name
      SET session_preload_libraries TO '$libdir/mylib';
    ```

*   Granting the user role the ability to set `session_preload_libraries`,
    which would allow them to use it (and any other shared library) in
    [`PGOPTIONS`]:

    ```sql
    GRANT SET ON PARAMETER session_preload_libraries
       TO role_name;
    ```

As an extension author, you don't need to configure anything special for this
use case, as long as your library is installed in the usual location via the
regrettably-named [`MODULES`] `Makefile` variable (or your build pipeline's
equivalent). Still, it will be useful to document these options so that DBAs
quickly see how to set things up for the users who need them.

### Local Preloading

As a special case, a DBA might want to make your debugging or
performance-measurement extension available to any user who needs it, even
unprivileged users. All it require is moving the the library from `$libdir` to
`$libdir/plugins`.

Thereafter, any Postgres user can load it via the [`LOAD`] command or include
it in their [`local_preload_libraries`] configuration via either [`PGOPTIONS`]
or, for every connection, via `ALTER ROLE CURRENT_ROLE SET`:

```sql
ALTER ROLE CURRENT_ROLE
  SET local_preload_libraries TO '$libdir/plugins/mylib';
```

As an extension author, you don't need configure anything special for this use
case, either; there is no `Makefile` variable to install shared libraries in
`$libdir/plugins`. As long as no function or operation in your extension
*requires* superuser access and doesn't provide SQL objects that map to
`$libdir/mylib`, things should work as before.

Assuming those caveats, it would be handy to document this option *in addition
to* the [session preloading](#session-preloading) options. But in your docs,
emphasize that it should be used if and *only if* DBAs want to allow any and
all of their users to load your extension library without barriers or
intervention.

### Shared Preloading

The last preloading variable is [`shared_preload_libraries`], which is
required for libraries to run in every session or to perform operations only
available at service start up, such as [shared memory and lightweight locks]
or starting [background workers].

As an extension author, if your extension requires `shared_preload_libraries`
preloading, the documentation should say so explicitly, and explain why. For
examples of wording, see [pg_stat_statements], [sepgsql], and [auth_delay].

Beyond these limited cases, any other shared libraries can be added to
[`shared_preload_libraries`] for efficiency purposes. Since Postgres loads
preload libraries into every server process --- even if that process never
uses the library --- preloading is recommended only for libraries used in most
sessions. In such cases there can be a significant performance benefit in
reduced connection time and --- since preloaded extensions are shared across
processes and benefit from [COW] --- memory allocation.

As an extension author, it would be a kindness to document this optimization,
and to describe the circumstances under which they *might* want to preload
your library in every service --- along with the caveat that doing so requires
a server restart. For example wording, see [PL/Perl], [auto_explain] and
[passwordcheck].

Hook Load Order
---------------

If your extension uses [hooks] to modify the behavior of PostgreSQL, it's
important to use them properly to prevent dependency and load order issues.
Hooks that don't modify server state and always call the next hook should be
safe to load in any order.

But some hooks *do* modify the state, because that's their purpose. In
general, if they always call the next hook things should work. But there are
two situations to be mindful of: hooks that depend on the state changes of
other hooks, and hooks that break on unexpected changes from other hooks.

In either case, if you discover a conflict with another shared library that
can be resolved by loading your extension before or after the other, document
the required order and the impact on the format of the preload variables.

Connection Pooling
------------------

One more wrinkle. Users connecting via a connection pooler like [PgBouncer]
must not manually [`LOAD`] shared libraries or load them via [`PGOPTIONS`].
Connection poolers often assign a connection per command, so a library loaded
in one command likely will not be available to the next command, because it
could be a different connection!

This issue can be addressed by a number of means:

*   For occasional use of a shared library, allow users to connect directly to
    PostgreSQL rather than to the connection pooler, so they have a consistent
    session.
*   Use `ALTER USER SET` to configure [`local_preload_libraries`] or
    [`session_preload_libraries`] for the roles that need libraries loaded,
    rather than  [`LOAD`] or [`PGOPTIONS`]. This will generally work because
    connection poolers don't share connections between users.
*   If usage is regular and useful for many or most connections, preload the
    libraries in [`shared_preload_libraries`] and also enjoy the performance
    benefits --- at the expense of a server restart.

Acknowledgements
----------------

I'm grateful to [David Christensen], [Greg Sabino Mullane], [Andreas
Scherbaum], [David G. Johnston], and [Shaun Thomas] for [reviewing] drafts of
this post and greatly improving it with their suggestions and corrections.
Remaining errors are on me.

  [pgrx]: https://github.com/pgcentralfoundation/pgrx
    "pgrx: Build Postgres Extensions with Rust!"
  [`LOAD`]: https://www.postgresql.org/docs/current/sql-load.html
    "PostgreSQL Docs: LOAD"
  [Shared Library Preloading]: https://www.postgresql.org/docs/current/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-PRELOAD
    "PostgreSQL Docs: Shared Library Preloading"
  [`CREATE FUNCTION`]: https://www.postgresql.org/docs/current/sql-createfunction.html
    "PostgreSQL Docs: CREATE FUNCTION"
  [`session_preload_libraries`]: https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-SESSION-PRELOAD-LIBRARIES
    "PostgreSQL Docs: `session_preload_libraries`"
  [`ALTER ROLE`]: https://www.postgresql.org/docs/current/sql-alterrole.html
    "PostgreSQL Docs: ALTER ROLE"
   [`PGOPTIONS`]: https://www.postgresql.org/docs/current/config-setting.html#CONFIG-SETTING-SHELL
     "PostgreSQL Docs: Parameter Interaction via the Shell"
  [`local_preload_libraries`]: https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-LOCAL-PRELOAD-LIBRARIES
    "PostgreSQL Docs: `local_preload_libraries`"
  [`MODULES`]: https://www.postgresql.org/docs/current/extend-pgxs.html#EXTEND-PGXS-MODULES
    "PostgreSQL Docs: CREATE FUNCTION"
  [`shared_preload_libraries`]: https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-SHARED-PRELOAD-LIBRARIES
    "PostgreSQL Docs: `shared_preload_libraries`"
  [background workers]: https://www.postgresql.org/docs/current/bgworker.html
    "PostgreSQL Docs: Background Worker Processes"
  [shared memory and lightweight locks]: https://www.postgresql.org/docs/16/xfunc-c.html#XFUNC-SHARED-ADDIN
    "PostgreSQL Docs: Shared Memory and LWLocks"
  [pg_stat_statements]: https://www.postgresql.org/docs/16/pgstatstatements.html
    "PostgreSQL Docs: pg_stat_statements"
  [sepgsql]: https://www.postgresql.org/docs/16/sepgsql.html#SEPGSQL-INSTALLATION
    "PostgreSQL Docs: sepgsql"
  [auth_delay]: https://www.postgresql.org/docs/16/auth-delay.html
    "PostgreSQL Docs: auth_delay"
  [COW]: https://en.wikipedia.org/wiki/Copy-on-write
    "Wikipedia: Copy-on-write"
  [PL/Perl]: https://www.postgresql.org/docs/16/plperl-under-the-hood.html#GUC-PLPERL-ON-INIT
    "PostgreSQL Docs: plperl.on_init"
  [auto_explain]: https://www.postgresql.org/docs/16/auto-explain.html
    "PostgreSQL Docs: auto_explain"
  [passwordcheck]: https://www.postgresql.org/docs/16/passwordcheck.html
    "PostgreSQL Docs: passwordcheck"
  [Shaun Thomas]: http://bonesmoses.org
  [hooks]: https://wiki.postgresql.org/wiki/PostgresServerExtensionPoints#Hooks
    "PostgreSQL Wiki: Hooks"
  [PgBouncer]: https://www.pgbouncer.org "Lightweight connection pooler for PostgreSQL"
  [David Christensen]: https://github.com/pgguru
  [Greg Sabino Mullane]: https://github.com/turnstep
  [Andreas Scherbaum]: https://andreas.scherbaum.la
  [David G. Johnston]: https://david-g-johnston.com
  [reviewing]: https://github.com/theory/justatheory/pull/6
