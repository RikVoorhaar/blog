---
title: "My self-hosting journey"
date: "2024-08-01"
excerpt: "Self-hosting your own cloud services not only saves money, it is also a great way to learn"
teaser: "self-hosted.jpg"
---

Things to mention
- [ ] My website
- [ ] Cloud storage
- [ ] Paperless
- [ ] Backups
- [ ] Cloudflare
- [ ] VPS
- [ ] Traefik
- [ ] Bitwarden
- [ ] Docker
- [ ] Portainer
- [ ] Github actions


## Introduction

Over time I have started to self-host more and more services. For most services there are paid alternatives that are better, and I don't really mind paying even. The main reason I like to self-host, is the fact that I learn something in the process. It is fun, and if it saves a buck in the process all the better. 

In this blog post I'll give some details on how I have been managing my self-host stack, which you could use as a starting point to host some useful services yourself. 

## Hardware

First you need a device to run the services on. There are basically two options: use your own device at home, or use a server. I am using both. 

**VPS**: I'm using Contabo as a VPS. I have been using them for a while, and I can't find anything cheaper with similar specs. Their current cheapest offer is just €4.50/m for a server with 4 cores, 6GB RAM and 400GB SSD storage, and (practically) unlimited traffic. For the things that I'm doing this is more than enough.

**Home server**: I bought a second-hand 2015 NUC locally, and upgraded it with more RAM and storage (using parts I had laying around). It has an interesting quirk where the BIOS doesn't support booting of the NVME storage I installed, and it needs to boot from USB or SATA. As a result, it has a USB stick permanently plugged in that will make it boot. Any mini-PC will do just fine, because most self-host services are pretty lightweight. You don't even need to use a mini-PC, but since this is a device that's going to run 24/7, it's better to pick something power efficient. You could use a raspberry pi or other mini-PC, but a second hand device is probably the cheapest. 

## Infrastructure

In order to run self-hosted services properly a bunch of infrastructure needs to be in place first. 

### DNS

When I type e.g. `nextcloud.rikvoorhaar.com` in my browser, it needs to resolve to an IP address and needs to route properly. That's (simply put) the job of the DNS. I'm using Cloudflare both as my domain name registrar (they're cheap) and as DNS sevice. They have some additional features like caching static content (so that my website will load faster in other regions), and hiding the IP address of the host (so that nobody but me knows the IP address of my VPS, which is a nice security feature). 

### Reverse proxy

Usually a service makes itself available on a certain port, e.g `8000`. But a URL like `nextcloud.rikvoorhaar.com` and `rikvoorhaar.com` just point to an IP address (the same IP address in fact), so how can we send data to the right service when knowing just a URL? The answer is a **reverse proxy**. Its looks at the URL of an incoming request, and uses that to route it to the correct service (such as a docker container exposing port 8000). The reverse proxy can also do a load of other stuff (such as enabling HTTPS, doing rate limiting, and load balancing). 

There are multiple reverse proxy services out there. Probably the most popular is `nginx`. I chose `traeffik`, which is a bit more complicated to use, but once set up has incredible synergy with docker. It allows me to put all the stuff related to the reverse proxy inside the `docker-compose.yml` of each individual service, rather than in a global config for all services. This makes the setup more modular and easier to manage.

### Docker

Each of my services run inside a docker container, with all configuration specified in a `docker-compose.yml`. This is great for many reasons. It keeps the services isolated and independent. Everything highly portable and reproducable. All configuration data is inside of a github repository, and version controlled (except for the secrets). This way deploying my software stack on a new server is a relatively simple procedure. 

Most services I'm using could also be installed directly (either as a package or from source). But different services may have conflicting dependencies which may change over time. This could be a nightmare to maintain. While setting stuff up with `docker` can have a bit of a learning curve, and you are also often at the mercy of someone else creating and maintaining the container, it does save a lot of maintenance after everything is set up. 

### Backups



### Tunnel
