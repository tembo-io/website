---
sideBarPosition: 5
title: Epilogue
sideBarTitle: Epilogue
---

Even though this chapter was principally about building an URL shortener, we covered a lot of ground! Here's what you should know by now:

* Some basic database modeling.
* How primary, natural, and surrogate keys work.
* Rudimentary Postgres role and user management.
* Common Postgres types and when to use them.
* How to use Postgres sequences.
* Beginner and intermediate plpgsql functions.
* How to use database functions to simplify application logic.
* One method to deal with race conditions caused by parallel operations.
* A bit about SvelteKit.

Hopefully it wasn't too much to absorb all at once. If there was something you didn't quite understand, take some time to explore the working project demo. You should be able to modify the SQL, look and feel, and functionality of the application and revert to a working copy if you ever break too much while experimenting.

The thing to keep in mind here is that even an application as seemingly benign as an URL shortener can be deceptively complicated. It's not just the parts contained, or even how they go together, but the multiple disciplines and background necessary to understand how everything works in conjunction. Why did we prefer one technique over another? What kind of steps were necessary to interact with the database? What did we need to do in order to transcend mere inter-operation between the different layers?

It's important to keep all of these questions in mind, as well as remaining inquisitive through all of the material we present here. There's always much more lurking just beneath the surface than the ostensible objective of the chapter itself.

Remember, the URL shortener is just the beginning!
