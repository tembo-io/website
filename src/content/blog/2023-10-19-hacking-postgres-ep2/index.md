---
slug: hacking-postgres-ep2
title: "Hacking Postgres, Ep. 2: Adam Hendel"
authors: [ryw]
tags: [postgres, hacking-postgres]
image: './ep2.png'
---

In this episode, Ry and Adam talk about developing extensions for Postgres, being in the trenches of the modern data stack sprawl, and the future of what’s possible with Tembo Stacks. If you haven’t seen or listened to it yet, you can do so below, or on Apple/Spotify (or your podcast platform of choice). Special thanks to Adam for joining us today!

Want to know more about something they mentioned? Here’s a starting point:

<iframe  width="100%"
    height="400" src="https://www.youtube.com/embed/8vkhlaY7AqM?si=ttqL-LBuwgXzEvFG" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>


* Pgmq - [https://github.com/tembo-io/pgmq](https://github.com/tembo-io/pgmq); also see Adam’s blog post about pgmq - [https://tembo.io/blog/introducing-pgmq](https://tembo.io/blog/introducing-pgmq)
* pg_later - [https://github.com/tembo-io/pg_later](https://github.com/tembo-io/pg_later); Adam wrote about this one too - https://tembo.io/blog/introducing-pg-later
* clerk_fdw -[https://github.com/tembo-io/clerk_fdw](https://github.com/tembo-io/clerk_fdw); for more information, have a look at our blog post about it - https://tembo.io/blog/clerk-fdw/
* Supabase wrappers - [https://github.com/supabase/wrappers](https://github.com/supabase/wrappers)
* pgrx - https://github.com/pgcentralfoundation/pgrx
* pg_cron - https://github.com/citusdata/pg_cron
* Kafka - https://kafka.apache.org/
* Tembo Stacks - [https://github.com/tembo-io/tembo/tree/main/tembo-operator/src/stacks/templates](https://github.com/tembo-io/tembo/tree/main/tembo-operator/src/stacks/templates); also check out our blog about them - [https://tembo.io/blog/tembo-stacks-intro](https://tembo.io/blog/tembo-stacks-intro)

Did you enjoy the episode? Have ideas for someone else we should invite? Let us know your thoughts on X at @tembo_io or share them with the team in our [Slack Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw).


## Transcript


##### _[00:00:13] - Ry_

Welcome to the show, Adam. Excited to chat with you today. How many postgres extensions have you authored in 2023?


##### _[00:00:23] - Adam_

Oh, it at least two.


##### _[00:00:28] - Ry_

At least two?


##### _[00:00:29] - Adam_

Well, in early 2023, I was just like, getting started and trying to figure out how to write one. And I know I wrote like a handful of them that didn't really do anything. I think the first one was just put like a rest server inside an extension and see what happens. Kind of didn't work very well.


##### _[00:00:57] - Ry_

Yeah, I remember that.


##### _[00:00:59] - Adam_

I think I made like, a prometheus exporter, and then recently there were two ones that are kind of more useful.


##### _[00:01:05] - Ry_

Yeah, that's great. Well, so obviously we know each other. We both worked together at Tembo. I mean, I could ask you questions as if I don't already know the answers, but since I do, I'm not going to do that. I was going to say getting into postgres, though, joining Tembo wasn't your first touch of postgres. Do you remember starting with, like I can't really quite remember when I started. But can you remember when you did?


##### _[00:01:33] - Adam_

Well, the first time I heard of postgres I'm pretty sure was like in undergrad, like database management systems class. And it was like, there's Oracle, there's these companies around it, and then there's open source stuff, postgresQL, you know? And I remember thinking, like, oh, that's And I probably Googled it and saw the elephant. And then I know I started using it in undergrad. I was doing some scientific computing stuff and I just needed somewhere to I didn't want to just keep writing to CSVs. I wanted to put it somewhere that was easier to search. And I just used postgres for it. Didn't really know what I was doing. It was just like, dump it into this database.


##### _[00:02:21] - Ry_

Nice, nice. And then as far as hacking postgres, that just started recently, or have you messed with the internals of postgres prior to this year?


##### _[00:02:35] - Adam_

Definitely not prior to this year. It's mostly focused on the application layer, building stuff on top of postgres. This year still getting deeper into the internals of postgres. I had installed some extensions before this year. Definitely didn't even think about how do you write build an extension, but it's.


##### _[00:03:00] - Ry_

Pretty easy to build them?


##### _[00:03:01] - Adam_

Yeah, that's very recent for me.


##### _[00:03:02] - Ry_

Pretty easy to build them. Right. Would you say?


##### _[00:03:04] - Adam_

Yeah. A shallow one is easy if you can learn rust. Yeah, it's a challenge. I think it's hard.


##### _[00:03:17] - Ry_

Yeah, I was kind of kidding.


##### _[00:03:19] - Adam_

And then there's like a learning curve, and then once you get over a curve, you can kind of get moving with it.


##### _[00:03:27] - Ry_

Maybe. Let's talk about the extensions that you're, I guess, most proud of or have the most traction so far. What are those?


##### _[00:03:39] - Adam_

Pgmq, I think, has the most traction message queue extension. It's a lot like SQS Amazon's simple Queue service or Redisimple Message queue except on postgres. Well, we wrote it for Tembo to help run our cloud. We needed a message queue between Control Plane and Data Plane, so we wrote it for that. And then just in the last couple of months, we started kind of talking about it in the community. And after we wrote a blog about it, we've had a few people from the community that didn't know before who are now consistently contributing to the project. So Pgmq is definitely the one that I think has most traction.


##### _[00:04:36] - Ry_

And I think you're also working on well, you kind of have a stack of them, right? Because your other extension relies on Pgmq. True?


##### _[00:04:48] - Adam_

PG later.


##### _[00:04:50] - Ry_

Is that true?


##### _[00:04:51] - Adam_

Yeah. Okay. Yeah, PG later, that's another extension that lets you submit a query to Postgres and then forget about it and come back later and see the results from that query. And that's built on top of Pgmq. So it's like a stack of extensions.


##### _[00:05:20] - Ry_

Nice. I guess you're in the position now to be the extension mentor for others in the company who may be building extensions.


##### _[00:05:29] - Adam_

I know.


##### _[00:05:29] - Ry_

I just hired a co op who's working on one, and I imagine you're mentoring him to some degree.


##### _[00:05:37] - Adam_

Yeah, Jay talking about? Yeah, Jay's. Great. Hey, Jay. Jay, if you're listening yeah. Jay's been working on the another extension written in Rust, Clerk FDW. So it's a foreign data wrapper around Clerk, which is like our identity provider. We just want to be able to build this data warehouse that has our users and their organizations and have that data persisted in our data warehouse. So we built well, Jay is building that foreign data wrapper around Clerk, which is pretty cool.


##### _[00:06:17] - Ry_

Yeah, we probably should give a shout out to Supabase for the Wrappers project that we're using to build that with. Sounds like it's been a pretty nice experience. Jay's a co op that just joined, like, last week and so already being very productive. So I'm excited. I think that there's the possibility of an explosion of new extensions for Postgres now that Pgrx allows us to use Rust. You agree with that?


##### _[00:06:51] - Adam_

Yeah, it's pretty powerful because take this Clerk FDW, that extension that Jay's building. We can bootstrap the software together the same way as you might do outside of Postgres, but we don't have to spin up another resource somewhere, manage a pod or another VM, can package it up into an extension, use Supabase Wrapper. So that's a software that's already built. It's tested. We don't have to reinvent the wheel on that. We write the extension in Rust. So we pull in Rust libraries that are already built, already tested. Then we write our own tests on top of these things and then package it into our extension and then deploy it as part of the database. And then we can kind of just monitor the data there and not have to manage another service that could crash.


##### _[00:07:54] - Ry_

Yeah, it's pretty nice. So I was going to change a little bit to...you've also been using a lot of other people's extensions. Again, probably a lot more since joining Tembo than before, but what are some of your, I don't know, favorite extensions that you've been exposed to?


##### _[00:08:15] - Adam_

Yeah, you said PG Cron a few different places. There's another extension that I'm working on. It's, like, really early, but it's kind of wrapping up kind of some of the stuff that Langchain does in Python, but wrapping it up into an extension, pulling in PG vector into that, pulling in pg_cron, pulls in Pgmq and PostgresML as well. So it's like a bootstrapped extension. So all of those are pretty good PostgresML, pg_cron, pgvector, and they all have pretty good docs, so you can get up and running with them quickly and kind of figure out what you need to do.


##### _[00:09:09] - Ry_

Yeah. So have you found that you've had to study the internals of postgres much as part of the process of building these extensions?


##### _[00:09:23] - Adam_

Not really too much. Only when I'm having trouble getting it up and running for the first time do I need to really look at postgres. But a lot of these extensions don't. They're not like touching with hooks into and replacing core functionality of postgres. They're extending things. So a lot of what PostgresML does is just give you functions that go off and make rest calls or download data from elsewhere in the Internet and put it in your database for you, give you access to some pre trained machine learning models. And it's not changing fundamentally how postgres runs. It's still like the normal postgres. It's kind of like a layer on top of yeah. Yeah.


##### _[00:10:19] - Ry_

I think some extensions can do surgery and some are, know, laying on top of and not messing with the core functionality.


##### _[00:10:28] - Adam_

Right? Yeah, it's an area I'm kind of new with that, so I haven't gotten super deep into replacing core functionality of postgres quite yet. But soon we'll probably start working in that space a little bit more.


##### _[00:10:47] - Ry_

What's, like the testing story? If you're a dev that likes to write TDD, test driven development, are you able to do that with extensions in particular, I guess, with Pgrx. What's the test driven story there look like?


##### _[00:11:03] - Adam_

Pgrx, I think, is pretty good. They have a way for you to say unit test or integration test for the extension that you're writing, so you can say, execute some queries and then make assertions on the outputs of those queries. So kind of like, have normal assertions that you would do in whatever language that you're testing. Pgrx has some tooling around like, oh, I want to spin up postgres 15.3, spin up a new environment for that, install your extension into it, and then run your test suite on it. Yeah, I guess it can get a little bit trickier, I think could be because depending on how complex the extension is, you could have system dependencies, um, like, oh, I need a specific version of GCC or something, or OpenSSL version something has to be installed. I haven't really quite found a good way to test all of those things to make it super portable to say, like, yep, all these test pass. And that means my extension is just good for everybody.


##### _[00:12:28] - Ry_

For the test running on your local machine. I know they're running on your local machine, but in a docker container or just natively.


##### _[00:12:41] - Adam_

You could do both, I guess. Kind of like my workflow for it. I guess I would do, like, run the test locally and then have the extension in a GitHub repo and have a CI pipeline that runs the same tests, but in Docker or within a GitHub workflow to be like, hey, before you merge this, you need to pass all these tests, kind of gate yourself a little bit.


##### _[00:13:10] - Ry_

That's great. Well, cool. So I was going to ask, as far as your background prior to Tembo, you were doing little ML engineering too. Did you use postgres much in that role? I guess the question is, did you use any of the special parts of Postgres or was it really just like a standard transactional store with little knowledge of the extension ecosystem?


##### _[00:13:39] - Adam_

Nothing too crazy. I've always tried to do a queue on postgres, so be like, build up this giant queue of things that a machine learning model needs to make predictions on, or make a bunch of different predictions, dump them into a queue, and then have another process. Look at all these predictions and pick the best one before giving it back to the user. But a lot of OLTP like high transaction workloads in kind of machine learning space. Yeah.


##### _[00:14:18] - Ry_

So you said you've been trying to build queues historically, a lot of times in bigger companies, there are less tools for various tasks. For example, use redis if you want to build a queue, or use snowflake if you want to build a data warehouse. I don't even know that these things were officially declared by any sort of powers that be. It's more like the sales reps at those companies decided that this company is going to be a salesforce company or a snowflake company. Right. It's kind of a slow boil that you suddenly realize, oh, I guess we have kafka now. I guess we're a kafka shop and starts with a POC and then ends up you have all these tools. We call it the modern data stack. But yeah, I'm curious how your take on that in particular? Around start with the queue since you've just implemented it in postgres and probably had to use other tools in the past.


##### _[00:15:16] - Adam_

Yeah, a couple of places that I've worked at, it's like, hey, we need to pass messages between two services. And any engineer will be like, all right, well, we're going to evaluate what we have here. We want to try to do things like, oh, let's keep things simple, not make things too complex. And then depending on the size of the organization, it'll be like, well, we use Kafka for messaging, so use Kafka. And so it's like, okay, so make progress. A lot of times it's better to not fight that and just be like, we want to make progress, we just need our application to work. It's not like Kafka wouldn't work for this, but it's definitely overkill for a lot of situations. So then it's like, okay, we're going to build this in Kafka and maybe the rest of the application is in postgres, but this message piece of it, we're going to put it in Kafka. And from the application perspective, it's kind of no difference. Like I said, it's an overkill tool for a lot of use cases. But then when things start to go wrong and need to troubleshoot it, it's like, okay, now we have to bring in the Kafka expert.


##### _[00:16:35] - Adam_

And if it's a big company, it's probably a handful of people who are on this Kafka team and they got a lot of other stuff going on. So it's like, what do you have to do? You have to learn Kafka. Yeah.


##### _[00:16:47] - Ry_

And you're a small use case, right? You're like a small unimportant use case. And so, yeah, you can't get their attention. You kind of accepted the fact that, okay, I can learn. It's kind of fun to learn new technologies and try new things out, right? That's the day. Zero joy of learning something new. But then now all of a sudden you've got to support it, right?


##### _[00:17:09] - Adam_

Yeah.


##### _[00:17:10] - Ry_

You support what you make a lot of. Yeah, you got judoed into that.


##### _[00:17:16] - Adam_

In my career, it was fun to learn Kafka and there's some things I really like about it, but then at the same time, it's a very complex tool and it does take a team to run and manage it. Same with RabbitMQ. If you're going to do those things, you need some people dedicated to making sure that they're functioning the way you expect it to.


##### _[00:17:45] - Ry_

Yeah, well, I think kind of leads into one of our core missions at the company, which you're leading at Tembo, which is our stacks. I guess it probably would make sense for you to say a few words on what we're trying to accomplish with stacks at the company.


##### _[00:18:05] - Adam_

Yeah. So stacks are workload optimized postgres clusters. So the message queue stack is one that we have and our goal with that is if you need to run a message queue, we want this to be the most optimized way to do a message queue on postgres. Of course, there'll be a point in time when it's like, hey, your use case has grown so big that maybe that stack's not going to fit you, but that stack will be to the very edge of what postgres can do for that workload. We're taking that same approach with our OLAP stack that we're building right now. We have an OLTP stack, there's a machine learning stack. So each one of these stacks is do it on postgres and we're going to make it be the best possible squeeze every last piece of juice out of postgres that we possibly can for that workload.


##### _[00:19:08] - Ry_

Yeah. And you're curating extensions for each stack. What else are you doing besides that.


##### _[00:19:13] - Adam_

Yeah, extensions are a big piece. A lot of that has to do with there are certain types of developer experience that we think people want around workloads. And then there's the postgres configuration itself. So like, what should shared buffers be or how many parallel worker processes and how should the auto vacuum vacuum error be tuned for that workload? That's a whole class of things that are unique to every stack. Of course, there's like a user interface component of every stack as well. So if you want to come up and to look and see and observe the stack, there'll be user interface metrics are kind of really tightly related to the UI, so there's different metrics for every stack as well. Some of them are going to be the same across stacks. But for example, current number of messages in a queue, that's like a metric that you can monitor, you can write alerts around that metric and it's mostly unique to the message queue workload.


##### _[00:20:32] - Ry_

Yeah. And if the message queue stack is competing against a commercial queue product, they probably have some sort of visualization of the state of each queue.


##### _[00:20:45] - Adam_

Right?


##### _[00:20:46] - Ry_

And so a postgres backed queue ought to have that same UI, that same monitoring tailored monitoring system. It makes it, I don't know how many times harder versus just configuration and curating some extensions, but I think it's all worth it to the user to be able to really defend their choice to use postgres for this use case against one of the modern data stack alternatives.


##### _[00:21:20] - Adam_

Right? Yeah. I think something really useful that I like about having stacks and having postgres aligned to specific workloads, the complexity of an overall application can really come down a lot by running everything on postgres. You could still have separate postgres clusters for workloads, like a certain set of CPU and memory dedicated to mission critical process A and a separate one for this other mission critical process. But still when it comes to troubleshooting these things, you're troubleshooting postgres and it's not like, hey, I have to switch and be like, okay, now I'm troubleshooting Kafka, or jumping to Redis or jumping to Mongo or Snowflake. It's still like the context switching I think, for the developers is big time minimized when it's still the same underlying data store between all the different workloads, same technology. Yeah.


##### _[00:22:27] - Ry_

And we have this vision of potentially having some built in stack connectivity, right, where these databases, if they're all kind of sitting back to back to back so you have five different stacks they could and should be able to communicate really well with each other. And you should be able to write queries across them in the same way that Citus allows you to write queries across an array of postgres clusters very efficiently. You should be able to do the same thing here and pull data from multiple stacks with a very nice user experience, again, without having to move data around. So that's one of the exciting things for me as a former airflow company founder. All these data pipelines are very painful between modern data stack companies. And one of the things I'm excited about is the possibility that we can give developers the option to not have to create all those pipelines.


##### _[00:23:36] - Adam_

Yeah, I'm really excited to work on that problem when we start doing that, but that'll be I think, a really big differentiator is to say I have ten different machines running postgres and I have a single pane of view across all of them. I think it's definitely doable. It'll be challenging.


##### _[00:24:02] - Ry_

Yeah, it's a dream we're chasing. Yeah. Good. Well, I think it was great chatting with you, Adam. I'm sure we'll have you on the show again. I know that, again, you've got a lot more extensions coming and appreciate the work you've done for the community so far and yeah, looking forward to seeing your future work and talking about it.


##### _[00:24:28] - Adam_

Sounds good. Thanks a lot, Ry.
