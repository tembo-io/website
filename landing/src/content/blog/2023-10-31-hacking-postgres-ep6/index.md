---
slug: hacking-postgres-ep6
title: "Hacking Postgres, Ep. 6: Regina Obe and Paul Ramsey"
authors: [ryw]
tags: [postgres, hacking-postgres]
image: './ep6.png'
---

In this episode, Ry, Regina, and Paul talk about geospatial development, the challenges of creating and maintaining an extension across multiple Postgres development cycles, and what they’re hoping for in the future of Postgres.

Watch below, or listen on Apple/Spotify (or your podcast platform of choice). Special thanks to Regina and Paul for joining us today!

<div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', marginBottom: '5%'}}>
  <iframe
    style={{ position: 'absolute', top:'10px', width: '100%', height: '100%' }}
    width="100%"
    height="400"
    src="https://www.youtube.com/embed/q3TXM6Nu7Aw?si=El0OVHhXKXkXAoQ1"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen>
  </iframe>
</div>

Want to know more about something they mentioned? Here’s a starting point:

* SQL Server - [https://www.microsoft.com/en-us/sql-server](https://www.microsoft.com/en-us/sql-server)
* PostGIS - https://postgis.net/
* Gist - https://www.postgresql.org/docs/current/gist.html
* R-tree - https://www.postgresql.org/docs/current/indexes-types.html
* KNN - https://postgis.net/workshops/postgis-intro/knn.html
* Parallelism - https://www.postgresql.org/docs/current/parallel-query.html
* GEOS - https://libgeos.org/
* CartoDB - https://carto.com/
* Crunchy Data - https://www.crunchydata.com/
* OGR - https://github.com/pramsey/pgsql-ogr-fdw
* Paragon Corporation - https://www.paragoncorporation.com/

Did you enjoy the episode? Have ideas for someone else we should invite? Let us know your thoughts on X at @tembo_io or share them with the team in our [Slack Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw).


## Transcript


##### _[00:00:12] - Regina_

Hi, I'm Ry Walker, founder of Tembo, a managed Postgres company. And today I have Regina Obe and Paul Ramsey, two who are working and have been working on PostGIS for quite some time. Welcome to the show, both of you.


##### _[00:00:28] - Regina_

Thanks, Ry.


##### _[00:00:28] - Paul_

Thanks, Ry. Nice to be here. Great. Yeah.


##### _[00:00:32] - Ry_

So I think you guys have all been using Postgres for quite some time. Maybe. Paul, when did you start using Postgres?


##### _[00:00:42] - Paul_

I started using Postgres, and I'm sure I can give you a version number, I think like 6.4, which I think puts me in like the '98, '99 era. And yeah, I was using it as a consultant. My first career was in consulting and working for the provincial government. And we were doing a big data analysis project and it was a geospatial project, but all the geospatial processing was being done by an external piece of software and we used Postgres as the backing store for what was a very long, like, 20 day compute cycle to spit out all the results for the entire province.


##### _[00:01:17] - Ry_

Nice. How about you, Regina?


##### _[00:01:18] - Regina_

I started out as a SQL Server person, so yeah, Paul dragged me into Postgres. So my first introduction was via PostGIS in 2001, I think it was. So it was like 7.1 or 7.3, I can't remember somewhere between 7.1 and 7.3.


##### _[00:01:39] - Paul_

It was 7.1 because that was the first version of Postgres that you could actually do a geospatial extension. Oh, nice.


##### _[00:01:45] - Ry_

And do you regret leaving SQL Server?


##### _[00:01:49] - Regina_

Well, I still consult for SQL Server, and what's interesting about that is I think I've gotten to be a better SQL Server expert knowing Postgres because Postgres would always introduce things first, like all the lead functions, all the window functions, Postgres introduced those before SQL Server had them and the CTEs and everything.


##### _[00:02:18] - Ry_

Yeah, got it. What's the state of geospatial in Microsoft SQL Server, would you say compared to Postgres? I don't know too much about that ecosystem, but I'm curious, how much parity have they achieved?


##### _[00:02:32] - Regina_

Well, I think their geography is still better than ours, but in terms of the geometry support, they're way behind, which is what most of the state people care about.


##### _[00:02:42] - Ry_

Awesome. Cool. All right, well, I'm going to kind of go off my standard script because how long have you guys been working on PostGIS for? This is one of the oldest extensions, or is it the oldest extension?


##### _[00:02:59] - Paul_

Yeah, well, I mean, so when we started extension, this didn't exist. It's a pre extension as a package concept. It's just like the idea of runtime, adding things at runtime to the database which was there from the very beginning. That was a Stonebraker original. Like, this is one of the things Postgres can do. PostGIS is from 2001, as Regina mentioned, she started using it within three months of the initial release. So, yeah, may of 2001. So yeah, we're at 22 years.


##### _[00:03:28] - Ry_

So how has it, has it changed much? Would you say since? Has it been pretty steady progress towards what it is now? Or were there any big milestones, big changes that you can remember that are super noteworthy?


##### _[00:03:42] - Paul_

It has not been like one linear rise. It's definitely been punctuated equilibrium. And as these things go, the most new features and new capabilities happen right at the start, because we started with nothing, right? We started with first release. It had geospatial types, it had a geospatial index. It had eight functions, I think only one of which was analytical in any way. But that was like release 0.1 in 2001. I think we got to 0.8 in two years, like 2003. And that had the first full set of spatial functions where you could really test all the relationships between the geometries. You could do constructive geometry operations like buffering intersections and unions and so on in the geometries, that was the really big like, you could have stopped there in many respects. If you look at what SQL Server has, that's kind of what they did until 2008. They had no spatial at all. And then they came out with their spatial extension, which was basically what they have now because it was a capable, complete vector spatial database, full stop. But since then, we've kept adding stuff. Maybe Regina will take another tour of what she thinks the biggest things to happen since 0.8 were yeah, so I.


##### _[00:05:08] - Regina_

Think PostGIS just improved as Postgres improved. So they introduced Gist and all our indexes changed from the old R-tree to the Gist index. They improved aggregation in Postgres, which I think was a huge milestone for us because a lot of the processing we do involves aggregating geometries together. So we would see something like from a tenfold speed improvement in terms of aggregation of geometries. And then the other things. I think CTEs were pretty useful. Now, nobody does any queries in Spatial without using a CTE anymore.


##### _[00:06:01] - Ry_

Would you say, like those advances in Postgres? I don't know. Let's say that they did 80% of the work towards the thing working ten times faster, and you guys had to do 20%. Or what was the ratio of effort from where were you getting great improvements virtually for free without any effort on your side?


##### _[00:06:21] - Regina_

Yeah, I think we were getting great improvements for free, pretty much.


##### _[00:06:25] - Ry_

Oh, that's great.


##### _[00:06:25] - Regina_

And then there's the whole KNN thing, which they drastically improved from 9.2 to yeah, I was making fun of Bruce, and then Bruce said, I can't believe you'd have to do that. We need to fix it. And so after 9.2, the KNN became real KNN instead of just box KNN. But yeah, in all those cases, there wasn't that much we needed to do to get the improvement.


##### _[00:06:49] - Paul_

Parallelism.


##### _[00:06:50] - Regina_

Oh, yeah, parallelism.


##### _[00:06:51] - Paul_

Another one of which is like a huge freebie. Like, look at that. We do parallel processing.


##### _[00:06:57] - Regina_

Yeah, the only thing we needed to do is tell people how to configure their Postgres comps to take advantage of parallelism.


##### _[00:07:05] - Ry_

Curious, what kind of challenges did you guys face? I'd say early on building this.


##### _[00:07:14] - Paul_

The biggest thing? Well, I don't know. There are a lot of things. As a geospatial extension, our code isn't packed like into one hunk of code that we control. We use a lot of library dependencies. And so we end up having, and we still do having a really complex build almost right out of the gate compared to other extensions, because other extensions like, hey, we're a self contained thing. You just type, make and you're done. Whereas with us it was always like, hey, guess what? You get to track down three or four different other libraries in addition to the thing that we have and make sure they're the right versions, and here's the configuration, so on. So we end up with this really naughty configuration setup. And initially, like, if you're going to start using this stuff back in the day, step one was always to build it. They weren't prepackaged. Postgres itself wasn't prepackaged, everything was from source, so it put this fairly steep entryway in for new users.


##### _[00:08:14] - Regina_

Yeah, although early on, we didn't have any other dependencies except Postgres, so it was much easier.


##### _[00:08:19] - Paul_

Well GEOS after two years and then, well, proj at the same time. I mean, we had GEOS and proj almost from the start, and then started picking up format libraries after that.


##### _[00:08:28] - Regina_

Do we have proj?


##### _[00:08:29] - Paul_

Yeah, I don't remember projection because proj already existed, so tying it in was a pretty straightforward thing to do.


##### _[00:08:35] - Regina_

Okay, I don't remember that. Or maybe it was an optional dependency, so I just never built with it.


##### _[00:08:43] - Paul_

Everything was optional.


##### _[00:08:44] - Ry_

Tell me what GEOS is. I've seen that mentioned, but I didn't dive in. Is that powering other geospatial solutions besides PostGIS?


##### _[00:08:55] - Paul_

Yeah, it is. GEOS is an acronym of course, stands for Geometry Engine open source. It provides the computational geometry underpinnings for a bunch of sort of the key functions. I mentioned a buffer, that's a GEOs function at the back end. Intersection is a GEOS function at the back end. The Boolean predicates intersects contains within those are all GEOS functions at the back end. Some of the fancier stuff that we've added to GEOS is now exposed in PostGIS. So if you ask for Delaunay triangles or [...] polygons, you get those from GEOS and then GEOS, because it's like this useful Swiss Army knife of computational geometry is used by other programs in the geospatial ecosystem. So if you use the Google library, it backs out of GEOS for its geospatial operations. And like most prominently, if you use the QGIS desktop GIS, you'll find that the Q just backstops its geospatial algorithms.


##### _[00:09:54] - Ry_

So did you guys refactor code into that, or did you just end up replacing some stuff you had built early on with that library later on?


##### _[00:10:01] - Regina_

Well, Paul started GEOS too.


##### _[00:10:04] - Ry_

Okay. All, it's okay. So it sounds like refactored into that.


##### _[00:10:09] - Regina_

Well, not so much refactor. I think it was always kind of a separate thing. Right. It was always intended to do more.


##### _[00:10:15] - Paul_

And as an external library, there's actually a slight penalty to using it because you got to take your data out of the Postgres memory space and copy it over into the JS memory space to work with it. And that's just expensive enough that for simple things, we still actually kept the original native post, just side implementations for things like area or length or the most complex one that we kept is distance. Yeah.


##### _[00:10:45] - Ry_

Are there any milestones going in the future for PostGIS that you're looking forward to or is it just kind of stability and continuous improvement?


##### _[00:10:56] - Paul_

You go, Regina.


##### _[00:10:58] - Regina_

Oh, no, you're not going to ask me that. I think speed is always good, and my concern, I think, is mostly improving Raster. And I'm looking forward to Toast's API changes that are coming along and how we could leverage those.


##### _[00:11:16] - Paul_

That's funny you bring up raster. Maybe we should talk about this in the part we have a little get together, because it's one of the things which in front of me lately is like the underlying infrastructure we have for handling rasters was built well, no, 2010, anyways. It was built, like, in an era when the idea of, say, doing cloud based raster processing was kind of not what would be done. It was built around the idea that you would store your own rasters kind of locally in your local area network, that increasingly organizations just don't do that. They still want to have raster access. And while you can do remote raster access with what we have, it's kind of clunky. It's not optimized for that at all. I feel like just like a relook at what the raster use cases are and kind of a reevaluation of whether how we handle rasters is right is due. I was looking at the API that Alibaba offers on their cloud databases and thinking, yeah, that's kind of an interesting way of tackling rasters.


##### _[00:12:17] - Ry_

Yeah, you're talking about like Alibaba is like a they have a proprietary database or not, their Postgres.


##### _[00:12:25] - Paul_

They don't say. They're really cagey about it. So I'm not sure whether it's back then Postgres or not, but their take on rasters is very much all their own. I haven't seen anyone else go at it that way.


##### _[00:12:35] - Regina_

Oh, I haven't seen that. I should check that out. But yeah, that's one of the complaints that people have, at least the clients I have, that the outdb is much slower and yeah, that could be improved.


##### _[00:12:48] - Paul_

Yeah, great.


##### _[00:12:51] - Ry_

I'm curious if you're paying attention. I don't know the difference. I've not studied how PostGIS works or raster, and it is but I'm curious, is the vector search stuff happening that's happening in the ML space? How closely related is the math of that to the math of I'm sure you've kind of paid a little bit of attention to that space. Is it wildly different or is it kind of remarkably similar or neither of those?


##### _[00:13:23] - Paul_

Yeah, well, I mean, insofar as a 2D vector is the same as a [...] vector. At a conceptual level, they're the same. But from a practicality point of view, the practicalities of handling super high dimensional stuff are just different. Like one of the first things you learn, even like we go to four dimensions, even at four dimensions, the indexing properties start to break down if the kind of sort of standard R-tree stuff just doesn't work as nicely. You don't have to get very high up into a complex dimensional space for that form of indexing to be like, it doesn't work, it's not doing what we need to do. And you can really see that in just how different the indexing approaches are for ML vectors compared to sort of 2D vectors.


##### _[00:14:10] - Ry_

So, like, high dimensionality just requires an entirely different mindset and solution set. So I'm hearing you say.


##### _[00:14:17] - Paul_

Yes, totally.


##### _[00:14:18] - Ry_

Just curious if it somehow scales into that or not. That's cool. Yeah. Well, tell me, I guess, real quick, I'd love to learn a little bit more about the commercial products, I guess. How does this manifest? How does PostGIS manifest commercially for both you and Regina?


##### _[00:14:41] - Regina_

For my side, it's mostly consulting. Yeah, I don't have any commercial things around.


##### _[00:14:52] - Paul_

I make sideline in talking about and studying the economics of open source. One of the things that's kind of obvious once you start looking at this stuff is that there's like a project size threshold before you start to see enough money around a project to support full time maintainer ship or people whose jobs are mostly around the project. And PostGIS is interesting in being like one of the few Postgres extensions which has received achieved that level. But even at that level, it's quite small. So you got Regina, who has a good consulting business. I work for Crunchy Data, which is a professional open source support company, which is to say they sell support contracts to Fortune 100 companies and US Federal government and increasingly a number of international organizations, but of similar size and scale, big organizations. And then also has a software as a service called Crunchy Bridge, which is basically database in the cloud of the sort that everyone's gotten used to. So, I mean, in that respect, I'm kind of like Regina. I work for Crunchy because they value my expertise as a PostGIS committer and my ability to help their customers who deploy PostGIS.


##### _[00:16:20] - Paul_

So it's still very much like skills for hire. No one has wrapped it up, has wrapped PostGIS itself in particular up as a specific product.


##### _[00:16:28] - Regina_

Yeah, I mean, others have, it's just.


##### _[00:16:30] - Paul_

We haven't and then yeah, other members of the development team are also still sort of on the consulting bandwagon and that's how it bundled.


##### _[00:16:41] - Ry_

I'm not familiar with anyone who's bundled it up as a product per se, who's done that?


##### _[00:16:47] - Regina_

I mean, it's not so much a product, but like all the cloud providers so Amazon has it, Microsoft has an installable extension. Yeah. As an installable.


##### _[00:16:59] - Paul_

From the point of view of ubiquity and market spread.


##### _[00:17:03] - Regina_

Yeah. CartoDB used to be the closest though. But do they still use Postgres or did they switch to something else?


##### _[00:17:09] - Paul_

Which DB?


##### _[00:17:10] - Regina_

CartoDB. Carto.


##### _[00:17:12] - Paul_

They still use Postgres. Yeah. They haven't moved up. That would be a good sort of like example of a productization of PostGIS. Certainly in their earliest incarnation they had a software as a service which did a very good job of allowing you to put data in, visualize it in a whole bunch of ways. And that exposed like SQL as the language for customization of what you were seeing. And it was all sitting on top of PostGIS, but it was marketed as CartoDB. So they had productized around a software service that more or less made the database not invisible, but the actual brand of the database was irrelevant.


##### _[00:17:51] - Ry_

Do you see real old versions of PostGIS surface? Like, I'm sure you probably don't see 0.8 anymore, but no. How good are people at staying up on the latest, would you say? I have not as good as you.


##### _[00:18:08] - Regina_

Haven't seen any 1.5 recently. I think there might have been one.


##### _[00:18:16] - Paul_

Your standards are different from mine, Regina, because I,...I'd freak out if someone brought me a 1.5. I'm shocked at how many version two is just still in the wild. Let me account back that first digit is worth about a year. So we're at 3.4 now. So 3.0, so that's five years. So yeah. So some shows up with a two point something. It's a five year old installation.


##### _[00:18:35] - Regina_

Yeah.


##### _[00:18:35] - Ry_

And they're probably five versions of Postgres old too, right?


##### _[00:18:39] - Paul_

Yeah, exactly.


##### _[00:18:41] - Ry_

What's the biggest jump you'll do? Will you take someone from eleven to 15 or Postgres? That is the equivalent?


##### _[00:18:48] - Regina_

Yeah, because the latest wouldn't even run on that. Well, in theory, anybody from PostGIS 2...


##### _[00:19:00] - Regina_

should be able to go straight to 3.4 without any issue as long as they upgrade their Postgres too. What happens to their development, their applications? Breaking that's on them.


##### _[00:19:15] - Ry_

Well, it must be nice to be relying on Postgres. I think you can criticize, if you would like, various aspects of how Postgres is built, but I think that it's really great how stable, I want to say slow that the progress is made because it gives you a very stable and reliable chassis to build this on top of. I'm sure you guys agree with that.


##### _[00:19:44] - Regina_

Yeah, I think in terms of slowness, they're actually much faster than other relational databases.


##### _[00:19:49] - Paul_

Much, much faster in terms of how fast things change. Yeah, I guess there's always that push particularly thing. New SQL dialect stuff has come in pretty quick.


##### _[00:19:58] - Regina_

Yeah, because I remember when I be talking to my SQL Server friends and they're still waiting for the lead function. That happened like five years ago back in the day. But yeah, I think it moves in terms of the SQL standard a lot faster than the others. I think even faster than Oracle, though I don't have too many Oracle friends to talk about.


##### _[00:20:20] - Paul_

Yeah. I'm frequently, frequently surprised by how much internal churn there is because I always feel like, oh, we're the super mature extension. We don't reach like super deep into the extension, like into the into the core. We're not hooking into like executor hooks or planner hooks or stuff like that. And yet there's always this there's always this medium to long list of things that have to be tweaked when you move up to a new, like in terms of our code or for it to build and still run correctly, that have to be tweaked at each major Postgres release.


##### _[00:20:57] - Regina_

Yeah, because I can't think of any release we've done that we didn't have to tweak it for the in development major release of Postgres. So they changed it enough that it always affects yeah.


##### _[00:21:10] - Paul_

Yeah.


##### _[00:21:10] - Ry_

So even if the outer shell seems pretty stable, the insides are changing and you guys have some stuff poking down at least to the middle, if not the bottom. That's great. Yeah, like I said, I think it's to me a really perfect pace because we do get that kind of like annual innovation and if there's something that's really important, it'll get taken care of, I think. I'm curious, are there things happening in Postgres core that you guys are excited about? Maybe for we could talk about 17 or whatever, 18 future? Is there anything in particular that you guys are excited to see?


##### _[00:21:53] - Regina_

Well, there's bi directional seems to be making its way. I don't know if it's going to make it into 17, but it looks like they're putting in the hooks for it anyway, so that's kind of exciting.


##### _[00:22:05] - Paul_

Yeah, for me, that's what's exciting. I've been watching the decade long crawl towards being able to do a replicated OLAP system where you get full push down to all the nodes. So every release, the Postgres FTW folks from Toshiba and other places add a couple more turns of stuff that you can push down, which is exciting to me because we're that much closer. We're that much closer to be able to do big multi node queries because there's OLAP workloads and LTP workloads for spatial databases. Really, the bias is towards OLAP for sure. In terms of what you see, how you see people using the database. I mean, they like transactionality, they like to be able to manipulate their data. But when it comes time to ask, what is this for? It's like, oh yeah, we run big analyzes. So the ability to push stuff out to multi node as that gets more mature, as it gets more possible, like, that becomes something that's really exciting on the spatial side. So I watch every little tick of the gears towards that endpoint and get very excited. So it's been pushed down in the last couple of releases.


##### _[00:23:22] - Paul_

Last release had good stuff around parallelization in the planner and executor as well for partitions, which is like, that's a big deal because the holy grail is you've got your big table partitioned out across the remote nodes. So each of your partition is actually a foreign table. And when you run the query, the planner says, oh, look, I can just ask all the partitions to run it simultaneously, it gets back the result, assembles it and says, Here you go, we're getting close to that. Which would be a big deal because there's a whole bunch of workloads that you can just turn into sort of like a standard OLAP star schema. One big fact table, a bunch of dimensions and you'd be able to do lots of really cool spatial stuff. That right now, not so much. I don't know when we'll ever get to the holy grail, which is to be able be able to do shipping data between nodes in order to allow nodes do things like join across these across two big fact tables. That might never happen. I don't see anyone doing that. But that's the one that would like having me tear my clothes off and dancing in the street.


##### _[00:24:34] - Ry_

Yeah. So that's interesting. You're talking about like I haven't followed the development of Postgres FDW. I used it recently and it's pretty powerful at low scale, but you're talking about at high scale, at OLAP scale, just optimization across.


##### _[00:24:53] - Regina_

And Paul has this fantastic foreign data wrapper, a spatial foreign data wrapper, which can read how many formats? 800?


##### _[00:25:03] - Paul_

Yeah, no, there's not that many formats in the world, but I don't know several different yeah.


##### _[00:25:08] - Ry_

Formats of geospatial formats. Is that what you said? Or other types of formats.


##### _[00:25:14] - Paul_

Geospatial formats. But to an extent, geospatial formats is a category which also includes non geospatial things because all you have to do is not have the geospatial column and then what do you call it? Oh, it's just a format. So Excel can be a geospatial format. Got it. And it's something that you can read. SQL Server.


##### _[00:25:32] - Ry_

What's the name of that extension?


##### _[00:25:34] - Paul_

Or that extension is called OGR. Under more FDW.


##### _[00:25:37] - Ry_

OGR.


##### _[00:25:38] - Paul_

It stands for well, OGR is like it's not even worth trying to unpack it. OGR is just the vector side of the GDL library, which also has an acronym which is not worth unpacking anymore because it's a 20 year old acronym, but it refers to the library that it's binding. This is the OG library for vector formats? Yeah.


##### _[00:25:58] - Ry_

Cool. Yeah, I'll check that out. That's cool. Kind of wrapping this up on the core. Like if you had a magic wand and you could add any feature to know. Of course, if that was added, then you immediately have work to do in PostGIS as well. But what would your magic wand manifest this weekend in Postgres if you could pick one thing?


##### _[00:26:20] - Regina_

Yeah, I can't think of any.


##### _[00:26:21] - Paul_

I know what Regina's is. Oh, come on. I'll tell you what yours is then, Regina, if you're not going to say.


##### _[00:26:30] - Ry_

You guys can answer for each other if you want.


##### _[00:26:32] - Paul_

It's handling extensions in a slightly different way or sorry, had an extension update in a slightly different way. So extension versioning.


##### _[00:26:40] - Regina_

Oh, yeah. How did you read my mind? I completely forgot about it because I gave up hope on it.


##### _[00:26:47] - Ry_

Yeah, tell me about that.


##### _[00:26:48] - Regina_

So Sandro, who's also on the PostGIS team, he's been working on an update to the extension machinery that would allow us to reduce our upgrade script to one file because right now we ship like 500 files, which are all pretty much just SIM links to the same thing. And so it's just a way to have the extension machinery understand that, hey, this script can be used to upgrade this version, this version, this version and this version, instead of having to itemize every single version upgrade.


##### _[00:27:30] - Paul_

Yeah, the extension upgrade machinery is very clever, but it starts with an immediate assumption, which is that as a developer, you will manage your extension upgrades as incrementals between versions and that it will cleverly find the path through the incrementals from the version you have to the version you're going to, applying all the little slices on the way.


##### _[00:27:55] - Regina_

And it uses Dijkstra for that.


##### _[00:27:58] - Paul_

Yeah, it's super clever. Even like in the best case scenario where you'd already been doing that, it's probably not super ideal for any project where the development path isn't linear. So Post just has, I don't know, 25 or so minor releases like X, Y, and then within those, there's maybe five patch releases across each of those. So we'll have a whole bunch of parallel version trees, right? You're on 2.3.5, or you're going to go to 2.3.6, but then you might want to go to 2.4.8. And that means you have to have all these individual even if you're doing things like one tiny step of time, you would have all these individual little hops across the branches. If you have just this one line, it kind of worked. You just sort of chained together this one little line. You don't have very many files when you have all these little branches, all of a sudden you need all these extra little hops across the branches. And it's made worse because all of our management of the SQL side of it, the SQL side of the extension where you define the functions on SQL land and say, oh, it's over here in the dynamic library.


##### _[00:29:24] - Paul_

We've been managing that since pre extension world. And our way of managing it was to have a SQL file which can always be cleanly applied against any previous version. So it's quite long because the SQL file has every single definition of every single thing in it. So how you handle the incremental thing from 1.2 to 1.3? Well you have one copy for 1.31 copy for the upgrade as well. So every little upgrade has a full copy of that fairly large SQL file. On Unix systems now we just ship sip links instead of syncing the whole file. But you end up with just a huge pile.


##### _[00:30:05] - Regina_

Yeah, actually we changed from that to just a file that has nothing in it. Right. To just on any version which kind.


##### _[00:30:13] - Paul_

Of the chain eventually arrives at the full one.


##### _[00:30:17] - Regina_

So now that's the same across. But I think ours is more complicated too because for each version we support multiple versions of Postgres and we also enable new features. If you're on like twelve you get something, if you are eleven you don't get that something.


##### _[00:30:40] - Paul_

Certainly something which is not contemplated by the original designers is our file. Our input file actually goes through, we put it through the C preprocessor before we give it to Postgres because we have a whole bunch of if defs against what Postgres version you're on. Living inside the SQL file that have to be pre processed before it's usable.


##### _[00:31:02] - Ry_

Yeah, I understand. Was maybe you're saying like the current design is just naive thinking that you're not going to try to support multiple versions of Postgres with one of your versions of the extension and there's not home for that information, I guess for what the range is to some degree.


##### _[00:31:22] - Paul_

Yeah, I mean although the extension framework does contemplate the idea of versioned extensions, again, it doesn't really contemplate them as anything except for a linear chain. And once you have a more complex situation than that it's kind of hard. Like we for a very long time supported being able to run different versions of PostGIS inside the same Postgres cluster. We still do actually support that, but it's a feature that it seems like mostly OA developers use. So it's optional now and we default just to like one version of Postgres or PostGIS for each Postgres cluster. But that functionality was always there. But the extension facility did not grok that.


##### _[00:32:05] - Regina_

Yeah, and packagers did not grok that either. So they always, always ship one.


##### _[00:32:10] - Ry_

Great. I'm curious, try to wrap up here a little. I realize now I've been kept you here for quite some time, but do either of you listen to podcasts very much?


##### _[00:32:20] - Paul_

I do all the time. It's my gym thing. I go down to the garage gym and that's what keeps me from going crazy with me.


##### _[00:32:28] - Ry_

Your give me some of your favorite podcasts.


##### _[00:32:31] - Paul_

I tend to go on the current affairs side, so I listen to the Ezra Klein show from New York Times a lot and Odd Lots from Bloomberg, a little bit of financial news.


##### _[00:32:40] - Regina_

Yeah, you can tell he's the son of a politician.


##### _[00:32:42] - Paul_

It's interesting stuff.


##### _[00:32:44] - Ry_

Yeah. How about you, Regina?


##### _[00:32:47] - Regina_

No, I'm not a podcast person. I go swimming. But yeah, I can't really hook up a podcast.


##### _[00:32:55] - Ry_

Yeah, underwater is probably possible, but not super comfortable. Right, great. All right, well, so where can listeners find you online? Maybe share your websites or Twitter? Mastodon handles.


##### _[00:33:13] - Paul_

On the site formerly known as Twitter. I'm PWRamsey. I'm also PWRamsay at Mastodon Social and on the blog world, I'm at cleverelephantCA.


##### _[00:33:25] - Regina_

Yeah, I have how many blogs do I have? I have BostonGIS.com postgresonline.com. Twitter is just reginaobe, I think that's and my website, paragoncorporation.com, I guess those are. Oh, and my book site PostGIS.us.


##### _[00:33:47] - Paul_

Yeah, the book site.


##### _[00:33:49] - Ry_

What's that? I always say PostGIS, by the way. I got to learn it's PostGIS. But do you have a book for around it, or have you written many books?


##### _[00:33:57] - Regina_

Oh, yeah. So I wrote "PostGIS in Action." I'm working on "PG Routing." I'm also supposedly working on a Postgres book, both of which I'm very behind on. And I did "SQL in a Nutshell." And let's see, what else. Is that it? Oh, and "Postgres Up and Running." That's a pretty popular book. Surprisingly popular.


##### _[00:34:25] - Ry_

Yeah, it's sitting right there. I own that one.


##### _[00:34:28] - Regina_

Oh, really?


##### _[00:34:29] - Ry_

Thanks for writing it.


##### _[00:34:29] - Regina_

Oh, yeah.


##### _[00:34:31] - Ry_

Thank you both for joining. Appreciate you, all the work you've done for Postgres and PostGIS, and appreciate having you on the show.


##### _[00:34:42] - Paul_

Thanks for having us, Ron.


##### _[00:34:44] - Regina_

Thanks, Ryan.


##### _[00:34:44] - Paul_

Thanks. Bye.
