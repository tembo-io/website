---
slug: hacking-postgres-ep10
title: "Hacking Postgres, Ep. 10: Tim Sehn"
authors: [ryw]
tags: [postgres, hacking-postgres]
image: './ep10.png'
---


Even describing something truly novel is challenging, let alone building it. That’s the story of our final episode from Season 1, where Ry sits down with Tim Sehn from Dolthub to talk about the journey of building Dolt, the new release of Doltgres, and the challenges of adapting to the changing ways users engage with your product.

Watch below, or listen on [Apple](https://podcasts.apple.com/us/podcast/s1-ep10-tim-sehn-dolthub-doltgres/id1710401793?i=1000637183773)/[Spotify](https://open.spotify.com/episode/7APPC9RQr6NHX3yaXreFc8?si=bf17b96a2cc54c5f) (or your podcast platform of choice). Special thanks to Tim for joining us today!

<div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', marginBottom: '5%'}}>
  <iframe
    style={{ position: 'absolute', top:'10px', width: '100%', height: '100%' }}
    width="100%"
    height="400"
    src="https://www.youtube.com/embed/u1a5ovDUBsM?si=SbxITarJvj4eXzk1"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen>
  </iframe>
</div>


Want to know more about something they mentioned? Here’s a starting point:

* Dolthub - [https://www.dolthub.com/](https://www.dolthub.com/)
* DoltgreSQL - [https://github.com/dolthub/doltgresql](https://github.com/dolthub/doltgresql)
* Vitess - [https://vitess.io/](https://vitess.io/)
* Sysbench - [https://github.com/akopytov/sysbench](https://github.com/akopytov/sysbench)

Did you enjoy the episode? Have ideas for someone else we should invite? Let us know your thoughts on X at [@tembo_io](https://twitter.com/tembo_io) or share them with the team in our [Slack Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw).


## Transcript


##### [00:00:12] - Ry

Welcome to Hacking Postgres, a podcast about extensions, extension creators, and other interesting and innovative things in the world of Postgres. I'm Rye Walker, founder of Tembo, a managed Postgres company. And today I'm here with Tim Sehn from Dolthub. Tim, welcome to the show.


##### [00:00:30] - Tim

Thanks for having me.


##### [00:00:31] - Ry

Yeah, like to start, maybe you can give us a quick background. Where are you from, where'd you grow up, and what were you doing before Postgres?


##### [00:00:40] - Tim

So I'm Canadian. I grew up kind of around Canada. I went to the University of Waterloo. I graduated in 2003 and started my career at Amazon. It was a pretty small company. When I started. There were about 400 engineers there, so I think there's probably more than 400,000 engineers there now. So pretty fun place to work. Early days. Kind of grew up there. Left in 2013 to be the head of engineering at this tiny company called Snapchat. I was employee 18 there. I worked there for a little over four years. I left that job in 2017 and started this company. I've been doing that for a little over five years now.


##### [00:01:31] - Ry

Cool. Do you remember when you first started using Postgres? I can't remember myself, but I'm curious.


##### [00:01:36] - Tim

If you remember it's interesting. We've used Postgres to back Dolthub initially, and I'll kind of explain what we're trying to do a little bit more, probably later, but I used it through interfaces. The first time that I got kind of deeply familiar with it is the initial version is MySQL compatible, not Postgres compatible. So apologize for that on this podcast. There's a reason for so obviously a lot of people through the five years that Dolt's been available have come and asked for a Postgres version. And we built a PG dump to MySQL dump converter that we also open sourced. And so I wrote a lot of tests for that and was bug fixing it. So that was kind of the first time I got deeply familiar with the Postgres syntax and ecosystem and actually probably ran it myself on my machine.


##### [00:02:47] - Ry

Did you build Dolt, the original version while at another company, or did you go and just was it a startup from beginning of the project?


##### [00:02:56] - Tim

Well, so we started Dolthub because we wanted a place on the Internet to share data. And we thought that the reason one of those places didn't exist is because you couldn't branch and merge and clone and do all the things you could with databases that you could do source code. We started a company to do that, and we didn't start a company to build dolt was kind of the answer to that problem that we thought we would test.


##### [00:03:30] - Ry

And so you started Dolt what year you say it was? 2017.


##### [00:03:36] - Tim

So I quit in 2017. I left Snapchat on Friday. I started this company on Monday. By Friday, I was like, I'm not sure I really want to do this right now. So I kind of kicked the startup along in the background, incorporated it, got all the bank account, tin number, all that kind of stuff. And then my two co founders, Aaron Bryant, left their jobs in June, July of 2018, and we started this on August 6 of 2018. So we've been doing it a little over five years.


##### [00:04:07] - Ry

Yeah. So have you raised venture capital?


##### [00:04:11] - Tim

Yes, we've raised $23 million. We have about 11 million left. That's awesome. Yeah.


##### [00:04:21] - Ry

This isn't one of those kind of calls.


##### [00:04:23] - Tim

Yeah.


##### [00:04:24] - Ry

No, that's good. That's awesome. So when did you start integrating, I guess when did Dolt support Postgres? Rather than try to convert from.


##### [00:04:39] - Tim

So we just launched Doltgresql, a version of Dolt that uses a Postgres client to connect to it. It is not a Postgres extension, it's its own standalone database. And we can go into great detail about why that is. And that just launched on November 1.


##### [00:05:00] - Ry

Awesome. How hard was it to make?


##### [00:05:03] - Tim

Well, so we've been thinking about the project for over a year, like planning, exploring foreign data, wrappers, a bunch of different techniques to pull this off. And we started the project for real in let's call it like, July 1. So to go from nothing to something like a very early Alpha launch was three or four months.


##### [00:05:35] - Ry

Okay. So not terribly not a super long adventure to get there.


##### [00:05:43] - Tim

Yeah. The way it works is it implements the Postgres client protocol, and then it parses the SQL that comes in into an abstract syntax tree, and then it does a conversion of that abstract syntax tree to the type of abstract syntax that Dolt understands. And so then beyond that point, it's Dolt analyzer Dolt storage.


##### [00:06:15] - Ry

Yeah. So tell me about the is this storage sort of like files parquet or like yeah. How do you store the data?


##### [00:06:24] - Tim

Well, so that's the novel thing about Dolt. So we took a novel data structure from another open source project called Nons. They had built a content addressed B-tree, which they call a proletree. So at the core of every OLTP database, there's B-trees. The thing a content address B-tree gets you is that you can compare two of them in order time of the differences. So if they're the same right. They have the same root content address. If they're different, you walk the tree on both sides to find the different content addresses. And then at the leaves, that's where the data actually is. And then you can find the data that's actually different.


##### [00:07:09] - Ry

So it's really like files. It's not like a data lake sort of structure. It's not a proprietary, but like a binary storage engine for right.


##### [00:07:22] - Tim

Those end up in what we call chunk files, zip chunk files on disk. But it is, from the ground up, proprietary, not open source storage format.


##### [00:07:33] - Ry

Novel. How about novel?


##### [00:07:34.920] - Tim

Novel? Yeah, novel. Wrong word. And so with that data structure, most people listening to this podcast probably are aware that the core functionality that you need for version controlling anything is the ability to produce a fast diff. Because all the functionality that you use, like merge two of these things together, is all based on computing a diff and then applying the diff on either side of the merge. That's why it needs to be its own database, at least in the Postgres case we did explore it would need to be its own storage engine. It would like its own foreign data wrapped storage engine.


##### [00:08:25] - Ry

Okay, so yeah, we should probably jump up one level. I realize now I know what Dolt is and you know what Dolt is, but we didn't exactly describe you said it's as if Git and MySQL had a baby, but it's now if Git and Postgres were MySQL had a baby.


##### [00:08:45] - Tim

Yeah. So Dolt is a version controlled SQL database. It's MySQL compatible, it launched 1.0 in May, so it's 99.99% correct against a suite of 6 million tests that SQL lodging test that SQL Lite built. It's about 1.1 times slower than MySQL on writes and about 2.2 times slower than MySQL on reads. And so it's got OLTP level performance, but it also has version control features. And so you can diff, branch, merge - all the Git idioms that you're used to in the SQL context. The write operations are exposed as procedures. So you would call Dolt checkout, for instance, call Dolt underscore checkout with argument. So it models the Git command line through procedures. The read operations are either exposed as system tables, custom system tables like Dolt underscore log, and then there's also some SQL functions. So if you want to diff two commits, for instance, you would call it diff and pass in the two commits and those would produce a table. So it's a table. Basically, there's these novel version control features on top of your standard SQL database. If you never make a Dolt commit, it looks exactly like a Postgres or MySQL database.


##### [00:10:21] - Tim

It's just a head, a single head.


##### [00:10:25] - Ry

What are the use cases that you find getting the most traction on this? Where does it work? I guess, where are people loving it? And where is it perhaps not the right fit? I'm curious.


##### [00:10:38] - Tim

Our canonical customer, is this customer called Turbine. They do cancer cell simulations. A cancer cell simulation is about 50 to 100 gigs. They simulate about 50 different cancer cells. And before Dolt, they were putting their data in MongoDB. But as you can imagine, they have a number of researchers that are making changes at the same time to the data. And one canonical copy of the data wasn't enough for them to iterate fast on development. They use branches and merges and they'll have whole teams of researchers modifying a simulation, which usually means modifying the schema on a branch for six months. And then if that works better than the current one, they'll merge it in and so the way I describe it is anywhere where your configuration, your data is more like configuration that looks like code where you're building data. So like a catalog. We have a number of video game companies. So modern video games have many, many gigs of configuration, like the chest drop rate, the strength of this monster and putting that into Dolt and then using that as part of the development pipeline is a common use case.


##### [00:12:05] - Tim

The third use case is as a machine learning feature store. So whenever you build a model, you create a tag that's an immutable object. So then you can refer to that and get reproducibility or models based on that tag. And so those are the kind of the three core use cases. We wouldn't recommend it as like a high throughput, something to back a website. The features are less compelling there. Really you're talking about developer efficiency or the ability to recover from a bad query at the cost of some throughput. Eventually we think it's just a better mousetrap, but right now we'll take video game configuration future stores.


##### [00:12:57] - Ry

Yeah. Okay. That makes a lot of sense. Are people using it? I don't know. I think of the Postgres foreign data wrapper, I could keep some of my data in a dolt table and sync it into my, let's call it my transactional database to productionize it, I guess. Have you seen any of that happening where people are or how do they get it into use, I guess well.


##### [00:13:29] - Tim

People run it as OLTP. Right. So it does have pretty good.


##### [00:13:36] - Ry

Not.


##### [00:13:36] - Tim

Great, it's not perfect, but usually people just run it as their primary. But we do have customers that pull the data out and basically export and do a build process to put it in some sort of hot cache or something you can set up as a replica of MySQL. And so that just launched in early this year. So we have a couple of customers that basically in that mode. Every write transaction you make on your MySQL primary becomes a commit in Dolt. And so you get full log of every cell in the database, basically.


##### [00:14:19] - Ry

Yeah. I could imagine there'd be like certain tables that I might care to have history on. I guess there's different use cases for this, but if my use case was I want to have a good history of how this thing has changed, that would be one I love fast forks is another obviously important.


##### [00:14:43] - Tim

There's two levels of write isolation you can have. Right. You can make a branch, which means it's sitting there on your primary, but it's write isolated if you write to it. But if you make a long running query, that's obviously going to take up resources and potentially slow down your database. But you can also clone right, which is the decentralized way of doing it, which is what you're talking about. Like fast forking, which is like I just want a copy of this on my local desktop. I want to play with the data, do whatever I want to do with it. And Dolt supports both of those things.


##### [00:15:13] - Ry

And then how important is I click on Dolthub and discover databases, and I see lots of databases, I don't know how many. It seems like an endless scrolling number of databases. Is this for demo? Or is this actually a big part of the value proposition to have public or semi public or just shared data published?


##### [00:15:37] - Tim

That's where we started. That's this problem we tried to solve. I think we might have been a little skipped a few steps, like version control of source code came out in the we only got really a thriving open source community, maybe late 90s. For a while, we built novel data sets using this process called data bounties, where we would publish schema and we'd say we'll pay $10,000 for any accepted we'll divide up $10,000 prize based on the amount of data that you submit. And so we've built like a very popular hospital price transparency data set. There is novel data on there. The place where we're starting to get a little bit of traction on data sharing is in stock market data. There's this guy post. [inaudible 00:16:36]  he's one of our early customers. He's been publishing for three or four years now. Rates, options, option pricing. So it's kind of more advanced databases than an update daily on stock market data. It's there. We think eventually it could be a big piece of what we do. It all works, but we kind of consider ourselves a database company, not a data company.


##### [00:17:04] - Ry

Okay, cool. Yeah. So building the Postgres version of this, what were the biggest challenges you faced during that project?


##### [00:17:13] - Tim

Right, so we've been thinking about Postgres for a long time, obviously. I think maybe a better place to start is why is MySQL in the first place? Noms, the storage engine that we built on top of at first was written in Golang, and so Dolt itself was a command line program like Git. The idea was you would build it or you would download it and you'd run it like Git, you'd run Dolt ad where you'd run so it initially didn't have SQL, it was its own format. And then customers came and they're like, well, data is best expressed as SQL, both schema and I want to be able to query what's inside this thing. And so we wanted to add a SQL interface and Postgres. In the MySQL open source ecosystem, there's this project called Vitess, which is used by it's maintained by the folks at planet scale, which we love them. That's a pure Go implementation of the MySQL wire protocol and Parser. And so we could take Vitess. And then there was another open source project called Go, MySQL Server, which was a pure Go implementation of MySQL analyzer, and where you could plug with pluggable storage.


##### [00:18:48] - Tim

And so we could get a pure Go implementation of MySQL's wire protocol for basically Free. Now, it wasn't very correct, it was about 90% correct, but we could add it quickly and we could maintain Dolt as a Satal binary that you downloaded. Right. The deployment install story was very clear, whereas when we investigated how to do this with Postgres, it would have been something like a file based foreign data wrapper where you would have to install Postgres and then it would point it at like it would be a complicated install process for a user. It wouldn't be this seamless download a single binary, import your data, run SQL on. Our co founder Aaron is a huge Postgres fan. I think he was lobbying for Postgres, but the deployment story didn't really make sense at the time. Plus we were kind of considering SQL an add on, not the core feature. So that's why we chose MySQL Is for the deployment story since Dolt launched in August 2019. Obviously the first thing people, I want a Postgres flavor, I want an Oracle SQL flavor, I want a SQL Server flavor. So we've been talking about revisiting the file based foreign data wrapper approach.


##### [00:20:19] - Tim

I'd say the hardest project, the hardest part of doing Doltgres was figuring out how to do it. Was it going to be a file based foreign data wrapper? Was it going to be like a fork of Postgres itself? And there's reasons for that I can kind of get into. Or were we going to use Dolt's SQL Engine and storage and then just expose the Postgres flavor of SQL? So basically you connect with a Postgres client, but it's its own database, it's not Postgres. And so after some kind of deep investigation, we went with the last option, which is Doltgres is its own database, but it implements the Postgres flavor of information, schema, SQL, all that part. The reason for that was the way that Dolt exposes version control functionality is through procedures, custom system tables, and the extension interfaces that you have in Postgres were hard to modify in a way where we could keep the same version control interface. Right. So we had a hard time figuring out if it was a file based foreign data wrapper, how you would say switch branches, right. Or even maintain expose the concept of a branch to Postgres because Postgres doesn't really know what that is, doesn't expect that.


##### [00:22:06] - Tim

And so there was a lot more that we would need to invent to be able to make it use the Postgres SQL.


##### [00:22:18] - Ry

You said originally you thought the SQL interface was a secondary interface. Has it become the primary interface for most users? Or would you say that, yeah, we're.


##### [00:22:29] - Tim

A database company now? Part of the thing is, I'm not sure if people will be watching this, but I have gray hair. One of the things that you're taught as a software engineer is never build a database, right? So we tried to build a data sharing tool and got suckered into building a database. And so they so but that being said, now that we're deep on this journey and we have what we consider a production grade OLTP database, we're excited that we're there, right? And we think the world can be a better place for this. Certainly makes data sharing and open data much more feasible.


##### [00:23:23] - Ry

And like, for a new Doltgres user, would you even mention the CLI? Or is it just like, that's more of a legacy interface? Or is it like, hey, maybe you want this too?


##### [00:23:41] - Tim

Well, we've made the conscious choice with Dolgres to not implement the Dolt CLI. All right? The user interface is very simple. You download it, you run Doltgres, it opens up port on 5432, and you connect a Postgres client to it, PGP SQL or whatever, and then you run SQL command. And so we think in the long run, the way we'll differentiate Dolt and Doltgres is Doltgres will be a version controlled database, and Dolt will be Git for data, which can also be a version controlled database. And so we find that customers, especially coming to these new concepts, they get confused fairly easily with the is it a command line? Should I use the command line? Should I use the SQL interface? And so with it's, it's just the SQL interface.


##### [00:24:44] - Ry

Are there any big milestones coming up for Doltgres that you're looking forward to?


##### [00:24:50] - Tim

Absolutely. So one of the first questions we get asked is, okay, I love the features, I really want to use it. How's the performance? And so we've become very good at comparing MySQL and Dolt performance. So, as I said, Sysbench, we understand the MySQL knobs that we need to turn to make it perform the best or at least perform in a similar fashion to Dolt. And so I'm really excited to run those same Sysbench tests with Dolt against Postgres, because then we can kind of, by comparison, compare MySQL to Postgres, which I think is sort of an unanswered performance question. And so I'm both excited to see how Dolt does in comparison to Postgres, but I'm also very excited to kind of answer the question that I've had, which is like, which one of these databases is faster? And so I'm kind of excited to see how that comes out. And that should be Zach started first we're working on correctness tests and then performance tests are got it.


##### [00:26:03] - Ry

Yeah, it's a lot of work to do that stuff and do it right and make sure you're correct, right?


##### [00:26:10] - Tim

No, it's one of these things. We were talking about this yesterday. We were. On Yugabyte's. Website. They publish Sysbench test. A lot of people run Sysbench, but people don't run Sysbench. It's like, oh, on OLTP insert, it's 34 TPS on Sysbench, but on the same hardware, it doesn't give you a benchmark against, say, Postgres. And so you're like, okay, is that good or bad? You have a hard time. And the reason people don't do that is because setting up a database and putting on a bunch of different hardware and figuring out what the best way to kind of explain performance is fraught with peril. You open yourself up to being like, you didn't test it right.


##### [00:26:57] - Ry

You could set up Postgres to be with a few tweaks of some variables. You can set it up to perform worse. Right. So the question is, did you tune your competitor as well exactly your own, like, no, I didn't tune my competitor as well as I tuned ours.


##### [00:27:13] - Tim

A good example for us is our benchmarks run on AWS on an EC2 host backed by EBS. And so it's a network attached disk. And that's because the way that we kind of explain that to customers is that, well, so, like, if you use hosted Dolt or AWS RDS to run MySQL or Doit, then that's kind of what you're getting. That's the architecture and that's kind of what most people use. Now, Dolt is far less sensitive to disk latency than MySQL. And so if you run the same sysbench tests on your MacBook, for instance, that has SSD, MySQL performs much better because it's more sensitive to disk latency. So this is the kind of thing that you're questions you're opening yourself up to answer. But these are all interesting things for people to know and to talk about. So I'm happy.


##### [00:28:19] - Ry

So I noticed that the core project looks like it's patchy too. Has anyone else offered managed Dolt for MySQL?


##### [00:28:32] - Tim

Not yet. I would think we would consider that a win. That means it's popular enough and that people think they can make money off of hosting it. So that would be great. But yeah, no one does offer managed Dolt other than us.


##### [00:28:51] - Ry

Yeah, got it. Okay, well, good. I don't know if there's anything I should have asked that I didn't ask. I always like to ask people, like, do you listen to podcasts? And if so, what are your favorite podcasts? I'm a big podcast listener.


##### [00:29:08] - Tim

I've listened to a ton of podcasts. I've never driven my car to work in my career, so on my walking commute. Ever since the first generation ipod, I've been listening to podcasts. I'd say the early classic is econ talk. And then Bill Simmons. Those were the two that I kind of started with. And then over time, I've kind of phased out Econ Talk and more like Derek Thompson's. What's the name of that? You can search I forget the name of it, but it's another I don't.


##### [00:29:42] - Ry

Know that one either.


##### [00:29:45] - Tim

I don't listen to very much tech podcasts. The other one that I've been doing recently is The History of Rome, which is like 200 hours or something, and I think I'm at Trajan, so that's like 120 Ad or something. So I got like 280 years left of Rome.


##### [00:30:05] - Ry

That's awesome. Yeah, I like history podcasts, too. History that doesn't suck is one that I just recently discovered I'm listening to. Have you heard that? It's, like all about American history, so it's probably not very interesting to you.


##### [00:30:19] - Tim

Well, I'm American now. I live in Santa Monica, California. Dan Carlin is the king, but he only puts out, like, one podcast a year.


##### [00:30:30] - Ry

So whenever I see that drop in.


##### [00:30:33] - Tim

My podcast, oh, it's immediate listen. Immediate listen. Well, the World War I one. I've never had a more enthralling podcast experience, I don't think. Yeah, mind blowing. I know.


##### [00:30:45] - Ry

And it's so funny. I talk to my kids, I'm like, oh, yeah, just listen to a six hour podcast on Genghis Khan they're like, what are you doing? He's so great. So hardcore history. Everybody go listen to that.


##### [00:31:02] - Tim

Next. The thing I'd ask the Postgres community to do is please tell us what you want from a version controlled Postgres. So the I know, like, Postgres is about as good as Dolt was for MySQL two years ago. And so we have a playbook to kind of get Doltgres to where Dolt is. But there's things we can prioritize. For instance, one of the things that we released later that we could do first is we could make Doltgres consume the write ahead log and just be like a version control replica of Postgres. And so we could run fast ahead on that and that sort of prioritize insert updates, correctness schema correctness over sort of the read path and make the read path more oh, it's like exploratory. And the idea there is like, the customer or operator runs a bad query on your primary you can find and writes continue. Right. You can literally isolate the query, create a patch patch back on your primary. Right, yeah. So that would be the one thing I would ask this audience to kind of and then also just star a repo. Tell us that you're interested in it.


##### [00:32:48] - Ry

Yeah, well, good. Yeah, appreciate that. I don't know. You said November 1 and have you had much of a reaction yet?


##### [00:33:03] - Tim

You found us? No, it got into the top ten on Hacker News, so it definitely drove a lot of traffic to the website and interest. It's got about 550 GitHub stars. Our main core project has about 16,000. The thing about it is our customer base has told us we're going to continue to invest in it. So it's really what percentage of the 16 people we have working on Dolt should I dedicate to Doltgres?


##### [00:33:38] - Ry

Awesome. Well, it was great to have you on. This is actually episode ten, the last episode for the season. We're going to take a break over the holidays. Appreciate you bookending it for us and we'd love to have you back on later as Doltgres progresses and there's more to talk about. It was great to meet you.


##### [00:33:59] - Tim

Yeah, 100%. It was awesome. Thank you.


##### [00:34:02] - Ry

All right. Thanks, Tim.
