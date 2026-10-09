# Day 7 notes: HA delivered and monitored

These notes go with the morning slides. They build the ideas you need for the lab that fills the second half of this morning, where you build component 12 (the load balancer and the Auto Scaling group) round component 6, the portal web tier, and see component 13, the edge, demonstrated. The afternoon is a drill, and its briefing is in the lab sheet.

## Where you are starting

So far you have built components 1 to 11. The portal's page is served by one server, `thara-web-1`, in one private subnet, started from the image `thara-portal-v1`. Nobody outside the network can reach it. On Day 6 you gave the records a restore that you had tested, and a number for how long it takes.

Two questions are still open, and they are the oldest in the story. The flood took Thara's portal down for three days because everything was in one place. And the portal is busy from 07:00 to 10:00 on every OPD morning and three times as busy in dengue season, while the CFO has approved a fixed sum each month. Day 6 asked whether you can get it back. Today asks whether it stays up, what that costs, and how you would show the cost to the person who pays.

Today has four parts. Availability is a number that you can calculate. A group of servers can be made to repair and resize itself. The edge of the network has a control of its own, which you watch and do not build. And the bill can be read against your own ledger.

## 1. Availability as arithmetic

"The portal must always be up" cannot be designed for, tested or paid for. A percentage can.

**Availability targets, and what 99.9% means in minutes per month.** Availability is the share of time for which a service works, and an [availability target](../../glossary.md#availability-target) is the share it is meant to reach. It is written as a percentage, and it is best read the other way round, as the downtime it allows. This module counts a month as 730 hours, which is 43,800 minutes.

| Target | Said as | Downtime allowed in a month |
|---|---|---|
| 99% | two nines | 438 minutes, a little over seven hours |
| 99.9% | three nines | about 44 minutes |
| 99.99% | four nines | about 4 minutes |

Each extra nine cuts the allowance to a tenth, and it does not cost a tenth more. Seven hours can be met by a person with a runbook. Forty-four minutes can be met only if recovery starts by itself. Four minutes can be met only if nothing has to recover at all.

> **Quick check.** A service promises 99.9% in a month of 730 hours. This month it was down for 50 minutes. Did it meet the promise?
>
> - [ ] Yes: 50 minutes is under an hour, and an hour is about 0.1%
> - [x] No: 99.9% allows about 44 minutes, and 50 is more
> - [ ] It cannot be said without the number of requests that failed
>
> **Why:** One tenth of one percent of 43,800 minutes is 43.8 minutes. "About an hour" is the tempting guess, and it is wrong by a quarter. Availability is measured in time, so the number of requests is not needed.

**Parts in a chain multiply.** A patient's request passes through several things in turn, and it succeeds only if every one of them is working. So their availabilities multiply. Three parts at 99.9% each give 0.999 x 0.999 x 0.999, which is about 99.7%: roughly 131 minutes a month, three times the allowance of any one part. A chain is always worse than its weakest link.

**Parts side by side multiply their failures.** Two servers that can each do the whole job fail together only when both are down at once. If each is available 99% of the time, each is down 1% of the time, and both are down 0.01 x 0.01 of the time: one ten-thousandth. Together they are 99.99% available. That sum is honest only if the two do not fail for the same reason, which is why the second server goes in a second availability zone and not beside the first. Try the first sum in [availability-arithmetic](artefacts/availability-arithmetic.html): add parts to the chain and watch the minutes grow.

![Two panels. Three parts in a chain, each available 99.9% of the time, multiply to about 99.7%, or 131 minutes of downtime a month. Two web servers side by side, each available 99% of the time, are down together 1% of 1% of the time, which is 99.99%, or about 4 minutes a month.](img/nines-in-a-chain-and-side-by-side.svg "A chain needs every part, so it is worse than its weakest link. Two servers side by side fail together only rarely, so they are better than either one.")

> **Quick check.** A request to Thara's portal needs the load balancer, a web server and the records database, one after another. Suppose each is available 99.9% of the time. How available is the whole path?
>
> - [x] About 99.7%, because the three multiply
> - [ ] 99.9%, because that is the weakest of the three
> - [ ] 99.99%, because three parts cover for each other
>
> **Why:** The parts are in a chain, so every one must work and their availabilities multiply. Covering for each other is what parts side by side do, such as two web servers. Three different parts in a row cannot stand in for one another.

**Fault tolerance versus high availability.** The two are often used as if they meant the same. [Fault tolerance](../../glossary.md#fault-tolerance) means that a failure causes no interruption at all, because spare capacity is already running and already carrying the load. [High availability](../../glossary.md#high-availability) means that a failure causes a short interruption, after which the service recovers by itself. Fault tolerance costs roughly double for everything, all the time. High availability costs a little more and accepts a few bad seconds. Most systems, and Thara's pilot, buy high availability.

> **Quick check.** One of Thara's two web servers fails. For some seconds a few patients see an error. Then every request is answered by the other server, and a replacement arrives a few minutes later. Which word describes the web tier?
>
> - [ ] Fault tolerant
> - [ ] Neither, because some requests failed
> - [x] Highly available
>
> **Why:** The service recovered quickly and without a person, after a brief interruption: that is high availability. Fault tolerance would have meant no failed request at all. A design can be good without being fault tolerant.

**Disaster recovery patterns.** High availability deals with the loss of a server or a zone. Disaster recovery deals with the loss of everything in one place. The patterns form a ladder, and each rung up costs more and recovers sooner.

| Pattern | What is waiting in the second place | Recovery |
|---|---|---|
| Backup and restore | Copies of the data, and nothing running | Hours: everything is rebuilt, then restored |
| Pilot light | The data kept up to date, and the servers defined but switched off | Shorter: the servers are started and scaled up |
| Warm standby | A small working copy of the whole system | Shorter still: the copy is made larger |

Day 6 was the first rung: you restored from a backup and timed it. The rung above warm standby, multi-site, runs the full system in two places at once; here it is a name only. The choice between rungs is the Day 6 argument again: the RPO and the RTO say how high you must climb, and the budget says how high you can.

**Vertical versus horizontal scaling, and where each stops.** There are two ways to give a service more capacity. Vertical scaling makes one server larger: more CPU, more memory. It is simple, it needs a restart, and it stops at the largest server that can be bought. The one large server is also still one server. [Horizontal scaling](../../glossary.md#horizontal-scaling) adds more servers of the same size behind a load balancer. It has no such ceiling, and it gives availability as a by-product. It stops where the servers cannot be treated as identical: a server that keeps something only it knows, such as a patient's session, cannot be replaced by another. That is why the web tier holds nothing of its own, and the records live in a database.

> **You already know this.** Redundant supervisors in a chassis versus a stack of switches. A chassis with two supervisor modules survives the loss of one, and it is still one chassis, in one rack, on one power feed. A stack of switches spreads the work over several units, and you grow it by adding a unit. The first is making one thing harder to kill. The second is having more than one thing.

> **Thara.** The monsoon flood was a single point of failure; two AZs and two instances are the fix the pilot can afford. One basement, one pair of servers, one cupboard of tapes: one event reached all of them. Two small servers in two zones cost about as much as one larger one, and no single flood reaches both.

## 2. Making it heal itself

Two servers are not yet a service. Something has to share the requests between them, notice when one stops answering, and start another. Four resources do this between them, and each has one job.

**Launch templates.** A [launch template](../../glossary.md#launch-template) is a saved answer to every question the launch page asks: which image, which instance type, which security group, which role, which tags. On Day 3 you answered those questions by hand for `thara-web-1`. A template answers them once, so that a server can be started without a person.

**Auto Scaling groups; minimum, desired, maximum.** An [Auto Scaling group](../../glossary.md#auto-scaling-group) keeps a set number of instances running from a launch template, across the subnets you name. It holds three numbers. **Desired** is how many it keeps running now. **Minimum** and **maximum** are the limits between which desired may move. The group's whole behaviour is one rule: if fewer instances are healthy than desired, start one; if more, stop one. Replacing a failed server and adding a server under load are the same rule applied to two different causes.

**Health checks from the load balancer.** Left alone, a group asks only whether an instance is running. An instance can be running while its web server has stopped answering. The [Application Load Balancer](../../glossary.md#application-load-balancer) from Day 4 already knows better: it sends a [health check](../../glossary.md#health-check) to every server in its [target group](../../glossary.md#target-group) and stops sending patients to one that fails. So the group is told to use the load balancer's verdict as well. A server that fails the check is then not only taken out of the queue. It is terminated and replaced.

> **Common mistake.** "Auto Scaling replaces the load balancer." The ALB is separate and needs to be created. The group decides how many servers exist. It hands out no requests and has no address that a patient could use.

> **Quick check.** `thara-web-asg` is created with two instances in two private subnets, and nobody creates a load balancer. What do patients have?
>
> - [ ] One address that shares them between the two servers
> - [x] Two servers, and no single way in to either
> - [ ] Nothing, because a group cannot launch without a load balancer
>
> **Why:** The group keeps the count and replaces what fails. Sharing requests and offering one name are the load balancer's work, and it has to be created and connected through a target group. A group launches perfectly well with no load balancer, which is why the gap is easy to miss.

> **Common mistake.** "The ALB is in a subnet." It spans subnets across AZs. You give it one public subnet in each zone, and it stands in all of them at once, which is why the loss of one zone does not take the portal's name with it.

Watch the whole loop in [asg-self-heal](artefacts/asg-self-heal.html): fail a server, add load, and read the cost meter while you do.

![Four resources and their jobs. The load balancer shares requests between the web servers in the target group and checks their health. The Auto Scaling group is told when a server is unhealthy and starts a new one from the launch template. An alarm with a scaling policy tells the group to keep one more.](img/who-replaces-what.svg "Two messages reach the group: this server is unhealthy, and keep one more. Its answer to both is the same: start a server from the template.")

**Scaling policies on a CloudWatch alarm; cooldowns.** Replacing is automatic. Growing needs a rule. A [scaling policy](../../glossary.md#scaling-policy) changes the group's desired number when an [alarm](../../glossary.md#alarm) fires. The alarm watches one metric, such as the group's average CPU, and changes state when it stays past a threshold for a set time. After the policy acts, the group waits for a [cooldown](../../glossary.md#cooldown) before it will act again. Without the wait it would add a server every minute for as long as the alarm lasted, before the first new one had taken any load. One detail decides whether this works at all: an instance reports its CPU every five minutes unless detailed monitoring is switched on, and an alarm that reads one-minute periods needs one-minute data.

**CloudWatch metrics, alarms and logs; SNS as the notification path.** CloudWatch holds three kinds of thing, and you have met two. A metric is a number over time: CPU, requests, healthy targets. An alarm is a watch on one metric. Logs are text records, such as the flow log of Day 3. An alarm changes nothing by itself. It triggers an action, such as a scaling policy, and it tells people through the Simple Notification Service: the alarm publishes a message to a topic, and whoever has subscribed to the topic receives it, by email in the lab.

> **You already know this.** A hardware load balancer health-checking a server pool. The appliance in the rack probes each server in its pool and takes a failed one out of rotation. That part is the same here. The difference is what happens next: the appliance waits for someone to repair the server, and the group builds a new one.

> **Thara.** OPD peaks and dengue season; the CFO pays for the third instance only when it is needed. A bought server sized for the dengue weeks idles for the rest of the year. A third server that exists from 07:00 to 10:00 is paid for in those hours and in no others.

## 3. The edge, demonstrated

Everything so far protects the portal against failure. The portal is also a public website that holds health data, and that needs protecting against people.

**WAF as a web ACL with managed rule groups, attached to the load balancer.** Security groups and network ACLs judge a packet by its addresses and its port. They cannot tell an honest request for a report from a request built to break the application: both arrive on port 80 from an address on the internet. AWS WAF reads the request itself. You write a [web ACL](../../glossary.md#web-acl), a list of rules that allows or blocks each web request, and attach it to the load balancer. Most of the rules you do not write. A managed rule group is a set of rules that AWS maintains for the common attacks, and you add it as one line. At the time of writing the newer console calls a web ACL a protection pack.

**Why it is demonstrated and not built by every student.** The cost is cents, so cost is not the reason. The point is placement, not configuration. What you should take away is where the control sits: at the edge, in front of the load balancer, before a request has reached any server of yours. Your lecturer attaches a web ACL with the AWS managed core rule group to a load balancer, sends a request whose query string is shaped like a SQL injection, shows it blocked, and shows the sampled request in the WAF console. Then the web ACL is deleted.

**CloudFront and Shield recalled from Day 4 as the next phase.** Day 4 placed two more services at the edge: [CloudFront](../../glossary.md#cloudfront), which answers patients from a location near them, and Shield, which absorbs floods of traffic. They belong to a later phase of the pilot. With them the path of a request reads: CloudFront, the web ACL, the load balancer, a web server.

> **Thara.** A patient portal on the public internet will be probed within hours of going live. Nobody needs to have heard of Thara for that to happen: the probing is automatic and constant. The leaked report link was a failure of the application. The web ACL is the control that stands in front of the next one.

## 4. The bill, read properly

Since Day 1 you have kept a ledger by hand: what you created, when, and what you estimated it cost. AWS has kept its own account of the same period. Today the two are put side by side.

**Cost Explorer grouped by service and by the Owner tag.** Cost Explorer draws your spending over time, and **Group by** decides how it is cut. Grouped by **Service**, it shows where the money went: compute, storage, the NAT gateway of Day 4. Grouped by a tag, it shows whose money it was. Every resource since Day 2 has carried `Owner=<student id>`, and this is what that was for: in an account that several people share, the tag is the only thing that separates one person's cost from another's. One condition applies. A tag groups costs only after it has been activated as a cost allocation tag in the billing console, and only from then on. If `Owner` is not yet offered, the lab has you activate it and read the view by service today.

**What the module has cost so far against the ledger, and why the two disagree.** They will not match exactly, and the difference has two causes.

- **Timing.** Cost Explorer is up to a day behind. This morning's load balancer is in your ledger and not yet in Cost Explorer. A ledger is written when you act; a bill is written when AWS has counted.
- **Credits.** Your account is charged against credits. Cost Explorer can show what was used or what was charged after credits, and on a Free Plan account the second figure reads zero. Your ledger, like `thara-budget`, records what the resources would have cost.

A difference that neither cause explains is the interesting one. It usually means something was left running.

> **Thara.** The CFO's actual against forecast. She approved USD 150 a month and asked for an itemised forecast, a monthly actual, and an explanation of any line that changes. The forecast is the Pricing Calculator estimate of Day 4. The actual is Cost Explorer. The explanation is your ledger.

> **Quick check.** Your ledger says that a load balancer ran for an hour and a half this morning. This afternoon Cost Explorer shows no line for it. What is the likeliest reason?
>
> - [ ] The load balancer was not tagged, so it is hidden
> - [x] Cost Explorer is up to a day behind what you did
> - [ ] Credits paid for it, so it was never recorded
>
> **Why:** The data in Cost Explorer arrives with a delay of up to a day, so this morning is not in it yet. A missing tag changes the group a cost appears under, and it still appears. Credits change what you pay, not whether the usage is recorded.

## Before the lab

The lab is in the second half of this morning. Its steps are in the [lab sheet](lab.md), which also holds this afternoon's drill.

- Find `thara-key.pem`, and have the inbox of your own email address open.
- Open [asg-self-heal](artefacts/asg-self-heal.html) and find components 6 and 12 in it. Notice which part stands in the public subnets and which in the private ones.
- Open your cost ledger. The estimate for the morning is USD 1.50. One resource bills by the hour: the load balancer. It must be deleted before the break.
- Have a clock that you can read to the minute. You will time a replacement.
- Be ready to say, before you terminate a server, what you expect the group to do.

For the afternoon: bring your group's capstone diagram, for the peer review. Before the drill, try [fault-finder](artefacts/fault-finder.html), and use [well-architected-wheel](artefacts/well-architected-wheel.html) with your group in the workshop.

## Reading

- AWS, *AWS Well-Architected Framework*, the summary of the Reliability pillar, and the list of the six pillars.
- Wittig, A. and Wittig, M. *Amazon Web Services in Action*, 3rd ed., Manning. The chapters on Auto Scaling and load balancing.
- AWS, *Amazon EC2 Auto Scaling User Guide*, "Health checks for instances in an Auto Scaling group".
- Before the review session: revise against the learning outcomes in the [module overview](../../README.md).

Practice: any of practice questions 1 to 6 that you have not yet attempted, in [practice](../../practice/README.md). There is no new practice question for Day 7.

Task: with your group, continue the capstone build for submission after the review session.
