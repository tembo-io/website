![tembo-banner](https://github.com/tembo-io/website/assets/68653294/2f41b6e1-1be6-4c14-9d64-56c7636d8c54)

<h1 align='center'>Tembo Website</h1>
<h4 align='center'>Goodbye Database Sprawl, Hello Postgres</h4>
<div align='center'>
<a href='https://tembo.io' target='_blank'>https://tembo.io</a>
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

- `main` is auto-deployed to https://tembo.io via AWS Amplify
- Open PRs (draft or regular) have preview environments deployed, comment including link will be posted in the PR

### Recommended Workflow

- Checkout new branch
- `npm run docs` or `npm run landing`
  - commits locally... looking at site in browser
  - push to remote each commit (opened draft PR)
- Ready to go?
  - Review preview environment
  - Squash and merge and get approval from Darren/Samay

### Writing a blog post ✍️

#### 1. Create a new folder inside `website/content/blog` directory
```bash
mkdir -p website/content/blog/2024-09-20-example-post
```

#### 2. Make a new markdown file inside the same directory (this is where you will write your blogpost)
```bash
touch website/content/blog/2024-09-20-example-post/index.md
```

#### 3. Frontmatter
Each blog post supports *frontmatter*, which is a block of `YAML` at the top of the file that contains metadata about the post. Here's an example of what frontmatter looks like:

```yaml
---
slug: sentence-transformers
title: 'Automate vector search in Postgres with any Hugging Face transformer'
authors: [adam]
tags: [postgres, extensions, stacks, vector-search]
image: './tembo_vector.png'
date: 2024-02-02T09:00
description: Walk through using pg_vectorize to automate the vector search workflow in Postgres. Use pg_vectorize transform text to embeddings, and host Sentence Transformers in a container next to Postgres.
---
```
- `slug` is the URL of the blog post. It should be a unique identifier for the post and should (ideally) not change after the post is published. Each post will be live at a url like `https://tembo.io/blog/your-post-slug`.

- `title` is the title of the blog post. This will be displayed at the top of each post, on the main card list page, and in the `title` meta tag.

- `authors` is an array of the authors of the post. Each author should be a string that matches the key of an author in the `AUTHORS` object inside of `/landing/content/config.ts`.

- `tags` is an array of tags that the post is associated with. Each tag will be displayed inside of the left sidebar in each post and will also be used inside of the `keywords` meta tag.

#### 4. Code blocks
> TODO
#### 5. Admonitions (callouts)
> TODO
#### 6. Embedding tweets and videos
> TODO
#### 7. Tags
> TODO
