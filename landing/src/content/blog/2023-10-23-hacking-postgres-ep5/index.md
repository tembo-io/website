---
slug: hacking-postgres-ep5
title: "Hacking Postgres, Ep. 5: Alexander Korotkov"
authors: [ryw]
tags: [postgres, hacking-postgres]
image: './ep5.png'
---


In this episode, Ry and Alexander talk about OrioleDB (and the challenge of fighting bloat), fuzzy and vector search, and the challenges behind database management. Watch below, or listen on Apple/Spotify (or your podcast platform of choice). Special thanks to Alexander for joining us today!

<div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', marginBottom: '5%'}}>
  <iframe
    style={{ position: 'absolute', top:'10px', width: '100%', height: '100%' }}
    width="100%"
    height="400"
    src="https://www.youtube.com/embed/FrOvwkmAPvg?si=9OgASSFxHfkYSfb2"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen>
  </iframe>
</div>

Want to know more about something they mentioned? Here’s a starting point:

* OrioleDB - [https://www.orioledata.com/](https://www.orioledata.com/)
* fuzzystrmatch - https://www.postgresql.org/docs/current/fuzzystrmatch.html
* pg_trgm - https://www.postgresql.org/docs/current/pgtrgm.html
* MVCC - [https://www.postgresql.org/docs/7.1/mvcc.html](https://www.postgresql.org/docs/7.1/mvcc.html)
* [“Ten Things I Hate About Postgres”](https://rbranson.medium.com/10-things-i-hate-about-postgresql-20dbab8c2791) - article by Rick Branson
* “[Why Uber Engineering Switched from Postgres to MySQL](https://www.uber.com/blog/postgres-to-mysql-migration/)” - blog from Uber Engineering team

Did you enjoy the episode? Have ideas for someone else we should invite? Let us know your thoughts on X at @tembo_io or share them with the team in our [Slack Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw).


## Transcript


##### _[00:00:12] - Alexander_

Hi, I'm Ry Walker, founder of Tembo, a managed Postgres company. And today I have Alexander Korotkov from OrioleDB as my guest. Alexander, welcome to the show.


##### _[00:00:24] - Alexander_

Hello, thank you very much for inviting me. It's a pleasure to participate.


##### _[00:00:32] - Ry_

Awesome. Maybe I'd like to start by having you give us a quick background, like where did you grow up and what were you doing before you started working on Postgres?


##### _[00:00:41] - Alexander_

Even before Postgres?


##### _[00:00:43] - Ry_

Yeah, way back. Were you only like ten years old then?


##### _[00:00:49] - Alexander_

Yes, I started actually from web development. Yes. And for web development, Postgres become my favorite database management system. That time there were basically two popular open source database management system, MySQL and Postgres. And Postgres behavior looked way more consistent for me. And this is why Postgres become my favorite. And also thing which attracts my attention was generalized indexing in Postgres that Postgres have even that time had GiST and gene indexes which you could apply to different data types, different search operators. And that was very interesting for me. And I also have studied for PhD in university and I was interested in fuzzy search and features like this. And in Postgres I found fuzzystrmatch complete model. And that model contained Levenshtein function which defines editing distance between two strings, number of editing operations. And I found that it doesn't work with multibyte encoding, with multibyte encoding. So it just compares two strings, byte per byte. And my first patch was to just fix this bug. I actually didn't know if I could produce the I just downloaded sources. Thankfully that time compiling a Postgres already wasn't a problem. So I just had Linux on my desktop and just cloned it.


##### _[00:03:08] - Alexander_

Probably that time it was CVS repository, I cloned it and it wasn't difficult to locate the place in the source code responsible for this function. And I just have to find which functions are responsible for getting lengths of multi byte string in Postgres and stuff. Work was very easy, and I have submitted my first patch to Postgres, but then Robert Haas picked my patch to work on it to review and commit. And that time I get that it's not so easy this process community, because we have quite long thread studying possible performance regressions and on, and I rewrote patch this small patch many times. But finally we find a way when this patch not only fixes the problem of multibyte encoding, but also doesn't produce noticeable overhead when it's single byte encoding or strings, just uses single byte characters. In both of these cases, the overhead was negligible. And then Robert did commit my patch.


##### _[00:04:40] - Ry_

That's amazing. Yeah, it's interesting. How many lines of code was the patch, I wonder?


##### _[00:04:46] - Alexander_

I don't remember exactly. You could find it on the list, but this patch should be in dozens of lights, probably 20 or something like this, really small. But also with these fix, I started to work on improving this function, improving the performance because if you use the Levenshtein function you are typically looking for strings which are close to your string. Right. And the thing is you basically don't care about large distances. For instance, you are looking for strings with editing distance three or less. And that means that if it would be four you don't care how much bigger is that distance. And if you need only this, then you could easily, not easily, but you could significantly accelerate function Levenshtein calculation in many times and this functionality took even more work for me and Robert. But you could use it, it's Levenshtein less equal. Nice function.


##### _[00:06:09] - Ry_

That's great. Yeah. I also came to Postgres from being a web developer prior and I've realized in recent weeks actually, that the reason why I went to Postgres and not MySQL is primarily I was using Ruby on Rails, which just kind of was Postgres first and then I really didn't like PHP. Hopefully you weren't a PHP developer, but the lamp stack had MySQL and PHP together and I always just like I don't want to go anywhere near anything near PHP. That's really not a great reason, but it's just a fact.


##### _[00:06:48] - Alexander_

Yes, probably one of the great feature I have discovered in podcast in early days was DDL transactions. So that if you need to do a database schema migration, you can wrap all the changes into transaction and if something go wrong you can roll. Yes, that's just amazing. And it's interesting that even old and mature database management systems like Oracle or MSS SQL Server lacks of this functionality. I'm not sure about the present day, but at time indefinitely they all were lacking and this was very useful.


##### _[00:07:36] - Ry_

Yeah, that's great. So you built obviously you started with that first patch and worked on other fuzzy search stuff. Have you worked on any Postgres extensions?


##### _[00:07:52] - Alexander_

Yes, I continued to work on Postgres. Then I have found that I get known with Oleg and Theodore who was in Russian contributors of Postgres and I get familiar with their work. Some of their work I already know Gist and Jin. But for others work, it was interesting for me that we could accelerate also search for like patterns. Not just perfect patterns, but imagine you looking something that could be in the middle of the string. And there were that time Pgtrgm module. But at that time it only supports trigram similarity. Search using indexes. But I found that it's pretty easy if you decompose string with trigrams it's pretty easy to implement like search. So you could just extract trigrams from the like patterns and search for them. And thanks that trigrams are extracted all over the string so you can find this substring anywhere. And that time I would say my feeling was just great. So it's just amazing. So with quite small patch you could teach database server with some amazing advanced functionality and I get even more encouragement when I would be sorry if I confusing with names hugh Bert I don't know the guy from blogger from Poland who was posting to the planet PostgresQL waiting for and he also posted waiting for this feature like Word for Pgtrm.


##### _[00:10:15] - Alexander_

This was one of my first patches. Another thing that during my PhD research I also researched split algorithms for R3 and I have found more advanced algorithm and I have pushed this algorithm to Postgres core and to PostGIS that took time. Yes, because communities are quite conservatives, but it was also good.


##### _[00:11:00] - Ry_

Yeah, great. Well, I want to talk about OrioleDB, but before we do that, I was thinking are you paying attention to the whole vector search since you spent so much time on Postgres search features or I don't know, at least sometime. I'm curious, are you kind of tracking what's going on with vector search?


##### _[00:11:20] - Alexander_

Yes. That's interesting. That's an interesting subject. Yes. While I have researched the split algorithms, I have also experimented with cube concrete model which supported basically multidimensional rectangles of different number of dimensions up to one dimensions. And what I have found is that if you have low dimensionality two, three, four or five, then when you are producing split, your split will be good for one dimension, but almost don't differentiate other dimension. So you can imagine this if you have two dimensional space filled with points and you need to split them into two rectangles, there is just two good way to do this split vertically or horizontally. All other ways your rectangles would have a huge overlap. But thing changes when your dimensionality increases. There is a so called Woodman quadratic split algorithm and this algorithm actually do clustering. So it just tries to find to divide the set of points into two clusters. And it doesn't work well for low dimensionality, but for high dimensionality of space it becomes better than if you just pick one axis and split in this dimension. And that was interesting for me and I got familiar with cures of dimensions so that if you have low dimensionality space, you can have some guaranteed and quite good search performance.


##### _[00:13:36] - Alexander_

Right? So imagine the best example is uni-dimensional space. You can index this just b three and you have some guaranteed or logarithm n time for search for point request. Right? But when you have high dimensionality, that becomes a problem and uniform random data, which could be good, which you could handle very well with low dimensionality, in high dimensionality it becomes almost unindexable. So if you have 1000 of dimension vectors and you need to search for a similarity, then search in uniform data would be almost impossible to accelerate because you can't identify which particular dimension could give you a match. You could just eat just cumulative results of cumulative results of all dimensions and it's almost impossible to accelerate. I have participated a bit in improvement of PG vector and with some developers of Supabase, we really found that indexing methods, if they applied to uniform data, then they give nothing. So indexing methods, when you have a lot of dimensions, they based on some clustering. The idea is to find, how to say, find the low in the distribution, uniformity of distribution, and then exploit it. And this is how indexing works. There are different interesting methods for indexing multidimensional space, but I think the favorite is Hnsv method.


##### _[00:16:05] - Alexander_

And I have read about this method in the scientific paper way before this AI Hype ten years ago. And that was interesting how far these methods from all others. So it's very self.


##### _[00:16:26] - Ry_

It seems like just vector search is just on the exact edge of search. And the LLM AI, like you said, it's kind of blending both sides. Well, that's cool. So I wanted to obviously chat about OrioleDB, I imagine. Are you spending trying to spend 100% of your time on OrioleDB, or? It's probably hard to I mean, it sounds like there's lots of great things happening in Postgres to distract you from your own work.


##### _[00:16:57] - Alexander_

The thing vector search definitely distract me. And with this AI Hype, it's hard to not be yeah, yeah, I know.


##### _[00:17:06] - Ry_

For say, I would just love to kind of have the top three or four things you're trying to accomplish with Oriole maybe and maybe give us a progress report.


##### _[00:17:20] - Alexander_

Yes. But before this, I'd like to mention about how I use AI in my work.


##### _[00:17:26] - Ry_

Oh, yeah, sure.


##### _[00:17:27] - Alexander_

So I have written the blog post, no more vacuum, no more bloat. You may be aware it was on top of news and interesting that I have mostly generated this with Chat GPT. So I just wrote the short item list and asked Chat GPT to write me a blog post. Then I have corrected a little bit, then I wrote some graph, then add some graph, asked Chat GPT to add another paragraph with them, and then it was done. And I was curious that I expected that I would be revealed and blamed for this. But actually the comments I get was, oh, this blog post is so much well written.


##### _[00:18:23] - Ry_

I know, it's funny. I agree with you. I'll take just like, notes. Like, for example, here I've got like a list of 20 questions that I'm trying to ask you during this interview, possibly ask you. I guarantee you if I sent this list of 20 questions to ChatGPT and say, hey, make these questions better, it would crush it, give me all kinds of much better questions. But anyway, yeah, I agree. People who aren't using it are really missing out on a great assistant. All right, so back to Oriole. What are the top three or four.


##### _[00:19:02] - Alexander_

Things I'd like to first say about the thing which bring me to the Oriole? When I have studied Postgres, it was just like a magic how MVCC works. So you can run multiple sessions in parallel and each session will have its own snapshot of the data and that was just amazing. And I was very interested what is under the hood, but how this works from user size was perfect, but I always wondered how it implemented internally. Because when you in progress, when you're doing an update, then you just have to mark old tuple and insert the new tuple in the heap. And if hot update is not applied, then you also have to insert all the index tuples even if index set values are not updated. And I wondered if we could do this better. And I think I have this background thoughts for years. So I have studied how MVCC implemented in MySQL as and then how it's implemented in Oracle. And it was very interesting for me to get how it's implemented in Oracle because I heard that Oracle have block level undo. Yes, and then I have thought how could it be on a block level?


##### _[00:20:54] - Alexander_

Because if two transaction modifies the same tree page and this page got splitted and then one of transaction could be rolled back, then it's not linear list of log records which you could just apply one after another. Because if you need to roll back some change which was before the page split, you need to do some adjustments with it. And then I understood that I need to go deeper and get how it works and then I learn more things, how rider had log working and so on. And I think in 2017 I have started to work on design of my own storage which could work around the most of shortcomings, which I see in Postgres engine. For sure there is no plain wins, in some situation this engine works worse. But I would just like to design some new trade off which could be better in the typical situation. And I can highlight some things in OrioleDB. So the first thing which it is fighting is bloat and in order to eliminate bloat, it has undo log. So if you update a row, then you just have to add a new version of row into the undo chain and you only need to update indexes if their values are updated.


##### _[00:23:03] - Alexander_

And also indexes are versioned trees as well. In OrioleDB I have heard that it is so in Oracle and I found that this is very attractive idea. Thanks to that index only scan becomes very simple because your secondary index already contains all the information and you doesn't need to look into any secondary structures. Because I have heard that in Postgres index only scans, index only scans is amazing until you run in some problem because if you have some intensive workloads and so on, you might have significant part of visibility map zero it and your query could get into trouble. Yes, that also could happen. And this is why I found that if secondary index version that's attractive idea and OrioleDB have a mixed underlock containing both row level and block level records and block level records allows to handle some changes like eliminating of dead tuples of the page. So for instance, your page contains some tuples which are deleted but still visible for some transaction. And using block level undo lock you can issue a new version of this page and get rid of all dead rows and reclaim their space. But the transactions which need old version can traverse page level underlock and find the tops that they need and another to eliminate bloat is automatic page merging.


##### _[00:25:12] - Alexander_

Anyway, if even you have undo lock it could happen that your workload is so that you have a lot of sparse pages so you have a lot of data inserted but then the data was deleted and AudioDB supports automatic merge of sparse page to eliminate bloat. Okay, and you had some questions.


##### _[00:25:34] - Ry_

Yeah, I was just remembering that it was a blog post or a presentation where you like here are the ten worst things about Postgres. I don't know the exact phrasing you chose but yeah, basically here are ten problems with Postgres.


##### _[00:25:52] - Alexander_

That was a blog post of Rick Branson, I hope I spelled the name correctly and yes, I found that was a quite popular blog post. The first popular blog post is definitely Uber blog post about why they moved from Postgres to MySQL. But this blog post from Rick was very interesting for me because the issues he highlighted was very good fit to my vision and to things which I'm going to improve with OrioleDB.


##### _[00:26:36] - Ry_

You'll probably never be done with OrioleDB because products are never finished, but how's your progress been through your target initial list of things you wanted to accomplish with Oriole are you making good progress through that or give us a progress report.


##### _[00:26:53] - Alexander_

Yes, I'm making a good progress but currently the main target is not to add new features or handle more things, the current target is stability to get more users. So it doesn't work to have amazing products if nobody uses. And I would say that Database World is quite conservative because obviously people don't want to lose their data. And this is why, before using some new database technology, you need to ensure that it's really stable and mature. And this is the main challenge for new database management system or new storage engine and especially when it's OLTP and OrioleDB currently mainly targets OLTP because OLTP is typically the source of your data, right? So where your business operation happened, for instance, OLAP could be not so important. So you pull your data from OLTP system and put to OLAP for analysis and if it will disappear in a OLAP system you can just repeat the procedure but that doesn't work for OLTP which is initial source of the data. So this is the main difficulty I think, but we already did very good work with the team, very good work on eliminating the bugs but we definitely need more better testers.


##### _[00:28:46] - Ry_

Yeah, I mean, it's a big challenge. It's similar for us as well, but you have to create enough differentiation to get people to want to try it. But you can't go so far away from like you're saying the further the distance is from what they consider stable, the riskier it is. But if you're too close to the same thing, there's not enough value to do the switch.


##### _[00:29:12] - Alexander_

Right.


##### _[00:29:12] - Ry_

So it's a tricky catch 22 that you have to do something a little bit dangerous to get the attention. If it's too close, then people will be like, if it's 10% faster, who cares? Right?


##### _[00:29:28] - Alexander_

Yes, exactly. This is why I am highlighting the cases where OrioleDB is in times faster or even dozens of times.


##### _[00:29:42] - Ry_

Have you now released kind of the stable candidate? You said you'd need more testers. Is that's kind of your stage now?


##### _[00:29:51] - Alexander_

Yes. We are currently discussing with our team and advisors when we can make market release candidate on the release. At some point, this is just how to say at some point, this is decisions of the will. So there is no strict procedure you can go through and say, okay, your product now should be better, or your product now should be generally available. You just need to decide for yourself and make this decision weighing all the risks.


##### _[00:30:30] - Ry_

Yeah, it was funny. I'll tell you a quick story about that. With my previous company, Astronomer, we were 0.1, 0.2, 0.3. I think we got to like 0.17. And it was like there was nothing big happening in any release that would cause us to say, oh, this should be the 1.0. And then we are also thinking like, this is one of me thinking this, because I was like, let's just make the next one 1.0, goddamn it, but let's save the 1.0 for a big marketing push. I don't know that they ever did it. We waited so long that we never had a 1.0 of that platform. By the time we got to it was like, oh, let's rewrite it. I think it's a tricky thing to ship, but I'm a big fan of shipping early and often. And just mark your thing as an RC candidate. It doesn't matter. It will attract more attention with that RC dot. That zero dot.


##### _[00:31:35] - Alexander_

Yes. Actually, the number in the version is marketing you can find in the shop. The price for the good could be $20. But you go away, you come back, and now it's $30 crossed $25.01 of advices. I heard about version numbering was never number. If you have new products, never number your version 1.0.0, nobody will trust it's stable. So you should number something like 1.3 point eleven.


##### _[00:32:21] - Ry_

Yeah, well, I'm kind of a big fan of CalVer, where the version of your software should be like, how many releases? It's 23 dot whatever.


##### _[00:32:35] - Alexander_

2023.


##### _[00:32:35] - Ry_

And here's our 6th release in 2023. And that kind of gets rid of all of the traditional semver stuff. But again, that's kind of hard to do as well. Well, I had a bunch of extra little questions I want to ask you just to get to know you a little better. But if you had a magic wand that you could add any feature to Postgres and tomorrow morning we wake up and it's there, what would it be? What's the most important thing? Or would you be most excited to see?


##### _[00:33:06] - Alexander_

My question...it could sound probably selfish, but I have a patch set to improve Postgres table access method API. This patch set definitely needs some work and if I magic went I would like this work to be just done and everything is perfect and in the Postgres core perfected. And that would make OrioleDB become a pure extension. But not only that, I think it could clear the path for more table access method implementations.


##### _[00:33:48] - Ry_

Got it. That's good, that's a great one.


##### _[00:33:50] - Alexander_

And one thing if you have a few minutes, the Postgres Extensibility is probably the idea which comes from Postgres early design and remains Postgres differentiation feature till now. Because all our ideas from Postgres design today it sounds weird and it's not.


##### _[00:34:19] - Ry_

There, but Extensibility is it's it's honestly, I always just thought MySQL and Postgres were just two different. Yeah, I didn't realize how much more Extensible Postgres at least tries to be and has been and how many extensions exist for it. Once you start looking at that list, it's pretty amazing, all the work that people have done to extend it. Is there anything, would you say about Postgres that almost nobody agrees with you about? Do you have an opinion that's controversial or just it's hard for people to agree with you about?


##### _[00:35:03] - Alexander_

Probably I don't know this opinion. So there are opinions where we have disagreement in community, but I can't remember the opinion which leaves me alone with that. So probably not. Yeah, there are opinions where I appear in a minority, but not more.


##### _[00:35:28] - Ry_

Yeah, a lot of times that's just because you don't understand everything yet, right? People come in with a hot take and then the mailing list will educate them on other factors.


##### _[00:35:40] - Alexander_

Yes, there are disagreements because we are writing patches to Postgres and we understand these patches as improvements. But actually there is never a pure win. If you achieve something, you always lose something. That might be not obvious, but I don't know. So if you are adding too many SQL comments and your parser get complicated and parcel state machine cannot fit to processor cache and get slower and your source code also becomes bigger and harder to understand and so on. And finally we are just a group of people which needs to make some decision of will, of where to go. No way is a clear win. We are trying our best to don't discourage existing users, but even the best offers of them, even with best efforts of them. There are some disprovements for sure. At the end of the day, we need to negotiate and make a decision.


##### _[00:36:54] - Ry_

Where can people find you online? And in particular, what's the best way for them to get involved with testing OrioleDB?


##### _[00:37:04] - Alexander_

Yes, any person can reach me via email and testing Oriole, you just go to GitHub, download and compile sources or even easier, go to Docker Hub and get the docker image and just go experiment with your data and your workload and raise an issue or discussion and share your experience and.


##### _[00:37:32] - Ry_

Refresh us one last time. Where are the use cases where Oriole is going to outperform vanilla Postgres most dramatically I guess yes.


##### _[00:37:43] - Alexander_

So the situations are when you have a lot of updates, very update intensive workload, then OrioleDB could outperform things to undo log. Another case is huge multi core machines and OrioleDB eliminates a lot of bottlenecks and can perform in times faster and also OrioleDB implements role level write ahead log and if you have a huge write ahead log stream and you need geographical replication, OrioleDB can also help a lot. Awesome.


##### _[00:38:31] - Ry_

Okay, great. Thank you. Yeah. If there's anything else you want to share, feel free, but otherwise it was great chatting with you.


##### _[00:38:40] - Alexander_

No more from me. Thank you very much for inviting. It's always very lovely and friendly talk with.
