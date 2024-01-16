![tembo-banner](https://github.com/tembo-io/website/assets/68653294/2f41b6e1-1be6-4c14-9d64-56c7636d8c54)

<h1 align='center'>Tembo Website</h1>
<h4 align='center'>Goodbye Database Sprawl, Hello Postgres</h4>
<div align='center'>
<a href='https:tembo.io' target='_blank'>tembo.io</a>
</div>

<br />

The Tembo website is built using [Astro](https://astro.build) + [React](https://react.dev) and [Docusaurus 2](https://docusaurus.io/), both are modern static website and docs generators.

### Installation

> Run this from the root of repo:

```
$ npm install
```

### Local Development

> Landing page:

```
$ npm run landing
```

> Docs:

```
$ npm run docs
```

These command(s) start local dev servers and open up browsers on `localhost:3000` and `localhost:4321` by default. All changes are reflected live without having to restart the server.

### Build

> Landing:

```
$ npm run build-landing
```

> Docs:

```
$ npm run build-docs
```

This commands will generate static content into the associated `build` directory and can be served using any static contents hosting service.

### Deployment

- `main` is auto-deployed to https://tembo.io
- Open PRs (draft or regular) have preview environments deployed, comment including link will be posted in the PR

### Recommended Workflow

- Checkout new branch
- `npm run docs` or `npm run landing`
  - commits locally... looking at site in browser
  - push to remote each commit (opened draft PR)
- Ready to go?
  - Review preview environment
  - Squash and merge without review needed
