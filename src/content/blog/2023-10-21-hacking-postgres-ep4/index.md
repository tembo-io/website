---
slug: hacking-postgres-ep4
title: "Hacking Postgres, Ep. 4: Pavlo Golub"
authors: [ryw]
tags: [postgres, hacking-postgres]
image: './ep4.png'
---

In this episode, Ry and Pavlo talk about pg_timetable, about the value and place of risk in the ecosystem, and about building for the Postgres core. If you haven’t seen or listened to it yet, you can watch below, or listen on Apple/Spotify (or your podcast platform of choice). Special thanks to Pavlo for joining us today!

<div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', marginBottom: '5%'}}>
  <iframe
    style={{ position: 'absolute', top:'10px', width: '100%', height: '100%' }}
    width="100%"
    height="400"
    src="https://www.youtube.com/embed/uDfUxtZK8_Q?si=wrmh4_2l5-LpNOlY"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen>
  </iframe>
</div>

Want to know more about something they mentioned? Here’s a starting point:


* Cybertec - https://www.cybertec-postgresql.com/en/
* pg_timetable - https://github.com/cybertec-postgresql/pg_timetable
* pgwatch - https://github.com/cybertec-postgresql/pgwatch2
* pg_cron - https://github.com/citusdata/pg_cron
* baseql - https://www.baseql.com/
* pg_dump - https://www.postgresql.org/docs/current/app-pgdump.html
* vscode - https://github.com/microsoft/vscode
* GoLand - https://www.jetbrains.com/go/

