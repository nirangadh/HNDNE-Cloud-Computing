# Day 6 notes: Storage strategy, databases, recovery

These notes go with the morning slides. They build the ideas you need before this afternoon's lab, where you build component 11 (the patient records database and its Backup plan) of the Thara architecture and finish component 3, the laboratory reports bucket.

## Where you are starting

So far you have built components 1 to 10. The network is finished, and since Day 5 the web tier reads the reports bucket through `thara-web-role`, a key called `alias/thara-records` is waiting for a database that does not exist yet, and `thara-trail` records who did what.

Three things have been left as they were. The reports bucket has only the settings it was born with on Day 2: it holds one file, in one class of storage, and an overwrite would replace it for good. Day 5 showed you a table with one empty promise in it, "Day 6: a bucket policy". And you have restored from the Day 2 snapshot twice without anyone asking how long it took. That last point is the one Thara cares about most. Its backups were a tape each night, carried to a cupboard on the third floor, and when the basement flooded the hospital was on paper for three days.

Today has three parts. Storage is a set of choices about cost and time, not one bucket. A managed database moves a large share of the work to AWS and leaves you the part that matters. And recovery is two numbers, of which you will measure one this afternoon.

## 1. S3 as a strategy, not a bucket

On Day 2 a bucket was a place to put a file. A storage strategy answers four more questions: how much does it cost to keep an object, how long does it take to get one back, what happens when someone overwrites or deletes it, and who can read it.

