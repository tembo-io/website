---
slug: hacking-postgres-ep3
title: "Hacking Postgres, Ep. 3: Eric Ridge"
authors: [ryw]
tags: [postgres, hacking-postgres]
image: './ep3.png'
---

In this episode, Ry and Eric talk about ZomboDB, the complicated road that led to the development of pgrx, and what it means for the future of extensions within Postgres. You can watch it below or listen to it on Apple/Spotify (or your podcast platform of choice). Special thanks to Eric for joining us today!

<div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', marginBottom: '5%'}}>
  <iframe
    style={{ position: 'absolute', top:'10px', width: '100%', height: '100%' }}
    width="100%"
    height="400"
    src="https://www.youtube.com/embed/tD9e6KXnB20?si=sjZJEGyxhqE7x9U-"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen>
  </iframe>
</div>


Want to know more about something they mentioned? Here’s a starting point:

* ZomboDB - https://github.com/zombodb/zombodb
* pgrx - https://github.com/pgcentralfoundation/pgrx
* plrust - https://github.com/tcdi/plrust
* Elasticsearch - https://www.elastic.co/elasticsearch/
* Supabase wrappers - [https://github.com/supabase/wrappers](https://github.com/supabase/wrappers)
* TCDI - https://www.tcdi.com/
* PostGIS - https://postgis.net/
* postgres_fdw -https://www.postgresql.org/docs/current/postgres-fdw.html
* Citus - https://www.citusdata.com/
* Valgrind - https://valgrind.org/

Did you enjoy the episode? Have ideas for someone else we should invite? Let us know your thoughts on X at [@tembo_io](https://twitter.com/tembo_io) or share them with the team in our [Slack Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw).


## Transcript


##### _[00:00:12] - Ry_

Hey, Eric. What's going on, man?


##### _[00:00:14] - Eric_

Hi, Ry. How are you?


##### _[00:00:15] - Ry_

Long time no talk.


##### _[00:00:16] - Eric_

Yeah, it has been a while.


##### _[00:00:18] - Ry_

How are things going?


##### _[00:00:19] - Eric_

Well, I think.


##### _[00:00:21] - Ry_

Well, maybe let's give our listeners a quick intro on what you've done. I mean, Eric Ridge is pretty much a household name in mean, in case there's someone listening who doesn't know what you've been working on. You want to give us a quick background on your involvement in postgres over the years?


##### _[00:00:36] - Eric_

I think a household name is absolutely not true. First of all, I'm Eric. I am the reason that this postgres extension name ZomboDB exists. And over the years of developing that, something that's now called Pgrx kind of fell out of all that work that lets us develop extensions for postgres using the Rust programming language. And these things have been where my interest has been as it relates to postgres. I guess past seven, eight years now. Things ZomboDB has been out since 2015, so we're right at eight years.


##### _[00:01:14] - Ry_

Do you know how many it's at? An uncountable number of Rust extensions now, probably you probably at one point knew how many there were, but now you've lost track.


##### _[00:01:24] - Eric_

Yeah, that's a good question. It's hard to know. There's no real clearinghouse around extensions.


##### _[00:01:30] - Ry_

If only there was, that would be a great thing for someone to build.


##### _[00:01:33] - Eric_

Yeah, it would. I wish somebody would get on that. Right. Yeah, that's a good question. There's some bigger names using Pgrx, and the TimescaleDB is one. Supabase is one. We recently released plrust, and that's found its way out on RDS. So that's exciting for us. What we see popping up are small extensions that are written in Pgrx, and we see a lot of people writing I don't want to call them one off extensions, but one off extensions that are just, like, specific to their business use case and solve some interesting data domain problem that only they would have. But now they have the ability to build that business logic or data manipulation or what have you into their database and into the database itself.


##### _[00:02:27] - Ry_

Without having to go find a C programmer that's willing to do such work. Right?


##### _[00:02:31] - Eric_

Yeah. And that was one of the motivators for developing Pgrx, was I guess I had been working on postgres extensions in some form or fashion since postgres 8.0, and I think that was even before the extension packaging and create extension command and all that came into existence not long before. But I think that that was before and yeah, I mean, just over the years, I got tired of working in C. When you're developing a postgres extension in C, you're not only putting on your C programmer hat, but you're trying to put on the hat of a postgres hacker. Right. You need to understand postgres sources just as much as you do the language itself. So Rust was becoming a popular a number of years ago. So I was like, you know what, I'm going to try to do this.


##### _[00:03:22] - Ry_

Well, it's interesting. It's like how a lot of games, if they have mods, the language for the mods has to be easier than the language for the core game. Right. So a game might be written in something like Unity, but then they give you, like, Lua as a tool or JavaScript or something simple to build. But in Postgres, that wasn't true. Now, is Rust as simple as Lua or JavaScript? Maybe not, but it's still like very beloved people who try to learn it. In my experience so far, it's 100% like anyone who tries to learn Rust learns it and loves it. I haven't found someone yet and I have a small sample size, but, yeah, seems like it's a pretty good hit rate in terms of the perfect mix of control and speed with the ease of onboarding.


##### _[00:04:10] - Eric_

If you're not a C programmer, then writing the postgres extension in C is going to be difficult again, because C and then also because you're really programming Postgres's version of C, which is great, but it's not JavaScript, it's not Ruby, it's not Java. If you're not a Rust programmer, first you've got to learn Rust, and Rust is different enough from all the other languages to make that a point. But what we're trying to do with Pgrx, and it's going to be a multi year effort to do this, it may never get done, but we're trying to present the postgres internals in the most idiomatic way possible to Rust. Right. So that if you are a Rust programmer or you are beginning to learn Rust, it'll be pretty obvious what you need to do in order to make your postgres extension useful.


##### _[00:05:10] - Ry_

So you said you were working on extensions as early as Postgres Eight. Were you a Postgres user or our developer even earlier than that, or was that sort of when you got involved?


##### _[00:05:21] - Eric_

Yeah, Postgres user, I think we started using Postgres at work in the year 2000 and that might have been I mean, is that 7.1, 7.2? It's quite a long time ago and we've been using it every day since. And, yeah, somewhere along the way we needed to do some work inside the database. So here we are today.


##### _[00:05:46] - Ry_

Yeah. For me, when I think about when did I start using Postgres, it's like thinking about when did I first start using a laptop, it's like I don't remember exactly when, but definitely transitioned to having a laptop at some point. But, yeah, it didn't seem monumental to start using Postgres back then, but obviously it's come a long way and it's a pretty exciting ecosystem right now. So, yeah. What do you think the most powerful thing about extensions are? Do you have any thoughts on what are the most powerful things you can do with extensions, out of curiosity?


##### _[00:06:19] - Eric_

It's an interesting question.


##### _[00:06:21] - Ry_

What's the coolest part of, I guess what API? Or maybe another good question is what hasn't been exposed yet that should be or needs to be in Pgrx? That would be powerful.


##### _[00:06:32] - Eric_

Yeah, I'll start there and then work backwards. There's a lot of internal APIs within Postgres, and there's a number of interesting ones. There's the index access method API, which is really easy to implement. We haven't added safe wrappers around that to Pgrx, but it's real easy to implement. It's really just a handful of functions. There's the Foreign Data Wrapper API, which Supabase released a project that they call Wrappers that'll let you create foreign data wrappers using Rust backed up by Pgrx. So kind of the next big API around that genre of internals. There would be the Table Access Method APIs, and we haven't exposed these at all yet. They're actually difficult to get at even through our bindings just because of the way they're set up in the postgres sources. So when we get around to doing that, and I hope that we will, there's going to be some development effort on our part to safely expose these or safely expose the Table Access Method APIs. But that's the API that would let you write your own heap storage engineer system in Rust.


##### _[00:07:49] - Ry_

Tell me about I mean, probably not everybody knows what ZomboDB is. Maybe quickly describe what it does and what it doesn't do and what's coming next with it.


##### _[00:07:59] - Eric_

Yeah, it's the worst named software product.


##### _[00:08:03] - Ry_

First off, why'd you call it Zombo, everyone wants to know.


##### _[00:08:06] - Eric_

I think, Ry, you're old enough to remember Zombo.com. If you don't remember it, then that just means you weren't playing on the internet. You're probably doing real work. It still exists so listeners can go and check it out, but the name just came from that. So ZomboDB is a postgres extension, and it's been through numerous iterations over the past eight years, but it has always been postgres extension that lets you create an index on a table that's backed by Elasticsearch. Typically the usage pattern is you create the index indexing all of the columns in the table and you point it to an Elasticsearch endpoint over Http or Https, and the ZomboDB keeps that index up to date. It keeps the index MVCC correct. All of your search results are you only see results that would otherwise be visible within the executing transaction has its own query language for doing full text queries, so users don't have to learn the Elasticsearch query DSL, which is pretty intense.


##### _[00:09:14] - Ry_

Can you use the Elasticsearch DSL with it, though?


##### _[00:09:17] - Eric_

You can, and there's a number of ways to do that. The query language itself allows you to just insert as part of an expression. You can insert a JSON block to represent a query DSL node. There's a full set of SQL builder functions, so you can build query DSL through SQL statements. You can mix and match these things together. It's pretty sophisticated on that front, and it also exposes nearly all of Elasticsearch's aggregate endpoints to enable you to do really interesting aggregations with your full text. And since all the fields of a table are also stored in the Elasticsearch index, you can do some really interesting things that involve full text queries and aggregating on various metadata fields and do all this with a large distributed elastic search cluster behind the scenes and do it in near real time. It's really slick. The downside to ZomboDB is that you now have an Elastic search cluster running alongside your postgres cluster. And ES is a living breathing system. It requires significant attention and maintenance in production. It gives you a lot of capabilities to scale out horizontally very easily, but it is its own living breathing system there.


##### _[00:10:42] - Ry_

Yeah, it'd be great if you can build a version of this without requiring elastic.


##### _[00:10:46] - Eric_

Yeah, I know a guy that's working on that. I know a company that's working.


##### _[00:10:50] - Ry_

Yeah, someday that'd be possible.


##### _[00:10:53] - Eric_

Yeah, well, you had asked where the name came from and I said all that to say that the name came from. Once we kind of got ZomboDB working, we were like, whoa, it's really amazing what you can do with this and how easy it is to use. And one of the mantras from Zombo.com is the only limit is yourself. And ZomboDB really kind of makes it feel that way because it makes querying your data, especially real dense text data, just super simple.


##### _[00:11:26] - Ry_

And so you use Zombo pretty aggressively within TCDI, which is where you work, right?


##### _[00:11:33] - Eric_

Yeah, TCDI is my employer. Yeah. We've had Zombo in production since 2013 and we didn't open source until 2015. Yeah, I don't want to give away numbers, but we have more ZomboDB installations and Elasticsearch instances than we probably want.


##### _[00:11:53] - Ry_

Is it sort of a competitive advantage for the business? The power that I know, you guys, it's like legal documents. I might get it wrong, but like searching legal documents to some degree, right? Is it a competitive advantage for the business? The fact that Zombo is inside, would you say?


##### _[00:12:08] - Eric_

Yeah, absolutely. Our industry is e-discovery litigation support and among many other areas within that domain, searching large volumes of text is a key thing. And we're the only player in our industry that has text search capabilities to the degree that we do. And I'm not going to go name or other competitors or anything, but their abilities to do complicated text search that involves fuzzy queries plus regular expressions, plus boolean expressions, plus long tail proximity queries hit highlighting it's our abilities to do that just far exceed our competitors because of ZomboDB, because of postgres, and because of Elasticsearch.


##### _[00:12:55] - Ry_

Do you use the extension in both transactional use cases as well as analytical? Or is it mostly just powering the search bar inside the product or is there some back end? I guess I call it like analytical type use cases for it as well.


##### _[00:13:12] - Eric_

Yeah. So with postgres. Right. Everything is transactional.


##### _[00:13:15] - Ry_

Yeah.


##### _[00:13:16] - Eric_

We expose search in a very complex manner. I guess, to our users. Users, it's much more than just a search box. They can search by particular fields and design proximity queries, and they can do term lookups. They can create real time dashboards and whatnot through our software. That's all backed by ZomboDB. One interesting use case is in the world of litigation. The plaintiffs will provide the defendants with a list of keywords that need to be searched in order to find documents that are responsive to particular to these topics. And these keywords are sometimes just literally a keyword one word. Sometimes they're phrases, sometimes they're wild card terms. Sometimes they're phrases with embedded wildcards. Sometimes they're patterns that need to be recognized. And so, like an analytics side of what we use ZomboDB for is taking these ginormous lists of things and kicking it off and getting back a list of the 6 million documents out of the 200 million that might match this set of keywords that the plaintiffs have requested production for.


##### _[00:14:25] - Ry_

Yeah, that's intense. Could see the power of that. What are your other favorite extensions? Probably all the other ones you've made, but give me your top five postgres extensions. zombos, one. What are a couple of others that you like?


##### _[00:14:39] - Eric_

I don't use PostGIS or PostGIS, but I am super impressed with it. I think of it as kind of like the gold standard of what a postgres extension ought to look like. ZomboDB does integrate with it, but the data world that I live in doesn't involve the need to do geographical type queries. But I've always been really impressed with it. I think the postgres foreign data wrapper as an extension is really great, and that comes from the core community, but pretty impressed with that. Citus has always been interesting to me. I guess they've long since been bought out by Microsoft and are still going strong. I think that Citus really shows off the power of what a postgres extension can do, and it also shows off the power of having committers on the hackers and hackers to be able to help move the extension system in postgres forward so that you can then implement something like Citus on top of it.


##### _[00:15:36] - Ry_

When they were building that, did they have to add things to extensions in order to build that? I don't know the whole history of Citus, but was that kind of like.


##### _[00:15:46] - Eric_

Yeah, they've had a number of changes in postgres, I think, especially in the planner and executor to be able to support the ability to extend it better. And I think some of that came from the original Citus company people. That's great, right?


##### _[00:16:03] - Ry_

Yeah, that's awesome.


##### _[00:16:05] - Eric_

What I like to see are people using Pgrx to just solve a problem that they have with their application. I see things like somebody just needed to talk to an S3 bucket, and so they put together a little Pgrx extension to do that. Little things like that are what get me excited about Postgres extensions.


##### _[00:16:26] - Ry_

Yeah, it's pretty timely. I have a co-op that started literally today. Shout out to Jay and I told him to build a clerk FDW using the Supabase Wrappers SDK. And he's like, what the hell do you say to me? Just try read the docs, we'll see where it goes. But I'll report back how that goes. But yeah, Clerk, we're using Clerk for Auth for our company, and I just need a simple read access to three collections. So I figure he should be able to get it done by the end of the day, but I might be pushing too hard.


##### _[00:17:00] - Eric_

Well, it's possible. And that's a great example of where having a simple framework for making an extension is really powerful. Right. I mean, once you figure out the documentation and how to tie the two things together, it probably is just an afternoon's worth of work. And now you've got something that solves a problem and you can move on.


##### _[00:17:21] - Ry_

Yeah, I figure his second one maybe will take an afternoon, first one might take a few days, but we'll see.


##### _[00:17:26] - Eric_

Well, sure, yeah.


##### _[00:17:28] - Ry_

Well, that's great. Yeah, we're super excited, obviously, by all the possibilities that Pgrx brings to Postgres, and the great work you guys have done historically to get us to this point is much appreciated.


##### _[00:17:42] - Eric_

Well, thanks. That's one of the reasons why we, TCDI donated Pgrx to the PG Central Foundation is to provide it a long term home for the Postgres community. TCDI is a litigation support company. We're not a database company, so to speak. So we wanted to get this stuff in the hands of a foundation that can help shepherd it forward and make sure that it can survive.


##### _[00:18:09] - Ry_

I imagine you have some open issues there that you could use help with. They're probably pretty hard to do, right? Like building a framework is a lot harder to building a thing with a framework. But are you looking for additional help from people to build out Pgrx?


##### _[00:18:23] - Eric_

Yeah, for sure. I can't even tell you off the top of my head how many contributions we've had over the past four years that Pgrx has been alive. And it seems like every couple of weeks somebody new comes by with a new contribution. But yeah, one of the things that we're focused on right now is I guess it's two things kind of concurrently. One is we're improving Pgrx, is testing fundamentals, and it's both tying in more interesting things in CI like Valgrind, to different approaches to unit testing, which includes we're doing a big push on property testing right now within Pgrx. I think there's going to be some pull request landing in the next week or so with that. And we're also focused on improving some of the memory safety and soundness impedance mismatches between Postgres internals and Rust's compiler. So it's a big concerted effort to take a look at these issues.


##### _[00:19:25] - Ry_

Well, it seems like contributing to Pgrx could be like a gateway drug towards getting closer to helping with postgres itself. Right. Because you need to understand the internals to do anything in know, at least unless you're working on tests or yeah, I mean in general, adding new features to Pgrx means understanding postgres well enough to create that interface, which is big challenge.


##### _[00:19:48] - Eric_

It does. And we myself and the others that on the decor development team there, we spend probably as much time in the postgres sources as we do actually writing code for it in.


##### _[00:20:03] - Ry_

You guys. If you come up with a big new release of Pgrx or any other extensions that you can think of, I'd love to have you back. Eric, it was great catching up with you.


##### _[00:20:12] - Eric_

Yeah, sure. Likewise. Thank you so much for having me.
