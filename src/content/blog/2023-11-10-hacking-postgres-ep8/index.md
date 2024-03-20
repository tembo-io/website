---
slug: hacking-postgres-ep8
title: "Hacking Postgres, Ep. 8: Philippe Noël"
authors: [ryw]
tags: [postgres, hacking-postgres]
image: './ep8.png'
---

Search is simple in theory. In practice? Anything but. In today’s Episode 8 of Hacking Postgres, Ry sits down with Philippe Noël of ParadeDB to talk about how search is evolving, the influence of AI, and the lessons you'd tell your younger self.

Watch below, or listen on Apple/Spotify (or your podcast platform of choice). Special thanks to Regina and Paul for joining us today!

<div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', marginBottom: '5%'}}>
  <iframe
    style={{ position: 'absolute', top:'10px', width: '100%', height: '100%' }}
    width="100%"
    height="400"
    src="https://www.youtube.com/embed/o73EMG1c3cA?si=ypM2zuSnQD-elBSB"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen>
  </iframe>
</div>

Want to know more about something they mentioned? Here’s a starting point:



* ParadeDB - [https://www.paradedb.com/](https://www.paradedb.com/)
* pg_bm25 - [https://docs.paradedb.com/blog/introducing_bm25](https://docs.paradedb.com/blog/introducing_bm25)
* pgvector - [https://github.com/pgvector/pgvector](https://github.com/pgvector/pgvector)
* pgrx - https://github.com/pgcentralfoundation/pgrx
* Elastic - [https://www.elastic.co/](https://www.elastic.co/)
* pg_search - [https://github.com/Casecommons/pg_search](https://github.com/Casecommons/pg_search)
* zombodb - [https://github.com/zombodb/zombodb](https://github.com/zombodb/zombodb)
* Algolia - [https://www.algolia.com/](https://www.algolia.com/)
* InterDB - https://www.interdb.jp/

Did you enjoy the episode? Have ideas for someone else we should invite? Let us know your thoughts on X at @tembo_io or share them with the team in our [Slack Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw).


## Transcript


##### [00:00:12] - Ry

Welcome to Hacking Postgres, an interview podcast with the people working on open source projects around Postgres, which in my opinion is the world's best open source database. I'm Rye Walker, founder of Tembo, a managed Postgres company, and today I have Phil Noel from ParadeDB, working on ParadeDB as my guest. Phil, welcome to the show.


##### [00:00:37] - Phil

Thanks. Yeah, thanks. Nice to meet you. Thanks for having me.


##### [00:00:42] - Ry

Great to actually meet you. I'd like to start...maybe you could give us a quick background, like maybe where'd you grow up in the world? And what were you doing before?


##### [00:00:53] - Phil

Yeah, absolutely. Happy to. So I'm originally from Quebec City, the French part of Canada. I actually grew up in this small town called [inaudible 01:02] , which is 2 hours East. Spent most of my life there, and then eventually I left to go to university. I stayed in Boston, studied computer science and neuroscience, did a few things. I started a browser company before ParadeDB, which I ran for about three years, and then after that got acquaintance with the joys of Postgres, you could say through that experience. Sounds somewhat similar to yours, maybe, although not to the same scale. And my previous co founder and I only started ParadeDB.


##### [00:01:35] - Ry

Nice. Tell the browser company, what was that called and how far did you get in that project?


##### [00:01:43] - Phil

Oh, that is both a short and a long story. It was called Wisp. We were building like a cloud based web browser, so the initial idea was to offload heavy processing to the cloud by streaming, which is like an age old idea, but we were young and dumb, so we thought we had invented something. We did that for a while, raised a couple of rounds of funding, grew a team to like 25 people, but we never quite found PMF and eventually pivoted to cybersecurity. Did that for a while, but it was a much better market, but not our battle to win. So we closed down the company. Yeah.


##### [00:02:21] - Ry

Okay. I'm sure we both have a lot of battle stories we could commiserate over. Do you remember when you first started using Postgres? I can't remember. That's why I ask this question, because it kind of just happened at some point in my career. But do you remember specifically when you started with Postgres?


##### [00:02:45] - Phil

I don't know. Actually. That's a good question. I don't know. As a user? I don't know. As a developer since earlier this year or last year.


##### [00:02:58] - Ry

Well, cool. Obviously as a user, you've used it for years, I'm sure. Tell me about your Postgres work. What have you built in the past and what are you building now? Or is this all just the first thing?


##### [00:03:12] - Phil

I guess I would say it's the first major thing. So we can keep it to that, what we're doing. So we're building ParadeDB. ParadeDB is like a Postgres database, essentially, or Postgres extension, where we're integrating native full text search within Postgres, which is something that some people are quick to jump to say this already exists, and some people are quick to jump to say the one that exists is very bad. And so they're excited about what we're doing. So it depends which camp you fall on. But the first thing we released is this extension is called pg_bm25, where we're essentially integrating proper full text search within Postgres and then combine this with some of the existing innovations that's come, like pgvector to build hybrid search. And our goal is to build this Postgres type database that is sort of the go to choice for companies where search is critical to the product they're building.


##### [00:04:08] - Ry

Nice. Why do you think you're working on this? What led you here?


##### [00:04:14] - Phil

Yeah, that's a good question, actually. This is a problem we face ourselves and that's kind of why we wanted to solve it. So after my first company, my co founder and I, we were trying to decide what we're going to do next. So we started doing some contracting work sort of left and right. I was living in Paris at the time and working with a lot of French and German company. And when we were working with this German automaker, they just really needed high quality full text search within Postgres. So the promo we were building for them, and instead we had to glue Elasticsearch or some vector database on top. And it was just a nightmare. And we were very frustrated how bad it was and decided, you know what, maybe we should just fix it ourselves. And so that kind of led us to today.


##### [00:05:00] - Ry

Got it. Yeah, it's interesting. I don't know. There was a famous tweet that I can't remember the exact wording on, but it basically said something to the effect that, hey, tech founders, you do yourself well to pivot to building something that would support whatever you would be building today. Basically go one level deeper than your current idea is similar to what we did at Astronomer, because we were basically building a competitor to segment clickstream data processing. And then we started using Airflow. Then we said, hey, let's just provide airflow as a service. And kind of made that switch to go down a level and that was the winning pivot for that company. So it sounds like you've kind of jumped down to more of an infrastructural issue, which I think is good. Well, what challenges? Obviously there's a lot of ground to cover, but what are your biggest challenges, would you say you face so far? Building this thing.


##### [00:06:12] - Phil

You mean like business wise or technical wise or process wise?


##### [00:06:16] - Ry

Actually, yeah. I'd love to hear all categories of challenge. Yeah, spill the beans. What's hard about this? I imagine fundraise. I mean, it's a tough time to fundraise, so that's probably not awesome. But yeah, maybe start technically.


##### [00:06:33] - Phil

Yeah, I can start technically. I think software is the easiest part of building a company, so I would say these are our simplest set of challenges. Not to say it's know, I was actually talking to Eric that I listened to the Hacking Postgres episode with Eric and I talked to him afterwards. At first we didn't know pgrx was a thing, and we were like, oh my God, how on earth is this even going to be a thing? And then we found out pgrx was a thing and we're like, wow, it went from near impossible to quite doable, really. So, like on the technical front, I mean, there's just so much you need to do when you're building search, right? We have covered a small ground of features of what people expect, and there are so many more that we need to build, and so we're trying to prioritize that.


##### [00:07:25] - Ry

Obviously Elastic is probably the big competitor. Can you estimate what percentage of their functionality you aim to replace? Is it essentially 100% and what's your progress towards that?


##### [00:07:41] - Phil

Yeah, that's a good question. I mean, our progress was small. It's small enough that you can use it, but Elastic is enormous, right? I don't think we aim to replace or not to replace, sorry. To match 100% of their features, at least for transactional data, which is what we need today. I think we actually had a decent bit of the way done and definitely enough to keep us busy for a couple of months. But I think that's sort of the first step of what we're looking to match beyond that, like what everything elastic does for observability, that's sort of another story, and that's another milestone that we will see depending on what our customers want.


##### [00:08:29] - Ry

Obviously I'm building a fresh new tech startup as well, and I understand you got to match the functionality of, I call it the table stakes features. But then you also have to come up with some differentiators or else no one will care. So what are the biggest differentiators you're thinking about with ParadeDB?


##### [00:08:49] - Phil

Yeah, so that's a good question. I think for ParadeDB right now, the differentiator has been, ironically, I would say the combination of two non differentiated things, if that makes sense, which is like, if you want to do search over transactional data, ParadeDB is sort of the best solution today because it's the only thing that actually truly combines the two. It wasn't done before. And so sort of our initial interest, I would say, has come from that. So typically when people wanted to do this, they would have some managed Postgres provider, of which there are many, and then they would use Elastic and then they would need to combine the two and then run the two and so on. It can be a ton of work. And so ParadeDB sort of makes that a single system and especially for small companies, which is where you've been really, it's been a lot easier to manage, I would say. And so that really draws them to us. That's sort of like our initial point initially, but we have some other things that will be coming up which hopefully will expand on this sort of initial interest.


##### [00:09:52] - Ry

Yeah, it seemed to me like as I think about building my next search bar in a product, I have to decide do I want to go what I can so call like the old school way versus vector search? Maybe I can get away with some sort of AI integration for search. Are people asking that question or do they have the perception that maybe like vector search somehow gets, replaces or displaces in some way traditional full text search type features?


##### [00:10:28] - Phil

Yeah, that's a very good question. A lot of people have, I've talked to a lot of people who weigh in on both sides of the coin. I would say my personal take is both will remain quite important just because at the end of the day people will still have data and we'll still need to be able to find instances of those data. Right. And there's one way to find it via similarity, but there's also sometimes you just want to start from a clean place. And so I think both are quite valuable. Most of the people we talk to, hybrid search is very important to them, like the combination of the two, both big and small companies. And that's one of the reasons why we built Parade the way we did today, where pgvector exists and so many others. And I would almost say vector search is kind of table stake now. We don't really have to innovate on that so much ourselves, I would say. But the traditional search is kind of the piece that's been missing, which is why we released this first extension, pg_bm25, and then we offered the combination of both as well [inaudible 11:29]  with another extension called pg_search, which we're going to be publicizing more heavily soon.


##### [00:11:35] - Ry

Yeah, I think it seems like, well, it seems to me like everything has to have an AI story or else perhaps it's been outdated. Right. So I think even search, even full tech search, you can say I like that the hybrid answer is a good answer. Obviously then you have to figure out how to hybridize it all. And that's not necessarily trivial. But yeah, I'm curious to see what you come up with on this.


##### [00:12:07] - Phil

Yeah, it takes some effort. It takes some effort. I would say we definitely have an AI story, but our personal take on the whole AI world and fade is like AI is sort of a step function improvement on existing things being done, but you need a foundation of value proposition for customers on the fundamental non AI part of the product, if that makes sense. And that's kind of how we think about it. There are so many people that are trying to bring AI when there was nothing useful to begin with. Well, I really think of AI as taking something that was useful to begin with and making it that much better. And so it kind of plays quite well actually with the way we've been going about delivering this product and saying like, hey, we'll just give you really good full text search and obviously so much more can be done. But if that is not useful in the first place in Postgres, then who cares that I can add AI to.


##### [00:13:01] - Ry

Yeah, yeah, I agree. Yeah, I think about it. Know you can't build AI without training data, right? And you can't, you can't have training data without a product. You know, to collect some base level data. If you have a base level of product without AI, basically you have to start without AI, don't have data at all. And I think that's a challenge. A lot of founders, maybe they're thinking they're going to go straight to AI. They're like, there's nothing. You got to start basic. Yeah, I agree. What are some big milestones? How many big milestones do you have envisioned for ParadeDB at this moment?


##### [00:13:44] - Phil

That's also a good question.


##### [00:13:46] - Ry

I mean you probably have a next one, right? You usually know your next big milestone.


##### [00:13:50] - Phil

Hopefully you'd have that. Yeah, of course.


##### [00:13:53] - Ry

And you also tell me what it is. But I'm curious.


##### [00:13:58] - Phil

Happy to share. I mean, to be honest our big milestones was to get a thousand stars in new Hub and then some stranger posted our repo on Hacker News and somehow that happened in a couple of days, which was really exciting and rather unexpected. Now our big milestone is we're about to release our own small version of managed Postgres ish specifically for ParadeDB to test how else we can deliver value to people. Like many that have been using the product so far have been using our self hosted version, which I'm sure you're extremely familiar with how people don't want to do this, doing Tembo. So that's the next big milestone that's coming, trying to learn to manage this. And then after that we have a couple of, I think after that we'll see the exact number. We're just trying to get more people on it and see what they think. Really.


##### [00:14:53] - Ry

Yeah, just grow users. This is another thing I've been thinking about around just even like we have stacks at Tembo with different use cases for Postgres, and then some things ought to be workloads separated from other things. Like for example, do you keep your analytical workload separate from transactional? That's clear. But search is interesting, whether that's like an add on. Is that just work that the transactional database should be doing, or is it somehow, do you think the workload for search should be isolated from traditional transactional workloads? From an application standpoint, that's a good question.


##### [00:15:36] - Phil

I think it depends what product you're building, to be honest, because you don't want to slow down transactions. That's something that's very important to us. For example, I think it's possible to integrate it, actually. I think it's up to you, the way we're thinking about it. So the way we've built ParadeDB is we offer weak consistency over search. So what this means is the way we build searches, we have inverted indices that store the tokenized data that you want to search over, but those are weakly consistent. So just like if you use Elastic, for example, and something like ZomboDB, and then you synchronize it, there will be some lag between transactions being updated in your database and eventually being reflected in your search engine, the same thing happens, but it happens automatically for ParadeDB, instead of being it can be minutes sometimes here will be like a few seconds at the very most, but it ensures that your transactions are never slowed down, which is quite critical for people. So I think if you build in that way, it's actually quite possible to centralize it and have it be integrated with the actual database. If you don't use a product where search is built that way, then I don't think you want to slow down your transaction so you have to isolate them.


##### [00:16:48] - Ry

Yeah, I think a lot of people just obviously just do it inside their transactional database because it seems like overkill. Spin up a new Postgres, just especially like traditional shitty full tech search that's available. But if we want to get good search, if I wanted to build really good search into an application, I would go buy Algolia or something like that. And that clearly is a microservice at that point, right? I'm sending data to them to index and they're sending me back results really quickly that are happening. It's not taxing my main database as a part of that. So I kind of like thinking of search as, let's call it great search as a microservice candidate for sure, because the better you make it, the more compute it requires. The more compute it requires, the more it's competing. Right? So I don't know, I like the idea of just taking that worldview. That great search needs to be separated from the transactional or analytical.


##### [00:18:03] - Phil

Yeah, I think you're right in a lot of ways. You do need to be able to orchestrate it properly at scale. This is definitely something that we will ponder more and more as we have more people using it and using it at greater scale. I do think even if it needs to be solely separate from what we have done today, one of the great things and where DBMS and Postgres managed companies like ParadeDB or Tembo show up is in the ability to just make it transparent to the customer. The actual complexity of the orchestration behind the.


##### [00:18:37] - Ry

So, you know, you've been writing code for a number of years now. What would you say your most important lesson has been? Kind of switching from the technical to the interpersonal or just like professional. Do you have any top lesson? If you're going to meet with a young developer, you'd say.


##### [00:19:00] - Phil

Specifically on writing code? Yeah, specifically on writing code. I would say only write the code that you need to write. I think that's like a big one. Our previous company, maybe I'll bother with this one. I like to think of products and startups now as like science experiments, as works of art. And I think our previous company, we thought of it as a work of art. So we came out of college, we were so incredibly into it and we wanted to be perfect. We cared so tremendously about what we did, that we always went above and beyond and it always made the product better and it involved writing more code, but it did not always make the product better in a way that meaningfully improved the experience of the user or brought us closer to product market fit. Right. And so I think if you think of a work of art like it's never finished, it needs to be perfect, versus a science experiment is more like, what's the bare minimum I can do to validate or invalidate this hypothesis I have or deliver value to a customer. And so what I would say, what I wish I could say to my younger self was, if no one has asked for this, I don't think you need to do it.


##### [00:20:12] - Ry

Yeah, it's a good point. So you're saying be more of a scientist than an artist, perhaps to some degree. When you're starting on something and it's not validated.


##### [00:20:26] - Phil

I think a lot of great products are almost like work of arts. Like, people were so obsessed over it and you can feel that. And so I don't think you want to leave all types of esthetic approach or care to it, but I think definitely early on, before you even sink so much time into it, you just want to get feedback quickly. Right. And that involves just only writing the code you need to write. Yeah.


##### [00:20:49] - Ry

I'll tell you a quick story. Like when we started astronomer, I have a good friend, Greg Neiheisel. He was CTO and basically my partner of crime. And we just very much mind melded on a lot of things. But our attitude following your principle was really what we were building was this beautiful lattice of glue, and everything was open source inside. So we used, for example, we used Google's material design, which had just come out, and we built a UI, like, adhering to it perfectly, and ended up being a beautiful UI because guess what? Those guys built a great framework and we had no designer on the team. Google was our designer. We would joke about it all the time, and we actually chose a color scheme for the company that was kind of Googley, had the same four main colors. So it was really easy to build something great. But that we really built the first version of our product was entirely open source components just glued together in a unique way. And that was our art. It was like this inner skeleton of orchestration, or just like I said, I can think of it like a lattice of glue that's holding all these things together. And, yeah, it was a very successful product. And it looks basically how you arrange open source components is art. It's a creative endeavor, I think, and it's enough for a brand new product. It's enough art. You don't have to go and reinvent, like, for example, the airflow UI during this really hard early project. And you don't have to go reinvent the Postgres UI. Maybe you want to, but you're like, let's handle the first things first. So did you think of a lesson that was non technical that you learned that you would tell your younger self or not really?


##### [00:22:49] - Phil

Oh, I have so many. I spent a lot of time thinking after our previous companies didn't work out specifically. I don't know. This is a broad question. I can go in every direction. Let me think, which one is the best one to share? Yeah, I would say, okay. One interesting lesson is I'll focus on the youth as well. And what you mentioned. When we were building our first company, our first product, we felt very righteous. We were doing something very difficult and objectively, technically difficult. And a lot of people have tried before, and we were like, they must have done it wrong. Who are they? People with more experience and context than us to know how to do this really well. And so we always started every premise of what we were doing from the premise that we were correct. Right. And then we were strived to further validate the fact that we were correct. And I think this leads to a lot of cognitive dissonance when you turn out to be wrong. Right. Because you had this idea of what you were thinking, and it's now being challenged versus now the way we think about it.


##### [00:24:07] - Phil

And I mean this from a personal standpoint, from the way we talk and hire people, from the way we talk to customers, from the way we try to build product now, we just think we're wrong. I always assume I'm wrong in what I think, and then I strive to prove myself correct. Right. And if we do manage to prove ourselves to be correct, then it's like a very positive moment. You're like, that's amazing. I found this great surprise that I wasn't fully convinced of before. And if you turn out to be wrong, you're like, well, kind of thought I could be wrong all along, not a big deal, and then sort of drop this and move to something else. And I think it's a mental framework that has served us a lot better in everything that we do now.


##### [00:24:45] - Ry

Yeah, I love that.


##### [00:24:47] - Phil

Yeah.


##### [00:24:48] - Ry

I think it's a tricky catch 22. Like, you have to, as a founder, live in a reality distortion field just to change the world. You have to have a crazy idea that most people disagree with. Those are the best ideas. Unfortunately, they're also the worst ideas.


##### [00:25:05] - Phil

Exactly.


##### [00:25:06] - Ry

Just accept that, hey, you might be. At the same time, you have to also fight for your idea. Even if you hear negative, it's like, oh, man, I built all this infrastructure for it to be righteous, and now it's hard to give up on it. I think it's wrong to give up on it a lot of times, because, again, I think that some of the best ideas almost everyone would disagree with as it starts. I agree. It's a much better mindset to understand that it's a lottery ticket sort of odds not, hey, well, if you were a good student, you know you can get an A in a class, right? You know you can get an A. It's just a matter of doing the right amount of work, and you'll get an A. But it doesn't work that way with startups. Exactly.


##### [00:25:59] - Phil

Yeah.


##### [00:26:00] - Ry

Cool. So, well, I'm curious, like, are you paying attention to the Postgres ecosystem and other developments maybe that you're excited about that you've seen since you started working on.


##### [00:26:13] - Phil

Have. I mean, there's, there's just so much that's happening in Postgres, obviously pretty excited about Tembo. I've been following you guys' journey. Just like, recently, there are people that I forget the name of the developer. That's very embarrassing. But someone released PG branching, which maybe you've seen, which is like, so I was talking to Nikita, the CEO of Neon, right? And he was, like, raving about their branching system, which I'm sure is world class and amazing. But it turns out other people might be able to do this someday, which is good for the community, perhaps. So I think that's quite an exciting extension that hasn't been made by us, for example, that we're very excited about. And there's many others that I could list.


##### [00:26:56] - Ry

Yeah, it's interesting. My first reaction I saw, like, AWS announce, oh, we have active, active replication available on RDS. It's a new extension, you know. And I responded on Twitter, is it going to be open source? And crickets. So it makes me feel like time to. We'll study that extension, and the community needs to just build the open source version of it if they won't do it. I'm not salty about how the big clouds operate. Extracting value from open source. Because I'm extracting value from open source, and you are, too. We all are. All the way down. Like I said, it's like value extraction all the way down to Linux, but they could be. Obviously their goal is to build a proprietary alternatives and I really wish there was a Postgres company out there that was big and was worrying about the whole open source ecosystem. That's what we're trying to do. Yeah, there's so much going on. I don't know if it's because I'm looking at it now or if things have changed in 2023 versus 2022. It's great that it's happening too during what I would consider like a law in the venture ecosystem as well. So I think the stuff that's happening now will be strong. They always say like the startups that start during the slow parts of venture usually end up being more successful than the ones at the hype cycle. So you and I are both lucky we're starting here. Even those. It might not feel that way sometimes.


##### [00:28:39] - Phil

I think it does feel that way though. We raised our seed round, things went quite well. It was a challenging raise, but challenging because people were very critical about what we're doing and I think that's good, right? Like the first company, we raised money on a terrible idea and we thought raising money was the good part. But actually if you have a terrible idea and people convince you of that early on, they're actually doing you a favor, right? Yeah, I think it's good. I'm very bullish on the companies that are going to be founded, that have been founded this year, that will be found next year and so on, because I think you're right. Overall, typically they turn out to be quite good. Yeah.


##### [00:29:22] - Ry

So do you have a couple of favorite people that you've met in Postgres Land? Give them a shout out if you do.


##### [00:29:29] - Phil

Yes, sure. I mean I met Eric, which I think will take the prize for my favorite. He. He's very humble about it. He keeps saying TCDI needed pgrx. I think they really did it beyond what was needed for the benefit of the community. So I think he's definitely gone above and beyond and he continues to go above and beyond. Another one maybe you know him or not. He's the writer of one of the PG internals book called Hironobu, who's this Japanese man who lives in Europe now I haven't engaged with him very much, but he's made this resource called I think InterDB.jp or something like that. I could send you the link if you're curious, which goes into Postgres internals at a great detail. And it's been like a good resource for us in it. So shout out to that guy.


##### [00:30:23] - Ry

Yeah, I definitely read the website, but I haven't spoken to the man.


##### [00:30:29] - Phil

Maybe we should try to email him a few times. Yeah, I tried to convince him to join us, but it was too difficult to sell.


##### [00:30:37] - Ry

Yeah, maybe he, I mean, I tried to convince Eric Ridge to join Tembo in the early on and he was too hard to sell.


##### [00:30:43] - Phil

I'm sure you did. Of course, I would have loved to convince, um, the naive part of me was like, I can't wait to convince Eric to join Parade. And then I talked to him, realized he basically is the co founder and CTO of TCDI. And I was like, okay, this isn't happening.


##### [00:31:01] - Ry

Yeah, I was probably the 25th person to go after him. And you were probably the 27th person to go after him. Whatever.


##### [00:31:10] - Phil

Exactly.


##### [00:31:11] - Ry

Yeah, I think it's great. I'm kind of excited that these people, I'll call them like the gods of Postgres, are kind of locked up up on Mount Olympus. We don't get to see them or talk to them very much. That's exciting to me, to know that someday we'll get there. Someday, if our companies are strong enough, maybe we can get to work with those people. But it's great to be in an ecosystem where there is a tier of people that are just amazing. I was talking to Samay, who's the CTO here at Tembo, and he did the quick analysis. To see that most people become a committer at Postgres takes like around seven or eight years of contributing to Postgres before you get the commit bit, which is like, wow, that is an amazing. You think of venture backed startups, it's like two startups worth of effort sticking around for your full vesting before you get to be up. So it has nothing to do with the company that you're working for, it's just you're going to dedicate yourself to an open source project for the core of your professional life. Because once you get there, you probably want to stick around for another eight years, I'm sure.


##### [00:32:27] - Ry

Yeah, it's pretty cool.


##### [00:32:28] - Phil

Yeah. But these people are great, and I think that's one of the things that's so great about Postgres community. Even though Eric and so on, they're amazing people and they're doing great things and they're very busy and so on. This are quite accessible, really. Eric is very accessible in the pgrx discord and so on. So I do feel like by building open source, we still get to work with them, even though not in the same organization. And some other people I forgot to shout out, which perhaps deserve a lot of shout out, is maybe like Umur and Ozgun from Citus, right? They were like truly visionaries of the Postgres world, building extensions when Postgres was a toy database, as people would like, critic being critical of.


##### [00:33:17] - Ry

Yeah, yeah, we're definitely standing on their shoulders. They've, they did a lot of hard work early on and yeah, it's great. If you had a magic wand, you could add any feature to Postgres tomorrow and it existed. Is there anything that you would use that wand on? Do you have any things you wish Postgres was that it isn't?


##### [00:33:40] - Phil

That's very interesting. I think the answer would be better distributed support. Actually, what Citus has done is amazing. But the whole reason Yugabyte exists today, for example, is because there's only so much you can do when you're an extension like Citus did, right? And like Yugabyte is basically trying to be the Postgres equivalent of CockroachDB. And I think if that was baked in natively to Postgres, it would be good for a lot of people that are building on Postgres included.


##### [00:34:13] - Ry

Yeah, that's a good one. Do you listen to podcasts very much?


##### [00:34:19] - Phil

Not very much, not very much. Only yours.


##### [00:34:22] - Ry

Okay, good, thank you. No, I listen to PostgresFM all the time. I'm huge fans of those guys. I do listen to a lot of podcasts. But yeah. Just going to ask you what your favorites are. But you already said. All right, well cool. It was great talking to you. Where can listeners find you online? Maybe just tell us about yourself and then ParadeDB url and so on.


##### [00:34:49] - Phil

Yeah, so you can find us on paradedb.com or on a GitHub is ParadeDB as well. It's open source. We welcome contributions and users and so on. Of course we're very responsive. As for me specifically, I think you're going to link my Twitter in the bio, but my Twitter is PhilippeMNoel. It's basically my handle across every social media. I feel like when you can find one, you sort of keep it. There's so many people now on the internet, so that's my handle everywhere. People can find me there and I love chatting.


##### [00:35:20] - Ry

Awesome. Well, thanks for joining. Love to have you on again in the future. We'll see again, it's super early in this podcast life, but track what's going on with ParadeDB and if there's more stuff to talk about, we'll get back together.


##### [00:35:36] - Phil

Of course. Yeah, I would love to be there. Thank you for having me.