**Storage classes.** Every object is stored in a [storage class](../../glossary.md#storage-class). All the classes below keep your data with the same very high durability, spread over at least three availability zones. They differ in two things that pull against each other: what you pay each month to keep a gigabyte, and what it costs, in money and in time, to get it back.

| Class | Keeping it | Getting it back | You pay for at least |
|---|---|---|---|
| S3 Standard | Dearest | At once, no charge for retrieval | Nothing |
| S3 Standard-Infrequent Access | Cheaper | At once, with a charge for each gigabyte read | 30 days |
| S3 Glacier Instant Retrieval | Cheaper still | At once, with a higher charge | 90 days |
| S3 Glacier Flexible Retrieval | Very cheap | Minutes to hours, after you ask for a restore | 90 days |
| S3 Glacier Deep Archive | Cheapest | Hours, after you ask for a restore | 180 days |

Read the table from top to bottom and one rule appears: the cheaper it is to keep, the dearer or slower it is to fetch. The three Glacier classes are vocabulary for this module. You should be able to say what each is for, and you do not configure them. The last column matters more than it looks: move an object into a class and delete it a week later, and you still pay for the minimum. So the right class depends on how long you keep an object and how often you open it. Move the slider in [storage-class-tradeoff](artefacts/storage-class-tradeoff.html) and watch the order change.

**Versioning.** By default, uploading an object under a key that already exists replaces it, and deleting it removes it. With [versioning](../../glossary.md#versioning) switched on, the bucket keeps every version. An overwrite adds a new version on top of the old one. A delete adds a marker that hides the object, and the versions underneath are still there. Either can be undone by making an earlier version current again. Versioning is a setting of the whole bucket, and each kept version is stored and paid for.

> **Quick check.** A doctor uploads a corrected report, and by mistake the file replaces a different patient's report. Versioning is on. What can the IT team do?
>
> - [ ] Nothing: an overwrite replaces the object for good
> - [x] Make the earlier version of that report current again
> - [ ] Wait for the lifecycle rule to bring the old report back
>
> **Why:** With versioning on, an overwrite adds a version and the earlier one is still in the bucket. A lifecycle rule moves objects between classes and removes old versions; it never restores anything.

**Lifecycle rules.** A [lifecycle rule](../../glossary.md#lifecycle-rule) tells S3 what to do with objects as they age: move them to a cheaper class after so many days, and delete old versions after so many more. You write the rule once, and S3 carries it out in the background. Two things follow. Transitions act asynchronously, over hours to days, so a lifecycle rule is something you configure and verify. It is not something you watch happen. And the rule is where versioning and cost meet: without a rule that expires old versions, a versioned bucket grows for ever.

> **Quick check.** Thara's rule moves report PDFs to S3 Standard-Infrequent Access after 90 days. A patient opens a report that is a year old. What happens?
>
> - [x] It opens at once, and Thara pays a small charge for the retrieval
> - [ ] It must be restored first, and that takes some hours
> - [ ] It fails, because the object has left the reports bucket
>
> **Why:** Infrequent Access serves an object at once; what changes is the price of reading it. Waiting for a restore belongs to the two archive classes. And a class is a property of the object: it stays in the same bucket under the same key.

**Replication, at concept level.** Replication copies every new object to a second bucket, in the same region or in another. It needs versioning, and it is the answer to a question that versioning cannot answer: what if the bucket itself is lost? You do not build it. Thara's pilot is pinned to one region, so a second copy elsewhere is a choice for a later phase.

**Who can read it.** Three controls sit on a bucket, and you have met the first. Block Public Access, on since Day 2, overrides anything that would make the bucket public. A **[bucket policy](../../glossary.md#bucket-policy)** is the resource-based policy from Day 5's table: a JSON document on the bucket that names principals and says what each may do. An **access control list** (ACL) is an older mechanism that grants access object by object. Use bucket policies, not ACLs: a policy is one document that can be read and tested, while ACLs scatter the answer over every object. New buckets have ACLs disabled, as yours has had since you created it.

**EFS, and when a file system beats an object store.** The Elastic File System (EFS) is a shared file system that many instances mount at the same time, as they would a network share. It has folders, files can be changed in place, and two servers can work in the same directory. An object store has none of that: you put and get whole objects. So the choice is made by the application. Data that is written once and read whole, such as a report PDF, belongs in S3, which is cheaper and has no size to manage. Software that expects a folder it can edit in, shared between servers, needs a file system. EFS is a concept in this module; Thara's pilot has no use for one.

> **You already know this.** Tiered storage on a SAN with archive to tape. Fast disks for what is used every day, slower and cheaper disks for what is kept, and tape for what must not be thrown away. A lifecycle rule is the policy that moves data down the tiers by age, and the wait to get a tape back from the cupboard is the retrieval time of an archive class.

> **Thara.** Report PDFs to Infrequent Access after 90 days; versioning so a doctor's overwritten report is recoverable. A laboratory report is read in the days after it is issued and hardly ever again, yet it must open at once when a consultant asks for it. That is the description of Infrequent Access, and it rules out the classes that take hours.

> **Common mistake.** "Versioning is a backup." It protects against overwrite and delete, not against bucket loss or region loss. Every version lives in the same bucket, so whatever takes the bucket takes all of them. A backup is a copy kept somewhere else.

> **Quick check.** The Data Protection Officer asks whether switching on versioning means that the laboratory reports are now backed up. What is the honest answer?
>
> - [ ] Yes: every version is a second copy of the report
> - [ ] Yes, once the lifecycle rule has run for the first time
> - [x] No: every version is in the same bucket and goes with it
>
> **Why:** Versioning undoes an overwrite or a delete inside the bucket. It keeps no copy anywhere else, so it does nothing if the bucket is lost. The lifecycle rule moves and expires versions; it does not copy them.

## 2. Managed databases

Thara's patient records are relational data: patients, appointments and results, tied to one another. They need a relational database, and there are two ways to run one on AWS.

**RDS against a database you run yourself.** You could install MySQL on an EC2 instance, as you installed a web server on Day 2. Or you could use the Relational Database Service (RDS), which runs the same engine for you. The difference is the Shared Responsibility Model from Day 1, applied to one service.

| Job | MySQL on your own EC2 instance | RDS |
|---|---|---|
| Hardware, and the operating system and its patches | AWS, then you | AWS |
| Installing and patching the database engine | You | AWS, in a window you choose |
| Backups every day, and keeping them | You, with scripts you write | AWS, switched on by a setting |
| A standby in a second zone, and failing over to it | You, by hand | AWS, by a setting |
| Who may connect, and from where | You | You |
| Whether the data is encrypted, and with which key | You | You |
| The tables, the data and the database users | You | You |

RDS takes the work that is the same for every customer and leaves you the work that is about your data. The price is control: you cannot log in to the server, and you pay more for each hour than for the bare instance.

**Three groups, and one rule.** An RDS database is placed and shaped by three things with similar names.

- A **[DB subnet group](../../glossary.md#db-subnet-group)** lists the subnets the database may be placed in. It must cover at least two availability zones, even for a single database.
- A **security group** is the same firewall you have used since Day 2, here allowing the database's port from the web tier's group and from nothing else.
- A **parameter group** holds the engine's settings. Because you cannot log in and edit a configuration file, this is where such settings are changed.

The rule is that **the database is never public**. RDS offers a setting called public access. For patient records the answer is no, and the subnet group makes sure of it by listing only private subnets.

**Multi-AZ for availability, read replicas for scale.** [Multi-AZ](../../glossary.md#multi-az) and a [read replica](../../glossary.md#read-replica) both mean "a second copy of the database", and they answer different questions.

![Two panels. In the first, a primary database in one zone copies every write to a standby in a second zone, the application uses one endpoint, and the standby answers no queries. In the second, a primary copies its changes to a read replica that has an endpoint of its own and answers read queries.](img/standby-or-replica.svg "The same two boxes with different arrows. A standby waits and takes over. A replica works all the time and does not take over by itself.")

| | Multi-AZ | Read replica |
|---|---|---|
| What it is for | Availability: staying up when a zone or a server fails | Scale: more capacity for reading |
| How the copy is kept | Every write reaches the standby before it is confirmed | Changes follow a little behind |
| Who uses the copy | Nobody, until a failover | The application, for read queries |
| What the application connects to | One endpoint, which moves to the standby | A second endpoint, for reads only |
| When the primary fails | The standby takes over by itself, usually within a minute or two | Nothing happens until a person promotes the replica |

Fail the primary, and then add read load, in [multi-az-vs-replica](artefacts/multi-az-vs-replica.html), and predict each result before you press. Neither option is a backup. Both copies follow the primary faithfully, so a mistake written to the primary is written to the copy as well.

> **Quick check.** On OPD mornings the portal's report look-ups are slow. The Head of IT proposes switching on Multi-AZ for the records database. Will it help?
>
> - [ ] Yes: the standby takes a share of the read queries
> - [ ] Yes, but only for patients served from the second zone
> - [x] No: the standby answers no queries until a failover
>
> **Why:** A Multi-AZ standby exists for availability and serves nothing while the primary is healthy. Slow reads are a question of capacity, and the option built for that is a read replica.

**Automated backups and manual snapshots.** RDS backs a database up in two ways. An **[automated backup](../../glossary.md#automated-backup)** is taken every day without being asked, and RDS also keeps the changes made in between, so the database can be restored to any minute inside the retention period that you set. A **manual snapshot** is taken when you ask, and it is kept until you delete it. The difference shows when the database is deleted: the automated backups go with it unless you choose to retain them, and a manual snapshot stays. Either way, a restore never repairs the old database. It creates a new one from the copy.

**DynamoDB, placed on the map.** Not every database is relational. DynamoDB is a managed key-value database: you look an item up by its key, there is no instance to size and no engine to patch, and it copes with very large numbers of small requests. It suits data such as the portal's session records, many small items each found by one key. It does not suit patient records, which must be queried by their relations. You should know where it sits; you do not build one.

> **You already know this.** A managed PBX versus running your own. With your own exchange you buy the hardware, apply the firmware, and are called out when it fails. With a managed one the provider does all of that, and you still decide who has an extension and who may dial abroad. RDS is the managed exchange: the engine is somebody else's job, and who may connect is still yours.

> **Thara.** Patient records need private placement, encryption with alias/thara-records, and a tested restore. Private placement is the subnet group and the security group. Encryption is the key you created on Day 5, chosen when the database is created, because it cannot be added to an existing one afterwards. The tested restore is this afternoon.

> **Common mistake.** "Multi-AZ improves read performance." It does not; replicas do. A standby is a spare that waits. If the problem is that the database is too busy with reads, a second copy that answers nothing does not make it less busy.

## 3. Recovery as a number

"We have backups" is a statement about the past. Recovery is a statement about the future, and it is made in two numbers.

**RPO and RTO.** The **[RPO](../../glossary.md#rpo)**, the recovery point objective, is the most data that the organisation accepts losing, measured as time. If the last good copy is from 10:00 and the failure comes at 10:40, forty minutes of work are gone. The **[RTO](../../glossary.md#rto)**, the recovery time objective, is the longest the service may stay down: from the failure to the moment it is working again.

![One time line with four marks: the last backup, the failure, the start of the restore, and the return of service. The span from the last backup to the failure is the data lost, set against the RPO. The span from the failure to the return of service is the downtime, set against the RTO.](img/recovery-on-one-line.svg "Two spans that share one moment, the failure. Looking back from it is data loss. Looking forward from it is downtime.")

The two are set by different things. Data loss is decided before the failure, by how often you back up: a backup every hour cannot lose more than an hour. Downtime is decided after it, by how long it takes to notice, to decide, to restore and to check. So each is measured in its own way. You argue an RPO from the backup schedule. You find your recovery time by doing a restore with a clock running. Drag both in [rpo-rto-timeline](artefacts/rpo-rto-timeline.html) and see that moving one leaves the other where it was.

> **Quick check.** The records database is backed up every hour, on the hour. It fails at 10:40, and the portal is working again at 12:10. How much data was lost, and for how long was the service down?
>
> - [ ] 90 minutes of data lost, and 40 minutes down
> - [ ] 90 minutes of data lost, and 90 minutes down
> - [x] 40 minutes of data lost, and 90 minutes down
>
> **Why:** Data loss runs back from the failure to the last backup, at 10:00. Downtime runs forward from the failure to the return of service. The two spans share only the moment of failure, and both are inside Thara's targets of one hour and two hours.

**Backup and restore, the first recovery pattern.** The simplest way to recover from a disaster is to keep backups and, when something is lost, restore from them into new resources. It is the cheapest pattern, because nothing runs until it is needed, and the slowest, because everything has to be created first. Day 7 names the faster and dearer patterns. For a pilot with a two-hour target, backup and restore is the one to prove first.

**AWS Backup, one plane across services.** Each service can back itself up: EBS has snapshots, RDS has automated backups. AWS Backup is a single place to manage them all, with four ideas.

- A **[backup plan](../../glossary.md#backup-plan)** is a schedule: what is backed up, how often, and how long each backup is kept.
- A **[backup vault](../../glossary.md#backup-vault)** is the container the backups are stored in, with access controls of its own.
- **Retention** is how long a backup is kept before it is removed for you.
- An **on-demand backup** is one taken now, outside the schedule, into the same vault under the same rules.

Resources are assigned to a plan by type or by tag, which is one more use for the tags you have put on everything since Day 2.

**A restore that has never been tested is not a backup.** A backup is a file. Whether it can become a working system again is unknown until someone tries: the copy may be incomplete, the key that encrypts it may be gone, the restore may land in the wrong network, or it may simply take six hours when the target is two. The only evidence that a backup works is a restore that was done, timed and checked. That is what the capstone asks of your group, and it is what you do this afternoon.

**Classifying data.** Not everything deserves a backup, and saying so is part of the design. Sort each kind of data into one of three classes.

- **Ephemeral.** Losing it costs nothing that matters. It needs no protection.
- **Recoverable.** It can be rebuilt from something else that you do keep. Protect the source, not the thing.
- **Critical.** It exists nowhere else. It needs a copy, a recovery target and a tested restore.

> **You already know this.** The tape in the third-floor cupboard, and the day nobody could read it. Every network team has a backup that was taken faithfully for years and failed on the one day it was needed, because restoring was never part of the routine. A schedule tells you that backups are being made. Only a restore tells you that they work.

> **Thara.** RPO one hour, RTO two hours for records; today's lab measures the RTO. Consultants worked from paper for three days, and the hospital will not accept that again. The one hour is argued from how often the records are backed up. The two hours is tested: this afternoon you delete the database and time its return.

> **Common mistake.** "RPO and RTO are the same number." One is data loss, the other is downtime. A system can come back in ten minutes with a day of work missing, or lose nothing at all and still be down until tomorrow.

## Classify Thara's data

This morning's activity is done in pairs, and it produces a table that you bring to the lab.

Thara's pilot holds six kinds of data. For each, decide its class, and then state the storage service that holds it, the protection it needs, and its recovery target: how much may be lost, and how soon it must be back. "None" is an allowed answer, and for some rows it is the right one.

| Data | Class | Storage service | Protection | Recovery target |
|---|---|---|---|---|
| Web server operating system and application | | | | |
| Laboratory report PDFs | | | | |
| Patient records database | | | | |
| Audit logs | | | | |
| Flow logs | | | | |
| Portal session data | | | | |

Then compare your table with the reference table, and be ready to argue for the two rows on which most pairs disagree. Be exact about protection: "back it up" is not an answer until it says how often, where to, and who has restored from it.

## Before the lab

- Find `thara-key.pem`. Bring your pair's classification table.
- Open [thara-vpc-builder](artefacts/thara-vpc-builder.html) and find components 3 and 11. Notice where the database sits and what can reach it.
- Open your cost ledger. The estimate for the day is USD 1.20. Today one resource bills by the hour: the database. It exists twice and is deleted twice.
- Have a clock that you can read to the minute. Today every important step ends with "write the time".
- Be ready to say, before you delete anything, what will still exist afterwards.

## Reading

- Wittig, A. and Wittig, M. *Amazon Web Services in Action*, 3rd ed., Manning. The chapter on RDS.
- AWS, *Amazon S3 User Guide*, "Understanding and managing Amazon S3 storage classes" and "Managing the lifecycle of objects".
- AWS, *Amazon RDS User Guide*, "Backups and restores" overview.
- For Day 7: AWS, *AWS Well-Architected Framework*, the summary of the Reliability pillar; Wittig and Wittig, the chapters on Auto Scaling and load balancing.

Self-check: CLF-C02 bank, Domain 4 set B (10 items) and Domain 1 set B (10 items), issued separately. Practice question: [PQ6](../../practice/PQ6.md).

Task for Day 7: complete Evidence Pack 6. With your group, complete the capstone data tier in the host account.
