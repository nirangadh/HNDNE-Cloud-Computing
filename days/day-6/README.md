# Day 6

## Materials

- [Morning slides: Storage strategy, databases, recovery](slides/day-6-morning.pdf) (PDF)
- [Afternoon slides: Reports, records and a proven restore](slides/day-6-afternoon.pdf) (PDF)
- [Notes](notes.md): read before the lab
- [Lab sheet](lab.md): steps, prove it, break it, teardown and cost line
- Interactive visuals. They run in the browser: open them from the [course website](https://nirangadh.github.io/HNDNE-Cloud-Computing/days/day-6/), because GitHub shows them as code.
  - [Storage class trade-off: what it costs to keep a report, and how long it takes to get it back](artefacts/storage-class-tradeoff.html)
  - [RPO and RTO timeline: the last backup, the failure, the restore and the return of service](artefacts/rpo-rto-timeline.html)
  - [Multi-AZ or read replica: one for availability, one for scale](artefacts/multi-az-vs-replica.html)
  - [Thara VPC builder: what Day 6 adds to the architecture](artefacts/thara-vpc-builder.html)

## Morning: Storage strategy, databases, recovery

**Ideas covered:** S3 as a strategy, not a bucket; Managed databases; Recovery as a number.

**Demonstration:** Failover, lifecycle, plan.

**Activity:** Classify Thara's data.

## Afternoon: Reports, records and a proven restore

**You build:** component 3, Laboratory reports bucket; component 11, Patient records database and Backup plan.

**Estimated credit use:** about USD 1.20 if you follow the teardown list.

## After this day

**Read:**

- Wittig and Wittig, the RDS chapter
- Well-Architected Framework, Reliability pillar summary
- Wittig and Wittig, the Auto Scaling and load balancing chapters

**Self-check (issued separately):** Domain 4 set B (10 items); Domain 1 set B (10 items).

**Practice question:** [PQ6](../../practice/PQ6.md), posted in [practice](../../practice/).

**Tasks:**

- Groups complete the capstone data tier in the host account

**Evidence pack 6** is due before the next teaching day, on the date announced for your cohort. See the [portfolio brief](../../coursework/portfolio-brief.md).
