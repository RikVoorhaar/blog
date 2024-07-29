---
title: "My self-hosting journey"
date: "2024-08-01"
excerpt: "Self-hosting your own cloud services not only saves money, it is also a great way to learn"
teaser: "selfhosted.svg"
---
<script>
    import ImgSmall from '$lib/components/markdown/imgsmall.svelte'
</script>


<ImgSmall src="/blog/selfhosted/a-cloud-inside-a-house.svg">
</ImgSmall>


Over time I have started to self-host more and more services. For most services, there are paid alternatives, and I don't mind paying even. The main reason I like to self-host is the experience I get from it. It is fun, and if it saves a buck in the process all the better. 

In this blog post, I'll give some details on how I have been managing my self-host stack, which you could use as a starting point to host some useful services yourself. This is mostly a rant, but you'll find something useful here. 

If you want to copy some of my setup, all of my (non-secret) configurations for my self-hosted services [are available on GitHub](https://github.com/RikVoorhaar/infrastructure).


## Which things am I now self-hosting?

### This website
<ImgSmall src="/blog/selfhosted/the-letters-r-and-v.svg">
</ImgSmall>

I made this website myself using `svelte`/`typescript`. The styling is done using Tailwind CSS. I got my icons from `lucide`. The blog posts are rendered from markdown using `mdsvex`, with the math rendered with `katex` and the code blocks using `shiki`. Finally, I'm using `node` inside of a `docker` container to do the actual hosting. It's not the best website you'll ever find, but it's mine and I like it. You can find the source code for this website [here on GitHub](https://github.com/RikVoorhaar/blog).

<div class="clear-both"/>

### Nextcloutd
<ImgSmall src="/blog/selfhosted/a-cloud.svg">
</ImgSmall>

Cloud storage is one of the most useful things to self-host. Not that I do not trust cloud storage providers with my data, but it is nice to have full control over my most important data. 

I was using Owncloud until recently, which works OK, but the client is a bit outdated and eats CPU cycles like a madman when syncing. I resolved part of that by cutting down on the number of files in my storage, but Nextcloud is just a more modern cloud storage system. Nextcloud was originally forked from Owncloud but is kept fully open source and has more features (that I don't need). 

It was surprisingly tricky to get working properly, and the documentation is a bit lacking. Still, overall I do think it's an upgrade over owncloud. 


<div class="clear-both"/>

### Vaultwarden
<ImgSmall src="/blog/selfhosted/a-shield.svg">
</ImgSmall>

Password managers are surprisingly tricky to get right. I've used LastPass and Keeper, and they're good (but not free) services. I then switched to GNU pass, which is OK and has fantastic CLI tools, but the browser extensions suck and are hard to install and syncing is annoying (especially to my phone). 

Recently I switched to Vaultwarden, a self-hosted alternative repository compatible with Bitwarden. It is as good as the paid password managers but gives me full control over the data. It was really easy to set up too. 

<div class="clear-both"/>

### Paperless
<ImgSmall src="/blog/selfhosted/a-book.svg">
</ImgSmall>

I have a bunch of important documents, like contracts, birth certificates, tax documents, etc. I had originally just put them in a folder structure in my cloud storage, but things can still be hard to find. 

Paperless solves this problem by performing OCR on all documents (as well as supporting manual/automatic tags). All your documents are then just searchable, and it becomes incredibly easy to find whatever document you're looking for. It also makes it very easy to share documents with other people. I only recently started to use it, but I think it's a great piece of software. 

<div class="clear-both"/>

### Portainer
<ImgSmall src="/blog/selfhosted/container-ship.svg">
</ImgSmall>

All my self-hosted services run on docker containers (more on that later), and it's really useful to have some tools to monitor the containers remotely. With Portainer I can remotely see logs, CPU usage, and other stats. It also allows me to remotely restart a container. I would also be able to do this when SSH'ed into my server, but doing it via a web browser can be much more convenient. 

Portainer also has tools for deploying and launching the docker stack, but I haven't felt the need for that in my use case. 

<div class="clear-both"/>

### Matomo

<ImgSmall src="/blog/selfhosted/telescope.svg">
</ImgSmall>

Some time ago [I made an interactive dashboard](/blog/dashboard) to help understand the visitors to my site better. (Where are they from? How do they use the website? Which pages are more popular than others?). It turns out that this is a lot of work, and there are better solutions. I wanted something that is open source, and doesn't rely on cookies to track people.

This leads to using `matomo` to gather and display usage information on this website. It can also track to some extent how people are using my website (e.g. how much time they spend on the website), which was not possible using just the HTTP access logs of the website. I can't say that I end up looking at the data very often, but it's nice to have.

<div class="clear-both"/>

### What's next?

<ImgSmall src="/blog/selfhosted/a-question-mark.svg">
</ImgSmall>

There are a lot more things I _could_ be self-hosting. But I just haven't gotten around to it yet. See also [awesome-selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted) for a large list of useful self-hosted projects. 

- _Jellyfin_. Great media-streaming. I am fine for most of my media needs with YouTube+Netflix and Spotify, but occasionally I want to watch a movie or series that's not on there and it's quite a hassle. With Jellyfin I download these and then stream them to _whatever_ device.
- _Mail_. I am currently using Gmail and Outlook both as a mail server and as a webmail client. Since I have my own domain, I could host my own mail server and have an email address like `me@rikvoorhaar.com`. I could even buy the `voorhaar.com` domain (currently on sale for $900) and have `rik@voorhaar.com`. More importantly, I can use a single web client for all my emails. Hopefully, I can find one that supports `vim`-keybindings for writing emails. 
- _AdGuard Home_. I can run a local DNS server that blocks ads automatically. If set up properly, you shouldn't see any ads on any of your devices connected to your home network. One can do this with the well-known pi-hole service as well, but I had mixed results with that and got rid of it. I also hear that AdGuard Home is nowadays the better option.
- _Photos_.  All my photos are stored in the Google cloud. This is super convenient; if I have a new phone all the photos I recorded on any of my previous phones are already on there. However, Google doesn't store the photos at the highest fidelity, so there is some loss. I honestly don't care too much about that, but at the same time syncing all my photos automatically to a photo storage service (such as the one that comes with Nextcloud), is not much work. 
- _Recipes_. I know how to cook a lot of dishes for different cuisines. At the same time, I rarely actually do this. I tend to mostly cook the same foods, out of laziness and convenience. At some point, I had a spreadsheet with all the dishes that I knew how to cook together with some of the most important ingredients. Then when I had an ingredient, I would just look up what kind of dishes I could make with that to get inspired. I should be doing that again, and with self-hosted services like Mealie, KitchenOwl or RecipeSage that is possible. They have the option to search recipes by ingredients, and to add different links to recipes, or scrape instructions and ingredients from an online recipe. Sounds great, but does take a while to set up with >100 recipes. 
- _Shopping Lists_. Even though I use Obsidian for most of my notes and to-do lists, there is one particular use case that just doesn't work well with it and that's shopping lists. To me, it's very important to be able to add items to my shopping list within a few seconds of opening my phone. It is equally important to mark items as done and remove them from the list when I'm in the shop at a similar speed. Right now I'm using Google Keep for that, and it's excellent. But Google products never last forever it seems, so I could use an alternative. Fortunately, both KitchenOwn and RecipeSage also have shopping list features (that even integrate with the recipe functionalities). That sounds like a great solution for me. 

<div class="clear-both"/>

## How does it all work?

<ImgSmall src="/blog/selfhosted/road.svg">
</ImgSmall>

To run self-hosted services properly a bunch of infrastructure needs to be in place first. 

<div class="clear-both"/>

### Hardware
<ImgSmall src="/blog/selfhosted/wrench.svg">
</ImgSmall>

First, you need a device to run the services on. There are essentially two options: use your own device, or use a server. I am using both. 

**VPS**: I'm using Contabo as a VPS. I have been using them for a while, and I can't find anything cheaper with similar specs. Their current cheapest offer is just €4.50/m for a server with 4 cores, 6GB RAM, 400GB SSD storage, and (practically) unlimited traffic. For the things that I'm doing this is more than enough.

**Home server**: I bought a second-hand 2015 NUC locally, and upgraded it with more RAM and storage (using parts I had lying around). It has an interesting quirk where the BIOS doesn't support booting of the NVME storage I installed, and it needs to boot from USB or SATA. As a result, it has a USB stick permanently plugged in that will make it boot. Any mini-PC will do just fine because most self-host services are pretty lightweight. You don't even need to use a mini-PC, but since this is a device that's going to run 24/7, it's better to pick something power-efficient. You could use a Raspberry Pi or other mini-PC, but a second-hand device is probably the cheapest. 



<div class="clear-both"/>

### DNS

<ImgSmall src="/blog/selfhosted/dns.svg">
</ImgSmall>

When I type e.g. `nextcloud.rikvoorhaar.com` in my browser, it needs to resolve to an IP address and needs to route properly. That's (simply put) the job of the DNS. I'm using Cloudflare both as my domain name registrar (they're cheap) and as a DNS service. They have some additional features like caching static content (so that my website will load faster in other regions), and hiding the IP address of the host (so that nobody but me knows the IP address of my VPS, which is a nice security feature). 

<div class="clear-both"/>

### Reverse proxy

<ImgSmall src="/blog/selfhosted/magnifying-glass.svg">
</ImgSmall>

Usually, a service makes itself available on a certain port, e.g. `8000`. But a URL like `nextcloud.rikvoorhaar.com` and `rikvoorhaar.com` just point to an IP address (the same IP address in fact), so how can we send data to the right service when knowing just a URL? The answer is a **reverse proxy**. It looks at the URL of an incoming request and uses that to route it to the correct service (such as a docker container exposing port 8000). The reverse proxy can also do a load of other stuff (such as enabling HTTPS, doing rate limiting, and load balancing). 

There are multiple reverse proxy services out there. Probably the most popular is `nginx`. I chose `traeffik`, which is a bit more complicated to use, but once set up has incredible synergy with docker. It allows me to put all the stuff related to the reverse proxy inside the `docker-compose.yml` of each service, rather than in a global config for all services. This makes the setup more modular and easier to manage.

<div class="clear-both"/>

### Docker

<ImgSmall src="/blog/selfhosted/whale.svg">
</ImgSmall>

Each of my services runs inside a docker container, with all configurations specified in a `docker-compose.yml`. This is great for many reasons. It keeps the services isolated and independent. Everything is highly portable and reproducible. All configuration data is inside of a GitHub repository, and version-controlled (except for the secrets). This way deploying my software stack on a new server is a relatively simple procedure. 

Most services I'm using could also be installed directly (either as a package or from source). But different services may have conflicting dependencies which may change over time. This could be a nightmare to maintain. While setting stuff up with `docker` can have a bit of a learning curve, and you are also often at the mercy of someone else creating and maintaining the container, it does save a lot of maintenance after everything is set up. 

<div class="clear-both"/>

### Tunnel

<ImgSmall src="/blog/selfhosted/tunnel.svg">
</ImgSmall>

I want to be able to reach my home server from outside the local network, without exposing my local network and opening myself up to security risks. This can be done using a **tunnel**. Since I'm already using Cloudlfare, I decided to use `cloudflared` for the tunnel. The idea is that a piece of software runs on my home server, listening for requests from Cloudflare. To SSH into my home server, I need to SSH into e.g `my-home-server.rikvoorhaar.com` using a modified SSH config, then I need to authenticate through Cloudlfare, and then I still need to have a valid SSH key to log in. 

<div class="clear-both"/>

### Backups

<ImgSmall src="/blog/selfhosted/vault.svg">
</ImgSmall>

Self-hosting means keeping a lot of valuable data on a server. Anything can go wrong, so all of this data needs to be properly backed up. I used to do my backups with `rsync`, but I recently switched to `borg` (or `borgmatic` actually) for my backup jobs. It backs up all my data every hour, compresses it, and deduplicates it. I use my home server as a secondary repository for the backups. (One of the reasons I needed a tunnel). The repository on my home server is write-only, so even if one of my servers gets compromised it still is not possible to delete all the data and the backups. In addition, when it comes to the most important data (my cloud storage and my passwords), this data is also mirrored on several devices already (3 computers and a phone). Unless the government of an entire country is after me with a vengeance, __I will not lose my data__. 


<div class="clear-both"/>

### GitHub Actions

<ImgSmall src="/blog/selfhosted/workflow-diagram.svg">
</ImgSmall>

Whenever I want to update my website, I just want to make the required changes on the main git branch, and then my website should simply reflect those changes automatically. This automates the step of SSH'ing into the server, pulling the changes, building the website and restarting the containers. This can be done using services like GitHub Actions. You just have to create a configuration file specifying what scripts/commands to run whenever there is a push to the main branch. In this case, the command goes and SSH'es into my server, so it also requires a secret SSH key to be added. It should also be possible to have a service running on my server that serves as a webhook and runs a script whenever it gets a ping from GitHub. Honestly, however, SSH is much easier to set up and I suppose that I can trust GitHub enough with those secret credentials to my server. 

<div class="clear-both"/>

### Healthchecks

<ImgSmall src="/blog/selfhosted/stethoscope.svg">
</ImgSmall>

Services can fail, and for some services, I need to know about it as soon as possible and get notified. For example, if my website is down, then I want to receive a notification so that I can investigate the issue. This is however quite unlikely to fail, and also quite visible if it goes down. The most important service that I must be sure I can rely on is my backups. This is also because it is the least visible if it does fail. To monitor my backups I'm using `healthchecks.io`. My backup scripts send a ping to a specific URL when starting a backup, and another ping when they fail or succeed. Backups should run every two hours, so if no ping is received for a few hours (or a ping indicating an unsuccessful backup) then I immediately get an email. Because this is hosted by a third party, it is quite reliable. I could self-host such a thing as well, but this is inherently less reliable. For example, if I host such a service on my home server and a backup fails because my home server is turned off, then I will never know about it. 

Ideally, I should also get notified if any of my containers are down, specific services are down, or if either of my two servers is down. I haven't set that up yet, however. 


## Conclusions

Self-hosting services can be fun, save money and be a great way to learn. I learned about a lot of different technologies in this process. It is also a big time sink, and I have spent more hours on this than I initially intended. It's certainly not for everyone, but I don't regret doing what I did either. 