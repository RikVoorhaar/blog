---
layout: posts
title: "Dev log: interactive website dashboard"
date: "2023-05-01"
categories: website data-science tools
excerpt: "I made an interactive dashboard for this website, and here is the story of how I did it."
header:
  teaser: "/blog/teasers/dashboard.webp"
---

I made a dashboard for exploring the access logs of this website. You can check it out at [dashboard.rikvoorhaar.com](https://dashboard.rikvoorhaar.com). It's a fun little project I've been tinkering with to shed some light on the way people interact with my site.


## Back story
In the beginning, I was using Github pages to host this website. However, that meant I didn't have access to usage stats. Google did offer some analytics, but it was mostly about Google searches. Then, in September, I got myself a VPS to host my own cloud storage and have secure offsite backups, among other things.


This set the stage to finally get to a self-hosted solution back around the new year, and get access to the sweet juicy data. Doing this as well as other sysasdmin things on my VPS made me get comfortable with using Docker to deploy things, and has overall been a great learning experience. Honestly, this was very frustrating at times, and there were multiple times I just gave up. For example, to get familiar with AWS, I wanted to use `rdiff-backup` to make backups to an S3 bucket, but after probably spending around 10 hours on this, I just gave up. I think my entire approach was just wrong; but how can you know this in advance? Nevertheless, this website has been running smooth as butter on my VPS, and I love the development workflow.

## Initial idea

I started on this project in early March, and it took about two months of working on it on-and-off in my free time to complete. At my job I gained some experience in using Typescript to make front-ends for Python applications and also got acquainted with `plotly` as an alternative plotting framework. My initial idea was therefore to do the following:
- Write some scripts to ingest the logs into a database
- Clean the data
- Explore the data and find out what I want to plot
- Code robust, fast functions that can output these plots
- Design a web front-end to showcase these plots

It started off pretty smoothly. While I took some online courses on SQL databases, I never actually used them in a project, but it was still quite simple to use `sqlalchemy` to ingest the logs into a `sqllite` database. Since there are never any concurrent users, it didn't make much sense to me to go for anything more advanced. I then wrote code using `pandas` to clean the data and get interesting data out such as the web page the user connects to or the geographic location of each user. I then did data exploration and made some nice time series plots among other things, and I started on making a dashboard front-end using `dash`. This is not my first data science project, so this was the easy part.

I did some benchmarking and found that even on just two months' worth of data most of the plot functions took a couple hundred milliseconds to compute. Since I planned from the start to make the dashboard publicly accessible, I felt optimization was necessary. That's why I decided to switch from `pandas` to `polars`; a dataframe library written in `rust` more geared towards performance. I found this switch to be very interesting because `polars` forces you into a different way of thinking about the data transformations. While this is less intuitive, it does guide you towards solutions that are inherently more performant than what I would come up with when attempting the same thing in `pandas`. Another tool in my toolkit. 

## Making it interactive

One thing I really wanted to understand from the data was the differences in geographic regions, but this seems to be very difficult to capture in one or two plots. Instead, I realized that to convey this information properly we need to have some kind of interactivity. I came up with the idea of allowing a user of the dashboard to select different subsets of the dataset which are then displayed in the same plot. For example, suppose I want to know at what time users in Denmark typically connect to my website versus people in Switzerland. I could then make one subset of the dataset containing only the people connecting from Denmark, and another subset of people connecting from Switzerland. After proper normalization, I can then just make a time series of the time of day when users from both subsets of the data connect, and I've got my answer. (Shown below; Denmark in blue, Switzerland in orange)

![A time of day plot comparing user activity for two countries](/blog/dashboard/switzerland-denmark.png)


I thus needed to make a component that can be used to interactively select different subsets or 'filters' for the dataset. This turned out to be more ambitious and tricky to code than I initially expected. First of all, there is the pure fronted stuff; it took a while to figure out which components to include and how to configure all the CSS and necessary animations for it to work. Since my experience with Typescript and CSS is quite limited, this was probably one of the most challenging parts. I also needed to code quite a bit of interaction between the front-end and the back-end. For example, the front-end and back-end need to agree on which options are allowed in the country selector, and so this has to be communicated from the python back-end. Next, the front-end needs to send all this filter information to the back-end, which of course also requires us to specify a format for this data. 

Initially, I tried to do all of this communication purely through `dash`, but it quickly became apparent that this falls outside the intended use of this library. Fortunately, it wasn't hard to switch to using `flask` and `plotly` directly to get a lot more control over the communication between the front-end and back-end. 

And then there were bugs. Many bugs! Why is this `div` not centered? Why does this plot overflow on top of another plot? Why doesn't the size of the plot change when I resize my browser? Why doesn't changing the date update the plots? And of course, there is a lot of nitpicking over small details; making the size of the button just right; adding some insignificant feature that magically burned 2 hours. It turns out that coding a responsive website is not that easy, and I have a lot of respect for front-end developers. 

## Deployment

"It works on my machine" is of course not going to cut it for a website. I first of all needed to make a good `docker` container to run the website, and test it properly. This somehow always takes more time than I expect. Building the `docker` image and installing all the Python and javascript requirements takes upwards of 3 minutes, and if I make a mistake I need to start all over again. 

While I had nice scripts that can ingest the access logs into my database, I also needed to figure out how to deploy this. In the end, I settled for using a `logrotate` script that is run once a day and calls a Python script (inside the Docker container hosting the dashboard). This was the first time I ever used log rotation, and getting the config to work took a few tries. 

The dashboard is now running at [dashboard.rikvoorhaar.com](https://dashboard.rikvoorhaar.com), as kind of a standalone component to my website. It would be really nice to integrate it better into my website, but this seems to be relatively tricky. The rest of my website is completely static, and I'm not sure how to integrate it into my website (other than using an `iframe`, which frankly looks awful). Eventually, I plan to make an entirely new website from scratch, and I plan to integrate the dashboard better as well. 

## Learning experience

This project has been a fantastic learning experience. I don't think I ever did any other personal project where I learned so many new skills. Just to make a list, I gained experience in all of the following cool technologies:
- Javascript / Typescript
- Bootstrap CSS
- Chrome debugger
- `React`
- `dash`
- `logrotate`
- `npm`
- `plotly`
- `polars`
- `sqlalchemy`
- `webpack`

The unsung hero that empowered this learning experience was ChatGPT. Without it, the project would have easily taken 2-3 times longer. When you're learning something new, you often have no idea where to start even. And that is really where a tool like ChatGPT shines. 

## FAQ / closing thoughts

Is the dashboard finished? 
> No. It is not. There are many, many features that I would love to add. But I am probably not going to do it. I'm not going to call this project a time sink, but I am eager to start a new project.

Are you going to use the dashboard?
> Maybe a little. Honestly, I'm not quite sure what to do with this information other than stare at it from time to time. This website is not a product, and there is no business value to be gained out of analyzing the access logs. 

Can I use it for my own website?
> Sure! The entire [project's source code can be found on github](https://github.com/RikVoorhaar/log-analysis). If your logs are in the same format as mine, then deploying it should be relatively simple. Feel free to contact me if you want to do this, and I'd be happy to help.

