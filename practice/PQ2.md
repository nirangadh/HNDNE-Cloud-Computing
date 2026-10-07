# PQ2: Where the reports and the records should live, and what it costs

Posted after Day 2. Attempt it without notes in about 35 minutes, then compare your answer with the guidance below. Bring your attempt to the review session.

## Scenario

Dengue season has arrived. For three weeks, Thara Hospitals' laboratories produce three times their usual number of reports, and the patient portal is busier than it has ever been.

Thara's six-month pilot runs in AWS in Asia Pacific (Mumbai), ap-south-1. Three kinds of data need a home:

- **Laboratory report PDFs.** 60 GB are stored today. In a normal month 8 GB are added. Each report is written once, read a few times in its first weeks, and then kept for years. No report may ever be publicly listable.
- **The patient records database's data files.** 40 GB, read and written constantly by one database server.
- **The portal web server's own disk.** 8 GB: an operating system and the portal software. It holds no patient data.

Constraints you should notice:

- The CFO has approved **USD 150 a month** for the whole pilot and wants every cost line explained.
- The pilot lasts **six months**. Nobody yet knows whether it will continue.
- After the flood, the Head of IT insists that the web server can be **rebuilt without the original machine**.

Use these rounded prices. Do not rely on remembered ones.

| Item | Price |
|---|---|
| EBS gp3 volume | USD 0.09 per GB per month |
| EBS snapshot | USD 0.05 per GB stored per month |
| S3 Standard | USD 0.025 per GB per month |
| S3 Standard-Infrequent Access | USD 0.0125 per GB per month, plus USD 0.01 per GB read |
| An S3 Glacier archive class | USD 0.004 per GB per month; reading back takes hours and has a fee |
| `t3.micro`, on-demand | USD 0.011 per hour (a month is 730 hours) |
| `t3.micro`, one-year commitment | about one third less per hour, paid for every hour of the year |

## Questions

**(a) Explain (6 marks).** Explain the difference between block storage (an EBS volume) and object storage (an S3 bucket): how each is reached, where each lives, and what you can do to the data in each. Then explain what an EBS snapshot is and why a second snapshot of the same volume usually costs much less than the first.

**(b) Apply (8 marks).** Choose where each of the three kinds of data should be stored. For each one:

- name the storage and, where it applies, the volume type or storage class;
- state how it is protected against loss, and for the reports, against exposure; and
- work out its storage cost for one **normal** month from the prices given.

Then state how much the three weeks of dengue season add to the reports' storage bill, and say whether storage is a threat to the CFO's ceiling.

**(c) Evaluate (6 marks).** The CFO makes two proposals to save money: buy a **one-year commitment** for the web server, and move **every report into the archive class on the day it is written**. Evaluate each proposal against the scenario. State what each would save, what it would cost Thara in other ways, and what would change your view.

## Answer guidance

This guidance describes what a strong answer covers. It is not a model answer to memorise; the marks go to reasoning applied to Thara.

**(a)** A strong answer contrasts the two on the same three points. A volume is a virtual disk: it is attached to one instance, formatted with a file system and mounted, lives in one availability zone, and can be changed in place, a block at a time. A bucket holds whole objects under keys, is reached over HTTPS by anything with permission, belongs to a region rather than a zone, and offers put, get and delete rather than editing in place; it has no real directories. A snapshot is a point-in-time copy of a volume's blocks, kept in region-wide storage. The first copies every block in use; later ones are incremental and store only the blocks changed since, which is why they cost less, while any one snapshot can still restore the whole volume.

**(b)** A strong answer matches each kind of data to how it is used. The reports are written once and read by key, so they belong in S3 with Block Public Access left on: 60 GB in Standard is about USD 1.50 a month, and a normal month adds 8 GB, about USD 0.20. A database rewrites small parts of large files constantly, so its files need a gp3 volume: 40 GB is USD 3.60 a month, protected by snapshots, at most USD 2.00 for the first and far less for each later one. The web server's 8 GB disk is USD 0.72 a month and is protected not by a backup but by an image: an AMI is a snapshot plus launch metadata, and it rebuilds the server without the original machine, which is exactly the Head of IT's requirement. Dengue season triples three weeks of uploads: roughly 12 GB more than usual, about USD 0.30 a month. The total is a few dollars against a ceiling of USD 150. Storage is not the threat; a strong answer says so plainly and points at compute and anything billed by the hour instead.

**(c)** A strong answer takes the proposals separately and uses the numbers. On-demand, the web server costs about USD 8 a month; a commitment saves under USD 3 a month. But the commitment is a promise to pay for twelve months and the pilot is approved for six: if the pilot ends, Thara pays about USD 32 for six months of a server it no longer runs, which is more than the commitment saved. The saving is real only if the pilot is certain to continue, and it locks in a size chosen before anyone has seen dengue-season load. The archive proposal would cut the reports' storage from about USD 1.50 to about USD 0.24 a month: a saving of just over a dollar. In return, a report could take hours to open during exactly the weeks when patients and consultants read it most. The better form of the idea is to keep new reports in Standard and move them to a cheaper class once they are old. What would change the view: a confirmed extension of the pilot beyond a year; evidence that reports are almost never read after the first day; or a report archive hundreds of times larger, where the storage price starts to matter.
