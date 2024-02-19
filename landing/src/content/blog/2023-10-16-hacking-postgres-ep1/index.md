---
slug: hacking-postgres-ep1
title: "Hacking Postgres Ep. 1: Marco Slot"
authors: [ryw]
tags: [postgres, hacking-postgres]
image: './ep1.png'
---

## Episode Notes

In this episode, Ry and Marco talk about the early days of Citus and its development, creating pg_cron (on a plane!), and the new possibilities on the horizon for extensions in the Postgres landscape. If you haven’t seen or listened to it yet, you can play the video below, or listen on Apple/Spotify (or your podcast platform of choice). Special thanks to Marco for joining us today!

<div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', marginBottom: '5%'}}>
  <iframe
    style={{ position: 'absolute', top:'10px', width: '100%', height: '100%' }}
    width="100%"
    height="400"
      src="https://www.youtube.com/embed/UxUrn6bKDfU?si=JMm_cMMPToh1K2KK"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen>
  </iframe>
</div>

Want to know more about something they mentioned? Here’s a starting point:

* CloudFront - https://aws.amazon.com/cloudfront/
* Citus - https://www.citusdata.com/
* pg_cron - https://github.com/citusdata/pg_cron
* pg_timetable - https://github.com/cybertec-postgresql/pg_timetable
* pgrx - https://github.com/pgcentralfoundation/pgrx
* PostGIS - https://postgis.net/
* PostgresML - https://postgresml.org/
* pgvector - https://github.com/pgvector/pgvector
* pg_embedding - [https://github.com/neondatabase/pg_embedding](https://github.com/neondatabase/pg_embedding)

Did you enjoy the episode? Have ideas for someone else we should invite? Let us know your thoughts on X at [@tembo_io](https://twitter.com/tembo_io) or share them with the team in our [Slack Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw).


## Transcript


##### _[00:00:12] - Ry_

Welcome to Hacking Postgres. Today we have Marco Slot joining us. I'm meeting Marco for the first time today. I'm super excited to be meeting you, Marco. Welcome to the show.


##### _[00:00:25] - Marco_

Hey Ry. Yeah, very nice to meet you. Yeah. So I'm Marco, I work at Microsoft and I've been working on Postgres extensions for about nine years now, starting with Citus, pgCron, and a bunch of other ones. Yeah.


##### _[00:00:44] - Ry_

That's awesome.


##### _[00:00:45] - Marco_

Yeah.


##### _[00:00:45] - Ry_

So this is not really supposed to be an interview. It's more just us geeking out about Postgres, extensions, what they mean to users and opinions about anything and everything related to our work is fair game. Yeah, sounds good. So what'd you do before you got into Postgres stuff, out of curiosity?


##### _[00:01:09] - Marco_

Yeah. My background is more in distributed systems, so I spent a few years at AWS. It was quite early days in AWS when I think I joined. There were three Web Services. S3, SQS and EC2.


##### _[00:01:24] - Ry_

Wow.


##### _[00:01:25] - Marco_

And then we built number Four, which was CloudFront, which gives people started using S3 for websites, which it wasn't really built for. But then we were asked to solve this and we built the CDN, and then we also built Route 53 for the DNS.


##### _[00:01:40] - Ry_

Wow.


##### _[00:01:41] - Marco_

And then yeah, I did a PhD in sort of self driving cars, but specifically like, cooperation between self driving cars, like, what if they can communicate with each other and sort of coordinate? So it's sort of advanced distributed systems in a way as well. Yeah. So that led to me joining Citus, which is sort of founded by former Amazon folks.


##### _[00:02:05] - Ry_

Got it. So building Citus was probably easy compared to all other stuff, actually.


##### _[00:02:12] - Marco_

Yeah. If you do self driving cooperation between self driving cars, which is this kind of like life critical system distribute where your nodes kind of just move around and they move away from each other, it does make things relatively easy. But then yeah, building databases is never actually very easy.


##### _[00:02:31] - Ry_

No, I know. How good do you want to make it right? Is how hard it becomes.


##### _[00:02:38] - Marco_

Yeah. I guess the challenge is always everything sort of in the word relational. Right. Like everything relates to everything else. There's not like a feature you can implement without considering all the other aspects of the database and all the things that can happen concurrently with the operation that you're working on and all the possible ways in which things can fail. Especially if you're in a kind of distributed setup.


##### _[00:03:01] - Ry_

Yeah, I think that's really interesting perspective. You think of all of the configuration options, too. Adding a new configuration option adds complexity, adds flexibility, adds potential complex, and it's tough.


##### _[00:03:20] - Marco_

Yeah, definitely. I think one thing we learned is there's a sort of certain danger in creating modes where every setting you add, which can be on/off now you have two modes in your system. You add another setting that can be on/off. Now you have four modes in your system. It's kind of this exponential explosion of possible ways in which your database might be running. And so that's hard learned lesson that's, like, don't introduce major modes. Sometimes you have to because of backwards compatibility reasons, maybe, but you want to get rid of them over time.


##### _[00:03:57] - Ry_

Were you one of the first team members on Citus? Actually, I don't really know the full history. Did it start as a fork and made its way as an extension, or was it always an extension?


##### _[00:04:10] - Marco_

Yeah, I was one of the first, though I think Samay was already there. I think he's joined Tembo. So but yeah, we started out as a fork and then we called it CitusDB, and then we made it an extension and called it Citus. Though I think the name CitusDB kind of stuck around for...I still hear it sometimes. But yeah, it was very pretty early days for extensions. Like 2015 PostGIS obviously existed. It was one of the first major ones. But yeah, we were lucky at the time. We had Andres Freund working for us. Well, he's also now working for Microsoft, but he's like one of the top Postgres committers, and we put him in a room for a while, know, can you turn this into an extension, please? And he came up with some terrible, terrible hacks. But over time, those also drove some of the extension APIs in Postgres itself, where things that used to require really terrible hacks are now kind of more structured and you can introduce your own sort of data structures into Postgres without doing lots of weird stuff.


##### _[00:05:22] - Ry_

Well, I was thinking probably not everybody knows what Citus is. Maybe if you could give a quick I'd love to hear a quick overview of what it is and then maybe a couple of things that maybe you can think of that are unusual, that people might not know about it, that are part of it. I don't know if that's a stupid question, but yeah, if you could try no.


##### _[00:05:41] - Marco_

Yeah, so it comes from basically this notion that Postgres is ultimately limited to a single machine. I mean, you can read replicas, but you definitely cannot scale the writes. Usually if you have read replicas, they'll kind of end up having the same stuff in memory. So you cannot really scale the memory either. And so Citus is a solution to basically adds sharding to Postgres in a very transparent way, where you can have tables that are sort of transparently sharded across many nodes, you still connect to a Postgres server. There's just a table, looks, walks, and talks like a table. But if you insert into it, it actually gets rooted to a particular node. And if you insert another value, it might get rooted into another node that uses this hash distribution. And that way you can scale across infinitely many machines and have some users have petabytes of data in their Citus cluster part of the advantage is also that queries can get paralyzed on these tables because we can use all the nodes at the same time and multiple cores per node. But more and more it's also actually being used for LTP workloads.


##### _[00:06:55] - Marco_

And particularly the most popular use case is actually multi-tenancy, where you have this kind of B2B app where you have lots of relatively independent users and you kind of want to just transparently spread those across different machines without having to actually manage that yourself and figure out how to move data around. Because that was all very kind of automated. You can just ask it to re-balance your data and it does that using logical replication. And so then you have the advantage of just as much memory as you need to make your application fast and as much disk IOPS as you need by just adding more machines with more disks and so that helps you scale. And then we have a sort of managed service in Azure around that. But yeah, we use every hook that's available in Postgres to achieve things like starting with the planner hook. That's one of the interesting things about Postgres. It's like you just replace the whole planner with something else. You get a parsed query tree and then you can do whatever you want with it. You can just do some like okay, look at this query and log something interesting and then just go to the regular planner.


##### _[00:08:12] - Marco_

Or you could just do something completely different. And so we use all these hooks to kind of create this facade around Postgres tables where it's like Postgres table is still there, you just cannot touch it. We just intercept everything that's going on. The most recent and most terrible hack we did it was like the give it as this hack in Postgres so we can figure out so we have shards. Like the writes go into shards but then if you do logical decoding you see writes on shards, you don't see writes on these what we call distributed tables. But the user doesn't even know about shards probably. So how can we fix that? And there wasn't really any kind of hook we could use to change the way that the logical decoding process works except that we realized that the client specifies a decoder name usually just hard coded like Pgoutput or Wal2json or test_decoding and that actually refers to the name of a .so,  like a shared library. And we realized we could create a .so with the same name and put it in a different directory and then change the dynamic library path to be prefixed with that directory so it would load our library instead.


##### _[00:09:34] - Marco_

This is kind of the worst thing we did. But it works nicely actually. I mean, that new .so file calls the original .so file and it kind of makes some changes to hide the sharding from the coding. But yeah, it is a hack. It's very much a hack. But it's nice that Postgres ultimately lets you do these kind of things.


##### _[00:09:59] - Ry_

I think, like Citus says, there's like a requirement that Citus loads first as an extension. Is that true? I'm trying to remember if I'm making that up.


##### _[00:10:08] - Marco_

It is true. I mean, maybe it's a bit of laziness on our part, but it's also.


##### _[00:10:13] - Ry_

Because...


##### _[00:10:16] - Marco_

We generate very weird plans that wouldn't make any sense to other extensions. So if you have multiple layers of planner hooks, you kind of want Citus to be but by putting it first, it actually becomes the last because everyone else overwrites Citus. And then hopefully when you go through the chain of planner hook, Citus is the last one remaining and it can produce some quirky distributed query plan that doesn't make sense to anyone else and pick that up.


##### _[00:10:48] - Ry_

Are there known extensions that aren't compatible with Citus that you're aware of or as far as you know? It kind of works with most everything.


##### _[00:10:56] - Marco_

Yeah, I mean, Citus is a little bit of a paradigm shift because now you have many servers and some extensions just don't make sense if you're on many servers because they keep their state on one of them and then they're not aware of others. But most things just work. But I kind of feel like there's this notion of a deep extension, if you will, like TimescaleDB or Citus. They kind of go really deep into planner hooks and change behavioral characteristics. Whereas something like PostGIS and a lot of extensions that just introduce new types and functions. They're sitting on top of this much more clean interface and usually the interoperability of those things is pretty good. But Timescale has this notion of a hyper table inside as a distributed table and you cannot really make a distributed hyper table. But yeah, compatibility, it comes down to sometimes also the individual features. It's not like if you install one, then the other doesn't work anymore. I mean, that happens for some extensions, but for Citus, most other things just kind of work with it. Yeah.


##### _[00:12:08] - Ry_

So let's talk about pg_Cron. How early were you involved in that project?


##### _[00:12:13] - Marco_

Well, I created it. I used to have this thing where I am much more productive on flights and I flew to San Francisco a lot for a while and then I had a few of these projects that I was just working on on flights and pg_Cron was one of them. And so at the time we had customers who did kind of this real time analytics scenarios on Postgres on Citus. And those involve a lot of materialization. So a bunch of raw data keeps coming in like time series data. And at some point you want to take all the new data and kind of pre aggregate it inside of the database and that needs to happen periodically. I think the background worker concept was pretty new at the time. I don't know. This was many years ago. And so I realized you could do something like Cron. It maybe also comes from the Amazon background because Amazon, at least at the time, was all like glued together with Cron, Perl and R Sync. There were Cron jobs that would R sync metadata files to other servers and it was all pretty hacky. But anyway, I figured it would be pretty useful to have this kind of thing in Postgres also for just vacuuming or calling certain stored procedures that, I don't know, delete your old data.


##### _[00:13:42] - Marco_

Like those kind of maintenance tasks. It was just much easier if that's like you run a command once and then it works forever, rather than I need to maintain this separate infrastructure that periodically connects to the database and does that. So that became quite popular. I think pretty much all major managed services have pg_Cron now. Yeah, I kind of built it as a very I mean, it was definitely my side project. So I also built it as a very low maintenance thing that I wouldn't have to constantly fix bugs in. Also a little bit selective about adding new features. For a long time I resisted adding people want like, can I run a job every few seconds? And normally Cron is like at the minute, granularity. But recently I caved and I added doing it every few seconds because I realized it's kind of feature if there's some kind of issue, some kind of memory leak or whatever, if you run it every few seconds, it's going to be way worse than if you run it once a minute. So you need to be more careful in that case. But you can now also do like every second, for example, which is kind of useful.


##### _[00:14:56] - Ry_

That's awesome. Yeah, I was looking at we're just building a new data warehouse, trying to use Postgres to do that. I'm exploring all the columnar extension as well, which sort of is part of Citus. I don't know if you did any work on that, but yeah, looking at pg_cron versus pg_timetable, have you had the question of what about have you looked at timetable and its features and yeah, I'm kind of curious to get your assessment of the two.


##### _[00:15:28] - Marco_

Yeah, I've looked at it a mean for a long time. It wasn't so much an extension. I think nowadays it is more or less an autonomous extension, I think. Yeah, I mean, it's somewhat more complex in a way. I don't feel like competitive of like you should use pg_cron or use pg_timetable. I think pg_cron is just intentionally simple such just this very simple thing that just works and does what you'd expect it to mean almost unless your time zone is in a different unless you're not in GMT, then it sort of doesn't quite do what you'd expect it to anyway. So yeah, I think Cron is just simpler. But if you need some more specific, I guess it comes down to do you need the extra features that pg_timetable adds? But I think for most people, pg_cron is good enough because you can also just I've also seen people do their own kind of job queues on top of pg_cron, where you just have this thing that runs. Every few seconds or every minute, and then looks are there some jobs to do? And it actually executes the stuff that's in the job state.


##### _[00:16:39] - Marco_

So it's kind of composable as well. You can build your own things on top if you want. Yeah.


##### _[00:16:45] - Ry_

And especially if you could trigger it every second to check for work. Yeah, that's just fine. Yeah, I'm coming from my previous company was doing Apache Airflow and so it's like kind of getting back to some of the stuff. I mean, obviously that's a very complicated system with a lot of capabilities and dag like chaining of tasks and fanning out and all that kind of stuff. But yeah, I think it's interesting to try to do some of that stuff inside of Postgres without requiring we're trying to go with the mantra of like just use Postgres for everything.


##### _[00:17:29] - Marco_

It's not a bad mantra. You've got, I guess, different levels of commitment to that idea of how much of our backend can we shove into Postgres? And there's these GraphQL extensions where you pretty much put your entire backend in Postgres. Yeah.


##### _[00:17:51] - Ry_

Your API, is there?


##### _[00:17:52] - Marco_

Yeah, I guess Supabase is going pretty long way in that direction, but at some point you want to debug stuff or you want to have certain rollout procedures. And sometimes Postgres is not as mature a tool as just shipping Python files somewhere. There's just better CI tools for most normal programming languages than for Postgres. So you have to find the right balance, I think.


##### _[00:18:24] - Ry_

Yeah, we're building and maybe this shouldn't have happened, but apparently yesterday we were working on a new FDW and I think it hit an exception that wasn't handled and it appeared to shut down the Postgres server. This is kind of fun. Should that have happened? Should that be possible? Should an extension error take it down? But we're still investigating that. But yeah, I think there's always risk with trying to do a lot inside, but I think with a mature extension that's well tested and battle tested, it should be. I mean, if you think about everything that's happening, there's no SRP in Postgres, right? It's not just doing one thing, it's got a vacuum. There's like lots of processes running and so then the question is, is it a sin to add one more thing? Especially if it has the capability to have a background worker? It's just like staring you in the face. Like use me.


##### _[00:19:29] - Marco_

Like the extension APIs are slowly evolving from just a complete hacky approach for people to try out their Postgres batches before merging them into core. To some, I guess Extensibility was there from the start. But that's more too for custom types and custom functions than it is for planner hooks and background workers and those kind of things. Those are a little bit more what if we add this function pointer to see maybe extensions can do something interesting with it. And it's not very extremely well structured, but I mean the whole rust like pgrx and building extensions in rust, it does create an opportunity to have a little bit more of a well defined method of developing extensions.


##### _[00:20:25] - Ry_

Yeah, I think what's interesting to me about Postgres is like the history of forks and it sucks to be on the true fork, as I'm sure you were aware. Creating the extension framework helps people out of the land of forks, but it does create the possibility for even more risk extensions in terms of all that. So it's like a double edged sword. I think it's great though, that to me is the reason why Postgres is doing so well now, is all that freedom that the core team has given the community in terms of how to use it. It's unprecedented, almost dangerous, but I also think empowering to developers who want to have some fun with their database.


##### _[00:21:21] - Marco_

Yeah, definitely. What we also often find is just an extension versus an external tool. At least we're sort of in the business of running a Postgres managed service. But even if you have just your own Postgres servers, it has a fairly straightforward deployment model, right? Like you don't have to create a whole separate cluster with its own configuration that connects to your Postgres database and does things with it. You just shove it into your existing Postgres server and it'll restart the background workers and you don't have to worry about all those things. It does have a lot of merit, actually, to develop a software as a Postgres extension. I mean, it comes with its own protocol. I think the most interesting thing is just like you get all this synergy between all these different extensions, that the sum of the parts is greater than the or what is it? The whole is greater than the sum of the parts. But also things like PostGIS and Citus, they kind of layer like you can distribute it, geospatial joins, whatever. But then also maybe you have some interesting function and you can run it periodically using pg_cron.


##### _[00:22:39] - Marco_

And it's like all these things kind of give you this little platform where you can just by running SQL queries, do increasingly interesting things. Maybe you have an FTW that does an Http call and you run it using pg_cron, for example. And now your Postgres server is not just pg_cron, is not just Postgres cron, it's actually anything cron. Like you can reach out to other systems. So that plugability.


##### _[00:23:10] - Ry_

I literally have a co-op that started last week and his first task was, I said create an FDW for this API and use pg_cron and ingest that data. And he's like, well, how do I do it? Just brand new to data warehousing in general, but he's got the FDW built and now he's working on if he has any problems, I'll send him your way. Kidding. I won't. Kidding, kidding. I won't do that.


##### _[00:23:41] - Marco_

If there's bugs open issues like I'd like to know, of course.


##### _[00:23:44] - Ry_

But there's no bugs. No. So do you have any long flights coming up where you have some new extensions coming?


##### _[00:23:51] - Marco_

No, we had a baby last year. It's like my flight budget is very low at the moment. That's true.


##### _[00:23:58] - Ry_

Your latest extension is human.


##### _[00:24:01] - Marco_

Yeah, but yeah, I'd like to play more with Rust because that the problem with extensions in the past. Like developing them in C has always been like c doesn't have any good sort of dependency framework. There's these old established library like, I don't know, LibZ and LibXML or something, like something that was developed 20 years ago and now, okay, every system has it, you can use it, but for anything newer than ten years, it's extremely annoying and hard to use a C library. And then even if you can figure out your configure and your make files, the memory allocation is probably going to not play nicely with Postgres. So that's where Rust is kind of interesting. Now there's this whole ecosystem of open source libraries that can potentially become extensions and we're still sort of at the very start of that, what's going to happen?


##### _[00:25:05] - Ry_

It's kind of scary because it could be very much of a Cambrian explosion. What happens if there are 300 new extensions that are worth adding? It's sort of a pain for the managed service providers.


##### _[00:25:19] - Marco_

Yeah, definitely. Yeah. And they can have funny incompatibilities. It helps that then Rust is a little bit more safe and a little bit more not managed, but the memory allocation is a bit more sort of safe as well. But then, yeah, you can have a lot of weird bugs if you combine all these unknown bits of code.


##### _[00:25:46] - Ry_

That's great. Are there any extensions that you've run across either recently or in the past that you love, that you would mention as exciting? I mean, you mentioned PostGIS and anything else that you can think of. It's no big deal if not.


##### _[00:26:04] - Marco_

Yeah, there's many. I'm sort of intrigued by Postgres_ML. It's like this just machine learning extension that they seem to be doing a lot of interesting things. I don't have a good use case for it myself yet, but I really like what you're doing. Also in Rust, I think MIT licensed, so it can be used in a lot of places. There's of course a lot of buzz around pg_vector and more recently pg_embedding, which is sort of an interesting kind of development because now I think they both added this HNSW indexes which are faster than the IFV flat indexes that pgvector provided. But then it also means they are now incompatible with the latest versions. You can create one or the other, not both, which is a little awkward. But I think that is where, of course, one of the most fastest moving areas and I think some of these things will be figured out.


##### _[00:27:06] - Ry_

Have you gotten those extensions added to the Citus managed service?


##### _[00:27:11] - Marco_

Yeah, we definitely have pg_vector. Yeah, I mean, I think that took the landscape by storm. I think they're pretty much on every managed service now.


##### _[00:27:19] - Ry_

It's interesting, we're working on this thing called Trunk where we're trying to maybe I don't know if we can get you guys to participate, but the idea would be to send some metadata to some sort of central repository that we'd know, like which extensions are trending, waning, completely dead or not. I just think it's interesting as a new person coming into the Postgres ecosystem, there's just this library of potential extensions that it's pretty expansive and kind of trails off in a know because you can find them loosely here or there on GitHub. But I think having a better directory of them would be good for the community.


##### _[00:28:04] - Marco_

Yeah, I guess. One thing that's also tricky about extensions, it's like you'd want it in an ideal world, you write it once and then it works forever. In the real world, every Postgres version potentially breaks your extension, so someone has to actually go and fix it. For new Postgres versions, sometimes it's okay. I think with pg_cron, I had like once or twice. It's like I think Postgres 16 didn't actually no, it did require some fixes. I think there was one Postgres version which didn't require any fixes. Maybe PG 15, I was already happy. But usually C is a bit of this wild west of programming languages. But yeah, sometimes just some function header changes, there's an extra argument and then none of the extensions that use that function compile you have to have some level of maintenance behind each extension. Well, not every extension does well. Great.


##### _[00:29:03] - Ry_

I mean, it was great to chat with you. Happy to have you back on again. If you have a big new release of Citus, I don't know, do you guys have any big plans for it or has it reached a certain point of stability where it is what it is? Yeah, I'm kind of curious.


##### _[00:29:19] - Marco_

Well, our most recent major release added this kind of notion of Schema based Sharding, where so far it's always been like you have distributed tables and you have a distribution column and you need to pick which columns you use. But the Schema based Sharding is just like every Schema becomes its own group, own Shard, essentially, so it might be on a different node. So for apps that use Schema per tenant, that's a very nice model. And so we're investing more in that at the moment.


##### _[00:29:49] - Ry_

Well, great. Good to meet you. Looking forward to continuing to get to know you. And thanks for joining us on the show.


##### _[00:29:56] - Marco_

Yeah, it was great. Thanks for having me.
