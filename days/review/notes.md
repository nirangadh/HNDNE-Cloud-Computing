# Review notes: Exam preparation and review

These notes go with the review session's slides. They show you how to answer a question that comes in parts, take you through the timed practice and the marking workshop, go back over the seven ideas that are most often confused, and finish with what your group must hand in for the capstone.

## Where you are starting

You have built all thirteen components of the Thara Hospitals pilot and taken them apart again. You have attempted six practice questions, and your group's capstone is under way. Nothing new is taught in this session. It is about using what you know when the clock is running and nobody is there to prompt you.

Bring your six attempts, your evidence packs and your group's capstone diagram.

## 1. What a composite question asks

Every practice question in this module has the same shape: a short scenario, then three parts that ask for more each time. That shape is what "composite" means. One question joins several ideas, and you cannot answer it from memory alone.

![One question drawn as three rising steps. The first step is Explain, with 6 marks and about 10 minutes. The second is Apply, with 8 marks and about 14 minutes. The third is Evaluate, with 6 marks and about 10 minutes. A short block before the first step is for reading the scenario.](img/three-parts.svg "Three parts, each asking for more than the last. Your time follows the marks.")

| Part | It asks you to | A strong answer |
|---|---|---|
| **(a) Explain**, 6 marks | Say what something is and how it works | Names the right mechanism and says what follows from it |
| **(b) Apply**, 8 marks | Produce a design, a rule, a configuration or a diagram for this scenario | Uses the scenario's own names and numbers, and meets its constraints |
| **(c) Evaluate**, 6 marks | Weigh a choice, a risk or a proposal | Says what is right in it, what is wrong, and what would change your view |

**Read the scenario for its constraints before you write.** A constraint is a fact in the scenario that rules some answers out: a budget, a recovery target, a rule about personal data, a limit on what the IT team can do. Every practice question has held at least two, and each one printed them under "Constraints you should notice". When nobody prints them for you, underline them yourself. For Thara they come from the same three people every time: the CFO's USD 150 a month, the Head of IT's targets, and the Data Protection Officer's "who can read it, and how would we know".

> **Quick check.** A scenario says that patient records have an RPO of one hour, and that the pilot must be recoverable by the IT team without outside help. Which of these is a constraint that you must answer to?
>
> - [ ] That the database engine is MySQL
> - [x] That the IT team must be able to do the restore themselves
> - [ ] That Thara has four branch hospitals
>
> **Why:** A constraint rules answers out. A recovery that needs a vendor on the telephone fails this scenario, however fast it is. The engine and the number of branches are facts, and no answer is right or wrong because of them.

**Time by marks.** A practice question is set for about 35 minutes. The marks tell you how to spend them: about 10 minutes on (a), about 14 on (b) and about 10 on (c), with the reading inside that. The commonest way to lose marks is to write a page for (a), because it is the part you can remember, and to reach (c) with three minutes left. Part (c) is worth as much as part (a).

**Draw before you describe.** For any question about a network, draw it first: the VPC, the subnets with their ranges, the route tables, the gateways, and an arrow for the path a request takes. A drawing shows a missing route at once, and four lines of labels can save a paragraph. Then write about what you drew.

**Close every evaluate part with a stated trade-off.** An evaluation that ends "so both have advantages" has not evaluated anything. End with a sentence in this form: "I would choose X, because of this constraint; I give up Y; and I would change my mind if Z." The practice guidance calls the last clause "what would change your view".

> **Quick check.** Which closing sentence finishes an evaluate part properly?
>
> - [ ] "Both a NAT gateway and a gateway endpoint have advantages and disadvantages."
> - [ ] "A NAT gateway is a managed service that translates addresses for outbound connections."
> - [x] "Keep the endpoint and delete the NAT gateway after each patch: the hourly charge buys nothing between patches, and I would revisit this if the web tier needed a second service every day."
>
> **Why:** The third sentence makes a choice, ties it to the CFO's ceiling, and says what would change it. The first weighs nothing. The second is a definition, which belongs in part (a).

