---
slug: monitoring-with-prometheus-fdw
title: 'Introducing prometheus_fdw: Seamless Monitoring in Postgres'
authors: [jay, eric]
tags: [postgres, extensions]
---

What you have: all your monitoring data and analytics stored over _there_ in Prometheus. 
<br />
What you’d _like_ to have: all of that data over _here_ in your Postgres database. 

Having it all in Postgres would be simpler, easier to keep an eye on, and easier to do something with. But up until now, you couldn’t. At Tembo, we ran into this exact same problem ourselves—we wanted to be able to bring our own monitoring data back into our systems to allow for advanced time-series data queries and management. 

So we built the thing that we needed—a one-of-a-kind integration of Prometheus monitoring data into Postgres. This integration is not just about simplifying data workflows; it's about offering a smarter, more efficient way to manage data.

Want to see how it works? Darren shows us the ropes:

<iframe width="560" height="315" src="https://www.youtube.com/embed/LVuH4RtNQss?si=N95sY1J1fyM7oFbp" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
 
<br /> What sets this integration apart? It's the only current, fully supported solution of its kind. It enables querying for Prometheus metrics directly within Postgres, bridging the gap between Prometheus monitoring and Postgres's robust database capabilities. 

Let us show you how to get up and running:

We’ll start by going to the Tembo Cloud UI, clicking the extensions tab, and installing the prometheus_fdw extension to our instance. 

[UI image]

Once that’s installed, we can enable the extension, and we’re ready to go. If you’re new to working with foreign data wrappers, it’s important to know that once the extension is enabled, you’ll then need to actually create the foreign data wrapper within your database, like this: 

[image]

Then we’ll specify the server that we will actually pull the metrics from—you’ll want to insert your Prometheus URL here: 

[image]

And finally, we’ll create a table that specifies exactly what we’ll want to pull from Prometheus:

[image]


Now that all that legwork is done, we’re ready to start querying for our data. We just run the fdw, and it returns the values that we’ve specified—keep in mind that depending on the size of your Prometheus database, this may be a fairly large batch of data:

[image]

But now that this is running, we have our Prometheus data integrated seamlessly into our Postgres instance, and we can start putting it to work. For us, we’ve done things like pairing it with pg_cron and pg_partman to automate our reporting, enabling our GTM team to have easy access to insights about who is using our platform (and how!) 

To dig deeper, take a look at the [prometheus_fdw repo](https://github.com/tembo-io/prometheus_fdw), and give it a star while you’re there. Then give it a try for yourself at [Tembo Cloud](https://cloud.tembo.io/)! 
