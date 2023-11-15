# Tembo Website

The Tembo website is built using [Astro](https://astro.build) and [Docusaurus 2](https://docusaurus.io/), both are modern static website and docs generators.

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

This command starts a local development server and opens up a browser window. All changes are reflected live without having to restart the server.

### Build

> Landing:

```
$ npm run build-landing
```

> Docs:

```
$ npm run build-docs
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

- `main` is auto-deployed to https://tembo.io
- Open PRs (draft or regular) have preview environments deployed, comment including link will be posted in the PR

### Recommended Workflow

- Check out new branch
- npm run start
  - commits locally... looking at site in browser
  - push to remote each commit (opened draft PR)
- Ready to go?
  - Review preview environment
  - Squash and merge without review needed
