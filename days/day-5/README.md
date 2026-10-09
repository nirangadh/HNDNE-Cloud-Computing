# Day 5

## Materials

- [Morning slides: Identity, encryption, detection](slides/day-5-morning.pdf) (PDF)
- [Afternoon slides: Least privilege, keys, trails, group access](slides/day-5-afternoon.pdf) (PDF)
- [Notes](notes.md): read before the lab
- [Lab sheet](lab.md): steps, prove it, break it, teardown and cost line
- Interactive visuals. They run in the browser: open them from the [course website](https://nirangadh.github.io/HNDNE-Cloud-Computing/days/day-5/), because GitHub shows them as code.
  - [Policy evaluator: explicit deny, then allow, then implicit deny](artefacts/policy-evaluator.html)
  - [Envelope encryption: the KMS key, the data key and the sealed data key](artefacts/envelope-encryption.html)
  - [Detection map: what CloudTrail, GuardDuty, Access Analyzer, WAF and Shield each see](artefacts/detection-map.html)
  - [Role versus key: what an attacker holds on the Day 2 path and on the Day 5 path](artefacts/role-vs-key.html)

## Morning: Identity, encryption, detection

**Ideas covered:** Identity is the perimeter; Encrypting what the hospital holds; Knowing when something happened.

**Demonstration:** Simulate, flag, trace.

**Activity:** Threat walk of the Day 3 and 4 environment.

## Afternoon: Least privilege, keys, trails, group access

**You build:** component 10, Identity, keys and audit; component 3, Laboratory reports bucket.

**Estimated credit use:** about USD 0.80 if you follow the teardown list.

## After this day

**Read:**

- Shields, chapters 7 and 8 (protecting data; logging and audit trails)
- Amazon RDS User Guide, "Backups and restores" overview
- AWS Backup Developer Guide, "Getting started"

**Self-check (issued separately):** Domain 2 set B (15 items); Domain 3 database set (10 items).

**Practice question:** [PQ5](../../practice/PQ5.md), posted in [practice](../../practice/).

**Tasks:**

- Groups begin the capstone network build in the host account

**Evidence pack 5** is due before the next teaching day, on the date announced for your cohort. See the [portfolio brief](../../coursework/portfolio-brief.md).