Did you enjoy the episode? Have ideas for someone else we should invite? Let us know your thoughts on X at [@tembo_io](https://twitter.com/tembo_io) or share them with the team in our [Slack Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw).


## Transcript


##### _[00:00:12] - Ry_

Hello, welcome to Hacking Postgres. I'm Ry Walker, founder of Tembo, a managed Postgres company. And today I have Pavlo Golub. Did I say that right? Pavlo? Yeah, you can fix it from Cybertec as my guest. So Pavlo, welcome to the show.


##### _[00:00:30] - Pavlo_

Yes, thank you for having me. Hi there.


##### _[00:00:32] - Ry_

Hi there. Yeah, so maybe you could start by giving us a quick background, like where you grew up and what were you doing before you started working on Postgres.


##### _[00:00:41] - Pavlo_

Okay, so I was born in Soviet Union so I'm a little bit old, but yeah, I lived in Ukraine. And the first time I saw Postgres, when I was in my high school, it was like fourth year of high school and at that time it wasn't very popular. Everybody we're talking about MySQL like the only database with open source and yeah, at that time I saw the PostgresQL, I tried to install it and run it. It was hard for me to do that because at that time the version was like 7.4 something and at that time there was no installer for Windows and we were mostly like Windows guys at that times. So, yeah, I need to install Linux and then install Postgres. Yeah, I managed to do that, but I wasn't happy about it. The whole process is like I feel like cumbersome or something like that. So I left it for like a couple of years and then my first job in IT I was a support guy, so it was directly connected with the Postgres. So I started my IT career with Postgres and I'm happy that I had this chance.


##### _[00:02:36] - Ry_

Yeah, that's crazy. I don't personally remember when I first started using Postgres. I think it could have just been when I started using Ruby on Rails, I don't know. But it's funny, I don't remember when I first used Linux or a lot of things, but it's great that you have that distinct memory. You started in support, you've built some stuff. Now on top of it, tell me about the body of work you've done on Postgres or with Postgres. I'm curious to know what you've built.


##### _[00:03:13] - Pavlo_

So right now at Cybertec I'm a consultant, so my position called consultant, they called me consultant, but I prefer to think about myself as a developer. I'm not an Admin, I'm not a DBA, I'm a developer. So I'm mostly doing developing things for Postgres. I had a couple of small patches to these source, but I don't consider them as major things. So I did some client libraries for Delphi if somebody still knows what it is, and later I switched to C, Go, Python, that kind of stuff. And right now I'm mostly develop with the Go language. And at the moment we have a couple of utilities made in Cybertec, so I'm in charge of them. So one of them is like pg_timetable, which is a scheduler for PostgresQL, and another is pg_watch which is a monitoring solution for Postgres.


##### _[00:04:30] - Ry_

Yeah. Yeah. What caught my attention was pg_timetable because I come from a company that my previous company was Apache Airflow. So the idea of doing dags jobs that are chained off of other jobs, to me, there's no other way. Trying to schedule jobs and hope that they finish by the time of the next one, that's dependent is something that people used to do and they should never, ever do anymore. But I'm sure it still happens. Right. So certainly if people are using pg_cron, no way to chain them, as far as I can see.


##### _[00:05:11] - Pavlo_

We had a client and we have a process, like, lasting, like 14, 15 hours consisting of many steps which are dependent in some complicated ways. So we used a make file to split them into the jobs and to specify that this stage must be executed after that. And that and that worked fine. It's cool to have a special utility to run that kind of jobs or chains, whatever.


##### _[00:05:56] - Ry_

Yeah. Well, one of the things I think about a lot is how Postgres, the Postgres server is doing lots of jobs, right. I don't know how many processes it's dealing with, someone with better internal knowledge, but I know it's certainly vacuuming. It's certainly processing queries. It's doing a lot of things right. And then question is I'm a fan of SRP single responsibility principle and programming in general, but I also like monoliths too. We all have conflicting ideas in our heads. And having a queue managed inside the Postgres, you're kind of like straddling, right? Because you have a container next to it. So some of the work is happening over there, but some of it is inside of Postgres too. Why not have it all be inside? What are you thinking about for future versions of pg_timetable? Why not just do all the work inside of the running Postgres cluster?


##### _[00:07:00] - Pavlo_

So, yeah, thank you for the question because that was like, the second thought when we released the pg_timetable. So the idea is that PostgreSQL uses a separate process for everything. If you have a new connection, you need a new process. So if you have a background worker for cron or for another scheduler, you will need a background worker. A separate process. Yeah. It's possible. We can create an extensions with Go. It's possible, yes. But right now, I'm not sure what benefits we will have.


##### _[00:07:58] - Ry_

It also feels kind of gross, right, to think of throwing it all together. But I have this conversation all the time with my team. If you have a system that's dependent on the Postgres, let's say there's an API, right? And the API, if the Postgres is only invoked when the API happens you could theoretically put all that compute into one bucket and just let the API talk to I'm thinking, like, say, take it's a Rust API. Should you serve that Rust API as a separate container and have the separation of concerns? Or should you just create a custom Postgres extension and let the Rust run inside the Postgres cluster and there's zero latency to the data in that regard, but it's a little bit of a Frankenapp at that point. It's a tricky problem.


##### _[00:08:52] - Pavlo_

I will tell you that, that I want to implement this scheduler as an extension for Postgres, not because I think that we will have some benefits, but because this is very interesting task for me as a developer, first of all.


##### _[00:09:08] - Ry_

Yeah. Is pg_timetable supported by any cloud providers right now?


##### _[00:09:16] - Pavlo_

Yeah, we can run pg_timetable against any cloud provider. If you want, you can run it in Docker and Kubernetes as a standalone binary, or even you can try to grab the source code and put it into this AWS fancy one time run and forget I don't remember how they called it.


##### _[00:09:46] - Ry_

Yeah, but because it has the sidecar, it probably can't be like a standard extension in RDS, for example.


##### _[00:09:54] - Pavlo_

Right, it might be, but I think to make this happen, we need to somehow communicate with AWS and make that happen. It's more like politics, not yeah, well.


##### _[00:10:10] - Ry_

I think it's also just like I don't know if any of the other extensions that they offer have a sidecar requirement. Right. So that's one of the things we're thinking about at Tembo is like, let's allow sidecars if you allow sidecars to extensions in our managed service yes. It's like, again, it's a lot more dangerous in the sense that there's more things that could break, but it's also more powerful. And if we had the rule that dangerous things are bad and you wouldn't have a combustible engine inside of a car where little explosions are happening all the time to power it.


##### _[00:10:50] - Pavlo_

On the other hand, you can build your own image, right, and somehow to limit the binary in it to do some dangerous things, et cetera.


##### _[00:11:02] - Ry_

Yeah. I joke sometimes and say we're building the dangerous Postgres just because it's not really we support 150 extensions now, so it's like, yeah, our support footprint is increased and scarier than if you had 75, but I still say it's worth it to the developer to have the capability. So I'd love to get pg_timetable as a standard option. I want to use it, basically. What's funny is I'm building a data warehouse right now for our company, and I started with pg_cron, and I have these four jobs that all start at the same time and it's very early, so it's not a problem. But I would love to have them be chained. Like I said, I could do that fake with some spacing things out, but I really feel like I've just stepped back 20 years into the world of early data processing. So I appreciate what you built and use it soon.


##### _[00:12:08] - Pavlo_

Okay. Let me know if you're happy with it.


##### _[00:12:11] - Ry_

Yeah, I think it's a good idea and it could also help developers avoid having to go pick up some other tool to take the next stage of their data processing, which to me is a big win. And we're trying to make the Meme "Postgres for everything." I know you are too, in a sense, because you built the extension. But yeah, I think there's so much it can do, and it can do a lot more than just writing and reading data.


##### _[00:12:54] - Pavlo_

One more thing about having the pg_timetable as an external application is that you can use your own binaries inside jobs like baseql or pg_dump or something, like to grab something, to convert something, et cetera. So we want to have a possibility for developers to create their own docker images with the binaries or tools they only need and pg_timetable. So in this way it sounds like a Swiss knife, right? So I need a pg_timetable and a couple of utilities for grabbing something to manipulate with files, et cetera. And then we pack it and that's all. We don't need to think how we should allow the application to install it or to have it on the system version, et cetera, et cetera.


##### _[00:13:58] - Ry_

Yeah, basically what you're saying is it gets even more dangerous quickly, right? Like the base use case is one thing, but then when people start doing some more wild things, including their own, it could be their own packages, right? Their own, of course, completely custom. Nobody knows what's inside of it. It could be a bitcoin miner, it could be anything, right?


##### _[00:14:23] - Pavlo_

Yeah.


##### _[00:14:26] - Ry_

Are you working on the next version of it or is it pretty stable right now and doesn't require a lot?


##### _[00:14:32] - Pavlo_

So at the moment we are stable. So we are open for ideas and then requests, et cetera. But at the moment we are fine, I believe. So it's like in maintenance mode, so we update versions, packages, et cetera. So no new box. I'm happy with it.


##### _[00:14:56] - Ry_

Did you build it? Was it sort of a small team there or did you kind of build it solo?


##### _[00:15:02] - Pavlo_

So the initial idea was by Hans, our CEO, and yeah, that was my first project in Go. So I was trying to learn a new language to see how can I do this? And we are now here. That's cool, I believe.


##### _[00:15:36] - Ry_

What were the biggest challenges would you say you faced while working, while building it? Was it hard to, for example, understand internals or was that part easy? I'm kind of curious what was toughest.


##### _[00:15:49] - Pavlo_

For me, I would say that the new tools that you need to use, like if you are familiar with your favorite IDE and then for Go language, you need to switch to something like Vs code or Go land or whatever. This is completely new tool for you. And you have no this muscular memory for shortcuts, et cetera, et cetera. It's kind of difficult. Like six months I was trying to get used to new tooling, but after that I'm pretty happy.


##### _[00:16:26] - Ry_

Yeah, that's so when was it that you started working on timetable? pg_timetable?


##### _[00:16:35] - Pavlo_

Maybe three years ago, something like that.


##### _[00:16:39] - Ry_

Yeah. Okay, well, that's great. So have you guys implemented it many times now for customers or how has it been? I know it's not a commercial product, but I assume it should be helping the consulting business, right? Yeah.


##### _[00:16:58] - Pavlo_

So it usually goes in a package with something. Usually if we have a new client, we are talking about high availability and we are talking about monitoring, and we are talking about that and that, and then we say, okay, we have a scheduler if you want it, and usually people want it. I don't remember we have like a standalone cell for a pg_timetable. But yeah, it's usually like packaged into something bigger, usually with a high availability and monitoring.


##### _[00:17:33] - Ry_

Got it. It’s like a sweetener, right? Cool. Well, maybe I'll shift into some more general topics. I'd love to know what are some of the developments in Postgres ecosystem that you're excited about?


##### _[00:17:50] - Pavlo_

So the Postgres itself, the core, I always want to constantly want to do something for the core, but.


##### _[00:18:03] - Ry_

It's like you're racking your brain around there.


##### _[00:18:07] - Pavlo_

The process itself is not like user friendly. First of all, you need to communicate through the email lists. No GitHub, no issues, no pull requests. And you need constantly update your patches because the development is very active, and you need to defend your patch against many people in the community because why you did it, what purpose, why you do it that way, not another. So that might take some time for.


##### _[00:18:46] - Ry_

Who are your favorite people in the Postgres ecosystem? You hate to play favorites, but people I should interview get to know anybody come to mind?


##### _[00:18:56] - Pavlo_

Yeah, a lot of them, frankly speaking. Well, I think that the community is the reason, number one, why I am still doing Postgres things. I was working like, for five years without knowing nobody from the community. And then in 2011, I was first time on the PG conference in Europe, in Amsterdam, and that changed my mind. Absolutely. I saw what the community is and what are the main things and why are those working that way and not another. So if you want names, so Bruce Momjian, for sure. Magnus Hagander, Ilya Kosmodemiansky, Vik Fearing, Andreas Scherbaum, a lot of them. Like Lætitia Avrot . A lot of them.


##### _[00:19:59] - Ry_

Well, I'll reach out to those people. It's obviously a very big community too, certainly, considering the extent, anyone who's touching it is very excited. First, I'm going to the know, the New York City conference here in a couple of months. Yeah. So I'm excited to meet a bunch of people there. And we went to an event in San Jose last spring, which was fun. All right, so here's another one. If you had a magic wand and you could add any feature to Postgres? What would you change about it or what would you add?


##### _[00:20:39] - Pavlo_

I don't think that I can change something in a way that it will be a brick and change but I would like to see if we can implement Postgres using threads, not the processes. I would like to see if that might be better solution that we have now. I'm not sure.


##### _[00:21:04] - Ry_

It's being debated, right?


##### _[00:21:07] - Pavlo_

Yeah, absolutely.


##### _[00:21:08] - Ry_

Yeah, we'll see.


##### _[00:21:09] - Pavlo_

It's a hot topic.


##### _[00:21:10] - Ry_

Hot topic, yeah. I did join the mailing list for a short period of time. I'm starting a company too and it just was too much. I was like, oh my gosh, this is a fire hose and someday I want to be able to have the time to consume it. But today wasn't that day. Is there anything about Postgres that no one agrees with you about? Do you have any contrarian views about any part of it that you can think of?


##### _[00:21:38] - Pavlo_

Yeah, probably my views about the Windows because I was a Windows guy and I'm still a Windows guy and I'm always saying that we need to support Windows as well as we support Linux. So that means installers for Windows and extensions and tools, et cetera, et cetera. And people usually say, no, Linux is fine and that's enough is enough.


##### _[00:22:08] - Ry_

Yeah, it's interesting, it's fun. I'm interested in a lot of different areas of programming. I was looking at, say, Unity, you know, game development and it's C# and I'm like "Ugh" and it seems like very Windows centric and I'm like because I'm a Mac user and whatever. For me it'd be like Mac, Linux, Windows in terms of my priority but I'm like certainly not C#, right? But anyway, yeah, the religious wars will never end there, I guess, in terms of platforms.


##### _[00:22:47] - Pavlo_

The bad thing about our approach right now that I think that we don't have enough good GUI programs for PostgreSQL every time we are using psql to show something to demo. And I think that for newbies it would be much easier to follow a demonstration if you use some fancy GUI application.


##### _[00:23:15] - Ry_

Well, it was great chatting. Where can listeners find you online? Are you on social media anywhere?


##### _[00:23:23] - Pavlo_

Yeah, I'm like on every kind of social media. Like GitHub, LinkedIn, Twitter, Instagram, Facebook, Blue Sky, Mastodon.


##### _[00:23:36] - Ry_

Great. All right, well, like I said, someday soon I'm going to try pg_timetable and I'll give you some feedback and maybe some ideas in the GitHub and we'll see you there, I suppose.


##### _[00:23:47] - Pavlo_

Sure. Thank you.


##### _[00:23:48] - Ry_

Great, great chatting with you. Thanks for joining.


##### _[00:23:51] - Pavlo_

Thank you. Thank you.
