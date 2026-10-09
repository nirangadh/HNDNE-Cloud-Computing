# PQ6: The monsoon returns, and the records are wrong

Posted after Day 6. Attempt it without notes in about 35 minutes, then compare your answer with the guidance below. Bring your attempt to the review session.

## Scenario

The pilot runs as you have built it up to Day 6, with one difference: the patient records database `thara-records` is left running, as it would be in service. It is a single database in the private subnets, encrypted with `alias/thara-records`. It holds about 6 GB of data.

This is how it is protected today.

- A Backup plan takes one backup of the database **each night at 02:00** and keeps it for 7 days.
- The database's own automated backups were switched off some weeks ago, "to save money".
- The reports bucket has versioning on and the lifecycle rule from Day 6.
- The team has restored the database once, as a drill. From choosing **Restore** to seeing the rows took **25 minutes**.

The monsoon returns, and Colombo loses mains power from 09:00 for six hours. The old hospital system in the basement goes down with it. When the power comes back, the old system restarts, and at **15:20** one of its jobs writes yesterday's values over today's appointments and results in `thara-records`. A consultant in Kandy notices at **15:50**. The IT team restores from the 02:00 backup, points the portal at the restored database, and checks it. Patients and consultants see correct data again at **16:40**, as it stood at 02:00.

Constraints you should notice:

- Patient records have an **RPO of one hour** and an **RTO of two hours**.
- The fault was **wrong data written**, not a server that failed.
- The pilot must be recoverable **by the IT team**, without outside help.
- The CFO's ceiling is USD 150 a month, and she wants each new line priced.

Use these rounded prices. Do not rely on remembered ones.

| Item | Price |
|---|---|
| The database as it runs today, with its storage | About USD 15 a month |
| The same database with a Multi-AZ standby | About USD 30 a month |
| Automated backups, up to the size of the database | No charge |
| A manual snapshot or a backup kept by a plan | About USD 0.10 for each GB each month |
| A Backup plan, by itself | No charge |
| A kept version of an object in the reports bucket | The same as any object of its size |

## Questions

**(a) Explain (6 marks).** Define RPO and RTO, and say what decides each and how each is established. Explain what versioning on the reports bucket protects against and what it does not. Then explain the difference between a Multi-AZ standby and a read replica.

**(b) Apply (8 marks).**

- For the six hours without power, say what kept working and what did not, and why.
- From the times in the scenario, state the data lost and the time the service was wrong or down. Compare each with its target.
- Design the backup and recovery arrangement that would have met both targets for the patient records: what is backed up, how often, where it is kept, for how long, and what the restore creates and must be told. Add one line each for the laboratory reports and for the web server.
- Give the monthly cost of what your design adds, from the table.

**(c) Evaluate (6 marks).** Two proposals are made at the review.

1. The CFO: "Pay for the Multi-AZ standby and stop the backups. A second copy in another building is what we were missing."
2. A colleague: "Keep the nightly backup as it is. Thirteen hours was bad luck: most failures will not come in the afternoon."

Evaluate each proposal against the scenario: say what is right in it, what is wrong, and how it would fail. Finish with a judgement for the Head of IT: what must be done today, what cannot be got back, what your design costs each month, and what would change your view.

## Answer guidance

This guidance describes what a strong answer covers. It is not a model answer to memorise; the marks go to reasoning applied to Thara.

**(a)** A strong answer says that the RPO is the most data the organisation accepts losing, measured as time, and the RTO is the longest the service may stay down. They share one moment, the failure: data loss runs back from it to the last good copy, and downtime runs forward from it to the return of service. They are decided by different things. Data loss is decided before the failure, by how often a copy is taken, so an RPO is argued from the backup schedule. Downtime is decided after it, by how long it takes to notice, decide, restore and check, so a recovery time is established only by doing a restore with a clock running. Versioning keeps every version of an object, so an overwrite or a delete in the bucket can be undone by making an earlier version current. It keeps no copy anywhere else, so it does not protect against the loss of the bucket, and it is not a backup. A Multi-AZ standby is a second copy in another availability zone that receives every write before it is confirmed and takes over by itself if the primary fails; it answers no queries while it waits, and it is for availability. A read replica follows the primary a little behind, answers read queries at its own endpoint, and does not take over by itself; it is for scale. Neither is a backup, because both copy whatever is written to the primary.

**(b)** A strong answer starts with what the power cut did and did not touch. The pilot is in Mumbai, so the portal, the web tier, the reports bucket and `thara-records` all kept working, and patients and the branches, who reach the portal over the internet, noticed nothing. What stopped was in Colombo: the old system in the basement, and the IT team's own work, because the bastion admits only the IT office's address and the office had no power. The cloud did not fail; the building did. On the numbers: the last good copy was the 02:00 backup and the wrong data arrived at 15:20, so the restore lost 13 hours 20 minutes of work, against a target of one hour. The service was wrong from 15:20 and right again at 16:40, which is 80 minutes, inside the two hours. One target was met and the other was missed by a wide margin, and they were decided by different things: the drill is why the 80 minutes was possible, and the schedule is why the 13 hours was certain. For the design: back up the records at least every hour, either by changing the plan's frequency from daily to hourly or by switching the database's automated backups back on, which keep the changes between backups and allow a restore to a chosen minute; here that minute would be 15:19. Keep the backups for at least 7 days, in a vault or with the service, apart from the database itself, and keep one manual snapshot that does not go when a database is deleted. Say what a restore does: it creates a new database with a new endpoint, and it must be told again to use `thara-db-subnets`, `thara-db-sg` and no public access, or it lands where the web tier cannot reach it. Then the portal is pointed at the new endpoint and the data is checked before the service is declared back. The reports are already covered for this fault: versioning undoes an overwrite. The web server needs no backup at all: it is rebuilt from the image `thara-portal-v1`. On cost: automated backups up to the size of the database are free, and hourly backups of about 6 GB kept for a week come to about 10 GB stored, about USD 1 a month. The design adds about a dollar to a bill of USD 15.

**(c)** A strong answer takes the proposals separately. The first is right that a standby in a second zone is real protection, and wrong about what against. A standby receives every write, so at 15:20 it would have received the wrong values a moment after the primary did. It protects against the loss of a server or a zone, and this fault was neither; nor was it the Colombo power cut, which the pilot never felt. It doubles the database's cost, from about USD 15 to about USD 30, and with the backups stopped it would leave Thara with two faithful copies of the mistake and nothing to go back to. It would fail on the first bad write. The second is right that the restore worked and that the team's drill paid off. It is wrong to call thirteen hours luck: with one backup a day the loss is anything up to 24 hours, and nothing in the schedule knows what time a failure will choose. An RPO is a promise about the worst case, and this schedule never offered one hour. It would fail on any day a fault comes late. For the Head of IT, today: switch automated backups on, or make the plan hourly; take a manual snapshot now; find and stop the job in the old system before it runs again; and tell the consultants plainly which hours of work have to be entered again. What cannot be got back from the pilot is everything written between 02:00 and 15:20, unless it can be found in paper notes or in the old system. The design costs about USD 1 a month more. What would change the view: a requirement to survive the loss of a zone without any downtime, which is what would justify the standby as an addition to the backups and not a replacement for them; a database that grows far beyond 6 GB, which would make the backup line worth pricing again; or a drill that takes two hours and not 25 minutes, which would put the RTO itself in doubt.
