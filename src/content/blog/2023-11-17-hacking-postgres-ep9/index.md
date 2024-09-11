---
slug: hacking-postgres-ep9
title: "Hacking Postgres, Ep. 9: Bertrand Drouvot"
authors: [ryw]
tags: [postgres, hacking-postgres]
image: './ep9.png'
---


Build the thing you wish you had right now. That’s the story behind Hacking Postgres, Ep 9, where Ry sits down with Bertrand Drouvot of AWS Cloud. Today they talked about the struggles of trying to build from scratch vs having a template, what should be core vs an extension, and being able to see what’s really happening inside your database.

Watch below, or listen on Apple/Spotify (or your podcast platform of choice). Special thanks to Bertrand for joining us today!

<div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', marginBottom: '5%'}}>
  <iframe
    style={{ position: 'absolute', top:'10px', width: '100%', height: '100%' }}
    width="100%"
    height="400"
    src="https://www.youtube.com/embed/Jwu8iotiZiw?si=Zya0z8YP2zmOKx9d"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen>
  </iframe>
</div>

Want to know more about something they mentioned? Here’s a starting point:



* pgsentinel - https://github.com/pgsentinel/pgsentinel
* pgstat - [https://github.com/gleu/pgstats](https://github.com/gleu/pgstats)
* pg_orphaned - [https://github.com/bdrouvot/pg_orphaned](https://github.com/bdrouvot/pg_orphaned)
* pg_directpaths - [https://github.com/bdrouvot/pg_directpaths](https://github.com/bdrouvot/pg_directpaths)
* pgrx - [https://github.com/pgcentralfoundation/pgrx](https://github.com/pgcentralfoundation/pgrx)
* Logical decoding on standby: [https://bdrouvot.github.io/2023/04/19/postgres-16-highlight-logical-decoding-on-standby/](https://bdrouvot.github.io/2023/04/19/postgres-16-highlight-logical-decoding-on-standby/)
* Dalibo visualizer - [https://explain.dalibo.com/](https://explain.dalibo.com/)

Did you enjoy the episode? Have ideas for someone else we should invite? Let us know your thoughts on X at @tembo_io or share them with the team in our [Slack Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw).


## Transcript


##### [00:00:12] - Ry

Welcome to Hacking Postgres, a podcast about extensions, extension creators, and other interesting, innovative things in the world of Postgres. I'm Rye Walker, founder of Tembo, a managed Postgres company. And today I'm here with Bertrand Drouvot. And I know I said it poorly, but Bertrand, welcome to the show.


##### [00:00:34] - Bertrand

Thanks for having me. And no, that was perfectly said.


##### [00:00:39] - Ry

Yeah, I'd love to start with if you could give us a quick background. Where'd you grow up? I'm guessing it's France.


##### [00:00:49] - Bertrand

Yes.


##### [00:00:51] - Ry

What were you doing before you started working on Postgres? I'm always curious to hear background.


##### [00:00:57] - Bertrand

Yeah. So as you can hear, I am French. I grew up in the east of France. So before doing Postgres, I did about 20 years of Oracle DBA as a freelancer or working in some companies. And then I switched to Postgres about five years ago now and doing it as a full time job since about four years now.


##### [00:01:27] - Ry

Awesome. Yeah. Do you remember when you first started using Postgres? I mean, you probably touched it earlier in your career, or was it really like a first touch just five years ago?


##### [00:01:38] - Bertrand

Yeah, it was really a first touch, like five years ago. Before that this was mainly Oracle but wanted to see something else and wanted to contribute one way or another, not using a black box. And so that's why I moved to Postgres.


##### [00:01:56] - Ry

Do you like Oracle better than Postgres?


##### [00:02:00] - Bertrand

That's not the same, but I prefer Postgres because I can be involved in the new features, bug fix and all this kind of stuff.


##### [00:02:10] - Ry

Yeah. Awesome. Let's talk about some of your Postgres work. I know you've worked on pgsentinel, but yeah, I'd love to know what you've built in the past and then maybe what you're working on now. But we can start with the past.


##### [00:02:26] - Bertrand

Yeah. So when I started to study Postgres, I was comparing with what I knew in Oracle, in the Oracle world, and I was like something like active session history was not there. And I was like, so let's try to build this. And this is how pgsentinel came up. So it's an extension that record active session. So it's pulling regularly active session from pgstat_activity. You can define the sampling period and as well as the number of record to retain. It's in-memory ring buffer. And before PG 14, I think the query ID was not present in pgstat_activity. So I had also to make use of, I think the [inaudible 00:03:18]  analyze hook to get the query ID and to show this up so that in every pgsentinel record you see what the session was doing and which query ID was associated at the time of the sampling.


##### [00:03:33] - Ry

It's interesting. We're literally building dashboards right now and I think we need pgsentinel, perhaps because I'm like, I want to know the history of the sessions. Does it get exposed? I don't know. Are people getting this data pushed out via because like we we consume all these metrics from Postgres via Prometheus. I wonder. You said it's stored in memory, but how do I access that besides running a query, I guess.


##### [00:04:06] - Bertrand

Yeah, so there is basically a view on top of the in-memory ring buffer. So you can query the data and I guess you can push it to Prometheus.


##### [00:04:17] - Ry

Yeah, it's awesome. Yeah. Okay, I think I just found a solution to a problem by inviting you to the podcast. Thanks. Are you actively working on that or is that pretty much completed? What are you working on these days?


##### [00:04:36] - Bertrand

Yeah, so for [inaudible 00:04:37]  it's more ensuring you know when there is a new measure, ensuring it compiles and still works as it should and no more than that, and fixing bugs when they are reported. I also wrote another extension which is a pg_orphaned, could be useful to detect or find files. I mean in Postgres it's easy to create orphaned files. You just begin create table, insert some data and crash the server. Then you will get orphaned files so the extension detects the orphan files. Then you can move them to a backup directory and verify everything is still okay and then delete them or push them back in the original directory if anything went wrong. It also takes care of existing transaction using a dirty snapshot so that you can see transactions that have started but not committed yet. So that you don't move files that are part of any active transaction. And another one that is funny is pg_directpaths. It enables to do insert bypassing the share buffer and writing directly to disk. It has performance benefits because at the end you do less work. I mean you don't need to find a free buffer and all this stuff you just write to disk. And also it generates less [inaudible 00:06:13]  because it only flush [inaudible 00:06:17]  images by a bunch during that time.


##### [00:06:21] - Ry

Interesting. I'm curious the origin of these extensions, like for example pgsentinel. Like for know, you work at AWS, right? Are you on like the RDS team? I'm curious how it's organized. Are you working directly on the features of that or are you working with customers trying to use those RDS and Aurora?


##### [00:06:47] - Bertrand

Yes. So currently I am part of the RDS contributor Postgres team, which our role is mainly to contribute to upstream fixing bugs and provide new features.


##### [00:06:59] - Ry

Got it. Okay. But like Sentinel, was that something that RDS team wanted or was that like a customer, what caused you to decide to work on that? Or was it like your own idea? Like, hey, you just personally wanted it to exist. I'm curious, like the origin of the project.


##### [00:07:17] - Bertrand

Yeah. So for pgsentinel, I was even not employed by AWS at that time. I did it when I started to learn Postgres, in fact, because I like to learn doing something and just not reading books or whatever.


##### [00:07:34] - Ry

Got it. All right, that's cool. Yeah. So are you building extensions for Postgres as part of your, I get like you're contributing to the core project, but is the extension work similarly just your own personal interests or is it related to making the RDS platform better?


##### [00:07:58] - Bertrand

I guess, yeah. So pg_orphaned is an extension that is being used internally because we see orphaned files, so we have to deal with them. And so that's why this extension has been built. pg_directpaths. It was more for fun and to mimic an oracle feature that is allowing direct path insert.


##### [00:08:27] - Ry

Going back to building your first extension, what challenges were you faced with? What was hard about it?


##### [00:08:35] - Bertrand

Yeah, it was not that easy. So first of all, there is a lack of kind of template. You have to find an existing extension and try to, I mean, at least that's what I have done, try to understand how the existing extensions works and try to find documentation around it. I think it was not that easy. I think it is going better with pgrx because now it kind of provides an initial template so you can start building on top of this. But yeah, it was not that easy at the beginning.


##### [00:09:12] - Ry

Yeah. Would you use pgrx and Rust to build your next extension? Or, I don't know, maybe you're a hardcore C++ guy and prefer that. I'm curious, what's your thought on that?


##### [00:09:27] - Bertrand

Yeah, so the last one I built, I built it in C and in Rust, just because I am newcomer in Rust and I wanted to learn Rust and pgrx as well. So yes, I started to learn about it. So I think maybe there is some limitation in Rust. So it all depends what you need to do for memory management and this kind of stuff. Maybe it's more difficult outside of the C world for Postgres.


##### [00:09:54] - Ry

Yeah, I think I've talked to Eric about not everything has been exposed in pgrx, so you may have to... If you're doing something super deep, it may not have the right hooks for you.


##### [00:10:07] - Bertrand

But the cool thing is there is module that you can rely on. So it's easy if you want to interface with someone else's work well.


##### [00:10:20] - Ry

The other thing I think it brings is that a standardized template that helps a new extension developer, you don't have to go hunt for one similar to yours. I imagine you probably spent some energy like trying to look at all the different extensions to find the right pattern, the close enough pattern to borrow. Yeah. So are there big milestones related to either your extensions or you could even say in Postgres that you're looking forward to?


##### [00:10:54] - Bertrand

Yeah. What I would like to see is improvement in observability and this kind of stuff. For example, there is wait event, but for the moment there is no really details around it. For example, if you have a buffer content wait event, I would like to know for which relation, for example. And so this is kind of stuff I would like to try to contribute myself and to improve. That's an area I am interested in.


##### [00:11:29] - Ry

Is your goal to become a Postgres committer? Are you working towards that in your head?


##### [00:11:37] - Bertrand

Yeah, my goal is first to be a contributor because for the moment that's not the case. And yeah. Trying to move step by step. Yes. And to improve my knowledge and improve the product if I can.


##### [00:11:52] - Ry

Yeah. I think our CTO at Tembo did an analysis recently and I think he saw it was like forget it was like seven and a half years average amount of contributor time before you get to be a committer in Postgres. I'd say it's as much time as going to school to become a doctor, maybe even longer. It's pretty high bar. I think it's great in some ways that Postgres is so selective.


##### [00:12:24] - Bertrand

So maybe I'm already too old to reach this goal.


##### [00:12:27] - Ry

I don't know. I don't know. Yeah. Well that's good. I'm curious, kind of shifting away a little from Postgres, but as an engineer, what are some of the most important lessons you've learned over your career? I know this is kind of an open ended question, but does anything come to mind?


##### [00:12:48] - Bertrand

Yeah. So listen to others, learn from others and accept remarks and different point of view. I think it's very important.


##### [00:12:59] - Ry

Yeah. What do you think about the way Postgres work is managed? Mailing list and diffs and I guess patches. Does it bother you at all or do you kind of find it a refreshing difference from the GitHub way?


##### [00:13:20] - Bertrand

Yeah. So I am not that young. So working with email for me is perfectly fine and I think it works pretty well. I mean, the project I think is working well that way. But yes, I can imagine that maybe younger people would like to work differently than by email, but for my personal case, that's okay for me.


##### [00:13:47] - Ry

Yeah, I think the reason why I think it works so well is it's truly a global community. Right. Obviously if you have everybody in approximately the same time zone on a team, you can make decisions and have conversations outside of email. But I think the discussion first, it's almost like a demo first, design first sort of mentality versus Hey, A PR just popped in. Let's talk about that code. I don't know, I think it's refreshingly different. I think some other open source projects that want to be notable could adopt this methodology, even though on the surface it feels very frictionful. But I think it's intentionally that way. Let's talk about this before we do it, right?


##### [00:14:38] - Bertrand

Yeah, that's right. And also explain why you would find this useful and everything like. Yes, exactly.


##### [00:14:45] - Ry

Yeah.


##### [00:14:46] - Bertrand

And also there is conferences, I mean during conferences we can reach out to people and speaking about ideas and what you are working on as well.


##### [00:14:55] - Ry

Yeah. Do you go to the US conferences?


##### [00:15:00] - Bertrand

Very much? I went to PGConf, New York, not the last one, but the one before, so two years ago. And yes, that's for the US. That's the only one I did for the moment.


##### [00:15:12] - Ry

Got it. Yeah, I was in New York, this most recent one for the first time. Yeah. It was an interesting experience to see how internal is a lot of the vendors and builders of Postgres at the event. I think again, it's just impressive to me that Postgres has gotten to the point that it can have an event like that and that's sustainable. A lot of other open source projects I think can't pull that off without being somehow a commercial endeavor. So I think it's cool.


##### [00:15:49] - Bertrand

And there is also PGConf Europe. That is a very big one as well.


##### [00:15:55] - Ry

So talk to me, do you spend more of your. I would like to give people a chance to talk about the commercial product they're working on too. Are you spending more time on RDS or Aurora? Or are the lines between those pretty blurry in terms of how you work on your product?


##### [00:16:14] - Bertrand

No, I spend almost all my time on community side of things and I am still involved in some Aurora or [inaudible 00:16:23]  related project because I was working in this area before I joined the Postgres contributor team.


##### [00:16:31] - Ry

Got it.


##### [00:16:33] - Bertrand

And yes, we are involved in case there is a bug or things like this.


##### [00:16:37] - Ry

Right, of course. Yeah. That's the idea is to have, it's nice to have a pack of contributors nearby when things are going.


##### [00:16:47] - Bertrand

Yeah. That helps.


##### [00:16:49] - Ry

Yeah. Okay. All right. That makes sense. It sounds like the role is pretty pure now. Pure community.


##### [00:16:57] - Bertrand

Yes.


##### [00:16:58] - Ry

Except when asked, what are some of the developments in Postgres ecosystem that you're excited about, whether it's other extensions or even stuff in the core.


##### [00:17:13] - Bertrand

Yeah. So I contributed to logical decoding on standby. I think that is now part of PG 16. I think it's a very useful feature and very asked one, so I think that's good. And now I am mostly involved in the slot synchronization. So to synchronize a slot on standby from slot on the primary so that during your failover you can resume working from the slot.


##### [00:17:47] - Ry

Tell me I'm new. I'm sort of new to Postgres. I'm meeting all these people, meeting you for the first time here. Who are some of your favorite people that deserve attention for their good work? I'm curious. Name two or three people and maybe potential future guests of the podcast.


##### [00:18:09] - Bertrand

Yeah. So, I mean, there is people working on the community side and also people not known. So it really depends. I mean, the community itself is very good and really kind to help and all this stuff. So that's good. I mean, everyone on [inaudible 00:18:26]  is good people.


##### [00:18:28] - Ry

Yeah. So you could just randomly select someone and then you're going to find someone good. Yeah, I got it. Did someone recruit you? Who was it that got you into Postgres? Who hooked you in from Oracle Land?


##### [00:18:45] - Bertrand

Myself.


##### [00:18:46] - Ry

Oh, you just decided to defect one day, right?


##### [00:18:50] - Bertrand

Yeah, exactly. I was like, I really want to contribute to something open source. So doing databases, since 20 years, I choose a databases, and Postgres was the evident choice for me.


##### [00:19:04] - Ry

Yeah. Okay. Have you ever messed with MySQL? Did you consider MySQL at the same time?


##### [00:19:10] - Bertrand

Not at all.


##### [00:19:11] - Ry

Not at all. Yeah. Why not now? Okay. All right, so if you had a magic wand and you could add any feature magically to Postgres, what would you use that magic wand on?


##### [00:19:26] - Bertrand

Yeah. So, observability to improve this area, I think now it's very rich in term of feature and development feature, but observability, I think it's really an area to improve my opinion.


##### [00:19:43] - Ry

It's tricky with an open source project. Again, I'm sure AWS you guys do it a certain way too, but we get, I don't know how many 350 Prometheus metrics out of it right now? Would you argue that? How many more bits of information should we get? What's great observability? It seems like a lot, but I also think sometimes I'm looking for information that's just not there. So maybe a lot of low hanging fruit has been done, but not the hard stuff or. Yeah, I'm kind of curious what's missing in the observability that's available today.


##### [00:20:26] - Bertrand

Yeah, so I think it's really, for example, wait event. I would like to have more details like depending on each wait event, for example, data file. Wait which file for example. Also, since how long are you waiting on this wait event and stuff like this?


##### [00:20:47] - Ry

Do you feel like is that data for, it's really for the people running Postgres, not so much for the end user necessarily. Right. You're looking for better observability for the managed service provider of.


##### [00:20:59] - Bertrand

Yeah, for DBA, I think DBA, yeah. Especially the one coming from Oracle and they used to have a lot of observability that I think.


##### [00:21:14] - Ry

Yeah, it's interesting. I'm trying to think the role of DBA. I think the more managed Postgres there is, the less DBAs there are per se in terms of having access to those low level details. But yet in Postgres a lot of people still self host and you probably expect like that'll never go away. Right.


##### [00:21:44] - Bertrand

But even in managed services for the moment, we can only provide what is available. If you look at performance insight, for example, you have the wait events, but at some time you need to guess what is really happening because there is a lack of details, I think.


##### [00:22:04] - Ry

Yeah. So you would make that available again in your magic one scenario you would add that information and you would make it available even to end users in RDS because it can help them understand how to optimize how they're using RDS. Right?


##### [00:22:21] - Bertrand

Yeah, exactly.


##### [00:22:22] - Ry

Okay, I like that. Any other areas of observability that you think are big opportunities for improvements?


##### [00:22:33] - Bertrand

Yeah, for example, when a query is running, we'd like to know in which part of the plan is it running currently and pgstat_activity displayed the plow ID. So I can also know which Plow ID was used in the past, which one is used currently and maybe there is a bad plan that were used and that's why it were slow before this kind of area.


##### [00:23:01] - Ry

Yeah.


##### [00:23:02] - Bertrand

Also able to export statistic and import statistic table statistic.


##### [00:23:09] - Ry

Do you ever run a query and it's like I would say I'm more on the novice side. I mean, I can write some pretty nice queries with all kinds of features, but I really don't understand how files are interacting and so on. But sometimes I run a query and it's like, oh, this one's taking a long time. I wonder why obviously. Has it ever been thought like it'd be kind of cool to run that same query, but get a visual of what's going on inside? Are there services or have you seen anything like that where a novice user could visualize what's going on inside of a long running query kind of as it's happening? Or does it have to be like an analytical process to figure out why it's going to go slow?


##### [00:24:02] - Bertrand

I think so once you have the explain of the query, there is some tools like for example one that Dalibo provides which can graphically represent your execution. And then with the hotspot and the one that are taking most of the time, it's very important to visualize this kind of thing.


##### [00:24:28] - Ry

So which tool did you say does that?


##### [00:24:30] - Bertrand

I don't know the name by heart, but it's done by Dalibo.


##### [00:24:35] - Ry

Okay, Dalibo.


##### [00:24:37] - Bertrand

Yeah.


##### [00:24:37] - Ry

Okay, I'll have to check that out. Yeah. Again, one of the things we're trying to do with Tembo is just bring advanced Postgres things to novice users. As you know, most people using Postgres have gone 1% deep into the depths of what's there and it's pretty intimidating for new users, I think. In a good way. I think it's nice that it's deep and not shallow, but it's a lot. True. That's true. Yeah. I mean the same thing with like Linux, right? Or git. If you actually try to understand how git works, you'd be like oh man, is there anything about Postgres that almost nobody agrees with you? Do you have any contrarian opinions on anything? I know this is like me trying to get you to fight with the community, but I'm just curious. I love hearing contrarian views.


##### [00:25:38] - Bertrand

No, not that I can think about. For example, when I say there is lack of ops availability. Yeah, I don't think I have heard someone seeing the contrary.


##### [00:25:54] - Ry

Well, where does the observability belong though? Does it belong inside of the core? I guess this could be a point. There's a bunch of extensions inside the core, you might argue, like the pgsentinel capability probably should be available to everyone without having to install an extension. But if there's 100 things like that, it bloats up. Postgres but yeah, maybe that. Do we need to put more observability stuff in the main project or does it belong outside?


##### [00:26:27] - Bertrand

Yeah, I was mainly thinking in the main project. Yes. Provide more details about what's going on.


##### [00:26:34] - Ry

And turned on by default.


##### [00:26:39] - Bertrand

Okay. I mean, depending of the cost of it, obviously.


##### [00:26:44] - Ry

Does anyone? Well, like pg_stat_statements, that's not turned on by default, right?


##### [00:26:51] - Bertrand

On core Postgres, no. But on managed providers, I think so, yeah.


##### [00:26:59] - Ry

So would you argue that should be turned on by default all the time? I know that because there's little cost. Right. Everything has a cost. That's a tricky one.


##### [00:27:10] - Bertrand

I think in production it has to be. I mean, at the end when something goes wrong you need to have something to analyze. If not.


##### [00:27:19] - Ry

Yeah, I agree it's difficult. Okay. But once again production issues. It's just a tricky thing to me because the open source project the is kind of like the inner core and things related to running it in production. Let's take for example like a Kubernetes operator. I think we could probably all agree, like a Kubernetes operator shouldn't be inside of the Postgres project per se, but that means a backup strategy can't be inside of the project either. Yeah, these edges are interesting. I think it's just like how much observability should be inside of versus outside of the core. Would you argue all of it should be inside? Like, would you say pgsentinel ought to be merged into core?


##### [00:28:15] - Bertrand

No, I don't think so. Because an extension is easy enough to have this kind of observability.


##### [00:28:28] - Ry

But people don't know it exists. Right. Unless they find it. That's the tricky part.


##### [00:28:33] - Bertrand

Yeah, that's the problem.


##### [00:28:36] - Ry

Yeah. Discoverability of extensions, that's one of the things we're working pretty hard on too, is trying to. I think it'd be great to have. We want to have metadata maybe at some point. We haven't really talked to the Amazon team about this, but I want to basically have a place where managed service providers can report which extensions are being used. So just so we can know what's popular, what goes well with something else, what pairs nicely. If I'm using five extensions, what's the 6th extension I ought to be using? Given that profile would be nice because I think digging into these extensions is a big opportunity for developers. Someone might be banging their head against the problem that pgsentinel solves. Developers might be. And I have, I've banged my head against that problem for hours, not days or anything like that. But I've thought about checked. Checked for the. Certainly there's got to be a history of active sessions somewhere in here, and it couldn't really find it or even a way to make it very easily. That was my thought. I was like, should be some way to create it. But anyway, curious. Do you listen to podcasts very much?


##### [00:30:00] - Bertrand

Times to times, yes. But it really depends what I am doing and if one of them pop up, depending of the subject. Yes, I can listen to one.


##### [00:30:12] - Ry

Yeah. What are your favorite podcasts? Even if it's non technical, I'm always looking for good new podcasts to listen to.


##### [00:30:21] - Bertrand

There is the Postgres podcast done by Datadab. You like that one that I like? Yeah.


##### [00:30:35] - Ry

Any others?


##### [00:30:36] - Bertrand

I am also following you all, by the way.


##### [00:30:39] - Ry

Great. Thank you. Yeah, it's interesting. Like, about half of my feed is like a Postgres related podcast, but I also love to get some other stuff mixed in. It's hard to work all the time, but yeah, IT's nice to have. I think it's great that you can just kind of passively gain Postgres knowledge now just by having that on while you're mowing the lawn or doing dishes or whatever.


##### [00:31:07] - Bertrand

Yeah. And the one done by Nikolai, by Dazarab is very.


##### [00:31:14] - Ry

His. Are you watching his Postgres marathon? Something marathon where he's posting content every day for a year? He's a madman. That's a lot of work.


##### [00:31:30] - Bertrand

Exactly. Yes.


##### [00:31:31] - Ry

But I appreciate that he's doing it.


##### [00:31:34] - Bertrand

Yeah, that's very good.


##### [00:31:35] - Ry

Yeah, it's really cool. Well, are you very active online where people want to follow you and what's your favorite place to interact with others in the community besides the mailing list?


##### [00:31:52] - Bertrand

Yeah, I am many on Twitter, and I think that's it for the social media on Twitter.


##### [00:32:04] - Ry

Do you think is Twitter better or worse after Elon took over?


##### [00:32:12] - Bertrand

I think it works. Not that good as before.


##### [00:32:18] - Ry

Yeah. Okay. He liked the original. Yeah. I mean, the one thing I think I like is that he's, like, playing with know and trying some new stuff. Like the fact that we're posting this podcast to Twitter first, at least it's like the world's changing and we can do that. Otherwise it would have been just clearly just drop it on YouTube. But, yeah, I kind of like that he's trying some new ideas in terms of, obviously a lot of people are pissed off that it's like paying, you got to pay to get priority, blah, blah, blah. But anyway, cool. Well, I don't know if there's anything else you wanted to chat about, but I enjoyed learning more about this, and I'm going to immediately go try to install pgsentinel and see what it does for us.


##### [00:33:13] - Bertrand

Yeah, no problem. I can help you with that if you need to.


##### [00:33:17] - Ry

Yeah.


##### [00:33:17] - Bertrand

Awesome.


##### [00:33:18] - Ry

Well, thank you. Thanks for joining and appreciate it.


##### [00:33:24] - Bertrand

Thank you, Ry. Thank you for everything.