**Naming is not applying.** This is the difference that the marking workshop is built around. Compare two sentences about the same rule.

| Names the mechanism | Applies it to Thara |
|---|---|
| "A security group is a stateful firewall that controls traffic to an instance." | "`thara-db-sg` allows port 3306 only from `thara-web-sg`, so a replaced web server is admitted the moment it wears that group, and nothing else in the subnet is." |

The first sentence is true of every network in the world. The second could only have been written about this one. An answer made of sentences like the first shows that you have read the notes. An answer made of sentences like the second shows that you can do the job.

> **Quick check.** The question is about the reports bucket. Which sentence applies an idea to the scenario?
>
> - [ ] "Versioning keeps earlier versions of an object."
> - [x] "With versioning on `thara-reports-<student id>`, the report that was overwritten at 15:20 is brought back by making its earlier version current."
> - [ ] "S3 offers versioning, lifecycle rules and several storage classes."
>
> **Why:** The second sentence uses the scenario's bucket and its event, and says what the feature does about it. The first is a definition and the third is a list. Both would be true in any answer to any question.

## 2. What the questions can and cannot ask

**What a question can draw on.** A question draws on the eight learning outcomes and on what the seven teaching days taught, built or showed, and on nothing else. If a service was built in a lab, expect to be asked to design with it or to write a rule for it. If it was demonstrated, expect to explain what it does and when you would choose it. If it was only named, such as Direct Connect or CloudFront, expect to say what it is for and to weigh it against something you did build. No question needs a service that the module never mentioned. The practice questions gave you every price they needed, so practise reasoning with the numbers in front of you and not with remembered ones.

**What a question cannot ask.** It cannot ask for a list. Every question is set in a scenario, usually at Thara Hospitals, and the organisation changes from question to question while the platform does not: a new branch, a power cut, a contractor, a surge in patients. So revising by memorising definitions prepares you for a third of each question at most. Revise by taking an idea and asking what it would mean for a hospital that has just changed.

**Back to Day 1: virtualisation and containerisation.** The first learning outcome is also the first argument you met: a virtual machine has a kernel of its own and is isolated by the hypervisor, while a container is a group of processes that share the host's kernel. It is worth going back to, because it is an argument and not a fact. "Which is better" has no answer until someone says for whom and for what, and an answer that only lists the differences has stopped before the question began. The worked question in [composite-question-anatomy](artefacts/composite-question-anatomy.html) is the Day 1 practice question taken one part at a time.

> **Quick check.** The Head of IT asks whether the portal should be packaged as a container image. Which opening shows that you are arguing and not listing?
>
> - [ ] "Containers are faster, smaller and more portable than virtual machines."
> - [ ] "There are five differences between a virtual machine and a container."
> - [x] "For a small team in a six-month pilot, the real difference is what they must learn and patch, so I start there."
>
> **Why:** The third opening chooses the difference that matters to this team and says why. The other two could begin an answer about any organisation, and they lead to a list.

## 3. The mock and the marking workshop

**The timed mock, 35 minutes.** You answer one full question, in three parts, on a Thara scenario that you have not seen. It is handed out in the room. Work as you would if nobody could help you: read for the constraints, draw, spend your time by the marks, and close part (c) with a trade-off.

**The marking workshop, 45 minutes.** You are given two answers to the question you have just attempted. Both were written for this workshop, to be marked; neither is a student's work. You mark each against the marking guide that is handed out with them, then you mark your own. For every part, ask three things in order.

1. Does it name the right mechanism?
2. Does it apply that mechanism to this scenario's names, numbers and constraints?
3. Does it weigh a trade-off and say what would change the choice?

Then find the exact sentence in each answer where naming stopped short of applying. That sentence is what the discussion is about. Keep your marked answer: it is the first thing to look at when you plan your revision.

## 4. Seven ideas that are often confused

These are seven ideas that are easy to mix up, and your lecturer may add others that your own cohort's answers have shown. Each is stated here as you first met it. Sort them for yourself in [misconception-cards](artefacts/misconception-cards.html): turn each card, then put it under "I had this one" or "I did not".

