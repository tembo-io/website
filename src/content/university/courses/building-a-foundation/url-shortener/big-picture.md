---
sideBarPosition: 0
title: The Big Picture
sideBarTitle: The Big Picture
---

What is an URL or link shortener? Have you ever encountered a link that looks like it goes on for pages and pages, full of long section names, variables, tokens, tracking IDs, and various other detritus? Not only are these literally impossible to remember, they're virtually untypeable, and even scrolling through them is painful if pasted into a chat window. Even without this, a website with a very deep link could legitimately consist of hundreds of characters and be somewhat unwieldy.

URL shorteners exist purely to transform these obnoxious beasts into a much tamer alternative more suitable for distribution. If we at Tembo were to build one, it might produce links that look like this:

* u.tembo.io/isShort

Isn't that much nicer?

So how do these work? It's actually not all that complicated, and it's also the reason we chose this as the first lesson in Tembo University. We're going to go on a journey to build a link shortener using Postgres as the core. By the end of this lesson, you should understand how URL shorteners work, and have a _fully functional_ application built on Postgres that can provide simplified links.

Let's get started!
