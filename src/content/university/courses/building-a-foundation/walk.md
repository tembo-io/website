---
sideBarPosition: 2
title: Walk Before you Run
sideBarTitle: Walk Before you Run
---

Before we get ahead of ourselves, let's consider all of the parts Pastebin actually has for a few moments.

## Content Management

One of the reasons we selected Pastebin is that it's not a full [Content Management System](https://en.wikipedia.org/wiki/Content_management_system). Every "paste" is a single isolated page with some extended attributes for presentation and organization purposes, and as a result, it's much easier to implement.

What attributes are associated with each "paste"?

* Content tagging and categorization
* Syntax highlighting
* Visibility (public, private, unlisted)
* Optional password protection
* Expiration date, if any

True CMS systems also require fine-grained access control, internal linking, templates, search engine optimization (SEO) management, plugins, and any number of other elements. Pastebin? It doesn't need any of that because it's designed for users to post content and then quickly abandon it.

What else does an application like this need?

## Url Shortening

Each "Paste" gets assigned an 8-character identifier called a [Slug](https://en.wikipedia.org/wiki/Clean_URL#Slug). With thousands of posts per day, duplicate titles would be inevitable. Unless, of course, titles are never part of the URL at all. Instead, the pre-calculated slug acts as a direct route to the paste.

## User Management

Even if for pure vanity purposes, most sites and applications provide some kind of profile functionality. For a site like Pastebin, it also serves as a way to allow for "repeatable" content. That means a user can edit posts since the application knows they created them. It means users can control post visibility, organize them into folders, set them to expire, and so on. It means setting persistent site preferences and defaults for future posts.

## Content Throttling

A major headache for any public service--especially one that allows anonymous posting--is preventing spam. One aspect of this is preventing spam content, and another is adding a rate-limit to making posts. These protections also need to apply to the [Application Programming Interface (API)](https://en.wikipedia.org/wiki/API) used by other services. Without these things, spam quickly overtakes the service, or malicious users can overwhelming it with requests.

## Working Together

In order to produce a working analog of Pastebin, we need all of the above functionality. After a bit of investigation, we may even find that we missed some critical element that should be added to the list.

Each chapter in this module is our attempt to directly address these elements. We can't build Pastebin _immediately_, but we _can_ build each individual component and requirement. In the end, we'll put them together into a cohesive whole.

So let's get started. With Postgres at the center, maybe we'll even end up with something _better than the original_ by the end.