**Security group or network ACL (Day 3).** A [security group](../../glossary.md#security-group) follows the instance, is stateful and has allow rules only. A [network ACL](../../glossary.md#network-acl) stands at the edge of a subnet, is stateless and can deny.

> **Common mistake.** "Security groups can deny." They cannot. A security group has allow rules only, and the absence of an allow is the deny. If you need to block one specific range, that is a job for a network ACL.

> **Common mistake.** "Network ACLs are stateful." They are not. Allowing a request in says nothing about its reply, which needs its own rule in the other direction.

You saw it when `thara-strict-nacl` broke SSH to the bastion until an outbound rule allowed the reply.

**What makes a subnet public (Day 3).** A [public subnet](../../glossary.md#public-subnet) is public because its route table sends `0.0.0.0/0` to the internet gateway.

> **Common mistake.** "A subnet named public is public." A name is a label for people. Only a route to the internet gateway, plus a public address on the instance, makes anything reachable. Name a subnet `thara-public-b`, forget to associate it with the public route table, and it is private.

You saw it when the default route was removed from `thara-public-rt`: the bastion kept its public address, and nobody could reach it.

**Peering does not pass traffic on (Day 4).** A [VPC peering](../../glossary.md#vpc-peering) connection carries only traffic that starts in one of its two VPCs and ends in the other.

> **Common mistake.** "Peering is transitive." It is not. Reaching the partner laboratory does not let Thara reach the partner's own partners, and it does not let them reach Thara. Each pair that must talk needs its own peering, or a hub.

You saw the neighbouring rule in the lab: the ping to `partnerlab-1` succeeded only when both route tables carried the peering route.

**Multi-AZ or read replica (Day 6).** [Multi-AZ](../../glossary.md#multi-az) is for availability. A [read replica](../../glossary.md#read-replica) is for scale. Neither is a backup.

> **Common mistake.** "Multi-AZ improves read performance." It does not; replicas do. A standby is a spare that waits. If the problem is that the database is too busy with reads, a second copy that answers nothing does not make it less busy.

**RPO or RTO (Day 6).** The [RPO](../../glossary.md#rpo) is the most data you accept losing. The [RTO](../../glossary.md#rto) is the longest the service may stay down. For patient records they are one hour and two hours.

> **Common mistake.** "RPO and RTO are the same number." One is data loss, the other is downtime. A system can come back in ten minutes with a day of work missing, or lose nothing at all and still be down until tomorrow.

You measured the second one yourself, with a clock, when you deleted `thara-records` and restored it.

**Reserved Instances or Savings Plans (Day 2).** Both buy a discount of about a third with a commitment of one year or three, and they commit you to different things. A [Reserved Instance](../../glossary.md#reserved-instance) is a commitment to a particular instance family in a region. A Savings Plan is a commitment to spend a set amount per hour on compute, with more freedom over what you run. They are not two names for one thing, and for Thara neither fits yet: a one-year commitment would cut the web tier's cost by roughly a third, but the pilot is approved for six months.

**Explicit deny beats allow (Day 5).** An [explicit deny](../../glossary.md#explicit-deny) in any policy that applies ends the question.

> **Common mistake.** "An explicit allow wins." It does not. An explicit deny always wins. If one policy allows an action and another denies it, the answer is no, however specific the allow is and whichever was attached last.

You saw it when `thara-deny-test` stopped the bucket listing although `thara-reports-read` still allowed it.

> **Quick check.** The partner laboratory's range, `10.1.0.0/16`, must be blocked from the private subnets today, whatever the security groups there allow. Which tool does it?
>
> - [x] A deny entry in a network ACL on the private subnets
> - [ ] A deny rule in `thara-web-sg`
> - [ ] Removing the allow rule from the partner's own security group
>
> **Why:** Only a network ACL can deny, and it does so for the whole subnet at once. A security group has no deny rules to write. The partner's group belongs to the partner, and Thara cannot rely on it.

## 5. Your revision plan

Fill this in before you leave, from your marked mock answer, your six practice attempts and the cards you sorted. Be honest in the fourth column: write "sure", "shaky" or "lost".

| Learning outcome | Taught on | Practised in | How sure am I? | What I will do, and by when |
|---|---|---|---|---|
| 1. Explain the key differences between virtualisation and containerisation. | Days 1, 2 | PQ1 | | |
| 2. Explain cloud computing concepts. | Days 1, 7 | PQ1 | | |
| 3. Explain high availability (HA) concepts. | Days 4, 7 | PQ1, PQ4, PQ6 | | |
| 4. Describe the core features of cloud computing. | Days 1, 2, 6, 7 | PQ2 | | |
| 5. Implement, scale, and manage cloud instances with storage, networking, and security features. | Days 2 to 7 | PQ2, PQ3, PQ5 | | |
| 6. Manage cloud data by configuring storage and backups. | Days 2, 6 | PQ2, PQ6 | | |
| 7. Explain virtual private clouds, subnets, gateways, and other cloud networking options. | Days 3, 4, 7 | PQ3, PQ4 | | |
| 8. Describe the security features of cloud computing. | Days 1, 5, 7 | PQ5 | | |

For each outcome that you marked "shaky" or "lost", choose one thing you can finish: attempt its practice question again without notes and with a clock, redraw the day's diagram from memory, or play that day's quiz until you can give the reason for every answer. Reading the notes again feels like revision and tests nothing.

## 6. The capstone: submission checklist and the viva

Everything here is taken from the [capstone brief](../../coursework/capstone-brief.md). Where these notes and the brief differ, the brief is right.

**What your group submits.** Seven deliverables. Tick each one as a group, not each member alone.

| | Deliverable | Check before you submit |
|---|---|---|
| 1 | The running environment, demonstrated live at the viva | A five-minute screen recording is the fallback if the account has expired. Make it while the environment still runs |
| 2 | An architecture diagram | It uses the canonical component numbers |
| 3 | A design justification of no more than 2,500 words | Network layout, security controls, resilience choices and cost. Every choice is tied to a requirement in section 2 of the brief or to a voice in the scenario |
| 4 | The Pricing Calculator estimate (exported) and the build cost ledger | The estimate is at production scale, 730 hours a month for everything that would run continuously, and inside USD 150. The ledger shows the hours of the load balancer, the NAT gateway and RDS |
| 5 | A threat table of at least eight threats | Each has the control that addresses it and where in the architecture the control sits |
| 6 | The three tier IAM policies as JSON and the member sign-in test record from Day 5 | One policy for each tier: network, security and data |
| 7 | A contribution statement signed by all members | It lists who built and who wrote what |

**The nine requirements.** Before you submit, read section 2 of the brief aloud as a group, one requirement at a time, and point to where your environment meets it. Three are easy to claim and hard to show: the **tested** restore with a measured RTO against the target of two hours (requirement 7), least-privilege policies written by the group for each tier (requirement 8), and the documented hours of the NAT gateway window (requirement 5).

**The contribution statement.** The brief asks for one thing: a statement, signed by every member, that lists who built and who wrote what. So name the person against each component built and each section written, and have everyone sign it. The brief also says that a peer-assessment factor of plus or minus 10% may be applied to an individual's share where the contribution statement and viva performance justify it and programme regulations permit. The statement and the viva are read together.

**How the viva works.** Fifteen minutes. Each member is asked about a tier that was **not** their primary responsibility. If you built the network, expect the security or the data questions. The brief tells you what to expect:

- "walk me through a request from a patient to the database"
- "what happens if AZ a fails"
- "show me who accessed the audit bucket last week"
- "what would you cut if the CFO halved the ceiling"

So the way to prepare is to teach one another. Each member explains their own tier to the other two until either of them could answer for it, with the console open. The group viva carries 15% of the capstone's marks, and a distinction there looks like this: each member answers on a tier other than their own.

## After this session

The capstone submission and the viva follow, on the dates announced for your cohort. There is no further teaching day.
