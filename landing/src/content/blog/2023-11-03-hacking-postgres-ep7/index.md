---
slug: hacking-postgres-ep7
title: "Hacking Postgres Ep. 7: Burak Yucesoy"
authors: [ryw]
tags: [postgres, hacking-postgres]
image: './ep7.png'
---

Postgres for everything? How about building a new cloud provider? In episode 7 of Hacking Postgres, Ry talks with Burak Yucesoy of Ubicloud about new clouds, getting attached to extensions, and the future potential of Postgres.

Watch below, or listen on Apple/Spotify (or your podcast platform of choice). Special thanks to Regina and Paul for joining us today!

<div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', marginBottom: '5%'}}>
  <iframe
    style={{ position: 'absolute', top:'10px', width: '100%', height: '100%' }}
    width="100%"
    height="400"
    src="https://www.youtube.com/embed/_f4WZwkrXQw?si=V2H6vs_e86Aq2xJt"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen>
  </iframe>
</div>

Want to know more about something they mentioned? Here’s a starting point:



* Ubicloud - https://www.ubicloud.com/
* Citus Data - https://www.citusdata.com/
* PostgreSQL HLL - [https://github.com/citusdata/postgresql-hll](https://github.com/citusdata/postgresql-hll)
* JSONB - [https://www.postgresql.org/docs/current/datatype-json.html](https://www.postgresql.org/docs/current/datatype-json.html)
* hstore -https://www.postgresql.org/docs/current/hstore.html

Did you enjoy the episode? Have ideas for someone else we should invite? Let us know your thoughts on X at @tembo_io or share them with the team in our [Slack Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw).


## Transcript


##### _[00:00:12] - Ry_

Hello. I'm Ry Walker, founder of Tembo, a managed Postgres company. And today I have Burak from Ubicloud. How do you say UB? Ubi.


##### _[00:00:23] - Burak_

Ubicloud.


##### _[00:00:24] - Ry_

Yeah, UB. Welcome to the podcast Burak.


##### _[00:00:33] - Burak_

Yeah, thanks a lot for having me here.


##### _[00:00:36] - Ry_

Yeah, well I'd love to start with giving us a quick background. I'm curious where'd you grow up and what were you doing before?


##### _[00:00:48] - Burak_

Well, well hello everyone, this is Burak and I work as a software developer and I guess in reverse chronological order I worked at Microsoft, Citus Data and SAP on distributed databases in all three and currently I worked at a startup called Ubicloud. We are basically building a new cloud provider and the primary thing we do differently than other providers is that well all the code is open. You can think it as open alternative to existing cloud providers. You can go to GitHub, check out the code, set it up on a bare meta server and then you can have your own cloud or you can use our managed offering of course. So yeah, this is brief history of me working professionally.


##### _[00:01:46] - Ry_

Yeah, nice. So you're open sourcing, essentially open sourcing and what AWS and GCP and Azure have done.


##### _[00:01:55] - Burak_

Yeah, definitely, I'm seeing it what Linux is to proprietary operating systems. This is what we are doing for the cloud providers.


##### _[00:02:07] - Ry_

Yeah, and you only have to build 300 different services on top of it. Right, but luckily a lot of those are open source too.


##### _[00:02:15] - Burak_

Kind of. Well, I guess our current plan is not building all 200 render services because most of the time people use only ten at most 20. If you implement 20 of them, I guess you have 80% of the use cases. So I guess this is our initial plan but we never know what would feature show.


##### _[00:02:42] - Ry_

Yeah, I think it's a great idea. I'm excited to watch it evolve and hopefully partner with you guys at some point.


##### _[00:02:50] - Burak_

Yeah, that would be awesome.


##### _[00:02:52] - Ry_

Do you remember when you first started using Postgres?


##### _[00:02:57] - Burak_

Yeah, I do. Well to be honest, when I start programming I started as a web developer and at that time Lamp stack was very common. So my first database was MySQL but then I started working at Citus Data and which is the place that I started working development part of the Postgres. So basically for people who don't know Site, the CitusData was the company behind many popular extensions such as Citus or Pgcron or PostgreSQL HLL. So when I first joined Citus Data, I initially worked on building Citus extension and while doing that you need to dig to the Postgres code first you need to understand and then you build your extension on top of it. And then we built our own managed service. So I switched to that team to build a Postgres managed service and some of our customers were well, they were heavily using PostgresQL HLL extension and at that time the original authors of the PostgreSQL HLL extension, they went through an acquisition process and they didn't have enough time at their hand to maintain the extension. And well, we know the people and at that time PostgreSQL Community was much smaller.


##### _[00:04:37] - Burak_

So we just called them and said that, hey, we want to maintain this extension, what do you think about? And they were pretty happy to find a new maintainer. So, long story short, I found myself as the maintainer of the PostgreSQL extension and then the Citus Data got acquired by Microsoft and then well, I continued my Postgres journey on Microsoft. Like we also build a managed server stash. Yeah, I guess that's how I start with Postgres development. Well, not just start like till the almost whole journey.


##### _[00:05:18] - Ry_

Yeah. And are you taking a little bit of a break from it right now or are you working on Postgres stuff over at Ubicloud?


##### _[00:05:31] - Burak_

Yeah, well, first of all, we use Postgres in Ubicloud as like most of my professional community, like the friends, and they are from Postgres Community, so there's no way I can leave that community at all. But as a cloud provider, Ubicloud also needs to offer a Postgres service. So we are planning some things like it's not very well defined yet, but I think eventually we will have something for Postgres as well.


##### _[00:06:12] - Ry_

Out of curiosity, are you guys I'm sure this is a hotly debated topic, but Kubernetes or no Kubernetes inside of UBI Cloud?


##### _[00:06:22] - Burak_

Well, in our case right now, no Kubernetes. We have pretty simple control plane, which if you want, I think you can move it to Kubernetes. But right now we don't use it. Not that we have anything against Kubernetes, it's just I guess right now we don't need that complexity, I believe.


##### _[00:06:50] - Ry_

Yeah, well, and I imagine you'll have managed Kubernetes. You'd have to have that. That'll be one of your 1st 20 most likely.


##### _[00:06:57] - Burak_

Yeah, definitely. Because managed Kubernetes is quite one of the most demanded products, so it needs to be one of the first.


##### _[00:07:11] - Ry_

Well, so again, you were working on Citus...When you started working on it, was it an extension or was it, I don't know the full history? Was it a fork at any point and then became extension?


##### _[00:07:25] - Burak_

Yeah, at the beginning it was a fork and just before I joined the team it become an extension. So basically Citus become an extension and become an open source at the same time. And I think I joined Citus team in like one month after that.


##### _[00:07:45] - Ry_

Got it. So you never were part of that previous era. Were a lot of the hard problems already solved, would you say, with Citus? Usually. I just did a talk with the PostGIS team and they said early on is where they solved the most of the problems and it was more gradual after that. Is that the case with Citus too, or was there a big project that happened after you joined well, I think.


##### _[00:08:19] - Burak_

Most of the difficult problems were already solved and to be honest, I think one of the problems with the extension development is that there isn't good documentation about it. Like for Postgres has pretty good documentation for user facing features. But if you want to as a developer, there isn't that much resources so you usually need to read lots of Postgres code. And to be honest, I think Postgres code is pretty readable for a project at its size and that big and that old, so I think that's a huge plus. But still you need to read lots of code to understand what you need to do. And in our case, thankfully, Citrus hired one of the most prominent contributors of the Postgres Andres Freund and he primarily lead the effort to make Citus an extension. And I think at that time I believe Postgres extension framework also didn't have some of the features we need. So we had to do some hacky workaround. But eventually Postgres extension framework also got improved and we had chance to remove those hacky workaround.


##### _[00:09:48] - Ry_

Yeah, that's great. Yeah, it sounds like that's happening now with lots know a lot of the innovation in Postgres happens as a fork with the hope that in a version or two can become an extension and then maybe a couple of versions. After that it becomes a less hacky extension. Right? You can streamline it, but it's a four year journey or so. Tell me about PostgreSQL HLL. Tell me what's HLL stand for.


##### _[00:10:19] - Burak_

Yeah, well, HLL stands for HyperLogLog and it is an extension to make a cardinality estimation, which is a fancy way of saying doing count distinct but approximately. Let me first explain why approximately. The reason is doing count distinct as an accurate number is pretty difficult. Well, not difficult, but maybe unfeasible. If your data size is small, that's okay. But if you have lots of data, the usual way is keeping a hash map or hash set. Every time you see an item you put it to hash set and at the end you count number of items in it. But if you have lots of data that becomes unfeasible. If you have a distributed system, like if you are doing count testing in two different nodes, that becomes even more difficult. Because let's say you bite the bullet and calculate the counter stick in one node and the other node, it's not possible to merge the result. Because there might be common elements, you cannot just sum them up. So what HyperLogLog does is it uses an approximation algorithm. I can go into detail of it as well to have an internal representation of the number of unique elements which is both memory efficient compared to doing a hash map which is also easy to merge.


##### _[00:12:04] - Burak_

So it allows you to do like the parallel computing. And the only gotcha is it is not an exact number, it's an approximation, but it turns out that we don't need exact number most of the time. Like for example, especially in analytical use cases, let's say you want to count the number of unique users that visit your website. It doesn't matter if they are 4 million or 4.1 million, like you want a ballpark number. And also the good thing is the error rate of HyperLogLog is quite small. It is usually around 2% and you can make it even smaller if you give it a bit more memory like you can make it more accurate while this HyperLogLog algorithm is just out there. And what PostgreSQL HyperLogLog does is it implements this algorithm for PostgreSQL.


##### _[00:13:09] - Ry_

So how much of a resource reduction would you estimate that using an approximation? So you lose a percentage or two of accuracy, but you get how much less compute required?


##### _[00:13:24] - Burak_

Well, usually it's about 1.5 KB. So the HyperLog data structure on default it takes about 1.5 KB memory.


##### _[00:13:38] - Ry_

Orders of magnitude smaller.


##### _[00:13:40] - Burak_

Yeah, actually log log parts come from that. So if you are dealing with 32 bit integers, it can go up to two to the 32. You get the log of that, it is 32. You get another log that you get five. So you need five bits of memory to be able to store one bucket. And then what HyperLogLog does is it keeps multiple buckets to increase the accuracy. So at the end it end up about like 1.5 kilobyte.


##### _[00:14:17] - Ry_

Got it. So how involved were you in that extension? Did you start it or did you inherit it?


##### _[00:14:25] - Burak_

I inherited it. So actually another startup called Aggregate Knowledge built that extension. Then I think they got acquired by New Star and at that time the project was not maintained frequently. So there were some boxes we need to be merged in and our customers were also using it. So we contacted the original authors and said that hey, we want to maintain this. And they were happy to hand over the maintainership to us. And then after that we did bug fixes, we did regular releases. I presented a few conference talks about HyperLogLog in PGConf EU and PGConf US. Yeah, that's the overall story.


##### _[00:15:24] - Ry_

I'm curious, have you been able to disconnect from I imagine it's easier to disconnect from Citus as an extension after leaving Microsoft, but disconnecting from this extension PostgreSQL HLL. Are you still kind of watching that because you have that knowledge?


##### _[00:15:47] - Burak_

Yeah, I have a little bit of emotional bond to that extension. Well, for example, there were few improvements that I wanted to do, but I didn't have time while working at Microsoft and it just, itched me from time to time and it is open source. So I guess at some point in near future I'll open a pull request and hopefully it would get merged. I hope.


##### _[00:16:19] - Ry_

Yeah, but Microsoft team controls that extension as it sits.


##### _[00:16:25] - Burak_

Yeah, right now Microsoft team controls, they continue to do regular releases and every time new PostgreSQL version comes up they ensure that it works well and they update the packages, release new packages. If there's a bug report, they are the one who fixes it.


##### _[00:16:45] - Ry_

How many extensions, I mean, obviously there's the Citus extension, this one. How many total extensions would you say like Microsoft has in Postgres? I know maybe it's hard to nail down a number, but there are a bunch of others too.


##### _[00:17:01] - Burak_

There are there's Citus, there's PostgresQL HLL. There is Pgcron which is also quite popular. It is a Chrome based job scheduler.


##### _[00:17:10] - Ry_

Yeah, I just started using that.


##### _[00:17:12] - Burak_

Yeah, that's pretty cool. It is primarily developed by Marco Slot. There is one extension to ensure that Postgres works. Postgres is well integrated with Azure. So there's like an extension called PG Azure. I think it's not open source but if you start a Postgres instance from Azure and check the extensions, if there's that extension there is TopN which is also approximation based extension. It gives you top N elements of a sorted list. And if you think about it is also expensive operation to do on big data set because you need to sort them first and take the top N. And I think there are more optimized algorithms that where you can keep heap which is more memory efficient but you still need to go over lots of data at that time. At Citus we also developed this TopN extension. Actually, if you look at it, the general team is about being able to do things at scale because Postgres is already pretty good at doing things in a single node. And like the title primary use case was make. A distributed PostgreSQL and we developed few extensions to make some operations that are not feasible to do at scale and find a ways to make them more feasible.


##### _[00:19:06] - Ry_

So I'm curious, are there some big milestones in Postgres that you're looking forward to?


##### _[00:19:14] - Burak_

Yeah, well, actually I was looking forward for Postgres 16 release mostly because of the logical replication improvement. There are few and I think there will be more upcoming because I think logical replication is a very powerful concept but it's still a bit cumbersome to use it with PostgreSQL, especially when there's a change in the data, like if when you run a DDL command or when you have a failover. So there are few gotcha and I think with the Postgres 16 some of these are less problematic and maybe I hope in the upcoming versions it would be even easier to use. Well, when you have a very solid logical replication, it opens up lots of cool features. Well, one thing that I personally invested in is being able to do zero downtime failovers and when I say zero time downtime, I mean like the real zero downtime. Not just like 1 second downtime, but real zero downtime. And I think logical replication, solid logical replication would open up that yeah, I agree.


##### _[00:20:45] - Ry_

It's one thing to do that too with a single node versus a Citus cluster too right. Zero downtime gets complicated the more complicated your deployment is. But I agree on a single deployment I have this idea where we could basically build scaffolding around the existing thing, whatever it takes, like get another one working. In other words, temporarily have replication happening and then somehow seamlessly up above you have to have some fulcrum that you can so it's a complicated thing to figure out but I think it'd be great for a managed service provider to basically build up temporary infrastructure that helps the zero downtime thing happen. If that's true, then you can restart for all kinds of reasons with impunity like auto scaling is possible, stuff like that.


##### _[00:21:50] - Burak_

Yeah, and one reason I especially interested in was that in our previous managed service we do lots of operations via failover. Like for example, if you want to scale up what we would do is we create another server with higher number of cores and then we would do failover. Or if you want to like for example, we might need to do maintenance like maybe we found a security vulnerability or there is the regular maintenance. What we would do is instead of going and patching the existing server we would create a new one and then we do a failover to that one and each of those failovers. It takes some amount of downtime which is not obviously not preferable and not a good experience for customers but if they were virtually free from the perspective of customer if they don't even notice that there's a failover then you can do as many failovers as you want.


##### _[00:22:55] - Ry_

You share the same vision as I do there. I think it would be exciting to get there. So I'm curious though, if there was one thing that you could if you had a magic wand and this weekend something new would be in Postgres core, what would it be? What would you use that wand on?


##### _[00:23:11] - Burak_

Yeah, that's difficult. I want lots of things like picking one is difficult but I guess one thing that bothers me is that for high availability and backups you always need to depend the third party tool I would really love that to be sold in Postgres. Like for example, for Redis it comes with very good default settings that you can use for high availability. But for Postgres there are solutions. There are good solutions but I would love them to be in the core.


##### _[00:24:03] - Ry_

Yeah, I get that for sure. It's tricky when you have to buy a product or let's say you adopt a product and you immediately have to adopt x additional products right off the bat and that's not a good feeling. It feels complex, right? Yeah, that's cool, I would say. Do you have any opinions about Postgres that almost nobody agrees with you about? Are you a contrarian in any area that you can think of?


##### _[00:24:35] - Burak_

Let me see. I don't think so. Well.


##### _[00:24:45] - Ry_

Maybe that's one of the areas that put that you think backrupt should be inside.


##### _[00:24:48] - Burak_

There is that. But I know there are people who also share that opinion. Yeah, I'm not sure it's okay.


##### _[00:25:04] - Ry_

Yeah, I was just curious. It's always fun to talk about those things, if they exist. Give you a soapbox.


##### _[00:25:14] - Burak_

Actually, there is one thing, but that's also even I think Tembo kind of agrees with me on that one, is that I think many different use cases can be implemented in Postgres. So instead of having a lot of specialized databases, you can have Postgres. And with some configuration and maybe few extensions, you can implement, like you can implement Kafka in Postgres, you can implement Redis, you can implement like the NoSQL in Postgres. I guess if I said this maybe two, three years ago, probably I would get more raised eye growth. But now I think more people start thinking to think like that. I think Tembo is also thinking things along similar lines, right?


##### _[00:26:14] - Ry_

Yeah, I think there's openness to it. I talked to a lot of people, and the question is how people are Postgres for everything. Or question is what percentage of developers are actually on that bandwagon? Obviously on Twitter, it just takes one person, and it's a big community, too, especially if it's a contrarian view. But I'm kind of curious. One of the things I want to find out over the next few months is what percentage of developers would actually if this Postgres for Everything was real, would they actually use it versus still saying "Ehh." And I think it all comes down to like I think, yeah, you can do Kafka, like work on Postgres right now, but it doesn't feel as clean as buying Confluent. That seems like a very safe decision. And doing something like Kafka on Postgres seems like you're just kind of stringing together a Rube Goldberg machine and it doesn't feel like a solid. But the question is, if those solutions were solid, would people use them? And that's our big thesis, is that if they were solid, people would use them. But I just don't know what percentage of people would do that.


##### _[00:27:38] - Ry_

A big percentage or a small percentage?


##### _[00:27:40] - Burak_

Yeah, I'm not sure. But there is one interesting thing that come into my mind, is, well, today Postgres supports JSONB type, but it was not like that all the time. So in the earlier days, if you want to store JSON data, we had an extension called hstore, which we still have, but not as commonly used as before. And what hstore does is, and this is one of the very powerful part of PostgreSQL extension framework, hstore defined the data type, and on top of it, they defined how you can hash this data type and how you can compare this data type. And when you do this in Postgres, Postgres allows you to create index on that data type. So suddenly you are not only able to store JSON data, but you can index it. And at that time this is kind of rare things even for NoSQL database. So I think it's a bit funny. And also it shows the power of PostgreSQL extension framework is that suddenly you are able to do what NoSQL database does but better. I mean, not in all perspectives, like connection scaling was still a problem, but being able to index NoSQL data, being able to index JSON, it was a rare feature even for NoSQL databases.


##### _[00:29:19] - Burak_

But you had it in Postgres. I don't know, maybe some of these other databases or other use cases Postgres might have something unexpected that would make it better.


##### _[00:29:36] - Ry_

An unexpected advantage. Yeah, it's the same way with pgvector right now the great thing about doing vector embeddings inside of Postgres is that you don't have to move the data out of Postgres as part of the process. Right. You can just add a column and keep it where it is, whereas anybody else has if it's an external vector database that's specific for that use case, you have to have data pipelines and all that kind of machinery. Which that's to me, one of the big benefits of keeping it all in Postgres is less data movement. And less data movement can mean much like no data delays and all that kind of stuff go away. So yeah, I agree with you, there's a lot of unexpected benefits for keeping things together.


##### _[00:30:25] - Burak_

Yeah, I guess since Postgres provides pretty strong asset guarantees, it allows you to build things on top of that. And when you have asset, then you can be much more free to develop complex features. Because what I realize is like while developing software, most of the time as a developer, I try to ensure that hey, what I'm doing is atomic or what I'm doing does not it is isolate. So it's not caused any problems if something is coming and not in the expected order. But you have chance to delegate all this to Postgres, I think that gives you quite a bit of advantage.


##### _[00:31:21] - Ry_

Well, one of the things I love too is that because the Postgres core team is quite separated from the commercial products, is that I just think it seems like a very stable chassis to build these things on top of. And you really can't if it's more of a captive, open source project, say, like what Kafka is to Confluent. They can move Kafka quickly if they need to for commercial to help their commercial product, but that could introduce more instability. I just don't see this Postgres team doing anything very risky, which to me is a great counterbalance to people developers trying to move fast and build crazy cool new things. It's just nice to have that as a stability factor, I think, inside the product.


##### _[00:32:17] - Burak_

I think so, yeah. Well, I guess historically I think the Postgres community kind of divided into camps and some of them would want to implement new shiny thing and some of them would try to hey, just let's get stabilized. And I believe this JSONB support comes from the part who wants to innovate and try new things. And at the beginning, I think they got some hesitation from the other company. But at the end, I guess what they do proved itself to be very valuable. And then now JSONB support is one of the most widely used features of Postgres. Yeah, so I guess there is some sort of balance to try risky things and also try being stabilized.


##### _[00:33:10] - Ry_

If you look at the number of the change log for Postgres 16 they did a lot of things. It's almost more than anyone can keep in their head. That's what I'm saying. The good stuff gets through, it's just the bar is high and then with a lot of assurances that they didn't break any part of Postgres in the process. I really appreciate that part of this thing and it's one of the reasons why I'm so excited to be building a product on top of it.


##### _[00:33:41] - Burak_

Yeah, well, at the same time it is sometimes bit frustrating because sometimes you have a feature you want it to be merged in like you might be author or you might be just someone watching from the site and desperately need that feature. And then you see that there is a huge discussion going on and people cannot convince each other and it falls to the next cycle, which is like the one years later. So that's a bit frustrating but I guess yeah, it is kind of cost of having a quite stable system.


##### _[00:34:18] - Ry_

It's the cost. And like I said, well, obviously I haven't been here for the 26 years watching the mailing lists and maybe I'm jumping in here relatively late in a cycle and I just appreciate all the efforts and all the debates and all the fights that have happened there because I think it's created such a great core engine. All right, well, so where can listeners find you online? I imagine you're on X. Yeah, they.


##### _[00:34:50] - Burak_

Can find me at X, at LinkedIn. Yeah, I guess those two would be the places they could find me, but mostly at X. My alias is at BYucesoy. So basically my first letter of my name and my last name. Great.


##### _[00:35:10] - Ry_

Well, we're excited to see the outcome of as you guys are shipping Ubicloud. Excited to see that. And yeah, appreciate you joining us today.


##### _[00:35:24] - Burak_

Thanks a lot for having me here, it was great talk, I enjoyed a lot and I'm definitely looking for the other episodes to release so that I can listen.
